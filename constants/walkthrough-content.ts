import type { ImageSource } from 'expo-image';

import type { ComponentIllustrationId } from '@/constants/component-illustrations';
import type { Project, ProjectCategory, ProjectComponent } from '@/constants/projects-data';
import { getProjectComponents } from '@/constants/projects-data';

export type StepConnection = {
  fromComponent: string;
  fromPin: string;
  toComponent: string;
  toPin: string;
};

export type StepTroubleshootingItem = {
  problem: string;
  solution: string;
};

export type StepCodeContent = {
  language: string;
  filename: string;
  libraries: string[];
  code: string;
};

export type WiringPair = {
  leftName: string;
  leftId: ComponentIllustrationId;
  rightName: string;
  rightId: ComponentIllustrationId;
};

export type StepBlock =
  | { type: 'text'; body: string }
  | { type: 'image'; source: ImageSource; caption?: string }
  | { type: 'wiring'; pair: WiringPair; connections: StepConnection[] }
  | { type: 'connections'; rows: StepConnection[]; summary?: string }
  | { type: 'code'; language: string; filename?: string; libraries?: string[]; code: string }
  | { type: 'tip'; body: string }
  | { type: 'warning'; body: string }
  | { type: 'expected'; heading?: string; body: string }
  | { type: 'troubleshooting'; heading?: string; items: StepTroubleshootingItem[] }
  | { type: 'components'; items: ProjectComponent[] };

type StepKind = 'intro' | 'wiring' | 'connections' | 'code' | 'caution' | 'test' | 'finish' | 'standard';

type StepLike = {
  title: string;
  description: string;
  tip?: string;
};

const WIRING_PAIRS: Record<ProjectCategory, WiringPair> = {
  sensors: { leftName: 'Arduino Uno', leftId: 'arduino-uno', rightName: 'DHT22', rightId: 'dht11' },
  robotics: { leftName: 'Arduino Uno', leftId: 'arduino-uno', rightName: 'HC-SR04', rightId: 'hc-sr04' },
  iot: { leftName: 'ESP32', leftId: 'esp32', rightName: 'DHT22', rightId: 'dht11' },
  automation: { leftName: 'Arduino Uno', leftId: 'arduino-uno', rightName: 'Relay', rightId: 'relay-module' },
  displays: { leftName: 'Arduino Uno', leftId: 'arduino-uno', rightName: 'OLED', rightId: 'oled' },
};

const CONNECTIONS: Record<ProjectCategory, StepConnection[]> = {
  sensors: [
    { fromComponent: 'DHT22', fromPin: 'VCC', toComponent: 'Arduino Uno', toPin: '5V' },
    { fromComponent: 'DHT22', fromPin: 'GND', toComponent: 'Arduino Uno', toPin: 'GND' },
    { fromComponent: 'DHT22', fromPin: 'DATA', toComponent: 'Arduino Uno', toPin: 'D2' },
  ],
  robotics: [
    { fromComponent: 'HC-SR04', fromPin: 'VCC', toComponent: 'Arduino Uno', toPin: '5V' },
    { fromComponent: 'HC-SR04', fromPin: 'GND', toComponent: 'Arduino Uno', toPin: 'GND' },
    { fromComponent: 'HC-SR04', fromPin: 'TRIG', toComponent: 'Arduino Uno', toPin: 'D9' },
    { fromComponent: 'HC-SR04', fromPin: 'ECHO', toComponent: 'Arduino Uno', toPin: 'D10' },
  ],
  iot: [
    { fromComponent: 'DHT22', fromPin: 'VCC', toComponent: 'ESP32', toPin: '3V3' },
    { fromComponent: 'DHT22', fromPin: 'GND', toComponent: 'ESP32', toPin: 'GND' },
    { fromComponent: 'DHT22', fromPin: 'DATA', toComponent: 'ESP32', toPin: 'D4' },
  ],
  automation: [
    { fromComponent: 'Relay IN1', fromPin: 'IN', toComponent: 'Arduino Uno', toPin: 'D7' },
    { fromComponent: 'Relay', fromPin: 'VCC', toComponent: 'Arduino Uno', toPin: '5V' },
    { fromComponent: 'Relay', fromPin: 'GND', toComponent: 'Arduino Uno', toPin: 'GND' },
  ],
  displays: [
    { fromComponent: 'OLED', fromPin: 'VCC', toComponent: 'Arduino Uno', toPin: '5V' },
    { fromComponent: 'OLED', fromPin: 'GND', toComponent: 'Arduino Uno', toPin: 'GND' },
    { fromComponent: 'OLED', fromPin: 'SDA', toComponent: 'Arduino Uno', toPin: 'A4' },
    { fromComponent: 'OLED', fromPin: 'SCL', toComponent: 'Arduino Uno', toPin: 'A5' },
  ],
};

