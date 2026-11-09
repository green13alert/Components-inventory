import assert from 'node:assert/strict'
// The app tsconfig does not include Node types. The test runner still reads the screen.
// @ts-expect-error node types are not part of the Expo typecheck
import { readFileSync } from 'fs'
import { test } from 'node:test'

import {
  BUILD_ACTIVITY_FAILED,
  BUILD_ACTIVITY_NONE,
  BUILD_ACTIVITY_UNAVAILABLE,
  classifyCompletionFailure,
  completionQueryBounds,
  completionStepForWalkthrough,
  lastSevenLocalDays,
  localDateKey,
  mergeStepCompletions,
  planBuildActivity,
  presentBuildActivity,
  rememberStepCompletion,
  shareCompletionRequest,
  type ProjectActivitySnapshot,
  type StepCompletionEvent,
} from './build-activity.ts'

const TODAY = new Date(2026, 10, 9, 15, 0, 0)

function snapshot(overrides: Partial<ProjectActivitySnapshot> = {}): ProjectActivitySnapshot {
  return {
    userId: 'me',
    projectId: 'project-1',
    startedAt: '2026-11-01T12:00:00.000Z',
    currentStep: 6,
    completedAt: null,
    updatedAt: '2026-11-09T18:00:00.000Z',
    ...overrides,
  }
}

function step(id: string, at: Date, overrides: Partial<StepCompletionEvent> = {}): StepCompletionEvent {
  return {
    id,
    userId: 'me',
    projectId: 'project-1',
    stepIndex: 1,
    completedAt: at.toISOString(),
    ...overrides,
  }
}

function plan(
  overrides: Partial<Parameters<typeof planBuildActivity>[0]> = {},
) {
  return planBuildActivity({
    accountId: 'me',
    loadedAccountId: 'me',
    loading: false,
    failed: false,
    confirmed: true,
    projects: [],
    stepEvents: [],
    today: TODAY,
    ...overrides,
  })
}

test('the visible week is the last seven local days including today', () => {
  const days = lastSevenLocalDays(TODAY)
  assert.equal(days.length, 7)
  assert.equal(days[0]?.dateKey, '2026-11-03')
  assert.equal(days[6]?.dateKey, '2026-11-09')
  assert.equal(days[6]?.label, 'Mon')
  const result = plan()
  assert.equal(result.status, 'empty')
  if (result.status !== 'empty') {
    return
  }
  assert.deepEqual(
    result.days.map((day) => day.dateKey),
    days.map((day) => day.dateKey),
  )
  assert.equal(result.unit, 'steps')
})

test('step completions group by the local calendar day', () => {
  const late = new Date(2026, 10, 9, 23, 30, 0)
  const nextMorning = new Date(2026, 10, 10, 0, 30, 0)
  const result = plan({
    today: new Date(2026, 10, 10, 12, 0, 0),
    stepEvents: [
      step('late', late, { stepIndex: 1 }),
      step('morning', nextMorning, { stepIndex: 2 }),
    ],
  })
  assert.equal(result.status, 'ready')
  if (result.status !== 'ready') {
    return
  }
  const count = (date: Date) => result.days.find((day) => day.dateKey === localDateKey(date))?.count
  assert.equal(count(late), 1)
  assert.equal(count(nextMorning), 1)
  assert.equal(localDateKey(late) === localDateKey(nextMorning), false)

  const utcEvening = new Date(Date.UTC(2026, 10, 9, 23, 30, 0))
  const utcResult = plan({
    today: new Date(utcEvening.getFullYear(), utcEvening.getMonth(), utcEvening.getDate(), 18, 0, 0),
    stepEvents: [step('utc', utcEvening, { stepIndex: 3 })],
  })
  assert.equal(utcResult.status, 'ready')
  if (utcResult.status !== 'ready') {
    return
  }
  const localKey = localDateKey(utcEvening)
  const utcKey = utcEvening.toISOString().slice(0, 10)
  assert.equal(utcResult.days.find((day) => day.dateKey === localKey)?.count, 1)
  if (utcKey !== localKey) {
    assert.equal(utcResult.days.some((day) => day.dateKey === utcKey && day.count > 0), false)
  }
})

test('a day with no completions stays at zero beside an active day', () => {
  const result = plan({
    stepEvents: [step('one', new Date(2026, 10, 9, 8, 0, 0), { stepIndex: 2 })],
  })
  assert.equal(result.status, 'ready')
  if (result.status !== 'ready') {
    return
  }
  assert.equal(result.days.find((day) => day.dateKey === '2026-11-09')?.count, 1)
  assert.equal(result.days.filter((day) => day.count === 0).length, 6)
})

