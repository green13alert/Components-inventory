import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { SERVO_PAN_TILT_CAMERA_CONNECTIONS, SERVO_PAN_TILT_CAMERA_STEPS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { boxesOverlap, junctionsFromWires, segmentHitsLabel, segmentsOf } from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember, sameNet } from './schematic-nets.ts'
import { buildServoSchematic, mergeConnections, type SchematicSheet, type SchematicSymbol } from './schematic-sheet.ts'
import { collectPriorWiringConnections } from './wiring-diagram.ts'

const layout = SERVO_PAN_TILT_CAMERA_LAYOUT
const jumpers = layout.physical?.jumpers.map((jumper) => jumper.id) ?? []
const parts = ['arduino', 'psu', 'pan', 'tilt', 'joystick']

function finishedSheet(): SchematicSheet {
  return buildServoSchematic({
    layout,
    connections: SERVO_PAN_TILT_CAMERA_CONNECTIONS,
    installedPartIds: parts,
    installedJumperIds: jumpers,
  })
}

function symbol(sheet: SchematicSheet, id: string): SchematicSymbol {
  const found = sheet.symbols.find((item) => item.id === id)
  assert.ok(found, id)
  return found
}

function pin(sheet: SchematicSheet, componentId: string, portId: string) {
  const found = symbol(sheet, componentId).pins.find((item) => item.portId === portId)
  assert.ok(found, `${componentId}:${portId}`)
  return found
}

test('project 18 keeps the servo supply off Uno 5V and shares ground', () => {
  const sheet = finishedSheet()
  assert.deepEqual(sheet.issues, [], sheet.issues.map((issue) => issue.message).join('\n'))
  assert.equal(sheet.verified, true)
  assert.deepEqual(finishedSheet(), sheet)

  const netlist = buildSchematicNetlist(layout, SERVO_PAN_TILT_CAMERA_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  const logic = netByMember(netlist, 'arduino', '5v')
  const servo = netByMember(netlist, 'psu', '5v')
  const ground = netByMember(netlist, 'arduino', 'gnd')
  assert.ok(logic && servo && ground)
  assert.equal(logic.id === servo.id, false)
  assert.equal(sameNet(netlist, { componentId: 'pan', portId: 'vcc' }, { componentId: 'tilt', portId: 'vcc' }), true)
  assert.equal(sameNet(netlist, { componentId: 'pan', portId: 'vcc' }, { componentId: 'psu', portId: '5v' }), true)
  assert.equal(sameNet(netlist, { componentId: 'pan', portId: 'vcc' }, { componentId: 'arduino', portId: '5v' }), false)
  assert.equal(sameNet(netlist, { componentId: 'joystick', portId: '5v' }, { componentId: 'arduino', portId: '5v' }), true)
  for (const member of ['arduino', 'joystick', 'pan', 'tilt', 'psu'] as const) {
    assert.equal(netByMember(netlist, member, 'gnd')?.id, ground.id)
  }
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a0' }, { componentId: 'joystick', portId: 'vrx' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a1' }, { componentId: 'joystick', portId: 'vry' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd2' }, { componentId: 'joystick', portId: 'sw' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd9' }, { componentId: 'pan', portId: 'sig' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd10' }, { componentId: 'tilt', portId: 'sig' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a0' }, { componentId: 'arduino', portId: 'a1' }), false)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd9' }, { componentId: 'arduino', portId: 'd10' }), false)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd2' }, { componentId: 'arduino', portId: 'a0' }), false)

  assert.deepEqual(symbol(sheet, 'arduino').pins.map((item) => item.portId), ['5v', 'a0', 'a1', 'd2', 'd9', 'd10', 'gnd'])
  assert.deepEqual(symbol(sheet, 'joystick').pins.map((item) => item.portId), ['5v', 'vrx', 'vry', 'sw', 'gnd'])
  assert.deepEqual(symbol(sheet, 'pan').pins.map((item) => item.portId), ['sig', 'vcc', 'gnd'])
  assert.deepEqual(symbol(sheet, 'tilt').pins.map((item) => item.portId), ['sig', 'vcc', 'gnd'])
  assert.deepEqual(symbol(sheet, 'psu').pins.map((item) => item.portId), ['5v', 'gnd'])
  assert.deepEqual(
    sheet.symbols.filter((item) => item.ref).map((item) => item.ref).sort(),
    ['J1', 'M1', 'M2', 'U1', 'U2'],
  )
  assert.equal(symbol(sheet, 'arduino').value, 'Uno R3')
  assert.equal(symbol(sheet, 'joystick').value, 'KY-023')
  assert.equal(symbol(sheet, 'pan').value, 'Pan')
  assert.equal(symbol(sheet, 'tilt').value, 'Tilt')
  assert.equal(symbol(sheet, 'psu').kind, 'connector')
  assert.equal(symbol(sheet, 'pan').kind, 'servo')
  assert.equal(symbol(sheet, 'tilt').kind, 'servo')
  assert.equal(getCatalogueComponent('adafruit-368')?.name, '2.1 mm jack to screw terminal')
  assert.equal(getCatalogueComponent('sg90')?.name, 'SG90 Micro Servo')
  assert.equal(sheet.symbols.some((item) => item.id === 'breadboard' || item.id === 'gst18a05-p1j'), false)

  for (const [componentId, portId] of [
    ['arduino', '5v'],
    ['joystick', '5v'],
    ['psu', '5v'],
    ['pan', 'vcc'],
    ['tilt', 'vcc'],
  ] as const) {
    const endpoint = pin(sheet, componentId, portId)
    const expected = componentId === 'arduino' || componentId === 'joystick' ? '+5V_LOGIC' : '+5V_SERVO'
    const wire = sheet.wires.find((item) => item.points[0]?.x === endpoint.x && item.points[0]?.y === endpoint.y)
    const supply = sheet.symbols.find((item) => item.kind === 'power' && item.anchor?.x === wire?.points.at(-1)?.x && item.anchor?.y === wire?.points.at(-1)?.y)
    assert.ok(wire && supply)
    assert.equal(endpoint.netId, (componentId === 'arduino' || componentId === 'joystick' ? logic : servo).id)
    assert.equal(wire.netId, endpoint.netId)
    assert.equal(supply.netId, endpoint.netId)
    assert.equal(supply.value, expected)
  }
  assert.equal(sheet.symbols.some((item) => item.kind === 'power' && item.netId === logic.id && item.value === '+5V_SERVO'), false)
  assert.equal(sheet.symbols.some((item) => item.kind === 'power' && item.netId === servo.id && item.value === '+5V_LOGIC'), false)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.netId === ground.id && item.value === 'GND'), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').every((item) => item.anchor?.y === item.y + item.height), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.anchor?.y === item.y), true)

  for (const wire of sheet.wires) {
    const net = netlist.nets.find((item) => item.id === wire.netId)
    assert.ok(net)
    const ends = [wire.points[0], wire.points[wire.points.length - 1]]
    for (const point of ends) {
      const onPin = sheet.symbols.some((item) => item.pins.some((endpoint) => endpoint.netId === wire.netId && endpoint.x === point.x && endpoint.y === point.y))
      const onAnchor = sheet.symbols.some((item) => item.netId === wire.netId && item.anchor?.x === point.x && item.anchor.y === point.y)
      assert.equal(onPin || onAnchor, true)
    }
    for (let index = 1; index < wire.points.length; index += 1) {
      const from = wire.points[index - 1]
      const to = wire.points[index]
      assert.equal(from.x === to.x || from.y === to.y, true)
    }
  }

  const bodies = sheet.symbols.map((item) => item)
  for (let index = 0; index < bodies.length; index += 1) {
    for (let other = index + 1; other < bodies.length; other += 1) {
      assert.equal(boxesOverlap(bodies[index], bodies[other]), false, `${bodies[index].id} overlaps ${bodies[other].id}`)
    }
  }
  for (const label of sheet.labels) {
    for (const body of sheet.symbols) {
      assert.equal(boxesOverlap(label, body), false, `${label.text} overlaps ${body.id}`)
    }
    for (const segment of segmentsOf(sheet.wires)) {
      assert.equal(segmentHitsLabel({ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }, label), false, label.text)
    }
  }
  const netsAt = new Map<string, string>()
  for (const junction of junctionsFromWires(sheet.wires)) {
    const key = `${junction.x},${junction.y}`
    const previous = netsAt.get(key)
    assert.equal(previous == null || previous === junction.netId, true)
    netsAt.set(key, junction.netId)
  }
})

