import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { ESP32_WIFI_WEATHER_CONNECTIONS, ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { resolveAssembly } from './assembly-progress.ts'
import { boxesOverlap, junctionsFromWires, segmentHitsLabel, segmentsOf } from './schematic-geometry.ts'
import { buildSchematicNetlist, netByMember, sameNet } from './schematic-nets.ts'
import { buildWeatherSchematic, mergeConnections, type SchematicSheet, type SchematicSymbol } from './schematic-sheet.ts'
import { collectPriorWiringConnections } from './wiring-diagram.ts'

const layout = ESP32_WIFI_WEATHER_LAYOUT
const jumpers = layout.physical?.jumpers.map((jumper) => jumper.id) ?? []

function finishedSheet(): SchematicSheet {
  return buildWeatherSchematic({
    layout,
    connections: ESP32_WIFI_WEATHER_CONNECTIONS,
    installedPartIds: ['esp32', 'bme280'],
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

test('project 23 powers the BME280 from 3V3 and keeps SDA apart from SCL', () => {
  const sheet = finishedSheet()
  assert.deepEqual(sheet.issues, [], sheet.issues.map((issue) => issue.message).join('\n'))
  assert.equal(sheet.verified, true)
  assert.deepEqual(finishedSheet(), sheet)

  const netlist = buildSchematicNetlist(layout, ESP32_WIFI_WEATHER_CONNECTIONS)
  assert.deepEqual(netlist.issues, [])
  const supply = netByMember(netlist, 'esp32', '3v3')
  const ground = netByMember(netlist, 'esp32', 'gnd')
  const sda = netByMember(netlist, 'esp32', 'io21')
  const scl = netByMember(netlist, 'esp32', 'io22')
  assert.ok(supply && ground && sda && scl)
  assert.equal(supply.kind, 'power')
  assert.equal(supply.name, 'esp32:3v3')
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: '3v3' }, { componentId: 'bme280', portId: 'vin' }), true)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'gnd' }, { componentId: 'bme280', portId: 'gnd' }), true)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io21' }, { componentId: 'bme280', portId: 'sdi' }), true)
  assert.equal(sameNet(netlist, { componentId: 'esp32', portId: 'io22' }, { componentId: 'bme280', portId: 'sck' }), true)
  assert.equal(sda.id === scl.id, false)
  assert.equal(supply.id === ground.id, false)
  assert.equal(supply.id === sda.id, false)
  assert.equal(netlist.nets.length, 4)

  assert.deepEqual(symbol(sheet, 'esp32').pins.map((item) => item.portId), ['3v3', 'io21', 'io22', 'gnd'])
  assert.deepEqual(symbol(sheet, 'bme280').pins.map((item) => item.portId), ['vin', 'sdi', 'sck', 'gnd'])
  assert.deepEqual(symbol(sheet, 'esp32').pins.map((item) => item.label), ['3V3', 'IO21', 'IO22', 'GND'])
  assert.deepEqual(symbol(sheet, 'bme280').pins.map((item) => item.label), ['Vin', 'SDI', 'SCK', 'GND'])
  assert.deepEqual(sheet.symbols.filter((item) => item.ref).map((item) => item.ref).sort(), ['U1', 'U2'])
  assert.equal(symbol(sheet, 'esp32').value, 'ESP32-DevKitC V4')
  assert.equal(symbol(sheet, 'bme280').value, 'BME280')
  assert.equal(symbol(sheet, 'esp32').kind, 'block')
  assert.equal(symbol(sheet, 'bme280').kind, 'block')
  assert.equal(getCatalogueComponent('esp32-devkitc-v4')?.name, 'ESP32-DevKitC V4')
  assert.equal(getCatalogueComponent('bme280')?.name, 'Adafruit BME280')
  assert.equal(getCatalogueComponent('stemma-qt-female')?.name, 'STEMMA QT to female cable')
  assert.equal(sheet.symbols.some((item) => item.id === 'stemma' || item.id === 'usb-power-source' || item.id === 'usb-data-cable' || item.kind === 'resistor'), false)

  for (const [componentId, portId] of [
    ['esp32', '3v3'],
    ['bme280', 'vin'],
  ] as const) {
    const endpoint = pin(sheet, componentId, portId)
    const wire = sheet.wires.find((item) => item.points[0]?.x === endpoint.x && item.points[0]?.y === endpoint.y)
    const supplySymbol = sheet.symbols.find((item) => item.kind === 'power' && item.anchor?.x === wire?.points.at(-1)?.x && item.anchor?.y === wire?.points.at(-1)?.y)
    assert.ok(wire && supplySymbol)
    assert.equal(endpoint.netId, supply.id)
    assert.equal(wire.netId, supply.id)
    assert.equal(supplySymbol.netId, supply.id)
    assert.equal(supplySymbol.value, '+3.3V')
  }
  assert.equal(sheet.symbols.some((item) => item.kind === 'power' && item.value !== '+3.3V'), false)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.netId === ground.id && item.value === 'GND'), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'power').every((item) => item.anchor?.y === item.y + item.height), true)
  assert.equal(sheet.symbols.filter((item) => item.kind === 'ground').every((item) => item.anchor?.y === item.y), true)

  const sdaWire = sheet.wires.find((item) => item.netId === sda.id)
  const sclWire = sheet.wires.find((item) => item.netId === scl.id)
  assert.ok(sdaWire && sclWire)
  assert.deepEqual(sdaWire.points, [pin(sheet, 'esp32', 'io21'), pin(sheet, 'bme280', 'sdi')].map(({ x, y }) => ({ x, y })))
  assert.deepEqual(sclWire.points, [pin(sheet, 'esp32', 'io22'), pin(sheet, 'bme280', 'sck')].map(({ x, y }) => ({ x, y })))
  assert.equal(sdaWire.points[0].y === sdaWire.points[1].y, true)
  assert.equal(sclWire.points[0].y === sclWire.points[1].y, true)
  assert.equal(sdaWire.points[0].y === sclWire.points[0].y, false)

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
  assert.deepEqual(junctionsFromWires(sheet.wires), [])
})

