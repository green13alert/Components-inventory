/**
 * Pure rules for the Arduino LED matrix maze.
 * The firmware in constants/firmware/led-matrix-maze.ts uses these same levels.
 * Row 0 is the top of the MD_MAX72XX FC16_HW grid. Column 0 is the left.
 */

export const GRID = 8
export const LEVEL_COUNT = 5
export const JOY_CENTER = 512
export const JOY_DEADZONE = 80
export const MOVE_ARM_MS = 280
export const MOVE_REPEAT_MS = 180
export const BUTTON_DEBOUNCE_MS = 40
export const SUCCESS_MS = 700
export const PLAYER_BLINK_MS = 240
export const GOAL_PERIOD_MS = 800
export const GOAL_ON_MS = 600

export type Cell = { x: number; y: number }

export type Level = {
  walls: number[][]
  start: Cell
  goal: Cell
}

const RAW_LEVELS: { rows: string[]; start: Cell; goal: Cell }[] = [
  {
    rows: ['########', '#S.....#', '#.####.#', '#......#', '#.####.#', '#......#', '#.....G#', '########'],
    start: { x: 1, y: 1 },
    goal: { x: 6, y: 6 },
  },
  {
    rows: ['########', '#S.....#', '#####..#', '#......#', '#.####.#', '#.#....#', '#.#..#G#', '########'],
    start: { x: 1, y: 1 },
    goal: { x: 6, y: 6 },
  },
  {
    rows: ['########', '#S#....#', '#.#.##.#', '#.#..#.#', '#.##.#.#', '#....#.#', '####.#G#', '########'],
    start: { x: 1, y: 1 },
    goal: { x: 6, y: 6 },
  },
  {
    rows: ['########', '#...#S.#', '#.#.#.##', '#.#.#..#', '#.#.##.#', '#.#....#', '#G####.#', '########'],
    start: { x: 5, y: 1 },
    goal: { x: 1, y: 6 },
  },
  {
    rows: ['########', '#S#.#..#', '#.#.#.##', '#...#..#', '###.##.#', '#....#.#', '#.##.G.#', '########'],
    start: { x: 1, y: 1 },
    goal: { x: 5, y: 6 },
  },
]

function parseLevel(raw: (typeof RAW_LEVELS)[number]): Level {
  const walls = raw.rows.map((row) =>
    row.split('').map((cell) => (cell === '#' ? 1 : 0)),
  )
  return { walls, start: raw.start, goal: raw.goal }
}

export const LEVELS: Level[] = RAW_LEVELS.map(parseLevel)

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < GRID && y < GRID
}

export function isWall(level: Level, x: number, y: number): boolean {
  return !inBounds(x, y) || level.walls[y][x] === 1
}

export function wallByte(level: Level, y: number): number {
  return level.walls[y].reduce((byte, wall, x) => byte | (wall ? 1 << x : 0), 0)
}

export function solvable(level: Level): boolean {
  if (isWall(level, level.start.x, level.start.y) || isWall(level, level.goal.x, level.goal.y)) {
    return false
  }
  const seen = new Set<string>([`${level.start.x},${level.start.y}`])
  const queue = [level.start]
  while (queue.length > 0) {
    const cell = queue.shift() as Cell
    if (cell.x === level.goal.x && cell.y === level.goal.y) {
      return true
    }
    for (const next of [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ]) {
      const key = `${next.x},${next.y}`
      if (seen.has(key) || isWall(level, next.x, next.y)) {
        continue
      }
      seen.add(key)
      queue.push(next)
    }
  }
  return false
}

export function axisDirection(raw: number, invert = false): -1 | 0 | 1 {
  const offset = raw - JOY_CENTER
  if (Math.abs(offset) <= JOY_DEADZONE) {
    return 0
  }
  const sign: -1 | 1 = offset > 0 ? 1 : -1
  return invert ? (sign === 1 ? -1 : 1) : sign
}

/** One axis only. An equal diagonal deflection does not move. */
export function stickStep(xRaw: number, yRaw: number, invertX = false, invertY = false): Cell {
  const dx = axisDirection(xRaw, invertX)
  const dy = axisDirection(yRaw, invertY)
  if (dx !== 0 && dy !== 0) {
    const xMag = Math.abs(xRaw - JOY_CENTER)
    const yMag = Math.abs(yRaw - JOY_CENTER)
    if (xMag === yMag) {
      return { x: 0, y: 0 }
    }
    if (xMag > yMag) {
      return { x: dx, y: 0 }
    }
    return { x: 0, y: dy }
  }
  return { x: dx, y: dy }
}

export function tryMove(level: Level, player: Cell, step: Cell): Cell {
  const next = { x: player.x + step.x, y: player.y + step.y }
  if (step.x === 0 && step.y === 0) {
    return player
  }
  if (isWall(level, next.x, next.y)) {
    return player
  }
  return next
}

export type HoldState = { dx: number; dy: number; since: number; last: number }

export function stepHold(
  state: HoldState,
  step: Cell,
  now: number,
): { state: HoldState; moved: boolean } {
  if (step.x === 0 && step.y === 0) {
    return { state: { dx: 0, dy: 0, since: now, last: state.last }, moved: false }
  }
  if (step.x !== state.dx || step.y !== state.dy) {
    return { state: { dx: step.x, dy: step.y, since: now, last: now }, moved: true }
  }
  if (now - state.since >= MOVE_ARM_MS && now - state.last >= MOVE_REPEAT_MS) {
    return { state: { ...state, last: now }, moved: true }
  }
  return { state, moved: false }
}

export function debouncePress(input: {
  rawDown: boolean
  stableDown: boolean
  changedAt: number
  now: number
}): { stableDown: boolean; changedAt: number; pressed: boolean } {
  if (input.rawDown === input.stableDown) {
    return { stableDown: input.stableDown, changedAt: input.now, pressed: false }
  }
  if (input.now - input.changedAt < BUTTON_DEBOUNCE_MS) {
    return { stableDown: input.stableDown, changedAt: input.changedAt, pressed: false }
  }
  return { stableDown: input.rawDown, changedAt: input.now, pressed: input.rawDown }
}

export type Phase = 'play' | 'success' | 'finished'

export function onGoal(levelIndex: number): { phase: Phase; nextLevel: number } {
  if (levelIndex >= LEVEL_COUNT - 1) {
    return { phase: 'finished', nextLevel: levelIndex }
  }
  return { phase: 'success', nextLevel: levelIndex + 1 }
}

/** Matches Arduino `unsigned long` subtraction, including a millis() rollover. */
export function elapsedMs(startedAt: number, now: number): number {
  return (Math.trunc(now) - Math.trunc(startedAt)) >>> 0
}

export type CellRole = 'off' | 'wall' | 'goal' | 'player'

/** Player covers the goal. The goal covers a wall. Empty cells stay off. */
export function cellRole(level: Level, player: Cell, x: number, y: number, now: number): CellRole {
  if (player.x === x && player.y === y) {
    return now % PLAYER_BLINK_MS < PLAYER_BLINK_MS / 2 ? 'player' : 'off'
  }
  if (level.goal.x === x && level.goal.y === y) {
    return now % GOAL_PERIOD_MS < GOAL_ON_MS ? 'goal' : 'off'
  }
  if (level.walls[y][x] === 1) {
    return 'wall'
  }
  return 'off'
}
