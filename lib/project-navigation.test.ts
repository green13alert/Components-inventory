import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  PENDING_PROJECT_COVER_KEYS,
  applyWalkthroughSave,
  displayProjectCoverCaption,
  moveWalkthroughStep,
  projectCoverIsPending,
  resolveBuildDestination,
  resolveCatalogueProjectId,
  walkthroughButtonFlex,
  walkthroughFooterControls,
  walkthroughFooterPadding,
  walkthroughProgressPercent,
} from './project-navigation.ts'

const published = [
  { id: '11111111-1111-4111-8111-111111111111', slug: '11' },
  { id: '22222222-2222-4222-8222-222222222222', slug: '18' },
]

test('a project with steps opens the walkthrough without a second confirmation', () => {
  assert.equal(
    resolveBuildDestination({
      stepCount: 31,
      status: 'not_started',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'walkthrough',
  )
  assert.equal(
    resolveBuildDestination({
      stepCount: 8,
      status: 'in_progress',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'walkthrough',
  )
})

test('a project without steps stays on the coming-soon screen', () => {
  for (const status of ['not_started', 'in_progress', 'completed'] as const) {
    assert.equal(
      resolveBuildDestination({
        stepCount: 0,
        status,
        reviewingSteps: true,
        reviewingCode: true,
      }),
      'coming_soon',
    )
  }
})

test('a finished project opens its summary, step review, or code review', () => {
  assert.equal(
    resolveBuildDestination({
      stepCount: 24,
      status: 'completed',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'complete',
  )
  assert.equal(
    resolveBuildDestination({
      stepCount: 24,
      status: 'completed',
      reviewingSteps: true,
      reviewingCode: false,
    }),
    'review_steps',
  )
  assert.equal(
    resolveBuildDestination({
      stepCount: 24,
      status: 'completed',
      reviewingSteps: true,
      reviewingCode: true,
    }),
    'review_code',
  )
  assert.equal(
    resolveBuildDestination({
      stepCount: 24,
      status: 'in_progress',
      reviewingSteps: true,
      reviewingCode: false,
    }),
    'walkthrough',
  )
})

test('progress can target a loaded draft uuid and still resolves published slugs', () => {
  const draftId = '33333333-3333-4333-8333-333333333333'
  assert.equal(resolveCatalogueProjectId('11', published), published[0].id)
  assert.equal(resolveCatalogueProjectId(published[1].id, published), published[1].id)
  assert.equal(resolveCatalogueProjectId(draftId, published), draftId)
  assert.equal(resolveCatalogueProjectId('23', published), null)
  assert.equal(resolveCatalogueProjectId(draftId, published, [draftId]), draftId)
})

test('the Next button keeps a visible width in the footer row', () => {
  const row = walkthroughButtonFlex('row')
  const standalone = walkthroughButtonFlex('standalone')
  assert.equal(row.flexGrow, 1)
  assert.equal(row.minHeight >= 48, true)
  assert.equal(row.flexGrow === 0 && row.flexBasis === 0, false)
  assert.equal(standalone.flexGrow, 0)
  assert.equal(standalone.flexBasis, undefined)
  assert.equal(standalone.flexGrow === 0 && standalone.flexBasis === 0, false)
  assert.equal(walkthroughFooterPadding(0), 16)
  assert.equal(walkthroughFooterPadding(34), 34)
})

test('Next, Previous and Finish follow the visible step', () => {
  const first = walkthroughFooterControls({ stepIndex: 0, stepCount: 31, reviewing: false })
  assert.equal(first.previousEnabled, false)
  assert.equal(first.nextEnabled, true)
  assert.equal(first.nextLabel, 'Next Step')

  let step = 0
  step = moveWalkthroughStep(step, 1, 31)
  step = moveWalkthroughStep(step, 1, 31)
  assert.equal(step, 2)
  const middle = walkthroughFooterControls({ stepIndex: step, stepCount: 31, reviewing: false })
  assert.equal(middle.previousEnabled, true)
  assert.equal(middle.nextLabel, 'Next Step')
  assert.equal(moveWalkthroughStep(step, -1, 31), 1)

  assert.equal(moveWalkthroughStep(30, 1, 31), 30)
  assert.equal(
    walkthroughFooterControls({ stepIndex: 30, stepCount: 31, reviewing: false }).nextLabel,
    'Finish Project',
  )
  assert.equal(
    walkthroughFooterControls({ stepIndex: 7, stepCount: 8, reviewing: true }).nextLabel,
    'Done',
  )
  assert.equal(walkthroughProgressPercent(0, 31), 3)
  assert.equal(walkthroughProgressPercent(1, 31), 6)
  assert.equal(walkthroughProgressPercent(30, 31, true), 100)
})

test('a failed save keeps the open step and the last confirmed step', () => {
  const draftId = '33333333-3333-4333-8333-333333333333'
  assert.equal(resolveCatalogueProjectId(draftId, published), draftId)
  assert.equal(resolveCatalogueProjectId('18', published), published[1].id)
  const failed = applyWalkthroughSave({ displayedStep: 4, confirmedStep: 3, saved: false })
  assert.equal(failed.displayedStep, 4)
  assert.equal(failed.confirmedStep, 3)
  assert.equal(failed.notice, 'Progress was not saved. You can keep reading.')
  const saved = applyWalkthroughSave({ displayedStep: 4, confirmedStep: 3, saved: true })
  assert.equal(saved.confirmedStep, 4)
  assert.equal(saved.notice, null)
  assert.equal(
    resolveBuildDestination({
      stepCount: 24,
      status: 'in_progress',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'walkthrough',
  )
  assert.equal(
    resolveBuildDestination({
      stepCount: 0,
      status: 'in_progress',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'coming_soon',
  )
})

test('a stale diagram caption is not shown for a pending cover', () => {
  assert.equal(
    displayProjectCoverCaption('This drawing is the project cover, not a photograph of a finished build.'),
    'The workbench photograph is not in the app yet. The wiring diagram is the connection reference.',
  )
  assert.equal(
    displayProjectCoverCaption('The workbench photograph is not in the app yet. The wiring diagram is the connection reference.'),
    'The workbench photograph is not in the app yet. The wiring diagram is the connection reference.',
  )
})

test('the weather station cover uses its own photograph', () => {
  assert.equal(projectCoverIsPending('esp32WifiWeather'), false)
  assert.equal(projectCoverIsPending('blinkLed'), false)
  assert.equal(projectCoverIsPending('weatherStation'), false)
  assert.deepEqual([...PENDING_PROJECT_COVER_KEYS], [])
})
