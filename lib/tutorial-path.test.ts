import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_STEPS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { SUPPORTING_NOTES } from '../constants/walkthroughs/supporting-notes.ts'
import type { AuthoredWalkthroughStep } from '../constants/walkthrough-content.ts'

const removed = [
  'How the Motion Sensor Works',
  'How Pan-Tilt Works',
  'Understand the Components',
  'What you will learn',
  'How the hardware and software work together',
  'What a successful build should do',
  'Understand each measurement',
  'How this I2C link works',
  'How the ESP32 hosts the page',
  'Ideas that are not part of this build',
  'Learn the breadboard before you insert a part',
  'Understand the breadboard before you place a part',
]

const walks: AuthoredWalkthroughStep[][] = [
  MOTION_SENSOR_ALARM_STEPS,
  SERVO_PAN_TILT_CAMERA_STEPS,
  ESP32_WIFI_WEATHER_STEPS,
  ESP32_BLE_RGB_STEPS,
]

test('the four walkthroughs stay contiguous and drop the standalone lessons', () => {
  for (const steps of walks) {
    steps.forEach((step, index) => {
      assert.equal(step.sortOrder, index)
      assert.equal(step.blocks.length > 0, true)
    })
    for (let index = 1; index < steps.length; index += 1) {
      assert.equal(steps[index].stageSortOrder >= steps[index - 1].stageSortOrder, true)
    }
    const titles = steps.map((step) => step.title)
    for (const title of removed) {
      assert.equal(titles.includes(title), false)
    }
  }
  assert.equal(MOTION_SENSOR_ALARM_STEPS.length, 17)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS.length, 22)
  assert.equal(ESP32_WIFI_WEATHER_STEPS.length, 25)
  assert.equal(ESP32_BLE_RGB_STEPS.length, 22)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS.some((step) => step.title === 'Understand Power and Pin Architecture'), true)
  assert.equal(ESP32_BLE_RGB_STEPS.some((step) => step.title.startsWith('Seat every part')), true)
  assert.equal(ESP32_BLE_RGB_STEPS.some((step) => step.title.startsWith('Follow one colour')), true)
})

test('removed lessons stay available as supporting notes, not as walkthrough steps', () => {
  assert.equal(SUPPORTING_NOTES['8'].some((note) => note.sourceTitle === 'How the Motion Sensor Works'), true)
  assert.equal(SUPPORTING_NOTES['18'].some((note) => note.sourceTitle === 'How Pan-Tilt Works'), true)
  assert.equal(SUPPORTING_NOTES['23'].some((note) => note.sourceTitle === 'How this I2C link works'), true)
  assert.equal(SUPPORTING_NOTES['24'].some((note) => note.sourceTitle === 'Learn the breadboard before you insert a part'), true)
  assert.equal(SUPPORTING_NOTES['24'].some((note) => /10\.5 mA/.test(note.body)), true)
  for (const notes of Object.values(SUPPORTING_NOTES)) {
    assert.equal(notes.every((note) => note.body.trim().length > 40), true)
  }
})
