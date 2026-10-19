import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_BLE_RGB_CONNECTIONS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_CONNECTIONS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_CONNECTIONS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_CONNECTIONS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { buildPhysicalScene, wireBodyHits } from './physical-scene.ts'

const layouts = [ESP32_BLE_RGB_LAYOUT, MOTION_SENSOR_ALARM_LAYOUT, SERVO_PAN_TILT_CAMERA_LAYOUT, ESP32_WIFI_WEATHER_LAYOUT]

test('each physical scene draws its parts and keeps wires off component bodies', () => {
  for (const layout of layouts) {
    const scene = buildPhysicalScene(layout)
    assert.ok(scene)
    assert.ok(scene.width > 340)
    assert.ok(scene.height > 200)
    assert.ok(scene.wires.length >= (layout.physical?.jumpers.length ?? 0))
    assert.equal(wireBodyHits(scene).length, 0, `${layout.slug}: ${wireBodyHits(scene).join(', ')}`)
    for (const wire of scene.wires) {
      assert.equal(wire.d.startsWith('M '), true)
    }
  }
})

test('project 24 draws the DevKit, transistors, LED and both cathode jumpers', () => {
  const scene = buildPhysicalScene(ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS)
  assert.ok(scene)
  assert.equal(scene.parts.filter((part) => part.kind === 'npn').length, 3)
  assert.equal(scene.parts.filter((part) => part.kind === 'resistor').length, 6)
  assert.equal(scene.parts.some((part) => part.kind === 'rgb-led'), true)
  assert.equal(scene.parts.some((part) => part.kind === 'esp32'), true)
  assert.equal(scene.wires.some((wire) => wire.id === 'green-cathode'), true)
  assert.equal(scene.wires.some((wire) => wire.id === 'blue-cathode'), true)
  const devkit = scene.parts.find((part) => part.kind === 'esp32')
  assert.ok(devkit && devkit.kind === 'esp32')
  assert.deepEqual(
    devkit.pins.map((pin) => pin.label),
    ['5V', 'GND', 'IO25', 'IO26', 'IO27'],
  )
})

test('project 18 draws direct servo signal wires and keeps the two positive rails distinct', () => {
  const scene = buildPhysicalScene(SERVO_PAN_TILT_CAMERA_LAYOUT, SERVO_PAN_TILT_CAMERA_CONNECTIONS)
  assert.ok(scene)
  for (const id of ['pan-sig', 'tilt-sig', 'pan-vcc', 'tilt-vcc']) {
    const wire = scene.wires.find((item) => item.id === id)
    assert.ok(wire, id)
    assert.equal(wire.gender, 'male-male')
  }
  assert.equal(scene.board.leftPlus.includes('Uno') || scene.board.leftPlus.includes('5V'), true)
  assert.equal(scene.board.rightPlus.includes('PSU') || scene.board.rightPlus.includes('servo'), true)
  assert.equal(scene.board.leftPlus === scene.board.rightPlus, false)
  assert.equal(scene.parts.filter((part) => part.kind === 'servo').length, 2)
})

test('project 23 draws the STEMMA cable to the breadboard instead of plugging the module in', () => {
  const scene = buildPhysicalScene(ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS)
  assert.ok(scene)
  const sensor = scene.parts.find((part) => part.kind === 'bme280')
  assert.ok(sensor && sensor.kind === 'bme280')
  assert.equal(sensor.cable?.leads.length, 4)
  for (const port of ['vin', 'gnd', 'sdi', 'sck']) {
    assert.equal(scene.wires.some((wire) => wire.id === `bme280-${port}`), true)
  }
  assert.equal(scene.board.leftPlus.includes('3V3') || scene.board.rightPlus.includes('3V3'), true)
})

test('a focused step highlights the new wires and still keeps the other parts', () => {
  const scene = buildPhysicalScene(MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS.slice(0, 2))
  assert.ok(scene)
  assert.equal(scene.parts.length > 1, true)
  assert.equal(scene.wires.some((wire) => wire.emphasis === 'context' || wire.emphasis === 'prior'), true)
  assert.equal(scene.wires.some((wire) => wire.emphasis === 'active'), true)
})
