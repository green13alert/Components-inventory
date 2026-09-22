import { getCatalogueComponent } from '@/constants/component-catalogue';
import type { ComponentCategory, InventoryComponent } from '@/constants/inventory';
import { supabase } from '@/lib/supabase';

export const INVENTORY_ERRORS = {
  unauthenticated: 'Sign in to view your inventory.',
  generic: 'Could not load your inventory. Please try again.',
  save: 'Could not save this component. Please try again.',
  delete: 'Could not remove this component. Please try again.',
  missingComponent: 'This component is not in the catalogue yet. Please try again later.',
  customUnavailable: 'Custom components are not available yet. Choose a catalogue component.',
  invalidQuantity: 'Quantity must be at least 1.',
} as const;

export type InventoryQueryResult<T> = {
  data: T | null;
  error: string | null;
};

type InventoryMutationResult = {
  error: string | null;
};

const INVENTORY_CATEGORIES: Exclude<ComponentCategory, 'all'>[] = [
  'microcontrollers',
  'sensors',
  'actuators',
  'displays',
  'power',
  'modules',
];

const INVENTORY_SELECT =
  'id, quantity, created_at, components!inner ( slug, name, category, description )';

type CatalogueRow = {
  slug: string;
  name: string;
  category: string;
  description: string | null;
};

type InventoryRow = {
  id: string;
  quantity: number;
  created_at: string;
  components: CatalogueRow | CatalogueRow[] | null;
};

function mapPersistError(message: string | undefined, fallback: string): string {
  if (!message) {
    return fallback;
  }

  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return fallback;
  }

  return fallback;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

function isInventoryCategory(value: string): value is Exclude<ComponentCategory, 'all'> {
  return INVENTORY_CATEGORIES.includes(value as Exclude<ComponentCategory, 'all'>);
}

function unwrapComponent(value: InventoryRow['components']): CatalogueRow | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function mapInventoryRow(row: InventoryRow): InventoryComponent | null {
  const component = unwrapComponent(row.components);
  if (!component || !isInventoryCategory(component.category)) {
    return null;
  }

  const local = getCatalogueComponent(component.slug);

  return {
    id: row.id,
    name: component.name,
    category: component.category,
    quantity: row.quantity,
    catalogueId: component.slug,
    type: local?.type,
    createdAt: row.created_at,
  };
}

function mapInventoryRows(rows: InventoryRow[] | null): InventoryComponent[] {
  return (rows ?? []).map(mapInventoryRow).filter((item): item is InventoryComponent => item != null);
}

async function getCatalogueIdBySlug(slug: string): Promise<InventoryQueryResult<string>> {
  const { data, error } = await supabase.from('components').select('id').eq('slug', slug).maybeSingle();

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }
  if (!data?.id) {
    return { data: null, error: INVENTORY_ERRORS.missingComponent };
  }

  return { data: data.id as string, error: null };
}

async function fetchInventoryItemById(
  userId: string,
  itemId: string,
): Promise<InventoryQueryResult<InventoryComponent>> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(INVENTORY_SELECT)
    .eq('id', itemId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }

  const mapped = data ? mapInventoryRow(data as InventoryRow) : null;
  if (!mapped) {
    return { data: null, error: INVENTORY_ERRORS.save };
  }

  return { data: mapped, error: null };
}

async function fetchInventoryItemByComponent(
  userId: string,
  componentId: string,
): Promise<InventoryQueryResult<InventoryComponent | null>> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(INVENTORY_SELECT)
    .eq('user_id', userId)
    .eq('component_id', componentId)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }
  if (!data) {
    return { data: null, error: null };
  }

  const mapped = mapInventoryRow(data as InventoryRow);
  if (!mapped) {
    return { data: null, error: INVENTORY_ERRORS.save };
  }

  return { data: mapped, error: null };
}

