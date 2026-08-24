import type { ComponentIllustrationId } from '@/constants/component-illustrations';
import type { ComponentCategory } from '@/constants/inventory';

export type CatalogueCategory = Exclude<ComponentCategory, 'all'>;

export type CatalogueComponent = {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: CatalogueCategory;
  type: string;
  image: ComponentIllustrationId;
};

/**
 * Structured hardware catalogue used by Add Component search.
 * Add entries here — the Add Component UI does not hard-code categories.
 */
export const COMPONENT_CATALOGUE: CatalogueComponent[] = [
  {
    id: 'arduino-uno-r3',
    name: 'Arduino Uno R3',
    aliases: ['arduino uno', 'uno r3', 'arduino', 'uno'],
    description: 'ATmega328P development board',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'arduino-uno',
  },
  {
    id: 'arduino-nano',
    name: 'Arduino Nano',
    aliases: ['nano', 'arduino nano v3'],
    description: 'Compact ATmega328P board',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'generic-board',
  },
  {
    id: 'arduino-mega',
    name: 'Arduino Mega 2560',
    aliases: ['mega', 'arduino mega'],
    description: 'ATmega2560 development board',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'generic-board',
  },
  {
    id: 'esp32',
    name: 'ESP32 DevKit',
    aliases: ['esp32', 'esp-32', 'esp32 devkit', 'esp32 wroom'],
    description: 'Wi-Fi & Bluetooth microcontroller',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'esp32',
  },
  {
    id: 'esp8266',
    name: 'ESP8266',
    aliases: ['esp-01', 'nodemcu', 'esp 8266', 'esp-8266'],
    description: 'Wi-Fi microcontroller module',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'generic-board',
  },
  {
    id: 'raspberry-pi-pico',
    name: 'Raspberry Pi Pico',
    aliases: ['pico', 'rp2040', 'pi pico'],
    description: 'RP2040 microcontroller board',
    category: 'microcontrollers',
    type: 'development_board',
    image: 'generic-board',
  },
  {
    id: 'dht11',
    name: 'DHT11',
    aliases: ['dht 11', 'humidity sensor'],
    description: 'Temperature & Humidity Sensor',
    category: 'sensors',
    type: 'temperature_humidity',
    image: 'dht11',
  },
  {
    id: 'dht22',
    name: 'DHT22',
    aliases: ['am2302', 'dht 22', 'temperature humidity sensor', 'temp humidity'],
    description: 'Temperature & Humidity Sensor',
    category: 'sensors',
    type: 'temperature_humidity',
    image: 'dht11',
  },
  {
    id: 'dht20',
    name: 'DHT20',
    aliases: ['dht 20', 'am2301b'],
    description: 'Temperature & Humidity Sensor',
    category: 'sensors',
    type: 'temperature_humidity',
    image: 'dht11',
  },
  {
    id: 'ds18b20',
    name: 'DS18B20',
    aliases: ['ds18b20', 'one wire temperature', 'waterproof temperature'],
    description: 'One-wire temperature probe',
    category: 'sensors',
    type: 'temperature',
    image: 'generic-sensor',
  },
  {
    id: 'hc-sr04',
    name: 'HC-SR04',
    aliases: ['hc sr04', 'hcsr04', 'ultrasonic', 'ultrasonic sensor', 'distance sensor'],
    description: 'Ultrasonic distance sensor',
    category: 'sensors',
    type: 'ultrasonic',
    image: 'hc-sr04',
  },
  {
    id: 'pir-sensor',
    name: 'PIR Motion Sensor',
    aliases: ['pir', 'motion sensor', 'hc-sr501', 'hc sr501'],
    description: 'Passive infrared motion detector',
    category: 'sensors',
    type: 'motion',
    image: 'pir-sensor',
  },
  {
    id: 'soil-moisture',
    name: 'Soil Moisture Sensor',
    aliases: ['moisture sensor', 'soil sensor', 'hygrometer'],
    description: 'Capacitive / resistive soil probe',
    category: 'sensors',
    type: 'moisture',
    image: 'generic-sensor',
  },
  {
    id: 'bmp280',
    name: 'BMP280',
    aliases: ['bme280', 'barometer', 'pressure sensor'],
    description: 'Pressure & temperature sensor',
    category: 'sensors',
    type: 'pressure',
    image: 'generic-sensor',
  },
  {
    id: 'mpu6050',
    name: 'MPU6050',
    aliases: ['gyro', 'accelerometer', 'imu', 'mpu 6050'],
    description: '6-axis gyroscope & accelerometer',
    category: 'sensors',
    type: 'imu',
    image: 'generic-sensor',
  },
  {
    id: 'ldr',
    name: 'LDR Photoresistor',
    aliases: ['ldr', 'photoresistor', 'light sensor'],
    description: 'Light-dependent resistor',
    category: 'sensors',
    type: 'light',
    image: 'generic-sensor',
  },
  {
    id: 'mq2',
    name: 'MQ-2 Gas Sensor',
    aliases: ['mq2', 'mq 2', 'gas sensor', 'smoke sensor'],
    description: 'Combustible gas & smoke sensor',
    category: 'sensors',
    type: 'gas',
    image: 'generic-sensor',
  },
  {
    id: 'sg90',
    name: 'SG90 Micro Servo',
    aliases: ['sg90', 'sg 90', 'micro servo', '9g servo', 'servo'],
    description: '9g hobby servo motor',
    category: 'actuators',
    type: 'servo',
    image: 'servo-sg90',
  },
  {
    id: 'mg90s',
    name: 'MG90S Servo',
    aliases: ['mg90s', 'metal servo'],
    description: 'Metal-gear micro servo',
    category: 'actuators',
    type: 'servo',
    image: 'servo-sg90',
  },
  {
    id: 'dc-motor',
    name: 'DC Motor',
    aliases: ['tt motor', 'gear motor', 'hobby motor'],
    description: 'Brushed DC gear motor',
    category: 'actuators',
    type: 'dc_motor',
    image: 'dc-motor',
  },
  {
    id: 'stepper-28byj',
    name: '28BYJ-48 Stepper',
    aliases: ['stepper', 'stepper motor', '28byj48', '28byj'],
    description: '5V unipolar stepper motor',
    category: 'actuators',
    type: 'stepper',
    image: 'generic-motor',
  },
  {
    id: 'buzzer',
    name: 'Piezo Buzzer',
    aliases: ['buzzer', 'piezo', 'active buzzer'],
    description: 'Audio indicator module',
    category: 'actuators',
    type: 'buzzer',
    image: 'generic-module',
  },
  {
    id: 'lcd-16x2',
    name: '16x2 LCD Display',
    aliases: ['16x2', 'lcd', '1602', 'character lcd'],
    description: '16×2 character LCD',
    category: 'displays',
    type: 'character_lcd',
    image: 'lcd-display',
  },
  {
    id: 'oled-096',
    name: '0.96" OLED',
    aliases: ['oled', 'ssd1306', '0.96 oled', 'oled display'],
    description: '128×64 I2C OLED screen',
    category: 'displays',
    type: 'oled',
    image: 'oled',
  },
  {
    id: 'max7219',
    name: 'MAX7219 LED Matrix',
    aliases: ['max7219', 'led matrix', '8x8 matrix'],
    description: '8×8 LED matrix module',
    category: 'displays',
    type: 'led_matrix',
    image: 'generic-display',
  },
  {
    id: 'tm1637',
    name: 'TM1637 7-Segment',
    aliases: ['7 segment', 'seven segment', 'tm1637'],
    description: '4-digit 7-segment display',
    category: 'displays',
    type: 'seven_segment',
    image: 'generic-display',
  },
  {
    id: '9v-battery-clip',
    name: '9V Battery Clip',
    aliases: ['9v', '9v battery', 'battery clip', 'battery snap'],
    description: '9V battery snap connector',
    category: 'power',
    type: 'battery_connector',
    image: 'battery',
  },
  {
    id: 'lm7805',
    name: 'LM7805 Regulator',
    aliases: ['7805', 'lm7805', '5v regulator'],
    description: '5V linear voltage regulator',
    category: 'power',
    type: 'regulator',
    image: 'generic-module',
  },
  {
    id: 'breadboard-psu',
    name: 'Breadboard Power Supply',
    aliases: ['mb102', 'breadboard psu', '3.3v 5v supply'],
    description: '3.3V / 5V breadboard PSU',
    category: 'power',
    type: 'power_supply',
    image: 'battery',
  },
  {
    id: 'hc-05',
    name: 'HC-05 Bluetooth',
    aliases: ['hc05', 'hc 05', 'bluetooth', 'bluetooth module'],
    description: 'Bluetooth serial module',
    category: 'modules',
    type: 'bluetooth',
    image: 'bluetooth-module',
  },
  {
    id: 'hc-06',
    name: 'HC-06 Bluetooth',
    aliases: ['hc06', 'hc 06'],
    description: 'Bluetooth slave module',
    category: 'modules',
    type: 'bluetooth',
    image: 'bluetooth-module',
  },
  {
    id: 'relay-5v',
    name: 'Relay Module 5V',
    aliases: ['relay', '5v relay', 'relay module'],
    description: 'Optocoupled 5V relay',
    category: 'modules',
    type: 'relay',
    image: 'relay-module',
  },
  {
    id: 'l298n',
    name: 'L298N Motor Driver',
    aliases: ['l298', 'l298n', 'motor driver', 'h-bridge'],
    description: 'Dual H-bridge motor driver',
    category: 'actuators',
    type: 'motor_driver',
    image: 'motor-driver',
  },
  {
    id: 'rfid-rc522',
    name: 'RFID-RC522',
    aliases: ['rfid', 'rc522', 'nfc'],
    description: '13.56 MHz RFID reader',
    category: 'modules',
    type: 'rfid',
    image: 'generic-module',
  },
  {
    id: 'ds3231',
    name: 'DS3231 RTC',
    aliases: ['rtc', 'real time clock', 'ds3231'],
    description: 'Precision real-time clock',
    category: 'modules',
    type: 'rtc',
    image: 'generic-module',
  },
  {
    id: 'led',
    name: 'LED',
    aliases: ['leds', '5mm led', 'led pack'],
    description: 'Standard indicator LED',
    category: 'modules',
    type: 'led',
    image: 'led',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    aliases: ['resistors', '220 ohm', '10k resistor'],
    description: 'Through-hole resistor',
    category: 'modules',
    type: 'passive',
    image: 'resistor',
  },
  {
    id: 'breadboard',
    name: 'Breadboard',
    aliases: ['solderless breadboard', 'protoboard'],
    description: 'Solderless prototyping board',
    category: 'modules',
    type: 'prototyping',
    image: 'breadboard',
  },
  {
    id: 'jumper-wires',
    name: 'Jumper Wires',
    aliases: ['jumpers', 'dupont wires', 'male to male'],
    description: 'Dupont jumper wire pack',
    category: 'modules',
    type: 'prototyping',
    image: 'jumper-wires',
  },
];

