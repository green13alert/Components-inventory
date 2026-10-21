import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  applyJoystickFrame,
  axisDegreesPerSecond,
  JOYSTICK_MAX_DEG_PER_SEC,
  type AimState,
  type JoystickFrameInput,
} from './servo-joystick.ts'

const PAN = { min: 20, max: 160, center: 90 }
const TILT = { min: 20, max: 160, center: 90 }
const DEADZONE = 40
const CENTER = 512

function frame(overrides: Partial<JoystickFrameInput> = {}): JoystickFrameInput {
  return {
    x: CENTER,
    y: CENTER,
    switchClosed: false,
    xCenter: CENTER,
    yCenter: CENTER,
    deadzone: DEADZONE,
    invertX: false,
    invertY: false,
    dtSeconds: 0.02,
    pan: PAN,
    tilt: TILT,
    ...overrides,
  }
}

function aim(pan = 160, tilt = 160): AimState {
  return { pan, tilt }
}

test('a centred joystick and noise inside the deadzone do not move', () => {
  const held = aim(160, 40)
  assert.deepEqual(applyJoystickFrame(held, frame()), held)
  assert.deepEqual(applyJoystickFrame(held, frame({ x: CENTER + DEADZONE, y: CENTER - DEADZONE })), held)
  assert.equal(axisDegreesPerSecond(CENTER + DEADZONE, CENTER, DEADZONE, false), 0)
})

test('deflection just outside the deadzone moves slowly and does not jump toward centre', () => {
  const held = aim(100, 90)
  const next = applyJoystickFrame(held, frame({ x: CENTER + DEADZONE + 1, dtSeconds: 0.05 }))
  assert.equal(next.pan > 100, true)
  assert.equal(next.pan < 101, true)
  assert.equal(Math.abs(next.pan - 90) > 9, true)
  const rate = axisDegreesPerSecond(CENTER + DEADZONE + 1, CENTER, DEADZONE, false)
  assert.equal(rate > 0, true)
  assert.equal(rate < JOYSTICK_MAX_DEG_PER_SEC / 10, true)
})

test('full deflection moves at the configured maximum rate in either direction', () => {
  assert.equal(axisDegreesPerSecond(1023, CENTER, DEADZONE, false), JOYSTICK_MAX_DEG_PER_SEC)
  assert.equal(axisDegreesPerSecond(0, CENTER, DEADZONE, false), -JOYSTICK_MAX_DEG_PER_SEC)
  const up = applyJoystickFrame(aim(90, 90), frame({ x: 1023, y: 1023, dtSeconds: 0.1 }))
  const down = applyJoystickFrame(aim(90, 90), frame({ x: 0, y: 0, dtSeconds: 0.1 }))
  assert.equal(up.pan, 99)
  assert.equal(up.tilt, 99)
  assert.equal(down.pan, 81)
  assert.equal(down.tilt, 81)
})

test('releasing the joystick preserves the last angle and reversing direction is continuous', () => {
  const held = aim(130, 70)
  assert.deepEqual(applyJoystickFrame(held, frame({ x: CENTER, y: CENTER })), held)
  const forward = applyJoystickFrame(held, frame({ x: 1023, dtSeconds: 0.1 }))
  const back = applyJoystickFrame(forward, frame({ x: 0, dtSeconds: 0.1 }))
  assert.equal(forward.pan, 139)
  assert.equal(back.pan, 130)
  assert.equal(back.tilt, 70)
})

test('both axes stop at their limits and the switch returns both to centre', () => {
  const atLimit = applyJoystickFrame(aim(159, 21), frame({ x: 1023, y: 0, dtSeconds: 1 }))
  assert.equal(atLimit.pan, 160)
  assert.equal(atLimit.tilt, 20)
  const centred = applyJoystickFrame(atLimit, frame({ switchClosed: true, x: 1023, y: 0 }))
  assert.deepEqual(centred, { pan: 90, tilt: 90 })
})

test('update interval changes the step size in proportion to elapsed time', () => {
  const start = aim(90, 90)
  let stepped = start
  for (let i = 0; i < 5; i += 1) {
    stepped = applyJoystickFrame(stepped, frame({ x: 1023, y: CENTER, dtSeconds: 0.02 }))
  }
  const once = applyJoystickFrame(start, frame({ x: 1023, y: CENTER, dtSeconds: 0.1 }))
  assert.equal(Math.abs(stepped.pan - once.pan) < 0.001, true)
  assert.equal(Math.abs(stepped.pan - 99) < 0.001, true)
  const stalled = applyJoystickFrame(start, frame({ x: 1023, dtSeconds: 2 }))
  assert.equal(Math.abs(stalled.pan - 108) < 0.001, true)
})

test('inverting an axis reverses its rate without changing the other axis', () => {
  const normal = applyJoystickFrame(aim(90, 90), frame({ x: 1023, y: 1023, dtSeconds: 0.1 }))
  const reversed = applyJoystickFrame(aim(90, 90), frame({ x: 1023, y: 1023, dtSeconds: 0.1, invertX: true }))
  assert.equal(reversed.pan < 82, true)
  assert.equal(reversed.pan > 80, true)
  assert.equal(reversed.tilt, normal.tilt)
})
