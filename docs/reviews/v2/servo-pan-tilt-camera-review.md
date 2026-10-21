# Servo Pan-Tilt Camera

Review export generated from the current Supabase project record. This file is not a grade and it does not rewrite the tutorial.

## How to read the claims

- Tutorial sentences below are the Supabase text.
- Manufacturer-stated facts are only the sentences that name a datasheet, product page, or support reply.
- Firmware compilation is recorded separately. Project 18 compiled as passed for `arduino:avr:uno` (Arduino Uno R3). Checksum `85984957`.
- No project in this export was run on the specified hardware. Expected behaviour is not tested behaviour.

## Project record

- Slug: 18
- Title: Servo Pan-Tilt Camera
- Difficulty: intermediate
- Published: true
- Description: Aim a pan-tilt plate with two SG90 servos and a joystick. The plate can hold a small camera. This project does not capture or transmit video.
- Steps: 22

## Local and database comparison

Titles, descriptions, tips, stage names, and content blocks match the local walkthrough for every step.

The local authoritative firmware appears once, unchanged, in the Supabase code blocks.

## Bill of materials

### Arduino Uno R3

- Catalogue id: `arduino-uno-r3`
- Catalogue description: ATmega328P development board
- Category: microcontrollers
- Quantity: 1
- Sort order: 1
- Requirement role: microcontroller
- Substitution policy: exact
- Constraints: (none stored)

### SG90 Micro Servo

- Catalogue id: `sg90`
- Catalogue description: 9g hobby servo motor
- Category: actuators
- Quantity: 2
- Sort order: 2
- Requirement role: servo
- Substitution policy: exact
- Constraints: (none stored)

### Analog Joystick Module

- Catalogue id: `joystick`
- Catalogue description: Two-axis analog joystick with select switch
- Category: modules
- Quantity: 1
- Sort order: 3
- Requirement role: input
- Substitution policy: exact
- Constraints: (none stored)

### Pan-Tilt Bracket Kit

- Catalogue id: `pan-tilt-bracket`
- Catalogue description: Two-axis bracket kit for SG90 servos
- Category: modules
- Quantity: 1
- Sort order: 4
- Requirement role: mechanism
- Substitution policy: exact
- Constraints: (none stored)

### Breadboard

- Catalogue id: `breadboard`
- Catalogue description: Solderless prototyping board
- Category: modules
- Quantity: 1
- Sort order: 5
- Requirement role: breadboard
- Substitution policy: exact
- Constraints: (none stored)

### Jumper Wires

- Catalogue id: `jumper-wires`
- Catalogue description: Dupont jumper wire pack
- Category: modules
- Quantity: 14
- Sort order: 6
- Requirement role: jumper_wires
- Substitution policy: exact
- Constraints: (none stored)

### 2.1 mm jack to screw terminal

- Catalogue id: `adafruit-368`
- Catalogue description: Adafruit 368. Preassembled 2.1 mm jack to a screw terminal block. The terminals are marked positive and negative for a center-positive plug. Wires clamp under the screws. No soldering.
- Category: power
- Quantity: 1
- Sort order: 7
- Requirement role: servo_connector
- Substitution policy: exact
- Constraints: physical_form=screw_terminal_jack

### 5 V 3 A DC supply

- Catalogue id: `gst18a05-p1j`
- Catalogue description: MEAN WELL GST18A05-P1J. Output 5 V DC at 3 A, plug 5.5×2.1 mm, center positive. The inlet is IEC C14 and the mains lead is a separate part.
- Category: power
- Quantity: 1
- Sort order: 8
- Requirement role: servo_supply
- Substitution policy: exact
- Constraints: (none stored)

### IEC C13 mains lead

- Catalogue id: `iec-c13-mains-lead`
- Catalogue description: Mains lead with an IEC C13 connector for the GST18A05-P1J C14 inlet, and a plug for the local mains outlet.
- Category: power
- Quantity: 1
- Sort order: 9
- Requirement role: mains_lead
- Substitution policy: exact
- Constraints: (none stored)

