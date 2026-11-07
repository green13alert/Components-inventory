import { Spacing } from '../constants/tokens.ts'
import type { ProjectInventoryMatch } from './compatibility.ts'

export type DiscoveryProject = {
  title: string
  description: string
  isPublished: boolean
}

export type PartsCoverageState = 'ready' | 'loading' | 'unavailable'

export type DiscoverySort = 'default' | 'fewest-missing'

export type DiscoveryDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced'

export type ProjectStatusFilter = 'all' | 'in_progress' | 'favourites' | 'completed'

export type ProjectMenuId = 'status' | 'difficulty' | 'sort'

export type ProjectCatalogueFilters = {
  status: ProjectStatusFilter
  difficulty: DiscoveryDifficulty
  sort: DiscoverySort
}

export const PROJECT_STATUS_OPTIONS: { id: ProjectStatusFilter; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'completed', label: 'Completed' },
]

export const PROJECT_DIFFICULTY_OPTIONS: { id: DiscoveryDifficulty; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

export const PROJECT_SORT_OPTIONS: { id: DiscoverySort; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'fewest-missing', label: 'Fewest Missing Parts' },
]

export function initialProjectCatalogueFilters(): ProjectCatalogueFilters {
  return { status: 'all', difficulty: 'all', sort: 'default' }
}

export function selectProjectStatus(
  filters: ProjectCatalogueFilters,
  status: ProjectStatusFilter,
): ProjectCatalogueFilters {
  return { ...filters, status }
}

export function selectProjectDifficulty(
  filters: ProjectCatalogueFilters,
  difficulty: DiscoveryDifficulty,
): ProjectCatalogueFilters {
  return { ...filters, difficulty }
}

export function selectProjectSort(
  filters: ProjectCatalogueFilters,
  sort: DiscoverySort,
): ProjectCatalogueFilters {
  return { ...filters, sort }
}

/** Resets the three dropdowns. Search, inventory, favourites, and progress stay put. */
export function resetProjectCatalogueFilters(): ProjectCatalogueFilters {
  return initialProjectCatalogueFilters()
}

export function statusMenuLabel(status: ProjectStatusFilter): string {
  return PROJECT_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? 'All Statuses'
}

export function difficultyMenuLabel(difficulty: DiscoveryDifficulty): string {
  return PROJECT_DIFFICULTY_OPTIONS.find((option) => option.id === difficulty)?.label ?? 'All Levels'
}

export function sortMenuLabel(sort: DiscoverySort): string {
  return PROJECT_SORT_OPTIONS.find((option) => option.id === sort)?.label ?? 'Default'
}

const PROJECT_MENU_CONTROL_NAME: Record<ProjectMenuId, string> = {
  status: 'Status',
  difficulty: 'Level',
  sort: 'Sort',
}

/** Matches the closed control: horizontal padding, icon gap, and 14-point chevron. */
const PROJECT_MENU_CHROME = Spacing.sm * 2 + Spacing.xs + 14

const PROJECT_MENU_ABBREVIATIONS: readonly [string, string][] = [
  ['Fewest Missing', 'Fewest'],
  ['Intermediate', 'Intermed.'],
  ['In Progress', 'In Prog.'],
]

export type ProjectMenuButtonLayout = {
  menu: ProjectMenuId
  label: string
  width: number
  accessibilityLabel: string
  accent: false
  selected: boolean
}

function closedLabel(menu: ProjectMenuId, filters: ProjectCatalogueFilters): string {
  if (menu === 'status') {
    return filters.status === 'all' ? 'Status' : statusMenuLabel(filters.status)
  }
  if (menu === 'difficulty') {
    return filters.difficulty === 'all' ? 'Level' : difficultyMenuLabel(filters.difficulty)
  }
  return filters.sort === 'default' ? 'Sort' : 'Fewest Missing'
}

function fullMenuValue(menu: ProjectMenuId, filters: ProjectCatalogueFilters): string {
  if (menu === 'status') {
    return statusMenuLabel(filters.status)
  }
  if (menu === 'difficulty') {
    return difficultyMenuLabel(filters.difficulty)
  }
  return sortMenuLabel(filters.sort)
}

