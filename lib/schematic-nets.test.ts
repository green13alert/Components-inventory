import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import type { WiringElementDef, WiringLayout, WiringSymbolKind } from '../constants/wiring-diagrams/types.ts'
import { ESP32_BLE_RGB_CONNECTIONS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_CONNECTIONS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_CONNECTIONS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_CONNECTIONS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_CONNECTIONS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import type { StepConnection } from '../constants/walkthrough-content.ts'
import { physicalElectricalGroups } from './breadboard-layout.ts'
import { buildSchematicNetlist, netByMember, pinKey, sameNet } from './schematic-nets.ts'
import type { ElectricalPinRef, SchematicNetlist } from './schematic-nets.ts'

function expectNet(netlist: SchematicNetlist, pin: ElectricalPinRef, members: ElectricalPinRef[]) {
  const net = netByMember(netlist, pin.componentId, pin.portId)
  assert.ok(net, `missing net for ${pinKey(pin)}: ${netlist.issues.map((issue) => issue.message).join('; ')}`)
  assert.deepEqual(net.members.map(pinKey).sort(), members.map(pinKey).sort())
  return net
}

function scrubbed(layout: WiringLayout): WiringLayout {
  return {
    ...layout,
    width: 1,
    height: 1,
    elements: layout.elements.map((element) => ({
      ...element,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      ports: element.ports.map((port) => ({ ...port, dx: 0, dy: 0 })),
    })),
  }
}

test('pixel positions do not change the netlist', () => {
  const original = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS)
  const moved = buildSchematicNetlist(scrubbed(MOTION_SENSOR_ALARM_LAYOUT), MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.deepEqual(moved, original)
})

test('project 8 keeps the alarm nets separate', () => {
  const netlist = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  assert.equal(netlist.links.length, MOTION_SENSOR_ALARM_CONNECTIONS.length)

  const supply = expectNet(netlist, { componentId: 'arduino', portId: '5v' }, [
    { componentId: 'arduino', portId: '5v' },
    { componentId: 'breadboard', portId: 'plus' },
    { componentId: 'buzzer', portId: 'vcc' },
    { componentId: 'pir', portId: 'vcc' },
  ])
  assert.equal(supply.kind, 'power')
  assert.equal(supply.name, 'arduino:5v')
  assert.deepEqual(supply.sources, [{ componentId: 'arduino', portId: '5v' }])
  assert.equal(supply.nodes.includes('rail:left:plus:upper'), true)
  assert.equal(supply.nodes.includes('rail:left:plus:lower'), false)
  assert.equal(supply.nodes.includes('rail:right:plus:upper'), false)

  const ground = expectNet(netlist, { componentId: 'arduino', portId: 'gnd' }, [
    { componentId: 'arduino', portId: 'gnd' },
    { componentId: 'breadboard', portId: 'minus' },
    { componentId: 'buzzer', portId: 'gnd' },
    { componentId: 'led', portId: 'cathode' },
    { componentId: 'pir', portId: 'gnd' },
  ])
  assert.equal(ground.name, 'GND')
  assert.equal(ground.nodes.includes('rail:left:minus:upper'), true)

  expectNet(netlist, { componentId: 'arduino', portId: 'd2' }, [
    { componentId: 'arduino', portId: 'd2' },
    { componentId: 'pir', portId: 'out' },
  ])
  expectNet(netlist, { componentId: 'arduino', portId: 'd8' }, [
    { componentId: 'arduino', portId: 'd8' },
    { componentId: 'resistor', portId: 'leg1' },
  ])
  expectNet(netlist, { componentId: 'resistor', portId: 'leg2' }, [
    { componentId: 'led', portId: 'anode' },
    { componentId: 'resistor', portId: 'leg2' },
  ])
  expectNet(netlist, { componentId: 'arduino', portId: 'd9' }, [
    { componentId: 'arduino', portId: 'd9' },
    { componentId: 'buzzer', portId: 'sig' },
  ])

  assert.equal(
    sameNet(netlist, { componentId: 'arduino', portId: 'd8' }, { componentId: 'led', portId: 'anode' }),
    false,
  )
  assert.equal(
    sameNet(netlist, { componentId: 'arduino', portId: 'd2' }, { componentId: 'arduino', portId: 'd9' }),
    false,
  )
  assert.equal(
    sameNet(netlist, { componentId: 'resistor', portId: 'leg1' }, { componentId: 'resistor', portId: 'leg2' }),
    false,
  )

  const led = netlist.components.find((component) => component.id === 'led')
  assert.equal(led?.pins.find((pin) => pin.portId === 'anode')?.polarity, 'anode')
  assert.equal(led?.pins.find((pin) => pin.portId === 'cathode')?.polarity, 'cathode')
  const unused = netlist.components.find((component) => component.id === 'arduino')?.pins.find((pin) => pin.portId === '3v3')
  assert.equal(unused?.netId, null)
  assert.equal(unused?.role, 'power-source')
})

test('project 18 keeps servo positive off the Uno 5 V net', () => {
  // The authored connections give the servos the adapter positive pin and join the grounds.
  // hardwareTested is still false. This does not treat that supply path as bench-checked.
  const netlist = buildSchematicNetlist(SERVO_PAN_TILT_CAMERA_LAYOUT, SERVO_PAN_TILT_CAMERA_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  assert.equal(netlist.links.length, SERVO_PAN_TILT_CAMERA_CONNECTIONS.length)

  const logic = expectNet(netlist, { componentId: 'arduino', portId: '5v' }, [
    { componentId: 'arduino', portId: '5v' },
    { componentId: 'breadboard', portId: 'logic-plus' },
    { componentId: 'joystick', portId: '5v' },
  ])
  assert.equal(logic.name, 'arduino:5v')
  assert.equal(logic.nodes.includes('rail:left:plus:upper'), true)
  assert.equal(logic.nodes.includes('rail:right:plus:upper'), false)

  const servo = expectNet(netlist, { componentId: 'psu', portId: '5v' }, [
    { componentId: 'pan', portId: 'vcc' },
    { componentId: 'psu', portId: '5v' },
    { componentId: 'tilt', portId: 'vcc' },
  ])
  assert.equal(servo.kind, 'power')
  assert.equal(servo.name, 'psu:5v')
  assert.deepEqual(servo.sources, [{ componentId: 'psu', portId: '5v' }])
  assert.equal(servo.nodes.some((node) => node.startsWith('rail:')), false)
  assert.equal(sameNet(netlist, { componentId: 'psu', portId: '5v' }, { componentId: 'arduino', portId: '5v' }), false)

  expectNet(netlist, { componentId: 'arduino', portId: 'gnd' }, [
    { componentId: 'arduino', portId: 'gnd' },
    { componentId: 'breadboard', portId: 'gnd' },
    { componentId: 'joystick', portId: 'gnd' },
    { componentId: 'pan', portId: 'gnd' },
    { componentId: 'psu', portId: 'gnd' },
    { componentId: 'tilt', portId: 'gnd' },
  ])
  expectNet(netlist, { componentId: 'arduino', portId: 'd9' }, [
    { componentId: 'arduino', portId: 'd9' },
    { componentId: 'pan', portId: 'sig' },
  ])
  expectNet(netlist, { componentId: 'arduino', portId: 'd10' }, [
    { componentId: 'arduino', portId: 'd10' },
    { componentId: 'tilt', portId: 'sig' },
  ])
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd9' }, { componentId: 'arduino', portId: 'd10' }), false)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a0' }, { componentId: 'arduino', portId: 'a1' }), false)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a0' }, { componentId: 'arduino', portId: 'd2' }), false)
})

