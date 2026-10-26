# Arduino LED Matrix Maze Game

Exported from the current linked Supabase records (`public.projects`, `public.project_steps`, `public.project_components`, `public.components`, `public.project_requirements`, and `public.project_requirement_constraints`) on 23 October 2026. Step text is the database text, copied in full. This file is not a grade and it does not rewrite the tutorial.

## 1. Project overview

- Slug: 25
- Title: Arduino LED Matrix Maze Game
- Description: Guide a blinking dot through five mazes on an 8×8 LED matrix.
- Overview: An Arduino Uno, an FC-16 MAX7219 matrix, and a five-pin joystick. The stick moves one square at a time. Walls block the way. The Serial Monitor prints each level time.
- Category: displays
- Difficulty: intermediate
- Duration label: 3 hrs
- Sort order: 25
- Published: false
- Cover image key: ledMatrixMaze
- Step count: 18
- Content blocks: 55

### Stages

- Stage 1 (stored stage_sort_order 0): Understand the project. Stored step sort orders: 0, 1, 2.
- Stage 2 (stored stage_sort_order 1): Build the circuit. Stored step sort orders: 3, 4, 5, 6, 7, 8, 9.
- Stage 3 (stored stage_sort_order 2): Prepare the software. Stored step sort orders: 10, 11, 12.
- Stage 4 (stored stage_sort_order 3): Build the game. Stored step sort orders: 13, 14, 15, 16.
- Stage 5 (stored stage_sort_order 4): Test and troubleshoot. Stored step sort orders: 17.

### Project objectives

Stored `learning_objectives`, verbatim:

- Wire an FC-16 MAX7219 matrix and a five-pin joystick to an Arduino Uno
- Share 5 V and ground on a breadboard without a second supply
- Move one dot through five fixed mazes with a deadzone and a debounced button
- Read a level time from millis() in the Serial Monitor

### Local walkthrough comparison

- Learning objectives differ between the local project constant and Supabase.

Local `LED_MATRIX_MAZE_PROJECT.learningObjectives`:

- Wire an FC-16 MAX7219 matrix and a five-pin joystick to an Arduino Uno
- Share 5 V and ground on a breadboard while both modules stay beside it
- Move one dot through five fixed mazes with a deadzone and a debounced button
- Read a level time from millis() in the Serial Monitor

The walkthrough steps below are the Supabase text. The app reads project metadata from Supabase, so the stored objectives above are the ones on the project record.

### Expected finished gameplay

The sentences below are copied from the stored project overview and from the steps that state the finished result. The full steps are in section 3.

Overview: An Arduino Uno, an FC-16 MAX7219 matrix, and a five-pin joystick. The stick moves one square at a time. Walls block the way. The Serial Monitor prints each level time.

From step sort_order 0, “What you are building”, block type `expected`, heading “What done looks like”:

Five mazes can be finished with the stick. The Serial Monitor at 9600 baud prints each level time in milliseconds, and the total when level 5 is finished. The matrix stays readable: walls are steady, the player blinks quickly, and the goal blinks slowly.

From step sort_order 3, “Place the Uno and the breadboard”, block type `expected`, heading “Check”:

The Uno and the breadboard are side by side, USB is unplugged, and neither module header is in the breadboard.

From step sort_order 10, “Install the IDE, the board, and the library”, block type `expected`, heading “Check”:

The board menu says Arduino Uno, a serial port is selected, and Library Manager shows MD_MAX72XX 3.5.1 installed.

From step sort_order 16, “Upload the complete sketch”, block type `expected`, heading “What you should observe”:

One LED flashes in the top-left corner, then the first maze appears. Walls stay lit. One dot blinks quickly on the start square. Another square blinks slowly. That slow square is the goal.

From step sort_order 17, “Play the five levels”, block type `expected`, heading “Finished”:

You can complete all five mazes, read each level time and the final total in the Serial Monitor, and start a new run with the joystick button.

## 2. Complete bill of materials

### Arduino Uno R3

- Catalogue id: `arduino-uno-r3`
- Catalogue description: ATmega328P development board
- Category: microcontrollers
- Quantity: 1
- Sort order: 1
- Requirement role: microcontroller
- Substitution policy: exact
- Constraints: function=development_board; header_profile=uno_r3; logic_level_v=5

### MAX7219 LED Matrix

- Catalogue id: `max7219`
- Catalogue description: Assembled FC-16 MAX7219 8×8 module with a five-pin male input header. With that header on the right, top to bottom is CLK, CS, DIN, GND, VCC. Runs at 5 V. Use the MD_MAX72XX hardware type FC16_HW.
- Category: displays
- Quantity: 1
- Sort order: 2
- Requirement role: display
- Substitution policy: exact
- Constraints: function=led_matrix; interface=spi; physical_form=fc16_male_header; supply_v=5

### Analog Joystick Module

- Catalogue id: `joystick`
- Catalogue description: Preassembled two-axis joystick with five male pins. Usual silk order is GND, +5V, VRx, VRy, SW. The switch connects to ground when pressed. Follow the silk if a board prints a different order.
- Category: modules
- Quantity: 1
- Sort order: 3
- Requirement role: input
- Substitution policy: exact
- Constraints: function=joystick; physical_form=five_pin_male; supply_v=5

### Breadboard

- Catalogue id: `breadboard`
- Catalogue description: Solderless prototyping board
- Category: modules
- Quantity: 1
- Sort order: 4
- Requirement role: breadboard
- Substitution policy: exact
- Constraints: (none stored)

### Jumper Wires

- Catalogue id: `jumper-wires`
- Catalogue description: Dupont jumper wire pack
- Category: modules
- Quantity: 2
- Sort order: 5
- Requirement role: jumper_wires
- Substitution policy: exact
- Constraints: physical_form=male_male

### USB data cable

- Catalogue id: `usb-data-cable`
- Catalogue description: Data-capable USB cable. Match the plug to the board: Arduino Uno R3 uses USB-B, and Espressif ESP32-DevKitC V4 uses Micro-B. A charge-only cable can power a board and still fail upload.
- Category: modules
- Quantity: 1
- Sort order: 6
- Requirement role: usb_cable
- Substitution policy: exact
- Constraints: (none stored)

### USB power source

- Catalogue id: `usb-power-source`
- Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.
- Category: power
- Quantity: 1
- Sort order: 7
- Requirement role: usb_power
- Substitution policy: exact
- Constraints: (none stored)

### Male-to-female jumper wires

- Catalogue id: `jumper-male-female`
- Catalogue description: Dupont wires with a female socket on one end and a male pin on the other. The socket fits a male header pin.
- Category: modules
- Quantity: 10
- Sort order: 8
- Requirement role: header_wires
- Substitution policy: exact
- Constraints: physical_form=male_female

### Catalogue capabilities stored for these parts

These rows are `component_capabilities`. A requirement constraint above is what this project demands. A capability below is what the catalogue row claims.

- `arduino-uno-r3`: adc_full_scale=1023
- `arduino-uno-r3`: board_package=arduino_avr_uno
- `arduino-uno-r3`: function=development_board
- `arduino-uno-r3`: gpio=analog_input
- `arduino-uno-r3`: gpio=digital_input
- `arduino-uno-r3`: gpio=digital_output
- `arduino-uno-r3`: gpio=pwm_output
- `arduino-uno-r3`: header_profile=uno_r3
- `arduino-uno-r3`: logic_level_v=5
- `arduino-uno-r3`: physical_form=uno_r3
- `arduino-uno-r3`: programming_environment=arduino_ide
- `arduino-uno-r3`: supply_v=5
- `joystick`: function=joystick
- `joystick`: physical_form=five_pin_male
- `joystick`: supply_v=5
- `jumper-male-female`: physical_form=male_female
- `jumper-wires`: physical_form=male_male
- `max7219`: function=led_matrix
- `max7219`: interface=spi
- `max7219`: physical_form=fc16_male_header
- `max7219`: supply_v=5

### Connector genders in the current physical layout

The layout draws 2 male-to-male jumpers and 10 male-to-female jumpers.

