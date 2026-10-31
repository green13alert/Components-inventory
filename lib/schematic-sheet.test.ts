import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { MOTION_SENSOR_ALARM_CONNECTIONS, MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import type { StepConnection } from '../constants/walkthrough-content.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { boxesOverlap, junctionsFromWires, segmentHitsBox, segmentIntersection, segmentsOf } from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember } from './schematic-nets.ts'
import { buildMotionSchematic, mergeConnections, type SchematicSheet, type SchematicSymbol } from './schematic-sheet.ts'
import { kicadLedSource, ledArrowBox, ledDrawing } from './schematic-symbols.ts'
import { collectPriorWiringConnections } from './wiring-diagram.ts'

const layout = MOTION_SENSOR_ALARM_LAYOUT
const jumpers = layout.physical?.jumpers.map((jumper) => jumper.id) ?? []
const parts = ['arduino', 'pir', 'resistor', 'led', 'buzzer']

function finishedSheet(): SchematicSheet {
  return buildMotionSchematic({
    layout,
    connections: MOTION_SENSOR_ALARM_CONNECTIONS,
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

test('the LED drawing is the mirrored KiCad 9.0.7 Device:LED symbol', () => {
  const source = kicadLedSource()
  const drawing = ledDrawing(72, 18)
  assert.equal(drawing.anode.x < drawing.cathode.x, true)
  assert.equal(drawing.anode.y, drawing.cathode.y)
  assert.equal(drawing.bar[0].x, drawing.bar[1].x)
  assert.equal(drawing.triangle[2].x, drawing.bar[0].x)
  assert.equal(drawing.triangle[2].y, drawing.anode.y)
  assert.equal(drawing.triangle[0].x < drawing.triangle[2].x, true)
  const center = { x: (source.anode.x + source.cathode.x) / 2, y: 0 }
  for (const arrow of source.arrows) {
    const tail = arrow[0]
    const tip = arrow[1]
    const tailDistance = Math.hypot(tail.x - center.x, tail.y - center.y)
    const tipDistance = Math.hypot(tip.x - center.x, tip.y - center.y)
    assert.equal(tipDistance > tailDistance, true)
  }
  assert.equal(source.bar.length, 2)
  assert.equal(source.bar[0].x, source.bar[1].x)
  const again = ledDrawing(72, 18)
  assert.deepEqual(again, drawing)
})

test('junction dots follow routed branches, not pin counts or crossings', () => {
  const tee = junctionsFromWires([
    { netId: 'a', points: [{ x: 0, y: 0 }, { x: 40, y: 0 }] },
    { netId: 'a', points: [{ x: 20, y: 0 }, { x: 20, y: 20 }] },
  ])
  assert.deepEqual(tee, [{ x: 20, y: 0, netId: 'a' }])

  const crossing = junctionsFromWires([
    { netId: 'a', points: [{ x: 0, y: 10 }, { x: 40, y: 10 }] },
    { netId: 'b', points: [{ x: 20, y: 0 }, { x: 20, y: 40 }] },
  ])
  assert.deepEqual(crossing, [])

  const bend = junctionsFromWires([{ netId: 'a', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }] }])
  assert.deepEqual(bend, [])
})

test('the finished Project 8 sheet matches the validated nets', () => {
  const sheet = finishedSheet()
  assert.deepEqual(sheet.issues, [], sheet.issues.map((issue) => issue.message).join('\n'))
  assert.equal(sheet.verified, true)

  const again = finishedSheet()
  assert.deepEqual(again, sheet)

  const netlist = buildSchematicNetlist(layout, MOTION_SENSOR_ALARM_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  for (const wire of sheet.wires) {
    const net = netlist.nets.find((item) => item.id === wire.netId)
    assert.ok(net)
    assert.equal(wire.netName, net.name)
    assert.equal(wire.points.length >= 2, true)
    for (const point of [wire.points[0], wire.points[wire.points.length - 1]]) {
      const onPin = sheet.symbols.some((item) => item.pins.some((endpoint) => endpoint.netId === wire.netId && endpoint.x === point.x && endpoint.y === point.y))
      const onAnchor = sheet.symbols.some((item) => item.netId === wire.netId && item.anchor?.x === point.x && item.anchor.y === point.y)
      assert.equal(onPin || onAnchor, true, `${wire.netName} ends away from a pin`)
    }
  }

  assert.deepEqual(symbol(sheet, 'arduino').pins.map((item) => item.portId), ['5v', 'd2', 'd8', 'd9', 'gnd'])
  assert.deepEqual(symbol(sheet, 'pir').pins.map((item) => item.portId), ['vcc', 'out', 'gnd'])
  assert.equal(symbol(sheet, 'resistor').pins.length, 2)
  assert.deepEqual(symbol(sheet, 'led').pins.map((item) => item.portId), ['anode', 'cathode'])
  assert.deepEqual(symbol(sheet, 'buzzer').pins.map((item) => item.portId), ['sig', 'vcc', 'gnd'])

  const refs = ['U1', 'U2', 'R1', 'D1', 'BZ1']
  assert.deepEqual(sheet.symbols.filter((item) => item.ref).map((item) => item.ref).sort(), [...refs].sort())
  assert.equal(symbol(sheet, 'arduino').value, 'Uno R3')
  assert.equal(symbol(sheet, 'resistor').value, '220 Ω')
  assert.equal(symbol(sheet, 'led').value, 'LED')
  assert.equal(symbol(sheet, 'buzzer').value, 'Active')
  assert.equal(getCatalogueComponent('buzzer')?.name, 'Active buzzer')
  assert.equal(getCatalogueComponent('resistor-220')?.name.includes('220') || layout.elements.find((item) => item.id === 'resistor')?.resistorOhms === 220, true)
  assert.equal(layout.elements.find((item) => item.id === 'arduino')?.identity?.catalogueId, 'arduino-uno-r3')
  assert.equal(sheet.symbols.some((item) => item.id === 'breadboard'), false)

  const anode = pin(sheet, 'led', 'anode')
  const cathode = pin(sheet, 'led', 'cathode')
  assert.equal(anode.netId === cathode.netId, false)
  assert.equal(anode.x < cathode.x, true)
  const anodeNet = netByMember(netlist, 'led', 'anode')
  const cathodeNet = netByMember(netlist, 'led', 'cathode')
  assert.equal(anode.netId, anodeNet?.id)
  assert.equal(cathode.netId, cathodeNet?.id)
  assert.equal(anodeNet?.members.some((member) => member.componentId === 'resistor' && member.portId === 'leg2'), true)
  assert.equal(cathodeNet?.kind, 'ground')
  assert.equal(netByMember(netlist, 'resistor', 'leg1')?.id === anodeNet?.id, false)
  assert.equal(pin(sheet, 'resistor', 'leg1').netId, netByMember(netlist, 'arduino', 'd8')?.id)
  assert.equal(pin(sheet, 'pir', 'out').netId, netByMember(netlist, 'arduino', 'd2')?.id)
  assert.equal(pin(sheet, 'buzzer', 'sig').netId, netByMember(netlist, 'arduino', 'd9')?.id)

  const power = netByMember(netlist, 'arduino', '5v')
  const ground = netByMember(netlist, 'arduino', 'gnd')
  assert.ok(power && ground)
  assert.equal(power.id === ground.id, false)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').every((item) => item.netId === power.id && item.value === '+5V'), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.netId === ground.id && item.value === 'GND'), true)
  assert.equal(sheet.symbols.some((item) => item.kind === 'power' && item.netId === ground.id), false)

  for (const drawn of ['5v', 'gnd', 'd2', 'd8', 'd9'] as const) {
    const endpoint = pin(sheet, 'arduino', drawn)
    assert.equal(endpoint.netId, netByMember(netlist, 'arduino', drawn)?.id)
    assert.equal(wireTouches(sheet, endpoint.x, endpoint.y, endpoint.netId), true)
  }
  for (const [componentId, portId] of [
    ['pir', 'vcc'],
    ['pir', 'out'],
    ['pir', 'gnd'],
    ['resistor', 'leg1'],
    ['resistor', 'leg2'],
    ['led', 'anode'],
    ['led', 'cathode'],
    ['buzzer', 'vcc'],
    ['buzzer', 'sig'],
    ['buzzer', 'gnd'],
  ] as const) {
    const endpoint = pin(sheet, componentId, portId)
    assert.equal(wireTouches(sheet, endpoint.x, endpoint.y, endpoint.netId), true)
  }

  const ledGround = sheet.symbols.find((item) => item.id === 'ground:led:cathode')
  const buzzerPower = sheet.symbols.find((item) => item.id === 'power:buzzer:vcc')
  const unoPower = sheet.symbols.find((item) => item.id === 'power:arduino:5v')
  const unoGround = sheet.symbols.find((item) => item.id === 'ground:arduino:gnd')
  assert.ok(ledGround && buzzerPower && unoPower && unoGround)
  for (const item of sheet.symbols.filter((entry) => entry.kind === 'ground')) {
    assert.equal(item.anchor?.y, item.y, `${item.id} ground`)
    assert.equal(item.anchor?.x, item.x + item.width / 2)
    assert.equal(item.width, unoGround.width)
    assert.equal(item.height, unoGround.height)
  }
  for (const item of sheet.symbols.filter((entry) => entry.kind === 'power')) {
    assert.equal(item.anchor?.y, item.y + item.height, `${item.id} power`)
    assert.equal(item.anchor?.x, item.x + item.width / 2)
    assert.equal(item.width, unoPower.width)
    assert.equal(item.height, unoPower.height)
    assert.equal(item.value, '+5V')
  }
  const cathodeWire = sheet.wires.find((wire) => wire.points[0].x === cathode.x && wire.points[0].y === cathode.y)
  assert.ok(cathodeWire)
  assert.equal(cathodeWire.netId, cathode.netId)
  assert.deepEqual(cathodeWire.points, [
    { x: cathode.x, y: cathode.y },
    { x: cathode.x + 36, y: cathode.y },
    { x: cathode.x + 36, y: cathode.y + 32 },
  ])
  assert.equal(cathodeWire.points[2].x, ledGround.anchor?.x)
  assert.equal(cathodeWire.points[2].y, ledGround.anchor?.y)
  const vcc = pin(sheet, 'buzzer', 'vcc')
  const vccWire = sheet.wires.find((wire) => wire.points[0].x === vcc.x && wire.points[0].y === vcc.y)
  assert.ok(vccWire)
  assert.equal(vccWire.netId, power.id)
  assert.equal(vccWire.points[2].y < vcc.y, true)
  assert.equal(vccWire.points[1].y, vcc.y)
  assert.equal(vccWire.points[2].x, vccWire.points[1].x)
  assert.ok(buzzerPower.anchor)
  assert.equal(buzzerPower.anchor.y < symbol(sheet, 'buzzer').y, true)
  const ledSymbol = symbol(sheet, 'led')
  const arrows = ledArrowBox({ x: ledSymbol.x, y: ledSymbol.y }, ledSymbol.width, anode.y - ledSymbol.y)
  for (const wire of sheet.wires) {
    for (let index = 1; index < wire.points.length; index += 1) {
      assert.equal(segmentHitsBox(wire.points[index - 1], wire.points[index], arrows), false, wire.netName)
    }
  }

  const bodies = sheet.symbols.map((item) => ({ x: item.x, y: item.y, width: item.width, height: item.height, id: item.id }))
  for (let index = 0; index < bodies.length; index += 1) {
    for (let other = index + 1; other < bodies.length; other += 1) {
      assert.equal(boxesOverlap(bodies[index], bodies[other]), false, `${bodies[index].id} overlaps ${bodies[other].id}`)
    }
  }
  for (const label of sheet.labels) {
    for (const body of sheet.symbols) {
      assert.equal(boxesOverlap(label, body), false, `${label.text} overlaps ${body.id}`)
    }
  }
  for (const label of sheet.labels) {
    for (const wire of sheet.wires) {
      const segments = segmentsOf([wire])
      for (const segment of segments) {
        assert.equal(
          segmentHits(segment, label),
          false,
          `${label.text} crosses ${wire.netName}`,
        )
      }
    }
  }

  const segments = segmentsOf(sheet.wires)
  for (let index = 0; index < segments.length; index += 1) {
    for (let other = index + 1; other < segments.length; other += 1) {
      const hit = segmentIntersection(segments[index], segments[other])
      if (!hit) {
        continue
      }
      assert.equal(segments[index].netId, segments[other].netId)
      assert.equal(sheet.junctions.some((junction) => junction.x === hit.x && junction.y === hit.y), false)
    }
  }
  const netsAtJunction = new Map<string, string>()
  for (const junction of sheet.junctions) {
    const key = `${junction.x},${junction.y}`
    const previous = netsAtJunction.get(key)
    assert.equal(previous == null || previous === junction.netId, true)
    netsAtJunction.set(key, junction.netId)
  }
})

test('tutorial steps reveal only the connections made so far', () => {
  const wiring = MOTION_SENSOR_ALARM_STEPS.flatMap((step, index) =>
    step.blocks.filter((block) => block.type === 'wiring').map((block) => ({ index, block })),
  )
  assert.equal(wiring.length, 5)
  for (const item of wiring) {
    assert.equal(item.block.type, 'wiring')
    const prior = collectPriorWiringConnections(MOTION_SENSOR_ALARM_STEPS, item.index)
    const assembly = resolveAssembly(MOTION_SENSOR_ALARM_STEPS, item.index, 'current', layout.physical?.fixtures ?? [])
    const sheet = buildMotionSchematic({
      layout,
      connections: item.block.connections,
      priorConnections: prior,
      installedPartIds: assembly.installedParts,
      installedJumperIds: assembly.installedJumpers,
    })
    assert.deepEqual(sheet.issues, [], `step ${item.index}: ${sheet.issues.map((issue) => issue.message).join('; ')}`)
    assert.equal(sheet.verified, true)
    if (item.block.connections.length === 0 && prior.length === 0) {
      assert.equal(sheet.wires.length, 0)
      assert.deepEqual(sheet.symbols.map((itemSymbol) => itemSymbol.id), ['arduino'])
    }
    for (const part of ['pir', 'resistor', 'led', 'buzzer']) {
      const present = sheet.symbols.some((itemSymbol) => itemSymbol.id === part)
      assert.equal(present, assembly.installedParts.includes(part))
    }
    for (const wire of sheet.wires) {
      assert.equal(visibleHasNet(item.block.connections, prior, wire.netId), true)
    }
  }
})

test('an unknown pin is not drawn as a connection', () => {
  const connections: StepConnection[] = [
    ...MOTION_SENSOR_ALARM_CONNECTIONS,
    { fromComponent: 'Arduino Uno', fromPin: 'D99', toComponent: 'PIR', toPin: 'OUT', signal: 'signal' },
  ]
  const sheet = buildMotionSchematic({
    layout,
    connections,
    installedPartIds: parts,
    installedJumperIds: jumpers,
  })
  assert.equal(sheet.verified, false)
  assert.equal(sheet.symbols.length, 0)
  assert.equal(sheet.wires.length, 0)
  assert.equal(sheet.issues.some((issue) => issue.code === 'unknown-pin'), true)
})

function wireTouches(sheet: SchematicSheet, x: number, y: number, netId: string | null): boolean {
  return sheet.wires.some((wire) => wire.netId === netId && wire.points.some((point) => point.x === x && point.y === y))
}

function segmentHits(segment: { x1: number; y1: number; x2: number; y2: number }, label: { x: number; y: number; width: number; height: number }): boolean {
  const from = { x: segment.x1, y: segment.y1 }
  const to = { x: segment.x2, y: segment.y2 }
  const crosses =
    from.x < label.x + label.width &&
    to.x > label.x &&
    Math.min(from.y, to.y) < label.y + label.height &&
    Math.max(from.y, to.y) > label.y &&
    from.y === to.y
  const vertical =
    from.y < label.y + label.height &&
    to.y > label.y &&
    Math.min(from.x, to.x) < label.x + label.width &&
    Math.max(from.x, to.x) > label.x &&
    from.x === to.x
  return crosses || vertical
}

function visibleHasNet(current: readonly StepConnection[], prior: readonly StepConnection[], netId: string): boolean {
  const visible = mergeConnections(prior, current)
  const netlist = buildSchematicNetlist(layout, visible.length > 0 ? MOTION_SENSOR_ALARM_CONNECTIONS.filter((connection) => visible.some((item) => connectionKeyMatch(item, connection))) : [])
  return netlist.nets.some((net) => net.id === netId)
}

function connectionKeyMatch(left: StepConnection, right: StepConnection): boolean {
  return left.fromComponent === right.fromComponent && left.fromPin === right.fromPin && left.toComponent === right.toComponent && left.toPin === right.toPin
}