### USB data cable

- Catalogue id: `usb-data-cable`
- Catalogue description: Data-capable USB cable. Match the plug to the board: Arduino Uno R3 uses USB-B, and Espressif ESP32-DevKitC V4 uses Micro-B. A charge-only cable can power a board and still fail upload.
- Category: modules
- Quantity: 1
- Sort order: 10
- Requirement role: usb_cable
- Substitution policy: exact
- Constraints: (none stored)

### USB power source

- Catalogue id: `usb-power-source`
- Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.
- Category: power
- Quantity: 1
- Sort order: 11
- Requirement role: usb_power
- Substitution policy: exact
- Constraints: (none stored)

## Compilation

- Tool: arduino-cli  Version: 1.5.1 Commit: 01f3d4f2b Date: 2026-06-05T10:22:12Z
- Core arduino:avr: 1.8.7
- Core esp32:esp32: 3.3.12
- Library Adafruit BME280 Library: 2.3.0
- Library Adafruit Unified Sensor: 1.1.15
- Library Adafruit BusIO: 1.17.4
- Library Servo: 1.3.0
- Result: passed
- Board: Arduino Uno R3
- FQBN: `arduino:avr:uno`
- Sketch checksum: `85984957`
- Hardware testing: not run. Do not treat this compile as a working build.

## Authoritative firmware

This is the local final sketch. The comparison above says whether the Supabase upload block is the same text.

```cpp
#include <Servo.h>

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
}
```

## Wiring and physical layout

Diagram geometry is local source. It is not a Supabase column. These are the current layout identities.

- Layout slug: 18
- Breadboard rows: 17
- Arduino Uno (`arduino`, arduino-uno) catalogue `arduino-uno-r3`. Role: Reads the joystick and sends the servo signals. Its 5 V pin does not feed the servos. Ports: 5V, 3.3V, GND, D2, D9, D10, A0, A1.
- Breadboard (`breadboard`, breadboard) catalogue `breadboard`. Role: Carries Uno 5 V for the joystick and the shared ground. Servo positive stays on the adapter screws. Ports: Uno 5V, GND.
- Pan servo (`pan`, servo) catalogue `sg90`. Role: Turns the camera left and right from D9. Ports: VCC, GND, SIG.
- Tilt servo (`tilt`, servo) catalogue `sg90`. Role: Tilts the camera from D10. Ports: VCC, GND, SIG.
- Joystick (`joystick`, joystick) catalogue `joystick`. Role: Sends the pan and tilt position, and the select switch, to the Uno. Ports: +5V, GND, VRx, VRy, SW.
- Adafruit 368 (`psu`, dc-jack) catalogue `adafruit-368`. Role: Takes the GST18A05-P1J plug. The + screw is servo positive and the − screw is servo ground. Ports: +, −.
- Jumper `uno-5v` (male-male)
- Jumper `uno-gnd` (male-male)
- Jumper `psu-gnd` (male-male)
- Jumper `pan-vcc` (male-male)
- Jumper `pan-gnd` (male-male)
- Jumper `pan-sig` (male-male)
- Jumper `tilt-vcc` (male-male)
- Jumper `tilt-gnd` (male-male)
- Jumper `tilt-sig` (male-male)
- Jumper `joy-5v` (male-male)
- Jumper `joy-gnd` (male-male)
- Jumper `joy-vrx` (male-male)
- Jumper `joy-vry` (male-male)
- Jumper `joy-sw` (male-male)

## Known technical limitations

These notes are for the reviewer. They are not extra tutorial steps.

