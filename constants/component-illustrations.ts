/**
 * Global Solderi component illustration identifiers.
 * Add new hardware here — SVG art lives in ComponentIllustration.tsx,
 * colours in component-illustration-palette.ts.
 *
 * Resolution order:
 * 1. Catalogue slug uses that row's shared `image`.
 * 2. A known illustration id is used directly.
 * 3. Name rules match a specific shape, then a category fallback.
 * 4. `generic-module` is the last resort.
 */

import { getCatalogueComponent } from './component-catalogue.ts';

export const COMPONENT_ILLUSTRATION_IDS = [
  'arduino-uno',
  'esp32',
  'esp32-cam',
  'raspberry-pi-pico',
  'raspberry-pi',
  'servo-sg90',
  'hc-sr04',
  'oled',
  'dht11',
  'led',
  'resistor',
  'resistor-band-220',
  'resistor-band-1k',
  'ceramic-capacitor',
  'electrolytic-capacitor',
  'tactile-button',
  'potentiometer',
  'dc-motor',
  'breadboard',
  'pir-sensor',
  'lcd-display',
  'relay-module',
  'bluetooth-module',
  'battery',
  'motor-driver',
  'jumper-wires',
  'bme280',
  'usb-cable',
  'transistor',
  'rgb-led',
  'buzzer',
  'joystick',
  'breadboard-psu',
  'stemma-qt',
  'generic-sensor',
  'generic-board',
  'generic-module',
  'generic-motor',
  'generic-display',
  'electronics-kit',
] as const;

export type ComponentIllustrationId = (typeof COMPONENT_ILLUSTRATION_IDS)[number];

/** Canonical onboarding / catalog ids map 1:1 to illustration ids. */
export const ONBOARDING_COMPONENT_IDS = [
  'arduino-uno',
  'esp32',
  'servo-sg90',
  'hc-sr04',
  'oled',
  'dht11',
  'led',
  'resistor',
  'breadboard',
  'dc-motor',
] as const;

const DIRECT_IDS = new Set<string>(COMPONENT_ILLUSTRATION_IDS);

type ResolveInput = {
  id?: string;
  name?: string;
};

const NAME_RULES: { pattern: RegExp; id: ComponentIllustrationId }[] = [
  { pattern: /esp32[-\s]?cam/i, id: 'esp32-cam' },
  { pattern: /raspberry pi pico|pico w|\bpico\b/i, id: 'raspberry-pi-pico' },
  { pattern: /raspberry pi/i, id: 'raspberry-pi' },
  { pattern: /ceramic capacitor|\d+\s*nf\b/i, id: 'ceramic-capacitor' },
  { pattern: /electrolytic/i, id: 'electrolytic-capacitor' },
  { pattern: /potentiometer|\bpot\b/i, id: 'potentiometer' },
  { pattern: /tactile|push button|\bbutton\b/i, id: 'tactile-button' },
  { pattern: /arduino/i, id: 'arduino-uno' },
  { pattern: /esp32|esp-32/i, id: 'esp32' },
  { pattern: /sg90|servo/i, id: 'servo-sg90' },
  { pattern: /hc-sr04|ultrasonic/i, id: 'hc-sr04' },
  { pattern: /oled/i, id: 'oled' },
  { pattern: /dht\d|temp.*humid|humidity sensor|temperature probe/i, id: 'dht11' },
  { pattern: /rgb/i, id: 'rgb-led' },
  { pattern: /\bled\b|led pack|traffic light|led matrix|8x8/i, id: 'led' },
  { pattern: /resistor|220ω|220 ohm/i, id: 'resistor' },
  { pattern: /breadboard psu|mb102/i, id: 'breadboard-psu' },
  { pattern: /breadboard/i, id: 'breadboard' },
  { pattern: /dc motor|gear motor|stepper motor|dc gear/i, id: 'dc-motor' },
  { pattern: /pir|motion sensor/i, id: 'pir-sensor' },
  { pattern: /lcd|16x2/i, id: 'lcd-display' },
  { pattern: /relay|smart relay|hvac relay/i, id: 'relay-module' },
  { pattern: /bluetooth|hc-05|hc-06/i, id: 'bluetooth-module' },
  { pattern: /battery|power supply|9v/i, id: 'battery' },
  { pattern: /motor driver|l298|l293|esc controller|a4988/i, id: 'motor-driver' },
  { pattern: /stemma|qwiic/i, id: 'stemma-qt' },
  { pattern: /pn2222|2n2222|transistor/i, id: 'transistor' },
  { pattern: /joystick|ky-023/i, id: 'joystick' },
  { pattern: /buzzer|piezo/i, id: 'buzzer' },
  { pattern: /jumper/i, id: 'jumper-wires' },
  { pattern: /bme280/i, id: 'bme280' },
  { pattern: /usb data cable|micro-b|micro usb cable/i, id: 'usb-cable' },
  { pattern: /soil moisture|moisture probe|bmp280|barometer|microphone|ldr|photoresistor|ir sensor|gyro|mpu|pulse sensor|max30102/i, id: 'generic-sensor' },
  { pattern: /display|screen|matrix|max7219/i, id: 'generic-display' },
  { pattern: /motor|propeller|fan module|water pump|chassis/i, id: 'generic-motor' },
  { pattern: /wifi|rfid|rtc|real-time clock|sd card|terminal|keypad|switch|regulator|lm7805|flight controller|wifi module/i, id: 'generic-module' },
];