test('several completions on the same day add up', () => {
  const result = plan({
    stepEvents: [
      step('a', new Date(2026, 10, 9, 9, 0, 0), { stepIndex: 1 }),
      step('b', new Date(2026, 10, 9, 12, 0, 0), { stepIndex: 2 }),
      step('c', new Date(2026, 10, 9, 18, 0, 0), { stepIndex: 3 }),
    ],
  })
  assert.equal(result.status, 'ready')
  if (result.status !== 'ready') {
    return
  }
  assert.equal(result.days.find((day) => day.dateKey === '2026-11-09')?.count, 3)
})

test('the same completion id is counted once', () => {
  const at = new Date(2026, 10, 9, 9, 0, 0)
  const result = plan({
    stepEvents: [
      step('same', at, { stepIndex: 4 }),
      step('same', at, { stepIndex: 4 }),
      step('other', new Date(2026, 10, 9, 10, 0, 0), { stepIndex: 5 }),
    ],
  })
  assert.equal(result.status, 'ready')
  if (result.status !== 'ready') {
    return
  }
  assert.equal(result.days.find((day) => day.dateKey === '2026-11-09')?.count, 2)
})

test('a confirmed week with no completions is an empty record, not fabricated levels', () => {
  const result = plan({ stepEvents: [] })
  assert.equal(result.status, 'empty')
  if (result.status !== 'empty') {
    return
  }
  assert.equal(result.message, BUILD_ACTIVITY_NONE)
  assert.equal(result.days.every((day) => day.count === 0), true)
})

test('loading and a failed request do not become a week of zeros', () => {
  const loading = plan({ stepEvents: [], confirmed: false, loading: true })
  assert.equal(loading.status, 'loading')
  assert.equal('days' in loading, false)

  const failed = plan({ stepEvents: [], confirmed: false, loading: false, failed: true })
  assert.equal(failed.status, 'unavailable')
  if (failed.status !== 'unavailable') {
    return
  }
  assert.equal(failed.message, BUILD_ACTIVITY_FAILED)
  assert.equal(failed.message.includes('zero'), true)

  const kept = plan({
    stepEvents: [step('kept', new Date(2026, 10, 8, 11, 0, 0), { stepIndex: 2 })],
    confirmed: true,
    loading: true,
    failed: true,
  })
  assert.equal(kept.status, 'ready')
  if (kept.status !== 'ready') {
    return
  }
  assert.equal(kept.days.find((day) => day.dateKey === '2026-11-08')?.count, 1)
})

test('a different account cannot display the previous account activity', () => {
  const events = [step('theirs', new Date(2026, 10, 9, 9, 0, 0), { userId: 'other', stepIndex: 1 })]
  const switching = plan({
    accountId: 'me',
    loadedAccountId: 'other',
    loading: true,
    stepEvents: events,
  })
  assert.equal(switching.status, 'loading')
  assert.equal('days' in switching, false)

  const settled = plan({
    accountId: 'me',
    loadedAccountId: 'me',
    stepEvents: events,
  })
  assert.equal(settled.status, 'empty')
  if (settled.status !== 'empty') {
    return
  }
  assert.equal(settled.days.every((day) => day.count === 0), true)
})

test('a progress change does not invent daily activity from the latest project row', () => {
  const before = plan({
    stepEvents: null,
    projects: [snapshot({ currentStep: 2, updatedAt: '2026-11-08T12:00:00.000Z' })],
  })
  const after = plan({
    stepEvents: null,
    projects: [snapshot({ currentStep: 7, updatedAt: '2026-11-09T20:00:00.000Z' })],
  })
  assert.equal(before.status, 'unavailable')
  assert.equal(after.status, 'unavailable')
  if (before.status !== 'unavailable' || after.status !== 'unavailable') {
    return
  }
  assert.equal(before.message, after.message)
  assert.equal(after.message, BUILD_ACTIVITY_UNAVAILABLE)
})

function recorded(id: string, stepIndex: number, at: Date, projectId = 'project-1', userId = 'me'): StepCompletionEvent {
  return {
    id,
    userId,
    projectId,
    stepIndex,
    completedAt: at.toISOString(),
  }
}

