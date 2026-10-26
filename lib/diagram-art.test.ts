import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_LAYOUT } from '../constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { moduleArt } from './diagram-art.ts'
import { buildPhysicalScene } from './physical-scene.ts'
import { resistorColorCode } from './resistor-bands.ts'

test('priority modules draw recognisable marks inside their boxes', () => {
  const uno = moduleArt('uno', 0, 0, 168, 320)
  assert.equal(uno.some((mark) => mark.kind === 'text' && mark.text === 'UNO'), true)
  assert.equal(uno.some((mark) => mark.kind === 'rect' && mark.fill === '#00878F'), true)
  const matrix = moduleArt('led-matrix', 0, 0, 128, 128)
  assert.equal(matrix.filter((mark) => mark.kind === 'circle' && mark.fill === '#EF4444').length, 64)
  const stick = moduleArt('joystick', 0, 0, 164, 214)
  assert.equal(stick.some((mark) => mark.kind === 'text' && mark.text === 'KY-023'), true)
  const devkit = moduleArt('esp32', 0, 0, 148, 344)
  assert.equal(devkit.some((mark) => mark.kind === 'text' && mark.text === 'ESP32'), true)
})

test('project resistor values keep distinct standard bands', () => {
  assert.deepEqual(resistorColorCode(220)?.colors, ['red', 'red', 'brown', 'gold'])
  assert.deepEqual(resistorColorCode(1000)?.colors, ['brown', 'black', 'red', 'gold'])
  assert.deepEqual(resistorColorCode(100)?.colors, ['brown', 'black', 'brown', 'gold'])
})

test('uno power labels sit on the R3 header with the USB end at the bottom', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT)
  const uno = scene?.parts.find((part) => part.id === 'arduino')
  assert.ok(uno && 'pins' in uno)
  const pin = (label: string) => {
    const found = uno.pins.find((item) => item.label === label)
    assert.ok(found)
    return found
  }
  const a1 = pin('A1')
  const a0 = pin('A0')
  const ground = pin('GND')
  const supply = pin('5V')
  const d13 = pin('D13')
  const d2 = pin('D2')
  assert.ok(a1.at.y < a0.at.y)
  assert.ok(a0.at.y < ground.at.y)
  assert.equal(supply.at.y - ground.at.y, 16)
  assert.equal(a0.at.x, supply.at.x)
  assert.ok(supply.at.x < d13.at.x)
  assert.ok(d13.at.y < d2.at.y)
  const strips = moduleArt('uno', uno.x, uno.y, uno.width, uno.height).filter(
    (mark) => mark.kind === 'rect' && mark.fill === '#111827' && mark.width === 14,
  )
  assert.equal(strips.length, 4)
})

test('devkitc labels keep the Espressif J2 and J3 order', () => {
  const weather = buildPhysicalScene(ESP32_WIFI_WEATHER_LAYOUT)
  const station = weather?.parts.find((part) => part.id === 'esp32')
  assert.ok(station && 'pins' in station)
  const at = (label: string) => {
    const found = station.pins.find((item) => item.label === label)
    assert.ok(found)
    return found
  }
  const power = at('3V3')
  const ground = at('GND')
  const clock = at('IO22')
  const data = at('IO21')
  assert.ok(power.at.y < ground.at.y)
  assert.ok(power.at.x < clock.at.x)
  assert.ok(clock.at.y < data.at.y)
  assert.equal(clock.at.x, data.at.x)

  const rgb = buildPhysicalScene(ESP32_BLE_RGB_LAYOUT)
  const board = rgb?.parts.find((part) => part.id === 'esp32')
  assert.ok(board && 'pins' in board)
  const gpio = (label: string) => {
    const found = board.pins.find((item) => item.label === label)
    assert.ok(found)
    return found
  }
  const red = gpio('IO25')
  const green = gpio('IO26')
  const blue = gpio('IO27')
  const supply = gpio('5V')
  assert.ok(red.at.y < green.at.y && green.at.y < blue.at.y && blue.at.y < gpio('GND').at.y)
  assert.ok(gpio('GND').at.y < supply.at.y)
  assert.equal(red.at.x, supply.at.x)
})

test('pir dome and active-buzzer can stay recognisable in the on-hole box', () => {
  const pir = moduleArt('pir', 0, 0, 58, 48)
  const dome = pir.find((mark) => mark.kind === 'circle' && mark.fill === '#F8FAFC')
  assert.ok(dome && dome.kind === 'circle' && dome.r >= 14)
  const buzzer = moduleArt('buzzer', 0, 0, 58, 48)
  const can = buzzer.filter((mark) => mark.kind === 'circle').sort((a, b) => (a.kind === 'circle' && b.kind === 'circle' ? b.r - a.r : 0))[0]
  assert.ok(can && can.kind === 'circle' && can.r >= 16)
  assert.equal(buzzer.some((mark) => mark.kind === 'rect' && mark.fill === '#14532D'), true)
})

test('illustration changes do not move project 25 connector anchors', () => {
  const scene = buildPhysicalScene(LED_MATRIX_MAZE_LAYOUT)
  assert.ok(scene)
  const matrix = scene.parts.find((part) => part.id === 'matrix')
  const joystick = scene.parts.find((part) => part.id === 'joystick')
  const uno = scene.parts.find((part) => part.id === 'arduino')
  assert.equal(matrix && 'pins' in matrix ? matrix.pins.map((pin) => pin.label).join() : '', 'CLK,CS,DIN,GND,VCC')
  assert.equal(joystick && 'pins' in joystick ? joystick.pins.map((pin) => pin.label).join() : '', 'GND,+5V,VRx,VRy,SW')
  assert.equal(uno && 'pins' in uno ? uno.pins.some((pin) => pin.label === 'D13') : false, true)
  if (matrix && 'pins' in matrix && 'x' in matrix) {
    assert.ok(matrix.pins.every((pin) => pin.at.x > matrix.x + matrix.width))
  }
})
