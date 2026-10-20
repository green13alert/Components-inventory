# Servo Pan-Tilt Camera

Exported from the current linked Supabase records (`public.projects`, `public.project_steps`, `public.project_components`, `public.components`, and `public.project_requirements`) on 20 October 2026. Step text is verbatim. This file is for independent review.

## Project

- Slug: 18
- Title: Servo Pan-Tilt Camera
- Description: Remotely aim a camera module with two servo motors
- Overview: Assemble a two-servo pan-tilt mount, power the SG90s from a breadboard PSU, and aim both axes from an analog joystick with mapping, a deadzone, and travel limits.
- Category: robotics
- Difficulty: intermediate
- Estimated duration: 5 hrs
- Publication status: published
- Cover image key: servoCamera
- Cover asset: assets/images/projects/project-servo-camera.jpg (workbench photograph)

### Learning objectives

- Assemble a two-axis pan-tilt mechanism around SG90 servos without binding
- Power servos from an external 5V supply with a shared ground
- Drive two servos from analog joystick values with mapping, deadzone, and travel limits
- Calibrate horn orientation so 90° is a level camera plate

### Hardware-testing limit recorded in the exported text

No separate hardware-test certificate is stored in Supabase. The only testing limits are the ones written in the steps and firmware comments below. A published flag is not a record that the board was built.

## Bill of materials

| Qty | Catalogue id | Name | Category | Manufacturer | Part number |
| --- | --- | --- | --- | --- | --- |
| 1 | arduino-uno-r3 | Arduino Uno R3 | microcontrollers |  |  |
| 2 | sg90 | SG90 Micro Servo | actuators |  |  |
| 1 | joystick | Analog Joystick Module | modules |  |  |
| 1 | pan-tilt-bracket | Pan-Tilt Bracket Kit | modules |  |  |
| 1 | breadboard-psu | Breadboard Power Supply | power |  |  |
| 1 | breadboard | Breadboard | modules |  |  |
| 16 | jumper-wires | Jumper Wires | modules |  |  |

- **Arduino Uno R3:** ATmega328P development board
- **SG90 Micro Servo:** 9g hobby servo motor
- **Analog Joystick Module:** Two-axis analog joystick with select switch
- **Pan-Tilt Bracket Kit:** Two-axis bracket kit for SG90 servos
- **Breadboard Power Supply:** 3.3V / 5V breadboard PSU
- **Breadboard:** Solderless prototyping board
- **Jumper Wires:** Dupont jumper wire pack

## Compatibility requirements

No requirement rows are stored for this project.

## Complete firmware source

This is the longest code block stored on the walkthrough. The same text is repeated, unabbreviated, on the step where the app shows it.

