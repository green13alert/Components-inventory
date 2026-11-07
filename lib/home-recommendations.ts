import type { ProjectInventoryMatch } from './compatibility.ts'
import { shownInRecommendations } from './catalogue-visibility.ts'
import {
  orderDiscoveryProjects,
  projectPartsSummary,
  type PartsCoverageState,
} from './project-discovery.ts'

export const HOME_RECOMMENDATION_LIMIT = 3

export const HOME_RECOMMENDATIONS_LOADING = 'Loading projects…'
export const HOME_RECOMMENDATIONS_NONE = 'No published projects to recommend yet.'
export const HOME_RECOMMENDATIONS_ALL_IN_PROGRESS = "You're already building every available project."

export type RecommendationSkillLevel = 'beginner' | 'intermediate' | 'advanced'

export type HomeRecommendationProject = {
  id: string
  slug: string
  isPublished: boolean
  difficulty: RecommendationSkillLevel
  status: 'not_started' | 'in_progress' | 'completed'
  sortOrder: number
}

export type HomeRecommendationPresentation =
  | { kind: 'loading'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'empty'; message: string }
  | { kind: 'list' }

/**
 * Saved skill levels are only the three onboarding values.
 * Anything else, including a missing profile, is treated as unknown.
 */
export function parseSavedSkillLevel(value: unknown): RecommendationSkillLevel | null {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value
  }
  return null
}

/** A failed or empty profile read does not invent a skill level. */
export function skillLevelFromProfileRead(result: {
  data: { skill_level: unknown } | null
  error: string | null
}): RecommendationSkillLevel | null {
  if (result.error || !result.data) {
    return null
  }
  return parseSavedSkillLevel(result.data.skill_level)
}

/** Compatibility loaded for one account is not applied to another. */
export function compatibilityForAccount<T>(
  stored: { accountId: string; data: T } | null,
  accountId: string | null,
): T | null {
  if (!stored || stored.accountId !== accountId) {
    return null
  }
  return stored.data
}

function byCatalogue<T extends HomeRecommendationProject>(projects: readonly T[]): T[] {
  return [...projects].sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id))
}

function inventoryTieKey(match: ProjectInventoryMatch | undefined): string {
  if (!match || match.lines.length === 0 || match.matchPercentage == null) {
    return 'unresolved'
  }
  return `${match.totalMissing}:${match.missingCount}`
}

function preferSkillLevel<T extends HomeRecommendationProject>(
  ordered: readonly T[],
  matches: ReadonlyMap<string, ProjectInventoryMatch>,
  skillLevel: RecommendationSkillLevel | null,
  coverage: PartsCoverageState,
): T[] {
  if (coverage !== 'ready' || !skillLevel) {
    return [...ordered]
  }
  return ordered
    .map((project, index) => ({ project, index }))
    .sort((left, right) => {
      const leftKey = inventoryTieKey(matches.get(left.project.id))
      const rightKey = inventoryTieKey(matches.get(right.project.id))
      if (leftKey !== rightKey) {
        return left.index - right.index
      }
      const leftSkill = left.project.difficulty === skillLevel ? 0 : 1
      const rightSkill = right.project.difficulty === skillLevel ? 0 : 1
      if (leftSkill !== rightSkill) {
        return leftSkill - rightSkill
      }
      return left.index - right.index
    })
    .map((item) => item.project)
}

function rankGroup<T extends HomeRecommendationProject>(
  projects: readonly T[],
  matches: ReadonlyMap<string, ProjectInventoryMatch>,
  coverage: PartsCoverageState,
  skillLevel: RecommendationSkillLevel | null,
): T[] {
  const ordered = orderDiscoveryProjects({
    projects,
    matches,
    coverage,
    canBuild: false,
    sort: 'fewest-missing',
  })
  return preferSkillLevel(ordered, matches, skillLevel, coverage)
}

/**
 * Unpublished and retired projects never enter the list.
 * Continue Building ids are removed. Completed projects follow unfinished ones.
 * Inventory order comes from `orderDiscoveryProjects`. Skill level only breaks
 * an equal coverage tie, and only once coverage is confirmed.
 */
export function planHomeRecommendations<T extends HomeRecommendationProject>(input: {
  projects: readonly T[]
  matches: ReadonlyMap<string, ProjectInventoryMatch>
  coverage: PartsCoverageState
  skillLevel: RecommendationSkillLevel | null
  continueProjectIds: ReadonlySet<string>
  limit?: number
}): { eligible: T[]; recommendations: T[] } {
  const seen = new Set<string>()
  const eligible: T[] = []
  for (const project of byCatalogue(input.projects)) {
    if (seen.has(project.id) || !project.isPublished || !shownInRecommendations(project.slug)) {
      continue
    }
    seen.add(project.id)
    eligible.push(project)
  }

  const candidates = eligible.filter((project) => !input.continueProjectIds.has(project.id))
  const unfinished = candidates.filter((project) => project.status !== 'completed')
  const completed = candidates.filter((project) => project.status === 'completed')
  const ranked = [
    ...rankGroup(unfinished, input.matches, input.coverage, input.skillLevel),
    ...rankGroup(completed, input.matches, input.coverage, input.skillLevel),
  ]
  const limit = input.limit ?? HOME_RECOMMENDATION_LIMIT
  return { eligible, recommendations: ranked.slice(0, limit) }
}

/** Same short summary the Projects cards render through `projectPartsSummary()`. */
export function homeCoverageLabel(match: ProjectInventoryMatch, coverage: PartsCoverageState): string {
  return projectPartsSummary(match, coverage)
}

export function homeRecommendationPresentation(input: {
  projectsLoading: boolean
  projectsError: string | null
  publishedCount: number
  eligibleCount: number
  recommendationCount: number
}): HomeRecommendationPresentation {
  if (input.projectsLoading) {
    return { kind: 'loading', message: HOME_RECOMMENDATIONS_LOADING }
  }
  if (input.projectsError && input.publishedCount === 0) {
    return { kind: 'error', message: input.projectsError }
  }
  if (input.recommendationCount > 0) {
    return { kind: 'list' }
  }
  if (input.eligibleCount > 0) {
    return { kind: 'empty', message: HOME_RECOMMENDATIONS_ALL_IN_PROGRESS }
  }
  return { kind: 'empty', message: HOME_RECOMMENDATIONS_NONE }
}
