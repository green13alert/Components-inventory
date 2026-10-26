/**
 * IEC 60062 resistor colour codes.
 *
 * Catalogue and walkthrough resistors do not store a manufacturer body colour.
 * A four-band ±5% code uses the usual beige carbon-film body.
 * A five-band ±1% code uses the usual blue metal-film body.
 * Those body colours are the common kit appearance, not a claim about every part.
 */

export const RESISTOR_COLORS = {
  black: '#111827',
  brown: '#92400E',
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#FACC15',
  green: '#15803D',
  blue: '#1D4ED8',
  violet: '#6D28D9',
  grey: '#6B7280',
  white: '#F8FAFC',
  gold: '#D4A017',
  silver: '#94A3B8',
} as const

export type ResistorColor = keyof typeof RESISTOR_COLORS

const DIGIT: readonly ResistorColor[] = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white']

const TOLERANCE: Record<string, ResistorColor> = {
  '0.01': 'brown',
  '0.02': 'red',
  '0.005': 'green',
  '0.0025': 'blue',
  '0.001': 'violet',
  '0.05': 'gold',
  '0.1': 'silver',
}

export type ResistorCode = {
  bands: 4 | 5
  colors: ResistorColor[]
  tolerance: number
  body: 'beige' | 'blue'
}

const NAMED_OHMS: Record<string, number> = {
  'resistor-100': 100,
  'resistor-220': 220,
  'resistor-330': 330,
  'resistor-470': 470,
  'resistor-1k': 1000,
  'resistor-2k2': 2200,
  'resistor-4k7': 4700,
  'resistor-10k': 10000,
  'resistor-47k': 47000,
  'resistor-100k': 100000,
}

export function resistorOhmsFromId(id: string | undefined): number | null {
  if (!id) {
    return null
  }
  return NAMED_OHMS[id] ?? null
}

function multiplier(exponent: number): ResistorColor | null {
  if (exponent === -2) {
    return 'silver'
  }
  if (exponent === -1) {
    return 'gold'
  }
  if (exponent >= 0 && exponent <= 9) {
    return DIGIT[exponent]
  }
  return null
}

function significant(ohms: number, digits: number) {
  if (!Number.isFinite(ohms) || ohms <= 0) {
    return null
  }
  const minimum = 10 ** (digits - 1)
  const maximum = 10 ** digits - 1
  for (let exponent = 9; exponent >= -2; exponent -= 1) {
    const scaled = ohms / 10 ** exponent
    const rounded = Math.round(scaled)
    if (rounded >= minimum && rounded <= maximum && Math.abs(scaled - rounded) < 1e-6) {
      return { value: rounded, exponent }
    }
  }
  return null
}

export function resistorColorCode(ohms: number, options?: { bands?: 4 | 5; tolerance?: number }): ResistorCode | null {
  const bands = options?.bands ?? 4
  const tolerance = options?.tolerance ?? (bands === 5 ? 0.01 : 0.05)
  const toleranceColor = TOLERANCE[String(tolerance)]
  if (!toleranceColor) {
    return null
  }
  const encoded = significant(ohms, bands === 5 ? 3 : 2)
  if (!encoded) {
    return null
  }
  const multiplierColor = multiplier(encoded.exponent)
  if (!multiplierColor) {
    return null
  }
  const digits = String(encoded.value)
    .split('')
    .map((digit) => DIGIT[Number(digit)])
  return {
    bands,
    colors: [...digits, multiplierColor, toleranceColor],
    tolerance,
    body: bands === 5 ? 'blue' : 'beige',
  }
}
