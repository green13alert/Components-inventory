# Motion Sensor Alarm

Review export generated from the current Supabase project record. This file is not a grade and it does not rewrite the tutorial.

## How to read the claims

- Tutorial sentences below are the Supabase text.
- Manufacturer-stated facts are only the sentences that name a datasheet, product page, or support reply.
- Firmware compilation is recorded separately. Project 8 compiled as passed for `arduino:avr:uno` (Arduino Uno R3). Checksum `b360dba9`.
- No project in this export was run on the specified hardware. Expected behaviour is not tested behaviour.

## Project record

- Slug: 8
- Title: Motion Sensor Alarm
- Difficulty: beginner
- Published: true
- Description: Trigger a buzzer and LED when movement is detected
- Steps: 17

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

### PIR Motion Sensor

- Catalogue id: `pir-sensor`
- Catalogue description: Passive infrared motion detector
- Category: sensors
- Quantity: 1
- Sort order: 2
- Requirement role: motion_sensor
- Substitution policy: exact
- Constraints: (none stored)

### Active buzzer

- Catalogue id: `buzzer`
- Catalogue description: Three-pin active buzzer module: VCC, I/O, and GND. HIGH on I/O turns the sounder on. The module switches the sounder from VCC, so the GPIO is a control pin. A two-pin piezo is a different part.
- Category: actuators
- Quantity: 1
- Sort order: 3
- Requirement role: alarm_output
- Substitution policy: exact
- Constraints: (none stored)

### LED

- Catalogue id: `led`
- Catalogue description: Standard indicator LED
- Category: modules
- Quantity: 1
- Sort order: 4
- Requirement role: indicator
- Substitution policy: exact
- Constraints: (none stored)

### 220 Ω resistor

- Catalogue id: `resistor-220`
- Catalogue description: Current-limiting resistor for a typical 5 V LED
- Category: modules
- Quantity: 1
- Sort order: 5
- Requirement role: led_limiter
- Substitution policy: exact
- Constraints: (none stored)

### Breadboard

- Catalogue id: `breadboard`
- Catalogue description: Solderless prototyping board
- Category: modules
- Quantity: 1
- Sort order: 6
- Requirement role: breadboard
- Substitution policy: exact
- Constraints: (none stored)

### Jumper Wires

- Catalogue id: `jumper-wires`
- Catalogue description: Dupont jumper wire pack
- Category: modules
- Quantity: 10
- Sort order: 7
- Requirement role: jumper_wires
- Substitution policy: exact
- Constraints: (none stored)

### USB data cable

- Catalogue id: `usb-data-cable`
- Catalogue description: Data-capable USB cable. Match the plug to the board: Arduino Uno R3 uses USB-B, and Espressif ESP32-DevKitC V4 uses Micro-B. A charge-only cable can power a board and still fail upload.
- Category: modules
- Quantity: 1
- Sort order: 8
- Requirement role: usb_cable
- Substitution policy: exact
- Constraints: (none stored)

### USB power source

- Catalogue id: `usb-power-source`
- Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.
- Category: power
- Quantity: 1
- Sort order: 9
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
- Sketch checksum: `b360dba9`
- Hardware testing: not run. Do not treat this compile as a working build.

## Authoritative firmware

This is the local final sketch. The comparison above says whether the Supabase upload block is the same text.

