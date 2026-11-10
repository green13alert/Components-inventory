import assert from 'node:assert/strict'
import { test } from 'node:test'

import { COMPONENT_CATALOGUE } from '../constants/component-catalogue.ts'
import { ESP32_BLE_RGB_BOM, ESP32_BLE_RGB_PROJECT, ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_STEPS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { SUPPORTING_NOTES } from '../constants/walkthroughs/supporting-notes.ts'
import { anchoredMarkerUpdate, scrollAnchorDelta } from './scroll-anchor.ts'

const mojibakeOhm = String.fromCharCode(0x00ce, 0x00a9)

test('clearing a selection below the anchor does not move the page', () => {
  assert.equal(scrollAnchorDelta(640, 640, false), 0)
})

test('content inserted above a component group is anchored, and expansion below is not', () => {
  assert.equal(scrollAnchorDelta(null, 420, false), 0)
  assert.equal(scrollAnchorDelta(420, 420, false), 0)
  assert.equal(scrollAnchorDelta(420, 508, false), 88)
  assert.equal(scrollAnchorDelta(508, 420, false), -88)
  assert.equal(scrollAnchorDelta(420, 508, true), 0)
})

test('an explanation above a diagram does not scroll the page', () => {
  const held = anchoredMarkerUpdate({
    previousScreenY: 420,
    nextScreenY: 508,
    userIsDragging: false,
    holdPosition: true,
  })
  assert.equal(held.delta, 0)
  assert.equal(held.expectedScreenY, 508)
  const closed = anchoredMarkerUpdate({
    previousScreenY: 508,
    nextScreenY: 420,
    userIsDragging: false,
    holdPosition: true,
  })
  assert.equal(closed.delta, 0)
  assert.equal(closed.expectedScreenY, 420)
  const panel = anchoredMarkerUpdate({
    previousScreenY: held.expectedScreenY,
    nextScreenY: held.expectedScreenY,
    userIsDragging: false,
    holdPosition: false,
  })
  assert.equal(panel.delta, 0)
})

test('authored tutorials do not store the ohm sign as two Latin-1 characters', () => {
  const shown = JSON.stringify({
    catalogue: COMPONENT_CATALOGUE,
    notes: SUPPORTING_NOTES,
    objectives: ESP32_BLE_RGB_PROJECT.learningObjectives,
    bom: ESP32_BLE_RGB_BOM,
    steps: [MOTION_SENSOR_ALARM_STEPS, SERVO_PAN_TILT_CAMERA_STEPS, ESP32_WIFI_WEATHER_STEPS, ESP32_BLE_RGB_STEPS],
  })
  assert.equal(shown.includes(mojibakeOhm), false)
  assert.equal(shown.includes('220 \u03a9'), true)
  assert.equal(shown.includes('1 k\u03a9'), true)
})
