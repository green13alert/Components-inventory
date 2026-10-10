import {
  emptyProjectCompatibility,
  type CompatibilityChangeKind,
  type CompatibilityRequirement,
  type ProjectCompatibilityData,
  type RequirementConstraint,
  type RequirementPinRole,
  type ReviewAssessment,
  type SubstitutionChange,
  type SubstitutionReview,
} from '@/lib/compatibility';
import { getProjectImage } from '@/constants/projects';
import type { Project as WalkthroughProject, ProjectStatus } from '@/constants/projects-data';
import { STEP_BLOCK_TYPES, type StepBlock, type StepCodeContent } from '@/constants/walkthrough-content';
import { supabase } from '@/lib/supabase';

export const PROJECT_ERRORS = {
  unauthenticated: 'Sign in to view projects.',
  generic: 'Could not load projects. Please try again.',
  notFound: 'This project is not available.',
  save: 'Could not save project state. Please try again.',
  stepsUnavailable: 'A full walkthrough is not available for this project yet.',
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

export type {
  MatchedBomComponent,
  ProjectCompatibilityData,
  ProjectInventoryMatch,
  RequirementCoverage,
} from '@/lib/compatibility';

export { emptyProjectCompatibility, matchProjectInventory } from '@/lib/compatibility';

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
  authoredSteps: ProjectStepSummary[];
};

export type ProjectStepSummary = {
  id: string;
  sortOrder: number;
  title: string;
};

export type ProjectWalkthroughStep = {
  id: string;
  projectId: string;
  sortOrder: number;
  stageSortOrder: number;
  stageTitle: string | null;
  title: string;
  description: string;
  tip: string | null;
  blocks: StepBlock[];
};

export type WalkthroughStageContext = {
  stageTitle: string;
  stageNumber: number;
  stageCount: number;
  stepNumber: number;
  stepCount: number;
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
  'id, slug, title, description, overview, category, difficulty, duration_label, image_key, learning_objectives, sort_order, is_published, project_steps ( id, sort_order, title )';

const PROJECT_LIST_SELECT = `${PROJECT_SELECT}, project_components ( id, project_id, component_id, quantity, sort_order, components!inner ( id, slug, name, description ) )`;

const PROJECT_COMPONENT_SELECT =
  'id, project_id, component_id, quantity, sort_order, components!inner ( id, slug, name, description )';

const PROJECT_WALKTHROUGH_SELECT =
  'id, project_id, sort_order, stage_sort_order, stage_title, title, description, tip, blocks';

type ProjectStepSummaryRow = {
  id: string;
  sort_order: number;
  title: string;
};

type ProjectWalkthroughRow = {
  id: string;
  project_id: string;
  sort_order: number;
  stage_sort_order: number | null;
  stage_title: string | null;
  title: string;
  description: string;
  tip: string | null;
  blocks: unknown;
};

function mapProjectStepSummaryRow(row: ProjectStepSummaryRow): ProjectStepSummary {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: row.title,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseStepBlocks(value: unknown): StepBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((block): block is StepBlock => {
    if (!isRecord(block) || typeof block.type !== 'string') {
      return false;
    }
    return (STEP_BLOCK_TYPES as readonly string[]).includes(block.type);
  }) as StepBlock[];
}

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
  project_steps?: ProjectStepSummaryRow[] | null;
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

  const authoredSteps = (row.project_steps ?? [])
    .map(mapProjectStepSummaryRow)
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
    authoredSteps,
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

export async function fetchProjectSteps(
  projectId: string,
): Promise<ProjectQueryResult<ProjectWalkthroughStep[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const { data, error } = await supabase
    .from('project_steps')
    .select(PROJECT_WALKTHROUGH_SELECT)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  const mapped = ((data as ProjectWalkthroughRow[] | null) ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    sortOrder: row.sort_order,
    stageSortOrder: row.stage_sort_order ?? 0,
    stageTitle: row.stage_title,
    title: row.title,
    description: row.description,
    tip: row.tip,
    blocks: parseStepBlocks(row.blocks),
  }));

  return { data: mapped, error: null };
}

