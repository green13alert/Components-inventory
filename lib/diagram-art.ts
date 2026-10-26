/**
 * Vector marks for physical-diagram parts.
 * Coordinates stay inside the part box. Wiring anchors are drawn separately.
 */

export type ArtMark =
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill: string; stroke?: string; strokeWidth?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: string; stroke?: string; strokeWidth?: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number }
  | { kind: 'text'; x: number; y: number; text: string; fill: string; size: number; anchor?: 'start' | 'middle' | 'end' }

const PCB = '#00878F'
const PCB_DARK = '#066068'
const BLACK = '#111827'
const SILVER = '#D6D3D1'
const SHIELD = '#E7E5E4'
const GOLD = '#C4A35A'

function rect(x: number, y: number, width: number, height: number, fill: string, rx = 0, stroke?: string): ArtMark {
  return { kind: 'rect', x, y, width, height, rx, fill, stroke, strokeWidth: stroke ? 1.2 : undefined }
}

function circle(cx: number, cy: number, r: number, fill: string, stroke?: string): ArtMark {
  return { kind: 'circle', cx, cy, r, fill, stroke, strokeWidth: stroke ? 1 : undefined }
}

function text(x: number, y: number, value: string, fill: string, size: number, anchor: 'start' | 'middle' | 'end' = 'start'): ArtMark {
  return { kind: 'text', x, y, text: value, fill, size, anchor }
}

function holes(xs: number[], ys: number[], r = 3.2): ArtMark[] {
  return xs.flatMap((x) => ys.map((y) => circle(x, y, r, '#E7E5E4', '#78716C')))
}

export function moduleArt(kind: string, x: number, y: number, width: number, height: number): ArtMark[] {
  if (kind === 'uno') {
    return unoArt(x, y, width, height)
  }
  if (kind === 'esp32') {
    return esp32Art(x, y, width, height)
  }
  if (kind === 'led-matrix') {
    return matrixArt(x, y, width, height)
  }
  if (kind === 'joystick') {
    return joystickArt(x, y, width, height)
  }
  if (kind === 'bme280') {
    return bmeArt(x, y, width, height)
  }
  if (kind === 'servo') {
    return servoArt(x, y, width, height)
  }
  if (kind === 'psu') {
    return psuArt(x, y, width, height)
  }
  if (kind === 'pir') {
    return pirArt(x, y, width, height)
  }
  if (kind === 'buzzer') {
    return buzzerArt(x, y, width, height)
  }
  return [rect(x, y, width, height, '#334155', 8, BLACK)]
}

function unoArt(x: number, y: number, width: number, height: number): ArtMark[] {
  const pitch = 16
  const gap = 14
  const pin0 = y + 28
  const headerY = (index: number, gapAfter: number) => pin0 + index * pitch + (index > gapAfter ? gap : 0)
  const headerStrip = (side: 'power' | 'digital', start: number, end: number, gapAfter: number): ArtMark => {
    const top = headerY(start, gapAfter) - 7
    const bottom = headerY(end, gapAfter) + 7
    return rect(side === 'power' ? x + 8 : x + width - 22, top, 14, bottom - top, BLACK, 2)
  }
  const usbW = 40
  const usbX = x + width / 2 - 8
  const chipX = x + 48
  const chipY = y + 86
  const chipW = 72
  const chipH = 148
  return [
    rect(x, y, width, height, PCB, 8, PCB_DARK),
    ...holes([x + 12, x + width - 12], [y + 12, y + height - 12], 4.5),
    headerStrip('power', 0, 5, 5),
    headerStrip('power', 6, 13, 5),
    headerStrip('digital', 0, 9, 9),
    headerStrip('digital', 10, 17, 9),
    rect(chipX, chipY, chipW, chipH, '#1C1917', 2, '#44403C'),
    circle(chipX + chipW / 2, chipY, 6, PCB),
    ...Array.from({ length: 12 }, (_, index) => {
      const legY = chipY + 10 + index * 11
      return [
        { kind: 'line' as const, x1: chipX - 6, y1: legY, x2: chipX, y2: legY, stroke: SILVER, strokeWidth: 1.4 },
        { kind: 'line' as const, x1: chipX + chipW, y1: legY, x2: chipX + chipW + 6, y2: legY, stroke: SILVER, strokeWidth: 1.4 },
      ]
    }).flat(),
    text(chipX + chipW / 2, chipY + chipH / 2 + 4, '328P', '#E7E5E4', 12, 'middle'),
    rect(x + width / 2 - 18, y + height - 78, 36, 24, '#1C1917', 2),
    circle(x + width - 42, headerY(4, 9), 5, '#F59E0B', '#92400E'),
    circle(x + 36, y + height - 48, 4, '#15803D', '#14532D'),
    circle(x + width - 46, y + height - 48, 7, '#E7E5E4', '#57534E'),
    rect(x + 14, y + height - 22, 28, 16, BLACK, 4, '#44403C'),
    circle(x + 28, y + height - 14, 4.5, '#0C0A09'),
    rect(usbX, y + height - 22, usbW, 20, SILVER, 2, '#57534E'),
    rect(usbX + 8, y + height - 16, usbW - 16, 12, '#292524', 1),
    text(x + width / 2, y + 22, 'UNO', '#F8FAFC', 13, 'middle'),
  ]
}

