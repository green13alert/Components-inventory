import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_BLE_RGB_CONNECTIONS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { LED_MATRIX_MAZE_CONNECTIONS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { ESP32_WIFI_WEATHER_CONNECTIONS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_CONNECTIONS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_CONNECTIONS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { LED_MATRIX_MAZE_STEPS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { hitTestSceneTarget, hitTestWire, sceneTouchRadius, WIRE_HIT_RADIUS, WIRE_TOUCH_POINTS } from './diagram-hit.ts'
import { focusedPartOpacity, paintConnectionWires, retainWireFocus, toggleWireFocus } from './diagram-selection.ts'
import { focusCaption, visibleConnectionEntries } from './connection-reference.ts'
import { buildPhysicalScene, longestSharedRun, wireBodyHits, type PhysicalScene, type SceneWire } from './physical-scene.ts'

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
  assert.equal(scene.board.rightPlus, '')
  const adapter = scene.parts.find((part) => part.kind === 'psu')
  assert.ok(adapter && adapter.kind === 'psu')
  assert.equal(adapter.label, 'Adafruit 368')
  assert.deepEqual(adapter.pins.map((pin) => pin.label), ['+', '−'])
  assert.equal(scene.parts.filter((part) => part.kind === 'servo').length, 2)
})

test('project 25 keeps the matrix and joystick off the breadboard and clear of each other', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS)
  assert.ok(scene)
  assert.equal(wireBodyHits(scene).length, 0, wireBodyHits(scene).join(', '))
  const matrix = scene.parts.find((part) => part.id === 'matrix')
  const stick = scene.parts.find((part) => part.id === 'joystick')
  const uno = scene.parts.find((part) => part.id === 'arduino')
  assert.ok(matrix && 'width' in matrix)
  assert.ok(stick && 'width' in stick)
  assert.ok(uno && 'width' in uno)
  const board = { x: scene.board.x, y: scene.board.y, width: scene.board.width, height: scene.board.height }
  const gap = 80
  for (const [name, box] of [
    ['matrix', matrix],
    ['joystick', stick],
  ] as const) {
    for (const [otherName, other] of [
      ['board', board],
      ['uno', uno],
    ] as const) {
      const separated =
        box.x + box.width + gap <= other.x ||
        other.x + other.width + gap <= box.x ||
        box.y + box.height + gap <= other.y ||
        other.y + other.height + gap <= box.y
      assert.equal(separated, true, `${name} is closer than 12 mm to the ${otherName}`)
    }
  }
  const modulesSeparated =
    matrix.x + matrix.width + gap <= stick.x ||
    stick.x + stick.width + gap <= matrix.x ||
    matrix.y + matrix.height + gap <= stick.y ||
    stick.y + stick.height + gap <= matrix.y
  assert.equal(modulesSeparated, true)
  assert.ok(matrix.y + matrix.height < scene.board.y)
  assert.ok(stick.y > scene.board.y + scene.board.height)
  for (const id of ['matrix-clk', 'matrix-cs', 'matrix-din', 'matrix-vcc', 'matrix-gnd', 'joy-x', 'joy-y', 'joy-sw', 'joy-5v', 'joy-gnd']) {
    const wire = scene.wires.find((item) => item.id === id)
    assert.ok(wire, id)
    assert.equal(wire.gender, 'male-female')
    assert.equal(wire.socketAt, 'from')
  }
  for (const id of ['uno-5v', 'uno-gnd']) {
    const wire = scene.wires.find((item) => item.id === id)
    assert.ok(wire, id)
    assert.equal(wire.gender, 'male-male')
  }
  assert.deepEqual(
    matrix.pins.map((pin) => pin.label),
    ['CLK', 'CS', 'DIN', 'GND', 'VCC'],
  )
})

test('project 23 draws the STEMMA cable from the DevKit pins to the sensor', () => {
  const scene = buildPhysicalScene(ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS)
  assert.ok(scene)
  assert.equal(scene.board.rows, 0)
  assert.equal(scene.holes.length, 0)
  const sensor = scene.parts.find((part) => part.kind === 'bme280')
  assert.ok(sensor && sensor.kind === 'bme280')
  for (const id of ['cable-vin', 'cable-gnd', 'cable-sdi', 'cable-sck']) {
    const wire = scene.wires.find((item) => item.id === id)
    assert.ok(wire, id)
    assert.equal(wire.gender, 'stemma-female')
  }
})

function pathVertices(path: string) {
  const numbers = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  const points: { x: number; y: number }[] = []
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    points.push({ x: numbers[index], y: numbers[index + 1] })
  }
  return points
}

