import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { Toast } from '@/components/ui/toast';
import { MOCK_INVENTORY, type InventoryComponent } from '@/constants/inventory';
import { INITIAL_FAVOURITE_PROJECT_IDS, MOCK_PROJECTS, type Project, type ProjectStatus } from '@/constants/projects-data';
import { getStepCount } from '@/constants/projects-data';

export type ProjectProgress = {
  currentStep: number;
  completed: boolean;
};

type AtlasContextValue = {
  inventory: InventoryComponent[];
  favouriteProjectIds: Set<string>;
  projectProgress: Record<string, ProjectProgress>;
  addInventoryItem: (item: Omit<InventoryComponent, 'id'>) => void;
  updateInventoryItem: (id: string, item: Omit<InventoryComponent, 'id'>) => void;
  updateInventoryQuantity: (id: string, quantity: number) => void;
  removeInventoryItem: (id: string) => void;
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

export function AtlasProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryComponent[]>(MOCK_INVENTORY);
  const [favouriteProjectIds, setFavouriteProjectIds] = useState<Set<string>>(buildInitialFavouriteIds);
  const [projectProgress, setProjectProgress] = useState<Record<string, ProjectProgress>>(
    buildInitialProgress,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hideToast = useCallback(() => setToastMessage(null), []);

  const addInventoryItem = useCallback((item: Omit<InventoryComponent, 'id'>) => {
    setInventory((prev) => [
      ...prev,
      { ...item, id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }, []);

  const updateInventoryItem = useCallback((id: string, item: Omit<InventoryComponent, 'id'>) => {
    setInventory((prev) =>
      prev.map((existing) => (existing.id === id ? { ...item, id } : existing)),
    );
  }, []);

  const updateInventoryQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeInventoryItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
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
    setProjectProgress((prev) => {
      if (prev[projectId]) return prev;
      return { ...prev, [projectId]: { currentStep: 0, completed: false } };
    });
  }, []);

  const setProjectStep = useCallback((projectId: string, stepIndex: number) => {
    setProjectProgress((prev) => ({
      ...prev,
      [projectId]: { currentStep: stepIndex, completed: false },
    }));
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
      favouriteProjectIds,
      projectProgress,
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
      favouriteProjectIds,
      projectProgress,
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