```arduino
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

## Wiring diagram source

The app draws the physical diagram from the local layout `constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts`, not from a diagram stored in Supabase. The connections named inside each step below are the database records. Hole coordinates are listed here so a reviewer can find the placement without treating this prose as a substitute for the drawing.

Schematic canvas: 1020 × 760. Legend voltages come from that layout file.

Breadboard rows: 17. Rail split after row: 15.

### Component leads

- joystick 5v → strip row 8 column c
- joystick gnd → strip row 9 column c
- joystick vrx → strip row 10 column c
- joystick vry → strip row 11 column c
- joystick sw → strip row 12 column c

### Jumpers

- `uno-5v` (male-male) module arduino port 5v → left plus rail row 2
- `uno-gnd` (male-male) module arduino port gnd → left minus rail row 2
- `psu-gnd` (male-male) module psu port gnd → right minus rail row 3
- `psu-5v` (male-male) module psu port 5v → right plus rail row 3
- `bridge-minus` (male-male) left minus rail row 1 → right minus rail row 1
- `pan-vcc` (male-male) right plus rail row 5 → module pan port vcc
- `pan-gnd` (male-male) right minus rail row 6 → module pan port gnd
- `pan-sig` (male-male) module arduino port d9 → module pan port sig
- `tilt-vcc` (male-male) right plus rail row 8 → module tilt port vcc
- `tilt-gnd` (male-male) right minus rail row 9 → module tilt port gnd
- `tilt-sig` (male-male) module arduino port d10 → module tilt port sig
- `joy-5v` (male-male) left plus rail row 8 → strip row 8 column a
- `joy-gnd` (male-male) left minus rail row 9 → strip row 9 column a
- `joy-vrx` (male-male) module arduino port a0 → strip row 10 column a
- `joy-vry` (male-male) module arduino port a1 → strip row 11 column a
- `joy-sw` (male-male) module arduino port d2 → strip row 12 column a

### Off-board modules

- arduino at (-210, 16), 168 × 338
  - 5v (5V) at (-194, 108)
  - gnd (GND) at (-194, 124)
  - d2 (D2) at (-58, 298)
  - d9 (D9) at (-58, 172)
  - d10 (D10) at (-58, 156)
  - a0 (A0) at (-194, 186)
  - a1 (A1) at (-194, 202)
- pan at (430, 28), 108 × 68
  - gnd (GND) at (438, 46)
  - vcc (VCC) at (438, 62)
  - sig (SIG) at (438, 78)
- tilt at (430, 112), 108 × 68
  - gnd (GND) at (438, 130)
  - vcc (VCC) at (438, 146)
  - sig (SIG) at (438, 162)
- psu at (430, 200), 108 × 72
  - 5v (5V) at (438, 224)
  - gnd (GND) at (438, 248)

## Walkthrough

22 steps.

### Step 1 of 22 — What We're Building

- Stage 0: Understand the Project
- Sort order: 0

A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.

**Block:** text
**Heading:** What we're building

You will assemble a pan-tilt bracket around two SG90 servos, power the servos from a breadboard PSU, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism.

**Block:** image

Image key: servoCamera
Asset: assets/images/projects/project-servo-camera.jpg (workbench photograph)
Caption: Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2.

**Block:** components

- Arduino Uno R3 ×1 — catalogue id `arduino-uno-r3`, illustration `arduino-uno` (shared vector illustration, not a photograph)

- SG90 Micro Servo ×2 — catalogue id `sg90`, illustration `servo-sg90` (shared vector illustration, not a photograph)

- Analog Joystick Module ×1 — catalogue id `joystick`, illustration `generic-module` (shared vector illustration, not a photograph)

- Pan-Tilt Bracket Kit ×1 — catalogue id `pan-tilt-bracket`, illustration `electronics-kit` (shared vector illustration, not a photograph)

- Breadboard Power Supply ×1 — catalogue id `breadboard-psu`, illustration `battery` (shared vector illustration, not a photograph)

- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard` (shared vector illustration, not a photograph)

- Male-to-male jumper wires ×16 — catalogue id `jumper-wires`, illustration `jumper-wires` (shared vector illustration, not a photograph)

**Block:** warning

Use position SG90 servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes.

### Step 2 of 22 — Understand Power and Pin Architecture

- Stage 0: Understand the Project
- Sort order: 1

Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.

**Tip:** A 9V snap battery is too weak for two stalling SG90s. Use the breadboard PSU with a 6–12V DC barrel-jack adapter.

**Block:** text
**Heading:** Two 5V domains, one ground

USB powers the Uno. Uno 5V feeds only the joystick / logic + rail. PSU 5V feeds only the servo + rail. Those two + rails must stay electrically separate — do not join them with a rail-link jumper. Tie PSU GND to Uno GND so the D9/D10 pulses are measured against the same 0V. If grounds are split, the servos jitter or ignore the signal. If the two + rails are linked, the PSU can back-feed the Uno 5V pin.

**Block:** connections
**Heading:** Pin map

Pan D9 · tilt D10 · joystick A0/A1/D2
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

**Block:** warning

Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not jumper PSU 5V onto Uno 5V, and do not fit a breadboard rail-link that joins the two + rails.

### Step 3 of 22 — Prepare the Mechanical Parts

- Stage 1: Mechanical Assembly
- Sort order: 2

Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.

**Block:** text
**Heading:** What you should have

A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet.

**Block:** text
**Heading:** Orientation

The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base.

**Block:** expected
**Heading:** Check

You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox.

### Step 4 of 22 — Assemble the Base and Pan Servo

- Stage 1: Mechanical Assembly
- Sort order: 3

Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.

**Tip:** Most kits screw through the servo lug holes into the base. Snug, not stripped.

**Block:** text
**Heading:** Mount the pan servo

Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base.

**Block:** text
**Heading:** Horn at mid-travel

Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight.

**Block:** test

With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base.

**Block:** expected
**Heading:** Expected result

The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop.

### Step 5 of 22 — Mount the Tilt Servo and Camera Plate

- Stage 1: Mechanical Assembly
- Sort order: 4

Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.

**Block:** text
**Heading:** U-bracket on pan

Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate.

**Block:** text
**Heading:** Tilt servo and plate

Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration.

**Block:** warning

Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later.

**Block:** expected
**Heading:** Check

You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop.

### Step 6 of 22 — Check Mechanical Movement