const FEATURED_IDS = [
  'dht22',
  'hc-sr04',
  'esp32',
  'arduino-uno-r3',
  'sg90',
  'oled-096',
  'pir-sensor',
  'l298n',
] as const;

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function searchableText(entry: CatalogueComponent): string {
  return [entry.name, entry.description, entry.type, ...entry.aliases].join(' ');
}

function scoreEntry(entry: CatalogueComponent, query: string): number {
  const qNorm = normalize(query);
  const qCompact = compact(query);
  if (!qNorm) return 0;

  const nameNorm = normalize(entry.name);
  const nameCompact = compact(entry.name);
  const aliasNorms = entry.aliases.map(normalize);
  const aliasCompacts = entry.aliases.map(compact);
  const haystack = normalize(searchableText(entry));
  const haystackCompact = compact(searchableText(entry));
  const tokens = qNorm.split(' ').filter(Boolean);

  if (nameCompact === qCompact) return 100;
  if (aliasCompacts.includes(qCompact)) return 96;
  if (nameCompact.startsWith(qCompact)) return 90;

  // Single-letter queries stay anchored to component names, not description words.
  if (qCompact.length < 2) return 0;

  if (aliasCompacts.some((alias) => alias.startsWith(qCompact))) return 86;
  if (nameNorm.startsWith(qNorm)) return 82;
  if (aliasNorms.some((alias) => alias.startsWith(qNorm))) return 78;

  if (qCompact.length < 3) return 0;

  if (qCompact.startsWith(nameCompact) && nameCompact.length >= 4) return 74;
  if (tokens.every((token) => haystack.includes(token))) return 70;
  if (haystackCompact.includes(qCompact)) return 62;
  if (haystack.includes(qNorm)) return 55;
  return 0;
}