test('project 23 tutorial steps reveal only the cable wires made so far', () => {
  const wiring = ESP32_WIFI_WEATHER_STEPS.flatMap((step, index) =>
    step.blocks.filter((block) => block.type === 'wiring').map((block) => ({ index, block })),
  )
  assert.equal(wiring.length, 4)
  for (const item of wiring) {
    assert.equal(item.block.type, 'wiring')
    const prior = collectPriorWiringConnections(ESP32_WIFI_WEATHER_STEPS, item.index)
    const assembly = resolveAssembly(ESP32_WIFI_WEATHER_STEPS, item.index, 'current', layout.physical?.fixtures ?? [])
    const sheet = buildWeatherSchematic({
      layout,
      connections: item.block.connections,
      priorConnections: prior,
      installedPartIds: assembly.installedParts,
      installedJumperIds: assembly.installedJumpers,
    })
    assert.deepEqual(sheet.issues, [], `step ${item.index}: ${sheet.issues.map((issue) => issue.message).join('; ')}`)
    assert.equal(sheet.verified, true)
    assert.equal(sheet.symbols.some((entry) => entry.id === 'esp32'), true)
    assert.equal(sheet.symbols.some((entry) => entry.id === 'bme280'), assembly.installedParts.includes('bme280'))
    const visible = mergeConnections(prior, item.block.connections)
    const visibleNets = buildSchematicNetlist(
      layout,
      ESP32_WIFI_WEATHER_CONNECTIONS.filter((connection) => visible.some((itemConnection) =>
        itemConnection.fromComponent === connection.fromComponent &&
        itemConnection.fromPin === connection.fromPin &&
        itemConnection.toComponent === connection.toComponent &&
        itemConnection.toPin === connection.toPin,
      )),
    )
    for (const wire of sheet.wires) {
      assert.equal(visibleNets.nets.some((net) => net.id === wire.netId), true, wire.netName)
    }
    const connected = new Set(visibleNets.links.flatMap((link) => [`${link.from.componentId}:${link.from.portId}`, `${link.to.componentId}:${link.to.portId}`]))
    if (!connected.has('esp32:io21')) {
      assert.equal(sheet.wires.some((wire) => wire.points.some((point) => point.y === pin(sheet, 'esp32', 'io21').y && point.x === pin(sheet, 'esp32', 'io21').x)), false)
    }
    if (!connected.has('esp32:3v3')) {
      assert.equal(sheet.symbols.some((entry) => entry.value === '+3.3V'), false)
    }
  }
  const last = wiring[wiring.length - 1]
  assert.equal(last.block.type, 'wiring')
  const assembly = resolveAssembly(ESP32_WIFI_WEATHER_STEPS, last.index, 'current', layout.physical?.fixtures ?? [])
  const complete = buildWeatherSchematic({
    layout,
    connections: last.block.connections,
    priorConnections: collectPriorWiringConnections(ESP32_WIFI_WEATHER_STEPS, last.index),
    installedPartIds: assembly.installedParts,
    installedJumperIds: assembly.installedJumpers,
  })
  assert.equal(complete.wires.length, finishedSheet().wires.length)
  assert.equal(complete.symbols.filter((item) => item.kind === 'power').length, 2)
  assert.equal(complete.symbols.filter((item) => item.kind === 'ground').length, 2)
})