const EXPECTED_RESULTS: Record<ProjectCategory, string> = {
  sensors: 'Serial Monitor should print changing temperature and humidity values. Trigger the sensor and confirm the numbers move with the environment.',
  robotics: 'Each motor should spin in the expected direction, and the distance sensor should report a falling value as you move a hand closer to it.',
  iot: 'The board should join Wi-Fi, print an IP address, and a first data point should appear on your dashboard within a minute.',
  automation: 'Each input should change the Serial output, and each relay should click on and off when the sketch toggles it.',
  displays: 'The screen should show a clear hello-world message with no flicker. If it is blank, check power, address, and contrast before continuing.',
};

const TROUBLESHOOTING: Record<ProjectCategory, StepTroubleshootingItem[]> = {
  sensors: [
    {
      problem: 'Readings stay at zero or NaN',
      solution: 'Confirm DATA is on the pin in the sketch, and that VCC/GND are not swapped. Many DHT modules need a 4.7kΩ–10kΩ pull-up on DATA.',
    },
    {
      problem: 'Values jump around',
      solution: 'Keep sensor wires short, share a solid ground, and average a few samples before you use a threshold.',
    },
  ],
  robotics: [
    {
      problem: 'A motor runs backward',
      solution: 'Swap that motor’s two leads at the driver. No code change is required.',
    },
    {
      problem: 'The robot stalls or resets',
      solution: 'Give motors their own supply and tie grounds together. Arduino 5V cannot power gear motors.',
    },
  ],
  iot: [
    {
      problem: 'Wi-Fi never connects',
      solution: 'Check SSID, password, and 2.4 GHz availability. Watch Serial for brown-out — ESP boards need a stable supply during transmit.',
    },
    {
      problem: 'No data in the dashboard',
      solution: 'Verify the API key and channel ID, then confirm the first POST in Serial before looking at the cloud UI.',
    },
  ],
  automation: [
    {
      problem: 'Relay chatters or never switches',
      solution: 'Confirm IN is active-HIGH or active-LOW for your module, and that the load is on COM/NO with a proper supply — not the Arduino 5V rail.',
    },
    {
      problem: 'Buttons read randomly',
      solution: 'Use INPUT_PULLUP and debounce. A floating pin will not give a stable automation trigger.',
    },
  ],
  displays: [
    {
      problem: 'The screen stays black',
      solution: 'Run an I2C scanner to confirm the address (often 0x3C). Check VCC is 5V or 3.3V as specified, and that SDA/SCL are not swapped.',
    },
    {
      problem: 'Text is garbled or inverted',
      solution: 'Install the matching driver library and constructor size (SSD1306 128×64 vs 128×32). Power-cycle after a bad init.',
    },
  ],
};

const SKETCHES: Record<ProjectCategory, StepCodeContent> = {
  sensors: {
    language: 'Arduino',
    filename: 'plant_monitor.ino',
    libraries: ['DHT sensor library', 'Adafruit Unified Sensor'],
    code: `#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  Serial.print("Temp: ");
  Serial.print(temperature);
  Serial.print("  Hum: ");
  Serial.println(humidity);
  delay(2000);
}`,
  },
  robotics: {
    language: 'Arduino',
    filename: 'motor_test.ino',
    libraries: ['none required for this test sketch'],
    code: `const int LEFT_PWM = 5;
const int RIGHT_PWM = 6;

void setup() {
  pinMode(LEFT_PWM, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  analogWrite(LEFT_PWM, 180);
  analogWrite(RIGHT_PWM, 180);
  Serial.println("Forward");
  delay(2000);

  analogWrite(LEFT_PWM, 0);
  analogWrite(RIGHT_PWM, 0);
  delay(800);
}`,
  },
  iot: {
    language: 'Arduino',
    filename: 'weather_station.ino',
    libraries: ['WiFi', 'DHT sensor library'],
    code: `#include <WiFi.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin("YOUR_SSID", "YOUR_PASSWORD");

  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());
}

void loop() {
  Serial.println(dht.readTemperature());
  delay(10000);
}`,
  },
  automation: {
    language: 'Arduino',
    filename: 'relay_test.ino',
    libraries: ['none required for this test sketch'],
    code: `const int RELAY_PIN = 7;
const int SENSOR_PIN = 2;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool triggered = digitalRead(SENSOR_PIN) == LOW;
  digitalWrite(RELAY_PIN, triggered ? HIGH : LOW);
  Serial.println(triggered ? "ON" : "OFF");
  delay(50);
}`,
  },
  displays: {
    language: 'Arduino',
    filename: 'oled_hello.ino',
    libraries: ['Adafruit SSD1306', 'Adafruit GFX Library'],
    code: `#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 24);
  display.println("Hello, Solderi");
  display.display();
}

void loop() {}`,
  },
};

