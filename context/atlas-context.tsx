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
import { INITIAL_FAVOURITE_PROJECT_IDS, MOCK_PROJECTS, type Project, type ProjectStatus } from '@/constants/projects-data';
import { getStepCount } from '@/constants/projects-data';
import { useAuth } from '@/context/auth-context';
import {
  INVENTORY_ERRORS,
  addInventoryCatalogueItem,
  deleteInventoryItem,
  fetchInventory,
  setInventoryItemQuantity,
  updateInventoryCatalogueItem,
} from '@/lib/inventory';

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

type AtlasContextValue = {
  inventory: InventoryComponent[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  favouriteProjectIds: Set<string>;
  projectProgress: Record<string, ProjectProgress>;
  recentActivity: WorkshopActivity[];
  reloadInventory: (options?: { silent?: boolean }) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryComponent, 'id'>) => Promise<InventoryMutationResult>;
  updateInventoryItem: (id: string, item: Omit<InventoryComponent, 'id'>) => Promise<InventoryMutationResult>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<InventoryMutationResult>;
  removeInventoryItem: (id: string) => Promise<InventoryMutationResult>;
  toggleFavourite: (projectId: string) => void;
  isFavourite: (projectId: string) => boolean;
  getProjectStatus: (projectId: string) => ProjectStatus;
  getProjectProgressPercent: (projectId: string, difficulty: Project['difficulty']) => number;
  getCurrentStepIndex: (projectId: string) => number;
  startProject: (projectId: string) => void;
  setProjectStep: (projectId: string, stepIndex: number) => void;
  completeProject: (projectId: string) => void;
  getProjectsWithStatus: () => (Project & { status: ProjectStatus; progress?: number })[];
};

const AtlasContext = createContext<AtlasContextValue | null>(null);

function buildInitialFavouriteIds(): Set<string> {
  return new Set(INITIAL_FAVOURITE_PROJECT_IDS);
}

function buildInitialProgress(): Record<string, ProjectProgress> {
  const progress: Record<string, ProjectProgress> = {};

  for (const project of MOCK_PROJECTS) {
    if (project.status === 'completed') {
      progress[project.id] = { currentStep: getStepCount(project.difficulty) - 1, completed: true };
    } else if (project.status === 'in_progress') {
      const total = getStepCount(project.difficulty);
      const currentStep = Math.max(0, Math.round(((project.progress ?? 0) / 100) * total) - 1);
      progress[project.id] = { currentStep, completed: false };
    }
  }

  return progress;
}

const MAX_ACTIVITY = 20;

