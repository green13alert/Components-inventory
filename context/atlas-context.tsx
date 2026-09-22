import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Toast } from '@/components/ui/toast';
import { type InventoryComponent } from '@/constants/inventory';
import { MOCK_PROJECTS, getStepCount, type Project, type ProjectStatus } from '@/constants/projects-data';
import { useAuth } from '@/context/auth-context';
import {
  INVENTORY_ERRORS,
  addInventoryCatalogueItem,
  deleteInventoryItem,
  fetchInventory,
  setInventoryItemQuantity,
  updateInventoryCatalogueItem,
} from '@/lib/inventory';
import {
  PROJECT_ERRORS,
  completeUserProject,
  fetchProjects,
  fetchUserProjects,
  resetUserProjectProgress,
  startUserProject,
  toggleUserProjectFavourite,
  updateUserProjectStep,
  getUserProjectProgressPercent,
  getUserProjectStatus,
  type Project as CatalogueProject,
  type UserProject,
} from '@/lib/projects';

export type ProjectProgress = {
  currentStep: number;
  completed: boolean;
};

export type WorkshopActivityKind = 'started' | 'continued' | 'completed' | 'component_added';

export type WorkshopActivity = {
  id: string;
  kind: WorkshopActivityKind;
  title: string;
  createdAt: number;
  projectId?: string;
};

type InventoryMutationResult = {
  error: string | null;
};

type ProjectMutationResult = {
  error: string | null;
};

type AtlasContextValue = {
  inventory: InventoryComponent[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  publishedProjects: CatalogueProject[];
  projectsLoading: boolean;
  projectsError: string | null;
  userProjects: UserProject[];
  favouriteProjectIds: Set<string>;
  projectProgress: Record<string, ProjectProgress>;
  recentActivity: WorkshopActivity[];
  reloadInventory: (options?: { silent?: boolean }) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryComponent, 'id'>) => Promise<InventoryMutationResult>;
  updateInventoryItem: (id: string, item: Omit<InventoryComponent, 'id'>) => Promise<InventoryMutationResult>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<InventoryMutationResult>;
  removeInventoryItem: (id: string) => Promise<InventoryMutationResult>;
  getUserProject: (projectId: string) => UserProject | undefined;
  toggleFavourite: (projectId: string) => Promise<ProjectMutationResult>;
  isFavourite: (projectId: string) => boolean;
  getProjectStatus: (projectId: string) => ProjectStatus;
  getProjectProgressPercent: (projectId: string, difficulty: Project['difficulty']) => number;
  getCurrentStepIndex: (projectId: string) => number;
  startProject: (projectId: string) => Promise<ProjectMutationResult>;
  setProjectStep: (projectId: string, stepIndex: number) => Promise<ProjectMutationResult>;
  completeProject: (projectId: string, currentStep?: number) => Promise<ProjectMutationResult>;
  resetProjectProgress: (projectId: string) => Promise<ProjectMutationResult>;
  getProjectsWithStatus: () => (Project & { status: ProjectStatus; progress?: number })[];
};

const AtlasContext = createContext<AtlasContextValue | null>(null);

const MAX_ACTIVITY = 20;

function upsertUserProject(prev: UserProject[], next: UserProject): UserProject[] {
  const without = prev.filter((item) => item.projectId !== next.projectId);
  return [next, ...without].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function prependActivity(prev: WorkshopActivity[], event: WorkshopActivity): WorkshopActivity[] {
  const withoutStale = event.projectId
    ? prev.filter((item) => {
        if (item.projectId !== event.projectId) return true;
        if (event.kind === 'completed') return false;
        return item.kind === 'completed';
      })
    : prev;

  return [event, ...withoutStale].slice(0, MAX_ACTIVITY);
}

function upsertInventoryItem(prev: InventoryComponent[], item: InventoryComponent): InventoryComponent[] {
  const index = prev.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    const next = [...prev];
    next[index] = item;
    return next;
  }

  const byCatalogue = prev.findIndex((existing) => existing.catalogueId && existing.catalogueId === item.catalogueId);
  if (byCatalogue >= 0) {
    const next = [...prev];
    next[byCatalogue] = item;
    return next;
  }

  return [...prev, item];
}