export function getProjectSketch(project: Project): StepCodeContent {
  return SKETCHES[project.category];
}

export function getProjectConnections(project: Project): StepConnection[] {
  return CONNECTIONS[project.category];
}

function isSafetyTip(tip: string) {
  return /never|mains|safety|do not|don't/i.test(tip);
}

function assignKinds(steps: StepLike[]): StepKind[] {
  let usedWiringDiagram = false;
  let usedCode = false;

  return steps.map((step, index) => {
    if (index === 0) return 'intro';
    if (index === steps.length - 1) return 'finish';
    if (!usedCode && /upload|sketch|code|library|firmware/i.test(step.title)) {
      usedCode = true;
      return 'code';
    }
    if (/wire|connect /i.test(step.title)) {
      if (!usedWiringDiagram) {
        usedWiringDiagram = true;
        return 'wiring';
      }
      return 'connections';
    }
    if (/calibrat|test readings|hello world test/i.test(step.title)) return 'test';
    if (/power|relay|mains|enclosure/i.test(step.title)) return 'caution';
    return 'standard';
  });
}

function pushCallout(blocks: StepBlock[], tip?: string) {
  if (!tip) return;
  blocks.push(isSafetyTip(tip) ? { type: 'warning', body: tip } : { type: 'tip', body: tip });
}

export function buildStepBlocks(options: {
  project: Project;
  step: StepLike;
  index: number;
  steps: StepLike[];
  components?: ProjectComponent[];
}): StepBlock[] {
  const { project, step, index, steps } = options;
  const kind = assignKinds(steps)[index];
  const components = options.components ?? getProjectComponents(project);
  const connections = CONNECTIONS[project.category];
  const pair = WIRING_PAIRS[project.category];
  const summary = `${connections[0]?.fromComponent} to ${connections[0]?.toComponent}`;
  const blocks: StepBlock[] = [];

  switch (kind) {
    case 'intro':
      blocks.push({
        type: 'text',
        body: `Lay out every part for ${project.title} before you start wiring. Match each item to the list below, including quantities.`,
      });
      blocks.push({ type: 'components', items: components });
      break;

    case 'wiring':
      blocks.push({
        type: 'image',
        source: project.image,
        caption: 'Your wiring should look similar to this.',
      });
      blocks.push({ type: 'wiring', pair, connections });
      blocks.push({ type: 'connections', rows: connections, summary });
      break;

    case 'connections':
      blocks.push({
        type: 'image',
        source: project.image,
        caption: 'Use this as a visual reference while you add the remaining connections.',
      });
      blocks.push({ type: 'connections', rows: connections, summary });
      break;

    case 'code': {
      const sketch = SKETCHES[project.category];
      blocks.push({ type: 'code', ...sketch });
      break;
    }

    case 'caution':
      blocks.push({
        type: 'text',
        body: 'Treat this as a safety checkpoint. Confirm power, ground, and load wiring before you apply voltage to the rest of the build.',
      });
      if (!step.tip) {
        blocks.push({
          type: 'warning',
          body: 'Use a separate supply for motors, relays, and other high-current loads. Share ground with the Arduino — never power those loads from the 5V pin.',
        });
      }
      blocks.push({
        type: 'expected',
        heading: 'Expected result',
        body: 'Power LEDs are steady, nothing is hot to the touch, and the board does not reset when the load switches.',
      });
      break;

    case 'test':
      blocks.push({
        type: 'expected',
        heading: 'Test your project',
        body: EXPECTED_RESULTS[project.category],
      });
      blocks.push({
        type: 'troubleshooting',
        heading: "If it doesn't work",
        items: TROUBLESHOOTING[project.category],
      });
      break;

    case 'finish':
      blocks.push({
        type: 'image',
        source: project.image,
        caption: 'A finished build should look similar to this reference.',
      });
      blocks.push({
        type: 'expected',
        heading: 'Test your project',
        body: EXPECTED_RESULTS[project.category],
      });
      blocks.push({
        type: 'troubleshooting',
        heading: "If it doesn't work",
        items: TROUBLESHOOTING[project.category],
      });
      break;

    default:
      blocks.push({
        type: 'text',
        body: `Finish “${step.title}” as a checkpoint for ${project.title}. The next step assumes this part of the circuit is already working.`,
      });
      blocks.push({
        type: 'expected',
        heading: 'Expected result',
        body: 'You can point to what changed in this step and confirm it behaves on its own before continuing.',
      });
      break;
  }

  pushCallout(blocks, step.tip);
  return blocks;
}