- `jumper-wires` is the male-to-male Dupont row. Quantity on this project: 2. Both ends are male pins. They join the Uno female headers to breadboard rail holes.
- `jumper-male-female` is the Dupont row with a female socket on one end and a male pin on the other. Quantity on this project: 10. The socket fits a male header pin on the FC-16 or the joystick. The male pin enters an Uno female header or a breadboard rail hole.
- The FC-16 catalogue row is an assembled module with a five-pin male input header.
- The joystick catalogue row is a preassembled module with five male pins.
- The Uno R3 headers are female. The requirement constraint `header_profile=uno_r3` is stored on the Uno line.

## 3. Every tutorial step

Steps are in stored `sort_order`. The heading number is that order plus one. Nothing in a block is shortened.

## Step 1

- Stored sort_order: 0
- Stage order: 0
- Stage: Understand the project
- Title: What you are building

**Description**

A joystick moves one dot through five mazes on an 8×8 LED matrix.

**Tip**

(none)

#### Block 1: components

**Heading**

Parts

- Arduino Uno R3 ×1 — catalogue id `arduino-uno-r3`, illustration `arduino-uno`, owned false
- MAX7219 8×8 LED matrix ×1 — catalogue id `max7219`, illustration `led-matrix`, owned false
- Analog joystick module ×1 — catalogue id `joystick`, illustration `joystick`, owned false
- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard`, owned false
- Male-to-male jumper wires ×2 — catalogue id `jumper-wires`, illustration `jumper-wires`, owned false
- Male-to-female jumper wires ×10 — catalogue id `jumper-male-female`, illustration `jumper-wires`, owned false
- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable`, owned false
- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module`, owned false

#### Block 2: text

**Heading**

The game

**Body**

The player is one blinking LED. Solid LEDs are walls. The goal blinks more slowly than the player. Push the joystick to move one square. A wall or the edge of the grid stops the move. Reaching the goal finishes that level and the next maze appears. The joystick button restarts the current level. After level 5, one LED runs around the border and the button starts again at level 1.

#### Block 3: text

**Heading**

How you will build it

**Body**

The breadboard only shares 5 V and ground. Both modules stay beside it, because their boards are too large to sit in neighbouring breadboard rows. Female-to-male jumpers join each male header pin to the Uno or to a rail. The sketch uses the MD_MAX72XX library with the FC-16 hardware type. The same pin numbers appear in the wiring and in the program.

#### Block 4: expected

**Heading**

What done looks like

**Body**

Five mazes can be finished with the stick. The Serial Monitor at 9600 baud prints each level time in milliseconds, and the total when level 5 is finished. The matrix stays readable: walls are steady, the player blinks quickly, and the goal blinks slowly.

## Step 2

- Stored sort_order: 1
- Stage order: 0
- Stage: Understand the project
- Title: How the display shows the maze

**Description**

One colour has to stand for walls, the player, and the goal.

**Tip**

(none)

#### Block 1: text

**Heading**

Orientation

**Body**

This project uses an assembled FC-16 MAX7219 module. Lay it flat with the LED face up and the five-pin input header on the right. From the top of that header the names are CLK, CS, DIN, GND, and VCC. With the header on the right, row 0 is the top of the grid and column 0 is the left. The library call setPoint(row, column) uses that same order. PCB text may look upside down in this orientation. That is the FC-16 mounting the library expects. The header is not inserted into the breadboard.

#### Block 2: text

**Heading**

What each LED means

**Body**

A wall LED stays on. The goal is on for most of each 800 ms period and off for the rest, so it winks slowly. The player is on for 120 ms and off for 120 ms. If the player stands on the goal, the player blink wins, so the goal does not show through the player. Empty squares stay off. The sketch draws walls first, then the goal, then the player.

#### Block 3: tip

**Body**

The five mazes are written into the sketch. They are not generated at random, so the same level is the same maze every time you play.

## Step 3

- Stored sort_order: 2
- Stage order: 0
- Stage: Understand the project
- Title: Meet the modules

**Description**

Both modules are already assembled. You are matching silk labels, not soldering a header.

**Tip**

(none)

#### Block 1: text

**Heading**

MAX7219 matrix

**Body**

Use an FC-16 style board that already has its 5-pin male input header soldered on, with the 8×8 matrix seated. Some listings are a kit with a loose header. If the header is not soldered, stop. This guide does not include soldering. The Uno has 5 V logic, which meets the MAX7219 high-level input. Do not power this module from the Uno 3.3 V pin. A common module sets the LED current with a resistor near 10 kΩ. The MAX7219 datasheet minimum of 9.53 kΩ allows about 40 mA peak through one segment. The chip lights one row at a time, and intensity 2 is a low duty cycle on the 0 to 15 scale, so the average current of this maze is far below that peak. Do not turn intensity up to 15, and do not light all 64 LEDs at full brightness from a weak USB port.

#### Block 2: text

**Heading**

Joystick

**Body**

Use a preassembled two-axis module with five male pins, the kind sold as KY-023 or a PS2-style stick. The usual silk order is GND, +5V, VRx, VRy, and SW. Each of those pins takes the female socket of a male-to-female jumper. The male end goes to the Uno or to a breadboard rail. VRx and VRy rest near the middle of the 0 to 1023 analog range. SW is a pushbutton that connects to GND when pressed. The sketch uses INPUT_PULLUP, so an unpressed button reads HIGH. If your silk prints a different order, follow the silk and not this sentence.

## Step 4

- Stored sort_order: 3
- Stage order: 1
- Stage: Build the circuit
- Title: Place the Uno and the breadboard

**Description**

The Uno stays beside the breadboard. Its female headers take male jumper pins.

**Tip**

(none)

#### Block 1: text

**Heading**

Placement

**Body**

Put the Uno on the left with the USB socket toward you and the digital header facing the breadboard. Put a breadboard on the right. Leave USB unplugged. Leave both modules off the breadboard. The Uno has one 5 V pin, and both modules need 5 V and GND, so the breadboard power rails are the distribution. Do not twist two jumpers into one header pin.

#### Block 2: wiring

**Heading**

Boards in place

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  }
]
```

**Connections**


**Progressive assembly**

Parts: (none)

Jumpers: (none)

#### Block 3: expected

**Heading**

Check

**Body**

The Uno and the breadboard are side by side, USB is unplugged, and neither module header is in the breadboard.

## Step 5

- Stored sort_order: 4
- Stage order: 1
- Stage: Build the circuit
- Title: Share 5 V and GND

**Description**

Two male-to-male jumpers feed the left breadboard rails from the Uno.

**Tip**

Both jumpers are male-to-male. One end is in the Uno female header. The other end is in the rail.

#### Block 1: text

**Heading**

Rails

**Body**

Jumper the Uno 5 V pin to the left red rail, row 1. Jumper the Uno GND pin beside it to the left blue rail, row 1. Later steps take module power from those rails. The red rail is Uno 5 V. The blue rail is Uno ground. Do not connect the 3.3 V pin.

#### Block 2: wiring

**Heading**

Power into the rails

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  }
]
```

**Connections**


**Progressive assembly**

Parts: (none)

Jumpers: uno-5v, uno-gnd

#### Block 3: warning

**Body**

Keep the matrix intensity at the value in the sketch. Lighting every LED at full brightness can pull more current than a weak USB port will give. This game does not do that.

## Step 6

- Stored sort_order: 5
- Stage order: 1
- Stage: Build the circuit
- Title: Place the matrix and power it

**Description**

The FC-16 lies flat past the far end of the breadboard. Its header stays on the right.

**Tip**

If the silk names the pins in another order, follow the silk. The female socket still goes on the module pin.

#### Block 1: text

**Heading**

Pin order

**Body**

Lay the FC-16 flat beyond the far end of the breadboard, LED face up, with a clear gap so the board does not touch the breadboard. Keep the input header on the right. From the top that header is CLK, CS, DIN, GND, and VCC. Push the female socket of a male-to-female jumper onto GND, and push the male end into the left blue rail. Do the same from VCC to the left red rail. Do not plug the five-pin header into the breadboard. A 20 cm jumper is long enough for this span.

#### Block 2: wiring

**Heading**

Matrix power

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "matrix",
    "illustrationId": "led-matrix",
    "name": "LED Matrix"
  }
]
```

