# Multi-platform project roadmap

Planning only. No project is created or published by this document. A title is not a build. Each project below still needs a real BOM, wiring, code, and checked steps before it can be published.

Hardware names match `docs/COMPONENT_CATALOGUE_EXPANSION_AUDIT.md`. “Add” means the part is not in the live catalogue. “Have” means it is already a catalogue row.

The linked database has 22 projects. Seven have BOMs and steps. Two are published: Motion Sensor Alarm (slug `8`) and Servo Pan-Tilt Camera (slug `18`). Fifteen projects are titles with no BOM and no steps. There is no Raspberry Pi computer project. The only ESP32 project with a BOM is Weather Station (slug `4`), and it is unpublished.

Uncommitted compatibility work was left as it is.

---

## 1. What already exists

| Platform | Project | State | Main hardware already in the catalogue |
| --- | --- | --- | --- |
| Arduino | Blinking LED, Traffic Light, Night Lamp | Steps exist, unpublished | Uno, LED, generic resistor, breadboard, jumpers. Night lamp also uses the LDR. |
| Arduino | Motion Sensor Alarm | Published | Uno, PIR, LED, 220 Ω resistor, buzzer, breadboard, jumpers |
| Arduino | Smart Plant Monitor | Steps exist, unpublished | Uno, DHT22, soil sensor, LDR, generic resistor, OLED |
| Arduino | Servo Pan-Tilt Camera | Published | Uno, SG90, joystick, bracket, breadboard PSU |
| ESP32 | Weather Station | Steps exist, unpublished | ESP32 DevKit, DHT22, BMP280 |
| Either | LED Matrix, RC Car, Home Hub, Line Follower, Door Lock, Thermostat, Greenhouse, Buzzer Piano, Pulse Oximeter, Obstacle Robot, RFID Logger, Drone, CNC Plotter, Voice Assistant, Solar Tracker | Title only | Do not treat these as buildable |

Publishing the unfinished Arduino and ESP32 guides is separate work. It does not require the new catalogue, except where a title’s real parts are missing.

---

## 2. Arduino

### Finish what is already written

Do this before new Arduino projects.

- Keep Blinking LED, Traffic Light, and Night Lamp unpublished until their resistor lines are honest. Traffic Light’s generic resistor ×3 already has a direct `resistor-220` review. The coloured LED rows are optional. The current guide allows three LEDs of one colour.
- Do not start the drone, CNC, or voice-assistant titles. Their hardware is not specific enough.

### Beginner — button and tone, from the Buzzer Piano title

Slug `13` exists and has no BOM. A publishable version needs:

- Have: Uno, breadboard, jumpers.
- Add: tactile button, passive buzzer, 10 kΩ resistor, 220 Ω already exists for any LED.
- Resolve the existing `buzzer` row first. This project needs a passive element if the sketch uses `tone()`.

### Beginner — line follower, from slug `6`

- Have: Uno, L298N, breadboard, jumpers.
- Add: TCRT5000 modules, TT motor. Do not use generic `dc-motor` as if it were a TT motor.
- The existing L298N is a 5 V-logic driver. Confirm the motor supply before writing the steps.

### Intermediate — obstacle robot, from slug `16`

- Have: Uno, HC-SR04, L298N, breadboard, jumpers.
- Add: TT motors. HC-SR04 is a 5 V module. On a later ESP32 port it needs a level check, not a silent swap.

### Intermediate — RFID logger, from slug `17`

- Have: Uno, RC522, breadboard, jumpers.
- RC522 modules are often 3.3 V. Verify the supply before the steps say 5 V. No new part is required if that check passes.

### Advanced — plotter, only after Phase C

- Add: NEMA17 steppers, A4988 or the CNC shield, and a 12 V supply.
- The current CNC title stays unpublished until those parts and the mechanical drawing exist.

---

## 3. ESP32

The existing DevKit row stays the board for projects that match Weather Station. ESP32-CAM, S3, and WROVER are different boards and do not inherit that row.

### Beginner — Weather Station

Already written. Keep it on the DevKit, DHT22, and BMP280 at 3.3 V. No new part.