```cpp
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

## Wiring and physical layout

Diagram geometry is local source. It is not a Supabase column. These are the current layout identities.

- Layout slug: 8
- Breadboard rows: 17
- Arduino Uno (`arduino`, arduino-uno) catalogue `arduino-uno-r3`. Role: Reads the motion sensor and switches the LED and buzzer. Ports: 5V, 3.3V, GND, D2, D8, D9, D10, A0, A1.
- Breadboard (`breadboard`, breadboard) catalogue `breadboard`. Role: Joins leads that share a numbered row on the same side of the centre gap. Ports: +, −.
- PIR (`pir`, pir) catalogue `pir-sensor`. Role: Reports motion on OUT. Ports: VCC, OUT, GND.
- 220 Ω (`resistor`, resistor) catalogue `resistor-220`. Role: Limits current through the LED. Ports: leg 1, leg 2.
- LED (`led`, led) catalogue `led`. Role: Lights while motion is detected. Ports: anode, cathode.
- Buzzer (`buzzer`, buzzer) catalogue `buzzer`. Role: Sounds while motion is detected. Ports: VCC, I/O, GND.
- Jumper `uno-5v` (male-male)
- Jumper `uno-gnd` (male-male)
- Jumper `pir-vcc` (male-male)
- Jumper `pir-out` (male-male)
- Jumper `pir-gnd` (male-male)
- Jumper `led-signal` (male-male)
- Jumper `led-cathode` (male-male)
- Jumper `buzzer-vcc` (male-male)
- Jumper `buzzer-sig` (male-male)
- Jumper `buzzer-gnd` (male-male)

## Known technical limitations

These notes are for the reviewer. They are not extra tutorial steps.

- This export does not record a physical build. Compilation of the final sketch is separate from hardware testing.
- The catalogue buzzer is specified as a three-pin active module. It is not pinned to one manufacturer SKU.
- The sketch waits 30 seconds after power-up. Some PIR modules need longer before OUT is stable. That warm-up was not re-checked against a module datasheet in this pass.

## Tutorial

## Step 1

- Stage order: 0
- Stage: Understand the Project
- Title: What We're Building

**Description**

A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.

**Tip**

(none)

#### Block 1: text

**Heading**

What we're building

**Body**

This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up.

#### Block 2: image

**Image key**

motionSensor

**Caption**

Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9.

#### Block 3: components

- Arduino Uno R3 ×1 — catalogue id `arduino-uno-r3`, illustration `arduino-uno`, owned false
- PIR motion sensor ×1 — catalogue id `pir-sensor`, illustration `pir-sensor`, owned false
- Active buzzer module ×1 — catalogue id `buzzer`, illustration `generic-module`, owned false
- LED ×1 — catalogue id `led`, illustration `led`, owned false
- 220 Ω resistor ×1 — catalogue id `resistor-220`, illustration `resistor`, owned false
- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard`, owned false
- Male-to-male jumper wires ×10 — catalogue id `jumper-wires`, illustration `jumper-wires`, owned false
- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable`, owned false
- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module`, owned false

#### Block 4: warning

**Body**

Use the active buzzer from the parts list. A passive piezo will not sound with digitalWrite, and this sketch does not call tone().

## Step 2

- Stage order: 1
- Stage: Build the Circuit
- Title: Set Up the Arduino

**Description**

Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.

**Tip**

Use a data-capable USB cable. Charge-only cables never appear as a serial port later.

#### Block 1: text

**Heading**

What to set up

**Body**

Place the Uno beside the breadboard. Use the USB-B data cable from the parts list when you upload; the computer USB port is the power source for this build. Use male-to-male jumpers: Uno 5V into the left + rail at row 1, and Uno GND into the left − rail at row 1. The + rail is 5 V and the − rail is ground. They are not connected to each other. Stay on rows 1–15, above a break in the coloured rail. This build uses 10 male-to-male jumpers from the pack. Leave D2, D8, and D9 empty for now.

#### Block 2: wiring

**Heading**

Rails only

**Connections**


**Progressive assembly**

Parts: (none)

Jumpers: uno-5v, uno-gnd

#### Block 3: test

**Body**

Plug in USB. Confirm the Uno power LED is on. Check that D2, D8, and D9 still have no wires in them.

#### Block 4: expected

**Heading**

Expected result

**Body**

The board is powered, the + rail is 5V, the − rail is GND, and no sensor or output is connected yet. Nothing should get hot.

## Step 3

- Stage order: 1
- Stage: Build the Circuit
- Title: Connect the PIR Motion Sensor

**Description**

Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.

**Tip**

If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.

#### Block 1: text

**Heading**

What you are wiring

**Body**

Plug the PIR pins into c3, c4, and c5: VCC, OUT, then GND. A male-to-male jumper joins a3 to the left + rail at row 3. Another joins a5 to the left − rail at row 5. D2 goes to a4. OUT is the motion flag — that is PIR_PIN in the sketch. After power-up, give the module about 30 seconds. OUT can chatter during that time. A HIGH is one motion pulse, then it returns LOW. It does not stay HIGH for as long as a person remains in view. Aim the lens away from heaters and vents.

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
    "id": "pir",
    "illustrationId": "pir-sensor",
    "name": "PIR"
  }
]
```

**Connections**

- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)

**Progressive assembly**

Parts: pir

Jumpers: pir-vcc, pir-out, pir-gnd

#### Block 3: connections

**Summary**

PIR on D2

**Connections**

- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)

#### Block 4: expected

**Heading**

Check

**Body**

Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module.

## Step 4

- Stage order: 1
- Stage: Build the Circuit
- Title: Connect the LED

**Description**

The LED is the silent alarm. It needs the 220 Ω resistor in series on D8 so the pin is not shorted to ground.

**Tip**

(none)

#### Block 1: text

**Heading**

Polarity and current limit

**Body**

The longer LED lead is the anode. Seat it in d12 and the shorter lead, by the flat, in d13. The 220 Ω resistor goes in e8 and e12, along column e so it does not cover the buzzer pins. D8 goes to a8. a13 goes to the left − rail at row 13. Use this one resistor only.

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
    "id": "resistor",
    "illustrationId": "resistor",
    "name": "220 Ω resistor"
  },
  {
    "id": "led",
    "illustrationId": "led",
    "name": "LED"
  }
]
```

