/**
 * Global Solderi component illustration identifiers.
 * Add new hardware here — SVG art lives in ComponentIllustration.tsx,
 * colours in component-illustration-palette.ts.
 */

export type ComponentIllustrationId =
  | 'arduino-uno'
  | 'esp32'
  | 'servo-sg90'
  | 'hc-sr04'
  | 'oled'
  | 'dht11'
  | 'led'
  | 'resistor'
  | 'dc-motor'
  | 'breadboard'
  | 'pir-sensor'
  | 'lcd-display'
  | 'relay-module'
  | 'bluetooth-module'
  | 'battery'
  | 'motor-driver'
  | 'jumper-wires'
  | 'generic-sensor'
  | 'generic-board'
  | 'generic-module'
  | 'generic-motor'
  | 'generic-display';

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

const DIRECT_IDS = new Set<string>([
  'arduino-uno',
  'esp32',
  'servo-sg90',
  'hc-sr04',
  'oled',
  'dht11',
  'led',
  'resistor',
  'dc-motor',
  'breadboard',
  'pir-sensor',
  'lcd-display',
  'relay-module',
  'bluetooth-module',
  'battery',
  'motor-driver',
  'jumper-wires',
  'generic-sensor',
  'generic-board',
  'generic-module',
  'generic-motor',
  'generic-display',
]);

type ResolveInput = {
  id?: string;
  name?: string;
};

const NAME_RULES: { pattern: RegExp; id: ComponentIllustrationId }[] = [
  { pattern: /arduino/i, id: 'arduino-uno' },
  { pattern: /esp32|esp-32/i, id: 'esp32' },
  { pattern: /servo/i, id: 'servo-sg90' },
  { pattern: /hc-sr04|ultrasonic/i, id: 'hc-sr04' },
  { pattern: /oled/i, id: 'oled' },
  { pattern: /dht\d|temp.*humid|humidity sensor|temperature probe/i, id: 'dht11' },
  { pattern: /\bled\b|led pack|traffic light|led matrix|8x8/i, id: 'led' },
  { pattern: /resistor|220ω|220 ohm/i, id: 'resistor' },
  { pattern: /breadboard/i, id: 'breadboard' },
  { pattern: /dc motor|gear motor|stepper motor|dc gear/i, id: 'dc-motor' },
  { pattern: /pir|motion sensor/i, id: 'pir-sensor' },
  { pattern: /lcd|16x2/i, id: 'lcd-display' },
  { pattern: /relay|smart relay|hvac relay/i, id: 'relay-module' },
  { pattern: /bluetooth|hc-05|hc-06/i, id: 'bluetooth-module' },
  { pattern: /battery|power supply|9v/i, id: 'battery' },
  { pattern: /motor driver|l298|l293|esc controller|a4988/i, id: 'motor-driver' },
  { pattern: /jumper/i, id: 'jumper-wires' },
  { pattern: /soil moisture|moisture probe|bmp280|barometer|microphone|ldr|photoresistor|ir sensor|gyro|mpu|pulse sensor|max30102/i, id: 'generic-sensor' },
  { pattern: /display|screen|matrix|max7219/i, id: 'generic-display' },
  { pattern: /motor|propeller|fan module|water pump|chassis/i, id: 'generic-motor' },
  { pattern: /wifi|rfid|rtc|real-time clock|sd card|terminal|keypad|buzzer|piezo|switch|button|regulator|lm7805|flight controller|wifi module/i, id: 'generic-module' },
];

export function resolveComponentIllustration(input: ResolveInput): ComponentIllustrationId {
  if (input.id && DIRECT_IDS.has(input.id)) {
    return input.id as ComponentIllustrationId;
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
    'servo-sg90': 'Servo SG90',
    'hc-sr04': 'HC-SR04',
    oled: 'OLED Display',
    dht11: 'DHT11',
    led: 'LED',
    resistor: 'Resistor',
    'dc-motor': 'DC Motor',
    breadboard: 'Breadboard',
    'pir-sensor': 'PIR Sensor',
    'lcd-display': 'LCD Display',
    'relay-module': 'Relay Module',
    'bluetooth-module': 'Bluetooth Module',
    battery: 'Battery',
    'motor-driver': 'Motor Driver',
    'jumper-wires': 'Jumper Wires',
    'generic-sensor': 'Sensor',
    'generic-board': 'Board',
    'generic-module': 'Module',
    'generic-motor': 'Motor',
    'generic-display': 'Display',
  };
  return labels[id];
}
