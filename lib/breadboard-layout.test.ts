import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_BLE_RGB_CONNECTIONS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_CONNECTIONS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_CONNECTIONS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_CONNECTIONS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_CONNECTIONS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { jumperInventory, validatePhysicalLayout } from './breadboard-layout.ts'
import type { PhysicalLayout } from '../constants/wiring-diagrams/types.ts'

test('the four authored physical layouts match their netlists', () => {
  assert.deepEqual(validatePhysicalLayout(ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS), [])
  assert.deepEqual(validatePhysicalLayout(MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS), [])
  assert.deepEqual(validatePhysicalLayout(ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS), [])
  assert.deepEqual(validatePhysicalLayout(SERVO_PAN_TILT_CAMERA_LAYOUT, SERVO_PAN_TILT_CAMERA_CONNECTIONS), [])
  assert.deepEqual(validatePhysicalLayout(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS), [])
})

test('jumper counts distinguish gender and stay within the listed packs', () => {
  assert.deepEqual(jumperInventory(ESP32_BLE_RGB_LAYOUT.physical as PhysicalLayout), { maleMale: 8, maleFemale: 5 })
  assert.deepEqual(jumperInventory(MOTION_SENSOR_ALARM_LAYOUT.physical as PhysicalLayout), { maleMale: 10, maleFemale: 0 })
  assert.deepEqual(jumperInventory(ESP32_WIFI_WEATHER_LAYOUT.physical as PhysicalLayout), { maleMale: 0, maleFemale: 0 })
  assert.deepEqual(jumperInventory(SERVO_PAN_TILT_CAMERA_LAYOUT.physical as PhysicalLayout), { maleMale: 14, maleFemale: 0 })
  assert.deepEqual(jumperInventory(LED_MATRIX_MAZE_LAYOUT.physical as PhysicalLayout), { maleMale: 2, maleFemale: 10 })
})

test('a duplicated hole and a power short are rejected', () => {
  const physical = structuredClone(ESP32_BLE_RGB_LAYOUT.physical) as PhysicalLayout
  physical.leads.push({ elementId: 'led', portId: 'red', hole: { kind: 'strip', column: 'f', row: 6 } })
  const occupied = validatePhysicalLayout({ ...ESP32_BLE_RGB_LAYOUT, physical }, ESP32_BLE_RGB_CONNECTIONS)
  assert.equal(occupied.some((error) => error.includes('hole:f6')), true)

  const shorted = structuredClone(ESP32_BLE_RGB_LAYOUT.physical) as PhysicalLayout
  shorted.jumpers.push({
    id: 'short',
    gender: 'male-male',
    from: { kind: 'rail', side: 'left', polarity: 'plus', row: 3 },
    to: { kind: 'rail', side: 'left', polarity: 'minus', row: 3 },
  })
  const bridged = validatePhysicalLayout({ ...ESP32_BLE_RGB_LAYOUT, physical: shorted }, ESP32_BLE_RGB_CONNECTIONS)
  assert.equal(bridged.some((error) => error.includes('share one breadboard')), true)
})

test('a missing lead and an impossible resistor span are rejected', () => {
  const missing = structuredClone(ESP32_BLE_RGB_LAYOUT.physical) as PhysicalLayout
  missing.leads = missing.leads.filter((lead) => lead.elementId !== 'led' || lead.portId !== 'anode')
  const lost = validatePhysicalLayout({ ...ESP32_BLE_RGB_LAYOUT, physical: missing }, ESP32_BLE_RGB_CONNECTIONS)
  assert.equal(lost.some((error) => error.includes('Anode')), true)

  const stretched = structuredClone(ESP32_BLE_RGB_LAYOUT.physical) as PhysicalLayout
  const leg = stretched.leads.find((lead) => lead.elementId === 'base-red' && lead.portId === 'leg2')
  if (leg && leg.hole.kind === 'strip') {
    leg.hole = { kind: 'strip', column: 'b', row: 1 }
  }
  const span = validatePhysicalLayout({ ...ESP32_BLE_RGB_LAYOUT, physical: stretched }, ESP32_BLE_RGB_CONNECTIONS)
  assert.equal(span.some((error) => error.includes('1k red')), true)
})

test('a STEMMA wire that misses Vin is rejected', () => {
  const physical = structuredClone(ESP32_WIFI_WEATHER_LAYOUT.physical) as PhysicalLayout
  physical.jumpers = physical.jumpers.map((jumper) =>
    jumper.id === 'cable-vin'
      ? { ...jumper, to: { kind: 'module' as const, elementId: 'bme280', portId: 'sck' } }
      : jumper,
  )
  const errors = validatePhysicalLayout({ ...ESP32_WIFI_WEATHER_LAYOUT, physical }, ESP32_WIFI_WEATHER_CONNECTIONS)
  assert.equal(errors.some((error) => error.includes('Vin') || error.includes('3V3')), true)
})