test('project 23 keeps SDA and SCL apart and powers the BME280 from 3V3', () => {
  const netlist = buildSchematicNetlist(ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  assert.equal(netlist.links.length, ESP32_WIFI_WEATHER_CONNECTIONS.length)

  const supply = expectNet(netlist, { componentId: 'esp32', portId: '3v3' }, [
    { componentId: 'bme280', portId: 'vin' },
    { componentId: 'esp32', portId: '3v3' },
  ])
  assert.equal(supply.name, 'esp32:3v3')
  assert.equal(supply.kind, 'power')
  expectNet(netlist, { componentId: 'esp32', portId: 'gnd' }, [
    { componentId: 'bme280', portId: 'gnd' },
    { componentId: 'esp32', portId: 'gnd' },
  ])
  expectNet(netlist, { componentId: 'esp32', portId: 'io21' }, [
    { componentId: 'bme280', portId: 'sdi' },
    { componentId: 'esp32', portId: 'io21' },
  ])
  expectNet(netlist, { componentId: 'esp32', portId: 'io22' }, [
    { componentId: 'bme280', portId: 'sck' },
    { componentId: 'esp32', portId: 'io22' },
  ])
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io21' }, { componentId: 'esp32', portId: 'io22' }), false)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: '3v3' }, { componentId: 'esp32', portId: 'gnd' }), false)
  assert.equal(netlist.nets.every((net) => net.nodes.length === 0), true)
})

test('project 24 keeps each LED channel on its own path', () => {
  const netlist = buildSchematicNetlist(ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  assert.equal(netlist.links.length, ESP32_BLE_RGB_CONNECTIONS.length)

  const supply = expectNet(netlist, { componentId: 'led', portId: 'anode' }, [
    { componentId: 'breadboard', portId: 'plus' },
    { componentId: 'esp32', portId: 'v5' },
    { componentId: 'led', portId: 'anode' },
  ])
  assert.equal(supply.name, 'esp32:v5')
  assert.equal(supply.nodes.includes('rail:left:plus:upper'), true)
  assert.equal(supply.nodes.includes('rail:right:plus:upper'), true)
  assert.equal(supply.nodes.includes('rail:left:plus:lower'), false)
  assert.equal(
    sameNet(netlist, { componentId: 'led', portId: 'anode' }, { componentId: 'led', portId: 'red' }),
    false,
  )

  expectNet(netlist, { componentId: 'esp32', portId: 'gnd' }, [
    { componentId: 'breadboard', portId: 'minus' },
    { componentId: 'esp32', portId: 'gnd' },
    { componentId: 'q-blue', portId: 'emitter' },
    { componentId: 'q-green', portId: 'emitter' },
    { componentId: 'q-red', portId: 'emitter' },
  ])

  for (const colour of ['red', 'green', 'blue'] as const) {
    expectNet(netlist, { componentId: 'esp32', portId: colour === 'red' ? 'io25' : colour === 'green' ? 'io26' : 'io27' }, [
      { componentId: `base-${colour}`, portId: 'leg1' },
      { componentId: 'esp32', portId: colour === 'red' ? 'io25' : colour === 'green' ? 'io26' : 'io27' },
    ])
    expectNet(netlist, { componentId: `q-${colour}`, portId: 'base' }, [
      { componentId: `base-${colour}`, portId: 'leg2' },
      { componentId: `q-${colour}`, portId: 'base' },
    ])
    expectNet(netlist, { componentId: `q-${colour}`, portId: 'collector' }, [
      { componentId: `limit-${colour}`, portId: 'leg1' },
      { componentId: `q-${colour}`, portId: 'collector' },
    ])
    expectNet(netlist, { componentId: 'led', portId: colour }, [
      { componentId: 'led', portId: colour },
      { componentId: `limit-${colour}`, portId: 'leg2' },
    ])
    const transistor = netlist.components.find((component) => component.id === `q-${colour}`)
    assert.deepEqual(
      transistor?.pins.map((pin) => pin.polarity),
      ['base', 'collector', 'emitter'],
    )
    const base = netByMember(netlist, `q-${colour}`, 'base')
    const collector = netByMember(netlist, `q-${colour}`, 'collector')
    const emitter = netByMember(netlist, `q-${colour}`, 'emitter')
    assert.equal(base?.id === collector?.id, false)
    assert.equal(collector?.id === emitter?.id, false)
    assert.equal(base?.id === emitter?.id, false)
  }

  assert.equal(sameNet(netlist, { componentId: 'led', portId: 'red' }, { componentId: 'led', portId: 'green' }), false)
  assert.equal(sameNet(netlist, { componentId: 'led', portId: 'green' }, { componentId: 'led', portId: 'blue' }), false)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io25' }, { componentId: 'esp32', portId: 'io26' }), false)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io26' }, { componentId: 'q-green', portId: 'base' }), false)

  const led = netlist.components.find((component) => component.id === 'led')
  assert.equal(led?.pins.find((pin) => pin.portId === 'anode')?.polarity, 'anode')
  assert.equal(led?.pins.find((pin) => pin.portId === 'red')?.polarity, 'cathode')
  assert.equal(led?.pins.find((pin) => pin.portId === 'green')?.polarity, 'cathode')
  assert.equal(led?.pins.find((pin) => pin.portId === 'blue')?.polarity, 'cathode')
  assert.equal(led?.catalogueId, 'rgb-led-ca')
})

