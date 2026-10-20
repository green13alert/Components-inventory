# Motion Sensor Alarm

Exported from the current linked Supabase records (`public.projects`, `public.project_steps`, `public.project_components`, `public.components`, and `public.project_requirements`) on 20 October 2026. Step text is verbatim. This file is for independent review.

## Project

- Slug: 8
- Title: Motion Sensor Alarm
- Description: Trigger a buzzer and LED when movement is detected
- Overview: Build a USB-powered PIR motion alarm: wire the sensor, LED, and active buzzer, then grow an Arduino sketch from a pin map to a complete detect-and-alert loop.
- Category: sensors
- Difficulty: beginner
- Estimated duration: 2 hrs
- Publication status: published
- Cover image key: motionSensor
- Cover asset: assets/images/projects/project-motion-sensor.jpg (workbench photograph)

### Learning objectives

- Explain how a PIR module signals motion on a digital pin
- Wire PIR, LED with a 220 Ω resistor, and active buzzer to an Arduino Uno
- Grow a sketch from digitalRead through a combined LED and buzzer alarm
- Test idle and motion states and isolate input versus output faults

### Hardware-testing limit recorded in the exported text

No separate hardware-test certificate is stored in Supabase. The only testing limits are the ones written in the steps and firmware comments below. A published flag is not a record that the board was built.

## Bill of materials

| Qty | Catalogue id | Name | Category | Manufacturer | Part number |
| --- | --- | --- | --- | --- | --- |
| 1 | arduino-uno-r3 | Arduino Uno R3 | microcontrollers |  |  |
| 1 | pir-sensor | PIR Motion Sensor | sensors |  |  |
| 1 | buzzer | Active buzzer | actuators |  |  |
| 1 | led | LED | modules |  |  |
| 1 | resistor-220 | 220 Ω resistor | modules |  |  |
| 1 | breadboard | Breadboard | modules |  |  |
| 10 | jumper-wires | Jumper Wires | modules |  |  |

- **Arduino Uno R3:** ATmega328P development board
- **PIR Motion Sensor:** Passive infrared motion detector
- **Active buzzer:** Active buzzer. A HIGH on the signal pin makes it sound.
- **LED:** Standard indicator LED
- **220 Ω resistor:** Current-limiting resistor for a typical 5 V LED
- **Breadboard:** Solderless prototyping board
- **Jumper Wires:** Dupont jumper wire pack

## Compatibility requirements

No requirement rows are stored for this project.

## Complete firmware source

This is the longest code block stored on the walkthrough. The same text is repeated, unabbreviated, on the step where the app shows it.

```arduino
const int PIR_PIN = 2;
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
}
```

## Wiring diagram source

The app draws the physical diagram from the local layout `constants/wiring-diagrams/layouts/motion-sensor-alarm.ts`, not from a diagram stored in Supabase. The connections named inside each step below are the database records. Hole coordinates are listed here so a reviewer can find the placement without treating this prose as a substitute for the drawing.

Schematic canvas: 720 × 500. Legend voltages come from that layout file.

Breadboard rows: 17. Rail split after row: 15.

### Component leads

- pir vcc → strip row 3 column c
- pir out → strip row 4 column c
- pir gnd → strip row 5 column c
- resistor leg1 → strip row 8 column e
- resistor leg2 → strip row 12 column e
- led anode → strip row 12 column d
- led cathode → strip row 13 column d
- buzzer vcc → strip row 9 column c
- buzzer sig → strip row 10 column c
- buzzer gnd → strip row 11 column c

### Jumpers

- `uno-5v` (male-male) module arduino port 5v → left plus rail row 1
- `uno-gnd` (male-male) module arduino port gnd → left minus rail row 1
- `pir-vcc` (male-male) left plus rail row 3 → strip row 3 column a
- `pir-out` (male-male) module arduino port d2 → strip row 4 column a
- `pir-gnd` (male-male) left minus rail row 5 → strip row 5 column a
- `led-signal` (male-male) module arduino port d8 → strip row 8 column a
- `led-cathode` (male-male) strip row 13 column a → left minus rail row 13
- `buzzer-vcc` (male-male) left plus rail row 9 → strip row 9 column a
- `buzzer-sig` (male-male) module arduino port d9 → strip row 10 column a
- `buzzer-gnd` (male-male) left minus rail row 11 → strip row 11 column a

