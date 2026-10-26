import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_BLE_RGB_CONNECTIONS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { LED_MATRIX_MAZE_CONNECTIONS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { connectionReference, visibleConnectionEntries } from './connection-reference.ts'

const supply = ESP32_BLE_RGB_CONNECTIONS.slice(0, 6)
const red = ESP32_BLE_RGB_CONNECTIONS.slice(6, 10)
const blue = ESP32_BLE_RGB_CONNECTIONS.slice(14, 18)

test('the connection reference follows the netlist and hides later channels', () => {
  const entries = connectionReference(ESP32_BLE_RGB_LAYOUT, red, supply)
  assert.equal(entries.some((entry) => entry.title.includes('IO25') && entry.status === 'this-step' && entry.group === 'Red channel'), true)
  assert.equal(entries.some((entry) => entry.title.includes('IO27')), false)
  assert.equal(entries.some((entry) => entry.group === 'Power' && entry.status === 'installed'), true)
  assert.equal(entries.some((entry) => entry.group === 'Ground' && entry.status === 'installed'), true)
  const signal = entries.find((entry) => entry.title.includes('IO25'))
  assert.equal(signal?.detail.includes('Male-to-female'), true)
  assert.equal(blue.every((row) => entries.some((entry) => entry.title.includes(row.fromPin) && entry.title.includes(row.toPin))), false)
})

test('a seating step with no wires does not invent connections', () => {
  assert.deepEqual(connectionReference(ESP32_BLE_RGB_LAYOUT, [], []), [])
})

test('a direct maze signal maps to one jumper and an unlisted rail jumper is added', () => {
  const entries = connectionReference(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS, [])
  const clock = entries.find((entry) => entry.title.includes('CLK'))
  assert.deepEqual(clock?.wireIds, ['matrix-clk'])
  const power = entries.find((entry) => entry.title.includes('VCC'))
  assert.equal(power?.wireIds.includes('matrix-vcc'), true)
  assert.equal(power?.wireIds.includes('uno-5v'), true)
  const rails = visibleConnectionEntries(LED_MATRIX_MAZE_LAYOUT, [], [], ['uno-5v', 'uno-gnd'], ['uno-5v', 'uno-gnd'])
  assert.equal(rails.some((entry) => entry.wireIds.includes('uno-5v') && entry.status === 'this-step'), true)
  assert.equal(rails.some((entry) => entry.wireIds.includes('uno-gnd')), true)
  assert.equal(rails.some((entry) => entry.title.includes('CLK')), false)
})