export function getWalkthroughStageContext(
  steps: ProjectWalkthroughStep[],
  stepIndex: number,
): WalkthroughStageContext | null {
  const current = steps[stepIndex];
  if (!current?.stageTitle) {
    return null;
  }

  const stageKeys: number[] = [];
  for (const step of steps) {
    if (!step.stageTitle) {
      continue;
    }
    if (!stageKeys.includes(step.stageSortOrder)) {
      stageKeys.push(step.stageSortOrder);
    }
  }
  stageKeys.sort((a, b) => a - b);
  if (stageKeys.length === 0) {
    return null;
  }

  return {
    stageTitle: current.stageTitle,
    stageNumber: stageKeys.indexOf(current.stageSortOrder) + 1,
    stageCount: stageKeys.length,
    stepNumber: stepIndex + 1,
    stepCount: steps.length,
  };
}

export function getWalkthroughSketch(steps: ProjectWalkthroughStep[]): StepCodeContent | null {
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const blocks = steps[index]?.blocks ?? [];
    for (let blockIndex = blocks.length - 1; blockIndex >= 0; blockIndex -= 1) {
      const block = blocks[blockIndex];
      if (block.type === 'code') {
        return {
          language: block.language,
          filename: block.filename ?? 'sketch.ino',
          libraries: block.libraries ?? [],
          code: block.code,
        };
      }
    }
  }

  return null;
}

const REQUIREMENT_SELECT =
  'id, project_component_id, substitution_policy, project_components!inner ( component_id ), project_requirement_constraints ( capability, value ), project_requirement_pin_roles ( role_key, pin_function, canonical_label )';

const REVIEW_SELECT =
  'requirement_id, component_id, assessed_result, substitution_review_changes ( change_kind, summary, step_sort_order, payload )';

const CAPABILITY_SELECT = 'component_id, capability, value';

const PIN_PROFILE_SELECT = 'component_id, pin_profile_pins ( label, pin_function )';

const REVIEW_ASSESSMENTS: readonly ReviewAssessment[] = ['direct', 'conditional', 'incompatible'];

const CHANGE_KINDS: readonly CompatibilityChangeKind[] = [
  'board_package',
  'pin_map',
  'code',
  'wiring',
  'diagram',
  'supply',
  'troubleshooting',
  'visual',
  'mechanical',
];

function asRows<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function isPolicy(value: unknown): value is CompatibilityRequirement['policy'] {
  return value === 'exact' || value === 'direct' || value === 'conditional';
}

function isReviewAssessment(value: unknown): value is ReviewAssessment {
  return typeof value === 'string' && REVIEW_ASSESSMENTS.includes(value as ReviewAssessment);
}