- This export does not record a physical build. The screw-clamped jumper pins have not been tug-tested on a bench.
- Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current.
- Adafruit’s product page for 368 describes a preassembled 2.1 mm jack and screw terminals marked for a center-positive plug. That page does not publish a current rating. A 2019 Adafruit support reply gave a nominal 2 A. The GST18A05-P1J can supply 3 A, so the connector is the tighter published guidance.
- The GST18A05-P1J plug is 5.5×2.1 mm, center positive. Adafruit 368 is sold as the 2.1 mm jack for that plug. The product page does not print the outer diameter 5.5 mm.
- Servo motor current is kept off the breadboard because a solderless breadboard contact is not specified for this supply. BusBoard’s BB830 datasheet rates a board of that class at 36 V and 2 A, and BusBoard’s FAQ advises staying near 1 A. This project’s breadboard is a generic part.
- Mains connection is the supplied GST18A05-P1J and an IEC C13 lead. The tutorial does not describe opening the adapter or rewiring mains.

## Tutorial

## Step 1

- Stage order: 0
- Stage: Understand the Project
- Title: What We're Building

**Description**

A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.

**Tip**

(none)

#### Block 1: text

**Heading**

What we're building

**Body**

You will assemble a pan-tilt bracket around two SG90 servos, power the servos from an Adafruit 368 screw-terminal jack, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism.

#### Block 2: image

**Image key**

servoCamera

**Caption**

Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2.

#### Block 3: components

