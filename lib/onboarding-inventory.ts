import { getOnboardingChoice } from '../constants/onboarding-offers.ts';

export const ONBOARDING_SAVE_ERRORS = {
  unauthenticated: 'Sign in to save your workshop.',
  generic: 'Could not save your workshop. Please try again.',
  missingComponents: 'Some selected components are not in the catalogue yet. Please try again later.',
  invalidQuantity: 'Enter a whole quantity of at least 1.',
} as const;

/**
 * Onboarding inventory writes.
 *
 * A selection is a catalogue slug plus a quantity. The slug is resolved to
 * `public.components.id` by an exact slug match. A generic slug is never
 * rewritten as a specific variant.
 *
 * Existing `inventory_items` rows are left unchanged. A missing row is inserted
 * once at the selected quantity. Repeating the save does not add that quantity
 * again, and it does not lower a quantity the user already stored.
 */

export const ONBOARDING_QUANTITY_LIMIT = 99;

export type OnboardingComponentSelection = {
  slug: string;
  quantity: number;
};

export type CatalogueIdentity = {
  id: string;
  slug: string;
};

export type OwnedInventoryRow = {
  componentId: string;
  quantity: number;
};

export type OnboardingInventoryInsert = {
  componentId: string;
  quantity: number;
};

export type OnboardingInventoryPlan = {
  inserts: OnboardingInventoryInsert[];
  unchanged: OwnedInventoryRow[];
};

type SelectionResult =
  | { ok: true; items: OnboardingComponentSelection[] }
  | { ok: false; error: 'invalid-quantity' | 'unknown-component' };

type PlanResult = { ok: true; plan: OnboardingInventoryPlan } | { ok: false; error: 'missing-catalogue' | 'ambiguous-catalogue' };

export type OnboardingInventoryGateway = {
  findCatalogueBySlug: (
    slugs: readonly string[],
  ) => Promise<{ rows: CatalogueIdentity[] | null; error: string | null }>;
  findOwned: (
    userId: string,
    componentIds: readonly string[],
  ) => Promise<{ rows: OwnedInventoryRow[] | null; error: string | null }>;
  insertMissing: (
    userId: string,
    rows: readonly OnboardingInventoryInsert[],
  ) => Promise<{ error: string | null; conflict: boolean }>;
};

export function parseOnboardingQuantity(quantity: number): number | null {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return null;
  }
  if (quantity < 1 || quantity > ONBOARDING_QUANTITY_LIMIT) {
    return null;
  }
  return quantity;
}

export type OnboardingSheetQuantity = {
  slug: string;
  /** Zero means the variant is unselected in the sheet. Saved rows stay in the 1–99 range. */
  quantity: number;
};

function sheetQuantity(quantity: number): number | null {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return null;
  }
  if (quantity < 0 || quantity > ONBOARDING_QUANTITY_LIMIT) {
    return null;
  }
  return quantity;
}

/** Open a category with the quantities already on the bench. Missing variants start at zero. */
export function sheetQuantitiesFromBench(
  slugs: readonly string[],
  bench: readonly OnboardingComponentSelection[],
): OnboardingSheetQuantity[] {
  const seen = new Set<string>();
  const draft: OnboardingSheetQuantity[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    const owned = bench.find((item) => item.slug === slug);
    draft.push({ slug, quantity: owned?.quantity ?? 0 });
  }
  return draft;
}

/** Change one variant. Other draft rows stay as they are. */
export function adjustSheetQuantity(
  draft: readonly OnboardingSheetQuantity[],
  slug: string,
  quantity: number,
): OnboardingSheetQuantity[] | null {
  const nextQuantity = sheetQuantity(quantity);
  if (nextQuantity == null || !draft.some((item) => item.slug === slug)) {
    return null;
  }
  return draft.map((item) => (item.slug === slug ? { slug, quantity: nextQuantity } : item));
}

/**
 * Write the confirmed sheet onto the bench.
 * A positive quantity replaces that slug. Zero removes only that slug.
 * Variants outside the sheet are left in place. The same slug is never stored twice.
 */
export function applySheetQuantities(
  bench: readonly OnboardingComponentSelection[],
  draft: readonly OnboardingSheetQuantity[],
): OnboardingComponentSelection[] | null {
  const updates = new Map<string, number>();
  for (const item of draft) {
    const quantity = sheetQuantity(item.quantity);
    const choice = getOnboardingChoice(item.slug);
    if (quantity == null || !choice || choice.slug !== item.slug || updates.has(item.slug)) {
      return null;
    }
    updates.set(item.slug, quantity);
  }

  const next: OnboardingComponentSelection[] = [];
  const kept = new Set<string>();
  for (const item of bench) {
    if (kept.has(item.slug)) {
      continue;
    }
    const quantity = updates.get(item.slug);
    if (quantity === 0) {
      kept.add(item.slug);
      continue;
    }
    if (quantity != null) {
      next.push({ slug: item.slug, quantity });
      kept.add(item.slug);
      continue;
    }
    next.push(item);
    kept.add(item.slug);
  }
  for (const [slug, quantity] of updates) {
    if (quantity > 0 && !kept.has(slug)) {
      next.push({ slug, quantity });
      kept.add(slug);
    }
  }
  return next;
}

