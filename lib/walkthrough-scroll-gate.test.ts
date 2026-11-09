import assert from 'node:assert/strict'
// The app tsconfig does not include Node types. The test runner still reads these files.
// @ts-expect-error node types are not part of the Expo typecheck
import { readFileSync } from 'fs'
import { test } from 'node:test'

import { completionStepForWalkthrough } from './build-activity.ts'
import {
  initialStepScrollGate,
  stepAdvanceLocked,
  updateStepScrollGate,
} from './walkthrough-scroll-gate.ts'

const VIEWPORT = 800

function gateFor(stepKey: string, metrics: { offsetY?: number; instructionalHeight?: number }) {
  let gate = updateStepScrollGate(initialStepScrollGate(), stepKey, { viewportHeight: VIEWPORT })
  gate = updateStepScrollGate(gate, stepKey, { instructionalHeight: metrics.instructionalHeight ?? 0 })
  if (metrics.offsetY != null) {
    gate = updateStepScrollGate(gate, stepKey, { offsetY: metrics.offsetY })
  }
  return gate
}

test('a long step keeps Next locked until the bottom is reached', () => {
  const locked = gateFor('project:long', { instructionalHeight: 2000 })
  assert.equal(stepAdvanceLocked(locked, 'project:long'), true)

  const unlocked = updateStepScrollGate(locked, 'project:long', { offsetY: 1200 })
  assert.equal(stepAdvanceLocked(unlocked, 'project:long'), false)
  assert.equal(unlocked.unlockedByScroll, true)
})

test('a short step is unlocked when the content already fits', () => {
  const gate = gateFor('project:short', { instructionalHeight: 400 })
  assert.equal(stepAdvanceLocked(gate, 'project:short'), false)
  assert.equal(gate.unlockedByScroll, false)
})

test('changing steps resets the scroll lock', () => {
  const finished = gateFor('project:one', { instructionalHeight: 2000, offsetY: 1300 })
  assert.equal(stepAdvanceLocked(finished, 'project:one'), false)

  const nextStep = updateStepScrollGate(finished, 'project:two', {})
  assert.equal(stepAdvanceLocked(nextStep, 'project:two'), true)
  assert.equal(nextStep.offsetY, 0)
  assert.equal(nextStep.unlockedByScroll, false)

  const returned = updateStepScrollGate(nextStep, 'project:one', { instructionalHeight: 2000 })
  assert.equal(stepAdvanceLocked(returned, 'project:one'), true)
})

test('a short early measurement does not keep a longer step unlocked', () => {
  let gate = gateFor('project:long', { instructionalHeight: 100 })
  assert.equal(stepAdvanceLocked(gate, 'project:long'), false)

  gate = updateStepScrollGate(gate, 'project:long', { instructionalHeight: 2000 })
  assert.equal(stepAdvanceLocked(gate, 'project:long'), true)

  const staleOffset = updateStepScrollGate(initialStepScrollGate(), 'project:long', {
    viewportHeight: VIEWPORT,
    instructionalHeight: 2000,
    offsetY: 1500,
  })
  assert.equal(stepAdvanceLocked(staleOffset, 'project:long'), true)
})

test('Previous stays available and does not record a completion', () => {
  const locked = gateFor('project:long', { instructionalHeight: 2000 })
  assert.equal(stepAdvanceLocked(locked, 'project:long'), true)
  assert.equal(
    completionStepForWalkthrough({ action: 'previous', reviewing: false, stepIndex: 3, stepCount: 8 }),
    null,
  )
  const walkthrough = readFileSync('app/project/build/[id].tsx', 'utf8')
  assert.equal(
    walkthrough.includes("${session?.user.id ?? 'signed-out'}:${projectKey}:${stepNavigationKey}"),
    true,
  )
  const previous = walkthrough.slice(walkthrough.indexOf('const handlePrev'), walkthrough.indexOf('const handleNext'))
  assert.equal(previous.includes('stepAdvanceLocked'), false)
  assert.equal(previous.includes('recordStepCompletion'), false)
})

test('Finish Project stays locked until the last step is scrolled to the end', () => {
  const locked = gateFor('project:last', { instructionalHeight: 1800 })
  assert.equal(stepAdvanceLocked(locked, 'project:last'), true)
  assert.equal(
    stepAdvanceLocked(locked, 'project:last')
      ? null
      : completionStepForWalkthrough({ action: 'finish', reviewing: false, stepIndex: 7, stepCount: 8 }),
    null,
  )

  const unlocked = updateStepScrollGate(locked, 'project:last', { offsetY: 1000 })
  assert.equal(stepAdvanceLocked(unlocked, 'project:last'), false)
  assert.equal(
    completionStepForWalkthrough({ action: 'finish', reviewing: false, stepIndex: 7, stepCount: 8 }),
    7,
  )
})

test('repeated taps while locked do not record a step completion', () => {
  const locked = gateFor('project:long', { instructionalHeight: 2200 })
  const record = () =>
    stepAdvanceLocked(locked, 'project:long')
      ? null
      : completionStepForWalkthrough({ action: 'next', reviewing: false, stepIndex: 1, stepCount: 8 })
  assert.equal(record(), null)
  assert.equal(record(), null)

  const walkthrough = readFileSync('app/project/build/[id].tsx', 'utf8')
  const next = walkthrough.slice(walkthrough.indexOf('const handleNext'))
  assert.equal(next.indexOf('stepAdvanceLocked') < next.indexOf('recordStepCompletion'), true)
  assert.equal(next.includes('disabled={nextLocked || !footerControls.nextEnabled}'), true)
})

test('the completion insert and migration do not allow a client timestamp', () => {
  const completions = readFileSync('lib/step-completions.ts', 'utf8')
  const insertPayload = completions.slice(
    completions.indexOf('.insert('),
    completions.indexOf('.select(STEP_COMPLETION_SELECT)', completions.indexOf('.insert(')),
  )
  assert.equal(insertPayload.includes('user_id'), true)
  assert.equal(insertPayload.includes('project_id'), true)
  assert.equal(insertPayload.includes('step_index'), true)
  assert.equal(insertPayload.includes('completed_at'), false)
  assert.equal(/\bid\s*:/.test(insertPayload), false)

  const migration = readFileSync('supabase/migrations/20261109210000_user_project_step_completions.sql', 'utf8')
  assert.equal(migration.includes('grant insert (user_id, project_id, step_index)'), true)
  assert.equal(migration.includes('revoke insert (id, completed_at)'), true)
  assert.equal(migration.includes('grant select, insert on'), false)
  assert.equal(migration.includes('revoke update, delete on table'), true)
})