**Connections**

- Arduino Uno 5V → LED Matrix VCC (power)
- Arduino Uno GND → LED Matrix GND (ground)

**Progressive assembly**

Parts: matrix

Jumpers: matrix-gnd, matrix-vcc

## Step 7

- Stored sort_order: 6
- Stage order: 1
- Stage: Build the circuit
- Title: Connect CLK, CS, and DIN

**Description**

Three signal jumpers match the pins in the sketch.

**Tip**

(none)

#### Block 1: text

**Heading**

Signals

**Body**

These three wires are male-to-female and do not enter the breadboard. Fit the female socket onto CLK and the male pin into Uno D13. Fit CS to D10, and DIN to D11. D11 is the data pin the library calls DIN. D13 is the clock. D10 is chip select, also labelled LOAD or CS on some boards.

#### Block 2: wiring

**Heading**

Matrix signals

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "matrix",
    "illustrationId": "led-matrix",
    "name": "LED Matrix"
  }
]
```

**Connections**

- Arduino Uno D13 → LED Matrix CLK (signal)
- Arduino Uno D10 → LED Matrix CS (signal)
- Arduino Uno D11 → LED Matrix DIN (signal)

**Progressive assembly**

Parts: (none)

Jumpers: matrix-clk, matrix-cs, matrix-din

#### Block 3: connections

**Summary**

D13 CLK · D10 CS · D11 DIN

**Connections**

- Arduino Uno D13 → LED Matrix CLK (signal)
- Arduino Uno D10 → LED Matrix CS (signal)
- Arduino Uno D11 → LED Matrix DIN (signal)

## Step 8

- Stored sort_order: 7
- Stage order: 1
- Stage: Build the circuit
- Title: Place the joystick and power it

**Description**

The joystick lies flat at the near end of the breadboard, closer to you than the display.

**Tip**

(none)

#### Block 1: text

**Heading**

Header

**Body**

Lay the joystick flat beyond the near end of the breadboard, on the same side as the USB socket, with a clear gap so it does not touch the breadboard or the matrix. Your hand then stays off the display. The usual header order is GND, +5V, VRx, VRy, and SW. Fit a female socket onto GND and put the male end in the left blue rail. Fit +5V to the left red rail. The stick and the matrix now share the Uno 5 V and ground rails. Do not plug this header into the breadboard.

#### Block 2: wiring

**Heading**

Joystick power

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
    "illustrationId": "joystick",
    "name": "Joystick"
  }
]
```

**Connections**

- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)

**Progressive assembly**

Parts: joystick

Jumpers: joy-gnd, joy-5v

## Step 9

- Stored sort_order: 8
- Stage order: 1
- Stage: Build the circuit
- Title: Connect VRx, VRy, and SW

**Description**

The stick uses two analog pins and one digital pin.

**Tip**

(none)

#### Block 1: text

**Heading**

Signals

**Body**

Fit the female socket onto VRx and the male pin into Uno A0. Fit VRy to A1, and SW to D2. These three wires do not enter the breadboard. Leave the stick centred while you fit the sockets so you do not bend the header.

#### Block 2: wiring

**Heading**

Joystick signals

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
    "illustrationId": "joystick",
    "name": "Joystick"
  }
]
```

**Connections**

- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

**Progressive assembly**

Parts: (none)

Jumpers: joy-x, joy-y, joy-sw

#### Block 3: connections

**Summary**

A0 VRx · A1 VRy · D2 SW

**Connections**

- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

## Step 10

- Stored sort_order: 9
- Stage order: 1
- Stage: Build the circuit
- Title: Check every connection

**Description**

Count 2 male-to-male jumpers and 10 male-to-female jumpers before you plug in USB.

**Tip**

(none)

#### Block 1: wiring

**Heading**

Complete circuit

**Nodes**

```json
[
  {
    "id": "arduino",
    "illustrationId": "arduino-uno",
    "name": "Arduino Uno"
  },
  {
    "id": "matrix",
    "illustrationId": "led-matrix",
    "name": "LED Matrix"
  },
  {
    "id": "joystick",
    "illustrationId": "joystick",
    "name": "Joystick"
  }
]
```

**Connections**

- Arduino Uno 5V → LED Matrix VCC (power)
- Arduino Uno GND → LED Matrix GND (ground)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno D13 → LED Matrix CLK (signal)
- Arduino Uno D10 → LED Matrix CS (signal)
- Arduino Uno D11 → LED Matrix DIN (signal)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 2: connections

**Heading**

Every electrical connection

**Summary**

Matrix DIN D11 · CLK D13 · CS D10 · joystick A0 A1 D2 · shared 5 V and GND

**Connections**

- Arduino Uno 5V → LED Matrix VCC (power)
- Arduino Uno GND → LED Matrix GND (ground)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno D13 → LED Matrix CLK (signal)
- Arduino Uno D10 → LED Matrix CS (signal)
- Arduino Uno D11 → LED Matrix DIN (signal)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

#### Block 3: test

**Heading**

What to verify

**Body**

The female socket is on the module, and the male pin is in the Uno or in a rail. CLK is D13, CS is D10, and DIN is D11. Joystick GND and matrix GND are in the blue rail. Both +5V and VCC are in the red rail. VRx is only A0, VRy is only A1, and SW is only D2. No jumper is in the 3.3 V pin. Neither header is pushed into the breadboard. You have used 2 male-to-male jumpers and 10 male-to-female jumpers. USB is still unplugged.

## Step 11

- Stored sort_order: 10
- Stage order: 2
- Stage: Prepare the software
- Title: Install the IDE, the board, and the library

**Description**

The sketch targets an Arduino Uno and MD_MAX72XX 3.5.1.

**Tip**

(none)

#### Block 1: text

**Heading**

Board

**Body**

Install the Arduino IDE from arduino.cc. Open Tools, Board, Arduino AVR Boards, and choose Arduino Uno. Plug the USB data cable into the Uno and the computer. Open Tools, Port, and select the port that appears. Unplug the cable once: the correct port is the one that disappears. A charge-only cable can light the power LED and still never show a port.

#### Block 2: text

**Heading**

Library

**Body**

Open Tools, Manage Libraries, search for MD_MAX72XX by MajicDesigns, and install version 3.5.1. The sketch includes MD_MAX72xx.h and constructs the display as FC16_HW with data on pin 11, clock on pin 13, and chip select on pin 10. Do not install a different MAX7219 library and expect this sketch to compile.

#### Block 3: expected

**Heading**

Check

**Body**

The board menu says Arduino Uno, a serial port is selected, and Library Manager shows MD_MAX72XX 3.5.1 installed.

## Step 12

- Stored sort_order: 11
- Stage order: 2
- Stage: Prepare the software
- Title: Turn on one LED

**Description**

The setup function lights row 0, column 0, then clears it. That is the matrix test.

**Tip**

(none)

#### Block 1: text

**Heading**

What this does

**Body**

setPoint(0, 0, true) is row 0 and column 0, the top-left LED when the FC-16 input header is on the right. update() sends the buffer to the chip. Intensity is set to 2 before this runs. After a short pause the same LED turns off and level 1 is drawn. You will paste the whole sketch in a later step. This is the part that proves the matrix is alive.

#### Block 2: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
  display.setPoint(0, 0, true);
  display.update();
  delay(300);
  display.clear();
  display.update();
```

#### Block 3: code_explanation

**Body**

If that corner never lights, the usual causes are a blank intensity, CLK and DIN swapped, or the module oriented with the input header on the left. The troubleshooting step at the end covers those cases. Do not add a second display library.

## Step 13

- Stored sort_order: 12
- Stage order: 2
- Stage: Prepare the software
- Title: Read a direction from the stick

**Description**

A centred stick is ignored. A diagonal follows the stronger axis.

**Tip**

(none)

#### Block 1: text

**Heading**

Deadzone

**Body**

Each axis rests near 512. Anything within 80 counts of 512 is centre, so small noise does not move the player. Past that band, the sign of the reading becomes one grid step, either -1 or +1. INVERT_Y starts true, so a rising VRy reading moves toward row 0, the top of the matrix. INVERT_X starts false. If your module faces the other way, you change those two booleans and nothing else.