**Connections**

- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)

**Progressive assembly**

Parts: resistor, led

Jumpers: led-signal, led-cathode

#### Block 3: connections

**Summary**

LED on D8 through the 220 Ω resistor

**Connections**

- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)

#### Block 4: warning

**Body**

Do not wire the LED from D8 straight to GND. Without the 220 Ω resistor the pin can source more current than it should.

## Step 5

- Stage order: 1
- Stage: Build the Circuit
- Title: Connect the Buzzer

**Description**

The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.

**Tip**

(none)

#### Block 1: text

**Heading**

Three-pin active module

**Body**

Use the three-pin active module from the parts list. Plug it into c9, c10, and c11: VCC, I/O, then GND. a9 goes to the left + rail at row 9, D9 goes to a10, and a11 goes to the left − rail at row 11. The GPIO drives I/O only. The module takes sounder current from the 5 V rail. A two-pin piezo is not this part, and this sketch will not sound one.

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
    "id": "buzzer",
    "illustrationId": "generic-module",
    "name": "Buzzer"
  }
]
```

**Connections**

- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

**Progressive assembly**

Parts: buzzer

Jumpers: buzzer-vcc, buzzer-sig, buzzer-gnd

#### Block 3: connections

**Summary**

Buzzer on D9

**Connections**

- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

#### Block 4: warning

**Body**

A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code.

## Step 6

- Stage order: 1
- Stage: Build the Circuit
- Title: Check the Complete Circuit

**Description**

Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.

**Tip**

(none)

#### Block 1: text

**Heading**

What “complete” means

**Body**

Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO.

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
    "id": "pir",
    "illustrationId": "pir-sensor",
    "name": "PIR"
  },
  {
    "id": "resistor",
    "illustrationId": "resistor",
    "name": "220 Ω resistor"
  },
  {
    "id": "led",
    "illustrationId": "led",
    "name": "LED"
  },
  {
    "id": "buzzer",
    "illustrationId": "generic-module",
    "name": "Buzzer"
  }
]
```

**Connections**

- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

#### Block 3: connections

**Heading**

Exact connections

**Summary**

PIR D2 · LED D8 · buzzer D9

**Connections**

- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

#### Block 4: expected

**Heading**

Check

**Body**

You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin.

## Step 7

- Stage order: 2
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

PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
const int PIR_PIN = 2;
const int LED_PIN = 8;
const int BUZZER_PIN = 9;

void setup() {
  Serial.begin(9600);
}

void loop() {
}
```

#### Block 3: code_explanation

**Body**

Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins.

## Step 8

- Stage order: 2
- Stage: Build the Program
- Title: Read the Motion Sensor

**Description**

Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
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

#### Block 3: code_explanation

**Body**

We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake.

#### Block 4: test

**Body**

Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still.

#### Block 5: expected

**Heading**

Expected result

**Body**

After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor.

## Step 9

- Stage order: 2
- Stage: Build the Program
- Title: Detect Motion

**Description**

Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
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

#### Block 3: code_explanation

**Body**

HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone.

## Step 10

- Stage order: 2
- Stage: Build the Program
- Title: Control the LED

**Description**

When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
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

#### Block 3: code_explanation

**Body**

The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR.

#### Block 4: test

**Body**

Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet.

#### Block 5: expected

**Heading**

Expected result

**Body**

The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → 220 Ω resistor → D8 and cathode → GND.

## Step 11

- Stage order: 2
- Stage: Build the Program
- Title: Control the Buzzer

**Description**

Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
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

#### Block 3: code_explanation

**Body**

LED and buzzer now share one condition. This sketch still prints on every sample, including “No motion”, so you can see the pin change. It is not the sketch you upload. The next step holds the alarm and changes the ready line to “Alarm armed.” If the LED works and the buzzer does not, check D9, the module GND, and that the part is the three-pin active module.

## Step 12

- Stage order: 2
- Stage: Build the Program
- Title: Combine the System

**Description**

Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.

**Tip**

(none)

#### Block 1: text

**Heading**

What we are adding

**Body**

The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold. While the PIR output stays HIGH, the outputs stay on and “Motion detected” prints about once a second. It does not print “No motion” on every idle pass.

#### Block 2: code

**Language**

Arduino

**Filename**

motion_alarm.ino

**Libraries**

[]

**Code**

```cpp
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