test('next and finish record only the step on screen', () => {
  assert.equal(
    completionStepForWalkthrough({ action: 'next', reviewing: false, stepIndex: 2, stepCount: 8 }),
    2,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'finish', reviewing: false, stepIndex: 7, stepCount: 8 }),
    7,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'next', reviewing: false, stepIndex: 7, stepCount: 8 }),
    null,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'previous', reviewing: false, stepIndex: 2, stepCount: 8 }),
    null,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'next', reviewing: true, stepIndex: 2, stepCount: 8 }),
    null,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'open', reviewing: false, stepIndex: 0, stepCount: 8 }),
    null,
  )
  assert.equal(
    completionStepForWalkthrough({ action: 'restore', reviewing: false, stepIndex: 4, stepCount: 8 }),
    null,
  )

  const walkthrough = readFileSync('app/project/build/[id].tsx', 'utf8')
  const previous = walkthrough.slice(walkthrough.indexOf('const handlePrev'), walkthrough.indexOf('const handleNext'))
  const next = walkthrough.slice(walkthrough.indexOf('const handleNext'))
  const opened = walkthrough.slice(
    walkthrough.indexOf('startAttemptedRef'),
    walkthrough.indexOf('stepCursorRef.current = currentStepIndex'),
  )
  assert.equal(previous.includes('recordStepCompletion'), false)
  assert.equal(opened.includes('recordStepCompletion'), false)
  assert.equal(next.indexOf('if (reviewMode)') < next.indexOf('recordStepCompletion'), true)
})

test('the same step is stored once across repeats, projects, and rapid taps', () => {
  const at = new Date(2026, 10, 9, 9, 0, 0)
  let events = rememberStepCompletion([], recorded('1', 0, at))
  events = rememberStepCompletion(events, recorded('2', 0, at))
  assert.equal(events.length, 1)
  events = rememberStepCompletion(events, recorded('3', 1, at))
  events = rememberStepCompletion(events, recorded('4', 0, at, 'project-2'))
  assert.equal(events.length, 3)

  const counted = plan({
    stepEvents: [recorded('a', 3, at), recorded('b', 3, at), recorded('c', 4, at)],
  })
  assert.equal(counted.status, 'ready')
  if (counted.status !== 'ready') {
    return
  }
  assert.equal(counted.days.find((day) => day.dateKey === '2026-11-09')?.count, 2)

  let starts = 0
  const inflight = new Map<string, Promise<string>>()
  const first = shareCompletionRequest(inflight, 'me:project-1:0', async () => {
    starts += 1
    return 'saved'
  })
  const second = shareCompletionRequest(inflight, 'me:project-1:0', async () => {
    starts += 1
    return 'again'
  })
  assert.equal(first, second)
  return first.then((value) => {
    assert.equal(value, 'saved')
    assert.equal(starts, 1)
  })
})

test('a failed write does not add a bar, and a saved write does', () => {
  const at = new Date(2026, 10, 9, 11, 0, 0)
  const existing = [recorded('kept', 1, at)]
  const failed = existing.slice()
  assert.equal(failed.length, 1)

  const saved = rememberStepCompletion(existing, recorded('new', 2, at))
  const shown = presentBuildActivity({
    accountId: 'me',
    historyAccountId: 'me',
    status: 'ready',
    events: saved,
    today: TODAY,
  })
  assert.equal(shown.status, 'ready')
  if (shown.status !== 'ready') {
    return
  }
  assert.equal(shown.days.find((day) => day.dateKey === '2026-11-09')?.count, 2)

  const staleFetch = mergeStepCompletions(saved, [recorded('kept', 1, at)], 'me')
  assert.equal(staleFetch.some((event) => event.stepIndex === 2), true)
  assert.equal(staleFetch.length, 2)
})

test('local query bounds follow calendar days rather than the UTC date', () => {
  const today = new Date(2026, 10, 9, 15, 0, 0)
  const bounds = completionQueryBounds(today)
  const firstMidnight = new Date(2026, 10, 3, 0, 0, 0, 0)
  const nextMidnight = new Date(2026, 10, 10, 0, 0, 0, 0)
  assert.equal(bounds.start, firstMidnight.toISOString())
  assert.equal(bounds.end, nextMidnight.toISOString())
  const justAfterMidnight = new Date(2026, 10, 9, 0, 5, 0)
  const justBeforeWindow = new Date(2026, 10, 2, 23, 59, 0)
  assert.equal(justAfterMidnight.toISOString() >= bounds.start && justAfterMidnight.toISOString() < bounds.end, true)
  assert.equal(justBeforeWindow.toISOString() < bounds.start, true)
  assert.equal(bounds.start === '2026-11-03T00:00:00.000Z', firstMidnight.getTimezoneOffset() === 0)
})

