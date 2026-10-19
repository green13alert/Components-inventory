import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import type { WiringLayout } from '../constants/wiring-diagrams/types.ts'
import { resolveAssembly } from './assembly-progress.ts'
import {
  buildComponentKey,
  componentKeyProblems,
  findKeyInstance,
  highlightedPartIds,
  reconcileSelection,
  toggleKeySelection,
} from './component-key.ts'
import { hitTestScene, partHitBox, viewerPointToScene } from './diagram-hit.ts'
import { buildPhysicalScene } from './physical-scene.ts'

const layouts: WiringLayout[] = [
  MOTION_SENSOR_ALARM_LAYOUT,
  SERVO_PAN_TILT_CAMERA_LAYOUT,
  ESP32_WIFI_WEATHER_LAYOUT,
  ESP32_BLE_RGB_LAYOUT,
]

test('each physical project has a catalogue-linked component key', () => {
  for (const layout of layouts) {
    assert.deepEqual(componentKeyProblems(layout), [])
    const groups = buildComponentKey(layout, null)
    const ids = groups.flatMap((group) => group.instances.map((instance) => instance.id))
    assert.equal(new Set(ids).size, ids.length)
    assert.equal(groups.some((group) => group.catalogueId === 'breadboard'), true)
    for (const group of groups) {
      assert.ok(getCatalogueComponent(group.catalogueId))
      assert.equal(group.instances.length > 0, true)
    }
  }
})

test('project 24 names each transistor and hides parts that are not installed yet', () => {
  const steps = ESP32_BLE_RGB_STEPS
  const fixtures = ESP32_BLE_RGB_LAYOUT.physical?.fixtures ?? []
  const empty = resolveAssembly(steps, steps.findIndex((step) => step.title.startsWith('Learn the breadboard')), 'current', fixtures)
  const early = buildComponentKey(ESP32_BLE_RGB_LAYOUT, new Set(empty.installedParts))
  const transistors = early.find((group) => group.catalogueId === 'pn2222a')
  assert.ok(transistors)
  assert.deepEqual(
    transistors.instances.map((instance) => instance.id),
    ['q-red', 'q-green', 'q-blue'],
  )
  assert.equal(transistors.instances.every((instance) => instance.highlightIds.length === 0), true)
  assert.equal(highlightedPartIds(early, { kind: 'group', catalogueId: 'pn2222a' }).length, 0)

  const seated = resolveAssembly(steps, steps.findIndex((step) => step.title.startsWith('Seat every part')), 'current', fixtures)
  const onBoard = buildComponentKey(ESP32_BLE_RGB_LAYOUT, new Set(seated.installedParts))
  assert.deepEqual(highlightedPartIds(onBoard, { kind: 'group', catalogueId: 'pn2222a' }).sort(), ['q-blue', 'q-green', 'q-red'])
  const green = findKeyInstance(onBoard, 'q-green')
  assert.equal(green?.instance.label, 'Q green')
  assert.equal(green?.group.name, 'PN2222A transistor')
  assert.equal(/green/.test(green?.instance.role ?? ''), true)
  assert.equal(green?.instance.pins, 'Base, Collector, Emitter')

  const complete = buildComponentKey(ESP32_BLE_RGB_LAYOUT, new Set(resolveAssembly(steps, 0, 'complete', fixtures).installedParts))
  assert.equal(complete.flatMap((group) => group.instances).every((instance) => instance.installed), true)
  assert.equal(reconcileSelection({ kind: 'instance', id: 'q-green' }, early), null)
  assert.deepEqual(reconcileSelection({ kind: 'instance', id: 'q-green' }, onBoard), { kind: 'instance', id: 'q-green' })
  assert.equal(toggleKeySelection({ kind: 'instance', id: 'q-green' }, { kind: 'instance', id: 'q-green' }), null)
  assert.deepEqual(toggleKeySelection({ kind: 'instance', id: 'q-red' }, { kind: 'instance', id: 'q-green' }), {
    kind: 'instance',
    id: 'q-green',
  })
})

test('pan and tilt servos stay separate, and the weather cable follows the sensor', () => {
  const servo = buildComponentKey(SERVO_PAN_TILT_CAMERA_LAYOUT, null)
  const servos = servo.find((group) => group.catalogueId === 'sg90')
  assert.deepEqual(
    servos?.instances.map((instance) => instance.id),
    ['pan', 'tilt'],
  )
  const weather = buildComponentKey(ESP32_WIFI_WEATHER_LAYOUT, new Set(['esp32']))
  const cable = findKeyInstance(weather, 'stemma')
  assert.equal(cable?.group.catalogueId, 'stemma-qt-cable')
  assert.deepEqual(cable?.instance.highlightIds, [])
  const seated = buildComponentKey(ESP32_WIFI_WEATHER_LAYOUT, new Set(['esp32', 'bme280']))
  assert.deepEqual(findKeyInstance(seated, 'stemma')?.instance.highlightIds, ['bme280'])
})

test('a tap hits the part under it and misses parts the assembly has hidden', () => {
  const full = buildPhysicalScene(ESP32_BLE_RGB_LAYOUT, [], [], null)
  assert.ok(full)
  const transistor = full.parts.find((part) => part.id === 'q-green')
  assert.ok(transistor)
  const target = partHitBox(transistor)
  const point = { x: target.x + target.width / 2, y: target.y + target.height / 2 }
  assert.equal(hitTestScene(full, point), 'q-green')
  const empty = buildPhysicalScene(ESP32_BLE_RGB_LAYOUT, [], [], {
    installedParts: new Set(['esp32']),
    newParts: new Set<string>(),
    installedJumpers: new Set<string>(),
    newJumpers: new Set<string>(),
  })
  assert.ok(empty)
  assert.equal(empty.parts.some((part) => part.id === 'q-green'), false)
  assert.equal(hitTestScene(empty, point) === 'q-green', false)
})

test('a viewer tap maps back to the same scene point', () => {
  const center = viewerPointToScene({
    x: 200,
    y: 200,
    scale: 1,
    translateX: 0,
    translateY: 0,
    viewportWidth: 400,
    viewportHeight: 400,
    fittedWidth: 200,
    fittedHeight: 200,
    sceneWidth: 200,
    sceneHeight: 200,
  })
  assert.equal(center.x, 100)
  assert.equal(center.y, 100)
  const zoomed = viewerPointToScene({
    x: 200,
    y: 200,
    scale: 2,
    translateX: 0,
    translateY: 0,
    viewportWidth: 400,
    viewportHeight: 400,
    fittedWidth: 200,
    fittedHeight: 200,
    sceneWidth: 200,
    sceneHeight: 200,
  })
  assert.equal(zoomed.x, 100)
  assert.equal(zoomed.y, 100)
})