#### Block 2: text

**Heading**

Diagonals

**Body**

If both axes leave the deadzone, the sketch keeps the axis with the larger distance from 512 and clears the other. If the two distances are equal, it moves neither axis. One deliberate push therefore makes one horizontal or vertical step, not a diagonal jump.

#### Block 3: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
int axisDirection(int raw, bool invert) {
  int offset = raw - JOY_CENTER;
  if (abs(offset) <= JOY_DEADZONE) {
    return 0;
  }
  int sign = offset > 0 ? 1 : -1;
  return invert ? -sign : sign;
}

void stickStep(int xRaw, int yRaw, int &dx, int &dy) {
  dx = axisDirection(xRaw, INVERT_X);
  dy = axisDirection(yRaw, INVERT_Y);
  if (dx != 0 && dy != 0) {
    int xMag = abs(xRaw - JOY_CENTER);
    int yMag = abs(yRaw - JOY_CENTER);
    if (xMag == yMag) {
      dx = 0;
      dy = 0;
    } else if (xMag > yMag) {
      dy = 0;
    } else {
      dx = 0;
    }
  }
}
```

## Step 14

- Stored sort_order: 13
- Stage order: 3
- Stage: Build the game
- Title: Store the player and the walls

**Description**

A wall is a bit in an 8-byte row. The player is two integers.

**Tip**

(none)

#### Block 1: text

**Heading**

Levels

**Body**

WALLS holds five mazes. Each maze is eight bytes, one per row. Bit 0 of a byte is column 0, the left column. A set bit is a wall. START_X and START_Y are the open square where the player appears. GOAL_X and GOAL_Y are the open square the player has to reach. beginLevel copies the start of the chosen maze into playerX and playerY and prints the level number. tryStep refuses a move that would leave the 8×8 grid or land on a wall.

#### Block 2: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
void beginLevel(int index) {
  levelIndex = index;
  playerX = START_X[index];
  playerY = START_Y[index];
  phase = 'p';
  levelStarted = millis();
  holdX = 0;
  holdY = 0;
  holdSince = levelStarted;
  lastMove = 0;
  Serial.print("Level ");
  Serial.println(index + 1);
}

bool tryStep(int dx, int dy) {
  if (dx == 0 && dy == 0) {
    return false;
  }
  int nextX = playerX + dx;
  int nextY = playerY + dy;
  if (wallAt(levelIndex, nextX, nextY)) {
    return false;
  }
  playerX = nextX;
  playerY = nextY;
  return true;
}
```

#### Block 3: code_explanation

**Body**

The five mazes get harder, and each one has a route from its start to its goal. The button calls beginLevel again for the maze you are already on, which puts the player back on the start square.

## Step 15

- Stored sort_order: 14
- Stage order: 3
- Stage: Build the game
- Title: Move one square at a time

**Description**

Holding the stick repeats. A tap does not fire twice.

**Tip**

(none)

#### Block 1: text

**Heading**

Repeat

**Body**

The first time the stick leaves centre, the player moves one square. Holding the same direction does nothing until 280 ms have passed, then it repeats every 180 ms. Releasing the stick clears that hold, so the next push moves immediately. takeMove uses unsigned subtraction, so a millis() rollover does not stick the player in place. The loop never calls delay, so the button and the blink stay responsive while you hold the stick.

#### Block 2: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
bool takeMove(int dx, int dy, unsigned long now) {
  if (dx == 0 && dy == 0) {
    holdX = 0;
    holdY = 0;
    holdSince = now;
    return false;
  }
  if (dx != holdX || dy != holdY) {
    holdX = dx;
    holdY = dy;
    holdSince = now;
    lastMove = now;
    return true;
  }
  if (now - holdSince >= MOVE_ARM_MS && now - lastMove >= MOVE_REPEAT_MS) {
    lastMove = now;
    return true;
  }
  return false;
}
```

#### Block 3: text

**Heading**

Drawing

**Body**

drawPlay clears the matrix and walks every square. A wall turns on. The goal replaces that decision with a slow blink. The player replaces both with a fast blink. setPoint uses the row as the first argument and the column as the second, matching the FC-16 orientation from the first stage.

#### Block 4: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
void drawPlay(unsigned long now) {
  display.clear();
  for (int y = 0; y < GRID; y++) {
    for (int x = 0; x < GRID; x++) {
      bool on = wallAt(levelIndex, x, y);
      if (x == GOAL_X[levelIndex] && y == GOAL_Y[levelIndex]) {
        on = (now % 800) < 600;
      }
      if (x == playerX && y == playerY) {
        on = (now % 240) < 120;
      }
      if (on) {
        display.setPoint(y, x, true);
      }
    }
  }
  display.update();
}
```

## Step 16

- Stored sort_order: 15
- Stage order: 3
- Stage: Build the game
- Title: Finish a level and keep the time

**Description**

millis() measures the level. The matrix does not try to draw digits.

**Tip**

(none)

#### Block 1: text

**Heading**

Goal

**Body**

When a move lands on the goal, completeLevel prints the level number and the milliseconds since that level started. The player is already on the goal square, so the 700 ms success flash is that one square, not two separate LEDs. Levels 1 to 4 then load the next maze. Level 5 prints the total milliseconds since the run started and changes to the border chase. The success pause is inside the total and outside the next level’s own timer. There is no second screen for the clock. The Serial Monitor at 9600 baud is the timer. The subtraction is unsigned, so it stays correct when millis() rolls over.

#### Block 2: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
void completeLevel(unsigned long now) {
  Serial.print("Level ");
  Serial.print(levelIndex + 1);
  Serial.print(" complete in ");
  Serial.print(now - levelStarted);
  Serial.println(" ms");
  if (levelIndex >= LEVEL_COUNT - 1) {
    phase = 'f';
    Serial.print("All five levels in ");
    Serial.print(now - runStarted);
    Serial.println(" ms. Press the joystick button to play again.");
  } else {
    phase = 's';
    successStarted = now;
  }
}
```

#### Block 3: text

**Heading**

Button

**Body**

SW uses the internal pull-up. The sketch treats LOW as pressed. readPress counts a press only after it has stayed down for 40 ms, and holding the button does not retrigger. During a level, the press restarts that level. During the success flash, the next maze is not loaded yet, so the same press restarts the level you just finished. During the final chase, the press returns to level 1 and starts the total time again.

#### Block 4: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
bool readPress(unsigned long now) {
  bool rawDown = digitalRead(SW_PIN) == LOW;
  if (rawDown == buttonDown) {
    buttonChanged = now;
    return false;
  }
  if (now - buttonChanged < BUTTON_DEBOUNCE_MS) {
    return false;
  }
  buttonDown = rawDown;
  buttonChanged = now;
  return rawDown;
}
```

#### Block 5: tip

**Body**

Open the Serial Monitor after upload. A centred stick prints nothing. An accepted step prints move, the direction, and the raw analog pair.

## Step 17

- Stored sort_order: 16
- Stage order: 3
- Stage: Build the game
- Title: Upload the complete sketch

**Description**

This is the whole program. It replaces anything already in the editor.

**Tip**

(none)

#### Block 1: code

**Language**

Arduino

**Filename**

led_matrix_maze.ino

**Libraries**

[
  "MD_MAX72XX 3.5.1"
]

**Code**

