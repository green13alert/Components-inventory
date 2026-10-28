import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_PROJECT, ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_PROJECT, ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_PROJECT, LED_MATRIX_MAZE_STEPS } from '../constants/walkthroughs/led-matrix-maze.ts'
import {
  MOTION_SENSOR_ALARM_DESCRIPTION,
  MOTION_SENSOR_ALARM_OVERVIEW,
  MOTION_SENSOR_ALARM_STEPS,
} from '../constants/walkthroughs/motion-sensor-alarm.ts'
import {
  SERVO_PAN_TILT_CAMERA_DESCRIPTION,
  SERVO_PAN_TILT_CAMERA_OVERVIEW,
  SERVO_PAN_TILT_CAMERA_STEPS,
} from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { projectDetailIntro } from './project-navigation.ts'

function opening(text: string) {
  return text.slice(0, 48)
}

function blockTypes(step: { blocks: readonly { type: string }[] }) {
  return step.blocks.map((block) => block.type)
}

function stepText(step: { blocks: readonly { type: string; body?: string }[] }) {
  return step.blocks.map((block) => block.body ?? '').join('\n')
}

test('the detail page shows overview once', () => {
  const intro = projectDetailIntro({
    description: 'Short card line',
    overview: 'Build an alarm that notices when someone moves nearby.',
  })
  assert.equal(intro.overview.startsWith('Build an alarm'), true)
  assert.equal(Object.hasOwn(intro, 'lead'), false)
  assert.equal(
    projectDetailIntro({ description: 'Only the card line', overview: '   ' }).overview,
    'Only the card line',
  )
})

test('project overviews lead with the finished experience', () => {
  const overviews = [
    MOTION_SENSOR_ALARM_OVERVIEW,
    SERVO_PAN_TILT_CAMERA_OVERVIEW,
    ESP32_WIFI_WEATHER_PROJECT.overview,
    ESP32_BLE_RGB_PROJECT.overview,
    LED_MATRIX_MAZE_PROJECT.overview,
  ]
  for (const overview of overviews) {
    assert.equal(/^Build |^Aim |^See |^Guide |^Change /.test(overview), true)
    assert.equal(/PN2222A|FC-16|BME280|MAX7219|DevKitC/.test(opening(overview)), false)
    assert.equal(overview.length < 320, true)
  }
  assert.equal(MOTION_SENSOR_ALARM_OVERVIEW.startsWith('Build an alarm that notices'), true)
  assert.equal(MOTION_SENSOR_ALARM_DESCRIPTION.startsWith('A light and a buzzer respond'), true)
  assert.equal(SERVO_PAN_TILT_CAMERA_OVERVIEW.includes('does not record video'), true)
  assert.equal(SERVO_PAN_TILT_CAMERA_OVERVIEW.includes('face'), false)
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.overview.includes('temperature, humidity, and air pressure'), true)
  assert.equal(ESP32_BLE_RGB_PROJECT.overview.includes('keeps the last colour'), true)
  assert.equal(LED_MATRIX_MAZE_PROJECT.overview.includes('five levels'), true)
})

test('step 1 introduces the result without copying the overview', () => {
  assert.equal(MOTION_SENSOR_ALARM_STEPS[0].description === MOTION_SENSOR_ALARM_OVERVIEW, false)
  assert.equal(MOTION_SENSOR_ALARM_STEPS[0].description.includes('light and a buzzer'), true)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS[0].description === SERVO_PAN_TILT_CAMERA_OVERVIEW, false)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS[0].description.includes('does not record video'), true)
  assert.equal(ESP32_WIFI_WEATHER_STEPS[0].description.includes('home Wi-Fi'), true)
  assert.equal(ESP32_WIFI_WEATHER_STEPS[0].description === ESP32_WIFI_WEATHER_PROJECT.overview, false)
  assert.equal(ESP32_BLE_RGB_STEPS[0].description.includes('RGB LED'), true)
  assert.equal(LED_MATRIX_MAZE_STEPS[0].description.includes('five mazes'), true)
  assert.equal(LED_MATRIX_MAZE_STEPS[0].description === LED_MATRIX_MAZE_PROJECT.overview, false)

  const channels = ESP32_BLE_RGB_STEPS.map((step) => step.title)
  assert.equal(channels.includes('Build the red channel'), true)
  assert.equal(channels.includes('Build the green channel'), true)
  assert.equal(channels.includes('Build the blue channel'), true)

  for (const step of [
    MOTION_SENSOR_ALARM_STEPS[0],
    SERVO_PAN_TILT_CAMERA_STEPS[0],
    ESP32_WIFI_WEATHER_STEPS[0],
    ESP32_BLE_RGB_STEPS[0],
    LED_MATRIX_MAZE_STEPS[0],
  ]) {
    assert.equal(blockTypes(step).includes('components'), false)
  }
  assert.equal(stepText(MOTION_SENSOR_ALARM_STEPS[0]).includes('passive piezo'), true)
  assert.equal(stepText(SERVO_PAN_TILT_CAMERA_STEPS[0]).includes('continuous-rotation'), true)
  const servoPower = SERVO_PAN_TILT_CAMERA_STEPS.map((step) => stepText(step)).join('\n')
  assert.equal(servoPower.includes('does not publish stall current'), true)
  assert.equal(servoPower.includes('hardware-verified'), false)
})

test('publication flags stay as they are', () => {
  const bySlug = new Map(localAuthoredProjects().map((project) => [project.slug, project.isPublished]))
  assert.equal(bySlug.get('8'), true)
  assert.equal(bySlug.get('18'), true)
  assert.equal(bySlug.get('23'), false)
  assert.equal(bySlug.get('24'), false)
  assert.equal(bySlug.get('25'), false)
  assert.equal(ESP32_BLE_RGB_PROJECT.difficulty, 'intermediate')
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.durationLabel, '3 hrs')
  assert.equal(LED_MATRIX_MAZE_PROJECT.title, 'Arduino LED Matrix Maze Game')
  assert.equal(SERVO_PAN_TILT_CAMERA_DESCRIPTION.startsWith('Aim a small camera mount'), true)
})