test('project 25 shares 5 V and ground and keeps the module signals apart', () => {
  const netlist = buildSchematicNetlist(LED_MATRIX_MAZE_LAYOUT, LED_MATRIX_MAZE_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  assert.equal(netlist.links.length, LED_MATRIX_MAZE_CONNECTIONS.length)

  const supply = expectNet(netlist, { componentId: 'arduino', portId: '5v' }, [
    { componentId: 'arduino', portId: '5v' },
    { componentId: 'breadboard', portId: 'plus' },
    { componentId: 'joystick', portId: 'vcc' },
    { componentId: 'matrix', portId: 'vcc' },
  ])
  assert.equal(supply.name, 'arduino:5v')
  assert.equal(supply.nodes.includes('rail:left:plus:upper'), true)
  assert.equal(supply.nodes.includes('rail:right:plus:upper'), false)

  expectNet(netlist, { componentId: 'arduino', portId: 'gnd' }, [
    { componentId: 'arduino', portId: 'gnd' },
    { componentId: 'breadboard', portId: 'minus' },
    { componentId: 'joystick', portId: 'gnd' },
    { componentId: 'matrix', portId: 'gnd' },
  ])
  expectNet(netlist, { componentId: 'matrix', portId: 'clk' }, [
    { componentId: 'arduino', portId: 'd13' },
    { componentId: 'matrix', portId: 'clk' },
  ])
  expectNet(netlist, { componentId: 'matrix', portId: 'cs' }, [
    { componentId: 'arduino', portId: 'd10' },
    { componentId: 'matrix', portId: 'cs' },
  ])
  expectNet(netlist, { componentId: 'matrix', portId: 'din' }, [
    { componentId: 'arduino', portId: 'd11' },
    { componentId: 'matrix', portId: 'din' },
  ])
  expectNet(netlist, { componentId: 'joystick', portId: 'vrx' }, [
    { componentId: 'arduino', portId: 'a0' },
    { componentId: 'joystick', portId: 'vrx' },
  ])
  expectNet(netlist, { componentId: 'joystick', portId: 'vry' }, [
    { componentId: 'arduino', portId: 'a1' },
    { componentId: 'joystick', portId: 'vry' },
  ])
  expectNet(netlist, { componentId: 'joystick', portId: 'sw' }, [
    { componentId: 'arduino', portId: 'd2' },
    { componentId: 'joystick', portId: 'sw' },
  ])
  assert.equal(sameNet(netlist, { componentId: 'matrix', portId: 'clk' }, { componentId: 'matrix', portId: 'din' }), false)
  assert.equal(sameNet(netlist, { componentId: 'joystick', portId: 'vrx' }, { componentId: 'joystick', portId: 'sw' }), false)
})

test('a missing pin is reported and left out of the nets', () => {
  const connections: StepConnection[] = [
    ...MOTION_SENSOR_ALARM_CONNECTIONS,
    { fromComponent: 'Arduino Uno', fromPin: 'D99', toComponent: 'PIR', toPin: 'OUT', signal: 'signal' },
  ]
  const netlist = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, connections)
  assert.equal(netlist.links.length, MOTION_SENSOR_ALARM_CONNECTIONS.length)
  assert.equal(netlist.issues.some((issue) => issue.code === 'unknown-pin' && issue.message.includes('D99')), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd2' }, { componentId: 'arduino', portId: 'd8' }), false)
})

test('an ambiguous pin is not silently assigned', () => {
  const layout = structuredClone(MOTION_SENSOR_ALARM_LAYOUT) as WiringLayout
  const arduino = layout.elements.find((element) => element.id === 'arduino')
  const d8 = arduino?.ports.find((port) => port.id === 'd8')
  assert.ok(d8)
  d8.aliases = [...d8.aliases, 'd2']
  const netlist = buildSchematicNetlist(layout, MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.equal(netlist.issues.some((issue) => issue.code === 'ambiguous-pin'), true)
  assert.equal(netlist.links.some((link) => link.from.portId === 'd2' || link.to.portId === 'd2'), false)
})

test('joining the adapter positive pin to Uno 5 V is reported as two supplies', () => {
  const layout = structuredClone(SERVO_PAN_TILT_CAMERA_LAYOUT) as WiringLayout
  layout.physical?.jumpers.push({
    id: 'supply-short',
    gender: 'male-male',
    from: { kind: 'module', elementId: 'psu', portId: '5v' },
    to: { kind: 'module', elementId: 'arduino', portId: '5v' },
  })
  const connections: StepConnection[] = [
    ...SERVO_PAN_TILT_CAMERA_CONNECTIONS,
    { fromComponent: 'Adafruit 368', fromPin: '5V', toComponent: 'Arduino Uno', toPin: '5V', signal: 'power' },
  ]
  const netlist = buildSchematicNetlist(layout, connections)
  assert.equal(netlist.issues.some((issue) => issue.code === 'distinct-supplies-merged'), true)
  assert.equal(sameNet(netlist, { componentId: 'psu', portId: '5v' }, { componentId: 'arduino', portId: '5v' }), true)
})

test('an unknown component is reported and that connection is not dropped quietly into a net', () => {
  const connections: StepConnection[] = [
    ...MOTION_SENSOR_ALARM_CONNECTIONS,
    { fromComponent: 'Not a part', fromPin: '5V', toComponent: 'PIR', toPin: 'VCC', signal: 'power' },
  ]
  const netlist = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, connections)
  assert.equal(netlist.links.length, MOTION_SENSOR_ALARM_CONNECTIONS.length)
  assert.equal(netlist.issues.some((issue) => issue.code === 'unknown-component' && issue.message.includes('Not a part')), true)
})

test('a declared connection that the breadboard does not make is reported', () => {
  const connections: StepConnection[] = [
    ...MOTION_SENSOR_ALARM_CONNECTIONS,
    { fromComponent: 'Arduino Uno', fromPin: 'D8', toComponent: 'Arduino Uno', toPin: 'D9', signal: 'signal' },
  ]
  const netlist = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, connections)
  assert.equal(netlist.issues.some((issue) => issue.code === 'connection-open'), true)
  assert.equal(netlist.issues.some((issue) => issue.code === 'controller-pins-joined'), true)
})

