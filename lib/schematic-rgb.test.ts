import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_BLE_RGB_CONNECTIONS, ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { boxesOverlap, junctionsFromWires, segmentHitsLabel, segmentsOf } from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember, sameNet } from './schematic-nets.ts'
import { buildRgbSchematic, mergeConnections, type SchematicSheet, type SchematicSymbol } from './schematic-sheet.ts'
import { kicadNpnSource, ledDrawing, npnDrawing, RGB_DIODE_WIDTH } from './schematic-symbols.ts'
import { collectPriorWiringConnections } from './wiring-diagram.ts'

const layout = ESP32_BLE_RGB_LAYOUT
const jumpers = layout.physical?.jumpers.map((jumper) => jumper.id) ?? []
const parts = ['esp32', 'led', 'q-red', 'q-green', 'q-blue', 'base-red', 'base-green', 'base-blue', 'limit-red', 'limit-green', 'limit-blue']
const colours = ['red', 'green', 'blue'] as const
const gpio = { red: 'io25', green: 'io26', blue: 'io27' } as const

function finishedSheet(): SchematicSheet {
  return buildRgbSchematic({
    layout,
    connections: ESP32_BLE_RGB_CONNECTIONS,
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

test('the NPN symbol is KiCad 9.0.7 Device:Q_NPN with an outward emitter arrow', () => {
  const source = kicadNpnSource()
  const drawing = npnDrawing()
  assert.deepEqual(source.arrow[2], { x: 2.286, y: -2.286 })
  const tip = drawing.arrow.reduce((best, point) => (point.y > best.y ? point : best))
  assert.equal(tip, drawing.arrow[2])
  const distance = (from: { x: number; y: number }, to: { x: number; y: number }) => (from.x - to.x) ** 2 + (from.y - to.y) ** 2
  assert.equal(distance(tip, drawing.emitter) < distance(tip, drawing.collector), true)
  assert.equal(drawing.collector.y < drawing.base.y, true)
  assert.equal(drawing.emitter.y > drawing.base.y, true)
  assert.equal(drawing.base.x < drawing.collector.x, true)
  assert.deepEqual(source.leads[0][0], source.basePin)
  assert.deepEqual(source.leads[1][0], source.collectorPin)
  assert.deepEqual(source.leads[2][0], source.emitterPin)
  const samePoint = (left: { x: number; y: number }, right: { x: number; y: number }) => Math.abs(left.x - right.x) < 1e-6 && Math.abs(left.y - right.y) < 1e-6
  for (const terminal of [drawing.base, drawing.collector, drawing.emitter]) {
    const lead = drawing.lines.find((line) => samePoint(line[0], terminal) || samePoint(line[line.length - 1], terminal))
    assert.ok(lead)
    const inner = samePoint(lead[0], terminal) ? lead[lead.length - 1] : lead[0]
    assert.equal(samePoint(inner, terminal), false)
    const meetsBody = drawing.lines.some((line) => line !== lead && line.some((point) => samePoint(point, inner)))
    assert.equal(meetsBody, true)
  }
  const diode = ledDrawing(RGB_DIODE_WIDTH, 40, true)
  assert.equal(diode.cathode.x, 0)
  assert.equal(diode.anode.x, RGB_DIODE_WIDTH)
  assert.equal(diode.cathode.y, 40)
  assert.equal(diode.anode.y, 40)
})

test('project 24 keeps the three colour channels apart on one common anode', () => {
  const sheet = finishedSheet()
  assert.deepEqual(sheet.issues, [], sheet.issues.map((issue) => issue.message).join('\n'))
  assert.equal(sheet.verified, true)
  assert.deepEqual(finishedSheet(), sheet)

  const netlist = buildSchematicNetlist(layout, ESP32_BLE_RGB_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  const supply = netByMember(netlist, 'esp32', 'v5')
  const ground = netByMember(netlist, 'esp32', 'gnd')
  assert.ok(supply && ground)
  assert.equal(supply.name, 'esp32:v5')
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'v5' }, { componentId: 'led', portId: 'anode' }), true)
  assert.equal(sameNet(netlist, { componentId: 'led', portId: 'anode' }, { componentId: 'led', portId: 'red' }), false)
  assert.equal(supply.id === ground.id, false)

  const led = symbol(sheet, 'led')
  assert.equal(led.kind, 'rgb-led')
  assert.equal(led.ref, 'D1')
  assert.deepEqual(led.pins.map((item) => item.portId), ['anode', 'red', 'green', 'blue'])
  assert.equal(led.pins.filter((item) => item.label === 'A').length, 1)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'led' || item.kind === 'rgb-led').length, 1)
  assert.equal(getCatalogueComponent('rgb-led-ca')?.name, 'Common-anode RGB LED')
  assert.equal(getCatalogueComponent('pn2222a')?.name, 'PN2222A transistor')

  for (const colour of colours) {
    assert.equal(sameNet(netlist, { componentId: 'esp32', portId: gpio[colour] }, { componentId: `base-${colour}`, portId: 'leg1' }), true)
    assert.equal(sameNet(netlist, { componentId: `base-${colour}`, portId: 'leg2' }, { componentId: `q-${colour}`, portId: 'base' }), true)
    assert.equal(sameNet(netlist, { componentId: `q-${colour}`, portId: 'collector' }, { componentId: `limit-${colour}`, portId: 'leg1' }), true)
    assert.equal(sameNet(netlist, { componentId: `limit-${colour}`, portId: 'leg2' }, { componentId: 'led', portId: colour }), true)
    assert.equal(sameNet(netlist, { componentId: `q-${colour}`, portId: 'emitter' }, { componentId: 'esp32', portId: 'gnd' }), true)
    assert.equal(sameNet(netlist, { componentId: `base-${colour}`, portId: 'leg1' }, { componentId: `base-${colour}`, portId: 'leg2' }), false)
    assert.equal(sameNet(netlist, { componentId: `q-${colour}`, portId: 'base' }, { componentId: `q-${colour}`, portId: 'collector' }), false)
    assert.equal(sameNet(netlist, { componentId: `q-${colour}`, portId: 'collector' }, { componentId: `q-${colour}`, portId: 'emitter' }), false)
    assert.equal(sameNet(netlist, { componentId: 'led', portId: colour }, { componentId: `q-${colour}`, portId: 'collector' }), false)
    const transistor = symbol(sheet, `q-${colour}`)
    assert.equal(transistor.kind, 'npn')
    assert.deepEqual(transistor.pins.map((item) => item.portId), ['base', 'collector', 'emitter'])
    assert.deepEqual(transistor.pins.map((item) => item.label), ['B', 'C', 'E'])
    const drawing = npnDrawing()
    const local = { base: drawing.base, collector: drawing.collector, emitter: drawing.emitter }
    for (const port of ['base', 'collector', 'emitter'] as const) {
      const endpoint = pin(sheet, `q-${colour}`, port)
      assert.equal(endpoint.x, transistor.x + local[port].x)
      assert.equal(endpoint.y, transistor.y + local[port].y)
      const lead = drawing.lines.find((line) => line.some((point) => point.x === local[port].x && point.y === local[port].y))
      assert.ok(lead, port)
      assert.equal(sheet.wires.some((wire) => wire.points.some((point) => point.x === endpoint.x && point.y === endpoint.y)), true)
    }
    const baseResistor = symbol(sheet, `base-${colour}`)
    const limitResistor = symbol(sheet, `limit-${colour}`)
    assert.equal(pin(sheet, `base-${colour}`, 'leg1').x, baseResistor.x)
    assert.equal(pin(sheet, `base-${colour}`, 'leg2').x, baseResistor.x + baseResistor.width)
    assert.equal(pin(sheet, `limit-${colour}`, 'leg1').x, limitResistor.x)
    assert.equal(pin(sheet, `limit-${colour}`, 'leg2').x, limitResistor.x + limitResistor.width)
    assert.equal(symbol(sheet, `base-${colour}`).value, '1 kΩ')
    assert.equal(symbol(sheet, `limit-${colour}`).value, '220 Ω')
    assert.equal(symbol(sheet, `base-${colour}`).kind, 'resistor')
    assert.equal(symbol(sheet, `limit-${colour}`).kind, 'resistor')
  }
  assert.equal(sameNet(netlist, { componentId: 'led', portId: 'red' }, { componentId: 'led', portId: 'green' }), false)
  assert.equal(sameNet(netlist, { componentId: 'led', portId: 'green' }, { componentId: 'led', portId: 'blue' }), false)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io25' }, { componentId: 'esp32', portId: 'io26' }), false)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io26' }, { componentId: 'esp32', portId: 'io27' }), false)
  assert.deepEqual(
    sheet.symbols.filter((item) => item.ref).map((item) => item.ref).sort(),
    ['D1', 'Q1', 'Q2', 'Q3', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'U1'],
  )
  assert.equal(new Set(sheet.symbols.filter((item) => item.ref).map((item) => item.ref)).size, 11)
  assert.equal(symbol(sheet, 'esp32').value, 'ESP32-DevKitC V4')
  assert.deepEqual(symbol(sheet, 'esp32').pins.map((item) => item.portId), ['v5', 'io25', 'io26', 'io27', 'gnd'])
  assert.equal(sheet.symbols.some((item) => item.id === 'breadboard' || item.value === '+3.3V'), false)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').every((item) => item.value === '+5V' && item.netId === supply.id && item.anchor?.y === item.y + item.height), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.value === 'GND' && item.netId === ground.id && item.anchor?.y === item.y), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').length, 2)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').length, 4)

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
  for (const colour of colours) {
    const baseNet = pin(sheet, `q-${colour}`, 'base').netId
    const limitNet = pin(sheet, `limit-${colour}`, 'leg2').netId
    const baseWire = sheet.wires.find((wire) => wire.netId === baseNet)
    const limitWire = sheet.wires.find((wire) => wire.netId === limitNet)
    assert.ok(baseWire && limitWire)
    assert.equal(baseWire.points.length, 2)
    assert.equal(limitWire.points.length, 2)
    assert.equal(baseWire.points[0].y === baseWire.points[1].y, true)
  }

  const bodies = sheet.symbols
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
    assert.equal(previous == null || previous === junction.netId, true, key)
    netsAt.set(key, junction.netId)
  }
})