```cpp
#include <MD_MAX72xx.h>

const int DIN_PIN = 11;
const int CLK_PIN = 13;
const int CS_PIN = 10;
const int X_PIN = A0;
const int Y_PIN = A1;
const int SW_PIN = 2;

const int JOY_CENTER = 512;
const int JOY_DEADZONE = 80;
const bool INVERT_X = false;
const bool INVERT_Y = true;
const unsigned long MOVE_ARM_MS = 280;
const unsigned long MOVE_REPEAT_MS = 180;
const unsigned long BUTTON_DEBOUNCE_MS = 40;
const unsigned long SUCCESS_MS = 700;
const int GRID = 8;
const int LEVEL_COUNT = 5;

MD_MAX72XX display(MD_MAX72XX::FC16_HW, DIN_PIN, CLK_PIN, CS_PIN, 1);

const uint8_t WALLS[LEVEL_COUNT][GRID] = {
  { 0xff, 0x81, 0xbd, 0x81, 0xbd, 0x81, 0x81, 0xff },
  { 0xff, 0x81, 0x9f, 0x81, 0xbd, 0x85, 0xa5, 0xff },
  { 0xff, 0x85, 0xb5, 0xa5, 0xad, 0xa1, 0xaf, 0xff },
  { 0xff, 0x91, 0xd5, 0x95, 0xb5, 0x85, 0xbd, 0xff },
  { 0xff, 0x95, 0xd5, 0x91, 0xb7, 0xa1, 0x8d, 0xff }
};
const uint8_t START_X[LEVEL_COUNT] = { 1, 1, 1, 5, 1 };
const uint8_t START_Y[LEVEL_COUNT] = { 1, 1, 1, 1, 1 };
const uint8_t GOAL_X[LEVEL_COUNT] = { 6, 6, 6, 1, 5 };
const uint8_t GOAL_Y[LEVEL_COUNT] = { 6, 6, 6, 6, 6 };

int levelIndex = 0;
int playerX = 0;
int playerY = 0;
char phase = 'p';
unsigned long levelStarted = 0;
unsigned long runStarted = 0;
unsigned long successStarted = 0;
int holdX = 0;
int holdY = 0;
unsigned long holdSince = 0;
unsigned long lastMove = 0;
bool buttonDown = false;
unsigned long buttonChanged = 0;

// region: direction
int axisDirection(int raw, bool invert) {
  int offset = raw - JOY_CENTER;
  if (abs(offset) <= JOY_DEADZONE) {
    return 0;
  }
  int sign = offset > 0 ? 1 : -1;
  return invert ? -sign : sign;
}

void stickStep(int xRaw, int yRaw, int &dx, int &dy) {
  dx = axisDirection(xRaw, INVERT_X);
  dy = axisDirection(yRaw, INVERT_Y);
  if (dx != 0 && dy != 0) {
    int xMag = abs(xRaw - JOY_CENTER);
    int yMag = abs(yRaw - JOY_CENTER);
    if (xMag == yMag) {
      dx = 0;
      dy = 0;
    } else if (xMag > yMag) {
      dy = 0;
    } else {
      dx = 0;
    }
  }
}
// end: direction

bool wallAt(int index, int x, int y) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) {
    return true;
  }
  return (WALLS[index][y] & (1 << x)) != 0;
}

// region: player
void beginLevel(int index) {
  levelIndex = index;
  playerX = START_X[index];
  playerY = START_Y[index];
  phase = 'p';
  levelStarted = millis();
  holdX = 0;
  holdY = 0;
  holdSince = levelStarted;
  lastMove = 0;
  Serial.print("Level ");
  Serial.println(index + 1);
}

bool tryStep(int dx, int dy) {
  if (dx == 0 && dy == 0) {
    return false;
  }
  int nextX = playerX + dx;
  int nextY = playerY + dy;
  if (wallAt(levelIndex, nextX, nextY)) {
    return false;
  }
  playerX = nextX;
  playerY = nextY;
  return true;
}
// end: player

bool takeMove(int dx, int dy, unsigned long now) {
  if (dx == 0 && dy == 0) {
    holdX = 0;
    holdY = 0;
    holdSince = now;
    return false;
  }
  if (dx != holdX || dy != holdY) {
    holdX = dx;
    holdY = dy;
    holdSince = now;
    lastMove = now;
    return true;
  }
  if (now - holdSince >= MOVE_ARM_MS && now - lastMove >= MOVE_REPEAT_MS) {
    lastMove = now;
    return true;
  }
  return false;
}

bool readPress(unsigned long now) {
  bool rawDown = digitalRead(SW_PIN) == LOW;
  if (rawDown == buttonDown) {
    buttonChanged = now;
    return false;
  }
  if (now - buttonChanged < BUTTON_DEBOUNCE_MS) {
    return false;
  }
  buttonDown = rawDown;
  buttonChanged = now;
  return rawDown;
}

// region: draw
void drawPlay(unsigned long now) {
  display.clear();
  for (int y = 0; y < GRID; y++) {
    for (int x = 0; x < GRID; x++) {
      bool on = wallAt(levelIndex, x, y);
      if (x == GOAL_X[levelIndex] && y == GOAL_Y[levelIndex]) {
        on = (now % 800) < 600;
      }
      if (x == playerX && y == playerY) {
        on = (now % 240) < 120;
      }
      if (on) {
        display.setPoint(y, x, true);
      }
    }
  }
  display.update();
}
// end: draw

void drawSuccess(unsigned long now) {
  display.clear();
  bool flash = (now / 100) % 2 == 0;
  if (flash) {
    display.setPoint(playerY, playerX, true);
    display.setPoint(GOAL_Y[levelIndex], GOAL_X[levelIndex], true);
  }
  display.update();
}

void drawFinished(unsigned long now) {
  display.clear();
  int step = (int)((now / 80) % 28);
  int cursor = 0;
  for (int x = 0; x < GRID; x++) {
    if (cursor == step) {
      display.setPoint(0, x, true);
    }
    cursor++;
  }
  for (int y = 1; y < GRID; y++) {
    if (cursor == step) {
      display.setPoint(y, GRID - 1, true);
    }
    cursor++;
  }
  for (int x = GRID - 2; x >= 0; x--) {
    if (cursor == step) {
      display.setPoint(GRID - 1, x, true);
    }
    cursor++;
  }
  for (int y = GRID - 2; y >= 1; y--) {
    if (cursor == step) {
      display.setPoint(y, 0, true);
    }
    cursor++;
  }
  display.update();
}

void completeLevel(unsigned long now) {
  Serial.print("Level ");
  Serial.print(levelIndex + 1);
  Serial.print(" complete in ");
  Serial.print(now - levelStarted);
  Serial.println(" ms");
  if (levelIndex >= LEVEL_COUNT - 1) {
    phase = 'f';
    Serial.print("All five levels in ");
    Serial.print(now - runStarted);
    Serial.println(" ms. Press the joystick button to play again.");
  } else {
    phase = 's';
    successStarted = now;
  }
}

void setup() {
  pinMode(SW_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  display.begin();
  display.control(MD_MAX72XX::INTENSITY, 2);
  display.clear();
  // region: one-led
  display.setPoint(0, 0, true);
  display.update();
  delay(300);
  display.clear();
  display.update();
  // end: one-led
  runStarted = millis();
  buttonChanged = runStarted;
  beginLevel(0);
}

void loop() {
  unsigned long now = millis();
  if (readPress(now)) {
    if (phase == 'f') {
      runStarted = now;
      beginLevel(0);
      Serial.println("Back to level 1.");
    } else {
      beginLevel(levelIndex);
      Serial.println("Level restarted.");
    }
    return;
  }

  if (phase == 's') {
    drawSuccess(now);
    if (now - successStarted >= SUCCESS_MS) {
      beginLevel(levelIndex + 1);
    }
    return;
  }

  if (phase == 'f') {
    drawFinished(now);
    return;
  }

  int xRaw = analogRead(X_PIN);
  int yRaw = analogRead(Y_PIN);
  int dx = 0;
  int dy = 0;
  stickStep(xRaw, yRaw, dx, dy);
  if (takeMove(dx, dy, now) && tryStep(dx, dy)) {
    Serial.print("move ");
    Serial.print(dx);
    Serial.print(",");
    Serial.print(dy);
    Serial.print(" raw ");
    Serial.print(xRaw);
    Serial.print(",");
    Serial.println(yRaw);
    if (playerX == GOAL_X[levelIndex] && playerY == GOAL_Y[levelIndex]) {
      completeLevel(now);
    }
  }
  if (phase == 'p') {
    drawPlay(now);
  }
}
```

#### Block 2: text

**Heading**

Upload

**Body**

Create a sketch named led_matrix_maze and replace its contents with the program above. Board is Arduino Uno. Port is the Uno port. Click Upload. When the IDE finishes, open the Serial Monitor and set it to 9600 baud. The corner LED should flash once, then level 1 should appear and the monitor should print Level 1.

