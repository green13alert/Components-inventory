import type { PhysicalLayout } from './types'

const strip = (column: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j', row: number) =>
  ({ kind: 'strip' as const, column, row })

const rail = (side: 'left' | 'right', polarity: 'plus' | 'minus', row: number) =>
  ({ kind: 'rail' as const, side, polarity, row })

const pin = (elementId: string, portId: string) => ({ kind: 'module' as const, elementId, portId })

/** Rows 1–15 sit above a mid-board rail break. Rows 16–17 are drawn so the break is visible. */
const upperBoard = { rows: 17, railSplitAfter: 15 }

export const RGB_PHYSICAL: PhysicalLayout = {
  ...upperBoard,
  leads: [
    { elementId: 'q-red', portId: 'emitter', hole: strip('c', 1) },
    { elementId: 'q-red', portId: 'base', hole: strip('c', 2) },
    { elementId: 'q-red', portId: 'collector', hole: strip('c', 3) },
    { elementId: 'base-red', portId: 'leg1', hole: strip('i', 2) },
    { elementId: 'base-red', portId: 'leg2', hole: strip('e', 2) },
    { elementId: 'limit-red', portId: 'leg1', hole: strip('e', 3) },
    { elementId: 'limit-red', portId: 'leg2', hole: strip('h', 6) },
    { elementId: 'led', portId: 'red', hole: strip('f', 6) },
    { elementId: 'led', portId: 'anode', hole: strip('f', 7) },
    { elementId: 'led', portId: 'blue', hole: strip('f', 8) },
    { elementId: 'led', portId: 'green', hole: strip('f', 9) },
    { elementId: 'q-green', portId: 'emitter', hole: strip('c', 10) },
    { elementId: 'q-green', portId: 'base', hole: strip('c', 11) },
    { elementId: 'q-green', portId: 'collector', hole: strip('c', 12) },
    { elementId: 'base-green', portId: 'leg1', hole: strip('i', 11) },
    { elementId: 'base-green', portId: 'leg2', hole: strip('e', 11) },
    { elementId: 'limit-green', portId: 'leg1', hole: strip('a', 12) },
    { elementId: 'limit-green', portId: 'leg2', hole: strip('d', 15) },
    { elementId: 'q-blue', portId: 'emitter', hole: strip('h', 13) },
    { elementId: 'q-blue', portId: 'base', hole: strip('h', 14) },
    { elementId: 'q-blue', portId: 'collector', hole: strip('h', 15) },
    { elementId: 'base-blue', portId: 'leg1', hole: strip('e', 14) },
    { elementId: 'base-blue', portId: 'leg2', hole: strip('g', 14) },
    { elementId: 'limit-blue', portId: 'leg1', hole: strip('j', 15) },
    { elementId: 'limit-blue', portId: 'leg2', hole: strip('g', 12) },
  ],
  jumpers: [
    { id: 'devkit-5v', gender: 'male-female', from: pin('esp32', 'v5'), to: rail('left', 'plus', 2) },
    { id: 'devkit-gnd', gender: 'male-female', from: pin('esp32', 'gnd'), to: rail('left', 'minus', 2) },
    { id: 'devkit-io25', gender: 'male-female', from: pin('esp32', 'io25'), to: strip('j', 2) },
    { id: 'devkit-io26', gender: 'male-female', from: pin('esp32', 'io26'), to: strip('j', 11) },
    { id: 'devkit-io27', gender: 'male-female', from: pin('esp32', 'io27'), to: strip('a', 14) },
    { id: 'red-emitter', gender: 'male-male', from: strip('a', 1), to: rail('left', 'minus', 3) },
    { id: 'green-emitter', gender: 'male-male', from: strip('a', 10), to: rail('left', 'minus', 10) },
    { id: 'blue-emitter', gender: 'male-male', from: strip('j', 13), to: rail('right', 'minus', 13) },
    { id: 'anode-rail', gender: 'male-male', from: strip('j', 7), to: rail('right', 'plus', 7) },
    { id: 'bridge-plus', gender: 'male-male', from: rail('left', 'plus', 1), to: rail('right', 'plus', 1) },
    { id: 'bridge-minus', gender: 'male-male', from: rail('left', 'minus', 1), to: rail('right', 'minus', 1) },
    { id: 'green-cathode', gender: 'male-male', from: strip('b', 15), to: strip('j', 9) },
    { id: 'blue-cathode', gender: 'male-male', from: strip('j', 12), to: strip('j', 8) },
  ],
  railBindings: [
    { elementId: 'breadboard', portId: 'plus', side: 'left', polarity: 'plus', segment: 'upper' },
    { elementId: 'breadboard', portId: 'minus', side: 'left', polarity: 'minus', segment: 'upper' },
  ],
}

export const MOTION_PHYSICAL: PhysicalLayout = {
  ...upperBoard,
  leads: [
    { elementId: 'pir', portId: 'vcc', hole: strip('c', 3) },
    { elementId: 'pir', portId: 'out', hole: strip('c', 4) },
    { elementId: 'pir', portId: 'gnd', hole: strip('c', 5) },
    { elementId: 'resistor', portId: 'leg1', hole: strip('e', 8) },
    { elementId: 'resistor', portId: 'leg2', hole: strip('e', 12) },
    { elementId: 'led', portId: 'anode', hole: strip('d', 12) },
    { elementId: 'led', portId: 'cathode', hole: strip('d', 13) },
    { elementId: 'buzzer', portId: 'vcc', hole: strip('c', 9) },
    { elementId: 'buzzer', portId: 'sig', hole: strip('c', 10) },
    { elementId: 'buzzer', portId: 'gnd', hole: strip('c', 11) },
  ],
  jumpers: [
    { id: 'uno-5v', gender: 'male-male', from: pin('arduino', '5v'), to: rail('left', 'plus', 1) },
    { id: 'uno-gnd', gender: 'male-male', from: pin('arduino', 'gnd'), to: rail('left', 'minus', 1) },
    { id: 'pir-vcc', gender: 'male-male', from: rail('left', 'plus', 3), to: strip('a', 3) },
    { id: 'pir-out', gender: 'male-male', from: pin('arduino', 'd2'), to: strip('a', 4) },
    { id: 'pir-gnd', gender: 'male-male', from: rail('left', 'minus', 5), to: strip('a', 5) },
    { id: 'led-signal', gender: 'male-male', from: pin('arduino', 'd8'), to: strip('a', 8) },
    { id: 'led-cathode', gender: 'male-male', from: strip('a', 13), to: rail('left', 'minus', 13) },
    { id: 'buzzer-vcc', gender: 'male-male', from: rail('left', 'plus', 9), to: strip('a', 9) },
    { id: 'buzzer-sig', gender: 'male-male', from: pin('arduino', 'd9'), to: strip('a', 10) },
    { id: 'buzzer-gnd', gender: 'male-male', from: rail('left', 'minus', 11), to: strip('a', 11) },
  ],
  railBindings: [
    { elementId: 'breadboard', portId: 'plus', side: 'left', polarity: 'plus', segment: 'upper' },
    { elementId: 'breadboard', portId: 'minus', side: 'left', polarity: 'minus', segment: 'upper' },
  ],
}

export const WEATHER_PHYSICAL: PhysicalLayout = {
  ...upperBoard,
  leads: [
    { elementId: 'bme280', portId: 'vin', hole: rail('left', 'plus', 6) },
    { elementId: 'bme280', portId: 'gnd', hole: rail('left', 'minus', 6) },
    { elementId: 'bme280', portId: 'sdi', hole: strip('a', 10) },
    { elementId: 'bme280', portId: 'sck', hole: strip('a', 14) },
  ],
  jumpers: [
    { id: 'devkit-3v3', gender: 'male-female', from: pin('esp32', '3v3'), to: rail('left', 'plus', 9) },
    { id: 'devkit-gnd', gender: 'male-female', from: pin('esp32', 'gnd'), to: rail('left', 'minus', 9) },
    { id: 'devkit-io21', gender: 'male-female', from: pin('esp32', 'io21'), to: strip('b', 10) },
    { id: 'devkit-io22', gender: 'male-female', from: pin('esp32', 'io22'), to: strip('b', 14) },
  ],
  railBindings: [
    { elementId: 'breadboard', portId: 'plus', side: 'left', polarity: 'plus', segment: 'upper' },
    { elementId: 'breadboard', portId: 'minus', side: 'left', polarity: 'minus', segment: 'upper' },
  ],
}

export const SERVO_PHYSICAL: PhysicalLayout = {
  ...upperBoard,
  leads: [
    { elementId: 'joystick', portId: '5v', hole: strip('c', 8) },
    { elementId: 'joystick', portId: 'gnd', hole: strip('c', 9) },
    { elementId: 'joystick', portId: 'vrx', hole: strip('c', 10) },
    { elementId: 'joystick', portId: 'vry', hole: strip('c', 11) },
    { elementId: 'joystick', portId: 'sw', hole: strip('c', 12) },
  ],
  jumpers: [
    { id: 'uno-5v', gender: 'male-male', from: pin('arduino', '5v'), to: rail('left', 'plus', 2) },
    { id: 'uno-gnd', gender: 'male-male', from: pin('arduino', 'gnd'), to: rail('left', 'minus', 2) },
    { id: 'psu-gnd', gender: 'male-male', from: pin('psu', 'gnd'), to: rail('right', 'minus', 3) },
    { id: 'psu-5v', gender: 'male-male', from: pin('psu', '5v'), to: rail('right', 'plus', 3) },
    { id: 'bridge-minus', gender: 'male-male', from: rail('left', 'minus', 1), to: rail('right', 'minus', 1) },
    { id: 'pan-vcc', gender: 'male-male', from: rail('right', 'plus', 5), to: pin('pan', 'vcc') },
    { id: 'pan-gnd', gender: 'male-male', from: rail('right', 'minus', 6), to: pin('pan', 'gnd') },
    { id: 'pan-sig', gender: 'male-male', from: pin('arduino', 'd9'), to: pin('pan', 'sig') },
    { id: 'tilt-vcc', gender: 'male-male', from: rail('right', 'plus', 8), to: pin('tilt', 'vcc') },
    { id: 'tilt-gnd', gender: 'male-male', from: rail('right', 'minus', 9), to: pin('tilt', 'gnd') },
    { id: 'tilt-sig', gender: 'male-male', from: pin('arduino', 'd10'), to: pin('tilt', 'sig') },
    { id: 'joy-5v', gender: 'male-male', from: rail('left', 'plus', 8), to: strip('a', 8) },
    { id: 'joy-gnd', gender: 'male-male', from: rail('left', 'minus', 9), to: strip('a', 9) },
    { id: 'joy-vrx', gender: 'male-male', from: pin('arduino', 'a0'), to: strip('a', 10) },
    { id: 'joy-vry', gender: 'male-male', from: pin('arduino', 'a1'), to: strip('a', 11) },
    { id: 'joy-sw', gender: 'male-male', from: pin('arduino', 'd2'), to: strip('a', 12) },
  ],
  railBindings: [
    { elementId: 'breadboard', portId: 'logic-plus', side: 'left', polarity: 'plus', segment: 'upper' },
    { elementId: 'breadboard', portId: 'gnd', side: 'left', polarity: 'minus', segment: 'upper' },
    { elementId: 'breadboard', portId: 'servo-plus', side: 'right', polarity: 'plus', segment: 'upper' },
  ],
}