### Off-board modules

- arduino at (-210, 16), 168 × 338
  - 5v (5V) at (-194, 108)
  - gnd (GND) at (-194, 124)
  - d8 (D8) at (-58, 188)
  - d9 (D9) at (-58, 172)
  - d2 (D2) at (-58, 298)

## Walkthrough

17 steps.

### Step 1 of 17 — What We're Building

- Stage 0: Understand the Project
- Sort order: 0

A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.

**Block:** text
**Heading:** What we're building

This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up.

**Block:** image

Image key: motionSensor
Asset: assets/images/projects/project-motion-sensor.jpg (workbench photograph)
Caption: Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9.

**Block:** components

- Arduino Uno R3 ×1 — catalogue id `arduino-uno-r3`, illustration `arduino-uno` (shared vector illustration, not a photograph)

- PIR motion sensor ×1 — catalogue id `pir-sensor`, illustration `pir-sensor` (shared vector illustration, not a photograph)

- Buzzer ×1 — catalogue id `buzzer`, illustration `generic-module` (shared vector illustration, not a photograph)

- LED ×1 — catalogue id `led`, illustration `led` (shared vector illustration, not a photograph)

- 220 Ω resistor ×1 — catalogue id `resistor-220`, illustration `resistor` (shared vector illustration, not a photograph)

- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard` (shared vector illustration, not a photograph)

- Male-to-male jumper wires ×10 — catalogue id `jumper-wires`, illustration `jumper-wires` (shared vector illustration, not a photograph)

**Block:** warning

Use the active buzzer from the parts list. A passive piezo will not sound with digitalWrite, and this sketch does not call tone().

### Step 2 of 17 — Set Up the Arduino

- Stage 1: Build the Circuit
- Sort order: 1

Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.

**Tip:** Use a data-capable USB cable. Charge-only cables never appear as a serial port later.

**Block:** text
**Heading:** What to set up

Place the Uno beside the breadboard. Use male-to-male jumpers: Uno 5V into the left + rail at row 1, and Uno GND into the left − rail at row 1. The + rail is 5 V and the − rail is ground. They are not connected to each other. Stay on rows 1–15, above a break in the coloured rail. This build uses 10 male-to-male jumpers from the pack. Leave D2, D8, and D9 empty for now.

**Block:** wiring
**Heading:** Rails only

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: uno-5v, uno-gnd

**Block:** test

Plug in USB. Confirm the Uno power LED is on. Check that D2, D8, and D9 still have no wires in them.

**Block:** expected
**Heading:** Expected result

The board is powered, the + rail is 5V, the − rail is GND, and no sensor or output is connected yet. Nothing should get hot.

### Step 3 of 17 — Connect the PIR Motion Sensor

- Stage 1: Build the Circuit
- Sort order: 2

Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.

**Tip:** If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.

**Block:** text
**Heading:** What you are wiring

Plug the PIR pins into c3, c4, and c5: VCC, OUT, then GND. A male-to-male jumper joins a3 to the left + rail at row 3. Another joins a5 to the left − rail at row 5. D2 goes to a4. OUT is the motion flag — that is PIR_PIN in the sketch. After power-up, give the module about 30 seconds. OUT can chatter during that time. A HIGH is one motion pulse, then it returns LOW. It does not stay HIGH for as long as a person remains in view. Aim the lens away from heaters and vents.

**Block:** wiring
- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)

Diagram nodes: Arduino Uno [arduino-uno]; PIR [pir-sensor]

Progressive assembly — parts introduced: pir
Progressive assembly — jumpers introduced: pir-vcc, pir-out, pir-gnd

**Block:** connections

PIR on D2
- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)

**Block:** expected
**Heading:** Check

Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module.

### Step 4 of 17 — Connect the LED

- Stage 1: Build the Circuit
- Sort order: 3

The LED is the silent alarm. It needs the 220 Ω resistor in series on D8 so the pin is not shorted to ground.

**Block:** text
**Heading:** Polarity and current limit

The longer LED lead is the anode. Seat it in d12 and the shorter lead, by the flat, in d13. The 220 Ω resistor goes in e8 and e12, along column e so it does not cover the buzzer pins. D8 goes to a8. a13 goes to the left − rail at row 13. Use this one resistor only.

**Block:** wiring
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)

Diagram nodes: Arduino Uno [arduino-uno]; 220 Ω resistor [resistor]; LED [led]

Progressive assembly — parts introduced: resistor, led
Progressive assembly — jumpers introduced: led-signal, led-cathode

**Block:** connections

LED on D8 through the 220 Ω resistor
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)

**Block:** warning

Do not wire the LED from D8 straight to GND. Without the 220 Ω resistor the pin can source more current than it should.

### Step 5 of 17 — Connect the Buzzer

- Stage 1: Build the Circuit
- Sort order: 4

The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.

**Block:** text
**Heading:** Active vs two-pin buzzers

Plug the three-pin module into c9, c10, and c11: VCC, I/O, then GND. a9 goes to the left + rail at row 9, D9 goes to a10, and a11 goes to the left − rail at row 11. If your buzzer has only two leads, put the + lead in the D9 row and the other lead in the GND row, and skip the extra 5V wire.

**Block:** wiring
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

Diagram nodes: Arduino Uno [arduino-uno]; Buzzer [generic-module]

Progressive assembly — parts introduced: buzzer
Progressive assembly — jumpers introduced: buzzer-vcc, buzzer-sig, buzzer-gnd

**Block:** connections

Buzzer on D9
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

**Block:** warning

A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code.

### Step 6 of 17 — Check the Complete Circuit

- Stage 1: Build the Circuit
- Sort order: 5

Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.

**Block:** text
**Heading:** What “complete” means

Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO.

**Block:** wiring
**Heading:** Complete wiring diagram
- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

Diagram nodes: Arduino Uno [arduino-uno]; PIR [pir-sensor]; 220 Ω resistor [resistor]; LED [led]; Buzzer [generic-module]

**Block:** connections
**Heading:** Exact connections

PIR D2 · LED D8 · buzzer D9
- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

**Block:** expected
**Heading:** Check

You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin.

### Step 7 of 17 — Create the Arduino Program

- Stage 2: Build the Program
- Sort order: 6

Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.

**Block:** text
**Heading:** What we are adding

PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  Serial.begin(9600);
}

void loop() {
}
```

**Block:** code_explanation

Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins.

### Step 8 of 17 — Read the Motion Sensor

- Stage 2: Build the Program
- Sort order: 7

Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.

**Block:** text
**Heading:** What we are adding

pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
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
}
```

**Block:** code_explanation

We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake.

**Block:** test

Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still.

**Block:** expected
**Heading:** Expected result

After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor.

### Step 9 of 17 — Detect Motion

- Stage 2: Build the Program
- Sort order: 8

Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.

**Block:** text
**Heading:** What we are adding

An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
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
}
```

**Block:** code_explanation

HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone.

### Step 10 of 17 — Control the LED

- Stage 2: Build the Program
- Sort order: 9

When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.

**Block:** text
**Heading:** What we are adding

LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
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
}
```

**Block:** code_explanation

The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR.

**Block:** test

Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet.

**Block:** expected
**Heading:** Expected result

The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → 220 Ω resistor → D8 and cathode → GND.

### Step 11 of 17 — Control the Buzzer

- Stage 2: Build the Program
- Sort order: 10

Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().

**Block:** text
**Heading:** What we are adding

BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
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
}
```

**Block:** code_explanation

