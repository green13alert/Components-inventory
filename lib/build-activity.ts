const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const BUILD_ACTIVITY_DAYS = 7

export const BUILD_ACTIVITY_UNAVAILABLE =
  "Build activity isn't available until the step-completion update is applied to the database."

export const BUILD_ACTIVITY_LOADING = 'Checking build history…'

export const BUILD_ACTIVITY_FAILED =
  "Build history couldn't be checked. Previous days aren't shown as zero."

export const BUILD_ACTIVITY_NONE = 'Your build activity will appear here as you complete tutorial steps.'

export type ProjectActivitySnapshot = {
  userId: string
  projectId: string
  startedAt: string | null
  currentStep: number
  completedAt: string | null
  updatedAt: string
}

/** One persisted first completion of a tutorial step. */
export type StepCompletionEvent = {
  id: string
  userId: string
  projectId: string
  stepIndex: number
  completedAt: string
}

export type BuildActivityDay = {
  dateKey: string
  label: string
  count: number
}

export type BuildActivityPlan =
  | { status: 'loading' }
  | { status: 'unavailable'; message: string }
  | { status: 'empty'; message: string; unit: 'steps'; days: BuildActivityDay[] }
  | { status: 'ready'; unit: 'steps'; days: BuildActivityDay[] }

export function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function lastSevenLocalDays(today: Date): BuildActivityDay[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days: BuildActivityDay[] = []
  for (let offset = BUILD_ACTIVITY_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(start)
    date.setDate(start.getDate() - offset)
    days.push({
      dateKey: localDateKey(date),
      label: WEEKDAY_LABELS[date.getDay()] ?? '',
      count: 0,
    })
  }
  return days
}

function snapshotsCannotSupplyDailyActivity(projects: readonly ProjectActivitySnapshot[]): void {
  for (const project of projects) {
    // A row only has the latest position and the timestamps of start, completion,
    // and the most recent edit. None of those is a per-step history.
    void project.currentStep
    void project.startedAt
    void project.completedAt
    void project.updatedAt
  }
}

function countStepCompletions(
  events: readonly StepCompletionEvent[],
  accountId: string,
  today: Date,
): BuildActivityDay[] {
  const days = lastSevenLocalDays(today)
  const indexByDate = new Map(days.map((day, index) => [day.dateKey, index]))
  const seenIds = new Set<string>()
  const seenSteps = new Set<string>()

  for (const event of events) {
    const stepKey = `${event.userId}:${event.projectId}:${event.stepIndex}`
    if (event.userId !== accountId || seenIds.has(event.id) || seenSteps.has(stepKey)) {
      continue
    }
    seenIds.add(event.id)
    seenSteps.add(stepKey)
    const completed = new Date(event.completedAt)
    if (Number.isNaN(completed.getTime())) {
      continue
    }
    const index = indexByDate.get(localDateKey(completed))
    if (index == null) {
      continue
    }
    const day = days[index]
    if (day) {
      day.count += 1
    }
  }

  return days
}

/**
 * Daily counts come only from step-completion events.
 * Project rows are rejected: current_step, started_at, completed_at, and updated_at
 * cannot be expanded into a trustworthy day.
 */
export function planBuildActivity(input: {
  accountId: string | null
  loadedAccountId: string | null
  loading: boolean
  failed: boolean
  confirmed: boolean
  projects: readonly ProjectActivitySnapshot[]
  stepEvents: readonly StepCompletionEvent[] | null
  today: Date
}): BuildActivityPlan {
  if (input.stepEvents == null) {
    snapshotsCannotSupplyDailyActivity(input.projects)
    return { status: 'unavailable', message: BUILD_ACTIVITY_UNAVAILABLE }
  }

  const accountMatches = input.accountId != null && input.loadedAccountId === input.accountId
  if (!accountMatches || (!input.confirmed && input.loading)) {
    return { status: 'loading' }
  }
  if (!input.confirmed && input.failed) {
    return { status: 'unavailable', message: BUILD_ACTIVITY_FAILED }
  }
  if (!input.confirmed) {
    return { status: 'loading' }
  }

  const days = countStepCompletions(input.stepEvents, input.accountId as string, input.today)
  if (days.every((day) => day.count === 0)) {
    return { status: 'empty', message: BUILD_ACTIVITY_NONE, unit: 'steps', days }
  }
  return { status: 'ready', unit: 'steps', days }
}