function esp32Art(x: number, y: number, width: number, height: number): ArtMark[] {
  const moduleW = Math.min(78, width - 44)
  const moduleX = x + (width - moduleW) / 2
  const pin0 = y + 22
  const pinLast = pin0 + 18 * 16
  return [
    rect(x, y, width, height, '#18181B', 6, BLACK),
    rect(x + 8, pin0 - 8, 12, pinLast - pin0 + 16, BLACK, 2),
    rect(x + width - 20, pin0 - 8, 12, pinLast - pin0 + 16, BLACK, 2),
    rect(moduleX, y + 10, moduleW, 28, '#3F3F46', 2, '#A16207'),
    rect(moduleX + 8, y + 16, moduleW - 16, 4, '#C4A35A', 1),
    rect(moduleX + 14, y + 24, moduleW - 28, 4, '#C4A35A', 1),
    rect(moduleX, y + 40, moduleW, 96, SHIELD, 3, '#A8A29E'),
    text(x + width / 2, y + 96, 'ESP32', '#44403C', 12, 'middle'),
    rect(x + width / 2 - 16, y + height - 14, 32, 10, SILVER, 1, '#57534E'),
    rect(x + width / 2 - 8, y + height - 12, 16, 5, '#292524', 1),
    circle(x + 30, y + height - 36, 6, '#E7E5E4', '#57534E'),
    circle(x + width - 30, y + height - 36, 6, '#E7E5E4', '#57534E'),
    text(x + 30, y + height - 48, 'EN', '#E7E5E4', 9, 'middle'),
    text(x + width - 30, y + height - 48, 'BOOT', '#E7E5E4', 8, 'middle'),
  ]
}

function matrixArt(x: number, y: number, width: number, height: number): ArtMark[] {
  const labelBand = 16
  const grid = Math.min(width - 16, height - labelBand - 8)
  const cell = grid / 8
  const originX = x + (width - grid) / 2
  const originY = y + labelBand
  const dots: ArtMark[] = []
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      dots.push(circle(originX + column * cell + cell / 2, originY + row * cell + cell / 2, Math.max(2.2, cell * 0.28), '#EF4444', '#7F1D1D'))
    }
  }
  return [
    rect(x, y, width, height, '#14532D', 6, '#052E16'),
    rect(originX - 3, originY - 3, grid + 6, grid + 6, '#0C0A09', 4),
    ...dots,
    text(x + 8, y + 14, 'MAX7219', '#F8FAFC', 9),
  ]
}