- Stage 1: Mechanical Assembly
- Sort order: 5

With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.

**Tip:** If a joint is stiff, loosen the horn one click rather than forcing it.

**Block:** test

Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch. Power is still off. Once the servos are powered, do not force a horn by hand. If a joint binds, remove power and ease the horn off.

**Block:** expected
**Heading:** Expected result

Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** The plate hits the U-bracket immediately

Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body.

**Problem:** Pan scrapes the desk or the base

The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre.

**Problem:** A screw will not seat

Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft.

### Step 7 of 22 — Set Up Arduino, Breadboard, and Power

- Stage 2: Build the Electronics
- Sort order: 6

USB powers the Uno. The breadboard PSU will power the servos. Build the two 5V rails and the shared ground before any servo signal wire goes in.

**Tip:** Use a data-capable USB cable. Charge-only cables never appear as a serial port later.

**Block:** text
**Heading:** Find the breadboard power rails

Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. Use one side as the logic + rail (Uno 5V only) and the other side as the servo + rail (PSU 5V only). Those two + rails must stay electrically separate. Some breadboards include metal clips or jumpers that join opposite + rails — remove or skip those. Tie both − rails together so ground is common.

**Block:** text
**Heading:** Seat the PSU and jumpers

The left + rail is Uno 5V. The right + rail is PSU 5V. Do not bridge those two + rails. Bridge the − rails with one male-to-male wire from left − row 1 to right − row 1. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. PSU 5V goes to right + row 3. PSU GND goes to right − row 3. All of these stay on rows 1–15. This build uses 16 male-to-male jumpers from the pack. Leave D9, D10, A0, A1, and D2 empty.

**Block:** wiring
**Heading:** Power only
- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Breadboard PSU GND → Breadboard − rail (ground)
- Breadboard PSU 5V → Breadboard + servo rail (power)

Diagram nodes: Arduino Uno [arduino-uno]; Breadboard PSU [battery]

Progressive assembly — parts introduced: psu
Progressive assembly — jumpers introduced: uno-5v, uno-gnd, psu-5v, psu-gnd, bridge-minus

**Block:** connections

Logic 5V from Uno · servo 5V from PSU · common GND
- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Breadboard PSU GND → Breadboard − rail (ground)
- Breadboard PSU 5V → Breadboard + servo rail (power)

**Block:** warning

Plug the PSU barrel jack into a 6–12V DC adapter. Do not connect servo VCC yet. Do not jumper PSU 5V to Uno 5V, and check that no rail-link joins the two + rails. Grounds stay common.

**Block:** test

Connect USB to the Uno. Confirm the Uno power LED is on. Then apply PSU input and confirm the PSU 5V indicator (if it has one) is on. Check that the two + rails are not linked. Nothing else should be wired.

**Block:** expected
**Heading:** Expected result

Uno powered from USB, logic + rail is Uno 5V only, servo-side + rail is PSU 5V only, the two + rails are not joined, and − rails are common with Uno GND. D9, D10, A0, A1, and D2 are still empty. Nothing is hot.

### Step 8 of 22 — Connect the Pan Servo

- Stage 2: Build the Electronics
- Sort order: 7

Pan is the lower SG90. Red goes to the PSU 5V rail, brown to common ground, orange to D9.

**Tip:** If the lead has yellow instead of orange, that is still the signal wire.

**Block:** text
**Heading:** What you are wiring

The pan servo connector is female, so use male-to-male wires. Red goes from the right + rail at row 5 into the servo’s red pin. Brown goes from the right − rail at row 6 into the brown pin. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole. Red must not touch the left + rail.

**Block:** wiring
- Breadboard PSU 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)

Diagram nodes: Arduino Uno [arduino-uno]; Breadboard PSU [battery]; Pan servo [servo-sg90]

Progressive assembly — parts introduced: pan
Progressive assembly — jumpers introduced: pan-vcc, pan-gnd, pan-sig

**Block:** connections

Pan servo on D9
- Breadboard PSU 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)

**Block:** expected
**Heading:** Check

Three pan wires only: PSU 5V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO.

### Step 9 of 22 — Connect the Tilt Servo

- Stage 2: Build the Electronics
- Sort order: 8

Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.

**Block:** text
**Heading:** What you are wiring

The tilt connector is female too. Red goes from the right + rail at row 8. Brown goes from the right − rail at row 9. Orange goes from Uno D10 straight to the signal pin. Both servos share the right-hand 5V rail and the common − rail. Only the signal pins differ.

**Block:** wiring
- Breadboard PSU 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)

