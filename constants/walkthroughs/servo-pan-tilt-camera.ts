// Authored source for Servo Pan-Tilt Camera (slug 18). Live walkthrough data is public.project_steps.
import type {
  AuthoredWalkthroughStep,
  StepConnection,
  WiringNode,
} from '../walkthrough-content';
import type { ProjectComponent } from '../projects-data';

const STAGE_UNDERSTAND = 'Understand the Project';
const STAGE_MECHANICAL = 'Mechanical Assembly';
const STAGE_ELECTRONICS = 'Build the Electronics';
const STAGE_PROGRAM = 'Build the Program';
const STAGE_TEST = 'Calibrate and Test';

const COMPONENTS: ProjectComponent[] = [
  { id: 'arduino-uno-r3', name: 'Arduino Uno R3', illustrationId: 'arduino-uno', owned: false, quantity: 1 },
  { id: 'sg90', name: 'SG90 Micro Servo', illustrationId: 'servo-sg90', owned: false, quantity: 2 },
  { id: 'joystick', name: 'Analog Joystick Module', illustrationId: 'generic-module', owned: false, quantity: 1 },
  { id: 'pan-tilt-bracket', name: 'Pan-Tilt Bracket Kit', illustrationId: 'electronics-kit', owned: false, quantity: 1 },
  { id: 'breadboard-psu', name: 'Breadboard Power Supply', illustrationId: 'battery', owned: false, quantity: 1 },
  { id: 'breadboard', name: 'Breadboard', illustrationId: 'breadboard', owned: false, quantity: 1 },
  { id: 'jumper-wires', name: 'Jumper wires', illustrationId: 'jumper-wires', owned: false, quantity: 1 },
];

const NODE_ARDUINO: WiringNode = { id: 'arduino', name: 'Arduino Uno', illustrationId: 'arduino-uno' };
const NODE_PSU: WiringNode = { id: 'psu', name: 'Breadboard PSU', illustrationId: 'battery' };
const NODE_PAN: WiringNode = { id: 'pan', name: 'Pan servo', illustrationId: 'servo-sg90' };
const NODE_TILT: WiringNode = { id: 'tilt', name: 'Tilt servo', illustrationId: 'servo-sg90' };
const NODE_JOY: WiringNode = { id: 'joystick', name: 'Joystick', illustrationId: 'generic-module' };

const POWER_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'Breadboard', toPin: '+ logic rail', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Breadboard', toPin: '− rail', signal: 'ground' },
  { fromComponent: 'Breadboard PSU', fromPin: 'GND', toComponent: 'Breadboard', toPin: '− rail', signal: 'ground' },
  { fromComponent: 'Breadboard PSU', fromPin: '5V', toComponent: 'Breadboard', toPin: '+ servo rail', signal: 'power' },
];

const PAN_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Breadboard PSU', fromPin: '5V', toComponent: 'Pan servo', toPin: 'VCC (red)', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Pan servo', toPin: 'GND (brown)', signal: 'ground' },
  { fromComponent: 'Arduino Uno', fromPin: 'D9', toComponent: 'Pan servo', toPin: 'SIG (orange)', signal: 'signal' },
];

const TILT_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Breadboard PSU', fromPin: '5V', toComponent: 'Tilt servo', toPin: 'VCC (red)', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Tilt servo', toPin: 'GND (brown)', signal: 'ground' },
  { fromComponent: 'Arduino Uno', fromPin: 'D10', toComponent: 'Tilt servo', toPin: 'SIG (orange)', signal: 'signal' },
];

const JOY_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'Joystick', toPin: '+5V', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Joystick', toPin: 'GND', signal: 'ground' },
  { fromComponent: 'Arduino Uno', fromPin: 'A0', toComponent: 'Joystick', toPin: 'VRx', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'A1', toComponent: 'Joystick', toPin: 'VRy', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'D2', toComponent: 'Joystick', toPin: 'SW', signal: 'signal' },
];

const COMPLETE_CONNECTIONS: StepConnection[] = [
  ...POWER_CONNECTIONS,
  ...PAN_CONNECTIONS,
  ...TILT_CONNECTIONS,
  ...JOY_CONNECTIONS,
];

const SKETCH_CREATE = `const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

void setup() {
  Serial.begin(9600);
}

void loop() {
}`;

const SKETCH_LIBRARY = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

Servo panServo;