function isChangeKind(value: unknown): value is CompatibilityChangeKind {
  return typeof value === 'string' && CHANGE_KINDS.includes(value as CompatibilityChangeKind);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Loads requirement, capability, pin, and review rows for the given projects
 * and candidate components. A query failure returns no compatibility data.
 * Callers must then keep exact matching and must not invent a substitute.
 */
export async function fetchProjectCompatibility(
  projectIds: readonly string[],
  candidateComponentIds: readonly string[],
): Promise<ProjectQueryResult<ProjectCompatibilityData>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { data: null, error: PROJECT_ERRORS.unauthenticated };
  }

  const ids = [...new Set(projectIds.filter((id) => id.length > 0))];
  if (ids.length === 0) {
    return { data: emptyProjectCompatibility(), error: null };
  }

  const { data, error } = await supabase.from('project_requirements').select(REQUIREMENT_SELECT).in('project_id', ids);

  if (error) {
    return { data: null, error: mapPersistError(error.message, PROJECT_ERRORS.generic) };
  }

  const requirementsByBomLineId = new Map<string, CompatibilityRequirement>();
  const canonicalIds: string[] = [];

  for (const row of (data as unknown[] | null) ?? []) {
    if (!isRecord(row)) {
      continue;
    }
    const requirementId = readString(row.id);
    const bomLineId = readString(row.project_component_id);
    const policy = row.substitution_policy;
    const bomEmbed = asRows(row.project_components).find(isRecord);
    const canonicalComponentId = bomEmbed ? readString(bomEmbed.component_id) : null;
    if (!requirementId || !bomLineId || !canonicalComponentId || !isPolicy(policy)) {
      continue;
    }

    const constraints: RequirementConstraint[] = [];
    for (const constraint of asRows(row.project_requirement_constraints)) {
      if (!isRecord(constraint)) {
        continue;
      }
      const capability = readString(constraint.capability);
      const value = readString(constraint.value);
      if (capability && value) {
        constraints.push({ capability, value });
      }
    }

    const pinRoles: RequirementPinRole[] = [];
    for (const pinRole of asRows(row.project_requirement_pin_roles)) {
      if (!isRecord(pinRole)) {
        continue;
      }
      const roleKey = readString(pinRole.role_key);
      const pinFunction = readString(pinRole.pin_function);
      const canonicalLabel = readString(pinRole.canonical_label);
      if (roleKey && pinFunction && canonicalLabel) {
        pinRoles.push({ roleKey, pinFunction, canonicalLabel });
      }
    }

    canonicalIds.push(canonicalComponentId);
    requirementsByBomLineId.set(bomLineId, {
      id: requirementId,
      policy,
      canonicalComponentId,
      constraints,
      pinRoles,
    });
  }

  const requirementIds = [...new Set([...requirementsByBomLineId.values()].map((requirement) => requirement.id))];
  const reviews: SubstitutionReview[] = [];

  if (requirementIds.length > 0) {
    const reviewResult = await supabase
      .from('requirement_substitution_reviews')
      .select(REVIEW_SELECT)
      .in('requirement_id', requirementIds);

    if (reviewResult.error) {
      return { data: null, error: mapPersistError(reviewResult.error.message, PROJECT_ERRORS.generic) };
    }

    for (const row of (reviewResult.data as unknown[] | null) ?? []) {
      if (!isRecord(row)) {
        continue;
      }
      const requirementId = readString(row.requirement_id);
      const componentId = readString(row.component_id);
      if (!requirementId || !componentId || !isReviewAssessment(row.assessed_result)) {
        continue;
      }

      const rawChanges = asRows(row.substitution_review_changes);
      const changes: SubstitutionChange[] = [];
      let changesAreReadable = true;
      for (const change of rawChanges) {
        if (!isRecord(change) || !isChangeKind(change.change_kind)) {
          changesAreReadable = false;
          break;
        }
        const summary = readString(change.summary);
        if (!summary) {
          changesAreReadable = false;
          break;
        }
        const stepSortOrder =
          typeof change.step_sort_order === 'number' && Number.isFinite(change.step_sort_order)
            ? change.step_sort_order
            : null;
        const payload = isRecord(change.payload) ? change.payload : undefined;
        changes.push({
          changeKind: change.change_kind,
          summary,
          stepSortOrder,
          payload,
        });
      }
      if (!changesAreReadable) {
        continue;
      }

      reviews.push({
        requirementId,
        componentId,
        assessedResult: row.assessed_result,
        changes,
      });
    }
  }

  const componentIds = [
    ...new Set(
      [...canonicalIds, ...candidateComponentIds, ...reviews.map((review) => review.componentId)].filter(
        (id) => id.length > 0,
      ),
    ),
  ];
  const componentsById = new Map<string, { componentId: string; capabilities: { capability: string; value: string }[]; pins: { label: string; pinFunction: string }[] }>();
  for (const componentId of componentIds) {
    componentsById.set(componentId, { componentId, capabilities: [], pins: [] });
  }

  if (componentIds.length > 0) {
    const [capabilityResult, pinResult] = await Promise.all([
      supabase.from('component_capabilities').select(CAPABILITY_SELECT).in('component_id', componentIds),
      supabase.from('pin_profiles').select(PIN_PROFILE_SELECT).in('component_id', componentIds),
    ]);

    if (capabilityResult.error) {
      return { data: null, error: mapPersistError(capabilityResult.error.message, PROJECT_ERRORS.generic) };
    }
    if (pinResult.error) {
      return { data: null, error: mapPersistError(pinResult.error.message, PROJECT_ERRORS.generic) };
    }

    for (const row of (capabilityResult.data as unknown[] | null) ?? []) {
      if (!isRecord(row)) {
        continue;
      }
      const componentId = readString(row.component_id);
      const capability = readString(row.capability);
      const value = readString(row.value);
      const component = componentId ? componentsById.get(componentId) : undefined;
      if (!component || !capability || !value) {
        continue;
      }
      component.capabilities.push({ capability, value });
    }

    for (const row of (pinResult.data as unknown[] | null) ?? []) {
      if (!isRecord(row)) {
        continue;
      }
      const componentId = readString(row.component_id);
      const component = componentId ? componentsById.get(componentId) : undefined;
      if (!component) {
        continue;
      }
      for (const pin of asRows(row.pin_profile_pins)) {
        if (!isRecord(pin)) {
          continue;
        }
        const label = readString(pin.label);
        const pinFunction = readString(pin.pin_function);
        if (label && pinFunction) {
          component.pins.push({ label, pinFunction });
        }
      }
    }
  }

  return {
    data: {
      requirementsByBomLineId,
      componentsById,
      reviews,
    },
    error: null,
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