- Arduino Uno R3 ×1 — catalogue id `arduino-uno-r3`, illustration `arduino-uno`, owned false
- SG90 Micro Servo ×2 — catalogue id `sg90`, illustration `servo-sg90`, owned false
- Analog Joystick Module ×1 — catalogue id `joystick`, illustration `generic-module`, owned false
- Pan-Tilt Bracket Kit ×1 — catalogue id `pan-tilt-bracket`, illustration `electronics-kit`, owned false
- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard`, owned false
- Male-to-male jumper wires ×14 — catalogue id `jumper-wires`, illustration `jumper-wires`, owned false
- 2.1 mm jack to screw terminal ×1 — catalogue id `adafruit-368`, illustration `generic-module`, owned false
- 5 V 3 A DC supply ×1 — catalogue id `gst18a05-p1j`, illustration `battery`, owned false
- IEC C13 mains lead ×1 — catalogue id `iec-c13-mains-lead`, illustration `usb-cable`, owned false
- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable`, owned false
- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module`, owned false

#### Block 4: warning

**Body**

Use position SG90 servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes.

## Step 2

- Stage order: 0
- Stage: Understand the Project
- Title: Understand Power and Pin Architecture

**Description**

Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.

**Tip**

The servo supply is a MEAN WELL GST18A05-P1J: 5 V, 3 A, 5.5×2.1 mm, center positive. It needs the IEC C13 mains lead, fitted as supplied. Do not open the adapter or change the mains plug. A 9V snap is not the servo supply.

#### Block 1: text

**Heading**

Two 5V domains, one ground

**Body**

USB powers the Uno. Uno 5V feeds only the joystick, through the left + rail. Servo current does not enter the breadboard. The GST18A05-P1J plugs into an Adafruit 368, a preassembled 2.1 mm jack whose screws are marked + and − for a center-positive plug. Both servo red wires clamp under the + screw. Both brown wires, and one ground jumper to the left − rail, clamp under the − screw. Do not connect the + screw to Uno 5V. If the grounds are split, the servos jitter or ignore the signal. If the + screw reaches Uno 5V, the servo supply can back-feed the Uno. Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current, so this build uses a 3 A regulated 5 V supply rather than a small linear breadboard regulator. Adafruit’s page for product 368 does not publish a current rating. A 2019 Adafruit support reply gave that adapter a nominal 2 A.

#### Block 2: connections

**Heading**

Pin map

**Summary**

Pan D9 · tilt D10 · joystick A0/A1/D2

**Connections**

- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 3: warning

**Body**

Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not connect the adapter + screw to Uno 5V or to a breadboard + rail.

## Step 3

- Stage order: 1
- Stage: Mechanical Assembly
- Title: Prepare the Mechanical Parts

**Description**

Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.

**Tip**

(none)

#### Block 1: text

**Heading**

What you should have

**Body**

A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet.

#### Block 2: text

**Heading**

Orientation

**Body**

The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base.

#### Block 3: expected

**Heading**

Check

**Body**

You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox.

## Step 4

- Stage order: 1
- Stage: Mechanical Assembly
- Title: Assemble the Base and Pan Servo

**Description**

Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.

**Tip**

Most kits screw through the servo lug holes into the base. Snug, not stripped.

#### Block 1: text

**Heading**

Mount the pan servo

**Body**

Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base.

#### Block 2: text

**Heading**

Horn at mid-travel

**Body**

Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight.

#### Block 3: test

**Body**

With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base.

#### Block 4: expected

**Heading**

Expected result

**Body**

The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop.

## Step 5

- Stage order: 1
- Stage: Mechanical Assembly
- Title: Mount the Tilt Servo and Camera Plate

**Description**

Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.

**Tip**

(none)

#### Block 1: text

**Heading**

U-bracket on pan

**Body**

Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate.

#### Block 2: text

**Heading**

Tilt servo and plate

**Body**

Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration.

#### Block 3: warning

**Body**

Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later.

#### Block 4: expected

**Heading**

Check

**Body**

You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop.

## Step 6

- Stage order: 1
- Stage: Mechanical Assembly
- Title: Check Mechanical Movement

**Description**

With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.

**Tip**

If a joint is stiff, loosen the horn one click rather than forcing it.

#### Block 1: test

**Body**

Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch. Power is still off. Once the servos are powered, do not force a horn by hand. If a joint binds, remove power and ease the horn off.

#### Block 2: expected

**Heading**

Expected result

**Body**

Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth.

#### Block 3: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: The plate hits the U-bracket immediately

Solution: Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body.

**Item 2**

Problem: Pan scrapes the desk or the base

Solution: The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre.

**Item 3**

Problem: A screw will not seat

Solution: Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft.

## Step 7

- Stage order: 2
- Stage: Build the Electronics
- Title: Set Up Arduino, Breadboard, and Power

**Description**

USB powers the Uno. The Adafruit 368 will power the servos. Connect Uno 5V, Uno GND, and the adapter ground before any servo signal wire goes in.

**Tip**

Use a data-capable USB cable. Charge-only cables never appear as a serial port later.

#### Block 1: text

**Heading**

Find the breadboard power rails

**Body**

Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. This build uses the left + rail for Uno 5V and the left − rail for ground. Servo positive does not use a breadboard rail. Some breadboards include metal clips that join opposite + rails — remove or skip those. Leave the right-hand rails empty.

#### Block 2: text

**Heading**

Seat the adapter and jumpers

**Body**

Place the Adafruit 368 beside the breadboard. Its screws are marked + and − for a center-positive plug. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. One male-to-male jumper goes from left − row 4 to the − screw: slide the plastic housing back on that end and tighten the screw on the metal pin until a gentle tug does not pull it out. Do not put a wire on the + screw yet. Do not connect the + screw to either breadboard + rail. This build uses 14 male-to-male jumpers. Leave D9, D10, A0, A1, and D2 empty.

#### Block 3: wiring

**Heading**

Power only

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "psu",
    "illustrationId": "generic-module",
    "name": "Adafruit 368"
  }
]
```

**Connections**

- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Adafruit 368 GND → Breadboard − rail (ground)

**Progressive assembly**

Parts: psu

Jumpers: uno-5v, uno-gnd, psu-gnd

#### Block 4: connections

**Summary**

Logic 5V from Uno · adapter ground tied to Uno GND

**Connections**

- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Adafruit 368 GND → Breadboard − rail (ground)

#### Block 5: warning

**Body**

Plug the GST18A05-P1J into the Adafruit 368 until the plug seats. The plug is 5.5×2.1 mm and center positive, and this jack is Adafruit’s 2.1 mm jack for that plug. Do not connect servo VCC yet. Do not join the + screw to Uno 5V. The − screw stays tied to Uno GND.

#### Block 6: test

**Body**

Connect USB to the Uno. Confirm the Uno power LED is on. Then plug in the GST18A05-P1J. The adapter + screw must not touch a breadboard + rail. Nothing else should be wired.

