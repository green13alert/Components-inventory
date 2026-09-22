import type { InventoryComponent } from '@/constants/inventory';
import { getProjectImage } from '@/constants/projects';
import type { Project as WalkthroughProject, ProjectStatus } from '@/constants/projects-data';
import { supabase } from '@/lib/supabase';

export const PROJECT_ERRORS = {
  unauthenticated: 'Sign in to view projects.',
  generic: 'Could not load projects. Please try again.',
  notFound: 'This project is not available.',
  save: 'Could not save project state. Please try again.',
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

export type UserProject = {
  id: string;
  userId: string;
  projectId: string;
  isFavourite: boolean;
  startedAt: string | null;
  currentStep: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const USER_PROJECT_SELECT =
  'id, user_id, project_id, is_favourite, started_at, current_step, completed_at, created_at, updated_at';

type UserProjectRow = {
  id: string;
  user_id: string;
  project_id: string;
  is_favourite: boolean;
  started_at: string | null;
  current_step: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapUserProjectRow(row: UserProjectRow): UserProject {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    isFavourite: row.is_favourite,
    startedAt: row.started_at,
    currentStep: Math.max(0, row.current_step),
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getUserProjectStatus(row: UserProject | null | undefined): ProjectStatus {
  if (!row) {
    return 'not_started';
  }
  if (row.completedAt) {
    return 'completed';
  }
  if (row.startedAt) {
    return 'in_progress';
  }
  return 'not_started';
}

export function getUserProjectProgressPercent(
  row: UserProject | null | undefined,
  totalSteps: number,
): number {
  if (!row || getUserProjectStatus(row) === 'not_started' || totalSteps <= 0) {
    return 0;
  }
  if (row.completedAt) {
    return 100;
  }
  return Math.round(((row.currentStep + 1) / totalSteps) * 100);
}

export function toWalkthroughProject(project: Project, status: ProjectStatus = 'not_started'): WalkthroughProject {
  return {
    id: project.slug,
    title: project.title,
    description: project.description,
    overview: project.overview ?? undefined,
    difficulty: project.difficulty,
    duration: project.durationLabel,
    category: project.category,
    image: getProjectImage(project.imageKey),
    ownedParts: 0,
    totalParts: project.requiredComponentCount,
    status,
  };
}

async function fetchUserProjectRow(
  userId: string,
  projectId: string,
): Promise<ProjectQueryResult<UserProject | null>> {
  const { data, error } = await supabase
    .from('user_projects')
    .select(USER_PROJECT_SELECT)
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  return { data: data ? mapUserProjectRow(data as UserProjectRow) : null, error: null };
}

export async function fetchUserProjects(): Promise<ProjectQueryResult<UserProject[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('user_projects')
    .select(USER_PROJECT_SELECT)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  return {
    data: ((data as UserProjectRow[] | null) ?? []).map(mapUserProjectRow),
    error: null,
  };
}

export async function fetchUserProject(projectId: string): Promise<ProjectQueryResult<UserProject | null>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  return fetchUserProjectRow(userId, projectId);
}

async function insertUserProject(
  userId: string,
  values: {
    projectId: string;
    isFavourite: boolean;
    startedAt: string | null;
    currentStep: number;
    completedAt: string | null;
  },
): Promise<ProjectQueryResult<UserProject>> {
  const { data, error } = await supabase
    .from('user_projects')
    .insert({
      user_id: userId,
      project_id: values.projectId,
      is_favourite: values.isFavourite,
      started_at: values.startedAt,
      current_step: values.currentStep,
      completed_at: values.completedAt,
    })
    .select(USER_PROJECT_SELECT)
    .single();

  if (error?.code === '23505') {
    const existing = await fetchUserProjectRow(userId, values.projectId);
    if (existing.error) {
      return { data: null, error: existing.error };
    }
    if (!existing.data) {
      return { data: null, error: PROJECT_ERRORS.save };
    }
    return { data: existing.data, error: null };
  }

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.save) };
  }

  if (!data) {
    return { data: null, error: PROJECT_ERRORS.save };
  }

  return { data: mapUserProjectRow(data as UserProjectRow), error: null };
}

async function patchUserProject(
  userId: string,
  projectId: string,
  values: Record<string, unknown>,
): Promise<ProjectQueryResult<UserProject>> {
  const { error } = await supabase
    .from('user_projects')
    .update(values)
    .eq('user_id', userId)
    .eq('project_id', projectId);

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.save) };
  }

  const updated = await fetchUserProjectRow(userId, projectId);
  if (updated.error || !updated.data) {
    return { data: null, error: updated.error ?? PROJECT_ERRORS.save };
  }

  return { data: updated.data, error: null };
}

export async function startUserProject(projectId: string): Promise<ProjectQueryResult<UserProject>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const existing = await fetchUserProjectRow(userId, projectId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  if (existing.data?.startedAt) {
    return { data: existing.data, error: null };
  }

  if (existing.data) {
    return patchUserProject(userId, projectId, { started_at: new Date().toISOString() });
  }

  return insertUserProject(userId, {
    projectId,
    isFavourite: false,
    startedAt: new Date().toISOString(),
    currentStep: 0,
    completedAt: null,
  });
}

export async function toggleUserProjectFavourite(projectId: string): Promise<ProjectQueryResult<UserProject>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const existing = await fetchUserProjectRow(userId, projectId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  if (!existing.data) {
    return insertUserProject(userId, {
      projectId,
      isFavourite: true,
      startedAt: null,
      currentStep: 0,
      completedAt: null,
    });
  }

  return patchUserProject(userId, projectId, { is_favourite: !existing.data.isFavourite });
}

export async function updateUserProjectStep(
  projectId: string,
  currentStep: number,
): Promise<ProjectQueryResult<UserProject>> {
  const step = Math.max(0, Math.floor(currentStep));
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const existing = await fetchUserProjectRow(userId, projectId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  if (!existing.data) {
    const started = await startUserProject(projectId);
    if (started.error || !started.data) {
      return { data: null, error: started.error ?? PROJECT_ERRORS.save };
    }
    if (started.data.currentStep === step) {
      return started;
    }
    return patchUserProject(userId, projectId, { current_step: step });
  }

  if (existing.data.currentStep === step) {
    return { data: existing.data, error: null };
  }

  return patchUserProject(userId, projectId, { current_step: step });
}

export async function completeUserProject(
  projectId: string,
  currentStep: number,
): Promise<ProjectQueryResult<UserProject>> {
  const step = Math.max(0, Math.floor(currentStep));
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const existing = await fetchUserProjectRow(userId, projectId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }

  let row = existing.data;
  if (!row?.startedAt) {
    const started = await startUserProject(projectId);
    if (started.error || !started.data) {
      return { data: null, error: started.error ?? PROJECT_ERRORS.save };
    }
    row = started.data;
  }

  if (row.completedAt && row.currentStep === step) {
    return { data: row, error: null };
  }

  return patchUserProject(userId, projectId, {
    current_step: step,
    completed_at: new Date().toISOString(),
  });
}

export async function resetUserProjectProgress(projectId: string): Promise<ProjectQueryResult<UserProject>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const existing = await fetchUserProjectRow(userId, projectId);
  if (existing.error) {
    return { data: null, error: existing.error };
  }
  if (!existing.data) {
    return { data: null, error: PROJECT_ERRORS.notFound };
  }

  if (existing.data.currentStep === 0 && existing.data.completedAt == null) {
    return { data: existing.data, error: null };
  }

  return patchUserProject(userId, projectId, {
    current_step: 0,
    completed_at: null,
  });
}