test('missing table, failed reads, and account changes do not become zero activity', () => {
  assert.equal(classifyCompletionFailure({ code: '23505' }), 'duplicate')
  assert.equal(classifyCompletionFailure({ code: 'PGRST205' }), 'missing_table')
  assert.equal(classifyCompletionFailure({ code: '42P01' }), 'missing_table')
  assert.equal(
    classifyCompletionFailure({ message: "Could not find the table 'public.user_project_step_completions' in the schema cache" }),
    'missing_table',
  )
  assert.equal(classifyCompletionFailure({ code: '08000', message: 'network down' }), 'failed')

  const missing = presentBuildActivity({
    accountId: 'me',
    historyAccountId: 'me',
    status: 'missing_table',
    events: [],
    today: TODAY,
  })
  assert.equal(missing.status, 'unavailable')
  if (missing.status === 'unavailable') {
    assert.equal(missing.message, BUILD_ACTIVITY_UNAVAILABLE)
    assert.equal('days' in missing, false)
  }

  const failed = presentBuildActivity({
    accountId: 'me',
    historyAccountId: 'me',
    status: 'error',
    events: [],
    today: TODAY,
  })
  assert.equal(failed.status, 'unavailable')
  if (failed.status === 'unavailable') {
    assert.equal(failed.message, BUILD_ACTIVITY_FAILED)
  }

  const switched = presentBuildActivity({
    accountId: 'me',
    historyAccountId: 'other',
    status: 'ready',
    events: [recorded('theirs', 1, new Date(2026, 10, 9, 9, 0, 0), 'project-1', 'other')],
    today: TODAY,
  })
  assert.equal(switched.status, 'loading')
  assert.equal('days' in switched, false)

  const none = presentBuildActivity({
    accountId: 'me',
    historyAccountId: 'me',
    status: 'ready',
    events: [],
    today: TODAY,
  })
  assert.equal(none.status, 'empty')
  if (none.status === 'empty') {
    assert.equal(none.message, BUILD_ACTIVITY_NONE)
  }
})

test('resetting a project does not delete completion events', () => {
  const events = [recorded('kept', 2, new Date(2026, 10, 8, 12, 0, 0))]
  const atlas = readFileSync('context/atlas-context.tsx', 'utf8')
  const reset = atlas.slice(atlas.indexOf('const resetProjectProgress'), atlas.indexOf('const favouriteProjectIds'))
  assert.equal(reset.includes('user_project_step_completions'), false)
  assert.equal(reset.includes('setStepCompletions'), false)
  assert.deepEqual(events.map((event) => event.id), ['kept'])
})

test('stored project rows are not historical step activity', () => {
  const result = plan({
    stepEvents: null,
    projects: [
      snapshot({
        startedAt: '2026-11-03T09:00:00.000Z',
        currentStep: 8,
        completedAt: '2026-11-09T18:00:00.000Z',
        updatedAt: '2026-11-09T18:00:00.000Z',
      }),
    ],
  })
  assert.equal(result.status, 'unavailable')
  if (result.status !== 'unavailable') {
    return
  }
  assert.equal(result.message, BUILD_ACTIVITY_UNAVAILABLE)
  assert.equal('days' in result, false)

  const screen = readFileSync('components/home/BuildActivityGraph.tsx', 'utf8')
  const home = readFileSync('app/(tabs)/index.tsx', 'utf8')
  const projects = readFileSync('lib/projects.ts', 'utf8')
  const walkthrough = readFileSync('app/project/build/[id].tsx', 'utf8')
  const completions = readFileSync('lib/step-completions.ts', 'utf8')
  assert.equal(screen.includes('createMockActivityByDate'), false)
  assert.equal(screen.includes('presentBuildActivity'), true)
  assert.equal(screen.includes('reloadStepCompletions({ silent: true })'), true)
  assert.equal(home.includes('createMockActivityByDate'), false)
  assert.equal(home.includes('<BuildActivitySection />'), true)
  assert.equal(projects.includes('user_project_step_completions'), false)
  assert.equal(walkthrough.includes('recordStepCompletion'), true)
  assert.equal(completions.includes('.delete('), false)
  const insertPayload = completions.slice(
    completions.indexOf('.insert('),
    completions.indexOf('.select(STEP_COMPLETION_SELECT)', completions.indexOf('.insert(')),
  )
  assert.equal(insertPayload.includes('completed_at'), false)
  assert.equal(/\bid\s*:/.test(insertPayload), false)

  const migration = readFileSync('supabase/migrations/20261109210000_user_project_step_completions.sql', 'utf8')
  assert.equal(migration.includes('unique (user_id, project_id, step_index)'), true)
  assert.equal(migration.includes('enable row level security'), true)
  assert.equal(migration.includes('for update'), false)
  assert.equal(migration.includes('for delete'), false)
  assert.equal(migration.toLowerCase().includes('update public.user_projects'), false)
})