export function normalizeOnboardingComponents(items: readonly OnboardingComponentSelection[]): SelectionResult {
  const bySlug = new Map<string, number>();

  for (const item of items) {
    const quantity = parseOnboardingQuantity(item.quantity);
    if (quantity == null) {
      return { ok: false, error: 'invalid-quantity' };
    }
    const choice = getOnboardingChoice(item.slug);
    if (!choice || choice.slug !== item.slug) {
      return { ok: false, error: 'unknown-component' };
    }
    const previous = bySlug.get(choice.slug);
    if (previous != null && previous !== quantity) {
      return { ok: false, error: 'invalid-quantity' };
    }
    bySlug.set(choice.slug, quantity);
  }

  return {
    ok: true,
    items: [...bySlug.entries()].map(([slug, quantity]) => ({ slug, quantity })),
  };
}

export function planOnboardingInventoryInserts(
  items: readonly OnboardingComponentSelection[],
  catalogueRows: readonly CatalogueIdentity[],
  existing: readonly OwnedInventoryRow[],
): PlanResult {
  const idsBySlug = new Map<string, string>();
  for (const row of catalogueRows) {
    if (!items.some((item) => item.slug === row.slug)) {
      continue;
    }
    if (idsBySlug.has(row.slug)) {
      return { ok: false, error: 'ambiguous-catalogue' };
    }
    idsBySlug.set(row.slug, row.id);
  }

  for (const item of items) {
    if (!idsBySlug.has(item.slug)) {
      return { ok: false, error: 'missing-catalogue' };
    }
  }

  const ownedById = new Map<string, OwnedInventoryRow>();
  for (const row of existing) {
    ownedById.set(row.componentId, row);
  }

  const inserts: OnboardingInventoryInsert[] = [];
  const unchanged: OwnedInventoryRow[] = [];
  for (const item of items) {
    const componentId = idsBySlug.get(item.slug);
    if (!componentId) {
      return { ok: false, error: 'missing-catalogue' };
    }
    const owned = ownedById.get(componentId);
    if (owned) {
      unchanged.push({ componentId, quantity: owned.quantity });
      continue;
    }
    inserts.push({ componentId, quantity: item.quantity });
  }

  return { ok: true, plan: { inserts, unchanged } };
}

async function insertWithoutChangingExisting(
  userId: string,
  rows: readonly OnboardingInventoryInsert[],
  gateway: OnboardingInventoryGateway,
): Promise<{ error: string | null }> {
  if (rows.length === 0) {
    return { error: null };
  }

  const inserted = await gateway.insertMissing(userId, rows);
  if (!inserted.error && !inserted.conflict) {
    return { error: null };
  }
  if (!inserted.conflict) {
    return { error: ONBOARDING_SAVE_ERRORS.generic };
  }

  const reread = await gateway.findOwned(
    userId,
    rows.map((row) => row.componentId),
  );
  if (reread.error || !reread.rows) {
    return { error: ONBOARDING_SAVE_ERRORS.generic };
  }

  const present = new Set(reread.rows.map((row) => row.componentId));
  const stillMissing = rows.filter((row) => !present.has(row.componentId));
  if (stillMissing.length === 0) {
    return { error: null };
  }

  const retry = await gateway.insertMissing(userId, stillMissing);
  if (retry.error || retry.conflict) {
    return { error: ONBOARDING_SAVE_ERRORS.generic };
  }
  return { error: null };
}

export async function saveOnboardingInventory(
  userId: string,
  items: readonly OnboardingComponentSelection[],
  gateway: OnboardingInventoryGateway,
): Promise<{ error: string | null }> {
  const normalized = normalizeOnboardingComponents(items);
  if (!normalized.ok) {
    return {
      error:
        normalized.error === 'invalid-quantity'
          ? ONBOARDING_SAVE_ERRORS.invalidQuantity
          : ONBOARDING_SAVE_ERRORS.missingComponents,
    };
  }
  if (normalized.items.length === 0) {
    return { error: null };
  }

  const catalogue = await gateway.findCatalogueBySlug(normalized.items.map((item) => item.slug));
  if (catalogue.error || !catalogue.rows) {
    return { error: ONBOARDING_SAVE_ERRORS.generic };
  }

  const identified = planOnboardingInventoryInserts(normalized.items, catalogue.rows, []);
  if (!identified.ok) {
    return { error: ONBOARDING_SAVE_ERRORS.missingComponents };
  }

  const owned = await gateway.findOwned(
    userId,
    identified.plan.inserts.map((row) => row.componentId),
  );
  if (owned.error || !owned.rows) {
    return { error: ONBOARDING_SAVE_ERRORS.generic };
  }

  const planned = planOnboardingInventoryInserts(normalized.items, catalogue.rows, owned.rows);
  if (!planned.ok) {
    return { error: ONBOARDING_SAVE_ERRORS.missingComponents };
  }

  return insertWithoutChangingExisting(userId, planned.plan.inserts, gateway);
}