Diagram nodes: Arduino Uno [arduino-uno]; Breadboard PSU [battery]; Tilt servo [servo-sg90]

Progressive assembly — parts introduced: tilt
Progressive assembly — jumpers introduced: tilt-vcc, tilt-gnd, tilt-sig

**Block:** connections

Tilt servo on D10
- Breadboard PSU 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)

**Block:** expected
**Heading:** Check

Pan remains on D9. Tilt is on D10. Both reds are on PSU 5V. Both browns are on common GND. No servo red is in the Uno 5V header.

### Step 10 of 22 — Connect the Joystick

- Stage 2: Build the Electronics
- Sort order: 9

The joystick is a low-current analog module. It uses the Uno 5V logic rail, not the servo PSU rail.

**Tip:** KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.

**Block:** text
**Heading:** What you are wiring

Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8, not the right + rail. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW.

**Block:** wiring
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

Diagram nodes: Arduino Uno [arduino-uno]; Joystick [generic-module]

Progressive assembly — parts introduced: joystick
Progressive assembly — jumpers introduced: joy-5v, joy-gnd, joy-vrx, joy-vry, joy-sw

**Block:** connections

Joystick VRx A0 · VRy A1 · SW D2
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

**Block:** warning

Do not power the joystick from the servo PSU rail if that rail is a noisy motor supply with no 5V regulation to the module. The catalogue joystick is a 5V analog part — Uno 5V is the correct source.

### Step 11 of 22 — Check the Complete Circuit

- Stage 2: Build the Electronics
- Sort order: 10

Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, PSU 5V on servo VCC, common ground.

**Block:** text
**Heading:** What “complete” means

Every net below should exist once. Two browns may share the − rail. Two reds may share the servo + rail. D9 and D10 must not share a pin with each other or with SW.

**Block:** wiring
**Heading:** Complete wiring diagram
- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Breadboard PSU GND → Breadboard − rail (ground)
- Breadboard PSU 5V → Breadboard + servo rail (power)
- Breadboard PSU 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Breadboard PSU 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

Diagram nodes: Arduino Uno [arduino-uno]; Breadboard PSU [battery]; Pan servo [servo-sg90]; Tilt servo [servo-sg90]; Joystick [generic-module]

**Block:** connections
**Heading:** Exact connections

Pan D9 · tilt D10 · joystick A0/A1/D2
- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Breadboard PSU GND → Breadboard − rail (ground)
- Breadboard PSU 5V → Breadboard + servo rail (power)
- Breadboard PSU 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Breadboard PSU 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

**Block:** expected
**Heading:** Check

You can trace Uno 5V to the joystick, PSU 5V to both servo reds, common GND to both browns and the joystick, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no jumper between the logic + rail and the servo + rail.

### Step 12 of 22 — Create the Arduino Program

- Stage 3: Build the Program
- Sort order: 11

Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.

**Block:** text
**Heading:** What we are adding

PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino

```Arduino
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

**Block:** code_explanation

Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo.

### Step 13 of 22 — Add the Servo Library

- Stage 3: Build the Program
- Sort order: 12

Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.

**Tip:** You do not need Library Manager for Servo.h on an Uno.

**Block:** text
**Heading:** What we are adding

#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse — not a wiring short.

### Step 14 of 22 — Control the Pan Servo

- Stage 3: Build the Program
- Sort order: 13

Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.

**Block:** text
**Heading:** What we are adding

write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call.

**Block:** expected
**Heading:** Check

This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test.

### Step 15 of 22 — Control the Tilt Servo

- Stage 3: Build the Program
- Sort order: 14

Attach the second Servo object on D10 and sweep tilt while pan holds 90°.

**Block:** text
**Heading:** What we are adding

Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own.

**Block:** expected
**Heading:** Expected result

When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped.

### Step 16 of 22 — Read Joystick Input

- Stage 3: Build the Program
- Sort order: 15

Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.

**Tip:** Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.

**Block:** text
**Heading:** What we are adding

analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1.

**Block:** text
**Heading:** Resting centre

A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint.

**Block:** test

When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud.

**Block:** expected
**Heading:** Expected result

At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked.

### Step 17 of 22 — Map Joystick Values to Servo Angles

- Stage 3: Build the Program
- Sort order: 16

Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.

**Block:** text
**Heading:** What we are adding

map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160.

### Step 18 of 22 — Add Limits and Combine the Program

- Stage 3: Build the Program
- Sort order: 17

Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.

**Tip:** If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).

**Block:** text
**Heading:** What we are adding

PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera.

**Block:** code

Language: Arduino
Filename: pan_tilt.ino
Libraries: Servo

```Arduino
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