function buildInitialActivity(): WorkshopActivity[] {
  const events: WorkshopActivity[] = [];
  let createdAt = Date.now();

  for (const project of MOCK_PROJECTS) {
    if (project.status === 'in_progress') {
      const continued = (project.progress ?? 0) > 0;
      events.push({
        id: `activity-project-${project.id}`,
        kind: continued ? 'continued' : 'started',
        title: project.title,
        createdAt: createdAt--,
        projectId: project.id,
      });
    } else if (project.status === 'completed') {
      events.push({
        id: `activity-project-${project.id}`,
        kind: 'completed',
        title: project.title,
        createdAt: createdAt--,
        projectId: project.id,
      });
    }
  }

  return events;
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
  const [favouriteProjectIds, setFavouriteProjectIds] = useState<Set<string>>(buildInitialFavouriteIds);
  const [projectProgress, setProjectProgress] = useState<Record<string, ProjectProgress>>(
    buildInitialProgress,
  );
  const [recentActivity, setRecentActivity] = useState<WorkshopActivity[]>(buildInitialActivity);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hideToast = useCallback(() => setToastMessage(null), []);
  const userId = session?.user.id;
  const loadGeneration = useRef(0);

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

  useEffect(() => {
    void reloadInventory();
  }, [reloadInventory]);

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

  const toggleFavourite = useCallback((projectId: string) => {
    const adding = !favouriteProjectIds.has(projectId);
    setToastMessage(
      adding ? 'Project added to favourites' : 'Project removed from favourites',
    );
    setFavouriteProjectIds((prev) => {
      const next = new Set(prev);
      if (adding) {
        next.add(projectId);
      } else {
        next.delete(projectId);
      }
      return next;
    });
  }, [favouriteProjectIds]);

  const isFavourite = useCallback(
    (projectId: string) => favouriteProjectIds.has(projectId),
    [favouriteProjectIds],
  );

  const getProjectStatus = useCallback(
    (projectId: string): ProjectStatus => {
      const progress = projectProgress[projectId];
      if (progress?.completed) return 'completed';
      if (progress) return 'in_progress';
      return 'not_started';
    },
    [projectProgress],
  );

  const getProjectProgressPercent = useCallback(
    (projectId: string, difficulty: Project['difficulty']) => {
      const progress = projectProgress[projectId];
      if (!progress) return 0;
      if (progress.completed) return 100;
      const total = getStepCount(difficulty);
      return Math.round(((progress.currentStep + 1) / total) * 100);
    },
    [projectProgress],
  );

  const getCurrentStepIndex = useCallback(
    (projectId: string) => projectProgress[projectId]?.currentStep ?? 0,
    [projectProgress],
  );

  const startProject = useCallback((projectId: string) => {
    const project = MOCK_PROJECTS.find((item) => item.id === projectId);
    setProjectProgress((prev) => {
      if (prev[projectId]) return prev;
      if (project) {
        setRecentActivity((activity) =>
          prependActivity(activity, {
            id: `activity-project-${projectId}-${Date.now()}`,
            kind: 'started',
            title: project.title,
            createdAt: Date.now(),
            projectId,
          }),
        );
      }
      return { ...prev, [projectId]: { currentStep: 0, completed: false } };
    });
  }, []);

  const setProjectStep = useCallback((projectId: string, stepIndex: number) => {
    setProjectProgress((prev) => ({
      ...prev,
      [projectId]: { currentStep: stepIndex, completed: false },
    }));
    const project = MOCK_PROJECTS.find((item) => item.id === projectId);
    if (!project) return;
    setRecentActivity((prev) =>
      prependActivity(prev, {
        id: `activity-project-${projectId}-${Date.now()}`,
        kind: 'continued',
        title: project.title,
        createdAt: Date.now(),
        projectId,
      }),
    );
  }, []);

  const completeProject = useCallback((projectId: string) => {
    setProjectProgress((prev) => {
      const project = MOCK_PROJECTS.find((p) => p.id === projectId);
      const total = project ? getStepCount(project.difficulty) : 1;
      return {
        ...prev,
        [projectId]: { currentStep: total - 1, completed: true },
      };
    });
    const project = MOCK_PROJECTS.find((item) => item.id === projectId);
    if (!project) return;
    setRecentActivity((prev) =>
      prependActivity(prev, {
        id: `activity-project-${projectId}-completed`,
        kind: 'completed',
        title: project.title,
        createdAt: Date.now(),
        projectId,
      }),
    );
  }, []);

  const getProjectsWithStatus = useCallback(() => {
    return MOCK_PROJECTS.map((project) => {
      const status = getProjectStatus(project.id);
      const progress =
        status === 'in_progress' || status === 'completed'
          ? getProjectProgressPercent(project.id, project.difficulty)
          : undefined;
      return { ...project, status, progress };
    });
  }, [getProjectStatus, getProjectProgressPercent]);

  const value = useMemo(
    () => ({
      inventory,
      inventoryLoading,
      inventoryError,
      favouriteProjectIds,
      projectProgress,
      recentActivity,
      reloadInventory,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryQuantity,
      removeInventoryItem,
      toggleFavourite,
      isFavourite,
      getProjectStatus,
      getProjectProgressPercent,
      getCurrentStepIndex,
      startProject,
      setProjectStep,
      completeProject,
      getProjectsWithStatus,
    }),
    [
      inventory,
      inventoryLoading,
      inventoryError,
      favouriteProjectIds,
      projectProgress,
      recentActivity,
      reloadInventory,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryQuantity,
      removeInventoryItem,
      toggleFavourite,
      isFavourite,
      getProjectStatus,
      getProjectProgressPercent,
      getCurrentStepIndex,
      startProject,
      setProjectStep,
      completeProject,
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
