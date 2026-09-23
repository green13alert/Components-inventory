// Authored source for Motion Sensor Alarm (slug 8). Live walkthrough data is public.project_steps.
import type {
  AuthoredWalkthroughStep,
  StepConnection,
  WiringNode,
} from '../walkthrough-content';
import type { ProjectComponent } from '../projects-data';

const STAGE_UNDERSTAND = 'Understand the Project';
const STAGE_CIRCUIT = 'Build the Circuit';
const STAGE_PROGRAM = 'Build the Program';
const STAGE_TEST = 'Test the Alarm';

const COMPONENTS: ProjectComponent[] = [
  { id: 'arduino-uno-r3', name: 'Arduino Uno R3', illustrationId: 'arduino-uno', owned: false, quantity: 1 },
  { id: 'pir-sensor', name: 'PIR motion sensor', illustrationId: 'pir-sensor', owned: false, quantity: 1 },
  { id: 'buzzer', name: 'Buzzer', illustrationId: 'generic-module', owned: false, quantity: 1 },
  { id: 'led', name: 'LED', illustrationId: 'led', owned: false, quantity: 1 },
  { id: 'resistor', name: 'Resistor', illustrationId: 'resistor', owned: false, quantity: 1 },
  { id: 'breadboard', name: 'Breadboard', illustrationId: 'breadboard', owned: false, quantity: 1 },
  { id: 'jumper-wires', name: 'Jumper wires', illustrationId: 'jumper-wires', owned: false, quantity: 1 },
];

const NODE_ARDUINO: WiringNode = { id: 'arduino', name: 'Arduino Uno', illustrationId: 'arduino-uno' };
const NODE_PIR: WiringNode = { id: 'pir', name: 'PIR', illustrationId: 'pir-sensor' };
const NODE_LED: WiringNode = { id: 'led', name: 'LED', illustrationId: 'led' };
const NODE_RESISTOR: WiringNode = { id: 'resistor', name: 'Resistor', illustrationId: 'resistor' };
const NODE_BUZZER: WiringNode = { id: 'buzzer', name: 'Buzzer', illustrationId: 'generic-module' };

const PIR_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'PIR', toPin: 'VCC', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'PIR', toPin: 'GND', signal: 'ground' },
  { fromComponent: 'Arduino Uno', fromPin: 'D2', toComponent: 'PIR', toPin: 'OUT', signal: 'signal' },
];

const LED_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: 'D8', toComponent: 'Resistor', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: 'Resistor', fromPin: 'leg 2', toComponent: 'LED', toPin: 'anode', signal: 'signal' },
  { fromComponent: 'LED', fromPin: 'cathode', toComponent: 'Arduino Uno', toPin: 'GND', signal: 'ground' },
];

const BUZZER_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'Buzzer', toPin: 'VCC / +', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'D9', toComponent: 'Buzzer', toPin: 'I/O / S', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Buzzer', toPin: 'GND', signal: 'ground' },
];

const COMPLETE_CONNECTIONS: StepConnection[] = [...PIR_CONNECTIONS, ...LED_CONNECTIONS, ...BUZZER_CONNECTIONS];

const SKETCH_CREATE = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  Serial.begin(9600);
}

void loop() {
}`;

const SKETCH_READ = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  pinMode(PIR_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up. Stay still for 30 seconds.");
  delay(30000);
  Serial.println("Ready.");
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  Serial.println(motion);
  delay(200);
}`;

const SKETCH_DETECT = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  pinMode(PIR_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up. Stay still for 30 seconds.");
  delay(30000);
  Serial.println("Ready.");
}

void loop() {
  int motion = digitalRead(PIR_PIN);

  if (motion == HIGH) {
    Serial.println("Motion detected");
  } else {
    Serial.println("No motion");
  }

  delay(200);
}`;

const SKETCH_LED = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(9600);
  Serial.println("PIR warming up. Stay still for 30 seconds.");
  delay(30000);
  Serial.println("Ready.");
}

void loop() {
  int motion = digitalRead(PIR_PIN);

  if (motion == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Motion detected");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("No motion");
  }

  delay(200);
}`;