function routeLeavesItsNeighbourhood(wire: SceneWire, scene: PhysicalScene) {
  let minX = Math.min(wire.from.x, wire.to.x)
  let maxX = Math.max(wire.from.x, wire.to.x)
  let minY = Math.min(wire.from.y, wire.to.y)
  let maxY = Math.max(wire.from.y, wire.to.y)
  const pad = 72
  for (const item of scene.obstacles) {
    const box =
      item.kind === 'rect'
        ? { left: item.x, top: item.y, right: item.x + item.width, bottom: item.y + item.height }
        : {
            left: Math.min(item.x1, item.x2) - item.radius,
            right: Math.max(item.x1, item.x2) + item.radius,
            top: Math.min(item.y1, item.y2) - item.radius,
            bottom: Math.max(item.y1, item.y2) + item.radius,
          }
    const near = box.left < maxX + pad && box.right > minX - pad && box.top < maxY + pad && box.bottom > minY - pad
    if (!near) {
      continue
    }
    minX = Math.min(minX, box.left)
    maxX = Math.max(maxX, box.right)
    minY = Math.min(minY, box.top)
    maxY = Math.max(maxY, box.bottom)
  }
  return pathVertices(wire.d).some((point) => point.x < minX - pad || point.x > maxX + pad || point.y < minY - pad || point.y > maxY + pad)
}

test('wires stay inside the scene and do not detour around distant parts', () => {
  const projects = [
    ['8', MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS],
    ['18', SERVO_PAN_TILT_CAMERA_LAYOUT, SERVO_PAN_TILT_CAMERA_CONNECTIONS],
    ['23', ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS],
    ['24', ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS],
    ['25', LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS],
  ] as const
  for (const [slug, layout, connections] of projects) {
    const scene = buildPhysicalScene(layout, connections)
    assert.ok(scene)
    assert.equal(wireBodyHits(scene).length, 0, `${slug}: ${wireBodyHits(scene).join(', ')}`)
    for (const wire of scene.wires) {
      for (const point of [wire.from, wire.to, ...pathVertices(wire.d)]) {
        assert.ok(point.x >= -1 && point.x <= scene.width + 1, `${slug} ${wire.id} x`)
        assert.ok(point.y >= -1 && point.y <= scene.height + 1, `${slug} ${wire.id} y`)
      }
      assert.equal(routeLeavesItsNeighbourhood(wire, scene), false, `${slug} ${wire.id}`)
    }
  }
})

test('project 25 keeps the same terminals and a compact route', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS)
  assert.ok(scene)
  const matrix = scene.parts.find((part) => part.id === 'matrix')
  const stick = scene.parts.find((part) => part.id === 'joystick')
  const uno = scene.parts.find((part) => part.id === 'arduino')
  assert.ok(matrix && 'pins' in matrix)
  assert.ok(stick && 'pins' in stick)
  assert.ok(uno && 'pins' in uno)
  const pairs: [string, string, string][] = [
    ['matrix-clk', 'CLK', 'D13'],
    ['matrix-cs', 'CS', 'D10'],
    ['matrix-din', 'DIN', 'D11'],
    ['joy-x', 'VRx', 'A0'],
    ['joy-y', 'VRy', 'A1'],
    ['joy-sw', 'SW', 'D2'],
  ]
  for (const [id, moduleLabel, unoLabel] of pairs) {
    const wire = scene.wires.find((item) => item.id === id)
    const modulePin = (id.startsWith('joy') ? stick : matrix).pins.find((pin) => pin.label === moduleLabel)
    const unoPin = uno.pins.find((pin) => pin.label === unoLabel)
    assert.ok(wire && modulePin && unoPin, id)
    assert.deepEqual(wire.from, modulePin.at)
    assert.deepEqual(wire.to, unoPin.at)
  }
  const power = scene.wires.find((wire) => wire.id === 'uno-5v')
  assert.ok(power)
  const numbers = power.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let length = 0
  for (let index = 2; index + 1 < numbers.length; index += 2) {
    length += Math.hypot(numbers[index] - numbers[index - 2], numbers[index + 1] - numbers[index - 1])
  }
  assert.ok(length < 700, `uno-5v route is ${length}`)
  const fitted = { width: 390, height: 640 }
  const scale = Math.min(fitted.width / scene.width, fitted.height / scene.height)
  assert.ok(scene.width * scale <= fitted.width)
  assert.ok(scene.height * scale <= fitted.height)
  assert.ok(scene.height < 1000)
})

