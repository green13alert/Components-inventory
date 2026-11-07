import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAtlas } from '@/context/atlas-context';
import { useAuth } from '@/context/auth-context';
import {
  compatibilityForAccount,
  homeCoverageLabel,
  homeRecommendationPresentation,
  planHomeRecommendations,
  type RecommendationSkillLevel,
} from '@/lib/home-recommendations';
import { fetchSavedSkillLevel } from '@/lib/profile-skill-read';
import { discoveryCoverage } from '@/lib/project-discovery';
import {
  PROJECT_ERRORS,
  fetchProjectCompatibility,
  matchProjectInventory,
  type ProjectCompatibilityData,
} from '@/lib/projects';

export function useHomeRecommendations() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const {
    inventory,
    inventoryLoading,
    inventoryError,
    publishedProjects,
    projectsLoading,
    projectsError,
    getProjectsWithStatus,
    getUserProject,
    getCurrentStepIndex,
    reloadInventory,
  } = useAtlas();

  const [partsRefreshPending, setPartsRefreshPending] = useState(true);
  const [partsRefreshFailed, setPartsRefreshFailed] = useState(false);
  const [skillLevel, setSkillLevel] = useState<RecommendationSkillLevel | null>(null);
  const [skillAccountId, setSkillAccountId] = useState<string | null>(null);
  const [readyAccount, setReadyAccount] = useState<string | null>(null);
  const [inventoryAccount, setInventoryAccount] = useState<string | null>(null);
  const [storedCompatibility, setStoredCompatibility] = useState<{
    accountId: string;
    data: ProjectCompatibilityData | null;
    error: string | null;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // A settled check keeps its label. Resetting pending here paints
      // "Checking inventory…" until this silent refresh returns.
      void reloadInventory({ silent: true }).then((result) => {
        if (!active) {
          return;
        }
        setPartsRefreshPending(false);
        if (result.applied === false) {
          setPartsRefreshFailed(true);
          return;
        }
        setPartsRefreshFailed(result.error != null);
        if (result.error == null) {
          setInventoryAccount(userId);
        }
      });
      return () => {
        active = false;
      };
    }, [reloadInventory, userId]),
  );

  useEffect(() => {
    setInventoryAccount(null);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setReadyAccount(null);
      return;
    }
    if (!projectsLoading) {
      setReadyAccount(userId);
    }
  }, [projectsLoading, userId]);

  useEffect(() => {
    let cancelled = false;
    setSkillLevel(null);
    setSkillAccountId(userId);
    if (!userId) {
      return;
    }
    void fetchSavedSkillLevel().then((level) => {
      if (!cancelled) {
        setSkillLevel(level);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const projectIds = useMemo(() => publishedProjects.map((project) => project.id), [publishedProjects]);
  const inventoryComponentIds = useMemo(
    () => [...new Set(inventory.flatMap((item) => (item.componentId ? [item.componentId] : [])))].sort(),
    [inventory],
  );
  const projectIdsKey = projectIds.join(',');
  const inventoryComponentIdsKey = inventoryComponentIds.join(',');

  useEffect(() => {
    let cancelled = false;
    if (!userId || projectIds.length === 0) {
      return;
    }
    void fetchProjectCompatibility(projectIds, inventoryComponentIds).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.error || !result.data) {
        setStoredCompatibility({
          accountId: userId,
          data: null,
          error: result.error ?? PROJECT_ERRORS.generic,
        });
        return;
      }
      setStoredCompatibility({ accountId: userId, data: result.data, error: null });
    });
    return () => {
      cancelled = true;
    };
  }, [inventoryComponentIds, inventoryComponentIdsKey, projectIds, projectIdsKey, userId]);

  const compatibility = compatibilityForAccount(
    storedCompatibility ? { accountId: storedCompatibility.accountId, data: storedCompatibility.data } : null,
    userId,
  );
  const compatibilityError = compatibilityForAccount(
    storedCompatibility ? { accountId: storedCompatibility.accountId, data: storedCompatibility.error } : null,
    userId,
  );
  const activeSkill = skillAccountId === userId ? skillLevel : null;
  const catalogueReady = readyAccount === userId && !projectsLoading;

  const inventoryMatchesAccount = inventoryAccount === userId;
  const coverage = !inventoryMatchesAccount
    ? partsRefreshPending || inventoryLoading
      ? 'loading'
      : 'unavailable'
    : discoveryCoverage({
        inventoryLoading,
        refreshPending: partsRefreshPending,
        refreshFailed: partsRefreshFailed,
        inventoryError,
        compatibilityPending: projectIds.length > 0 && compatibility == null && compatibilityError == null,
        compatibilityError,
      });

  const model = useMemo(() => {
    const listed = catalogueReady ? getProjectsWithStatus() : [];
    const building = [...listed]
      .filter((project) => project.status === 'in_progress')
      .sort((left, right) => {
        const leftUpdated = getUserProject(left.id)?.updatedAt ?? '';
        const rightUpdated = getUserProject(right.id)?.updatedAt ?? '';
        return rightUpdated.localeCompare(leftUpdated);
      });
    const loaded = compatibilityError ? null : compatibility;
    const matches = new Map(
      listed.map((project) => [project.id, matchProjectInventory(project.bom, inventory, loaded)] as const),
    );
    const result = planHomeRecommendations({
      projects: listed,
      matches,
      coverage,
      skillLevel: activeSkill,
      continueProjectIds: new Set(building.map((project) => project.id)),
    });
    const partsById = new Map(
      result.recommendations.map((project) => {
        const match = matches.get(project.id) ?? matchProjectInventory([], [], null);
        return [project.id, homeCoverageLabel(match, coverage)] as const;
      }),
    );
    return {
      projects: listed,
      continueProjects: building,
      recommendations: result.recommendations,
      eligibleCount: result.eligible.length,
      partsById,
    };
  }, [
    activeSkill,
    catalogueReady,
    compatibility,
    compatibilityError,
    coverage,
    getProjectsWithStatus,
    getUserProject,
    inventory,
  ]);

  const presentation = homeRecommendationPresentation({
    projectsLoading: !catalogueReady,
    projectsError: catalogueReady ? projectsError : null,
    publishedCount: catalogueReady ? publishedProjects.length : 0,
    eligibleCount: model.eligibleCount,
    recommendationCount: model.recommendations.length,
  });

  return {
    inventory,
    projects: model.projects,
    continueProjects: model.continueProjects,
    recommendations: model.recommendations,
    partsById: model.partsById,
    presentation,
    getCurrentStepIndex,
  };
}
