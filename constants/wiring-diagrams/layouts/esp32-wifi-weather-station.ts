import type { WiringLayout } from '../types';
import { WEATHER_PHYSICAL } from '../physical-layouts.ts';

export const ESP32_WIFI_WEATHER_LAYOUT: WiringLayout = {
  slug: '23',
  physical: WEATHER_PHYSICAL,
  width: 360,
  height: 300,
  wireLabels: {
    powerLogic: '3V3',
    ground: 'GND',
    i2cData: 'SDI',
    i2cClock: 'SCK',
  },
  elements: [
    {
      id: 'esp32',
      kind: 'esp32-devkit',
      label: 'ESP32 DevKit',
      aliases: ['esp32', 'esp32 devkit'],
      identity: {
        catalogueId: 'esp32',
        role: 'Reads the sensor over I2C and serves the weather page.',
      },
      x: 4,
      y: 28,
      width: 108,
      height: 250,
      ports: [
        { id: '3v3', label: '3V3', dx: 108, dy: 56, aliases: ['3v3'] },
        { id: 'gnd', label: 'GND', dx: 108, dy: 100, aliases: ['gnd'] },
        { id: 'io21', label: 'IO21', dx: 108, dy: 142, aliases: ['io21', 'gpio21'] },
        { id: 'io22', label: 'IO22', dx: 108, dy: 190, aliases: ['io22', 'gpio22'] },
      ],
    },
    {
      id: 'breadboard',
      kind: 'breadboard',
      label: 'Breadboard',
      aliases: ['breadboard'],
      identity: {
        catalogueId: 'breadboard',
        role: 'Joins the STEMMA QT pins to the DevKit jumpers. The positive rail is 3.3 V.',
      },
      x: 120,
      y: 28,
      width: 128,
      height: 230,
      powerRailLabel: '+ 3V3',
      ports: [
        { id: 'plus', label: '+ rail', dx: 76, dy: 19, aliases: ['plusrail'] },
        { id: 'minus', label: 'GND rail', dx: 76, dy: 43, aliases: ['gndrail'] },
      ],
    },
    {
      id: 'bme280',
      kind: 'bme280',
      label: 'BME280',
      aliases: ['bme280', 'adafruit bme280'],
      identity: {
        catalogueId: 'bme280',
        role: 'Measures temperature, humidity, and pressure. The board stays off the breadboard.',
      },
      accessory: {
        id: 'stemma',
        catalogueId: 'stemma-qt-cable',
        role: 'Carries the sensor pins onto the breadboard.',
        orientation: 'Red in the left + rail at row 6, black in the left − rail at row 6, blue in a10, yellow in a14.',
      },
      x: 260,
      y: 96,
      width: 92,
      height: 170,
      cableLabel: 'STEMMA QT',
      ports: [
        { id: 'vin', label: 'Vin', dx: -34, dy: -49, aliases: ['vin'] },
        { id: 'gnd', label: 'GND', dx: -34, dy: -25, aliases: ['gnd'] },
        { id: 'sdi', label: 'SDI', dx: -34, dy: 74, aliases: ['sdi', 'sda'] },
        { id: 'sck', label: 'SCK', dx: -34, dy: 122, aliases: ['sck', 'scl'] },
      ],
    },
  ],
};
