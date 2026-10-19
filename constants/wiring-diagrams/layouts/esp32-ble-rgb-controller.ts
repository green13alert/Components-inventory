import type { WiringLayout } from '../types';
import { RGB_PHYSICAL } from '../physical-layouts.ts';

const channel = (colour: 'red' | 'green' | 'blue', y: number) =>
  [
    {
      id: `base-${colour}`,
      kind: 'resistor' as const,
      label: `1k ${colour}`,
      aliases: [`${colour} 1k`, `${colour} base resistor`],
      identity: {
        catalogueId: 'resistor-1k',
        role: `Limits base current for the ${colour} transistor.`,
      },
      x: 20,
      y,
      width: 96,
      height: 26,
      resistorOhms: 1000 as const,
      ports: [
        { id: 'leg1', label: 'leg 1', dx: 0, dy: 13, aliases: ['leg1'] },
        { id: 'leg2', label: 'leg 2', dx: 96, dy: 13, aliases: ['leg2'] },
      ],
    },
    {
      id: `q-${colour}`,
      kind: 'npn' as const,
      label: `Q ${colour}`,
      aliases: [`${colour} transistor`, `${colour} pn2222a`],
      identity: {
        catalogueId: 'pn2222a',
        role: `Switches the ${colour} LED channel.`,
        orientation: 'Flat face to the right. Emitter is the top lead, then base, then collector.',
      },
      x: 128,
      y: y - 8,
      width: 44,
      height: 46,
      ports: [
        { id: 'base', label: 'Base', dx: 0, dy: 20, aliases: ['b'] },
        { id: 'collector', label: 'Collector', dx: 44, dy: 10, aliases: ['c'] },
        { id: 'emitter', label: 'Emitter', dx: 22, dy: 46, aliases: ['e'] },
      ],
    },
    {
      id: `limit-${colour}`,
      kind: 'resistor' as const,
      label: `220 ${colour}`,
      aliases: [`${colour} 220`, `${colour} limiter`],
      identity: {
        catalogueId: 'resistor-220',
        role: `Limits current in the ${colour} LED channel.`,
      },
      x: 184,
      y,
      width: 96,
      height: 26,
      resistorOhms: 220 as const,
      ports: [
        { id: 'leg1', label: 'leg 1', dx: 0, dy: 13, aliases: ['leg1'] },
        { id: 'leg2', label: 'leg 2', dx: 96, dy: 13, aliases: ['leg2'] },
      ],
    },
  ];

export const ESP32_BLE_RGB_LAYOUT: WiringLayout = {
  slug: '24',
  width: 360,
  height: 700,
  physical: RGB_PHYSICAL,
  wireLabels: {
    ground: 'GND',
    pwm: 'PWM',
    powerLogic: '5V',
  },
  elements: [
    {
      id: 'esp32',
      kind: 'esp32-devkit',
      label: 'ESP32 DevKit',
      aliases: ['esp32', 'esp32 devkit'],
      identity: {
        catalogueId: 'esp32',
        role: 'Receives the colour from the phone and drives the three transistors.',
      },
      x: 8,
      y: 8,
      width: 120,
      height: 168,
      ports: [
        { id: 'v5', label: '5V', dx: 128, dy: 28, aliases: ['5v'] },
        { id: 'gnd', label: 'GND', dx: 128, dy: 58, aliases: ['gnd'] },
        { id: 'io25', label: 'IO25', dx: 128, dy: 96, aliases: ['io25', 'gpio25'] },
        { id: 'io26', label: 'IO26', dx: 128, dy: 128, aliases: ['io26', 'gpio26'] },
        { id: 'io27', label: 'IO27', dx: 128, dy: 156, aliases: ['io27', 'gpio27'] },
      ],
    },
    {
      id: 'breadboard',
      kind: 'breadboard',
      label: 'Breadboard',
      aliases: ['breadboard'],
      identity: {
        catalogueId: 'breadboard',
        role: 'Joins leads that share a numbered row on the same side of the centre gap.',
      },
      x: 8,
      y: 190,
      width: 344,
      height: 490,
      ports: [
        { id: 'plus', label: '5V rail', dx: 210, dy: 19, aliases: ['5vrail', 'plusrail'] },
        { id: 'minus', label: 'GND rail', dx: 142, dy: 43, aliases: ['gndrail'] },
      ],
    },
    ...channel('red', 220),
    ...channel('green', 470),
    ...channel('blue', 580),
    {
      id: 'led',
      kind: 'rgb-led',
      label: 'RGB LED',
      aliases: ['rgb led', 'common anode rgb'],
      identity: {
        catalogueId: 'rgb-led-ca',
        role: 'Lights in the colour sent from the phone. Current enters the long common-anode lead.',
        orientation: 'Flat on the flange toward row 1. In column f, from row 6: red, anode, blue, green.',
      },
      x: 292,
      y: 310,
      width: 56,
      height: 140,
      ports: [
        { id: 'red', label: 'Red', dx: 0, dy: 52, aliases: ['redcathode', 'pin1'] },
        { id: 'anode', label: 'Anode', dx: 0, dy: 74, aliases: ['commonanode', 'pin2'] },
        { id: 'blue', label: 'Blue', dx: 0, dy: 96, aliases: ['bluecathode', 'pin3'] },
        { id: 'green', label: 'Green', dx: 0, dy: 118, aliases: ['greencathode', 'pin4'] },
      ],
    },
  ],
};
