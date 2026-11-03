import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { LED_MATRIX_MAZE_CONNECTIONS, LED_MATRIX_MAZE_STEPS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { boxesOverlap, junctionsFromWires, segmentHitsLabel, segmentsOf } from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember, sameNet } from './schematic-nets.ts'
import { buildMazeSchematic, mergeConnections, type SchematicSheet, type SchematicSymbol } from './schematic-sheet.ts'
import { collectPriorWiringConnections } from './wiring-diagram.ts'

const layout = LED_MATRIX_MAZE_LAYOUT
const jumpers = layout.physical?.jumpers.map((jumper) => jumper.id) ?? []

function finishedSheet(): SchematicSheet {
  return buildMazeSchematic({
    layout,
    connections: LED_MATRIX_MAZE_CONNECTIONS,
    installedPartIds: ['arduino', 'matrix', 'joystick'],
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

test('project 25 shares Uno 5V and ground and keeps the six signals apart', () => {
  const sheet = finishedSheet()
  assert.deepEqual(sheet.issues, [], sheet.issues.map((issue) => issue.message).join('\n'))
  assert.equal(sheet.verified, true)
  assert.deepEqual(finishedSheet(), sheet)

  const netlist = buildSchematicNetlist(layout, LED_MATRIX_MAZE_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  const supply = netByMember(netlist, 'arduino', '5v')
  const ground = netByMember(netlist, 'arduino', 'gnd')
  assert.ok(supply && ground)
  assert.equal(supply.kind, 'power')
  assert.equal(supply.name, 'arduino:5v')
  assert.equal(ground.kind, 'ground')
  assert.equal(netlist.nets.length, 8)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: '5v' }, { componentId: 'matrix', portId: 'vcc' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: '5v' }, { componentId: 'joystick', portId: 'vcc' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'gnd' }, { componentId: 'matrix', portId: 'gnd' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'gnd' }, { componentId: 'joystick', portId: 'gnd' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd13' }, { componentId: 'matrix', portId: 'clk' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd10' }, { componentId: 'matrix', portId: 'cs' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd11' }, { componentId: 'matrix', portId: 'din' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a0' }, { componentId: 'joystick', portId: 'vrx' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'a1' }, { componentId: 'joystick', portId: 'vry' }), true)
  assert.equal(sameNet(netlist, { componentId: 'arduino', portId: 'd2' }, { componentId: 'joystick', portId: 'sw' }), true)
  const signals = ['matrix:clk', 'matrix:cs', 'matrix:din', 'joystick:vrx', 'joystick:vry', 'joystick:sw']
  for (const left of signals) {
    for (const right of signals) {
      if (left === right) {
        continue
      }
      const [leftId, leftPort] = left.split(':')
      const [rightId, rightPort] = right.split(':')
      assert.equal(sameNet(netlist, { componentId: leftId, portId: leftPort }, { componentId: rightId, portId: rightPort }), false)
    }
  }
  assert.equal(supply.id === ground.id, false)

  assert.deepEqual(symbol(sheet, 'arduino').pins.map((item) => item.portId), ['5v', 'd13', 'd10', 'd11', 'a0', 'a1', 'd2', 'gnd'])
  assert.deepEqual(symbol(sheet, 'arduino').pins.map((item) => item.label), ['5V', 'D13', 'D10', 'D11', 'A0', 'A1', 'D2', 'GND'])
  assert.deepEqual(symbol(sheet, 'matrix').pins.map((item) => item.portId), ['vcc', 'clk', 'cs', 'din', 'gnd'])
  assert.deepEqual(symbol(sheet, 'matrix').pins.map((item) => item.label), ['VCC', 'CLK', 'CS', 'DIN', 'GND'])
  assert.deepEqual(symbol(sheet, 'joystick').pins.map((item) => item.portId), ['vcc', 'vrx', 'vry', 'sw', 'gnd'])
  assert.deepEqual(symbol(sheet, 'joystick').pins.map((item) => item.label), ['+5V', 'VRx', 'VRy', 'SW', 'GND'])
  assert.equal(symbol(sheet, 'matrix').pins.some((item) => item.portId === 'dout' || item.label === 'DOUT'), false)
  assert.equal(sheet.symbols.filter((item) => item.id === 'matrix').length, 1)
  assert.deepEqual(sheet.symbols.filter((item) => item.ref).map((item) => item.ref).sort(), ['U1', 'U2', 'U3'])
  assert.equal(symbol(sheet, 'arduino').value, 'Uno R3')
  assert.equal(symbol(sheet, 'matrix').value, 'FC-16 MAX7219 8×8')
  assert.equal(symbol(sheet, 'joystick').value, 'KY-023')
  assert.equal(symbol(sheet, 'arduino').kind, 'block')
  assert.equal(symbol(sheet, 'matrix').kind, 'block')
  assert.equal(symbol(sheet, 'joystick').kind, 'block')
  assert.equal(symbol(sheet, 'joystick').width, 156)
  assert.equal(symbol(sheet, 'joystick').height, 176)
  assert.equal(getCatalogueComponent('max7219')?.description.includes('input header'), true)
  assert.equal(getCatalogueComponent('max7219')?.description.includes('CLK, CS, DIN, GND, VCC'), true)
  assert.equal(sheet.symbols.some((item) => item.id === 'breadboard' || item.kind === 'resistor' || item.kind === 'led'), false)
  assert.equal(localAuthoredProjects().find((project) => project.slug === '25')?.hardwareTested, false)

  for (const [componentId, portId] of [
    ['arduino', '5v'],
    ['matrix', 'vcc'],
    ['joystick', 'vcc'],
  ] as const) {
    const endpoint = pin(sheet, componentId, portId)
    const wire = sheet.wires.find((item) => item.points[0]?.x === endpoint.x && item.points[0]?.y === endpoint.y)
    const supplySymbol = sheet.symbols.find((item) => item.kind === 'power' && item.anchor?.x === wire?.points.at(-1)?.x && item.anchor?.y === wire?.points.at(-1)?.y)
    assert.ok(wire && supplySymbol)
    assert.equal(endpoint.netId, supply.id)
    assert.equal(wire.netId, supply.id)
    assert.equal(supplySymbol.netId, supply.id)
    assert.equal(supplySymbol.value, '+5V')
    assert.equal(endpoint.x, symbol(sheet, componentId).x + symbol(sheet, componentId).width / 2)
    assert.equal(endpoint.y, symbol(sheet, componentId).y)
  }
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').length, 3)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').length, 3)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.netId === ground.id && item.value === 'GND'), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').every((item) => item.anchor?.y === item.y + item.height), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.anchor?.y === item.y), true)

  const pairs = [
    ['d13', 'matrix', 'clk'],
    ['d10', 'matrix', 'cs'],
    ['d11', 'matrix', 'din'],
    ['a0', 'joystick', 'vrx'],
    ['a1', 'joystick', 'vry'],
    ['d2', 'joystick', 'sw'],
  ] as const
  for (const [unoPort, moduleId, modulePort] of pairs) {
    const from = pin(sheet, 'arduino', unoPort)
    const to = pin(sheet, moduleId, modulePort)
    const wire = sheet.wires.find((item) => item.points.some((point) => point.x === from.x && point.y === from.y))
    assert.ok(wire)
    assert.deepEqual(wire.points, [{ x: from.x, y: from.y }, { x: to.x, y: to.y }])
    assert.equal(from.y, to.y)
    assert.equal(from.netId, to.netId)
    assert.equal(wire.netId, from.netId)
    assert.equal(from.x, symbol(sheet, 'arduino').x + symbol(sheet, 'arduino').width)
    assert.equal(to.x, symbol(sheet, moduleId).x)
  }

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
  assert.deepEqual(junctionsFromWires(sheet.wires), sheet.junctions)
  assert.deepEqual(sheet.junctions, [])
  assert.equal(sheet.wires.length, 12)
})