test('project 24 adds red, then green, then blue without revealing the next channel', () => {
  const wiring = ESP32_BLE_RGB_STEPS.flatMap((step, index) =>
    step.blocks.filter((block) => block.type === 'wiring').map((block) => ({ index, block })),
  )
  assert.equal(wiring.length, 6)
  const seen = new Set<string>()
  for (const item of wiring) {
    assert.equal(item.block.type, 'wiring')
    const prior = collectPriorWiringConnections(ESP32_BLE_RGB_STEPS, item.index)
    const assembly = resolveAssembly(ESP32_BLE_RGB_STEPS, item.index, 'current', layout.physical?.fixtures ?? [])
    const sheet = buildRgbSchematic({
      layout,
      connections: item.block.connections,
      priorConnections: prior,
      installedPartIds: assembly.installedParts,
      installedJumperIds: assembly.installedJumpers,
    })
    assert.deepEqual(sheet.issues, [], `step ${item.index}: ${sheet.issues.map((issue) => issue.message).join('; ')}`)
    assert.equal(sheet.verified, true)
    assert.equal(sheet.symbols.some((entry) => entry.id === 'esp32'), true)
    for (const colour of colours) {
      const installed = assembly.installedParts.includes(`q-${colour}`)
      assert.equal(sheet.symbols.some((entry) => entry.id === `q-${colour}`), installed)
      const wired = assembly.installedJumpers.includes(colour === 'red' ? 'devkit-io25' : colour === 'green' ? 'devkit-io26' : 'devkit-io27')
      const gpioPin = sheet.symbols.find((entry) => entry.id === 'esp32')?.pins.find((entry) => entry.portId === gpio[colour])
      assert.ok(gpioPin)
      const hasWire = sheet.wires.some((wire) => wire.points.some((point) => point.x === gpioPin.x && point.y === gpioPin.y))
      assert.equal(hasWire, wired, colour)
      if (wired) {
        seen.add(colour)
      }
    }
    for (const colour of colours) {
      if (!seen.has(colour)) {
        const cathode = sheet.symbols.find((entry) => entry.id === 'led')?.pins.find((entry) => entry.portId === colour)
        if (cathode) {
          assert.equal(sheet.wires.some((wire) => wire.points.some((point) => point.x === cathode.x && point.y === cathode.y)), false, colour)
        }
      }
    }
  }
  assert.deepEqual([...seen], ['red', 'green', 'blue'])
  const last = wiring[wiring.length - 1]
  assert.equal(last.block.type, 'wiring')
  const assembly = resolveAssembly(ESP32_BLE_RGB_STEPS, last.index, 'current', layout.physical?.fixtures ?? [])
  const complete = buildRgbSchematic({
    layout,
    connections: last.block.connections,
    priorConnections: collectPriorWiringConnections(ESP32_BLE_RGB_STEPS, last.index),
    installedPartIds: assembly.installedParts,
    installedJumperIds: assembly.installedJumpers,
  })
  assert.equal(complete.wires.length, finishedSheet().wires.length)
  assert.equal(complete.symbols.filter((item) => item.kind === 'power').length, 2)
})