function joystickArt(x: number, y: number, width: number, height: number): ArtMark[] {
  const cx = x + width * 0.42
  const cy = y + height * 0.46
  return [
    rect(x, y, width, height, BLACK, 4, '#27272A'),
    ...holes([x + 8, x + width - 8], [y + 8, y + height - 8], 3.4),
    circle(cx, cy, Math.min(width, height) * 0.22, '#27272A', '#A8A29E'),
    circle(cx, cy, Math.min(width, height) * 0.1, '#18181B'),
    circle(cx - 6, cy - 14, Math.min(width, height) * 0.16, '#3F3F46', '#D6D3D1'),
    circle(cx - 10, cy - 18, 3, '#A1A1AA'),
    text(x + 6, y + height - 8, 'KY-023', '#E7E5E4', 9),
  ]
}

function bmeArt(x: number, y: number, width: number, height: number): ArtMark[] {
  return [
    rect(x, y, width, height, '#1D4ED8', 8, '#1E3A8A'),
    rect(x + width * 0.38, y + 18, width * 0.4, height * 0.42, SHIELD, 6, '#A8A29E'),
    circle(x + width * 0.58, y + 18 + height * 0.21, 7, '#44403C'),
    rect(x + 6, y + 28, 16, height - 56, BLACK, 2),
    text(x + width / 2, y + height - 16, 'BME280', '#F8FAFC', 12, 'middle'),
    text(x + width / 2, y + height - 32, 'STEMMA QT', '#DBEAFE', 9, 'middle'),
  ]
}

function servoArt(x: number, y: number, width: number, height: number): ArtMark[] {
  return [
    rect(x + 16, y + 8, width - 24, height - 16, '#2563EB', 6, '#1E3A8A'),
    rect(x + 8, y + height / 2 - 8, 12, 16, '#1D4ED8', 2),
    rect(x + width - 14, y + height / 2 - 8, 12, 16, '#1D4ED8', 2),
    circle(x + width * 0.62, y + height / 2, 16, '#F8FAFC', '#57534E'),
    rect(x + width * 0.62 - 2, y + height / 2 - 14, 4, 12, '#1D4ED8', 1),
    text(x + 28, y + height / 2 + 4, 'SG90', '#F8FAFC', 11),
  ]
}

function psuArt(x: number, y: number, width: number, height: number): ArtMark[] {
  return [
    rect(x, y, width, height, '#1E293B', 6, BLACK),
    circle(x + width * 0.62, y + height / 2, 14, BLACK, GOLD),
    circle(x + width * 0.62, y + height / 2, 6, '#0C0A09'),
    text(x + 18, y + height / 2 + 4, '5 V', '#F8FAFC', 12),
  ]
}

function pirArt(x: number, y: number, width: number, height: number): ArtMark[] {
  const gutter = 22
  const radius = Math.max(12, Math.min(height * 0.42, (width - gutter) / 2))
  const cx = x + width - radius - 3
  const cy = y + height * 0.48
  return [
    rect(x, y, width, height, '#166534', 6, '#052E16'),
    circle(cx, cy, radius, '#F8FAFC', '#CBD5E1'),
    circle(cx, cy, radius * 0.68, '#F8FAFC', '#E2E8F0'),
    circle(cx, cy, radius * 0.4, '#F1F5F9', '#CBD5E1'),
    circle(cx - radius * 0.22, cy - radius * 0.24, Math.max(2, radius * 0.16), '#FFFFFF'),
  ]
}

function buzzerArt(x: number, y: number, width: number, height: number): ArtMark[] {
  const radius = Math.min(width, height) * 0.4
  const cx = x + width * 0.58
  const cy = y + height * 0.5
  return [
    rect(x, y, width, height, '#14532D', 4, '#052E16'),
    circle(cx, cy, radius, '#0C0A09', '#A8A29E'),
    circle(cx, cy, radius * 0.62, '#18181B', '#57534E'),
    circle(cx, cy, radius * 0.28, '#0C0A09'),
    text(x + width - 8, y + 12, '+', '#F8FAFC', 11, 'end'),
  ]
}