export function searchComponentCatalogue(query: string, limit = 8): CatalogueComponent[] {
  const trimmed = query.trim();
  if (!trimmed) {
    const featured = FEATURED_IDS.map((id) => COMPONENT_CATALOGUE.find((entry) => entry.id === id)).filter(
      (entry): entry is CatalogueComponent => entry != null,
    );
    return featured.slice(0, limit);
  }

  return COMPONENT_CATALOGUE.map((entry) => ({ entry, score: scoreEntry(entry, trimmed) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((row) => row.entry);
}

export function getCatalogueComponent(id: string): CatalogueComponent | undefined {
  return COMPONENT_CATALOGUE.find((entry) => entry.id === id);
}

/** Best catalogue match for an existing inventory row (edit flow). */
export function matchCatalogueToInventoryItem(item: {
  catalogueId?: string;
  name: string;
}): CatalogueComponent | undefined {
  if (item.catalogueId) {
    const byId = getCatalogueComponent(item.catalogueId);
    if (byId) return byId;
  }

  const nameCompact = compact(item.name);
  if (!nameCompact) return undefined;

  let best: { entry: CatalogueComponent; score: number } | undefined;
  for (const entry of COMPONENT_CATALOGUE) {
    const entryCompact = compact(entry.name);
    let score = 0;
    if (nameCompact === entryCompact) score = 100;
    else if (nameCompact.startsWith(entryCompact) || entryCompact.startsWith(nameCompact)) score = 88;
    else if (entry.aliases.some((alias) => nameCompact.includes(compact(alias)) && compact(alias).length >= 3)) {
      score = 80;
    } else if (nameCompact.includes(entryCompact) && entryCompact.length >= 4) score = 76;

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best && best.score >= 76 ? best.entry : undefined;
}