test('project 25 assembly steps reveal wires in order without moving earlier parts', () => {
  const fixtures = LED_MATRIX_MAZE_LAYOUT.physical?.fixtures ?? []
  const steps = LED_MATRIX_MAZE_STEPS
  const titles = ['Set Up the Arduino and Power Rails', 'Connect the LED Matrix', 'Connect the Joystick', 'Check the Complete Circuit']
  const expected = [
    ['uno-5v', 'uno-gnd'],
    ['uno-5v', 'uno-gnd', 'matrix-gnd', 'matrix-vcc', 'matrix-clk', 'matrix-cs', 'matrix-din'],
    ['uno-5v', 'uno-gnd', 'matrix-gnd', 'matrix-vcc', 'matrix-clk', 'matrix-cs', 'matrix-din', 'joy-gnd', 'joy-5v', 'joy-x', 'joy-y', 'joy-sw'],
    ['uno-5v', 'uno-gnd', 'matrix-gnd', 'matrix-vcc', 'matrix-clk', 'matrix-cs', 'matrix-din', 'joy-gnd', 'joy-5v', 'joy-x', 'joy-y', 'joy-sw'],
  ]
  let unoAt: { x: number; y: number } | null = null
  titles.forEach((title, index) => {
    const stepIndex = steps.findIndex((step) => step.title === title)
    const frame = resolveAssembly(steps, stepIndex, 'current', fixtures)
    const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT, [], [], {
      installedParts: new Set(frame.installedParts),
      newParts: new Set(frame.newParts),
      installedJumpers: new Set(frame.installedJumpers),
      newJumpers: new Set(frame.newJumpers),
    })
    assert.ok(scene)
    assert.deepEqual(scene.wires.map((wire) => wire.id).sort(), [...expected[index]].sort(), title)
    const introduced = new Set(frame.newJumpers)
    const overview = frame.newJumpers.length === 0 && frame.newParts.length === 0
    for (const wire of scene.wires) {
      const expected = overview || introduced.has(wire.id) ? 'active' : 'prior'
      assert.equal(wire.emphasis, expected, `${title} ${wire.id}`)
    }
    const uno = scene.parts.find((part) => part.id === 'arduino')
    assert.ok(uno && 'x' in uno)
    if (unoAt) {
      assert.deepEqual({ x: uno.x, y: uno.y }, unoAt)
    }
    unoAt = { x: uno.x, y: uno.y }
    assert.equal(wireBodyHits(scene).length, 0, wireBodyHits(scene).join(', '))
  })
  const check = resolveAssembly(steps, steps.findIndex((step) => step.title === 'Check the Complete Circuit'), 'current', fixtures)
  assert.equal(check.newJumpers.length, 0)
  assert.equal(check.phase, 'after')
})

test('a focused step highlights the new wires and still keeps the other parts', () => {
  const scene = buildPhysicalScene(MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS.slice(0, 2))
  assert.ok(scene)
  assert.equal(scene.parts.length > 1, true)
  assert.equal(scene.wires.some((wire) => wire.emphasis === 'context' || wire.emphasis === 'prior'), true)
  assert.equal(scene.wires.some((wire) => wire.emphasis === 'active'), true)
})

test('project 25 signal colours differ and parallel runs stay in the local gap', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS)
  assert.ok(scene)
  const color = (id: string) => scene.wires.find((wire) => wire.id === id)?.color
  const signals = ['matrix-clk', 'matrix-cs', 'matrix-din', 'joy-x', 'joy-y', 'joy-sw'].map((id) => color(id))
  assert.equal(new Set(signals).size, signals.length)
  const clock = scene.wires.find((wire) => wire.id === 'matrix-clk')
  assert.ok(clock?.touches.includes('matrix') && clock.touches.includes('arduino'))
  assert.equal(color('uno-5v'), '#DC2626')
  assert.equal(color('uno-gnd'), '#111827')
  assert.ok(longestSharedRun(scene) < 180, `shared ${longestSharedRun(scene)}`)
  assert.ok(scene.height < 1000)
})