test('project 18 tutorial steps reveal only the wiring made so far', () => {
  const wiring = SERVO_PAN_TILT_CAMERA_STEPS.flatMap((step, index) =>
    step.blocks.filter((block) => block.type === 'wiring').map((block) => ({ index, block })),
  )
  assert.equal(wiring.length, 5)
  for (const item of wiring) {
    assert.equal(item.block.type, 'wiring')
    const prior = collectPriorWiringConnections(SERVO_PAN_TILT_CAMERA_STEPS, item.index)
    const assembly = resolveAssembly(SERVO_PAN_TILT_CAMERA_STEPS, item.index, 'current', layout.physical?.fixtures ?? [])
    const sheet = buildServoSchematic({
      layout,
      connections: item.block.connections,
      priorConnections: prior,
      installedPartIds: assembly.installedParts,
      installedJumperIds: assembly.installedJumpers,
    })
    assert.deepEqual(sheet.issues, [], `step ${item.index}: ${sheet.issues.map((issue) => issue.message).join('; ')}`)
    assert.equal(sheet.verified, true)
    for (const part of ['psu', 'pan', 'tilt', 'joystick']) {
      assert.equal(sheet.symbols.some((entry) => entry.id === part), assembly.installedParts.includes(part))
    }
    assert.equal(sheet.symbols.some((entry) => entry.id === 'arduino'), true)
    const visible = mergeConnections(prior, item.block.connections)
    const visibleNets = buildSchematicNetlist(
      layout,
      SERVO_PAN_TILT_CAMERA_CONNECTIONS.filter((connection) => visible.some((itemConnection) =>
        itemConnection.fromComponent === connection.fromComponent &&
        itemConnection.fromPin === connection.fromPin &&
        itemConnection.toComponent === connection.toComponent &&
        itemConnection.toPin === connection.toPin,
      )),
    )
    for (const wire of sheet.wires) {
      assert.equal(visibleNets.nets.some((net) => net.id === wire.netId), true, wire.netName)
    }
    if (!assembly.installedParts.includes('pan')) {
      assert.equal(sheet.symbols.some((entry) => entry.value === '+5V_SERVO'), false)
    }
  }
})