export function AtlasProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [inventory, setInventory] = useState<InventoryComponent[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(() => Boolean(session));
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [publishedProjects, setPublishedProjects] = useState<CatalogueProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(() => Boolean(session));
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [recentActivity, setRecentActivity] = useState<WorkshopActivity[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hideToast = useCallback(() => setToastMessage(null), []);
  const userId = session?.user.id;
  const loadGeneration = useRef(0);
  const projectLoadGeneration = useRef(0);

  const reloadInventory = useCallback(async (options?: { silent?: boolean }) => {
    const generation = ++loadGeneration.current;

    if (!userId) {
      setInventory([]);
      setInventoryError(null);
      setInventoryLoading(false);
      return;
    }

    if (!options?.silent) {
      setInventoryLoading(true);
      setInventoryError(null);
    }

    const result = await fetchInventory();
    if (generation !== loadGeneration.current) {
      return;
    }

    if (result.error) {
      if (!options?.silent) {
        setInventory([]);
        setInventoryError(result.error);
      }
      setInventoryLoading(false);
      return;
    }

    setInventory(result.data ?? []);
    setInventoryError(null);
    setInventoryLoading(false);
  }, [userId]);

  const reloadProjectState = useCallback(async () => {
    const generation = ++projectLoadGeneration.current;

    if (!userId) {
      setPublishedProjects([]);
      setUserProjects([]);
      setProjectsError(null);
      setProjectsLoading(false);
      return;
    }

    setProjectsLoading(true);
    setProjectsError(null);

    const [projectsResult, userResult] = await Promise.all([fetchProjects(), fetchUserProjects()]);
    if (generation !== projectLoadGeneration.current) {
      return;
    }

    if (projectsResult.error || userResult.error) {
      setPublishedProjects(projectsResult.data ?? []);
      setUserProjects(userResult.data ?? []);
      setProjectsError(projectsResult.error ?? userResult.error);
      setProjectsLoading(false);
      return;
    }

    setPublishedProjects(projectsResult.data ?? []);
    setUserProjects(userResult.data ?? []);
    setProjectsError(null);
    setProjectsLoading(false);
  }, [userId]);

  useEffect(() => {
    void reloadInventory();
  }, [reloadInventory]);

  useEffect(() => {
    void reloadProjectState();
  }, [reloadProjectState]);

  const resolveProjectId = useCallback(
    (idOrSlug: string): string | null => {
      if (userProjects.some((row) => row.projectId === idOrSlug)) {
        return idOrSlug;
      }
      const byId = publishedProjects.find((project) => project.id === idOrSlug);
      if (byId) {
        return byId.id;
      }
      return publishedProjects.find((project) => project.slug === idOrSlug)?.id ?? null;
    },
    [publishedProjects, userProjects],
  );

  const getUserProject = useCallback(
    (projectId: string) => {
      const resolved = resolveProjectId(projectId);
      if (!resolved) {
        return undefined;
      }
      return userProjects.find((row) => row.projectId === resolved);
    },
    [resolveProjectId, userProjects],
  );

  const getProjectTitle = useCallback(
    (projectId: string) => {
      const resolved = resolveProjectId(projectId);
      const catalogue = publishedProjects.find(
        (project) => project.id === resolved || project.id === projectId || project.slug === projectId,
      );
      if (catalogue) {
        return catalogue.title;
      }
      return MOCK_PROJECTS.find((project) => project.id === projectId)?.title;
    },
    [publishedProjects, resolveProjectId],
  );

  const recordProjectActivity = useCallback(
    (kind: Exclude<WorkshopActivityKind, 'component_added'>, projectId: string) => {
      const title = getProjectTitle(projectId);
      if (!title) {
        return;
      }
      setRecentActivity((prev) =>
        prependActivity(prev, {
          id: `activity-project-${projectId}-${kind}-${Date.now()}`,
          kind,
          title,
          createdAt: Date.now(),
          projectId,
        }),
      );
    },
    [getProjectTitle],
  );

  const addInventoryItem = useCallback(async (item: Omit<InventoryComponent, 'id'>): Promise<InventoryMutationResult> => {
    if (!item.catalogueId) {
      return { error: INVENTORY_ERRORS.customUnavailable };
    }

    const result = await addInventoryCatalogueItem(item.catalogueId, item.quantity);
    if (result.error || !result.data) {
      return { error: result.error ?? INVENTORY_ERRORS.save };
    }

    setInventory((prev) => upsertInventoryItem(prev, result.data!));
    const createdAt = Date.now();
    setRecentActivity((prev) =>
      prependActivity(prev, {
        id: `activity-component-${createdAt}`,
        kind: 'component_added',
        title: result.data!.name,
        createdAt,
      }),
    );
    return { error: null };
  }, []);

  const updateInventoryItem = useCallback(async (
    id: string,
    item: Omit<InventoryComponent, 'id'>,
  ): Promise<InventoryMutationResult> => {
    if (!item.catalogueId) {
      return { error: INVENTORY_ERRORS.customUnavailable };
    }

    const result = await updateInventoryCatalogueItem(id, item.catalogueId, item.quantity);
    if (result.error || !result.data) {
      return { error: result.error ?? INVENTORY_ERRORS.save };
    }

    setInventory((prev) => {
      const withoutReplaced = prev.filter((existing) => existing.id === result.data!.id || existing.id !== id);
      return upsertInventoryItem(withoutReplaced, result.data!);
    });
    return { error: null };
  }, []);

  const updateInventoryQuantity = useCallback(async (
    id: string,
    quantity: number,
  ): Promise<InventoryMutationResult> => {
    const result = await setInventoryItemQuantity(id, quantity);
    if (result.error || !result.data) {
      return { error: result.error ?? INVENTORY_ERRORS.save };
    }

    setInventory((prev) => upsertInventoryItem(prev, result.data!));
    return { error: null };
  }, []);

  const removeInventoryItem = useCallback(async (id: string): Promise<InventoryMutationResult> => {
    const result = await deleteInventoryItem(id);
    if (result.error) {
      return result;
    }

    setInventory((prev) => prev.filter((item) => item.id !== id));
    return { error: null };
  }, []);

  const persistUserProject = useCallback((row: UserProject) => {
    setUserProjects((prev) => upsertUserProject(prev, row));
  }, []);

  const toggleFavourite = useCallback(async (projectId: string): Promise<ProjectMutationResult> => {
    const resolved = resolveProjectId(projectId);
    if (!resolved) {
      return { error: PROJECT_ERRORS.notFound };
    }

    const adding = getUserProject(resolved)?.isFavourite !== true;
    const result = await toggleUserProjectFavourite(resolved);
    if (result.error || !result.data) {
      return { error: result.error ?? PROJECT_ERRORS.save };
    }

    persistUserProject(result.data);
    setToastMessage(adding ? 'Project added to favourites' : 'Project removed from favourites');
    return { error: null };
  }, [getUserProject, persistUserProject, resolveProjectId]);

  const isFavourite = useCallback(
    (projectId: string) => getUserProject(projectId)?.isFavourite === true,
    [getUserProject],
  );

  const getProjectStatus = useCallback(
    (projectId: string): ProjectStatus => getUserProjectStatus(getUserProject(projectId)),
    [getUserProject],
  );

  const getProjectProgressPercent = useCallback(
    (projectId: string, difficulty: Project['difficulty']) => {
      return getUserProjectProgressPercent(getUserProject(projectId), getStepCount(difficulty));
    },
    [getUserProject],
  );

  const getCurrentStepIndex = useCallback(
    (projectId: string) => getUserProject(projectId)?.currentStep ?? 0,
    [getUserProject],
  );

  const startProject = useCallback(async (projectId: string): Promise<ProjectMutationResult> => {
    const resolved = resolveProjectId(projectId);
    if (!resolved) {
      return { error: PROJECT_ERRORS.notFound };
    }

    const before = getUserProject(resolved);
    const result = await startUserProject(resolved);
    if (result.error || !result.data) {
      return { error: result.error ?? PROJECT_ERRORS.save };
    }

    persistUserProject(result.data);
    if (!before?.startedAt && result.data.startedAt) {
      recordProjectActivity('started', resolved);
    }
    return { error: null };
  }, [getUserProject, persistUserProject, recordProjectActivity, resolveProjectId]);

  const setProjectStep = useCallback(async (projectId: string, stepIndex: number): Promise<ProjectMutationResult> => {
    const resolved = resolveProjectId(projectId);
    if (!resolved) {
      return { error: PROJECT_ERRORS.notFound };
    }

    const before = getUserProject(resolved)?.currentStep;
    const result = await updateUserProjectStep(resolved, stepIndex);
    if (result.error || !result.data) {
      return { error: result.error ?? PROJECT_ERRORS.save };
    }

    persistUserProject(result.data);
    if (before !== result.data.currentStep) {
      recordProjectActivity('continued', resolved);
    }
    return { error: null };
  }, [getUserProject, persistUserProject, recordProjectActivity, resolveProjectId]);

  const completeProject = useCallback(async (
    projectId: string,
    currentStep?: number,
  ): Promise<ProjectMutationResult> => {
    const resolved = resolveProjectId(projectId);
    if (!resolved) {
      return { error: PROJECT_ERRORS.notFound };
    }

    const catalogue = publishedProjects.find((project) => project.id === resolved);
    const mock = MOCK_PROJECTS.find((project) => project.id === projectId || project.id === catalogue?.slug);
    const totalSteps = getStepCount(catalogue?.difficulty ?? mock?.difficulty ?? 'beginner');
    const finalStep = currentStep ?? Math.max(0, totalSteps - 1);

    const alreadyCompleted = Boolean(getUserProject(resolved)?.completedAt);
    const result = await completeUserProject(resolved, finalStep);
    if (result.error || !result.data) {
      return { error: result.error ?? PROJECT_ERRORS.save };
    }

    persistUserProject(result.data);
    if (!alreadyCompleted && result.data.completedAt) {
      recordProjectActivity('completed', resolved);
    }
    return { error: null };
  }, [getUserProject, persistUserProject, publishedProjects, recordProjectActivity, resolveProjectId]);

  const resetProjectProgress = useCallback(async (projectId: string): Promise<ProjectMutationResult> => {
    const resolved = resolveProjectId(projectId);
    if (!resolved) {
      return { error: PROJECT_ERRORS.notFound };
    }

    const result = await resetUserProjectProgress(resolved);
    if (result.error || !result.data) {
      return { error: result.error ?? PROJECT_ERRORS.save };
    }

    persistUserProject(result.data);
    return { error: null };
  }, [persistUserProject, resolveProjectId]);

  const favouriteProjectIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of userProjects) {
      if (!row.isFavourite) {
        continue;
      }
      ids.add(row.projectId);
      const slug = publishedProjects.find((project) => project.id === row.projectId)?.slug;
      if (slug) {
        ids.add(slug);
      }
    }
    return ids;
  }, [publishedProjects, userProjects]);

  const projectProgress = useMemo(() => {
    const progress: Record<string, ProjectProgress> = {};
    for (const row of userProjects) {
      const value = {
        currentStep: row.currentStep,
        completed: Boolean(row.completedAt),
      };
      progress[row.projectId] = value;
      const slug = publishedProjects.find((project) => project.id === row.projectId)?.slug;
      if (slug) {
        progress[slug] = value;
      }
    }
    return progress;
  }, [publishedProjects, userProjects]);

  const getProjectsWithStatus = useCallback(() => {
    return MOCK_PROJECTS.map((project) => {
      const status = getProjectStatus(project.id);
      const progress =
        status === 'in_progress' || status === 'completed'
          ? getProjectProgressPercent(project.id, project.difficulty)
          : undefined;
      return { ...project, status, progress };
    });
  }, [getProjectProgressPercent, getProjectStatus]);

  const value = useMemo(
    () => ({
      inventory,
      inventoryLoading,
      inventoryError,
      publishedProjects,
      projectsLoading,
      projectsError,
      userProjects,
      favouriteProjectIds,
      projectProgress,
      recentActivity,
      reloadInventory,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryQuantity,
      removeInventoryItem,
      getUserProject,
      toggleFavourite,
      isFavourite,
      getProjectStatus,
      getProjectProgressPercent,
      getCurrentStepIndex,
      startProject,
      setProjectStep,
      completeProject,
      resetProjectProgress,
      getProjectsWithStatus,
    }),
    [
      inventory,
      inventoryLoading,
      inventoryError,
      publishedProjects,
      projectsLoading,
      projectsError,
      userProjects,
      favouriteProjectIds,
      projectProgress,
      recentActivity,
      reloadInventory,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryQuantity,
      removeInventoryItem,
      getUserProject,
      toggleFavourite,
      isFavourite,
      getProjectStatus,
      getProjectProgressPercent,
      getCurrentStepIndex,
      startProject,
      setProjectStep,
      completeProject,
      resetProjectProgress,
      getProjectsWithStatus,
    ],
  );

  return (
    <AtlasContext.Provider value={value}>
      {children}
      <Toast message={toastMessage} onHide={hideToast} />
    </AtlasContext.Provider>
  );
}

export function useAtlas() {
  const context = useContext(AtlasContext);
  if (!context) {
    throw new Error('useAtlas must be used within AtlasProvider');
  }
  return context;
}
