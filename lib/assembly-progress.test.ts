import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_STEPS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import type { WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { AuthoredWalkthroughStep } from '../constants/walkthrough-content.ts'
import { resolveAssembly, validateAssemblySequence } from './assembly-progress.ts'
import { buildPhysicalScene } from './physical-scene.ts'

const projects: { layout: WiringLayout; steps: AuthoredWalkthroughStep[] }[] = [
  { layout: ESP32_BLE_RGB_LAYOUT, steps: ESP32_BLE_RGB_STEPS },
  { layout: MOTION_SENSOR_ALARM_LAYOUT, steps: MOTION_SENSOR_ALARM_STEPS },
  { layout: SERVO_PAN_TILT_CAMERA_LAYOUT, steps: SERVO_PAN_TILT_CAMERA_STEPS },
  { layout: ESP32_WIFI_WEATHER_LAYOUT, steps: ESP32_WIFI_WEATHER_STEPS },
]

test('each breadboard walkthrough introduces every part and jumper once', () => {
  for (const project of projects) {
    assert.deepEqual(validateAssemblySequence(project.layout, project.steps), [])
  }
})

test('project 24 grows from an empty board to the finished circuit', () => {
  const layout = ESP32_BLE_RGB_LAYOUT
  const steps = ESP32_BLE_RGB_STEPS
  const fixtures = layout.physical?.fixtures ?? []
  const seat = steps.findIndex((step) => step.title.startsWith('Seat every part'))
  const red = steps.findIndex((step) => step.title.startsWith('Build the red'))
  const check = steps.findIndex((step) => step.title.startsWith('Check the whole'))
  const seated = resolveAssembly(steps, seat, 'current', fixtures)
  assert.equal(seated.phase, 'building')
  assert.equal(seated.newParts.includes('led'), true)
  assert.equal(seated.newParts.includes('q-red'), true)
  assert.equal(seated.installedJumpers.length, 0)
  const redStep = resolveAssembly(steps, red, 'current', fixtures)
  assert.equal(redStep.installedParts.includes('led'), true)
  assert.equal(redStep.installedParts.includes('limit-red'), true)
  assert.deepEqual(redStep.newJumpers, ['devkit-io25'])
  assert.equal(redStep.installedJumpers.includes('devkit-io26'), false)
  assert.equal(redStep.newParts.length, 0)
  const again = resolveAssembly(steps, seat, 'current', fixtures)
  assert.equal(again.installedJumpers.includes('devkit-io25'), false)
  const finished = resolveAssembly(steps, check, 'current', fixtures)
  assert.equal(finished.phase, 'after')
  assert.equal(finished.newJumpers.length, 0)
  assert.equal(finished.installedJumpers.length, layout.physical?.jumpers.length)
  const complete = resolveAssembly(steps, red, 'complete', fixtures)
  assert.equal(complete.installedJumpers.length, layout.physical?.jumpers.length)
  assert.equal(complete.newParts.length, 0)
  const full = buildPhysicalScene(layout)
  const partial = buildPhysicalScene(layout, [], [], {
    installedParts: new Set(redStep.installedParts),
    newParts: new Set(redStep.newParts),
    installedJumpers: new Set(redStep.installedJumpers),
    newJumpers: new Set(redStep.newJumpers),
  })
  assert.ok(full && partial)
  assert.equal(partial?.width, full?.width)
  assert.equal(partial?.height, full?.height)
  assert.equal(partial?.wires.some((wire) => wire.id === 'devkit-io25' && wire.emphasis === 'active'), true)
  assert.equal(partial?.wires.some((wire) => wire.id === 'devkit-io26'), false)
  assert.equal(partial?.parts.some((part) => part.id === 'q-green' && part.emphasis === 'prior'), true)
  assert.equal(partial?.parts.some((part) => part.id === 'esp32'), true)
})

test('a repeated part introduction is rejected', () => {
  const steps = ESP32_BLE_RGB_STEPS.map((step) => ({
    ...step,
    blocks: step.blocks.map((block) =>
      block.type === 'wiring' && block.assembly?.parts.includes('led')
        ? { ...block, assembly: { parts: ['led', 'led'], jumpers: [] } }
        : block,
    ),
  }))
  const errors = validateAssemblySequence(ESP32_BLE_RGB_LAYOUT, steps)
  assert.equal(errors.some((error) => error.includes('led') && error.includes('again')), true)
})