void setup() {
  Serial.begin(9600);
  panServo.attach(PAN_PIN);
}

void loop() {
}`;

const SKETCH_PAN = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

Servo panServo;

void setup() {
  Serial.begin(9600);
  panServo.attach(PAN_PIN);
  panServo.write(90);
  delay(500);
  Serial.println("Pan at 90.");
}

void loop() {
  panServo.write(60);
  Serial.println("Pan 60");
  delay(1000);
  panServo.write(90);
  Serial.println("Pan 90");
  delay(1000);
  panServo.write(120);
  Serial.println("Pan 120");
  delay(1000);
}`;

const SKETCH_TILT = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

Servo panServo;
Servo tiltServo;

void setup() {
  Serial.begin(9600);
  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  panServo.write(90);
  tiltServo.write(90);
  delay(500);
  Serial.println("Both servos at 90.");
}

void loop() {
  tiltServo.write(60);
  Serial.println("Tilt 60");
  delay(1000);
  tiltServo.write(90);
  Serial.println("Tilt 90");
  delay(1000);
  tiltServo.write(120);
  Serial.println("Tilt 120");
  delay(1000);
}`;

const SKETCH_JOYSTICK = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

Servo panServo;
Servo tiltServo;

void setup() {
  pinMode(JOY_SW_PIN, INPUT_PULLUP);
  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  panServo.write(90);
  tiltServo.write(90);
  Serial.begin(9600);
  Serial.println("Joystick test. Servos hold 90.");
}

void loop() {
  int x = analogRead(JOY_X_PIN);
  int y = analogRead(JOY_Y_PIN);
  int sw = digitalRead(JOY_SW_PIN);

  Serial.print("X ");
  Serial.print(x);
  Serial.print("  Y ");
  Serial.print(y);
  Serial.print("  SW ");
  Serial.println(sw);

  delay(200);
}`;

const SKETCH_MAP = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

Servo panServo;
Servo tiltServo;

void setup() {
  pinMode(JOY_SW_PIN, INPUT_PULLUP);
  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(JOY_X_PIN);
  int y = analogRead(JOY_Y_PIN);
  int panAngle = map(x, 0, 1023, 0, 180);
  int tiltAngle = map(y, 0, 1023, 0, 180);

  panServo.write(panAngle);
  tiltServo.write(tiltAngle);

  Serial.print("Pan ");
  Serial.print(panAngle);
  Serial.print("  Tilt ");
  Serial.println(tiltAngle);

  delay(20);
}`;

const SKETCH_COMBINED = `#include <Servo.h>

const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

const int PAN_MIN = 20;
const int PAN_MAX = 160;
const int TILT_MIN = 20;
const int TILT_MAX = 160;
const int PAN_CENTER = 90;
const int TILT_CENTER = 90;
const int JOY_X_CENTER = 512;
const int JOY_Y_CENTER = 512;
const int DEADZONE = 40;

Servo panServo;
Servo tiltServo;

int panAngle = PAN_CENTER;
int tiltAngle = TILT_CENTER;

void setup() {
  pinMode(JOY_SW_PIN, INPUT_PULLUP);
  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  panServo.write(panAngle);
  tiltServo.write(tiltAngle);
  Serial.begin(9600);
  Serial.println("Pan-tilt ready.");
}

