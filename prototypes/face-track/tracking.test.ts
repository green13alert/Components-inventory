import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  faceDegreesPerSecond,
  FRAME_WIDTH,
  MAX_DEG_PER_SEC,
  PAN_CENTER,
  PAN_MAX,
  PAN_MIN,
  selectFace,
  stepPan,
} from './tracking.ts'

const centered = { x: 140, width: 40, height: 50 }

test('a face inside the centre deadzone does not move the mount', () => {
  const rate = faceDegreesPerSecond({
    faces: [centered],
    frameWidth: FRAME_WIDTH,
    tracking: true,
    manual: 0,
  })
  assert.equal(rate, 0)
  let angle = 110
  for (let i = 0; i < 20; i += 1) {
    angle = stepPan(angle, rate, 0.05)
  }
  assert.equal(angle, 110)
})

test('a face just outside the deadzone creeps, and a face at the edge uses full speed', () => {
  const slow = faceDegreesPerSecond({
    faces: [{ x: 176, width: 20, height: 20 }],
    frameWidth: FRAME_WIDTH,
    tracking: true,
    manual: 0,
  })
  assert.equal(slow > 0, true)
  assert.equal(slow < MAX_DEG_PER_SEC / 5, true)
  const fast = faceDegreesPerSecond({
    faces: [{ x: 310, width: 20, height: 20 }],
    frameWidth: FRAME_WIDTH,
    tracking: true,
    manual: 0,
  })
  assert.equal(fast, MAX_DEG_PER_SEC)
  const held = 90
  const crept = stepPan(held, slow, 0.05)
  assert.equal(crept > held, true)
  assert.equal(crept < held + 1, true)
})

test('losing the face holds the angle and does not search', () => {
  const rate = faceDegreesPerSecond({
    faces: [],
    frameWidth: FRAME_WIDTH,
    tracking: true,
    manual: 1,
  })
  assert.equal(rate, 0)
  assert.equal(stepPan(70, rate, 1), 70)
})

test('two faces follow the larger one', () => {
  const chosen = selectFace(
    [
      { x: 0, width: 20, height: 20 },
      { x: 200, width: 80, height: 80 },
    ],
    FRAME_WIDTH,
  )
  assert.equal(chosen?.width, 80)
  const rate = faceDegreesPerSecond({
    faces: [
      { x: 0, width: 20, height: 20 },
      { x: 200, width: 80, height: 80 },
    ],
    frameWidth: FRAME_WIDTH,
    tracking: true,
    manual: 0,
  })
  assert.equal(rate > 0, true)
})

test('manual buttons move only while tracking is off, and travel stops at the limits', () => {
  assert.equal(
    faceDegreesPerSecond({ faces: [], frameWidth: FRAME_WIDTH, tracking: false, manual: -1 }),
    -MAX_DEG_PER_SEC,
  )
  assert.equal(
    faceDegreesPerSecond({ faces: [centered], frameWidth: FRAME_WIDTH, tracking: true, manual: -1 }),
    0,
  )
  assert.equal(stepPan(PAN_MAX - 1, MAX_DEG_PER_SEC, 1), PAN_MAX)
  assert.equal(stepPan(PAN_MIN + 1, -MAX_DEG_PER_SEC, 1), PAN_MIN)
  assert.equal(stepPan(PAN_CENTER, MAX_DEG_PER_SEC, 0.1), PAN_CENTER + 4)
  assert.ok(Math.abs(stepPan(PAN_CENTER, MAX_DEG_PER_SEC, 0.02) - (PAN_CENTER + 0.8)) < 0.001)
})