const SKETCH_BUZZER = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.begin(9600);
  Serial.println("PIR warming up. Stay still for 30 seconds.");
  delay(30000);
  Serial.println("Ready.");
}

void loop() {
  int motion = digitalRead(PIR_PIN);

  if (motion == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("Motion detected");
  } else {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("No motion");
  }

  delay(200);
}`;

const SKETCH_COMBINED = `const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.begin(9600);
  Serial.println("PIR warming up. Stay still for 30 seconds.");
  delay(30000);
  Serial.println("Alarm armed.");
}

void loop() {
  int motion = digitalRead(PIR_PIN);

  if (motion == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("Motion detected");
    delay(800);
  } else {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
  }

  delay(50);
}`;

export const MOTION_SENSOR_ALARM_STEPS: AuthoredWalkthroughStep[] = [
  {
    sortOrder: 0,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'What We\'re Building',
    description: 'A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we\'re building',
        body: 'This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up.',
      },
      {
        type: 'image',
        imageKey: 'motionSensor',
        caption: 'Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9.',
      },
      {
        type: 'text',
        heading: 'Why this order',
        body: 'We will understand the sensor first, then wire one subsystem at a time, then grow the sketch in the same order. That way a wiring fault and a code fault are not mixed together.',
      },
    ],
  },
  {
    sortOrder: 1,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'How the Motion Sensor Works',
    description: 'A PIR module detects moving infrared sources, not “anything that exists.” Its OUT pin goes HIGH for a burst after it sees motion.',
    tip: 'Aim the PIR away from HVAC vents. Fast air-temperature changes can look like motion.',
    blocks: [
      {
        type: 'text',
        heading: 'How PIR sensing works',
        body: 'PIR means passive infrared. The sensor does not emit a beam. It watches for a change in infrared energy in its field of view — typically a person walking past. When that change is large enough, OUT goes HIGH. When the scene is still, OUT sits LOW.',
      },
      {
        type: 'text',
        heading: 'Warm-up',
        body: 'After power-up the module needs about 30 seconds to settle. During that time OUT can chatter. The sketch will wait out this period and print a message so you do not walk in front of it while it is still calibrating.',
      },
      {
        type: 'warning',
        body: 'Do not treat a HIGH on OUT as “someone is still in the room.” It is a motion event, then it returns LOW. The alarm lasts as long as we hold the outputs in code, not as long as a person remains visible.',
      },
    ],
  },
  {
    sortOrder: 2,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'Understand the Components',
    description: 'Every part in this walkthrough is on the project BOM. Know what each one is for before you plug anything in.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What each part does',
        body: 'The Uno is the controller. The PIR is the input. The LED is a silent visual alarm. The resistor limits LED current so D8 is not shorted to ground through the diode. The catalogue buzzer is an active buzzer: a HIGH on its signal pin makes it sound. The breadboard and jumpers are the wiring.',
      },
      { type: 'components', items: COMPONENTS },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can point to each BOM item on the desk and name its role: input, output, current limit, or interconnect. Do not substitute a passive piezo for the active buzzer unless you are ready to use tone() later — this sketch uses digitalWrite only.',
      },
    ],
  },
  {
    sortOrder: 3,
    stageSortOrder: 1,
    stageTitle: STAGE_CIRCUIT,
    title: 'Set Up the Arduino',
    description: 'Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.',
    tip: 'Use a data-capable USB cable. Charge-only cables never appear as a serial port later.',
    blocks: [
      {
        type: 'text',
        heading: 'What to set up',
        body: 'Place the Uno and breadboard on the desk. Run a jumper from Uno 5V to a breadboard + rail, and from Uno GND to a breadboard − rail. Later parts will tap those rails instead of crowding the Uno headers.',
      },
      {
        type: 'text',
        heading: 'Why the rails matter',
        body: 'Several parts need 5V and GND. Sharing rails keeps those nets common. If grounds are split, the PIR HIGH will not be a reliable HIGH relative to the Uno.',
      },
      {
        type: 'test',
        body: 'Plug in USB. Confirm the Uno power LED is on. Leave D2, D8, and D9 unwired until the next steps.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The board is powered, 5V and GND rails are continuous, and no output is connected yet. Nothing should get hot.',
      },
    ],
  },
  {
    sortOrder: 4,
    stageSortOrder: 1,
    stageTitle: STAGE_CIRCUIT,
    title: 'Connect the PIR Motion Sensor',
    description: 'Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.',
    tip: 'If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.',
    blocks: [
      {
        type: 'text',
        heading: 'What you are wiring',
        body: 'VCC powers the module from the Uno 5V rail. GND shares the Uno ground. OUT is the motion flag and goes to digital pin D2 — that is PIR_PIN in the sketch.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_PIR],
        connections: PIR_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'PIR on D2',
        rows: PIR_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module.',
      },
    ],
  },
  {
    sortOrder: 5,
    stageSortOrder: 1,
    stageTitle: STAGE_CIRCUIT,
    title: 'Connect the LED',
    description: 'The LED is the silent alarm. It needs the BOM resistor in series on D8 so the pin is not shorted to ground.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Polarity and current limit',
        body: 'The longer LED lead is the anode (toward D8 through the resistor). The shorter lead, or the flat side of the plastic, is the cathode to GND. The resistor drops the extra voltage so LED current stays in a safe range for an Uno pin.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_RESISTOR, NODE_LED],
        connections: LED_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'LED on D8 through the BOM resistor',
        rows: LED_CONNECTIONS,
      },
      {
        type: 'warning',
        body: 'Do not wire the LED from D8 straight to GND. Without the resistor the pin can source more current than it should.',
      },
    ],
  },
  {
    sortOrder: 6,
    stageSortOrder: 1,
    stageTitle: STAGE_CIRCUIT,
    title: 'Connect the Buzzer',
    description: 'The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Active vs two-pin buzzers',
        body: 'A three-pin active module usually has VCC, I/O (or S), and GND. VCC goes to 5V, I/O to D9, GND to GND. If your buzzer has only two leads, treat the labelled + / longer lead as the D9 side and the other as GND, and skip the extra 5V wire.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_BUZZER],
        connections: BUZZER_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'Buzzer on D9',
        rows: BUZZER_CONNECTIONS,
      },
      {
        type: 'warning',
        body: 'A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code.',
      },
    ],
  },
  {
    sortOrder: 7,
    stageSortOrder: 1,
    stageTitle: STAGE_CIRCUIT,
    title: 'Check the Complete Circuit',
    description: 'Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What “complete” means',
        body: 'Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO.',
      },
      {
        type: 'wiring',
        heading: 'Complete wiring diagram',
        nodes: [NODE_ARDUINO, NODE_PIR, NODE_RESISTOR, NODE_LED, NODE_BUZZER],
        connections: COMPLETE_CONNECTIONS,
      },
      {
        type: 'connections',
        heading: 'Exact connections',
        summary: 'PIR D2 · LED D8 · buzzer D9',
        rows: COMPLETE_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the resistor to the LED anode, and D9 to the buzzer signal pin.',
      },
    ],
  },
  {
    sortOrder: 8,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Create the Arduino Program',
    description: 'Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_CREATE,
      },
      {
        type: 'code_explanation',
        body: 'Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins.',
      },
    ],
  },
  {
    sortOrder: 9,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Read the Motion Sensor',
    description: 'Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_READ,
      },
      {
        type: 'code_explanation',
        body: 'We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake.',
      },
      {
        type: 'test',
        body: 'Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor.',
      },
    ],
  },
  {
    sortOrder: 10,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Detect Motion',
    description: 'Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_DETECT,
      },
      {
        type: 'code_explanation',
        body: 'HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone.',
      },
    ],
  },
  {
    sortOrder: 11,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Control the LED',
    description: 'When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_LED,
      },
      {
        type: 'code_explanation',
        body: 'The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR.',
      },
      {
        type: 'test',
        body: 'Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → resistor → D8 and cathode → GND.',
      },
    ],
  },
  {
    sortOrder: 12,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Control the Buzzer',
    description: 'Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_BUZZER,
      },
      {
        type: 'code_explanation',
        body: 'LED and buzzer now share one condition. If the LED works and the buzzer does not, the sketch logic is fine — check D9, GND, and whether the part is actually an active buzzer.',
      },
    ],
  },
  {
    sortOrder: 13,
    stageSortOrder: 2,
    stageTitle: STAGE_PROGRAM,
    title: 'Combine the System',
    description: 'Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'motion_alarm.ino',
        libraries: [],
        code: SKETCH_COMBINED,
      },
      {
        type: 'code_explanation',
        body: 'This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program.',
      },
    ],
  },
  {
    sortOrder: 14,
    stageSortOrder: 3,
    stageTitle: STAGE_TEST,
    title: 'Upload the Program',
    description: 'Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”',
    tip: 'If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.',
    blocks: [
      {
        type: 'text',
        heading: 'How to upload',
        body: 'Paste the combined sketch from the previous step. Select Arduino Uno and the correct COM/serial port. Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes.',
      },
      {
        type: 'test',
        body: 'Upload once. Watch Serial for the warm-up line, then “Alarm armed.”',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'No serial port',
            solution: 'Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port.',
          },
          {
            problem: 'Upload error / avrdude',
            solution: 'Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 15,
    stageSortOrder: 3,
    stageTitle: STAGE_TEST,
    title: 'Test Without Motion',
    description: 'A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.',
    tip: null,
    blocks: [
      {
        type: 'test',
        body: 'After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'Alarm already on with nobody in view',
            solution: 'Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno.',
          },
          {
            problem: 'Serial floods with Motion detected',
            solution: 'The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 16,
    stageSortOrder: 3,
    stageTitle: STAGE_TEST,
    title: 'Test Motion Detection',
    description: 'Walk through the PIR field of view and confirm the LED and buzzer fire together.',
    tip: 'Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.',
    blocks: [
      {
        type: 'test',
        body: 'Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'Nothing happens when you walk past',
            solution: 'Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH.',
          },
          {
            problem: 'Serial detects motion but outputs stay off',
            solution: 'The condition is working. Check D8 through the resistor to the LED anode, and D9 to the buzzer signal pin.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 17,
    stageSortOrder: 3,
    stageTitle: STAGE_TEST,
    title: 'Troubleshoot the Circuit',
    description: 'If any test failed, isolate input versus output before changing working code.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'How to isolate the fault',
        body: 'Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'LED never lights',
            solution: 'Confirm anode → resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed.',
          },
          {
            problem: 'Buzzer silent',
            solution: 'Active buzzers need DC HIGH on the signal pin. Confirm D9 and GND. A two-pin buzzer goes D9 and GND only. A passive piezo will not sound with this sketch.',
          },
          {
            problem: 'PIR always HIGH',
            solution: 'Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper.',
          },
          {
            problem: 'PIR never HIGH',
            solution: 'Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 18,
    stageSortOrder: 3,
    stageTitle: STAGE_TEST,
    title: 'Final System Test',
    description: 'Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.',
    tip: null,
    blocks: [
      {
        type: 'image',
        imageKey: 'motionSensor',
        caption: 'Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer.',
      },
      {
        type: 'test',
        body: 'Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery.',
      },
      {
        type: 'connections',
        heading: 'Pin map you built',
        rows: COMPLETE_CONNECTIONS,
      },
    ],
  },
];
