import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent, searchComponentCatalogue } from './component-catalogue.ts'
import { ESP32_WIFI_WEATHER_FIRMWARE } from './firmware/esp32-wifi-weather-station.ts'
import { resolvePort, routeWiringDiagram } from '../lib/wiring-diagram.ts'
import { evaluateComponentCompatibility } from '../lib/compatibility.ts'
import { projectCoverIsPending, resolveBuildDestination } from '../lib/project-navigation.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from './wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import {
  ESP32_WIFI_WEATHER_BOM,
  ESP32_WIFI_WEATHER_CAPABILITIES,
  ESP32_WIFI_WEATHER_CONNECTIONS,
  ESP32_WIFI_WEATHER_CONSTRAINTS,
  ESP32_WIFI_WEATHER_PROJECT,
  ESP32_WIFI_WEATHER_STEPS,
} from './walkthroughs/esp32-wifi-weather-station.ts'

test('the Wi-Fi weather station is a new unpublished project', () => {
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.slug, '23')
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.isPublished, false)
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.title, 'ESP32 Wi-Fi Weather Station')
  assert.equal(ESP32_WIFI_WEATHER_PROJECT.imageKey, 'esp32WifiWeather')
  assert.equal(projectCoverIsPending(ESP32_WIFI_WEATHER_PROJECT.imageKey), false)
  assert.equal(ESP32_WIFI_WEATHER_STEPS.length, 25)
  assert.equal(
    resolveBuildDestination({
      stepCount: ESP32_WIFI_WEATHER_STEPS.length,
      status: 'not_started',
      reviewingSteps: false,
      reviewingCode: false,
    }),
    'walkthrough',
  )
  const imageBlocks = ESP32_WIFI_WEATHER_STEPS.flatMap((step) => step.blocks).filter((block) => block.type === 'image')
  assert.equal(imageBlocks.length, 1)
  const cover = imageBlocks[0]
  assert.equal(cover?.type === 'image' && cover.imageKey === 'esp32WifiWeather', true)
  assert.equal(cover?.type === 'image' && cover.caption?.includes('not in the app yet'), false)
  assert.equal(cover?.type === 'image' && cover.caption?.includes('wiring diagram'), true)
  const wiringBlocks = ESP32_WIFI_WEATHER_STEPS.flatMap((step) => step.blocks).filter((block) => block.type === 'wiring')
  assert.equal(wiringBlocks.length > 0, true)
  assert.equal(ESP32_WIFI_WEATHER_LAYOUT.slug, ESP32_WIFI_WEATHER_PROJECT.slug)
  const stages = [...new Set(ESP32_WIFI_WEATHER_STEPS.map((step) => step.stageTitle))]
  assert.equal(stages.length, 9)
  assert.equal(ESP32_WIFI_WEATHER_STEPS.some((step) => step.description.includes('BMP280 can report')), false)
})

test('the BOM lists every required physical part once', () => {
  assert.deepEqual(
    ESP32_WIFI_WEATHER_BOM.map((item) => [item.slug, item.quantity]),
    [
      ['esp32', 1],
      ['bme280', 1],
      ['stemma-qt-cable', 1],
      ['breadboard', 1],
      ['jumper-male-female', 4],
      ['usb-data-cable', 1],
      ['usb-power-source', 1],
    ],
  )
  for (const item of ESP32_WIFI_WEATHER_BOM) {
    assert.equal(getCatalogueComponent(item.slug)?.name, item.name)
  }
  assert.equal(getCatalogueComponent('bmp280')?.name, 'BMP280')
  assert.equal(searchComponentCatalogue('bme280').some((entry) => entry.id === 'bmp280'), false)
  assert.equal(searchComponentCatalogue('bme280')[0]?.id, 'bme280')
})