**Block:** code_explanation

This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program.

### Step 19 of 22 — Upload the Program

- Stage 4: Calibrate and Test
- Sort order: 18

Board: Arduino Uno. Serial Monitor at 9600 baud. Power the PSU before you expect the servos to hold.

**Tip:** If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.

**Block:** text
**Heading:** Before you upload

Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch.

**Block:** text
**Heading:** How to upload

Paste the combined sketch from the previous step. Apply PSU power so the servos have 5V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach.

**Block:** test

Upload once. Watch Serial for “Pan-tilt ready.”

**Block:** expected
**Heading:** Expected result

The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** No serial port

Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port.

**Problem:** Upload error / avrdude

Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy.

**Problem:** Board resets when servos move

Servo VCC is on Uno 5V or the PSU is missing. Move both reds to the PSU 5V rail and confirm common GND.

### Step 20 of 22 — Test Individual Movements

- Stage 4: Calibrate and Test
- Sort order: 19

Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.

**Tip:** Keep the camera plate lightly loaded until direction is confirmed.

**Block:** test

Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once.

**Block:** expected
**Heading:** Expected result

Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** Pan moves when you intend tilt

Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk.

**Problem:** An axis moves the wrong way

Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction.

**Problem:** One servo is dead

Confirm that servo’s red is on PSU 5V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat.

### Step 21 of 22 — Calibrate Neutral Positions

- Stage 4: Calibrate and Test
- Sort order: 20

Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.

**Tip:** Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.

**Block:** text
**Heading:** Why the horn comes off

write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo.

**Block:** test

With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again.

**Block:** expected
**Heading:** Expected result

After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** 90° is still tilted after reseating

The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge.

**Problem:** The joint binds before 20° or 160°

Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range.

### Step 22 of 22 — Test Combined Movement

- Stage 4: Calibrate and Test
- Sort order: 21

Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.

**Block:** image

Image key: servoCamera
Asset: assets/images/projects/project-servo-camera.jpg (workbench photograph)
Caption: Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2.

**Block:** test

Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty.

**Block:** expected
**Heading:** Expected result

Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** Servos chatter at rest

Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still.

**Problem:** Mechanism holds, then jumps

A weak PSU or a 9V battery is sagging under load. Use a 6–12V DC adapter on the breadboard PSU and keep servo reds off the Uno 5V pin.

**Problem:** Click does nothing

Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND.

**Problem:** USB disconnects when the mount moves

The Uno is supplying servo current. Recheck that both VCC (red) wires are on the PSU 5V rail and that PSU GND is tied to Uno GND.

**Block:** connections
**Heading:** Pin map you built
- Arduino Uno 5V → Breadboard + logic rail (power)
- Arduino Uno GND → Breadboard − rail (ground)
- Breadboard PSU GND → Breadboard − rail (ground)
- Breadboard PSU 5V → Breadboard + servo rail (power)
- Breadboard PSU 5V → Pan servo VCC (red) (power)
- Arduino Uno GND → Pan servo GND (brown) (ground)
- Arduino Uno D9 → Pan servo SIG (orange) (signal)
- Breadboard PSU 5V → Tilt servo VCC (red) (power)
- Arduino Uno GND → Tilt servo GND (brown) (ground)
- Arduino Uno D10 → Tilt servo SIG (orange) (signal)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

## Appendix — supporting notes

**NOT CURRENTLY SHOWN TO USERS**

These notes were removed from the main walkthrough and are kept in `constants/walkthroughs/supporting-notes.ts` for a future optional explanation. They are not step content and the app does not render them.

### How Pan-Tilt Works

An SG90 is a geared motor plus a position sensor. write(90) means go to mid-travel and hold. The number is degrees, roughly 0 to 180. The Arduino pin only sends a control pulse. The servo draws its running current from the red VCC wire, not from that signal pin. The lower servo yaws the upper assembly. The upper servo pitches the camera plate. Mechanical stops are tighter than the 0–180 software range, which is why the sketch uses 20–160. Do not force a servo by hand while it is powered. If the bracket binds, remove power and ease the horn off.

### Understand the Components

The Uno is the controller. Two SG90s are the joints. The pan-tilt bracket kit is the mechanical frame and camera plate. The analog joystick is the input. The breadboard PSU supplies 5 V for the servos. A camera is optional payload, and this sketch never talks to a camera module. Use position servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes.

## Local source comparison

The local TypeScript steps match these Supabase steps in sort order, stage, title, description, tip, and block content.