#### Block 3: code_explanation

**Body**

This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program.

## Step 13

- Stage order: 3
- Stage: Test the Alarm
- Title: Upload the Program

**Description**

Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”

**Tip**

If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.

#### Block 1: text

**Heading**

Before you upload

**Body**

Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in.

#### Block 2: text

**Heading**

How to upload

**Body**

Paste the combined sketch from the previous step. Click Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes.

#### Block 3: test

**Body**

Upload once. Watch Serial for the warm-up line, then “Alarm armed.”

#### Block 4: expected

**Heading**

Expected result

**Body**

The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still.

#### Block 5: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: No serial port

Solution: Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port.

**Item 2**

Problem: Upload error / avrdude

Solution: Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy.

## Step 14

- Stage order: 3
- Stage: Test the Alarm
- Title: Test Without Motion

**Description**

A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.

**Tip**

(none)

#### Block 1: test

**Body**

After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial.

#### Block 2: expected

**Heading**

Expected result

**Body**

LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest.

#### Block 3: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: Alarm already on with nobody in view

Solution: Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno.

**Item 2**

Problem: Serial floods with Motion detected

Solution: The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement.

## Step 15

- Stage order: 3
- Stage: Test the Alarm
- Title: Test Motion Detection

**Description**

Walk through the PIR field of view and confirm the LED and buzzer fire together.

**Tip**

Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.

#### Block 1: test

**Body**

Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait.

#### Block 2: expected

**Heading**

Expected result

**Body**

The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet.

#### Block 3: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: Nothing happens when you walk past

Solution: Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH.

**Item 2**

Problem: Serial detects motion but outputs stay off

Solution: The condition is working. Check D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin.

## Step 16

- Stage order: 3
- Stage: Test the Alarm
- Title: Troubleshoot the Circuit

**Description**

If any test failed, isolate input versus output before changing working code.

**Tip**

(none)

#### Block 1: text

**Heading**

How to isolate the fault

**Body**

Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed.

#### Block 2: troubleshooting

**Heading**

If it doesn't work

**Item 1**

Problem: LED never lights

Solution: Confirm anode → 220 Ω resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed.

**Item 2**

Problem: Buzzer silent

Solution: This build uses the three-pin active module. Confirm VCC on the 5 V rail, I/O on D9, and GND on the ground rail. A passive piezo will not sound with digitalWrite.

**Item 3**

Problem: PIR always HIGH

Solution: Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper.

**Item 4**

Problem: PIR never HIGH

Solution: Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk.

## Step 17

- Stage order: 3
- Stage: Test the Alarm
- Title: Final System Test

**Description**

Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.

**Tip**

(none)

#### Block 1: image

**Image key**

motionSensor

**Caption**

Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer.

#### Block 2: test

**Body**

Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once.

#### Block 3: expected

**Heading**

Expected result

**Body**

Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery.

#### Block 4: connections

**Heading**

Pin map you built

**Connections**

- Arduino Uno 5V → PIR VCC (power)
- Arduino Uno GND → PIR GND (ground)
- Arduino Uno D2 → PIR OUT (signal)
- Arduino Uno D8 → 220 Ω resistor leg 1 (signal)
- 220 Ω resistor leg 2 → LED anode (signal)
- LED cathode → Arduino Uno GND (ground)
- Arduino Uno 5V → Buzzer VCC / + (power)
- Arduino Uno D9 → Buzzer I/O / S (signal)
- Arduino Uno GND → Buzzer GND (ground)

## Supporting notes

NOT CURRENTLY SHOWN TO USERS

The app does not render `constants/walkthroughs/supporting-notes.ts`. The text below is that hidden source.

### How the Motion Sensor Works

PIR means passive infrared. The sensor does not emit a beam. It watches for a change in infrared energy, typically a person walking past. When that change is large enough, OUT goes HIGH. When the scene is still, OUT sits LOW. After power-up the module needs about 30 seconds to settle, and OUT can chatter during that time. A HIGH is a motion event, then it returns LOW. It is not proof that someone is still in the room. The alarm lasts as long as the sketch holds the outputs.

### Understand the Components

The Uno is the controller. The PIR is the input. The LED is a silent visual alarm. The 220 Ω resistor limits LED current so D8 is not shorted to ground through the diode. The catalogue buzzer is an active buzzer: a HIGH on its signal pin makes it sound. A passive piezo will not sound with digitalWrite, and this sketch does not call tone(). The breadboard and jumpers are the wiring.