function menuTextWidth(text: string): number {
  let width = 0
  for (const char of text) {
    if (char === ' ') {
      width += 3.6
    } else if ('ijlt.'.includes(char)) {
      width += 3.8
    } else if (char === 'I') {
      width += 4.2
    } else if ('fr'.includes(char)) {
      width += 4.4
    } else if ('mw'.includes(char)) {
      width += 11
    } else if ('MW'.includes(char)) {
      width += 12
    } else if (char >= 'A' && char <= 'Z') {
      width += 8.4
    } else {
      width += 7.4
    }
  }
  return Math.ceil(width)
}

function labelsFit(labels: readonly string[], contentWidth: number): boolean {
  const text = labels.reduce((sum, label) => sum + menuTextWidth(label), 0)
  const gaps = Spacing.sm * (labels.length - 1)
  return text + PROJECT_MENU_CHROME * labels.length + gaps <= contentWidth
}

function fittedLabels(filters: ProjectCatalogueFilters, contentWidth: number): Record<ProjectMenuId, string> {
  const labels: Record<ProjectMenuId, string> = {
    status: closedLabel('status', filters),
    difficulty: closedLabel('difficulty', filters),
    sort: closedLabel('sort', filters),
  }
  for (const [full, short] of PROJECT_MENU_ABBREVIATIONS) {
    const current = [labels.status, labels.difficulty, labels.sort]
    if (labelsFit(current, contentWidth)) {
      break
    }
    if (labels.status === full) {
      labels.status = short
    }
    if (labels.difficulty === full) {
      labels.difficulty = short
    }
    if (labels.sort === full) {
      labels.sort = short
    }
  }
  return labels
}

function allocateMenuWidths(textWidths: readonly number[], contentWidth: number): number[] {
  const bases = textWidths.map((width) => width + PROJECT_MENU_CHROME)
  const gaps = Spacing.sm * (textWidths.length - 1)
  const extra = Math.max(0, contentWidth - gaps - bases.reduce((sum, width) => sum + width, 0))
  const weight = textWidths.reduce((sum, width) => sum + width, 0) || 1
  const widths = bases.map((base, index) => base + Math.floor((extra * textWidths[index]) / weight))
  const assigned = widths.reduce((sum, width) => sum + width, 0)
  widths[widths.length - 1] += contentWidth - gaps - assigned
  return widths
}

/** Closed labels, VoiceOver text, and widths for one row. Menus keep their full option names. */
export function projectMenuRowLayout(
  filters: ProjectCatalogueFilters,
  contentWidth: number,
): { buttons: ProjectMenuButtonLayout[] } {
  const labels = fittedLabels(filters, contentWidth)
  const order: ProjectMenuId[] = ['status', 'difficulty', 'sort']
  const widths = allocateMenuWidths(
    order.map((menu) => menuTextWidth(labels[menu])),
    contentWidth,
  )
  return {
    buttons: order.map((menu, index) => {
      const selected =
        menu === 'status'
          ? filters.status !== 'all'
          : menu === 'difficulty'
            ? filters.difficulty !== 'all'
            : filters.sort !== 'default'
      return {
        menu,
        label: labels[menu],
        width: widths[index],
        accessibilityLabel: `${PROJECT_MENU_CONTROL_NAME[menu]}, ${fullMenuValue(menu, filters)}`,
        accent: false,
        selected,
      }
    }),
  }
}

export function projectMenuAnchorsFromRow(input: {
  buttons: readonly { menu: ProjectMenuId; width: number }[]
  x: number
  y: number
  gap: number
  height: number
}): ProjectMenuAnchor[] {
  let cursor = input.x
  return input.buttons.map((button) => {
    const anchor = {
      menu: button.menu,
      x: cursor,
      y: input.y,
      width: button.width,
      height: input.height,
    }
    cursor += button.width + input.gap
    return anchor
  })
}

/** Closed controls stay neutral. `contentWidth` is the row inside the page padding. */
export function projectMenuButtonState(
  menu: ProjectMenuId,
  filters: ProjectCatalogueFilters,
  contentWidth = 350,
): ProjectMenuButtonLayout {
  const button = projectMenuRowLayout(filters, contentWidth).buttons.find((item) => item.menu === menu)
  if (!button) {
    throw new Error(`Missing ${menu} dropdown`)
  }
  return button
}

export type ProjectMenuAnchor = {
  menu: ProjectMenuId
  x: number
  y: number
  width: number
  height: number
}

/** Same control closes. A different control switches. There is no intermediate closed state. */
export function activateProjectMenu(open: ProjectMenuId | null, menu: ProjectMenuId): ProjectMenuId | null {
  return open === menu ? null : menu
}

