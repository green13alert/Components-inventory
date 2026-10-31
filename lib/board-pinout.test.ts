import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { buildPhysicalScene } from './physical-scene.ts'
import type { WiringLayout } from '../constants/wiring-diagrams/types.ts'

/**
 * A000066 full pinout, 6 Oct 2022, component side up.
 * That drawing has the USB at the top. These lists are the same drawing with
 * the USB at the bottom, so index 0 is the end away from the USB.
 * Digital is the left header. Power, including A0–A5, is the right header.
 * The extra gap is between D7 and D8, and between A0 and VIN.
 */
const UNO_DIGITAL = [
  'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
  'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'GND', 'AREF', 'SDA', 'SCL',
] as const
const UNO_POWER = [
  'A5', 'A4', 'A3', 'A2', 'A1', 'A0',
  'VIN', 'GND', 'GND', '5V', '3V3', 'RESET', 'IOREF', 'NC',
] as const

/**
 * ESP32-DevKitC V4 pin-layout figure, antenna at the top and USB at the bottom.
 * J2 is the left header. J3 is the right header. Index 0 is the antenna end.
 */
const DEVKIT_J2 = [
  '3V3', 'EN', 'VP', 'VN', 'IO34', 'IO35', 'IO32', 'IO33', 'IO25', 'IO26', 'IO27',
  'IO14', 'IO12', 'GND', 'IO13', 'D2', 'D3', 'CMD', '5V',
] as const
const DEVKIT_J3 = [
  'GND', 'IO23', 'IO22', 'TX', 'RX', 'IO21', 'GND', 'IO19', 'IO18', 'IO5',
  'IO17', 'IO16', 'IO4', 'IO0', 'IO2', 'IO15', 'D1', 'D0', 'CLK',
] as const

const PITCH = 16
const GAP = 14

type Point = { x: number; y: number }
type Header = 'digital' | 'power' | 'j2' | 'j3'

function board(layout: WiringLayout, id: string) {
  const scene = buildPhysicalScene(layout)
  const part = scene?.parts.find((item) => item.id === id)
  assert.ok(part && 'dots' in part && 'pins' in part)
  return part
}

function columns(dots: readonly Point[]) {
  const xs = [...new Set(dots.map((dot) => dot.x))].sort((a, b) => a - b)
  return xs.map((x) => dots.filter((dot) => dot.x === x).sort((a, b) => a.y - b.y))
}

function steps(column: readonly Point[]) {
  return column.slice(1).map((dot, index) => dot.y - column[index].y)
}

test('Uno sockets follow the A000066 drawing with the USB at the bottom', () => {
  const uno = board(LED_MATRIX_MAZE_LAYOUT, 'arduino')
  const [digital, power] = columns(uno.dots)
  assert.equal(digital.length, UNO_DIGITAL.length)
  assert.equal(power.length, UNO_POWER.length)
  assert.ok(digital[0].x < power[0].x)
  assert.deepEqual(steps(digital), [
    PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH + GAP,
    PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH,
  ])
  assert.deepEqual(steps(power), [
    PITCH, PITCH, PITCH, PITCH, PITCH, PITCH + GAP,
    PITCH, PITCH, PITCH, PITCH, PITCH, PITCH, PITCH,
  ])
  const seen = new Set(uno.dots.map((dot) => `${dot.x},${dot.y}`))
  assert.equal(seen.size, uno.dots.length)
})

test('DevKitC V4 sockets follow the Espressif pin-layout figure', () => {
  const devkit = board(ESP32_WIFI_WEATHER_LAYOUT, 'esp32')
  const [j2, j3] = columns(devkit.dots)
  assert.equal(j2.length, DEVKIT_J2.length)
  assert.equal(j3.length, DEVKIT_J3.length)
  assert.ok(j2[0].x < j3[0].x)
  assert.deepEqual(steps(j2), Array(DEVKIT_J2.length - 1).fill(PITCH))
  assert.deepEqual(steps(j3), Array(DEVKIT_J3.length - 1).fill(PITCH))
  const seen = new Set(devkit.dots.map((dot) => `${dot.x},${dot.y}`))
  assert.equal(seen.size, devkit.dots.length)
})

const PROJECT_PINS: { project: string; layout: WiringLayout; board: string; pins: Record<string, [Header, number]> }[] = [
  {
    project: '8',
    layout: MOTION_SENSOR_ALARM_LAYOUT,
    board: 'arduino',
    pins: { '5V': ['power', 9], GND: ['power', 8], D2: ['digital', 2], D8: ['digital', 8], D9: ['digital', 9] },
  },
  {
    project: '18',
    layout: SERVO_PAN_TILT_CAMERA_LAYOUT,
    board: 'arduino',
    pins: {
      '5V': ['power', 9], GND: ['power', 8], D2: ['digital', 2], D9: ['digital', 9], D10: ['digital', 10],
      A0: ['power', 5], A1: ['power', 4],
    },
  },
  {
    project: '23',
    layout: ESP32_WIFI_WEATHER_LAYOUT,
    board: 'esp32',
    pins: { '3V3': ['j2', 0], GND: ['j2', 13], IO22: ['j3', 2], IO21: ['j3', 5] },
  },
  {
    project: '24',
    layout: ESP32_BLE_RGB_LAYOUT,
    board: 'esp32',
    pins: { '5V': ['j2', 18], GND: ['j2', 13], IO25: ['j2', 8], IO26: ['j2', 9], IO27: ['j2', 10] },
  },
  {
    project: '25',
    layout: LED_MATRIX_MAZE_LAYOUT,
    board: 'arduino',
    pins: {
      '5V': ['power', 9], GND: ['power', 8], A0: ['power', 5], A1: ['power', 4],
      D13: ['digital', 13], D11: ['digital', 11], D10: ['digital', 10], D2: ['digital', 2],
    },
  },
]

function socket(header: Header, index: number, left: readonly Point[], right: readonly Point[]) {
  const column = header === 'digital' || header === 'j2' ? left : right
  const names = header === 'digital' ? UNO_DIGITAL : header === 'power' ? UNO_POWER : header === 'j2' ? DEVKIT_J2 : DEVKIT_J3
  const name = names[index]
  assert.ok(name)
  return { at: column[index], name }
}

test('project board pins land on the documented socket', () => {
  for (const project of PROJECT_PINS) {
    const part = board(project.layout, project.board)
    const [left, right] = columns(part.dots)
    const places = new Map<string, string>()
    for (const pin of part.pins) {
      const spec = project.pins[pin.label]
      assert.ok(spec, `${project.project} ${pin.label}`)
      const expected = socket(spec[0], spec[1], left, right)
      assert.equal(expected.name, pin.label, `${project.project} ${pin.label}`)
      assert.deepEqual(pin.at, expected.at, `${project.project} ${pin.label}`)
      const key = `${pin.at.x},${pin.at.y}`
      const previous = places.get(key)
      assert.equal(previous, undefined, `${project.project} ${previous} and ${pin.label} share a socket`)
      places.set(key, pin.label)
    }
  }
})