#### Block 7: expected

**Heading**

Expected result

**Body**

Uno powered from USB. The left + rail is Uno 5V only. The adapter + screw is the servo supply and is not tied to that rail. Left − row 2 and left − row 4 share ground with the adapter − screw. D9, D10, A0, A1, and D2 are still empty. The adapter body is not hot.

## Step 8

- Stage order: 2
- Stage: Build the Electronics
- Title: Connect the Pan Servo

**Description**

Pan is the lower SG90. Red clamps under the adapter + screw, brown under the − screw, orange to D9.

**Tip**

If the lead has yellow instead of orange, that is still the signal wire.

#### Block 1: text

**Heading**

What you are wiring

**Body**

The pan servo connector is female, so use male-to-male wires. Slide the housing back on the adapter end of the red and brown wires and clamp the metal pins under the screws: red under +, brown under −, sharing the − screw with the ground jumper already there. The other ends plug into the servo’s red and brown sockets. Tighten each screw until a gentle tug does not pull the pin out. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole and does not go under a screw. Red must not touch the left + rail.

#### Block 2: wiring

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "psu",
    "illustrationId": "generic-module",
    "name": "Adafruit 368"
  },
  {
    "id": "pan",
    "illustrationId": "servo-sg90",
    "name": "Pan servo"
  }
]
```

**Connections**

- Adafruit 368 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)

**Progressive assembly**

Parts: pan

Jumpers: pan-vcc, pan-gnd, pan-sig

#### Block 3: connections

**Summary**

Pan servo on D9

**Connections**

- Adafruit 368 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)

#### Block 4: expected

**Heading**

Check

**Body**

Three pan wires only: servo 5 V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO.

## Step 9

- Stage order: 2
- Stage: Build the Electronics
- Title: Connect the Tilt Servo

**Description**

Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.

**Tip**

(none)

#### Block 1: text

**Heading**

What you are wiring

**Body**

The tilt connector is female too. Clamp its red pin under the same + screw and its brown pin under the same − screw. Orange goes from Uno D10 straight to the signal pin. Both servos share the adapter screws. Only the signal pins differ.

#### Block 2: wiring

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "psu",
    "illustrationId": "generic-module",
    "name": "Adafruit 368"
  },
  {
    "id": "tilt",
    "illustrationId": "servo-sg90",
    "name": "Tilt servo"
  }
]
```

**Connections**

- Adafruit 368 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)

**Progressive assembly**

Parts: tilt

Jumpers: tilt-vcc, tilt-gnd, tilt-sig

#### Block 3: connections

**Summary**

Tilt servo on D10

**Connections**

- Adafruit 368 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)

#### Block 4: expected

**Heading**

Check

**Body**

Pan remains on D9. Tilt is on D10. Both reds are under the adapter + screw. Both browns are under the adapter − screw. No servo red is in the Uno 5V header.

## Step 10

- Stage order: 2
- Stage: Build the Electronics
- Title: Connect the Joystick

**Description**

The joystick is a low-current analog module. It uses the Uno 5V rail, not the adapter + screw.

**Tip**

KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.

#### Block 1: text

**Heading**

What you are wiring

**Body**

Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW.

#### Block 2: wiring

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "joystick",
    "illustrationId": "generic-module",
    "name": "Joystick"
  }
]
```

**Connections**

- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

**Progressive assembly**

Parts: joystick

Jumpers: joy-5v, joy-gnd, joy-vrx, joy-vry, joy-sw

#### Block 3: connections

**Summary**

Joystick VRx A0 · VRy A1 · SW D2

**Connections**

- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 4: warning

**Body**

Do not power the joystick from the adapter + screw. The catalogue joystick is a 5V analog part — Uno 5V is the correct source.

## Step 11

- Stage order: 2
- Stage: Build the Electronics
- Title: Check the Complete Circuit

**Description**

Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, servo 5 V on servo VCC, common ground.

**Tip**

(none)

#### Block 1: text

**Heading**

What “complete” means

**Body**

Every net below should exist once. Two browns may share the adapter − screw. Two reds may share the adapter + screw. D9 and D10 must not share a pin with each other or with SW.

#### Block 2: wiring

**Heading**

Complete wiring diagram

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "psu",
    "illustrationId": "generic-module",
    "name": "Adafruit 368"
  },
  {
    "id": "pan",
    "illustrationId": "servo-sg90",
    "name": "Pan servo"
  },
  {
    "id": "tilt",
    "illustrationId": "servo-sg90",
    "name": "Tilt servo"
  },
  {
    "id": "joystick",
    "illustrationId": "generic-module",
    "name": "Joystick"
  }
]
```