test('a wire tap uses a corridor and a module body stays a part', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS)
  assert.ok(scene)
  const wire = scene.wires.find((item) => item.id === 'matrix-clk')
  assert.ok(wire)
  const numbers = wire.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  let point = { x: wire.from.x, y: wire.from.y }
  let span = 0
  for (let index = 0; index + 3 < numbers.length; index += 2) {
    const length = Math.hypot(numbers[index + 2] - numbers[index], numbers[index + 3] - numbers[index + 1])
    if (length > span) {
      span = length
      point = { x: (numbers[index] + numbers[index + 2]) / 2, y: (numbers[index + 1] + numbers[index + 3]) / 2 }
    }
  }
  assert.equal(hitTestWire(scene, point, WIRE_HIT_RADIUS), 'matrix-clk')
  assert.equal(hitTestWire(scene, point, sceneTouchRadius(WIRE_TOUCH_POINTS, 320, scene.width, 2)), 'matrix-clk')
  assert.deepEqual(hitTestSceneTarget(scene, point), { kind: 'wire', id: 'matrix-clk' })
  assert.equal(hitTestWire(scene, { x: 2, y: 2 }, WIRE_HIT_RADIUS), null)
  const uno = scene.parts.find((part) => part.id === 'arduino')
  assert.ok(uno && 'x' in uno)
  const body = hitTestSceneTarget(scene, { x: uno.x + uno.width / 2, y: uno.y + uno.height / 2 })
  assert.deepEqual(body, { kind: 'part', id: 'arduino' })
})

test('connection focus keeps one wire readable and hides wires from later steps', () => {
  const projects = [MOTION_SENSOR_ALARM_LAYOUT, SERVO_PAN_TILT_CAMERA_LAYOUT, ESP32_WIFI_WEATHER_LAYOUT, ESP32_BLE_RGB_LAYOUT, LED_MATRIX_MAZE_LAYOUT]
  for (const layout of projects) {
    const scene = buildPhysicalScene(layout)
    assert.ok(scene && scene.wires.length > 1)
    const chosen = scene.wires[0].id
    const paint = paintConnectionWires(
      scene.wires.map((wire) => ({ id: wire.id, emphasis: wire.emphasis, related: false })),
      [chosen],
      { introducing: false, selecting: false },
    )
    assert.equal(paint.at(-1)?.id, chosen)
    assert.equal(paint.at(-1)?.opacity, 1)
    assert.equal(paint.at(-1)?.ends, true)
    assert.equal(paint.at(-1)?.halo, 'focus')
    assert.ok(paint.slice(0, -1).every((wire) => wire.opacity === 0.22 && wire.halo === 'none'))
    assert.equal(focusedPartOpacity(true, false, false, 'active'), 1)
  }

  const early = buildPhysicalScene(ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS, [], {
    installedParts: new Set(['esp32']),
    newParts: new Set<string>(),
    installedJumpers: new Set(['devkit-5v', 'devkit-gnd', 'devkit-io25']),
    newJumpers: new Set(['devkit-io25']),
  })
  assert.ok(early)
  const visible = early.wires.map((wire) => wire.id)
  assert.equal(visible.includes('devkit-io27'), false)
  assert.equal(retainWireFocus(['devkit-io27'], visible), null)
  const open = paintConnectionWires(
    early.wires.map((wire) => ({ id: wire.id, emphasis: wire.emphasis, related: false })),
    [],
    { introducing: true, selecting: false },
  )
  assert.equal(open.find((wire) => wire.id === 'devkit-io25')?.halo, 'new')
  const held = paintConnectionWires(
    early.wires.map((wire) => ({ id: wire.id, emphasis: wire.emphasis, related: false })),
    ['devkit-5v'],
    { introducing: true, selecting: false },
  )
  assert.equal(held.find((wire) => wire.id === 'devkit-5v')?.halo, 'focus')
  assert.equal(held.find((wire) => wire.id === 'devkit-io25')?.halo, 'none')
  assert.equal(held.at(-1)?.id, 'devkit-5v')
})

test('connection focus toggles, switches, and survives a rebuild', () => {
  assert.deepEqual(toggleWireFocus(null, ['matrix-clk']), ['matrix-clk'])
  assert.equal(toggleWireFocus(['matrix-clk'], ['matrix-clk']), null)
  assert.deepEqual(toggleWireFocus(['matrix-clk'], ['joy-x']), ['joy-x'])
  assert.deepEqual(retainWireFocus(['matrix-clk'], ['uno-5v', 'matrix-clk']), ['matrix-clk'])
  assert.equal(retainWireFocus(['matrix-clk'], ['uno-5v', 'uno-gnd']), null)
  const entries = visibleConnectionEntries(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS, [], [])
  const clock = entries.find((entry) => entry.title.includes('CLK'))
  assert.deepEqual(clock?.wireIds, ['matrix-clk'])
  assert.equal(focusCaption(LED_MATRIX_MAZE_LAYOUT, entries, ['matrix-clk']).title.includes('CLK'), true)
  assert.equal(focusCaption(LED_MATRIX_MAZE_LAYOUT, entries, ['matrix-clk']).title.includes('D13'), true)
})