### Intermediate — battery climate logger

- Have: ESP32 DevKit, DHT22.
- Add: TP4056, 18650 cell, and a checked 3.3 V regulator module if the board is not powered from USB.
- Do not claim deep-sleep current. That figure is not in the catalogue.

### Intermediate — wireless camera

- Add: ESP32-CAM.
- Have: jumper pack, and a USB-UART only if the chosen CAM board needs one. Verify that before calling the DevKit a substitute programmer.
- The existing pan-tilt camera is an Arduino project. Do not reuse its BOM.

### Intermediate — switched outlet or lamp

- Have: ESP32 DevKit, single 5 V relay module.
- Add: 4-channel logic-level shifter if the relay input is not reliable at 3.3 V. Verify the module before omitting the shifter.
- Mains wiring is not a beginner add-on. The steps have to say what stays on the safe side of the relay.

### Advanced — sensor hub

- Have: ESP32 DevKit, DHT22, BMP280, OLED.
- Add: BH1750 or keep the LDR, plus INA219 if battery voltage is shown.
- This replaces the empty Home Automation Hub title. It is still one ESP32 node, not a whole house.

S3 and WROVER projects wait until those boards are real rows and a guide needs the extra USB or PSRAM.

---

## 4. Raspberry Pi

Pico and Pico W are microcontrollers. Pi 4, Pi 5, and Zero 2 W are computers. A HAT, camera, cable, or supply for one of them is not assumed to fit the others.

### Beginner — Pi 4 GPIO LED

- Add: Raspberry Pi 4, Pi 4 USB-C supply, microSD card, 330 Ω or 470 Ω resistor.
- Have: LED, breadboard, jumpers.
- First computer project. One LED on a documented GPIO pin. No HAT.

### Beginner — Pico W blink and wireless status

- Add: Pico W.
- Have: LED, resistor, breadboard, jumpers.
- Not a substitute for the Pi 4 project. Different pin names and no HDMI.

### Intermediate — still camera

- Add: Pi 4, its supply, microSD card, Camera Module 3, and the cable that module uses on a Pi 4.
- Do not put the Zero camera cable or a Pi 5 cable on this BOM.
- Zero 2 W can be a later variant only after its own cable and power are checked.

### Intermediate — Sense HAT room display

- Add: Pi 4, supply, microSD card, Sense HAT.
- The HAT is the sensor and the display. Do not also pretend the DHT22 row covers it.

### Advanced — dashboard

- Add: Pi 4 or Pi 5, the matching supply, microSD card, and the 7" touch display or the 5" HDMI display. Pick one panel and verify it against that Pi.
- Have: nothing else required for a software dashboard.
- Slug `5`, Home Automation Hub, is not this project.

### Advanced — cyberdeck or portable terminal

- Add: Pi 5, Pi 5 supply or a checked USB-C power bank, microSD or the Pi 5 NVMe HAT, an HDMI display, USB keyboard.
- Cooling: Pi 5 Active Cooler if the case needs it.
- This is Phase C. It is not buildable from the current catalogue.

### Advanced — vision

- Add: Pi 5, Camera Module 3, and the Raspberry Pi AI Kit only after the kit’s supported models are checked.
- Do not describe the ESP32-CAM as the same camera.

---

## 5. Suggested order

1. Fix the false aliases, then add the first component batch: the nine resistor values, three capacitors, tactile button, 10 kΩ potentiometer, ESP32-CAM, Pico W, and Raspberry Pi 4.
2. Add the `computers` category before any Pi 4, Pi 5, or Zero 2 W row is inserted.
3. Leave the two published projects as they are.
4. First new guide to write after those parts exist: Pi 4 GPIO LED, or ESP32-CAM still capture. Both are small enough to specify completely.
5. Then the button-and-tone guide and the battery climate logger.
6. Line follower, obstacle robot, and the Sense HAT display come after their missing modules exist.
7. Plotter, cyberdeck, and vision stay last. They depend on Phase C parts and on mechanical or product checks this catalogue does not yet contain.

Existing placeholder titles should be turned into these specific builds or left unpublished. They should not be filled with a generic parts list.