export type StepHistoryStatus = 'loading' | 'ready' | 'missing_table' | 'error'

/**
 * Next Step and Finish Project complete the step on screen.
 * Previous, review, opening a tutorial, and restoring a saved position do not.
 * Leaving a step does not mark every earlier step complete.
 */
export function completionStepForWalkthrough(input: {
  action: 'next' | 'previous' | 'finish' | 'open' | 'restore'
  reviewing: boolean
  stepIndex: number
  stepCount: number
}): number | null {
  if (input.reviewing || input.action === 'previous' || input.action === 'open' || input.action === 'restore') {
    return null
  }
  if (input.stepCount <= 0) {
    return null
  }
  const last = input.stepCount - 1
  const index = Math.min(Math.max(0, Math.floor(input.stepIndex)), last)
  if (input.action === 'next' && index >= last) {
    return null
  }
  return index
}

export function localCompletionWindow(today: Date): { start: Date; end: Date } {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (BUILD_ACTIVITY_DAYS - 1))
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  return { start, end }
}

/** UTC instants for the local seven-day window. The date prefix of a UTC timestamp is not used. */
export function completionQueryBounds(today: Date): { start: string; end: string } {
  const window = localCompletionWindow(today)
  return { start: window.start.toISOString(), end: window.end.toISOString() }
}

export function classifyCompletionFailure(error: {
  code?: string | null
  message?: string | null
}): 'missing_table' | 'duplicate' | 'failed' {
  const code = error.code ?? ''
  const message = (error.message ?? '').toLowerCase()
  if (code === '23505') {
    return 'duplicate'
  }
  if (code === '42P01' || code === 'PGRST205') {
    return 'missing_table'
  }
  if (
    message.includes('user_project_step_completions') &&
    (message.includes('schema cache') || message.includes('does not exist'))
  ) {
    return 'missing_table'
  }
  return 'failed'
}

export function rememberStepCompletion(
  events: readonly StepCompletionEvent[],
  event: StepCompletionEvent,
): StepCompletionEvent[] {
  const already = events.some(
    (existing) =>
      existing.id === event.id ||
      (existing.userId === event.userId &&
        existing.projectId === event.projectId &&
        existing.stepIndex === event.stepIndex),
  )
  if (already) {
    return [...events]
  }
  return [...events, event]
}

export function mergeStepCompletions(
  current: readonly StepCompletionEvent[],
  incoming: readonly StepCompletionEvent[],
  accountId: string,
): StepCompletionEvent[] {
  const merged = incoming.filter((event) => event.userId === accountId)
  for (const event of current) {
    if (event.userId !== accountId) {
      continue
    }
    if (merged.some((existing) => existing.projectId === event.projectId && existing.stepIndex === event.stepIndex)) {
      continue
    }
    merged.push(event)
  }
  return merged
}

export function shareCompletionRequest<T>(
  inflight: Map<string, Promise<T>>,
  key: string,
  start: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key)
  if (existing) {
    return existing
  }
  const task = start().finally(() => {
    if (inflight.get(key) === task) {
      inflight.delete(key)
    }
  })
  inflight.set(key, task)
  return task
}

export function presentBuildActivity(input: {
  accountId: string | null
  historyAccountId: string | null
  status: StepHistoryStatus
  events: readonly StepCompletionEvent[]
  today: Date
}): BuildActivityPlan {
  if (input.accountId == null) {
    return {
      status: 'empty',
      message: BUILD_ACTIVITY_NONE,
      unit: 'steps',
      days: lastSevenLocalDays(input.today),
    }
  }
  if (input.historyAccountId !== input.accountId || input.status === 'loading') {
    return { status: 'loading' }
  }
  if (input.status === 'missing_table') {
    return { status: 'unavailable', message: BUILD_ACTIVITY_UNAVAILABLE }
  }
  if (input.status === 'error') {
    return { status: 'unavailable', message: BUILD_ACTIVITY_FAILED }
  }
  return planBuildActivity({
    accountId: input.accountId,
    loadedAccountId: input.historyAccountId,
    loading: false,
    failed: false,
    confirmed: true,
    projects: [],
    stepEvents: input.events,
    today: input.today,
  })
}
