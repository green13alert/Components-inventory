import assert from 'node:assert/strict'
import { test } from 'node:test'

import { localAuthoredProjects } from '../lib/authored-projects.ts'
import { matchProjectInventory } from '../lib/compatibility.ts'
import {
  COMPONENT_CATALOGUE,
  componentDisplayName,
  getCatalogueComponent,
  searchComponentCatalogue,
} from './component-catalogue.ts'
import { CATEGORY_LABELS, INVENTORY_CATEGORY_IDS } from './inventory.ts'

function idsFor(query: string): string[] {
  return searchComponentCatalogue(query).map((entry) => entry.id)
}

const PRESERVED_IDS = [
  'arduino-uno-r3',
  'arduino-nano',
  'arduino-mega',
  'esp32',
  'esp8266',
  'raspberry-pi-pico',
  'dht11',
  'dht22',
  'dht20',
  'ds18b20',
  'hc-sr04',
  'pir-sensor',
  'soil-moisture',
  'bmp280',
  'mpu6050',
  'ldr',
  'mq2',
  'sg90',
  'joystick',
  'pan-tilt-bracket',
  'mg90s',
  'dc-motor',
  'stepper-28byj',
  'buzzer',
  'lcd-16x2',
  'oled-096',
  'max7219',
  'tm1637',
  '9v-battery-clip',
  'lm7805',
  'breadboard-psu',
  'hc-05',
  'hc-06',
  'relay-5v',
  'l298n',
  'rfid-rc522',
  'ds3231',
  'led',
  'resistor',
  'resistor-220',
  'breadboard',
  'jumper-wires',
] as const

const BATCH_ONE_IDS = [
  'resistor-100',
  'resistor-330',
  'resistor-470',
  'resistor-1k',
  'resistor-2k2',
  'resistor-4k7',
  'resistor-10k',
  'resistor-47k',
  'resistor-100k',
  'capacitor-100nf',
  'capacitor-10uf',
  'capacitor-100uf',
  'button-tactile',
  'potentiometer-10k',
  'esp32-cam',
  'raspberry-pi-pico-w',
  'raspberry-pi-4',
  'raspberry-pi-5',
] as const

test('batch 1 adds 18 components and keeps the original ids', () => {
  const ids = COMPONENT_CATALOGUE.map((entry) => entry.id)
  assert.equal(ids.length, 73)
  assert.equal(new Set(ids).size, 73)
  for (const id of ['esp32-devkitc-v4', 'stemma-qt-female', 'gst18a05-p1j', 'iec-c13-mains-lead', 'adafruit-368']) {
    assert.equal(ids.includes(id), true)
  }
  assert.equal(ids.includes('stemma-qt-cable'), true)
  assert.equal(ids.includes('rgb-led-cc'), true)
  assert.equal(ids.includes('rgb-led-ca'), true)
  assert.equal(ids.includes('pn2222a'), true)
  assert.equal(ids.includes('jumper-male-female'), true)
  for (const id of PRESERVED_IDS) {
    assert.equal(ids.includes(id), true)
  }
  for (const id of BATCH_ONE_IDS) {
    assert.equal(ids.filter((entryId) => entryId === id).length, 1)
  }
  assert.equal(getCatalogueComponent('resistor-220')?.name, '220 Ω resistor')
  assert.equal(
    getCatalogueComponent('resistor-220')?.description,
    'Current-limiting resistor for a typical 5 V LED',
  )
})

test('a generic resistor is not searchable as a 10k resistor', () => {
  const resistor = getCatalogueComponent('resistor')
  assert.equal(resistor?.name, 'Resistor')
  assert.equal(resistor?.description, 'Through-hole resistor')
  assert.equal(resistor?.category, 'modules')
  assert.equal(idsFor('10k resistor').includes('resistor'), false)
  assert.equal(idsFor('10k').includes('resistor'), false)
  assert.equal(idsFor('resistor')[0], 'resistor')
  assert.equal(idsFor('resistors').includes('resistor'), true)
})

test('BMP280 search does not return a BME280 alias', () => {
  const sensor = getCatalogueComponent('bmp280')
  assert.equal(sensor?.name, 'BMP280')
  assert.equal(sensor?.category, 'sensors')
  assert.equal(idsFor('bme280').includes('bmp280'), false)
  assert.equal(idsFor('bmp280')[0], 'bmp280')
  assert.equal(idsFor('pressure sensor').includes('bmp280'), true)
})

test('ESP8266 stays a generic row and does not claim ESP-01 or NodeMCU', () => {
  const board = getCatalogueComponent('esp8266')
  assert.equal(board?.id, 'esp8266')
  assert.equal(board?.name, 'ESP8266')
  assert.equal(board?.description, 'Wi-Fi microcontroller')
  assert.equal(board?.category, 'microcontrollers')
  assert.equal(idsFor('esp-01').includes('esp8266'), false)
  assert.equal(idsFor('nodemcu').includes('esp8266'), false)
  assert.equal(idsFor('esp8266')[0], 'esp8266')
  assert.equal(idsFor('esp-8266').includes('esp8266'), true)
})

