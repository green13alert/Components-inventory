import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from './component-catalogue.ts'
import { ESP32_BLE_RGB_FIRMWARE } from './firmware/esp32-ble-rgb-controller.ts'
import { evaluateComponentCompatibility } from '../lib/compatibility.ts'
import { resolvePort, routeWiringDiagram } from '../lib/wiring-diagram.ts'
import { ESP32_BLE_RGB_LAYOUT } from './wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import {
  ESP32_BLE_RGB_BOM,
  ESP32_BLE_RGB_CAPABILITIES,
  ESP32_BLE_RGB_CONNECTIONS,
  ESP32_BLE_RGB_CONSTRAINTS,
  ESP32_BLE_RGB_PROJECT,
  ESP32_BLE_RGB_STEPS,
} from './walkthroughs/esp32-ble-rgb-controller.ts'

test('the BLE RGB controller is an unpublished single-program project', () => {
  assert.equal(ESP32_BLE_RGB_PROJECT.slug, '24')
  assert.equal(ESP32_BLE_RGB_PROJECT.isPublished, false)
  assert.equal(ESP32_BLE_RGB_PROJECT.title, 'ESP32 Bluetooth RGB LED Controller')
  assert.equal(ESP32_BLE_RGB_PROJECT.learningObjectives.length, 4)
  assert.equal(ESP32_BLE_RGB_STEPS.length, 22)
  assert.equal(JSON.stringify(ESP32_BLE_RGB_STEPS).includes('this repository'), false)
  assert.equal(JSON.stringify(ESP32_BLE_RGB_STEPS).includes('Not run on hardware'), false)
  assert.equal(ESP32_BLE_RGB_STEPS[ESP32_BLE_RGB_STEPS.length - 1]?.stageTitle, 'Final check')
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('BluetoothSerial'), false)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('#include <BLEDevice.h>'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('const int RED_PIN = 25;'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('const int GREEN_PIN = 26;'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('const int BLUE_PIN = 27;'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('Solderi RGB'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('length == 3'), false)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('PROPERTY_WRITE'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('parseColourText'), true)
  const codeBlocks = ESP32_BLE_RGB_STEPS.flatMap((step) => step.blocks).filter((block) => block.type === 'code')
  assert.equal(codeBlocks.some((block) => block.type === 'code' && block.code === ESP32_BLE_RGB_FIRMWARE), true)
  for (const block of codeBlocks) {
    if (block.type === 'code') {
      assert.equal(ESP32_BLE_RGB_FIRMWARE.includes(block.code), true)
    }
  }
})

test('the BOM is the common-anode LED, PN2222A switches, and the DevKit', () => {
  assert.deepEqual(
    ESP32_BLE_RGB_BOM.map((item) => [item.slug, item.quantity]),
    [
      ['esp32', 1],
      ['rgb-led-ca', 1],
      ['pn2222a', 3],
      ['resistor-220', 3],
      ['resistor-1k', 3],
      ['breadboard', 1],
      ['jumper-male-female', 5],
      ['jumper-wires', 8],
      ['usb-data-cable', 1],
      ['usb-power-source', 1],
    ],
  )
  for (const item of ESP32_BLE_RGB_BOM) {
    assert.equal(getCatalogueComponent(item.slug) != null, true, item.slug)
  }
  assert.equal(getCatalogueComponent('rgb-led-ca')?.description.includes('WP154A4SEJ3VBDZGW/CA'), true)
  assert.equal(getCatalogueComponent('rgb-led-ca')?.description.includes('pin 1 as the red cathode'), true)
  assert.equal(getCatalogueComponent('rgb-led-ca')?.description.includes('pin 3 as the blue cathode'), true)
  assert.equal(getCatalogueComponent('rgb-led-ca')?.description.includes('pin 4 as the green cathode'), true)
  assert.equal(getCatalogueComponent('pn2222a')?.description.includes('PN2222ABU'), true)
})

test('the wiring diagram uses the transistor driver and the same sketch pins', () => {
  assert.equal(ESP32_BLE_RGB_LAYOUT.slug, '24')
  assert.equal(ESP32_BLE_RGB_LAYOUT.width, 360)
  assert.equal(ESP32_BLE_RGB_LAYOUT.wireLabels?.ground, 'GND')
  assert.equal(ESP32_BLE_RGB_LAYOUT.wireLabels?.pwm, 'PWM')
  assert.equal(ESP32_BLE_RGB_LAYOUT.wireLabels?.powerLogic, '5V')
  for (const connection of ESP32_BLE_RGB_CONNECTIONS) {
    assert.equal(resolvePort(ESP32_BLE_RGB_LAYOUT, connection.fromComponent, connection.fromPin) != null, true, `${connection.fromComponent} ${connection.fromPin}`)
    assert.equal(resolvePort(ESP32_BLE_RGB_LAYOUT, connection.toComponent, connection.toPin) != null, true, `${connection.toComponent} ${connection.toPin}`)
  }
  const routed = routeWiringDiagram(ESP32_BLE_RGB_LAYOUT, ESP32_BLE_RGB_CONNECTIONS, [])
  assert.equal(routed.length, ESP32_BLE_RGB_CONNECTIONS.length)
  const pwm = routed.filter((wire) => wire.kind === 'pwm')
  const ground = routed.filter((wire) => wire.kind === 'ground')
  const power = routed.filter((wire) => wire.kind === 'powerLogic')
  const gpioPins = routed.filter((wire) => wire.connection.fromPin === 'IO25' || wire.connection.fromPin === 'IO26' || wire.connection.fromPin === 'IO27')
  assert.equal(gpioPins.length, 3)
  assert.equal(pwm.length, 12)
  assert.equal(ground.length, 4)
  assert.equal(power.length, 2)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('common-anode'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode'), true)
  const led = ESP32_BLE_RGB_LAYOUT.elements.find((element) => element.id === 'led')
  assert.deepEqual(led?.ports.map((port) => port.id), ['red', 'anode', 'blue', 'green'])
  const ledStep = ESP32_BLE_RGB_STEPS.find((step) => step.title === 'Confirm the LED is common anode')
  assert.equal(ledStep?.description.includes('Pin 1 is red, pin 3 is blue, and pin 4 is green'), true)
  assert.equal(ESP32_BLE_RGB_FIRMWARE.includes('PROPERTY_WRITE_NR'), true)
})

test('a common-cathode LED is not an approved substitute', () => {
  const ledRequirement = {
    id: 'led',
    canonicalComponentId: 'rgb-id',
    policy: 'exact' as const,
    quantity: 1,
    constraints: ESP32_BLE_RGB_CONSTRAINTS['rgb-led-ca'].map(([capability, value]) => ({ capability, value })),
    pinRoles: [],
  }
  const cathode = evaluateComponentCompatibility({
    requirement: ledRequirement,
    canonical: {
      componentId: 'rgb-id',
      capabilities: ESP32_BLE_RGB_CAPABILITIES['rgb-led-ca'].map(([capability, value]) => ({ capability, value })),
      pins: [],
    },
    candidate: {
      componentId: 'cathode-id',
      capabilities: [
        { capability: 'function', value: 'rgb_led' },
        { capability: 'physical_form', value: 'common_cathode' },
      ],
      pins: [],
      quantity: 1,
    },
    review: null,
  })
  assert.equal(cathode.safeToPresentAsSubstitute, false)
  assert.equal(cathode.reasonCode, 'constraint_failed')

  const boardRequirement = {
    id: 'board',
    canonicalComponentId: 'esp32-id',
    policy: 'exact' as const,
    quantity: 1,
    constraints: ESP32_BLE_RGB_CONSTRAINTS.esp32.map(([capability, value]) => ({ capability, value })),
    pinRoles: [],
  }
  const esp8266 = evaluateComponentCompatibility({
    requirement: boardRequirement,
    canonical: {
      componentId: 'esp32-id',
      capabilities: ESP32_BLE_RGB_CONSTRAINTS.esp32.map(([capability, value]) => ({ capability, value })),
      pins: [],
    },
    candidate: {
      componentId: 'esp8266-id',
      capabilities: [{ capability: 'function', value: 'development_board' }, { capability: 'radio', value: 'wifi' }],
      pins: [],
      quantity: 1,
    },
    review: null,
  })
  assert.equal(esp8266.safeToPresentAsSubstitute, false)
})