test('project 25 tutorial steps reveal the matrix before the joystick', () => {
  const wiring = LED_MATRIX_MAZE_STEPS.flatMap((step, index) =>
    step.blocks.filter((block) => block.type === 'wiring').map((block) => ({ index, block })),
  )
  assert.equal(wiring.length, 4)
  for (const item of wiring) {
    assert.equal(item.block.type, 'wiring')
    const prior = collectPriorWiringConnections(LED_MATRIX_MAZE_STEPS, item.index)
    const assembly = resolveAssembly(LED_MATRIX_MAZE_STEPS, item.index, 'current', layout.physical?.fixtures ?? [])
    const sheet = buildMazeSchematic({
      layout,
      connections: item.block.connections,
      priorConnections: prior,
      installedPartIds: assembly.installedParts,
      installedJumperIds: assembly.installedJumpers,
    })
    assert.deepEqual(sheet.issues, [], `step ${item.index}: ${sheet.issues.map((issue) => issue.message).join('; ')}`)
    assert.equal(sheet.verified, true)
    assert.equal(sheet.symbols.some((entry) => entry.id === 'arduino'), true)
    assert.equal(sheet.symbols.some((entry) => entry.id === 'matrix'), assembly.installedParts.includes('matrix'))
    assert.equal(sheet.symbols.some((entry) => entry.id === 'joystick'), assembly.installedParts.includes('joystick'))
    const visible = mergeConnections(prior, item.block.connections)
    const visibleNets = buildSchematicNetlist(layout, visible)
    for (const wire of sheet.wires) {
      assert.equal(visibleNets.nets.some((net) => net.id === wire.netId), true, wire.netName)
    }
    const connected = new Set(visibleNets.links.flatMap((link) => [`${link.from.componentId}:${link.from.portId}`, `${link.to.componentId}:${link.to.portId}`]))
    if (sheet.symbols.some((entry) => entry.id === 'matrix') && !connected.has('matrix:clk')) {
      assert.equal(sheet.wires.some((wire) => wire.points.some((point) => point.x === pin(sheet, 'matrix', 'clk').x && point.y === pin(sheet, 'matrix', 'clk').y)), false)
    }
    if (!connected.has('joystick:vrx')) {
      assert.equal(sheet.wires.some((wire) => wire.netName.includes('vrx') || wire.netName.includes('a0')), false)
    }
  }

  const rails = wiring[0]
  assert.equal(rails.index, 2)
  assert.equal(rails.block.type, 'wiring')
  const railSheet = buildMazeSchematic({
    layout,
    connections: rails.block.connections,
    priorConnections: collectPriorWiringConnections(LED_MATRIX_MAZE_STEPS, rails.index),
    installedPartIds: resolveAssembly(LED_MATRIX_MAZE_STEPS, rails.index, 'current', layout.physical?.fixtures ?? []).installedParts,
    installedJumperIds: resolveAssembly(LED_MATRIX_MAZE_STEPS, rails.index, 'current', layout.physical?.fixtures ?? []).installedJumpers,
  })
  assert.equal(railSheet.wires.length, 0)
  assert.equal(railSheet.symbols.some((item) => item.id === 'matrix' || item.id === 'joystick'), false)

  const matrixStep = wiring[1]
  assert.equal(matrixStep.block.type, 'wiring')
  const matrixSheet = buildMazeSchematic({
    layout,
    connections: matrixStep.block.connections,
    priorConnections: collectPriorWiringConnections(LED_MATRIX_MAZE_STEPS, matrixStep.index),
    installedPartIds: resolveAssembly(LED_MATRIX_MAZE_STEPS, matrixStep.index, 'current', layout.physical?.fixtures ?? []).installedParts,
    installedJumperIds: resolveAssembly(LED_MATRIX_MAZE_STEPS, matrixStep.index, 'current', layout.physical?.fixtures ?? []).installedJumpers,
  })
  assert.equal(matrixSheet.symbols.some((item) => item.id === 'joystick'), false)
  assert.equal(matrixSheet.wires.some((wire) => wire.points.some((point) => point.y === pin(matrixSheet, 'arduino', 'd13').y)), true)
  assert.equal(matrixSheet.wires.some((wire) => wire.points.some((point) => point.y === pin(matrixSheet, 'arduino', 'a0').y)), false)

  const last = wiring[wiring.length - 1]
  assert.equal(last.block.type, 'wiring')
  const assembly = resolveAssembly(LED_MATRIX_MAZE_STEPS, last.index, 'current', layout.physical?.fixtures ?? [])
  const complete = buildMazeSchematic({
    layout,
    connections: last.block.connections,
    priorConnections: collectPriorWiringConnections(LED_MATRIX_MAZE_STEPS, last.index),
    installedPartIds: assembly.installedParts,
    installedJumperIds: assembly.installedJumpers,
  })
  assert.equal(complete.wires.length, finishedSheet().wires.length)
  assert.equal(complete.symbols.filter((item) => item.kind === 'power').length, 3)
  assert.equal(complete.symbols.filter((item) => item.kind === 'ground').length, 3)
})