**Connections**

- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Adafruit 368 GND → Breadboard − rail (ground)
- Adafruit 368 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Adafruit 368 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 3: connections

**Heading**

Exact connections

**Summary**

Pan D9 · tilt D10 · joystick A0/A1/D2

**Connections**

- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Adafruit 368 GND → Breadboard − rail (ground)
- Adafruit 368 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Adafruit 368 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 4: expected

**Heading**

Check

**Body**

You can trace Uno 5V to the joystick, the adapter + screw to both servo reds, the adapter − screw to both browns and to Uno GND, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no wire from the adapter + screw to Uno 5V.

## Step 12

- Stage order: 3
- Stage: Build the Program
- Title: Create the Arduino Program

**Description**

Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[]

**Code**

```cpp
const int PAN_PIN = 9;
const int TILT_PIN = 10;
const int JOY_X_PIN = A0;
const int JOY_Y_PIN = A1;
const int JOY_SW_PIN = 2;

void setup() {
  Serial.begin(9600);
}

void loop() {
}
```

#### Block 3: code_explanation

**Body**

Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo.

## Step 13

- Stage order: 3
- Stage: Build the Program
- Title: Add the Servo Library

**Description**

Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.

**Tip**

You do not need Library Manager for Servo.h on an Uno.

#### Block 1: text

**Heading**

What we are adding

**Body**

#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse, not a wiring short. Leave the horn screw loose. After the servo settles, remove power, reseat the horn so the bracket is square, then tighten the screw.

## Step 14

- Stage order: 3
- Stage: Build the Program
- Title: Control the Pan Servo

**Description**

Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call.

#### Block 4: expected

**Heading**

Check

**Body**

This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test.

## Step 15

- Stage order: 3
- Stage: Build the Program
- Title: Control the Tilt Servo

**Description**

Attach the second Servo object on D10 and sweep tilt while pan holds 90°.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own.

#### Block 4: expected

**Heading**

Expected result

**Body**

When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped.

## Step 16

- Stage order: 3
- Stage: Build the Program
- Title: Read Joystick Input

**Description**

Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.

**Tip**

Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.

#### Block 1: text

**Heading**

What we are adding

**Body**

analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1.

#### Block 4: text

**Heading**

Resting centre

**Body**

A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint.

#### Block 5: test

**Body**

When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud.

#### Block 6: expected

**Heading**

Expected result

**Body**

At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked.

## Step 17

- Stage order: 3
- Stage: Build the Program
- Title: Map Joystick Values to Servo Angles

**Description**

Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160.

## Step 18

- Stage order: 3
- Stage: Build the Program
- Title: Add Limits and Combine the Program

**Description**

Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.

**Tip**

If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).

#### Block 1: text

**Heading**

What we are adding

**Body**

PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera.

#### Block 2: code

**Language**

Arduino

**Filename**

pan_tilt.ino

**Libraries**

[
  "Servo"
]

**Code**

```cpp
#include <Servo.h>

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
}
```

#### Block 3: code_explanation

**Body**

This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program.

## Step 19

- Stage order: 4
- Stage: Calibrate and Test
- Title: Upload the Program

**Description**

Board: Arduino Uno. Serial Monitor at 9600 baud. Plug in the GST18A05-P1J before you expect the servos to hold.

**Tip**

If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.

#### Block 1: text

**Heading**

Before you upload

**Body**

Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch.

