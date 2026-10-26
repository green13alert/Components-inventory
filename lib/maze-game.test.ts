import assert from 'node:assert/strict'
import { test } from 'node:test'

import { LED_MATRIX_MAZE_FIRMWARE } from '../constants/firmware/led-matrix-maze.ts'
import {
  BUTTON_DEBOUNCE_MS,
  cellRole,
  debouncePress,
  elapsedMs,
  GRID,
  isWall,
  JOY_CENTER,
  JOY_DEADZONE,
  LEVELS,
  LEVEL_COUNT,
  MOVE_ARM_MS,
  MOVE_REPEAT_MS,
  onGoal,
  solvable,
  stepHold,
  stickStep,
  tryMove,
} from './maze-game.ts'

test('every level has an open start and goal and a route between them', () => {
  assert.equal(LEVELS.length, LEVEL_COUNT)
  for (const level of LEVELS) {
    assert.equal(level.walls.length, GRID)
    for (const row of level.walls) {
      assert.equal(row.length, GRID)
    }
    assert.equal(isWall(level, level.start.x, level.start.y), false)
    assert.equal(isWall(level, level.goal.x, level.goal.y), false)
    assert.equal(level.start.x === level.goal.x && level.start.y === level.goal.y, false)
    assert.equal(solvable(level), true)
  }
})

test('walls and the grid edge block a step', () => {
  const level = LEVELS[0]
  const blocked = tryMove(level, { x: 1, y: 1 }, { x: -1, y: 0 })
  assert.deepEqual(blocked, { x: 1, y: 1 })
  const intoWall = tryMove(level, { x: 1, y: 1 }, { x: 0, y: -1 })
  assert.deepEqual(intoWall, { x: 1, y: 1 })
  const open = tryMove(level, { x: 1, y: 1 }, { x: 1, y: 0 })
  assert.deepEqual(open, { x: 2, y: 1 })
})

test('the deadzone holds and a centred stick does not move', () => {
  assert.deepEqual(stickStep(JOY_CENTER, JOY_CENTER), { x: 0, y: 0 })
  assert.deepEqual(stickStep(JOY_CENTER + JOY_DEADZONE, JOY_CENTER - JOY_DEADZONE), { x: 0, y: 0 })
  assert.deepEqual(stickStep(JOY_CENTER + JOY_DEADZONE + 1, JOY_CENTER), { x: 1, y: 0 })
  assert.deepEqual(stickStep(JOY_CENTER, JOY_CENTER - JOY_DEADZONE - 1), { x: 0, y: -1 })
})

test('an equal diagonal does not move and a stronger axis wins', () => {
  assert.deepEqual(stickStep(700, 700), { x: 0, y: 0 })
  assert.deepEqual(stickStep(800, 620), { x: 1, y: 0 })
  assert.deepEqual(stickStep(620, 200), { x: 0, y: -1 })
})

test('a held direction repeats only after the arm and the repeat interval', () => {
  const first = stepHold({ dx: 0, dy: 0, since: 0, last: 0 }, { x: 1, y: 0 }, 1000)
  assert.equal(first.moved, true)
  const early = stepHold(first.state, { x: 1, y: 0 }, 1000 + MOVE_ARM_MS - 1)
  assert.equal(early.moved, false)
  const armed = stepHold(first.state, { x: 1, y: 0 }, 1000 + MOVE_ARM_MS)
  assert.equal(armed.moved, true)
  const between = stepHold(armed.state, { x: 1, y: 0 }, armed.state.last + MOVE_REPEAT_MS - 1)
  assert.equal(between.moved, false)
  const again = stepHold(armed.state, { x: 1, y: 0 }, armed.state.last + MOVE_REPEAT_MS)
  assert.equal(again.moved, true)
  const released = stepHold(again.state, { x: 0, y: 0 }, again.state.last + 10)
  assert.equal(released.moved, false)
  const fresh = stepHold(released.state, { x: 0, y: 1 }, released.state.since + 5)
  assert.equal(fresh.moved, true)
})

test('the button restarts only after a debounced press', () => {
  const waiting = debouncePress({ rawDown: true, stableDown: false, changedAt: 1000, now: 1000 + BUTTON_DEBOUNCE_MS - 1 })
  assert.equal(waiting.pressed, false)
  assert.equal(waiting.stableDown, false)
  const pressed = debouncePress({ rawDown: true, stableDown: false, changedAt: 1000, now: 1000 + BUTTON_DEBOUNCE_MS })
  assert.equal(pressed.pressed, true)
  const held = debouncePress({ rawDown: true, stableDown: true, changedAt: pressed.changedAt, now: pressed.changedAt + 100 })
  assert.equal(held.pressed, false)
})

test('the goal advances levels and the last level finishes', () => {
  assert.deepEqual(onGoal(0), { phase: 'success', nextLevel: 1 })
  assert.deepEqual(onGoal(3), { phase: 'success', nextLevel: 4 })
  assert.deepEqual(onGoal(4), { phase: 'finished', nextLevel: 4 })
  const last = LEVELS[4]
  const arrived = tryMove(last, { x: last.goal.x, y: last.goal.y - 1 }, { x: 0, y: 1 })
  assert.deepEqual(arrived, last.goal)
})

test('the sketch times levels with unsigned millis subtraction', () => {
  assert.equal(LED_MATRIX_MAZE_FIRMWARE.includes('now - levelStarted'), true)
  assert.equal(LED_MATRIX_MAZE_FIRMWARE.includes('now - runStarted'), true)
  assert.equal(LED_MATRIX_MAZE_FIRMWARE.includes('now - successStarted'), true)
  assert.equal(LED_MATRIX_MAZE_FIRMWARE.includes('now - buttonChanged'), true)
  assert.equal(LED_MATRIX_MAZE_FIRMWARE.includes('now - holdSince'), true)
})

test('elapsed time uses unsigned millis subtraction across rollover', () => {
  assert.equal(elapsedMs(1000, 2500), 1500)
  assert.equal(elapsedMs(2500, 2500), 0)
  assert.equal(elapsedMs(0xfffffff0, 0x10), 0x20)
})

test('the player dot covers the goal and a wall stays lit', () => {
  const level = LEVELS[0]
  assert.equal(cellRole(level, level.start, 0, 0, 0), 'wall')
  assert.equal(cellRole(level, level.start, level.goal.x, level.goal.y, 0), 'goal')
  assert.equal(cellRole(level, level.goal, level.goal.x, level.goal.y, 0), 'player')
  assert.equal(cellRole(level, level.goal, level.goal.x, level.goal.y, 120), 'off')
  assert.equal(cellRole(level, level.start, 2, 1, 0), 'off')
})