void loop() {
  int x = analogRead(JOY_X_PIN);
  int y = analogRead(JOY_Y_PIN);
  int sw = digitalRead(JOY_SW_PIN);

  if (sw == LOW) {
    panAngle = PAN_CENTER;
    tiltAngle = TILT_CENTER;
  } else {
    if (abs(x - JOY_X_CENTER) > DEADZONE) {
      panAngle = map(x, 0, 1023, PAN_MIN, PAN_MAX);
    }
    if (abs(y - JOY_Y_CENTER) > DEADZONE) {
      tiltAngle = map(y, 0, 1023, TILT_MIN, TILT_MAX);
    }
  }

  panServo.write(panAngle);
  tiltServo.write(tiltAngle);

  Serial.print("Pan ");
  Serial.print(panAngle);
  Serial.print("  Tilt ");
  Serial.println(tiltAngle);

  delay(20);
}`;

export const SERVO_PAN_TILT_CAMERA_STEPS: AuthoredWalkthroughStep[] = [
  {
    sortOrder: 0,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'What We\'re Building',
    description: 'A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we\'re building',
        body: 'You will assemble a pan-tilt bracket around two SG90 servos, power the servos from a breadboard PSU, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism.',
      },
      {
        type: 'image',
        imageKey: 'servoCamera',
        caption: 'Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2.',
      },
      {
        type: 'text',
        heading: 'Why this order',
        body: 'Mechanics first, then power, then one servo at a time, then the joystick, then mapping and limits. A binding bracket, a missing ground, and a reversed axis are three different faults. Building in this order keeps them from stacking.',
      },
    ],
  },
  {
    sortOrder: 1,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'How Pan-Tilt Works',
    description: 'Each servo holds an angle. Pan rotates the base. Tilt nods the camera plate. The Arduino sends a pulse-width signal; the servo’s own board does the motor work.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What a hobby servo does',
        body: 'An SG90 is a geared motor plus a position sensor. write(90) means “go to mid-travel and hold.” The number is degrees, roughly 0 to 180. The Arduino pin only sends a control pulse. The servo draws its running current from the red VCC wire, not from that signal pin.',
      },
      {
        type: 'text',
        heading: 'Two axes',
        body: 'The lower servo is pan: it yaws the whole upper assembly. The upper servo is tilt: it pitches the camera plate. They must be free to move without the bracket hitting itself. Mechanical stops are tighter than the servo’s 0–180 software range, which is why later code uses 20–160, not 0–180.',
      },
      {
        type: 'warning',
        body: 'Do not force a servo by hand while it is powered. If the bracket binds, remove power and ease the horn off rather than driving through the stall.',
      },
    ],
  },
  {
    sortOrder: 2,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'Understand the Components',
    description: 'Every part in this walkthrough is on the project BOM. Know what each one is for before you assemble or plug anything in.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What each part does',
        body: 'The Uno is the controller. Two SG90s are the joints. The pan-tilt bracket kit is the mechanical frame and camera plate. The analog joystick is the input (VRx, VRy, and a click switch). The breadboard PSU supplies 5V for the servos. The breadboard and jumpers are the wiring. A camera is optional payload — this sketch never talks to a camera module.',
      },
      {
        type: 'components',
        items: COMPONENTS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can point to two separate SG90s, the bracket kit, the joystick, and the PSU. Do not substitute a continuous-rotation “360° servo” — this project needs position servos that hold an angle.',
      },
    ],
  },
  {
    sortOrder: 3,
    stageSortOrder: 0,
    stageTitle: STAGE_UNDERSTAND,
    title: 'Understand Power and Pin Architecture',
    description: 'Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.',
    tip: 'A 9V snap battery is too weak for two stalling SG90s. Use the breadboard PSU with a 6–12V DC barrel-jack adapter.',
    blocks: [
      {
        type: 'text',
        heading: 'Two 5V domains, one ground',
        body: 'USB powers the Uno. Uno 5V feeds only the joystick / logic + rail. PSU 5V feeds only the servo + rail. Those two + rails must stay electrically separate — do not join them with a rail-link jumper. Tie PSU GND to Uno GND so the D9/D10 pulses are measured against the same 0V. If grounds are split, the servos jitter or ignore the signal. If the two + rails are linked, the PSU can back-feed the Uno 5V pin.',
      },
      {
        type: 'connections',
        heading: 'Pin map',
        summary: 'Pan D9 · tilt D10 · joystick A0/A1/D2',
        rows: [
          { fromComponent: 'Arduino Uno', fromPin: 'D9', toComponent: 'Pan servo', toPin: 'SIG', signal: 'signal' },
          { fromComponent: 'Arduino Uno', fromPin: 'D10', toComponent: 'Tilt servo', toPin: 'SIG', signal: 'signal' },
          { fromComponent: 'Arduino Uno', fromPin: 'A0', toComponent: 'Joystick', toPin: 'VRx', signal: 'signal' },
          { fromComponent: 'Arduino Uno', fromPin: 'A1', toComponent: 'Joystick', toPin: 'VRy', signal: 'signal' },
          { fromComponent: 'Arduino Uno', fromPin: 'D2', toComponent: 'Joystick', toPin: 'SW', signal: 'signal' },
        ],
      },
      {
        type: 'warning',
        body: 'Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not jumper PSU 5V onto Uno 5V, and do not fit a breadboard rail-link that joins the two + rails.',
      },
    ],
  },
  {
    sortOrder: 4,
    stageSortOrder: 1,
    stageTitle: STAGE_MECHANICAL,
    title: 'Prepare the Mechanical Parts',
    description: 'Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What you should have',
        body: 'A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet.',
      },
      {
        type: 'text',
        heading: 'Orientation',
        body: 'The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox.',
      },
    ],
  },
  {
    sortOrder: 5,
    stageSortOrder: 1,
    stageTitle: STAGE_MECHANICAL,
    title: 'Assemble the Base and Pan Servo',
    description: 'Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.',
    tip: 'Most kits screw through the servo lug holes into the base. Snug, not stripped.',
    blocks: [
      {
        type: 'text',
        heading: 'Mount the pan servo',
        body: 'Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base.',
      },
      {
        type: 'text',
        heading: 'Horn at mid-travel',
        body: 'Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight.',
      },
      {
        type: 'test',
        body: 'With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop.',
      },
    ],
  },
  {
    sortOrder: 6,
    stageSortOrder: 1,
    stageTitle: STAGE_MECHANICAL,
    title: 'Mount the Tilt Servo and Camera Plate',
    description: 'Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'U-bracket on pan',
        body: 'Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate.',
      },
      {
        type: 'text',
        heading: 'Tilt servo and plate',
        body: 'Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration.',
      },
      {
        type: 'warning',
        body: 'Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop.',
      },
    ],
  },
  {
    sortOrder: 7,
    stageSortOrder: 1,
    stageTitle: STAGE_MECHANICAL,
    title: 'Check Mechanical Movement',
    description: 'With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.',
    tip: 'If a joint is stiff, loosen the horn one click rather than forcing it.',
    blocks: [
      {
        type: 'test',
        body: 'Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'The plate hits the U-bracket immediately',
            solution: 'Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body.',
          },
          {
            problem: 'Pan scrapes the desk or the base',
            solution: 'The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre.',
          },
          {
            problem: 'A screw will not seat',
            solution: 'Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 8,
    stageSortOrder: 2,
    stageTitle: STAGE_ELECTRONICS,
    title: 'Set Up Arduino, Breadboard, and Power',
    description: 'USB powers the Uno. The breadboard PSU will power the servos. Build the two 5V rails and the shared ground before any servo signal wire goes in.',
    tip: 'Use a data-capable USB cable. Charge-only cables never appear as a serial port later.',
    blocks: [
      {
        type: 'text',
        heading: 'Find the breadboard power rails',
        body: 'Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. Use one side as the logic + rail (Uno 5V only) and the other side as the servo + rail (PSU 5V only). Those two + rails must stay electrically separate. Some breadboards include metal clips or jumpers that join opposite + rails — remove or skip those. Tie both − rails together so ground is common.',
      },
      {
        type: 'text',
        heading: 'Seat the PSU and jumpers',
        body: 'Clip the breadboard PSU onto the rails if it is an MB102-style module, or seat it so its 5V and GND pins reach the servo-side rails. Set the PSU 5V jumper ON and the 3.3V jumper OFF unless your module docs say otherwise. Plug a jumper from Uno 5V into the logic + rail, Uno GND into a − rail, and PSU GND into that same − net. Do not run a jumper from the logic + rail to the servo + rail. Leave D9, D10, A0, A1, and D2 empty.',
      },
      {
        type: 'wiring',
        heading: 'Power only',
        nodes: [NODE_ARDUINO, NODE_PSU],
        connections: POWER_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'Logic 5V from Uno · servo 5V from PSU · common GND',
        rows: POWER_CONNECTIONS,
      },
      {
        type: 'warning',
        body: 'Plug the PSU barrel jack into a 6–12V DC adapter. Do not connect servo VCC yet. Do not jumper PSU 5V to Uno 5V, and check that no rail-link joins the two + rails. Grounds stay common.',
      },
      {
        type: 'test',
        body: 'Connect USB to the Uno. Confirm the Uno power LED is on. Then apply PSU input and confirm the PSU 5V indicator (if it has one) is on. Check that the two + rails are not linked. Nothing else should be wired.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Uno powered from USB, logic + rail is Uno 5V only, servo-side + rail is PSU 5V only, the two + rails are not joined, and − rails are common with Uno GND. D9, D10, A0, A1, and D2 are still empty. Nothing is hot.',
      },
    ],
  },
  {
    sortOrder: 9,
    stageSortOrder: 2,
    stageTitle: STAGE_ELECTRONICS,
    title: 'Connect the Pan Servo',
    description: 'Pan is the lower SG90. Red goes to the PSU 5V rail, brown to common ground, orange to D9.',
    tip: 'If the lead has yellow instead of orange, that is still the signal wire.',
    blocks: [
      {
        type: 'text',
        heading: 'What you are wiring',
        body: 'Trace the pan servo — the one in the base. Red is VCC and must land on the servo + rail from the PSU, not the Uno 5V pin. Brown (sometimes black) is GND on the common − rail. Orange is SIG on digital pin D9, which is PAN_PIN in the sketch.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_PSU, NODE_PAN],
        connections: PAN_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'Pan servo on D9',
        rows: PAN_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'Three pan wires only: PSU 5V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO.',
      },
    ],
  },
  {
    sortOrder: 10,
    stageSortOrder: 2,
    stageTitle: STAGE_ELECTRONICS,
    title: 'Connect the Tilt Servo',
    description: 'Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What you are wiring',
        body: 'Trace the tilt servo — the one in the U-bracket. Red to the same PSU 5V servo rail as pan. Brown to the same common − rail. Orange to D10, which is TILT_PIN. Both servos share power and ground; only the signal pins differ.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_PSU, NODE_TILT],
        connections: TILT_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'Tilt servo on D10',
        rows: TILT_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'Pan remains on D9. Tilt is on D10. Both reds are on PSU 5V. Both browns are on common GND. No servo red is in the Uno 5V header.',
      },
    ],
  },
  {
    sortOrder: 11,
    stageSortOrder: 2,
    stageTitle: STAGE_ELECTRONICS,
    title: 'Connect the Joystick',
    description: 'The joystick is a low-current analog module. It uses the Uno 5V logic rail, not the servo PSU rail.',
    tip: 'KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.',
    blocks: [
      {
        type: 'text',
        heading: 'What you are wiring',
        body: '+5V goes to the Uno 5V / logic + rail. GND goes to the common − rail. VRx is the pan axis and goes to analog pin A0. VRy is the tilt axis and goes to A1. SW is the click switch and goes to D2. The sketch will later enable INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW.',
      },
      {
        type: 'wiring',
        nodes: [NODE_ARDUINO, NODE_JOY],
        connections: JOY_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'Joystick VRx A0 · VRy A1 · SW D2',
        rows: JOY_CONNECTIONS,
      },
      {
        type: 'warning',
        body: 'Do not power the joystick from the servo PSU rail if that rail is a noisy motor supply with no 5V regulation to the module. The catalogue joystick is a 5V analog part — Uno 5V is the correct source.',
      },
    ],
  },
  {
    sortOrder: 12,
    stageSortOrder: 2,
    stageTitle: STAGE_ELECTRONICS,
    title: 'Check the Complete Circuit',
    description: 'Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, PSU 5V on servo VCC, common ground.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What “complete” means',
        body: 'Every net below should exist once. Two browns may share the − rail. Two reds may share the servo + rail. D9 and D10 must not share a pin with each other or with SW.',
      },
      {
        type: 'wiring',
        heading: 'Complete wiring diagram',
        nodes: [NODE_ARDUINO, NODE_PSU, NODE_PAN, NODE_TILT, NODE_JOY],
        connections: COMPLETE_CONNECTIONS,
      },
      {
        type: 'connections',
        heading: 'Exact connections',
        summary: 'Pan D9 · tilt D10 · joystick A0/A1/D2',
        rows: COMPLETE_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can trace Uno 5V to the joystick, PSU 5V to both servo reds, common GND to both browns and the joystick, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no jumper between the logic + rail and the servo + rail.',
      },
    ],
  },
  {
    sortOrder: 13,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Create the Arduino Program',
    description: 'Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: [],
        code: SKETCH_CREATE,
      },
      {
        type: 'code_explanation',
        body: 'Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo.',
      },
    ],
  },
  {
    sortOrder: 14,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Add the Servo Library',
    description: 'Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.',
    tip: 'You do not need Library Manager for Servo.h on an Uno.',
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: '#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_LIBRARY,
      },
      {
        type: 'code_explanation',
        body: 'Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse — not a wiring short.',
      },
    ],
  },
  {
    sortOrder: 15,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Control the Pan Servo',
    description: 'Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_PAN,
      },
      {
        type: 'code_explanation',
        body: 'Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test.',
      },
    ],
  },
  {
    sortOrder: 16,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Control the Tilt Servo',
    description: 'Attach the second Servo object on D10 and sweep tilt while pan holds 90°.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_TILT,
      },
      {
        type: 'code_explanation',
        body: 'Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped.',
      },
    ],
  },
  {
    sortOrder: 17,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Read Joystick Input',
    description: 'Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.',
    tip: 'Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.',
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_JOYSTICK,
      },
      {
        type: 'code_explanation',
        body: 'We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1.',
      },
      {
        type: 'text',
        heading: 'Resting centre',
        body: 'A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint.',
      },
      {
        type: 'test',
        body: 'When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked.',
      },
    ],
  },
  {
    sortOrder: 18,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Map Joystick Values to Servo Angles',
    description: 'Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_MAP,
      },
      {
        type: 'code_explanation',
        body: 'This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160.',
      },
    ],
  },
  {
    sortOrder: 19,
    stageSortOrder: 3,
    stageTitle: STAGE_PROGRAM,
    title: 'Add Limits and Combine the Program',
    description: 'Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.',
    tip: 'If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).',
    blocks: [
      {
        type: 'text',
        heading: 'What we are adding',
        body: 'PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'pan_tilt.ino',
        libraries: ['Servo'],
        code: SKETCH_COMBINED,
      },
      {
        type: 'code_explanation',
        body: 'This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program.',
      },
    ],
  },
  {
    sortOrder: 20,
    stageSortOrder: 4,
    stageTitle: STAGE_TEST,
    title: 'Upload the Program',
    description: 'Board: Arduino Uno. Serial Monitor at 9600 baud. Power the PSU before you expect the servos to hold.',
    tip: 'If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.',
    blocks: [
      {
        type: 'text',
        heading: 'Before you upload',
        body: 'Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch.',
      },
      {
        type: 'text',
        heading: 'How to upload',
        body: 'Paste the combined sketch from the previous step. Apply PSU power so the servos have 5V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach.',
      },
      {
        type: 'test',
        body: 'Upload once. Watch Serial for “Pan-tilt ready.”',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest.',
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
          {
            problem: 'Board resets when servos move',
            solution: 'Servo VCC is on Uno 5V or the PSU is missing. Move both reds to the PSU 5V rail and confirm common GND.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 21,
    stageSortOrder: 4,
    stageTitle: STAGE_TEST,
    title: 'Test Individual Movements',
    description: 'Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.',
    tip: 'Keep the camera plate lightly loaded until direction is confirmed.',
    blocks: [
      {
        type: 'test',
        body: 'Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'Pan moves when you intend tilt',
            solution: 'Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk.',
          },
          {
            problem: 'An axis moves the wrong way',
            solution: 'Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction.',
          },
          {
            problem: 'One servo is dead',
            solution: 'Confirm that servo’s red is on PSU 5V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 22,
    stageSortOrder: 4,
    stageTitle: STAGE_TEST,
    title: 'Calibrate Neutral Positions',
    description: 'Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.',
    tip: 'Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.',
    blocks: [
      {
        type: 'text',
        heading: 'Why the horn comes off',
        body: 'write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo.',
      },
      {
        type: 'test',
        body: 'With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: '90° is still tilted after reseating',
            solution: 'The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge.',
          },
          {
            problem: 'The joint binds before 20° or 160°',
            solution: 'Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 23,
    stageSortOrder: 4,
    stageTitle: STAGE_TEST,
    title: 'Test Combined Movement',
    description: 'Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.',
    tip: null,
    blocks: [
      {
        type: 'image',
        imageKey: 'servoCamera',
        caption: 'Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2.',
      },
      {
        type: 'test',
        body: 'Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount.',
      },
      {
        type: 'troubleshooting',
        heading: 'If it doesn\'t work',
        items: [
          {
            problem: 'Servos chatter at rest',
            solution: 'Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still.',
          },
          {
            problem: 'Mechanism holds, then jumps',
            solution: 'A weak PSU or a 9V battery is sagging under load. Use a 6–12V DC adapter on the breadboard PSU and keep servo reds off the Uno 5V pin.',
          },
          {
            problem: 'Click does nothing',
            solution: 'Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND.',
          },
          {
            problem: 'USB disconnects when the mount moves',
            solution: 'The Uno is supplying servo current. Recheck that both VCC (red) wires are on the PSU 5V rail and that PSU GND is tied to Uno GND.',
          },
        ],
      },
      {
        type: 'connections',
        heading: 'Pin map you built',
        rows: COMPLETE_CONNECTIONS,
      },
    ],
  },
];