export async function fetchInventory(): Promise<InventoryQueryResult<InventoryComponent[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: INVENTORY_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select(INVENTORY_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.generic) };
  }

  return { data: mapInventoryRows(data as InventoryRow[] | null), error: null };
}

export async function addInventoryCatalogueItem(
  slug: string,
  quantity: number,
): Promise<InventoryQueryResult<InventoryComponent>> {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { data: null, error: INVENTORY_ERRORS.invalidQuantity };
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: INVENTORY_ERRORS.unauthenticated };
  }

  const catalogue = await getCatalogueIdBySlug(slug);
  if (catalogue.error || !catalogue.data) {
    return { data: null, error: catalogue.error ?? INVENTORY_ERRORS.missingComponent };
  }

  const existing = await fetchInventoryItemByComponent(userId, catalogue.data);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  if (existing.data) {
    return setInventoryItemQuantity(existing.data.id, existing.data.quantity + quantity);
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      user_id: userId,
      component_id: catalogue.data,
      quantity,
    })
    .select(INVENTORY_SELECT)
    .single();

  if (error?.code === '23505') {
    const raced = await fetchInventoryItemByComponent(userId, catalogue.data);
    if (raced.error || !raced.data) {
      return { data: null, error: raced.error ?? INVENTORY_ERRORS.save };
    }
    return setInventoryItemQuantity(raced.data.id, raced.data.quantity + quantity);
  }

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }

  const mapped = data ? mapInventoryRow(data as InventoryRow) : null;
  if (!mapped) {
    return { data: null, error: INVENTORY_ERRORS.save };
  }

  return { data: mapped, error: null };
}

export async function setInventoryItemQuantity(
  itemId: string,
  quantity: number,
): Promise<InventoryQueryResult<InventoryComponent>> {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { data: null, error: INVENTORY_ERRORS.invalidQuantity };
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: INVENTORY_ERRORS.unauthenticated };
  }

  const { error } = await supabase
    .from('inventory_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }

  return fetchInventoryItemById(userId, itemId);
}

export async function updateInventoryCatalogueItem(
  itemId: string,
  slug: string,
  quantity: number,
): Promise<InventoryQueryResult<InventoryComponent>> {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { data: null, error: INVENTORY_ERRORS.invalidQuantity };
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: INVENTORY_ERRORS.unauthenticated };
  }

  const current = await fetchInventoryItemById(userId, itemId);
  if (current.error || !current.data) {
    return { data: null, error: current.error ?? INVENTORY_ERRORS.save };
  }

  if (current.data.catalogueId === slug) {
    return setInventoryItemQuantity(itemId, quantity);
  }

  const catalogue = await getCatalogueIdBySlug(slug);
  if (catalogue.error || !catalogue.data) {
    return { data: null, error: catalogue.error ?? INVENTORY_ERRORS.missingComponent };
  }

  const existing = await fetchInventoryItemByComponent(userId, catalogue.data);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  if (existing.data && existing.data.id !== itemId) {
    const merged = await setInventoryItemQuantity(existing.data.id, existing.data.quantity + quantity);
    if (merged.error || !merged.data) {
      return merged;
    }

    const removed = await deleteInventoryItem(itemId);
    if (removed.error) {
      return { data: null, error: removed.error };
    }

    return merged;
  }

  const { error } = await supabase
    .from('inventory_items')
    .update({
      component_id: catalogue.data,
      quantity,
    })
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return { data: null, error: mapPersistError(error.message, INVENTORY_ERRORS.save) };
  }

  return fetchInventoryItemById(userId, itemId);
}

export async function deleteInventoryItem(itemId: string): Promise<InventoryMutationResult> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { error: INVENTORY_ERRORS.unauthenticated };
  }

  const { error } = await supabase.from('inventory_items').delete().eq('id', itemId).eq('user_id', userId);

  if (error) {
    return { error: mapPersistError(error.message, INVENTORY_ERRORS.delete) };
  }

  return { error: null };
}