test('the wiring diagram, table, and firmware use the same pins', () => {
  assert.equal(ESP32_WIFI_WEATHER_LAYOUT.slug, '23')
  assert.equal(ESP32_WIFI_WEATHER_LAYOUT.wireLabels?.powerLogic, '3V3')
  assert.equal(ESP32_WIFI_WEATHER_LAYOUT.wireLabels?.i2cData, 'SDI')
  assert.equal(ESP32_WIFI_WEATHER_LAYOUT.wireLabels?.i2cClock, 'SCK')
  const breadboard = ESP32_WIFI_WEATHER_LAYOUT.elements.find((element) => element.id === 'breadboard')
  const sensor = ESP32_WIFI_WEATHER_LAYOUT.elements.find((element) => element.id === 'bme280')
  assert.equal(breadboard?.powerRailLabel, '+ 3V3')
  assert.equal(sensor?.cableLabel, 'STEMMA QT')
  assert.equal(breadboard != null && sensor != null, true)
  if (breadboard && sensor) {
    const sensorRightOfBoard = sensor.x >= breadboard.x + breadboard.width
    assert.equal(sensorRightOfBoard, true)
    for (const port of sensor.ports) {
      const pinX = sensor.x + port.dx
      const pinY = sensor.y + port.dy
      const inBreadboard =
        pinX > breadboard.x &&
        pinX < breadboard.x + breadboard.width &&
        pinY > breadboard.y &&
        pinY < breadboard.y + breadboard.height
      assert.equal(inBreadboard, true, port.id)
      const onSensorBody = pinX >= sensor.x && pinX <= sensor.x + sensor.width && pinY >= sensor.y && pinY <= sensor.y + sensor.height
      assert.equal(onSensorBody, false, port.id)
    }
  }
  const wires = routeWiringDiagram(ESP32_WIFI_WEATHER_LAYOUT, ESP32_WIFI_WEATHER_CONNECTIONS, [])
  assert.equal(wires.length, ESP32_WIFI_WEATHER_CONNECTIONS.length)
  const kindByPins = Object.fromEntries(
    wires.map((wire) => [`${wire.connection.fromPin}->${wire.connection.toPin}`, wire.kind]),
  )
  assert.equal(kindByPins['3V3->+ rail'], 'powerLogic')
  assert.equal(kindByPins['GND->GND rail'], 'ground')
  assert.equal(kindByPins['+ rail->Vin'], 'powerLogic')
  assert.equal(kindByPins['GND rail->GND'], 'ground')
  assert.equal(kindByPins['IO21->SDI'], 'i2cData')
  assert.equal(kindByPins['IO22->SCK'], 'i2cClock')
  assert.equal(JSON.stringify(ESP32_WIFI_WEATHER_STEPS).includes('watch the status change to Wi-Fi disconnected'), false)
  for (const connection of ESP32_WIFI_WEATHER_CONNECTIONS) {
    assert.equal(resolvePort(ESP32_WIFI_WEATHER_LAYOUT, connection.fromComponent, connection.fromPin) != null, true, connection.fromPin)
    assert.equal(resolvePort(ESP32_WIFI_WEATHER_LAYOUT, connection.toComponent, connection.toPin) != null, true, connection.toPin)
  }
  assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes('const int I2C_SDA = 21;'), true)
  assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes('const int I2C_SCL = 22;'), true)
  assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes('const uint8_t BME280_I2C_ADDRESS = 0x77;'), true)
  assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes('YOUR_WIFI_PASSWORD'), true)
  assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes('server.on("/readings"'), true)
})

test('walkthrough code blocks are the firmware or an excerpt of it', () => {
  const full = ESP32_WIFI_WEATHER_STEPS.flatMap((step) => step.blocks).filter((block) => block.type === 'code')
  assert.equal(full.length >= 4, true)
  for (const block of full) {
    if (block.type !== 'code') {
      continue
    }
    assert.equal(ESP32_WIFI_WEATHER_FIRMWARE.includes(block.code), true, block.code.slice(0, 40))
  }
  const complete = full.find((block) => block.type === 'code' && block.code === ESP32_WIFI_WEATHER_FIRMWARE)
  assert.equal(complete != null, true)
})

test('BMP280 and other ESP32 boards are not approved substitutes', () => {
  const sensorRequirement = {
    id: 'sensor',
    projectComponentId: 'line-sensor',
    canonicalComponentId: 'bme280-id',
    role: 'environment_sensor',
    policy: 'exact' as const,
    quantity: 1,
    constraints: ESP32_WIFI_WEATHER_CONSTRAINTS.bme280.map(([capability, value]) => ({ capability, value })),
    pinRoles: [],
  }
  const bmp = evaluateComponentCompatibility({
    requirement: sensorRequirement,
    canonical: { componentId: 'bme280-id', capabilities: ESP32_WIFI_WEATHER_CAPABILITIES.bme280.map(([capability, value]) => ({ capability, value })), pins: [] },
    candidate: { componentId: 'bmp280-id', capabilities: [{ capability: 'function', value: 'bmp280' }], pins: [], quantity: 1 },
    review: null,
  })
  assert.equal(bmp.safeToPresentAsSubstitute, false)

  const boardRequirement = {
    id: 'board',
    projectComponentId: 'line-board',
    canonicalComponentId: 'esp32-id',
    role: 'microcontroller',
    policy: 'exact' as const,
    quantity: 1,
    constraints: ESP32_WIFI_WEATHER_CONSTRAINTS.esp32.map(([capability, value]) => ({ capability, value })),
    pinRoles: [],
  }
  const cam = evaluateComponentCompatibility({
    requirement: boardRequirement,
    canonical: {
      componentId: 'esp32-id',
      capabilities: ESP32_WIFI_WEATHER_CONSTRAINTS.esp32.map(([capability, value]) => ({ capability, value })),
      pins: [],
    },
    candidate: { componentId: 'esp32-cam-id', capabilities: [{ capability: 'function', value: 'development_board' }], pins: [], quantity: 1 },
    review: null,
  })
  assert.equal(cam.safeToPresentAsSubstitute, false)
})