test('the catalogue buzzer is the active buzzer named by the motion-alarm steps', () => {
  const buzzer = getCatalogueComponent('buzzer')
  assert.equal(buzzer?.id, 'buzzer')
  assert.equal(buzzer?.name, 'Active buzzer')
  assert.equal(buzzer?.category, 'actuators')
  assert.equal(
    buzzer?.description,
    'Three-pin active buzzer module: VCC, I/O, and GND. HIGH on I/O turns the sounder on. The module switches the sounder from VCC, so the GPIO is a control pin. A two-pin piezo is a different part.',
  )
  assert.equal(idsFor('active buzzer')[0], 'buzzer')
  assert.equal(idsFor('buzzer')[0], 'buzzer')
  assert.equal(idsFor('passive buzzer').includes('buzzer'), false)
  assert.equal(idsFor('passive piezo').includes('buzzer'), false)
})

test('value-specific resistors stay distinct from the generic resistor and from each other', () => {
  assert.equal(idsFor('10k resistor')[0], 'resistor-10k')
  assert.equal(idsFor('10k resistor').includes('resistor'), false)
  assert.equal(idsFor('10k resistor').includes('potentiometer-10k'), false)
  assert.equal(idsFor('10k pot')[0], 'potentiometer-10k')
  assert.equal(idsFor('10k pot').includes('resistor-10k'), false)
  assert.equal(idsFor('100 ohm')[0], 'resistor-100')
  assert.equal(idsFor('100k')[0], 'resistor-100k')
  assert.equal(idsFor('4.7k')[0], 'resistor-4k7')
  assert.equal(idsFor('47k')[0], 'resistor-47k')
  assert.equal(idsFor('2.2k')[0], 'resistor-2k2')
  assert.equal(idsFor('220 ohm')[0], 'resistor-220')
  assert.equal(getCatalogueComponent('capacitor-10uf')?.description?.includes('polarised'), true)
  assert.equal(getCatalogueComponent('capacitor-100uf')?.description?.includes('polarised'), true)
  assert.equal(getCatalogueComponent('capacitor-100nf')?.description, '100 nF ceramic capacitor')
})

test('Pico W, ESP32-CAM, and the Raspberry Pi computers have their own identities', () => {
  assert.equal(getCatalogueComponent('raspberry-pi-pico-w')?.category, 'microcontrollers')
  assert.equal(getCatalogueComponent('esp32-cam')?.category, 'microcontrollers')
  assert.equal(getCatalogueComponent('esp32-cam')?.name, 'AI-Thinker ESP32-CAM')
  assert.equal(getCatalogueComponent('raspberry-pi-4')?.category, 'computers')
  assert.equal(getCatalogueComponent('raspberry-pi-5')?.category, 'computers')
  assert.equal(getCatalogueComponent('raspberry-pi-4')?.description?.includes('RAM'), true)
  assert.equal(idsFor('pico w')[0], 'raspberry-pi-pico-w')
  assert.equal(idsFor('pico w').includes('raspberry-pi-pico'), false)
  assert.equal(idsFor('picow')[0], 'raspberry-pi-pico-w')
  assert.equal(idsFor('pico')[0], 'raspberry-pi-pico')
  assert.equal(idsFor('esp32')[0], 'esp32')
  assert.equal(idsFor('esp32-cam')[0], 'esp32-cam')
  assert.equal(idsFor('esp32-cam').includes('esp32'), false)
  assert.equal(idsFor('raspberry pi 4')[0], 'raspberry-pi-4')
  assert.equal(idsFor('raspberry pi 4').includes('raspberry-pi-5'), false)
  assert.equal(idsFor('pi 5')[0], 'raspberry-pi-5')
  assert.equal(idsFor('pi 5').includes('raspberry-pi-4'), false)
  assert.equal(INVENTORY_CATEGORY_IDS.includes('computers'), true)
  assert.equal(CATEGORY_LABELS.computers, 'Computer')
})