#### Block 2: text

**Heading**

How to upload

**Body**

Paste the combined sketch from the previous step. Plug in the GST18A05-P1J so the servos have 5 V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach.

#### Block 3: test

**Body**

Upload once. Watch Serial for “Pan-tilt ready.”

#### Block 4: expected

**Heading**

Expected result

**Body**

The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest.

#### Block 5: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: No serial port

Solution: Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port.

**Item 2**

Problem: Upload error / avrdude

Solution: Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy.

**Item 3**

Problem: Board resets when servos move

Solution: Servo VCC is on Uno 5V or the supply is missing. Move both reds under the adapter + screw and confirm the − screw reaches Uno GND.

## Step 20

- Stage order: 4
- Stage: Calibrate and Test
- Title: Test Individual Movements

**Description**

Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.

**Tip**

Keep the camera plate lightly loaded until direction is confirmed.

#### Block 1: test

**Body**

Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once.

#### Block 2: expected

**Heading**

Expected result

**Body**

Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone.

#### Block 3: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: Pan moves when you intend tilt

Solution: Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk.

**Item 2**

Problem: An axis moves the wrong way

Solution: Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction.

**Item 3**

Problem: One servo is dead

Solution: Confirm that servo’s red is on servo 5 V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat.

## Step 21

- Stage order: 4
- Stage: Calibrate and Test
- Title: Calibrate Neutral Positions

**Description**

Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.

**Tip**

Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.

#### Block 1: text

**Heading**

Why the horn comes off

**Body**

write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo.

#### Block 2: test

**Body**

With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again.

#### Block 3: expected

**Heading**

Expected result

**Body**

After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops.

#### Block 4: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: 90° is still tilted after reseating

Solution: The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge.

**Item 2**

Problem: The joint binds before 20° or 160°

Solution: Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range.

## Step 22

- Stage order: 4
- Stage: Calibrate and Test
- Title: Test Combined Movement

**Description**

Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.

**Tip**

(none)

#### Block 1: image

**Image key**

servoCamera

**Caption**

Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2.

#### Block 2: test

**Body**

Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty.

#### Block 3: expected

**Heading**

Expected result

**Body**

Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount.

#### Block 4: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: Servos chatter at rest

Solution: Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still.

**Item 2**

Problem: Mechanism holds, then jumps

Solution: The servo supply is sagging or the plug is not seated. Use the GST18A05-P1J in the Adafruit 368, center positive, and keep both servo reds off the Uno 5V pin.

**Item 3**

Problem: Click does nothing

Solution: Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND.

**Item 4**

Problem: USB disconnects when the mount moves

Solution: The Uno is supplying servo current. Recheck that both VCC (red) wires are under the adapter + screw and that the − screw is tied to Uno GND.

#### Block 5: connections

**Heading**

Pin map you built

**Connections**

- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Adafruit 368 GND → Breadboard − rail (ground)
- Adafruit 368 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Adafruit 368 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

## Supporting notes

NOT CURRENTLY SHOWN TO USERS

The app does not render `constants/walkthroughs/supporting-notes.ts`. The text below is that hidden source.

### How Pan-Tilt Works

An SG90 is a geared motor plus a position sensor. write(90) means go to mid-travel and hold. The number is degrees, roughly 0 to 180. The Arduino pin only sends a control pulse. The servo draws its running current from the red VCC wire, not from that signal pin. The lower servo yaws the upper assembly. The upper servo pitches the camera plate. Mechanical stops are tighter than the 0–180 software range, which is why the sketch uses 20–160. Do not force a servo by hand while it is powered. If the bracket binds, remove power and ease the horn off.

### Understand the Components

The Uno is the controller. Two SG90s are the joints. The pan-tilt bracket kit is the mechanical frame and camera plate. The analog joystick is the input. Servo power comes from the GST18A05-P1J through an Adafruit 368 screw-terminal jack, not from a breadboard regulator and not through the breadboard positive rail. A camera is optional payload, and this sketch never talks to a camera module. Use position servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes.

