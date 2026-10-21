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
      aliases: ['esp32', 'esp32 devkit', 'esp32-devkitc v4'],
      identity: {
        catalogueId: 'esp32-devkitc-v4',
        role: 'Reads the sensor over I2C and serves the weather page.',
      },
      x: 4,
      y: 28,
      width: 108,
      height: 250,
      ports: [
        { id: '3v3', label: '3V3', dx: 108, dy: 40, aliases: ['3v3'] },
        { id: 'gnd', label: 'GND', dx: 108, dy: 88, aliases: ['gnd'] },
        { id: 'io21', label: 'IO21', dx: 108, dy: 136, aliases: ['io21', 'gpio21'] },
        { id: 'io22', label: 'IO22', dx: 108, dy: 184, aliases: ['io22', 'gpio22'] },
      ],
    },
    {
      id: 'bme280',
      kind: 'bme280',
      label: 'Adafruit BME280',
      aliases: ['bme280', 'adafruit bme280'],
      identity: {
        catalogueId: 'bme280',
        role: 'Measures temperature, humidity, and pressure. The female cable plugs onto the DevKit headers.',
      },
      accessory: {
        id: 'stemma',
        catalogueId: 'stemma-qt-female',
        role: 'JST-SH to four female sockets. Black is GND, red is VIN, blue is SDA, and yellow is SCL.',
        orientation: 'Red on 3V3, black on GND, blue on IO21, yellow on IO22.',
      },
      x: 200,
      y: 48,
      width: 120,
      height: 200,
      cableLabel: 'STEMMA QT',
      ports: [
        { id: 'vin', label: 'Vin', dx: 0, dy: 20, aliases: ['vin'] },
        { id: 'gnd', label: 'GND', dx: 0, dy: 68, aliases: ['gnd'] },
        { id: 'sdi', label: 'SDI', dx: 0, dy: 116, aliases: ['sdi', 'sda'] },
        { id: 'sck', label: 'SCK', dx: 0, dy: 164, aliases: ['sck', 'scl'] },
      ],
    },
  ],
};