test('jumper labels name the connector gender and search still finds both', () => {
  assert.equal(componentDisplayName('jumper-wires', 'Jumper Wires'), 'Male-to-Male Jumper Wires')
  assert.equal(componentDisplayName('jumper-male-female', 'Jumper Wires'), 'Male-to-Female Jumper Wires')
  assert.equal(getCatalogueComponent('jumper-wires')?.id, 'jumper-wires')
  assert.equal(getCatalogueComponent('jumper-male-female')?.id, 'jumper-male-female')
  assert.equal(componentDisplayName('jumper-wires') === componentDisplayName('jumper-male-female'), false)

  const found = idsFor('jumper wires')
  assert.equal(found.includes('jumper-wires'), true)
  assert.equal(found.includes('jumper-male-female'), true)

  const projects = new Map(localAuthoredProjects().map((project) => [project.slug, project]))
  const quantity = (slug: string, componentSlug: string) => {
    const line = projects.get(slug)?.bom.find((item) => item.slug === componentSlug)
    assert.ok(line, `${slug} ${componentSlug}`)
    return line.quantity
  }
  assert.equal(quantity('8', 'jumper-wires'), 10)
  assert.equal(quantity('24', 'jumper-wires'), 8)
  assert.equal(quantity('24', 'jumper-male-female'), 5)
  assert.equal(quantity('25', 'jumper-wires'), 2)
  assert.equal(quantity('25', 'jumper-male-female'), 10)

  const maleToMaleId = '00000000-0000-4000-8000-000000000011'
  const maleToFemaleId = '00000000-0000-4000-8000-000000000012'
  const lines = [
    {
      id: 'bom-8-jumper-wires',
      componentId: maleToMaleId,
      slug: 'jumper-wires',
      name: componentDisplayName('jumper-wires', 'Jumper Wires'),
      description: null,
      quantity: quantity('8', 'jumper-wires'),
      sortOrder: 1,
    },
    {
      id: 'bom-25-jumper-male-female',
      componentId: maleToFemaleId,
      slug: 'jumper-male-female',
      name: componentDisplayName('jumper-male-female', 'Jumper Wires'),
      description: null,
      quantity: 10,
      sortOrder: 2,
    },
  ]
  const covered = matchProjectInventory(lines, [{ componentId: maleToMaleId, quantity: 10 }], null)
  assert.equal(covered.lines[0]?.name, 'Male-to-Male Jumper Wires')
  assert.equal(covered.lines[0]?.isOwned, true)
  assert.equal(covered.lines[0]?.missingQuantity, 0)
  assert.equal(covered.lines[1]?.name, 'Male-to-Female Jumper Wires')
  assert.equal(covered.lines[1]?.isOwned, false)
  assert.equal(covered.lines[0]?.componentId, maleToMaleId)
})

test('generic catalogue rows stay generic', () => {
  assert.equal(componentDisplayName('usb-data-cable', 'USB data cable'), 'USB data cable')
  assert.equal(componentDisplayName('usb-data-cable').includes('USB-B'), false)
  assert.equal(componentDisplayName('usb-data-cable').includes('Micro-B'), false)
  assert.equal(componentDisplayName('esp32', 'ESP32 DevKit'), 'ESP32 DevKit')
  assert.equal(componentDisplayName('esp32') === componentDisplayName('esp32-devkitc-v4'), false)
  assert.equal(componentDisplayName('resistor', 'Resistor'), 'Resistor')
  assert.equal(componentDisplayName('resistor-220', 'Resistor'), '220 Ω resistor')
  assert.equal(componentDisplayName('resistor-1k', 'Resistor'), '1 kΩ resistor')
  assert.equal(componentDisplayName('unknown-part', 'Stored name'), 'Stored name')
  assert.equal(getCatalogueComponent('buzzer')?.name, 'Active buzzer')
  assert.equal(getCatalogueComponent('sg90')?.name, 'SG90 Micro Servo')
  assert.equal(getCatalogueComponent('mg90s')?.name, 'MG90S Servo')
  assert.equal(getCatalogueComponent('rgb-led-ca')?.name, 'Common-anode RGB LED')
  assert.equal(getCatalogueComponent('rgb-led-cc')?.name, 'Common-cathode RGB LED')
  assert.equal(getCatalogueComponent('max7219')?.name, 'MAX7219 LED Matrix')
  assert.equal(getCatalogueComponent('stemma-qt-female')?.name, 'STEMMA QT to female cable')
  assert.equal(getCatalogueComponent('stemma-qt-cable')?.name, 'STEMMA QT to male cable')
})

test('Pico W does not resolve to the Raspberry Pi Pico row', () => {
  const pico = getCatalogueComponent('raspberry-pi-pico')
  assert.equal(pico?.name, 'Raspberry Pi Pico')
  assert.equal(pico?.description, 'RP2040 microcontroller board')
  assert.equal(pico?.category, 'microcontrollers')
  assert.equal(idsFor('pico')[0], 'raspberry-pi-pico')
  assert.equal(idsFor('pi pico').includes('raspberry-pi-pico'), true)
  assert.equal(idsFor('rp2040').includes('raspberry-pi-pico'), true)
  assert.equal(idsFor('pico w').includes('raspberry-pi-pico'), false)
  assert.equal(idsFor('picow').includes('raspberry-pi-pico'), false)
  assert.equal(idsFor('pico-w').includes('raspberry-pi-pico'), false)
})