LED and buzzer now share one condition. If the LED works and the buzzer does not, the sketch logic is fine — check D9, GND, and whether the part is actually an active buzzer.

### Step 12 of 17 — Combine the System

- Stage 2: Build the Program
- Sort order: 11

Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.

**Block:** text
**Heading:** What we are adding

The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold.

**Block:** code

Language: Arduino
Filename: motion_alarm.ino

```Arduino
const int PIR_PIN = 2;
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
}
```

**Block:** code_explanation

This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program.

### Step 13 of 17 — Upload the Program

- Stage 3: Test the Alarm
- Sort order: 12

Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”

**Tip:** If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.

**Block:** text
**Heading:** Before you upload

Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in.

**Block:** text
**Heading:** How to upload

Paste the combined sketch from the previous step. Click Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes.

**Block:** test

Upload once. Watch Serial for the warm-up line, then “Alarm armed.”

**Block:** expected
**Heading:** Expected result

The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** No serial port

Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port.

**Problem:** Upload error / avrdude

Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy.

### Step 14 of 17 — Test Without Motion

- Stage 3: Test the Alarm
- Sort order: 13

A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.

**Block:** test

After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial.

**Block:** expected
**Heading:** Expected result

LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** Alarm already on with nobody in view

Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno.

**Problem:** Serial floods with Motion detected

The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement.

### Step 15 of 17 — Test Motion Detection

- Stage 3: Test the Alarm
- Sort order: 14

Walk through the PIR field of view and confirm the LED and buzzer fire together.

**Tip:** Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.

**Block:** test

Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait.

**Block:** expected
**Heading:** Expected result

The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** Nothing happens when you walk past

Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH.

**Problem:** Serial detects motion but outputs stay off

The condition is working. Check D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin.

### Step 16 of 17 — Troubleshoot the Circuit

- Stage 3: Test the Alarm
- Sort order: 15

If any test failed, isolate input versus output before changing working code.

**Block:** text
**Heading:** How to isolate the fault

Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed.

**Block:** troubleshooting
**Heading:** If it doesn't work

**Problem:** LED never lights

Confirm anode → 220 Ω resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed.

**Problem:** Buzzer silent

Active buzzers need DC HIGH on the signal pin. Confirm D9 and GND. A two-pin buzzer goes D9 and GND only. A passive piezo will not sound with this sketch.

**Problem:** PIR always HIGH

Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper.

**Problem:** PIR never HIGH

Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk.

### Step 17 of 17 — Final System Test

- Stage 3: Test the Alarm
- Sort order: 16

Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.

**Block:** image

Image key: motionSensor
Asset: assets/images/projects/project-motion-sensor.jpg (workbench photograph)
Caption: Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer.

**Block:** test

Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once.

**Block:** expected
**Heading:** Expected result

Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery.

**Block:** connections
**Heading:** Pin map you built
- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

## Appendix — supporting notes

**NOT CURRENTLY SHOWN TO USERS**

These notes were removed from the main walkthrough and are kept in `constants/walkthroughs/supporting-notes.ts` for a future optional explanation. They are not step content and the app does not render them.

### How the Motion Sensor Works

PIR means passive infrared. The sensor does not emit a beam. It watches for a change in infrared energy, typically a person walking past. When that change is large enough, OUT goes HIGH. When the scene is still, OUT sits LOW. After power-up the module needs about 30 seconds to settle, and OUT can chatter during that time. A HIGH is a motion event, then it returns LOW. It is not proof that someone is still in the room. The alarm lasts as long as the sketch holds the outputs.

### Understand the Components

The Uno is the controller. The PIR is the input. The LED is a silent visual alarm. The 220 Ω resistor limits LED current so D8 is not shorted to ground through the diode. The catalogue buzzer is an active buzzer: a HIGH on its signal pin makes it sound. A passive piezo will not sound with digitalWrite, and this sketch does not call tone(). The breadboard and jumpers are the wiring.

## Local source comparison

The local TypeScript steps match these Supabase steps in sort order, stage, title, description, tip, and block content.