#### Block 3: expected

**Heading**

What you should observe

**Body**

One LED flashes in the top-left corner, then the first maze appears. Walls stay lit. One dot blinks quickly on the start square. Another square blinks slowly. That slow square is the goal.

## Step 18

- Stored sort_order: 17
- Stage order: 4
- Stage: Test and troubleshoot
- Title: Play the five levels

**Description**

Finish each maze, then use the button and the two invert lines if a control feels backwards.

**Tip**

(none)

#### Block 1: test

**Heading**

Play

**Body**

Move to the slow square on each maze. The monitor prints a time in milliseconds when a level completes. After level 5, one LED runs around the border and the monitor prints the total. Press the stick button to return to level 1. During an earlier level, the same button puts you back on that level’s start square.

#### Block 2: troubleshooting

**Heading**

If something is wrong

**Item 1**

Problem: The matrix stays dark

Solution: Confirm MD_MAX72XX 3.5.1, FC16_HW, DIN on D11, CLK on D13, and CS on D10. The female socket is on the matrix pin and the male pin is in the Uno. VCC must come from the red rail and GND from the blue rail. Intensity stays at 2. A charge-only USB cable can power the Uno LED and still fail to upload.

**Item 2**

Problem: The maze is rotated or mirrored

Solution: Turn the module so the LED face is up and the input header is on the right, top to bottom CLK, CS, DIN, GND, VCC. Row 0 is then the top. If the silk order differs, move the jumpers to match the silk rather than this list. Do not push the header into the breadboard.

**Item 3**

Problem: The stick moves the wrong way

Solution: Change INVERT_X or INVERT_Y in the sketch and upload again. Leave the pin numbers alone. A centred stick should print nothing and should not move the player.

**Item 4**

Problem: The player jitters or runs away

Solution: Leave the deadzone at 80 and the repeat at 280 ms then 180 ms. A noisy module that never rests near 512 needs a larger JOY_DEADZONE, not a deleted check. Do not add delay() inside loop.

**Item 5**

Problem: The button restarts more than once

Solution: SW must go to D2 and the pin mode must stay INPUT_PULLUP. The press is accepted only after 40 ms and only on the change to pressed. Holding the button should produce one restart.

#### Block 3: expected

**Heading**

Finished

**Body**

You can complete all five mazes, read each level time and the final total in the Serial Monitor, and start a new run with the joystick button.

## 4. Firmware

The local authoritative sketch appears once, unchanged, inside the Supabase code blocks. The same text is repeated here.

### Library dependencies named by the sketch and the compile record

- Sketch include: `MD_MAX72xx.h`
- Compile-record library: MD_MAX72XX 3.5.1
- Arduino CLI: arduino-cli  Version: 1.5.1 Commit: 01f3d4f2b Date: 2026-06-05T10:22:12Z
- Core arduino:avr: 1.8.7
- Core esp32:esp32: 3.3.12
- Library Adafruit BME280 Library: 2.3.0
- Library Adafruit Unified Sensor: 1.1.15
- Library Adafruit BusIO: 1.17.4
- Library Servo: 1.3.0
- Library MD_MAX72XX: 3.5.1

### Compilation details

- Result: passed
- Board: Arduino Uno R3
- FQBN: `arduino:avr:uno`
- Sketch checksum: `7da2ab22`
- The compile record says a checksum match means that sketch compiled. It is not a hardware test.

### Authoritative sketch

```cpp
#include <MD_MAX72xx.h>

const int DIN_PIN = 11;
const int CLK_PIN = 13;
const int CS_PIN = 10;
const int X_PIN = A0;
const int Y_PIN = A1;
const int SW_PIN = 2;

const int JOY_CENTER = 512;
const int JOY_DEADZONE = 80;
const bool INVERT_X = false;
const bool INVERT_Y = true;
const unsigned long MOVE_ARM_MS = 280;
const unsigned long MOVE_REPEAT_MS = 180;
const unsigned long BUTTON_DEBOUNCE_MS = 40;
const unsigned long SUCCESS_MS = 700;
const int GRID = 8;
const int LEVEL_COUNT = 5;

MD_MAX72XX display(MD_MAX72XX::FC16_HW, DIN_PIN, CLK_PIN, CS_PIN, 1);

const uint8_t WALLS[LEVEL_COUNT][GRID] = {
  { 0xff, 0x81, 0xbd, 0x81, 0xbd, 0x81, 0x81, 0xff },
  { 0xff, 0x81, 0x9f, 0x81, 0xbd, 0x85, 0xa5, 0xff },
  { 0xff, 0x85, 0xb5, 0xa5, 0xad, 0xa1, 0xaf, 0xff },
  { 0xff, 0x91, 0xd5, 0x95, 0xb5, 0x85, 0xbd, 0xff },
  { 0xff, 0x95, 0xd5, 0x91, 0xb7, 0xa1, 0x8d, 0xff }
};
const uint8_t START_X[LEVEL_COUNT] = { 1, 1, 1, 5, 1 };
const uint8_t START_Y[LEVEL_COUNT] = { 1, 1, 1, 1, 1 };
const uint8_t GOAL_X[LEVEL_COUNT] = { 6, 6, 6, 1, 5 };
const uint8_t GOAL_Y[LEVEL_COUNT] = { 6, 6, 6, 6, 6 };

int levelIndex = 0;
int playerX = 0;
int playerY = 0;
char phase = 'p';
unsigned long levelStarted = 0;
unsigned long runStarted = 0;
unsigned long successStarted = 0;
int holdX = 0;
int holdY = 0;
unsigned long holdSince = 0;
unsigned long lastMove = 0;
bool buttonDown = false;
unsigned long buttonChanged = 0;

// region: direction
int axisDirection(int raw, bool invert) {
  int offset = raw - JOY_CENTER;
  if (abs(offset) <= JOY_DEADZONE) {
    return 0;
  }
  int sign = offset > 0 ? 1 : -1;
  return invert ? -sign : sign;
}

void stickStep(int xRaw, int yRaw, int &dx, int &dy) {
  dx = axisDirection(xRaw, INVERT_X);
  dy = axisDirection(yRaw, INVERT_Y);
  if (dx != 0 && dy != 0) {
    int xMag = abs(xRaw - JOY_CENTER);
    int yMag = abs(yRaw - JOY_CENTER);
    if (xMag == yMag) {
      dx = 0;
      dy = 0;
    } else if (xMag > yMag) {
      dy = 0;
    } else {
      dx = 0;
    }
  }
}
// end: direction

bool wallAt(int index, int x, int y) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) {
    return true;
  }
  return (WALLS[index][y] & (1 << x)) != 0;
}

// region: player
void beginLevel(int index) {
  levelIndex = index;
  playerX = START_X[index];
  playerY = START_Y[index];
  phase = 'p';
  levelStarted = millis();
  holdX = 0;
  holdY = 0;
  holdSince = levelStarted;
  lastMove = 0;
  Serial.print("Level ");
  Serial.println(index + 1);
}

bool tryStep(int dx, int dy) {
  if (dx == 0 && dy == 0) {
    return false;
  }
  int nextX = playerX + dx;
  int nextY = playerY + dy;
  if (wallAt(levelIndex, nextX, nextY)) {
    return false;
  }
  playerX = nextX;
  playerY = nextY;
  return true;
}
// end: player

bool takeMove(int dx, int dy, unsigned long now) {
  if (dx == 0 && dy == 0) {
    holdX = 0;
    holdY = 0;
    holdSince = now;
    return false;
  }
  if (dx != holdX || dy != holdY) {
    holdX = dx;
    holdY = dy;
    holdSince = now;
    lastMove = now;
    return true;
  }
  if (now - holdSince >= MOVE_ARM_MS && now - lastMove >= MOVE_REPEAT_MS) {
    lastMove = now;
    return true;
  }
  return false;
}

bool readPress(unsigned long now) {
  bool rawDown = digitalRead(SW_PIN) == LOW;
  if (rawDown == buttonDown) {
    buttonChanged = now;
    return false;
  }
  if (now - buttonChanged < BUTTON_DEBOUNCE_MS) {
    return false;
  }
  buttonDown = rawDown;
  buttonChanged = now;
  return rawDown;
}

// region: draw
void drawPlay(unsigned long now) {
  display.clear();
  for (int y = 0; y < GRID; y++) {
    for (int x = 0; x < GRID; x++) {
      bool on = wallAt(levelIndex, x, y);
      if (x == GOAL_X[levelIndex] && y == GOAL_Y[levelIndex]) {
        on = (now % 800) < 600;
      }
      if (x == playerX && y == playerY) {
        on = (now % 240) < 120;
      }
      if (on) {
        display.setPoint(y, x, true);
      }
    }
  }
  display.update();
}
// end: draw

void drawSuccess(unsigned long now) {
  display.clear();
  bool flash = (now / 100) % 2 == 0;
  if (flash) {
    display.setPoint(playerY, playerX, true);
    display.setPoint(GOAL_Y[levelIndex], GOAL_X[levelIndex], true);
  }
  display.update();
}

void drawFinished(unsigned long now) {
  display.clear();
  int step = (int)((now / 80) % 28);
  int cursor = 0;
  for (int x = 0; x < GRID; x++) {
    if (cursor == step) {
      display.setPoint(0, x, true);
    }
    cursor++;
  }
  for (int y = 1; y < GRID; y++) {
    if (cursor == step) {
      display.setPoint(y, GRID - 1, true);
    }
    cursor++;
  }
  for (int x = GRID - 2; x >= 0; x--) {
    if (cursor == step) {
      display.setPoint(GRID - 1, x, true);
    }
    cursor++;
  }
  for (int y = GRID - 2; y >= 1; y--) {
    if (cursor == step) {
      display.setPoint(y, 0, true);
    }
    cursor++;
  }
  display.update();
}

void completeLevel(unsigned long now) {
  Serial.print("Level ");
  Serial.print(levelIndex + 1);
  Serial.print(" complete in ");
  Serial.print(now - levelStarted);
  Serial.println(" ms");
  if (levelIndex >= LEVEL_COUNT - 1) {
    phase = 'f';
    Serial.print("All five levels in ");
    Serial.print(now - runStarted);
    Serial.println(" ms. Press the joystick button to play again.");
  } else {
    phase = 's';
    successStarted = now;
  }
}

void setup() {
  pinMode(SW_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  display.begin();
  display.control(MD_MAX72XX::INTENSITY, 2);
  display.clear();
  // region: one-led
  display.setPoint(0, 0, true);
  display.update();
  delay(300);
  display.clear();
  display.update();
  // end: one-led
  runStarted = millis();
  buttonChanged = runStarted;
  beginLevel(0);
}

void loop() {
  unsigned long now = millis();
  if (readPress(now)) {
    if (phase == 'f') {
      runStarted = now;
      beginLevel(0);
      Serial.println("Back to level 1.");
    } else {
      beginLevel(levelIndex);
      Serial.println("Level restarted.");
    }
    return;
  }

  if (phase == 's') {
    drawSuccess(now);
    if (now - successStarted >= SUCCESS_MS) {
      beginLevel(levelIndex + 1);
    }
    return;
  }

  if (phase == 'f') {
    drawFinished(now);
    return;
  }

  int xRaw = analogRead(X_PIN);
  int yRaw = analogRead(Y_PIN);
  int dx = 0;
  int dy = 0;
  stickStep(xRaw, yRaw, dx, dy);
  if (takeMove(dx, dy, now) && tryStep(dx, dy)) {
    Serial.print("move ");
    Serial.print(dx);
    Serial.print(",");
    Serial.print(dy);
    Serial.print(" raw ");
    Serial.print(xRaw);
    Serial.print(",");
    Serial.println(yRaw);
    if (playerX == GOAL_X[levelIndex] && playerY == GOAL_Y[levelIndex]) {
      completeLevel(now);
    }
  }
  if (phase == 'p') {
    drawPlay(now);
  }
}
```