test('a supply pin tied to ground is reported', () => {
  const layout = structuredClone(MOTION_SENSOR_ALARM_LAYOUT) as WiringLayout
  layout.physical?.jumpers.push({
    id: 'power-ground',
    gender: 'male-male',
    from: { kind: 'rail', side: 'left', polarity: 'plus', row: 4 },
    to: { kind: 'rail', side: 'left', polarity: 'minus', row: 4 },
  })
  const connections: StepConnection[] = [
    ...MOTION_SENSOR_ALARM_CONNECTIONS,
    { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'Arduino Uno', toPin: 'GND', signal: 'power' },
  ]
  const netlist = buildSchematicNetlist(layout, connections)
  assert.equal(netlist.issues.some((issue) => issue.code === 'power-ground-short'), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: '5v' }, { componentId: 'arduino', portId: 'gnd' }), true)
})

test('a placed pin missing from the connection list is reported', () => {
  const connections = MOTION_SENSOR_ALARM_CONNECTIONS.filter(
    (connection) => connection.fromPin !== 'cathode' && connection.toPin !== 'cathode',
  )
  const netlist = buildSchematicNetlist(MOTION_SENSOR_ALARM_LAYOUT, connections)
  assert.equal(
    netlist.issues.some((issue) => issue.code === 'unlisted-physical-pin' && issue.message.includes('cathode')),
    true,
  )
  assert.equal(netByMember(netlist, 'led', 'cathode'), null)
})

