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

function mapProjectRow(row: ProjectRow): Project | null {
  if (!isProjectCategory(row.category) || !isProjectDifficulty(row.difficulty)) {
    return null;
  }

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
  };
}

export async function fetchProjects(): Promise<ProjectQueryResult<Project[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
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
