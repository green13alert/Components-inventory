import type { InventoryComponent } from '@/constants/inventory';
import { supabase } from '@/lib/supabase';

export const PROJECT_ERRORS = {
  unauthenticated: 'Sign in to view projects.',
  generic: 'Could not load projects. Please try again.',
  notFound: 'This project is not available.',
} as const;

export type ProjectQueryResult<T> = {
  data: T | null;
  error: string | null;
};

export type ProjectCategory = 'robotics' | 'iot' | 'sensors' | 'automation' | 'displays';
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ProjectBomComponent = {
  id: string;
  projectId: string;
  componentId: string;
  slug: string;
  name: string;
  description: string | null;
  quantity: number;
  sortOrder: number;
};

export type MatchedBomComponent = {
  componentId: string;
  slug: string;
  name: string;
  description: string | null;
  requiredQuantity: number;
  ownedQuantity: number;
  missingQuantity: number;
  isOwned: boolean;
};

export type ProjectInventoryMatch = {
  lines: MatchedBomComponent[];
  totalRequired: number;
  totalOwned: number;
  totalMissing: number;
  ownedCount: number;
  missingCount: number;
  matchPercentage: number | null;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  overview: string | null;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  durationLabel: string;
  imageKey: string;
  learningObjectives: string[] | null;
  sortOrder: number;
  isPublished: boolean;
  requiredComponentCount: number;
  bom: ProjectBomComponent[];
};

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'robotics',
  'iot',
  'sensors',
  'automation',
  'displays',
];

const PROJECT_DIFFICULTIES: ProjectDifficulty[] = ['beginner', 'intermediate', 'advanced'];

const PROJECT_SELECT =
  'id, slug, title, description, overview, category, difficulty, duration_label, image_key, learning_objectives, sort_order, is_published';

const PROJECT_LIST_SELECT = `${PROJECT_SELECT}, project_components ( id, project_id, component_id, quantity, sort_order, components!inner ( id, slug, name, description ) )`;

const PROJECT_COMPONENT_SELECT =
  'id, project_id, component_id, quantity, sort_order, components!inner ( id, slug, name, description )';

type CatalogueEmbed = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type ProjectComponentRow = {
  id: string;
  project_id: string;
  component_id: string;
  quantity: number;
  sort_order: number;
  components: CatalogueEmbed | CatalogueEmbed[] | null;
};

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  overview: string | null;
  category: string;
  difficulty: string;
  duration_label: string;
  image_key: string;
  learning_objectives: string[] | null;
  sort_order: number;
  is_published: boolean;
  project_components?: ProjectComponentRow[] | null;
};

function mapPersistError(message: string | undefined, fallback: string): string {
  if (!message) {
    return fallback;
  }

  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return fallback;
  }

  return message;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

function isProjectCategory(value: string): value is ProjectCategory {
  return PROJECT_CATEGORIES.includes(value as ProjectCategory);
}

function isProjectDifficulty(value: string): value is ProjectDifficulty {
  return PROJECT_DIFFICULTIES.includes(value as ProjectDifficulty);
}

function unwrapCatalogue(value: ProjectComponentRow['components']): CatalogueEmbed | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function mapProjectRow(row: ProjectRow): Project | null {
  if (!isProjectCategory(row.category) || !isProjectDifficulty(row.difficulty)) {
    return null;
  }

  const bom = (row.project_components ?? [])
    .map(mapProjectComponentRow)
    .filter((item): item is ProjectBomComponent => item != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    overview: row.overview,
    category: row.category,
    difficulty: row.difficulty,
    durationLabel: row.duration_label,
    imageKey: row.image_key,
    learningObjectives: row.learning_objectives,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    requiredComponentCount: bom.length,
    bom,
  };
}

function mapProjectComponentRow(row: ProjectComponentRow): ProjectBomComponent | null {
  const catalogue = unwrapCatalogue(row.components);
  if (!catalogue) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    componentId: row.component_id,
    slug: catalogue.slug,
    name: catalogue.name,
    description: catalogue.description,
    quantity: row.quantity,
    sortOrder: row.sort_order,
  };
}

export async function fetchProjects(): Promise<ProjectQueryResult<Project[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_LIST_SELECT)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  const mapped = (data as ProjectRow[] | null ?? [])
    .map(mapProjectRow)
    .filter((project): project is Project => project != null);

  return { data: mapped, error: null };
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectQueryResult<Project>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  if (!data) {
    return { data: null, error: PROJECT_ERRORS.notFound };
  }

  const mapped = mapProjectRow(data as ProjectRow);
  if (!mapped) {
    return { data: null, error: PROJECT_ERRORS.notFound };
  }

  return { data: mapped, error: null };
}

export async function fetchProjectComponents(
  projectId: string,
): Promise<ProjectQueryResult<ProjectBomComponent[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('project_components')
    .select(PROJECT_COMPONENT_SELECT)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  const mapped = ((data as ProjectComponentRow[] | null) ?? [])
    .map(mapProjectComponentRow)
    .filter((item): item is ProjectBomComponent => item != null);

  return { data: mapped, error: null };
}

export function matchProjectInventory(
  bom: ProjectBomComponent[],
  inventory: InventoryComponent[],
): ProjectInventoryMatch {
  if (bom.length === 0) {
    return {
      lines: [],
      totalRequired: 0,
      totalOwned: 0,
      totalMissing: 0,
      ownedCount: 0,
      missingCount: 0,
      matchPercentage: null,
    };
  }

  const ownedByComponentId = new Map<string, number>();
  for (const item of inventory) {
    if (!item.componentId) {
      continue;
    }
    ownedByComponentId.set(item.componentId, (ownedByComponentId.get(item.componentId) ?? 0) + item.quantity);
  }

  const lines = bom.map((line) => {
    const ownedQuantity = ownedByComponentId.get(line.componentId) ?? 0;
    const missingQuantity = Math.max(line.quantity - ownedQuantity, 0);

    return {
      componentId: line.componentId,
      slug: line.slug,
      name: line.name,
      description: line.description,
      requiredQuantity: line.quantity,
      ownedQuantity,
      missingQuantity,
      isOwned: ownedQuantity >= line.quantity,
    };
  });

  const ownedCount = lines.filter((line) => line.isOwned).length;
  const missingCount = lines.length - ownedCount;

  return {
    lines,
    totalRequired: lines.length,
    totalOwned: lines.reduce((sum, line) => sum + line.ownedQuantity, 0),
    totalMissing: lines.reduce((sum, line) => sum + line.missingQuantity, 0),
    ownedCount,
    missingCount,
    matchPercentage: (ownedCount / lines.length) * 100,
  };
}
