import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { moduleArt } from '../lib/diagram-art.ts'
import { buildPhysicalScene } from '../lib/physical-scene.ts'
import { RESISTOR_COLORS, resistorColorCode } from '../lib/resistor-bands.ts'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'reviews', 'illustrations')
mkdirSync(out, { recursive: true })

function markSvg(mark) {
  if (mark.kind === 'rect') {
    return `<rect x="${mark.x}" y="${mark.y}" width="${mark.width}" height="${mark.height}" rx="${mark.rx ?? 0}" fill="${mark.fill}"${mark.stroke ? ` stroke="${mark.stroke}" stroke-width="${mark.strokeWidth ?? 1}"` : ''}/>`
  }
  if (mark.kind === 'circle') {
    return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}"${mark.stroke ? ` stroke="${mark.stroke}" stroke-width="${mark.strokeWidth ?? 1}"` : ''}/>`
  }
  if (mark.kind === 'line') {
    return `<line x1="${mark.x1}" y1="${mark.y1}" x2="${mark.x2}" y2="${mark.y2}" stroke="${mark.stroke}" stroke-width="${mark.strokeWidth}"/>`
  }
  return `<text x="${mark.x}" y="${mark.y}" fill="${mark.fill}" font-size="${mark.size}" font-family="sans-serif" font-weight="700" text-anchor="${mark.anchor ?? 'start'}">${mark.text}</text>`
}

function previousModule(part) {
  const fill = part.kind === 'uno' ? '#0F6E56' : part.kind === 'esp32' ? '#111827' : part.kind === 'led-matrix' ? '#052E16' : '#334155'
  const title = part.kind === 'uno' ? 'Arduino Uno' : part.kind === 'esp32' ? 'ESP32-DevKitC' : part.kind === 'led-matrix' ? 'FC-16' : part.label
  return `<rect x="${part.x}" y="${part.y}" width="${part.width}" height="${part.height}" rx="8" fill="${fill}" stroke="#0F172A"/>
    <text x="${part.x + 8}" y="${part.y + 16}" fill="#F8FAFC" font-size="11" font-family="sans-serif">${title}</text>`
}

function sceneSvg(layout, mode) {
  const scene = buildPhysicalScene(layout)
  const parts = scene.parts
    .map((part) => {
      if (part.kind === 'resistor') {
        const code = part.ohms == null ? null : resistorColorCode(part.ohms)
        const angle = (Math.atan2(part.b.y - part.a.y, part.b.x - part.a.x) * 180) / Math.PI
        const midX = (part.a.x + part.b.x) / 2
        const midY = (part.a.y + part.b.y) / 2
        const stripes = (code?.colors ?? [])
          .map((color, index) => `<rect x="${-18 + index * 8}" y="-5" width="3" height="10" fill="${RESISTOR_COLORS[color]}"/>`)
          .join('')
        return `<g transform="translate(${midX} ${midY}) rotate(${angle})"><rect x="-24" y="-5" width="48" height="10" rx="5" fill="#E7D3A8" stroke="#8C7348"/>${stripes}<text y="-8" text-anchor="middle" font-size="8" font-family="sans-serif">${part.label}</text></g>`
      }
      if (!('x' in part) && part.leads) {
        const top = Math.min(...part.leads.map((lead) => lead.at.y))
        const bottom = Math.max(...part.leads.map((lead) => lead.at.y))
        const x = part.leads[0].at.x + 12
        const height = Math.max(36, bottom - top + 16)
        const width = part.kind === 'led-matrix' ? 88 : part.kind === 'joystick' ? 72 : 58
        const box = { ...part, x, y: top - 8, width, height }
        const art = mode === 'previous' ? previousModule(box) : moduleArt(part.kind, x, top - 8, width, height).map(markSvg).join('')
        return art
      }
      if (!('x' in part)) {
        return ''
      }
      const art = mode === 'previous' ? previousModule(part) : moduleArt(part.kind, part.x, part.y, part.width, part.height).map(markSvg).join('')
      const pins = part.pins
        .map(
          (pin) =>
            `<circle cx="${pin.at.x}" cy="${pin.at.y}" r="3.2" fill="#F8FAFC" stroke="#0F172A"/>
             <text x="${pin.at.x + 6}" y="${pin.at.y + 3}" font-size="9" font-family="sans-serif">${pin.label}</text>`,
        )
        .join('')
      return art + pins
    })
    .join('')
  const wires = scene.wires.map((wire) => `<path d="${wire.d}" fill="none" stroke="${wire.color}" stroke-width="2.4" stroke-linecap="round"/>`).join('')
  const holes = scene.holes.map((hole) => `<circle cx="${hole.at.x}" cy="${hole.at.y}" r="${hole.radius}" fill="${hole.rail ? '#F8FAFC' : '#292524'}" opacity="0.45"/>`).join('')
  const board =
    scene.board.rows > 0
      ? `<rect x="${scene.board.x}" y="${scene.board.y}" width="${scene.board.width}" height="${scene.board.height}" rx="14" fill="#F7F4EE" stroke="#D6D3D1"/>${holes}`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}">
    <rect width="100%" height="100%" fill="#F8FAFC"/>${board}${wires}${parts}</svg>`
}

const projects = [
  [MOTION_SENSOR_ALARM_LAYOUT, 'project-8-motion'],
  [SERVO_PAN_TILT_CAMERA_LAYOUT, 'project-18-servo'],
  [ESP32_WIFI_WEATHER_LAYOUT, 'project-23-weather'],
  [ESP32_BLE_RGB_LAYOUT, 'project-24-rgb'],
  [LED_MATRIX_MAZE_LAYOUT, 'project-25-maze'],
]

for (const [layout, name] of projects) {
  writeFileSync(join(out, `${name}.svg`), sceneSvg(layout, 'current'))
  writeFileSync(join(out, `${name}-previous.svg`), sceneSvg(layout, 'previous'))
}

function resistorSvg(ohms, bands) {
  const code = resistorColorCode(ohms, { bands })
  const body = code.body === 'blue' ? '#1D4ED8' : '#E7D3A8'
  const stripes = code.colors
    .map((color, index) => `<rect x="${28 + index * 18}" y="18" width="8" height="28" fill="${RESISTOR_COLORS[color]}"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="64" viewBox="0 0 180 64">
    <line x1="8" y1="32" x2="24" y2="32" stroke="#94A3B8" stroke-width="3"/>
    <line x1="156" y1="32" x2="172" y2="32" stroke="#94A3B8" stroke-width="3"/>
    <rect x="24" y="18" width="132" height="28" rx="14" fill="${body}" stroke="#8C7348"/>
    ${stripes}
    <text x="90" y="58" text-anchor="middle" font-size="11" font-family="sans-serif">${ohms} Ω ${bands}-band</text>
  </svg>`
}

writeFileSync(join(out, 'resistor-220.svg'), resistorSvg(220, 4))
writeFileSync(join(out, 'resistor-1k.svg'), resistorSvg(1000, 4))
writeFileSync(join(out, 'resistor-1k-five-band.svg'), resistorSvg(1000, 5))
console.log(out)