## 5. Supporting educational material

### Shown to users

The walkthrough renders the step blocks in section 3. Wiring blocks open the schematic and the physical breadboard diagram. Component and node `illustrationId` values select catalogue artwork.

Illustration ids referenced by the stored steps: `arduino-uno`, `led-matrix`, `joystick`, `breadboard`, `jumper-wires`, `usb-cable`, `generic-module`.

### Not currently shown to users

The app does not render `constants/walkthroughs/supporting-notes.ts`. The text below is that hidden source for slug 25.

### FC-16 current and orientation

The MAX7219 datasheet allows 4.0 V to 5.5 V and sets segment current from RSET. The minimum RSET of 9.53 kΩ is about 40 mA per segment. A common FC-16 module uses a resistor near 10 kΩ, so one fully lit row of eight LEDs can approach a few hundred milliamps before the Uno’s own draw. USB at 500 mA is a reasonable supply only while intensity stays low and the maze does not light all 64 LEDs. MajicDesigns documents the FC-16 with the DIN side on the right and the pin order CLK, CS, DIN, GND, VCC from the top. PCB text may look upside down in that orientation. Row 0 of MD_MAX72XX::FC16_HW is the top of that view. Another MAX7219 board can use a different header order, so this project names the FC-16 module rather than every board sold as a matrix.

The coordinate list in section 6 is the local diagram source. Learners see the drawing, not this coordinate list.

## 6. Hardware and diagrams

### Schematic connections

These are `LED_MATRIX_MAZE_CONNECTIONS`. The same pairs are stored on the wiring blocks above.

- Arduino Uno 5V → LED Matrix VCC (power)
- Arduino Uno GND → LED Matrix GND (ground)
- Arduino Uno 5V → Joystick +5V (power)
- Arduino Uno GND → Joystick GND (ground)
- Arduino Uno D13 → LED Matrix CLK (signal)
- Arduino Uno D10 → LED Matrix CS (signal)
- Arduino Uno D11 → LED Matrix DIN (signal)
- Arduino Uno A0 → Joystick VRx (signal)
- Arduino Uno A1 → Joystick VRy (signal)
- Arduino Uno D2 → Joystick SW (signal)

### Schematic elements

Shown by the wiring diagram. Text below is the local element record.

#### Arduino Uno

- Id: `arduino`
- Kind: arduino-uno
- Catalogue id: `arduino-uno-r3`
- Role: Reads the joystick and drives the LED matrix.
- Orientation: (none)
- Ports: 5V (`5v`), GND (`gnd`), D13 (`d13`), D11 (`d11`), D10 (`d10`), D2 (`d2`), A0 (`a0`), A1 (`a1`)

#### Breadboard

- Id: `breadboard`
- Kind: breadboard
- Catalogue id: `breadboard`
- Role: Shares Uno 5 V and GND with the matrix and the joystick.
- Orientation: (none)
- Ports: + (`plus`), − (`minus`)

#### LED Matrix

- Id: `matrix`
- Kind: led-matrix
- Catalogue id: `max7219`
- Role: Shows the maze, the player, and the goal.
- Orientation: Lies flat off the breadboard, LED face up. Input header on the right, top to bottom CLK, CS, DIN, GND, VCC.
- Ports: CLK (`clk`), CS (`cs`), DIN (`din`), GND (`gnd`), VCC (`vcc`)

#### Joystick

- Id: `joystick`
- Kind: joystick
- Catalogue id: `joystick`
- Role: Moves the player. The stick button restarts the level.
- Orientation: Lies flat off the breadboard, nearer than the matrix. Male header GND, +5V, VRx, VRy, SW. Follow the silk if a clone prints a different order.
- Ports: GND (`gnd`), +5V (`vcc`), VRx (`vrx`), VRy (`vry`), SW (`sw`)

### Physical layout

Breadboard rows: 17. Rail split after row: 15. Fixtures: arduino. Leads seated in the breadboard: 0.

Jumpers:

- `uno-5v` male-male: {"kind":"module","elementId":"arduino","portId":"5v"} → {"kind":"rail","side":"left","polarity":"plus","row":1}
- `uno-gnd` male-male: {"kind":"module","elementId":"arduino","portId":"gnd"} → {"kind":"rail","side":"left","polarity":"minus","row":1}
- `matrix-gnd` male-female: {"kind":"module","elementId":"matrix","portId":"gnd"} → {"kind":"rail","side":"left","polarity":"minus","row":5}
- `matrix-vcc` male-female: {"kind":"module","elementId":"matrix","portId":"vcc"} → {"kind":"rail","side":"left","polarity":"plus","row":5}
- `matrix-clk` male-female: {"kind":"module","elementId":"matrix","portId":"clk"} → {"kind":"module","elementId":"arduino","portId":"d13"}
- `matrix-cs` male-female: {"kind":"module","elementId":"matrix","portId":"cs"} → {"kind":"module","elementId":"arduino","portId":"d10"}
- `matrix-din` male-female: {"kind":"module","elementId":"matrix","portId":"din"} → {"kind":"module","elementId":"arduino","portId":"d11"}
- `joy-gnd` male-female: {"kind":"module","elementId":"joystick","portId":"gnd"} → {"kind":"rail","side":"left","polarity":"minus","row":8}
- `joy-5v` male-female: {"kind":"module","elementId":"joystick","portId":"vcc"} → {"kind":"rail","side":"left","polarity":"plus","row":8}
- `joy-x` male-female: {"kind":"module","elementId":"joystick","portId":"vrx"} → {"kind":"module","elementId":"arduino","portId":"a0"}
- `joy-y` male-female: {"kind":"module","elementId":"joystick","portId":"vry"} → {"kind":"module","elementId":"arduino","portId":"a1"}
- `joy-sw` male-female: {"kind":"module","elementId":"joystick","portId":"sw"} → {"kind":"module","elementId":"arduino","portId":"d2"}

Module placements:

```json
[
  {
    "elementId": "arduino",
    "x": -210,
    "y": 16,
    "width": 168,
    "height": 338,
    "pins": [
      {
        "portId": "5v",
        "label": "5V",
        "x": -194,
        "y": 108
      },
      {
        "portId": "gnd",
        "label": "GND",
        "x": -194,
        "y": 124
      },
      {
        "portId": "a0",
        "label": "A0",
        "x": -194,
        "y": 186
      },
      {
        "portId": "a1",
        "label": "A1",
        "x": -194,
        "y": 202
      },
      {
        "portId": "d13",
        "label": "D13",
        "x": -58,
        "y": 108
      },
      {
        "portId": "d11",
        "label": "D11",
        "x": -58,
        "y": 140
      },
      {
        "portId": "d10",
        "label": "D10",
        "x": -58,
        "y": 156
      },
      {
        "portId": "d2",
        "label": "D2",
        "x": -58,
        "y": 298
      }
    ],
    "dots": [
      {
        "x": -58,
        "y": 44
      },
      {
        "x": -58,
        "y": 60
      },
      {
        "x": -58,
        "y": 76
      },
      {
        "x": -58,
        "y": 92
      },
      {
        "x": -58,
        "y": 108
      },
      {
        "x": -58,
        "y": 124
      },
      {
        "x": -58,
        "y": 140
      },
      {
        "x": -58,
        "y": 156
      },
      {
        "x": -58,
        "y": 172
      },
      {
        "x": -58,
        "y": 188
      },
      {
        "x": -58,
        "y": 218
      },
      {
        "x": -58,
        "y": 234
      },
      {
        "x": -58,
        "y": 250
      },
      {
        "x": -58,
        "y": 266
      },
      {
        "x": -58,
        "y": 282
      },
      {
        "x": -58,
        "y": 298
      },
      {
        "x": -58,
        "y": 314
      },
      {
        "x": -58,
        "y": 330
      },
      {
        "x": -194,
        "y": 44
      },
      {
        "x": -194,
        "y": 60
      },
      {
        "x": -194,
        "y": 76
      },
      {
        "x": -194,
        "y": 92
      },
      {
        "x": -194,
        "y": 108
      },
      {
        "x": -194,
        "y": 124
      },
      {
        "x": -194,
        "y": 140
      },
      {
        "x": -194,
        "y": 156
      },
      {
        "x": -194,
        "y": 186
      },
      {
        "x": -194,
        "y": 202
      },
      {
        "x": -194,
        "y": 218
      },
      {
        "x": -194,
        "y": 234
      },
      {
        "x": -194,
        "y": 250
      },
      {
        "x": -194,
        "y": 266
      }
    ]
  },
  {
    "elementId": "matrix",
    "x": 48,
    "y": -272,
    "width": 202,
    "height": 202,
    "pins": [
      {
        "portId": "clk",
        "label": "CLK",
        "x": 260,
        "y": -203
      },
      {
        "portId": "cs",
        "label": "CS",
        "x": 260,
        "y": -187
      },
      {
        "portId": "din",
        "label": "DIN",
        "x": 260,
        "y": -171
      },
      {
        "portId": "gnd",
        "label": "GND",
        "x": 260,
        "y": -155
      },
      {
        "portId": "vcc",
        "label": "VCC",
        "x": 260,
        "y": -139
      }
    ],
    "dots": []
  },
  {
    "elementId": "joystick",
    "x": -210,
    "y": 448,
    "width": 164,
    "height": 214,
    "pins": [
      {
        "portId": "gnd",
        "label": "GND",
        "x": -36,
        "y": 523
      },
      {
        "portId": "vcc",
        "label": "+5V",
        "x": -36,
        "y": 539
      },
      {
        "portId": "vrx",
        "label": "VRx",
        "x": -36,
        "y": 555
      },
      {
        "portId": "vry",
        "label": "VRy",
        "x": -36,
        "y": 571
      },
      {
        "portId": "sw",
        "label": "SW",
        "x": -36,
        "y": 587
      }
    ],
    "dots": []
  }
]
```

Rail bindings:

```json
[
  {
    "elementId": "breadboard",
    "portId": "plus",
    "side": "left",
    "polarity": "plus",
    "segment": "upper"
  },
  {
    "elementId": "breadboard",
    "portId": "minus",
    "side": "left",
    "polarity": "minus",
    "segment": "upper"
  }
]
```

### Progressive assembly

Taken from the wiring blocks in section 3. Listed again in step order.

- sort_order 3 “Place the Uno and the breadboard”: parts (none); jumpers (none)
- sort_order 4 “Share 5 V and GND”: parts (none); jumpers uno-5v, uno-gnd
- sort_order 5 “Place the matrix and power it”: parts matrix; jumpers matrix-gnd, matrix-vcc
- sort_order 6 “Connect CLK, CS, and DIN”: parts (none); jumpers matrix-clk, matrix-cs, matrix-din
- sort_order 7 “Place the joystick and power it”: parts joystick; jumpers joy-gnd, joy-5v
- sort_order 8 “Connect VRx, VRy, and SW”: parts (none); jumpers joy-x, joy-y, joy-sw

### Hardware assumptions recorded with this design

These are limits already attached to the source. This export does not add a test result.

- The compile record is not a hardware test. No bench build is stored for this project.
- The physical-layout comment says an assembled FC-16 is about 32 mm square, a KY-023 board is about 34 mm by 26 mm, and each module is drawn with about 15 mm of clear table beside the breadboard. Those outlines are the drawing scale. They are not a measured fit of a purchased board.
- The tutorial tells the learner that a 20 cm male-to-female jumper is long enough for the matrix power span. That length is not a stored measurement.
- The sketch sets `INVERT_Y` true and `INVERT_X` false. The tutorial calls `INVERT_Y` the starting value for a rising VRy reading.
- The tutorial explains MAX7219 segment current from the datasheet and tells the learner to leave intensity at 2. No measured USB current is stored.

## Completeness checks

- Steps exported: 18
- Content blocks exported: 55
- Code blocks exported: 8
- Longest code block characters: 6687
- Authoritative sketch characters: 6687
- Full sketch copies inside the steps: 1
- Male-to-male jumpers in the layout: 2
- Male-to-female jumpers in the layout: 10
- BOM jumper-wires quantity: 2
- BOM jumper-male-female quantity: 10
- Step mismatches against the local walkthrough: 0