/** The touch layer exists only while a menu is open, so a dismissed menu cannot catch the next tap. */
export function projectMenuOverlayMounted(open: ProjectMenuId | null): boolean {
  return open != null
}

export function projectMenuFromOverlayTap(
  open: ProjectMenuId | null,
  anchors: readonly ProjectMenuAnchor[],
  x: number,
  y: number,
): ProjectMenuId | null {
  const hit = anchors.find(
    (anchor) => x >= anchor.x && x < anchor.x + anchor.width && y >= anchor.y && y < anchor.y + anchor.height,
  )
  if (!hit) {
    return null
  }
  return activateProjectMenu(open, hit.menu)
}

export function projectMenusOfferCanBuild(): boolean {
  const labels = [...PROJECT_STATUS_OPTIONS, ...PROJECT_DIFFICULTY_OPTIONS, ...PROJECT_SORT_OPTIONS].map((option) =>
    `${option.id} ${option.label}`.toLowerCase(),
  )
  return labels.some((label) => label.includes('can build') || label.includes('can-build'))
}

export function projectMatchesStatus(input: {
  status: ProjectStatusFilter
  progress: 'not_started' | 'in_progress' | 'completed'
  isFavourite: boolean
}): boolean {
  if (input.status === 'all') {
    return true
  }
  if (input.status === 'in_progress') {
    return input.progress === 'in_progress'
  }
  if (input.status === 'favourites') {
    return input.isFavourite
  }
  return input.progress === 'completed'
}

export function projectMatchesDifficulty(
  selected: DiscoveryDifficulty,
  difficulty: Exclude<DiscoveryDifficulty, 'all'>,
): boolean {
  return selected === 'all' || selected === difficulty
}