export function resolveComponentIllustration(input: ResolveInput): ComponentIllustrationId {
  if (input.id) {
    const catalogueImage = getCatalogueComponent(input.id)?.image;
    if (catalogueImage) {
      return catalogueImage;
    }
    if (DIRECT_IDS.has(input.id)) {
      return input.id as ComponentIllustrationId;
    }
  }

  const name = input.name?.trim() ?? '';
  if (name) {
    for (const rule of NAME_RULES) {
      if (rule.pattern.test(name)) {
        return rule.id;
      }
    }
  }

  if (input.id) {
    for (const rule of NAME_RULES) {
      if (rule.pattern.test(input.id.replace(/-/g, ' '))) {
        return rule.id;
      }
    }
  }

  return 'generic-module';
}

export function getComponentDisplayName(id: ComponentIllustrationId): string {
  const labels: Record<ComponentIllustrationId, string> = {
    'arduino-uno': 'Arduino Uno',
    esp32: 'ESP32',
    'esp32-cam': 'ESP32-CAM',
    'raspberry-pi-pico': 'Raspberry Pi Pico',
    'raspberry-pi': 'Raspberry Pi',
    'servo-sg90': 'Servo SG90',
    'hc-sr04': 'HC-SR04',
    oled: 'OLED Display',
    dht11: 'DHT11',
    led: 'LED',
    resistor: 'Resistor',
    'resistor-band-220': '220 Ω resistor',
    'resistor-band-1k': '1 kΩ resistor',
    'ceramic-capacitor': 'Ceramic capacitor',
    'electrolytic-capacitor': 'Electrolytic capacitor',
    'tactile-button': 'Tactile button',
    potentiometer: 'Potentiometer',
    'dc-motor': 'DC Motor',
    breadboard: 'Breadboard',
    'pir-sensor': 'PIR Sensor',
    'lcd-display': 'LCD Display',
    'relay-module': 'Relay Module',
    'bluetooth-module': 'Bluetooth Module',
    battery: 'Battery',
    'motor-driver': 'Motor Driver',
    'jumper-wires': 'Jumper Wires',
    bme280: 'BME280',
    'usb-cable': 'USB cable',
    transistor: 'Transistor',
    'rgb-led': 'RGB LED',
    buzzer: 'Buzzer',
    joystick: 'Joystick',
    'breadboard-psu': 'Breadboard power supply',
    'stemma-qt': 'STEMMA QT cable',
    'generic-sensor': 'Sensor',
    'generic-board': 'Board',
    'generic-module': 'Module',
    'generic-motor': 'Motor',
    'generic-display': 'Display',
    'electronics-kit': 'Components',
  };
  return labels[id];
}
