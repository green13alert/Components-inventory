import assert from 'node:assert/strict'
import { test } from 'node:test'

import { COMPONENT_CATALOGUE } from '../constants/component-catalogue.ts'
import { MOTION_SENSOR_ALARM_COMPONENTS, MOTION_SENSOR_ALARM_FIRMWARE, MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_COMPONENTS, SERVO_PAN_TILT_CAMERA_FIRMWARE } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_BOM, ESP32_WIFI_WEATHER_CONNECTIONS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_BOM, ESP32_BLE_RGB_PROJECT } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { FIRMWARE_COMPILE_RECORD } from '../firmware/compile-record.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { authoringErrors, reviewAuthoredProject } from './project-authoring.ts'
import { sketchChecksum } from './sketch-checksum.ts'

const catalogue = new Set(COMPONENT_CATALOGUE.map((entry) => entry.id))

test('each authored BOM line is a catalogue part with one exact requirement', () => {
  for (const project of localAuthoredProjects()) {
    assert.equal(project.requirements.length, project.bom.length, project.slug)
    for (const item of project.bom) {
      assert.equal(catalogue.has(item.slug), true, `${project.slug} ${item.slug}`)
    }
    assert.deepEqual(authoringErrors(reviewAuthoredProject(project)), [])
  }
})

test('the motion alarm has one upload sketch and the three-pin buzzer', () => {
  const blocks = MOTION_SENSOR_ALARM_STEPS.flatMap((step) => step.blocks).filter((block) => block.type === 'code')
  const finals = blocks.filter((block) => block.type === 'code' && block.code === MOTION_SENSOR_ALARM_FIRMWARE)
  assert.equal(finals.length, 1)
  assert.equal(blocks[blocks.length - 1].type === 'code' && blocks[blocks.length - 1].code === MOTION_SENSOR_ALARM_FIRMWARE, true)
  assert.equal(MOTION_SENSOR_ALARM_FIRMWARE.includes('Alarm armed.'), true)
  assert.equal(MOTION_SENSOR_ALARM_COMPONENTS.some((item) => item.id === 'usb-data-cable'), true)
  assert.equal(MOTION_SENSOR_ALARM_COMPONENTS.some((item) => item.id === 'buzzer'), true)
  const text = JSON.stringify(MOTION_SENSOR_ALARM_STEPS)
  assert.equal(text.includes('two leads'), false)
  assert.equal(text.includes('two-pin buzzer goes'), false)
})

test('the pan-tilt supply is a named 5 V adapter and the positive rails stay separate', () => {
  const slugs = SERVO_PAN_TILT_CAMERA_COMPONENTS.map((item) => item.id)
  for (const id of ['gst18a05-p1j', 'iec-c13-mains-lead', 'adafruit-368', 'usb-data-cable']) {
    assert.equal(slugs.includes(id), true, id)
  }
  assert.equal(slugs.includes('breadboard-psu'), false)
  assert.equal(slugs.includes('barrel-jack-21'), false)
  assert.equal(SERVO_PAN_TILT_CAMERA_FIRMWARE.includes('PAN_PIN = 9'), true)
  assert.equal(SERVO_PAN_TILT_CAMERA_FIRMWARE.includes('TILT_PIN = 10'), true)
  assert.equal(SERVO_PAN_TILT_CAMERA_FIRMWARE.includes('map('), false)
  assert.equal(SERVO_PAN_TILT_CAMERA_FIRMWARE.includes('axisRate'), true)
  const project = localAuthoredProjects().find((item) => item.slug === '18')
  const reviews = reviewAuthoredProject(project!).filter((finding) => finding.level === 'review')
  assert.equal(reviews.some((finding) => finding.message.includes('not a verified servo-power connection')), true)
})

test('the weather station cable lands on the DevKit and does not use a breadboard', () => {
  const slugs: string[] = ESP32_WIFI_WEATHER_BOM.map((item) => item.slug)
  assert.equal(slugs.includes('stemma-qt-female'), true)
  assert.equal(slugs.includes('esp32-devkitc-v4'), true)
  assert.equal(slugs.includes('breadboard'), false)
  assert.equal(slugs.includes('jumper-male-female'), false)
  assert.equal(ESP32_WIFI_WEATHER_CONNECTIONS.length, 4)
  assert.equal(ESP32_WIFI_WEATHER_CONNECTIONS.some((row) => row.toComponent === 'Breadboard'), false)
})

test('each final sketch matches a recorded compile and is not marked hardware-tested', () => {
  const sketches = FIRMWARE_COMPILE_RECORD.sketches
  for (const project of localAuthoredProjects()) {
    assert.equal(project.compilation, 'passed', project.slug)
    assert.equal(project.hardwareTested, false, project.slug)
    const recorded = sketches[project.slug as keyof typeof sketches]
    assert.equal(recorded.result, 'passed', project.slug)
    assert.equal(recorded.checksum, sketchChecksum(project.firmware ?? ''), project.slug)
  }
  assert.equal(FIRMWARE_COMPILE_RECORD.cores['arduino:avr'], '1.8.7')
  assert.equal(FIRMWARE_COMPILE_RECORD.cores['esp32:esp32'], '3.3.12')
})

test('the RGB controller is classified intermediate and uses the DevKitC V4 row', () => {
  assert.equal(ESP32_BLE_RGB_PROJECT.difficulty, 'intermediate')
  assert.equal(ESP32_BLE_RGB_BOM.some((item) => item.slug === 'esp32-devkitc-v4'), true)
  assert.equal(ESP32_BLE_RGB_BOM.some((item) => item.slug === 'pn2222a'), true)
  assert.equal(ESP32_BLE_RGB_BOM.some((item) => item.slug === 'breadboard'), true)
})