export function projectCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'project' : 'projects'}`
}

export type ProjectListPresentation =
  | { kind: 'loading' }
  | { kind: 'list' }
  | { kind: 'error'; title: string; description: string }
  | { kind: 'empty'; title: string; description: string; resetFilters: boolean }

export function projectListPresentation(input: {
  projectsLoading: boolean
  projectsError: string | null
  catalogueCount: number
  visibleCount: number
  searchActive: boolean
  statusActive: boolean
  difficultyActive: boolean
}): ProjectListPresentation {
  if (input.projectsLoading && input.catalogueCount === 0) {
    return { kind: 'loading' }
  }
  if (input.visibleCount > 0) {
    return { kind: 'list' }
  }
  if (input.projectsError) {
    return { kind: 'error', title: 'Could not load projects', description: input.projectsError }
  }
  if (input.catalogueCount === 0) {
    return {
      kind: 'empty',
      title: 'No published projects',
      description: 'Published projects will appear here',
      resetFilters: false,
    }
  }
  const selectorsActive = input.statusActive || input.difficultyActive
  return {
    kind: 'empty',
    title: 'No matching projects',
    description: matchingProjectsDescription(input),
    resetFilters: selectorsActive,
  }
}

function matchingProjectsDescription(input: {
  searchActive: boolean
  statusActive: boolean
  difficultyActive: boolean
}): string {
  const selectors = input.statusActive || input.difficultyActive
  if (selectors && input.searchActive) {
    return 'Try changing your filters or search.'
  }
  if (input.statusActive && input.difficultyActive) {
    return 'Try another status or difficulty.'
  }
  if (input.statusActive) {
    return 'Try another project status.'
  }
  if (input.difficultyActive) {
    return 'Try another difficulty.'
  }
  if (input.searchActive) {
    return 'Try a different search.'
  }
  return 'Try changing your filters or search.'
}

/** The draft block is rendered only for an authorised development preview. */
export function draftPreviewSectionVisible(input: { requested: boolean; authorized: boolean }): boolean {
  return input.requested === true && input.authorized === true
}

/** Developer log only. The Projects screen does not render this string. */
export function draftPreviewDiagnostic(input: { userId: string | null; error: string | null }): string {
  const account = input.userId ?? 'unknown user'
  const reason = input.error ? `: ${input.error}` : ''
  return `Draft preview unavailable for ${account}${reason}. Authorised accounts are listed in public.draft_previewers.`
}

export type DiscoverySection<T> = {
  id: 'published' | 'drafts'
  projects: T[]
}

function matchesSearch<T extends DiscoveryProject>(project: T, query: string) {
  if (query.length === 0) {
    return true
  }
  return project.title.toLowerCase().includes(query) || project.description.toLowerCase().includes(query)
}

/**
 * Published projects are the catalogue. Development drafts stay in a later section
 * and never replace a published row. A search looks at both, with published matches first.
 */
export function discoverySections<T extends DiscoveryProject>(input: {
  published: readonly T[]
  drafts: readonly T[]
  search: string
  showDrafts: boolean
}): DiscoverySection<T>[] {
  const query = input.search.trim().toLowerCase()
  const sections: DiscoverySection<T>[] = [
    {
      id: 'published',
      projects: input.published.filter((project) => project.isPublished && matchesSearch(project, query)),
    },
  ]
  if (!input.showDrafts) {
    return sections
  }
  const drafts = input.drafts.filter((project) => !project.isPublished && matchesSearch(project, query))
  if (query.length === 0 || drafts.length > 0) {
    sections.push({ id: 'drafts', projects: drafts })
  }
  return sections
}

/**
 * Every listed BOM line is covered by an exact part or an approved direct
 * substitute, at the required quantity. Match percentage is not used: a rounded
 * 100% with an uncovered line does not qualify. An empty BOM does not qualify.
 * Loading or unavailable inventory and compatibility data do not qualify.
 * Hardware testing is not an input.
 */
export function listedComponentsAreOwned(
  match: ProjectInventoryMatch,
  coverage: PartsCoverageState,
): boolean {
  if (coverage !== 'ready' || match.lines.length === 0) {
    return false
  }
  return match.lines.every(
    (line) =>
      line.isOwned &&
      line.missingQuantity === 0 &&
      (line.coverage === 'exact' || line.coverage === 'direct_substitute'),
  )
}

export function projectPartsSummary(match: ProjectInventoryMatch, coverage: PartsCoverageState): string {
  if (coverage === 'loading') {
    return 'Checking inventory…'
  }
  if (coverage === 'unavailable') {
    return 'Parts check unavailable'
  }
  if (match.lines.length === 0) {
    return 'Components not yet defined'
  }
  if (listedComponentsAreOwned(match, coverage)) {
    return 'All listed components owned'
  }
  const units = match.totalMissing === 1 ? 'component' : 'components'
  const requirements = match.missingCount === 1 ? 'requirement' : 'requirements'
  return `Missing ${match.totalMissing} ${units} across ${match.missingCount} ${requirements}`
}

export function discoveryCoverage(input: {
  inventoryLoading: boolean
  refreshPending: boolean
  refreshFailed: boolean
  inventoryError: string | null
  compatibilityPending: boolean
  compatibilityError: string | null
}): PartsCoverageState {
  if (input.inventoryLoading || input.refreshPending || input.compatibilityPending) {
    return 'loading'
  }
  if (input.refreshFailed || input.inventoryError || input.compatibilityError) {
    return 'unavailable'
  }
  return 'ready'
}

function resolvedBom(match: ProjectInventoryMatch | undefined): match is ProjectInventoryMatch {
  return match != null && match.lines.length > 0 && match.matchPercentage != null
}

export function orderDiscoveryProjects<T extends { id: string }>(input: {
  projects: readonly T[]
  matches: ReadonlyMap<string, ProjectInventoryMatch>
  coverage: PartsCoverageState
  canBuild: boolean
  sort: DiscoverySort
}): T[] {
  const visible = input.canBuild
    ? input.projects.filter((project) => {
        const match = input.matches.get(project.id)
        return match != null && listedComponentsAreOwned(match, input.coverage)
      })
    : [...input.projects]

  if (input.sort !== 'fewest-missing' || input.coverage !== 'ready') {
    return [...visible]
  }

  const order = new Map(input.projects.map((project, index) => [project.id, index]))
  return [...visible].sort((left, right) => {
    const leftMatch = input.matches.get(left.id)
    const rightMatch = input.matches.get(right.id)
    const leftResolved = resolvedBom(leftMatch)
    const rightResolved = resolvedBom(rightMatch)
    if (leftResolved !== rightResolved) {
      return leftResolved ? -1 : 1
    }
    if (!leftResolved || !rightResolved) {
      return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0)
    }
    const byUnits = leftMatch.totalMissing - rightMatch.totalMissing
    if (byUnits !== 0) {
      return byUnits
    }
    const byLines = leftMatch.missingCount - rightMatch.missingCount
    if (byLines !== 0) {
      return byLines
    }
    return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0)
  })
}