test('duplicate port ids are reported', () => {
  const layout = structuredClone(MOTION_SENSOR_ALARM_LAYOUT) as WiringLayout
  const arduino = layout.elements.find((element) => element.id === 'arduino')
  assert.ok(arduino)
  arduino.ports.push({ ...arduino.ports[0] })
  const netlist = buildSchematicNetlist(layout, MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.equal(netlist.issues.some((issue) => issue.code === 'duplicate-port'), true)
})

test('a breadboard short is reported without merging the connection nets', () => {
  const layout = structuredClone(MOTION_SENSOR_ALARM_LAYOUT) as WiringLayout
  layout.physical?.jumpers.push({
    id: 'rail-short',
    gender: 'male-male',
    from: { kind: 'rail', side: 'left', polarity: 'plus', row: 4 },
    to: { kind: 'rail', side: 'left', polarity: 'minus', row: 4 },
  })
  const netlist = buildSchematicNetlist(layout, MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.equal(netlist.issues.some((issue) => issue.code === 'breadboard-shorts-nets'), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: '5v' }, { componentId: 'arduino', portId: 'gnd' }), false)
})

test('the centre gap and a rail break stay open unless a jumper closes them', () => {
  const layout = board([
    ['left-a', 'a'],
    ['left-b', 'b'],
    ['right-a', 'a'],
    ['lower-a', 'a'],
    ['lower-b', 'b'],
  ])
  layout.physical = {
    rows: 17,
    railSplitAfter: 15,
    leads: [
      { elementId: 'left-a', portId: 'a', hole: { kind: 'strip', column: 'e', row: 5 } },
      { elementId: 'left-b', portId: 'b', hole: { kind: 'strip', column: 'c', row: 5 } },
      { elementId: 'right-a', portId: 'a', hole: { kind: 'strip', column: 'f', row: 5 } },
      { elementId: 'lower-a', portId: 'a', hole: { kind: 'rail', side: 'left', polarity: 'plus', row: 16 } },
      { elementId: 'lower-b', portId: 'b', hole: { kind: 'rail', side: 'left', polarity: 'plus', row: 1 } },
    ],
    jumpers: [],
    railBindings: [],
  }
  const groups = physicalElectricalGroups(layout)
  const roots = new Map<string, string>()
  for (const [root, members] of groups) {
    for (const member of members) {
      roots.set(member, root)
    }
  }
  assert.equal(roots.get('left-a:a'), roots.get('left-b:b'))
  assert.equal(roots.get('left-a:a') === roots.get('right-a:a'), false)
  assert.equal(roots.get('lower-a:a') === roots.get('lower-b:b'), false)

  layout.physical.jumpers.push({
    id: 'across-gap',
    gender: 'male-male',
    from: { kind: 'strip', column: 'e', row: 5 },
    to: { kind: 'strip', column: 'f', row: 5 },
  })
  layout.physical.jumpers.push({
    id: 'across-break',
    gender: 'male-male',
    from: { kind: 'rail', side: 'left', polarity: 'plus', row: 15 },
    to: { kind: 'rail', side: 'left', polarity: 'plus', row: 16 },
  })
  const joined = physicalElectricalGroups(layout)
  const joinedRoots = new Map<string, string>()
  for (const [root, members] of joined) {
    for (const member of members) {
      joinedRoots.set(member, root)
    }
  }
  assert.equal(joinedRoots.get('left-a:a'), joinedRoots.get('right-a:a'))
  assert.equal(joinedRoots.get('lower-a:a'), joinedRoots.get('lower-b:b'))
})

function board(parts: [string, string][]): WiringLayout {
  return {
    slug: 'synthetic',
    width: 10,
    height: 10,
    elements: parts.map(([id, portId]) => pinElement(id, 'resistor', [portId])),
  }
}

function pinElement(id: string, kind: WiringSymbolKind, ports: string[]): WiringElementDef {
  return {
    id,
    kind,
    label: id,
    aliases: [id],
    x: 4,
    y: 8,
    width: 12,
    height: 16,
    ports: ports.map((portId) => ({
      id: portId,
      label: portId,
      dx: 1,
      dy: 2,
      aliases: [portId],
    })),
  }
}
