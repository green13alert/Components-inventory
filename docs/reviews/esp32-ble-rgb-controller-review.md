# ESP32 Bluetooth RGB LED Controller

Review export of slug `24`. The walkthrough text below is the text stored in Supabase and loaded by the app. It is not a summary.

The only stored field the app rewrites before display is a pending-cover caption. Where that happens, the stored caption and the caption shown in the app are both printed. Code blocks are shown in full. Each one also has a copy control and an Explain Code button that opens a coming-soon dialog.

## 1. Project

Title: ESP32 Bluetooth RGB LED Controller

Slug: 24

Description: Mix a red, green, and blue LED from a phone over Bluetooth Low Energy.

Overview: Build a breadboard RGB light on an ESP32 DevKit. The LED takes power from the DevKit 5 V pin through resistors and PN2222A switches. Three PWM pins set the colour, and Nordic nRF Connect writes the colour and brightness over BLE. The sketch does not use Bluetooth Classic.

Difficulty: beginner

Duration: 3 hrs

Category: iot

Publication: unpublished (`is_published` false in the database and false in the local source)

Sort order: 24

Learning objectives:

- Switch a common-anode RGB LED from the DevKit 5 V pin with a PN2222A and a 220 Ω resistor on each colour
- Use LEDC PWM on GPIO25, GPIO26, and GPIO27 to drive those transistor bases through 1 kΩ
- Advertise a BLE GATT service that accepts colour and brightness writes
- Connect with nRF Connect for Mobile and compare the LED with the Serial Monitor

Local authoring metadata, which is not a database column: compilation `passed`, hardware tested `false`, code style `single-program`. Those values do not appear in the walkthrough.

## 2. Thumbnail status

Database image key: `esp32BleRgb`.

`esp32BleRgb` is the only key in `PENDING_PROJECT_COVER_KEYS`. No file for this project is registered in `PROJECT_IMAGES`, and no matching image is stored under `assets/images/projects`.

On the project card and on step 1, the app shows a dark placeholder with the label “Photo needed”. It does not fall through to another project’s photograph, because the pending-cover check runs before the image lookup.

## 3. Bill of materials

Quantities, names, roles, and catalogue descriptions are the rows stored for slug 24.

- 1 × ESP32 DevKit
  Catalogue slug: `esp32`
  Requirement role: `microcontroller`
  Substitution policy: `exact`
  Catalogue description: Wi-Fi and Bluetooth development board. This row does not fix header gender, USB socket, or board outline.
- 1 × Common-anode RGB LED
  Catalogue slug: `rgb-led-ca`
  Requirement role: `rgb_led`
  Substitution policy: `exact`
  Catalogue description: Kingbright WP154A4SEJ3VBDZGW/CA, a white-diffused 5 mm common-anode RGB LED. Datasheet DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, draws pin 1 as the red cathode, pin 2 as the common anode, pin 3 as the blue cathode, and pin 4 as the green cathode. The end view puts the flat of the flange next to pin 1. The package drawing labels the anode lead and shows it 2.5 mm minimum longer than the other leads. At 20 mA the forward voltage is 2.2 V typical and 2.8 V maximum for red, 3.3 V typical and 4.0 V maximum for blue, and 3.3 V typical and 4.1 V maximum for green. Absolute maximum DC forward current is 30 mA for red, 30 mA for blue, and 25 mA for green. This row is not a common-cathode LED and not an addressable pixel.
- 3 × PN2222A transistor
  Catalogue slug: `pn2222a`
  Requirement role: `low_side_switch`
  Substitution policy: `exact`
  Catalogue description: onsemi PN2222ABU, the bulk TO-92 formerly listed by Fairchild. Top mark PN2222A. The PN2222A Rev. 1.1.0 package sketch labels the leads E, B, C: flat face toward you and leads down, left to right is emitter, base, collector. A metal-can 2N2222, and some other TO-92 parts with a similar mark, use a different order. Absolute maximum collector current is 1 A. Used as a low-side switch.
- 3 × 220 Ω resistor
  Catalogue slug: `resistor-220`
  Requirement role: `led_limiter`
  Substitution policy: `exact`
  Catalogue description: Current-limiting resistor for a typical 5 V LED
- 3 × 1 kΩ resistor
  Catalogue slug: `resistor-1k`
  Requirement role: `base_resistor`
  Substitution policy: `exact`
  Catalogue description: 1 kΩ through-hole resistor
- 1 × Breadboard
  Catalogue slug: `breadboard`
  Requirement role: `breadboard`
  Substitution policy: `exact`
  Catalogue description: Solderless prototyping board
- 5 × Male-to-female jumper wires
  Catalogue slug: `jumper-male-female`
  Requirement role: `jumper_wires`
  Substitution policy: `exact`
  Catalogue description: Dupont wires with a female socket on one end and a male pin on the other. The socket fits a male header pin.
- 1 × USB data cable
  Catalogue slug: `usb-data-cable`
  Requirement role: `usb_cable`
  Substitution policy: `exact`
  Catalogue description: Data-capable USB cable. Espressif ESP32-DevKitC V4 uses USB-A to Micro-B. The plug must match the DevKit socket.
- 1 × USB power source
  Catalogue slug: `usb-power-source`
  Requirement role: `usb_power`
  Substitution policy: `exact`
  Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.

## 4. Component specifications stored for this project

The Kingbright LED and the PN2222ABU transistor are specified by the catalogue descriptions in section 3 and by the hardware-preparation steps in section 6. Those descriptions are the stored specification. No separate pin-profile rows exist for any BOM component.

Catalogue capabilities stored on the BOM components, separate from the project requirement constraints:

- `esp32` board_package = esp32
- `esp32` function = development_board
- `esp32` gpio = analog_input
- `esp32` gpio = digital_input
- `esp32` gpio = digital_output
- `esp32` gpio = pwm_output
- `esp32` header_profile = esp32_devkit
- `esp32` logic_level_v = 3.3
- `esp32` physical_form = esp32_devkit
- `esp32` programming_environment = arduino_ide
- `esp32` supply_v = 3.3
- `pn2222a` function = npn_transistor
- `pn2222a` physical_form = to-92
- `resistor-1k` function = fixed_resistor
- `resistor-1k` resistance_ohms = 1000
- `resistor-220` function = fixed_resistor
- `resistor-220` resistance_ohms = 220
- `rgb-led-ca` function = rgb_led
- `rgb-led-ca` physical_form = common_anode

## 5. Compatibility requirements and approved substitutions

Every requirement is stored with substitution policy `exact`. Pin-role rows: 0. Substitution-review rows: 0. There are no approved substitutions.

Requirement constraints stored for slug 24:

- `esp32` board_package = esp32 (policy exact, role microcontroller)
- `esp32` function = development_board (policy exact, role microcontroller)
- `esp32` logic_level_v = 3.3 (policy exact, role microcontroller)
- `esp32` programming_environment = arduino_ide (policy exact, role microcontroller)
- `esp32` supply_v = 3.3 (policy exact, role microcontroller)
- `rgb-led-ca` function = rgb_led (policy exact, role rgb_led)
- `rgb-led-ca` physical_form = common_anode (policy exact, role rgb_led)
- `pn2222a` function = npn_transistor (policy exact, role low_side_switch)
- `pn2222a` physical_form = to-92 (policy exact, role low_side_switch)

## 6. Walkthrough

Step count stored in the database: 25.

### Step 1 of 25

Stage 1: Introduction

Stored sort_order: 0. Stored stage_sort_order: 0.

Heading: What the finished controller does

Description: A phone sets the colour and brightness of one RGB LED over Bluetooth Low Energy.

Tip: None.


Visual reference: imageKey `esp32BleRgb`.

Stored caption: The finished controller is an ESP32-DevKitC V4 above a breadboard, with one common-anode RGB LED, three PN2222A transistors, and six resistors, powered from USB. The wiring diagram is the connection reference.

Caption shown in the app: The workbench photograph is not in the app yet. The wiring diagram is the connection reference.

The app does not show a photograph. `esp32BleRgb` is a pending cover key, and `assets/images/projects` has no file for it. The cover control is a dark placeholder labelled “Photo needed”. Its accessibility label is “Cover photograph not yet added. Needs a 16:9 workbench photo of the finished build.”


**Text: What you are building**

The ESP32 DevKit switches one 5 mm common-anode RGB LED. The DevKit 5V pin feeds the common anode. Each colour cathode returns to ground through a 220 Ω resistor and a PN2222A. GPIO25, GPIO26, and GPIO27 drive the transistor bases through 1 kΩ, and a high PWM duty turns that colour on. After upload, the LED starts red at 30 percent brightness and the board advertises the BLE name Solderi RGB. Nordic nRF Connect writes a new colour and a new brightness. Nothing is sent to a cloud account, and the sketch does not join Wi-Fi.


**Expected result: What done looks like**

The Serial Monitor at 115200 baud prints the power-on line and “Advertising as Solderi RGB.” nRF Connect connects to that name. Writing 0,0,255 turns the light blue. Writing 100 to the brightness characteristic makes it as bright as this circuit allows. Writing 0 turns it off without disconnecting Bluetooth.

### Step 2 of 25

Stage 1: Introduction

Stored sort_order: 1. Stored stage_sort_order: 0.

Heading: What you will learn

Description: This build is one LED, three transistors, six resistors, PWM, and one BLE service.

Tip: None.


**Text: Skills in this project**

You will identify ESP32 5V, GND, IO25, IO26, and IO27, the four leads of a common-anode RGB LED, and the emitter, base, and collector of a PN2222A. You will see why green and blue need the 5 V rail, and why each colour still has a 220 Ω resistor. You will upload one complete sketch, then use nRF Connect to write colour text such as 255,80,0 and a brightness from 0 to 100.


**Text: What this project does not use**

It does not use Bluetooth Classic, a serial-port app, or BluetoothSerial.h. It does not use a common-cathode LED wired straight to a GPIO, a WS2812 addressable pixel, or an ESP8266. Those parts do not follow this pin map or this phone procedure. iOS can talk to BLE GATT devices, which is what nRF Connect does. This repository has not paired a phone to the board.

### Step 3 of 25

Stage 1: Introduction

Stored sort_order: 2. Stored stage_sort_order: 0.

Heading: How the hardware and the phone work together

Description: USB powers the DevKit. The 5V pin feeds the LED. The GPIO pins only switch the transistors. The phone writes two BLE characteristics.

Tip: None.


**Text: The electrical path**

USB power feeds the ESP32 DevKit. Do not also connect a second supply to the 5V or 3V3 header. With only USB connected, the DevKitC V4 5V header is the USB 5 V rail after the board’s series diode, so it can feed the LED. Current leaves that pin, enters the common anode, leaves through one colour cathode, passes through that colour’s 220 Ω resistor and PN2222A, and returns to GND. A GPIO high turns its transistor on. A higher PWM duty keeps it on for more of each cycle, so that colour looks brighter. The GPIO does not carry the LED current.


**Text: The Bluetooth path**

The sketch starts a BLE server named Solderi RGB. The service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24. One characteristic takes the colour. The next takes brightness. nRF Connect is the central. It scans, connects, and writes those characteristics. The LED holds the last accepted colour if the phone disconnects, and the board starts advertising again.

### Step 4 of 25

Stage 1: Introduction

Stored sort_order: 3. Stored stage_sort_order: 0.

Heading: What a successful build should do

Description: Success is a visible colour change from a BLE write, plus a Serial line that matches it.

Tip: None.


**Text: Check these behaviours**

Before any phone connects, the LED is red and dim. Serial prints “Power-on colour is red at 30 percent brightness.” and then “Advertising as Solderi RGB.” After a connection it prints “Phone connected.” A colour write of 0,255,0 prints “Colour 0,255,0” and the LED becomes green. A brightness write of 0 prints “Brightness 0” and the LED goes dark. A rejected write prints “Colour rejected:” or “Brightness rejected:” and leaves the previous light unchanged.


**Warning**

This repository has not run the sketch on a physical ESP32 and has not connected nRF Connect to a board. Treat the Serial lines and colours below as the behaviour the code is written to produce, and compare them with what your board and phone actually do.

### Step 5 of 25

Stage 2: Hardware preparation

Stored sort_order: 4. Stored stage_sort_order: 1.

Heading: Identify every required component

Description: Every physical item in this build is on the BOM. The phone is the controller app, not a wired part.

Tip: A phone with Bluetooth Low Energy is required to change the colour. It is not a BOM line.


**Components: Required parts**

- 1 × ESP32 DevKit (`esp32`), illustration `esp32`, owned false
- 1 × Common-anode RGB LED (`rgb-led-ca`), illustration `led`, owned false
- 3 × PN2222A transistor (`pn2222a`), illustration `generic-module`, owned false
- 3 × 220 Ω resistor (`resistor-220`), illustration `resistor`, owned false
- 3 × 1 kΩ resistor (`resistor-1k`), illustration `resistor`, owned false
- 1 × Breadboard (`breadboard`), illustration `breadboard`, owned false
- 5 × Male-to-female jumper wires (`jumper-male-female`), illustration `jumper-wires`, owned false
- 1 × USB data cable (`usb-data-cable`), illustration `usb-cable`, owned false
- 1 × USB power source (`usb-power-source`), illustration `generic-module`, owned false


**Text: What each part is for**

The ESP32 DevKit is the controller and the BLE peripheral. The common-anode RGB LED is the only lamp. Three PN2222A transistors switch the colours. Three 220 Ω resistors limit the LED current. Three 1 kΩ resistors limit the base current. The breadboard holds the LED, the transistors, and the resistors. Five male-to-female jumpers reach 5V, GND, IO25, IO26, and IO27. The USB data cable carries power and the upload. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board.


**Expected result: Check**

You can point to one ESP32 DevKit, one four-lead RGB LED sold as common anode, three PN2222A transistors, three 220 Ω resistors, three 1 kΩ resistors, one breadboard, five male-to-female jumpers, one data-capable USB cable, and a USB port or charger.

### Step 6 of 25

Stage 2: Hardware preparation

Stored sort_order: 5. Stored stage_sort_order: 1.

Heading: Confirm the ESP32 DevKit labels

Description: This guide uses 5V, GND, IO25, IO26, and IO27. Stop if your silkscreen does not show those names.

Tip: Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket. The catalogue row does not fix the socket on every board sold as a DevKit.


**Text: What to look for**

Solderi’s ESP32 DevKit row is a 3.3 V board programmed with the Arduino-ESP32 package. This project’s wiring uses 5V, GND, IO25, IO26, and IO27. Those GPIO numbers are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34 to 39. Espressif’s ESP32-WROOM-32 module includes Bluetooth Low Energy. The sketch uses the Arduino-ESP32 BLE library, which speaks BLE GATT. It does not open a Bluetooth Classic serial port. Each GPIO only sources about 2.6 mA into a 1 kΩ base resistor. The ESP32 datasheet allows a much higher pin current, and that current falls as the high level sags, so the LED current stays on the 5V pin.


**Text: USB and headers**

Espressif’s ESP32-DevKitC V4 uses USB-A to Micro-B and male headers. Confirm the silkscreen shows 5V, GND, IO25, IO26, and IO27 before you continue. Use a data cable that fits the socket. A charge-only cable can light the board and still never appear as a serial port. Leave the DevKit beside the breadboard. Do not bend its header pins to press it into the breadboard.


**Warning**

If those labels are missing, stop. Do not move the wires onto an ESP32-CAM or an ESP32-S2. An S2 module does not provide this project’s Bluetooth radio. Power the board from USB only. The 5V header then feeds the LED. Do not connect a second supply to the 5V pin or the 3V3 pin while USB is plugged in.

### Step 7 of 25

Stage 2: Hardware preparation

Stored sort_order: 6. Stored stage_sort_order: 1.

Heading: Confirm the LED is common anode

Description: Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.

Tip: The flat on the flange is beside pin 1. The anode lead is the long one.


**Text: What to look for**

Use the Kingbright WP154A4SEJ3VBDZGW/CA, a white-diffused 5 mm lamp. Datasheet DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, draws the internal schematic on the package-dimensions page. Pin 1 is the red cathode, pin 2 is the common anode, pin 3 is the blue cathode, and pin 4 is the green cathode. The end view shows the flat of the flange beside pin 1, then pins 2, 3, and 4 in that order. The side view labels the anode lead and shows it 2.5 mm minimum longer than the other leads. At 20 mA the forward voltage is 2.2 V typical and 2.8 V maximum for red, 3.3 V typical and 4.0 V maximum for blue, and 3.3 V typical and 4.1 V maximum for green. Absolute maximum DC current is 30 mA for red, 30 mA for blue, and 25 mA for green. The China Young Sun YSL-R596AR3G4B5C-C10 schematic also joins the anodes at pin 2, but that drawing does not name the colours of pins 1, 3, and 4, so this project does not use it.


**Warning**

Do not substitute a common-cathode LED, and do not tie the common pin to GND to try one. A 3.3 V GPIO cannot light the blue or green die: the typical forward voltage is already 3.3 V, and the maximum is 4.0 V for blue and 4.1 V for green. An addressable LED such as a WS2812 uses one data pin and is a different project.


**Expected result: Check**

You can point to the longest lead, pin 2, as the common anode. The lead beside the flat is pin 1, red. The next lead is pin 3, blue. The last lead is pin 4, green. If the part in your hand is not this Kingbright common-anode model, stop. Do not copy a colour order from a common-cathode datasheet or from the unlabeled Young Sun anode drawing.

### Step 8 of 25

Stage 2: Hardware preparation

Stored sort_order: 7. Stored stage_sort_order: 1.

Heading: Read the resistors and the transistor leads

Description: Each colour uses one 220 Ω LED resistor, one 1 kΩ base resistor, and one PN2222A.

Tip: 220 Ω is red, red, brown, gold. 1 kΩ is brown, black, red, gold.


**Text: Why these values**

The Kingbright datasheet lists a typical forward voltage of 3.3 V for blue and green, a maximum of 4.0 V for blue, and a maximum of 4.1 V for green, all at 20 mA. A 3.3 V GPIO has no voltage left for those dice, so the LED current comes from the 5V pin. Espressif’s DevKitC V4 schematic places a BAT760 diode between USB VBUS and that pin. On a USB port near 5 V the pin is about 4.7 V. Allow about 0.2 V across a saturated PN2222A. Blue or green at the typical 3.3 V through 220 Ω is then about (4.7 − 3.3 − 0.2) / 220, about 5.5 mA. Blue at its 4.0 V maximum is about (4.7 − 4.0 − 0.2) / 220, about 2.3 mA. Green at its 4.1 V maximum is about (4.7 − 4.1 − 0.2) / 220, about 1.8 mA. Red at the typical 2.2 V is about (4.7 − 2.2 − 0.2) / 220, about 10.5 mA. From a 5.0 V pin at 2.2 V it is about 12 mA, still under the red absolute maximum of 30 mA. The same 220 Ω fits every colour, and those currents stay under the datasheet limits of 30 mA red, 30 mA blue, and 25 mA green. If a weak USB port is only 4.4 V and the diode drops 0.5 V, the pin can fall to about 3.9 V. A typical 3.3 V blue or green die then has about 1.8 mA. A blue die at 4.0 V, or a green die at 4.1 V, does not conduct from that 3.9 V pin, so use a USB port near 5 V. Each base resistor is 1 kΩ, so the base current is about (3.3 − 0.7) / 1000, about 2.6 mA. That saturates the transistor at these LED currents, and three pins together are about 8 mA, inside the ESP32 pin budget. Do not remove the 220 Ω resistors.


**Text: Transistor leads**

Use the onsemi PN2222ABU, the bulk TO-92 whose top mark is PN2222A. Fairchild’s PN2222A Rev. 1.1.0 package sketch labels that part E, B, C. Flat face toward you and leads pointing down, left to right is emitter, base, collector. The diagram labels these Q red, Q green, and Q blue. A metal-can 2N2222 uses a different pin order. Another maker’s TO-92 with a similar marking can too. If the part is not this onsemi TO-92, stop and read its own datasheet before you insert it.


**Expected result: Check**

Set three 220 Ω resistors aside, one for each colour, and three 1 kΩ resistors aside for the three bases. Each transistor’s flat face is identified, and you can point to emitter, base, and collector.

### Step 9 of 25

Stage 3: Wiring

Stored sort_order: 8. Stored stage_sort_order: 2.

Heading: Connect 5 V, the anode, and the emitters

Description: The 5V pin feeds the common anode. All three emitters share the ground rail.

Tip: USB is the only power source. The 5V header is an output for the LED, not a second supply.


**Text: Connection sequence**

Seat the RGB LED so each lead has its own row. On the Kingbright drawing the flat of the flange is beside pin 1. From that flat the leads are pin 1 red, pin 2 the common anode, pin 3 blue, and pin 4 green. Pin 2 is the long lead. Seat each PN2222ABU with the flat face toward you: emitter, base, collector in three neighbouring rows. Jumper ESP32 5V to the red breadboard rail, and jumper that rail to pin 2. Jumper ESP32 GND to the blue ground rail, and connect each transistor emitter to that rail. Leave the 3V3 header empty. Leave USB unplugged. The diagram names the transistors Q red, Q green, and Q blue, and it draws the LED leads in the same order as the datasheet.


**Wiring diagram: Supply and ground**

The app draws these connections on the slug 24 layout described in section 7. There is no diagram image file. The diagram can be pinched to zoom.

1. ESP32 DevKit 5V → Breadboard 5V rail (power)
2. Breadboard 5V rail → RGB LED Anode (power)
3. ESP32 DevKit GND → Breadboard GND rail (ground)
4. Breadboard GND rail → Q red Emitter (ground)
5. Breadboard GND rail → Q green Emitter (ground)
6. Breadboard GND rail → Q blue Emitter (ground)


**Connections: Wiring instructions**

5V to the anode · emitters to GND

1. ESP32 DevKit 5V → Breadboard 5V rail (power)
2. Breadboard 5V rail → RGB LED Anode (power)
3. ESP32 DevKit GND → Breadboard GND rail (ground)
4. Breadboard GND rail → Q red Emitter (ground)
5. Breadboard GND rail → Q green Emitter (ground)
6. Breadboard GND rail → Q blue Emitter (ground)


**Warning**

Do not connect a GPIO to the 5V rail or to a colour cathode. The GPIO only reaches a 1 kΩ resistor. Do not connect another supply to the 5V pin while the USB cable is the board’s power source.

### Step 10 of 25

Stage 3: Wiring

Stored sort_order: 9. Stored stage_sort_order: 2.

Heading: Connect red, green, and blue

Description: Each colour is GPIO, 1 kΩ, base, collector, 220 Ω, cathode. The colours are not interchangeable.

Tip: IO25 is red, IO26 is green, and IO27 is blue. The sketch uses those same numbers.


**Text: Connection sequence**

For red, jumper IO25 to leg 1 of the resistor labelled 1k red. Put leg 2 in the base row of Q red. Put the collector of Q red in the same row as leg 1 of the resistor labelled 220 red. Put leg 2 of that resistor in the pin 1 row, the red cathode. Repeat with IO26, 1k green, Q green, 220 green, and pin 4, the green cathode. Repeat with IO27, 1k blue, Q blue, 220 blue, and pin 3, the blue cathode. The five male-to-female jumpers are 5V, GND, IO25, IO26, and IO27. The other links are component leads in shared breadboard rows. The diagram still draws every electrical segment.


**Wiring diagram: Colour channels**

The app draws these connections on the slug 24 layout described in section 7. There is no diagram image file. The diagram can be pinched to zoom.

1. ESP32 DevKit IO25 → 1k red leg 1 (signal)
2. 1k red leg 2 → Q red Base (signal)
3. Q red Collector → 220 red leg 1 (signal)
4. 220 red leg 2 → RGB LED Red (signal)
5. ESP32 DevKit IO26 → 1k green leg 1 (signal)
6. 1k green leg 2 → Q green Base (signal)
7. Q green Collector → 220 green leg 1 (signal)
8. 220 green leg 2 → RGB LED Green (signal)
9. ESP32 DevKit IO27 → 1k blue leg 1 (signal)
10. 1k blue leg 2 → Q blue Base (signal)
11. Q blue Collector → 220 blue leg 1 (signal)
12. 220 blue leg 2 → RGB LED Blue (signal)


**Connections: Wiring instructions**

IO25 red · IO26 green · IO27 blue

1. ESP32 DevKit IO25 → 1k red leg 1 (signal)
2. 1k red leg 2 → Q red Base (signal)
3. Q red Collector → 220 red leg 1 (signal)
4. 220 red leg 2 → RGB LED Red (signal)
5. ESP32 DevKit IO26 → 1k green leg 1 (signal)
6. 1k green leg 2 → Q green Base (signal)
7. Q green Collector → 220 green leg 1 (signal)
8. 220 green leg 2 → RGB LED Green (signal)
9. ESP32 DevKit IO27 → 1k blue leg 1 (signal)
10. 1k blue leg 2 → Q blue Base (signal)
11. Q blue Collector → 220 blue leg 1 (signal)
12. 220 blue leg 2 → RGB LED Blue (signal)

### Step 11 of 25

Stage 3: Wiring

Stored sort_order: 10. Stored stage_sort_order: 2.

Heading: Read the complete wiring table

Description: These eighteen connections are the whole circuit. Five of them are jumpers.

Tip: None.


**Wiring diagram: Complete wiring diagram**

The app draws these connections on the slug 24 layout described in section 7. There is no diagram image file. The diagram can be pinched to zoom.

1. ESP32 DevKit 5V → Breadboard 5V rail (power)
2. Breadboard 5V rail → RGB LED Anode (power)
3. ESP32 DevKit GND → Breadboard GND rail (ground)
4. Breadboard GND rail → Q red Emitter (ground)
5. Breadboard GND rail → Q green Emitter (ground)
6. Breadboard GND rail → Q blue Emitter (ground)
7. ESP32 DevKit IO25 → 1k red leg 1 (signal)
8. 1k red leg 2 → Q red Base (signal)
9. Q red Collector → 220 red leg 1 (signal)
10. 220 red leg 2 → RGB LED Red (signal)
11. ESP32 DevKit IO26 → 1k green leg 1 (signal)
12. 1k green leg 2 → Q green Base (signal)
13. Q green Collector → 220 green leg 1 (signal)
14. 220 green leg 2 → RGB LED Green (signal)
15. ESP32 DevKit IO27 → 1k blue leg 1 (signal)
16. 1k blue leg 2 → Q blue Base (signal)
17. Q blue Collector → 220 blue leg 1 (signal)
18. 220 blue leg 2 → RGB LED Blue (signal)


**Connections: Every electrical connection**

5V to the anode · IO25 red · IO26 green · IO27 blue · emitters to GND

1. ESP32 DevKit 5V → Breadboard 5V rail (power)
2. Breadboard 5V rail → RGB LED Anode (power)
3. ESP32 DevKit GND → Breadboard GND rail (ground)
4. Breadboard GND rail → Q red Emitter (ground)
5. Breadboard GND rail → Q green Emitter (ground)
6. Breadboard GND rail → Q blue Emitter (ground)
7. ESP32 DevKit IO25 → 1k red leg 1 (signal)
8. 1k red leg 2 → Q red Base (signal)
9. Q red Collector → 220 red leg 1 (signal)
10. 220 red leg 2 → RGB LED Red (signal)
11. ESP32 DevKit IO26 → 1k green leg 1 (signal)
12. 1k green leg 2 → Q green Base (signal)
13. Q green Collector → 220 green leg 1 (signal)
14. 220 green leg 2 → RGB LED Green (signal)
15. ESP32 DevKit IO27 → 1k blue leg 1 (signal)
16. 1k blue leg 2 → Q blue Base (signal)
17. Q blue Collector → 220 blue leg 1 (signal)
18. 220 blue leg 2 → RGB LED Blue (signal)


**Text: How this matches the sketch**

The firmware sets RED_PIN to 25, GREEN_PIN to 26, and BLUE_PIN to 27. Those headers drive the bases. A higher duty still means a brighter colour, because a high output turns the PN2222A on. The diagram draws eighteen segments: two for the 5 V path, four for ground, and four for each colour. That is three PWM pins. Each colour still has its 220 Ω resistor between the collector and the cathode.

### Step 12 of 25

Stage 3: Wiring

Stored sort_order: 11. Stored stage_sort_order: 2.

Heading: Check the circuit before you apply power

Description: Count the paths, then connect USB. Do not add a second power source.

Tip: USB is the only supply. The 5V header feeds the LED from that same USB rail.


**Test: What to verify**

The common anode reaches only the 5V rail, and that rail reaches only the ESP32 5V pin. Each emitter reaches only the GND rail, and that rail reaches only ESP32 GND. IO25 reaches only 1k red, that resistor reaches only the red base, the red collector reaches only 220 red, and that resistor reaches only the red cathode. Green follows IO26, and blue follows IO27. No cathode shares a row with the anode. The 3V3 header is empty. No GPIO touches 5V. USB is still unplugged.


**Text: Then apply power**

Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the power LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected.


**Expected result: Expected result**

The board’s power LED is on. The RGB LED stays off until the sketch runs. The LED package does not get hot.

### Step 13 of 25

Stage 4: Development environment

Stored sort_order: 12. Stored stage_sort_order: 3.

Heading: Install the ESP32 board package

Description: BLE and LEDC come from Espressif’s ESP32 package. They are not separate Library Manager installs.

Tip: Use the stable package URL. The development URL is a different package.


**Text: What to do**

Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. This sketch uses ledcAttach and the BLE classes from that platform’s 3.x API.


**Expected result: What you should see**

Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group. You do not install a Bluetooth library from Library Manager for this sketch.

### Step 14 of 25

Stage 4: Development environment

Stored sort_order: 13. Stored stage_sort_order: 3.

Heading: Select the board and the serial port

Description: Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.

Tip: If the port never appears, try another data cable before you change any wiring.


**Text: Board and port**

Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. Do not choose ESP32-S2, ESP32-C3, or ESP32-CAM. Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears.


**Troubleshooting: If the port is missing**

Problem: No new port appears

Solution: The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port.

Problem: Several ports are listed

Solution: Unplug the DevKit, see which port vanishes, and select that one after reconnecting.

### Step 15 of 25

Stage 4: Development environment

Stored sort_order: 14. Stored stage_sort_order: 3.

Heading: Set the Serial Monitor to 115200 baud

Description: The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text.

Tip: None.


**Text: What to do**

Open Tools > Serial Monitor. Choose 115200 baud. Leave the line ending on Newline. The colour and brightness lines appear only after the sketch is uploaded.


**Expected result: What you should observe**

The monitor is open on the same port you selected for upload, and the baud value reads 115200.

### Step 16 of 25

Stage 5: Firmware

Stored sort_order: 15. Stored stage_sort_order: 4.

Heading: See how PWM sets each colour

Description: Excerpt only. This is not a complete sketch. Brightness scales the three channel values before LEDC writes them.

Tip: A duty of 0 is off. A duty of 255 is the brightest this 8-bit setup can make that channel, before the brightness percentage.


**Text: What this code does**

channelDuty multiplies the colour byte by the brightness percentage and divides by 100. applyColour writes that duty to GPIO25, GPIO26, and GPIO27 with ledcWrite. Each GPIO drives a PN2222A base, so a higher duty turns that colour on for longer. The phone does not send PWM numbers. It sends a colour and a percentage, and this function turns them into duties.


**Code: esp32_ble_rgb_controller.ino (Arduino)**

Libraries named on this block: BLE (ESP32 Arduino core), LEDC (ESP32 Arduino core)

The app shows this code in a block with a copy control and an Explain Code button. Explain Code opens a coming-soon dialog. It does not change the code.

```arduino
int channelDuty(int channel) {
  return (int)(((long)channel * (long)brightnessPercent) / 100L);
}

void applyColour() {
  ledcWrite(RED_PIN, channelDuty(redValue));
  ledcWrite(GREEN_PIN, channelDuty(greenValue));
  ledcWrite(BLUE_PIN, channelDuty(blueValue));
```


**Code explanation**

Red 255 at brightness 30 becomes duty 76. Red 255 at brightness 48 becomes duty 122. Red 255 at brightness 100 becomes duty 255, and at brightness 0 it becomes duty 0. Green 0 stays duty 0 at every brightness, so a pure red mix does not light the green die.

### Step 17 of 25

Stage 5: Firmware

Stored sort_order: 16. Stored stage_sort_order: 4.

Heading: See how BLE accepts colour and brightness

Description: Excerpt only. This is not a complete sketch. The board advertises one service and two write characteristics.

Tip: The advertised name is Solderi RGB. A Bluetooth Classic serial app will not show this service.


**Text: What this code does**

BLEDevice::init starts the BLE stack with the name Solderi RGB. The server owns one service. The colour characteristic can be read or written. The brightness characteristic can be read or written. After a disconnect, startAdvertising runs again so the phone can reconnect. The accepted colour is also written back so a later read shows the text the sketch stored.


**Code: esp32_ble_rgb_controller.ino (Arduino)**

Libraries named on this block: BLE (ESP32 Arduino core), LEDC (ESP32 Arduino core)

The app shows this code in a block with a copy control and an Explain Code button. Explain Code opens a coming-soon dialog. It does not change the code.

```arduino
BLEDevice::init(DEVICE_NAME);
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService *service = server->createService(SERVICE_UUID);

  BLECharacteristic *colorCharacteristic = service->createCharacteristic(
    COLOR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  colorCharacteristic->setCallbacks(new ColorCallbacks());
  colorCharacteristic->setValue(colourText());

  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(
    BRIGHTNESS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());
  brightnessCharacteristic->setValue(brightnessText());

  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Advertising as Solderi RGB.");
```


**Code explanation**

The only accepted colour is UTF-8 text such as 255,80,0. Each number is 0 to 255. Spaces around the commas are allowed. The only accepted brightness is UTF-8 text from 0 to 100, including 0, 48, and 100. A three-byte colour such as FF 50 00 is rejected. A rejected write is printed and the previous text is put back, so the LED and a later read stay on the last good value. A valid write then calls applyColour.

### Step 18 of 25

Stage 5: Firmware

Stored sort_order: 17. Stored stage_sort_order: 4.

Heading: Paste the complete sketch and upload it

Description: The program below is the whole firmware. Upload it with ESP32 Dev Module selected.

Tip: If the upload times out, hold Boot, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.


**Code: esp32_ble_rgb_controller.ino (Arduino)**

Libraries named on this block: BLE (ESP32 Arduino core), LEDC (ESP32 Arduino core)

The app shows this code in a block with a copy control and an Explain Code button. Explain Code opens a coming-soon dialog. It does not change the code.

```arduino
/*
 * ESP32 Bluetooth RGB LED Controller
 * Board: ESP32 Dev Module
 * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode
 * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode
 * DevKit 5V pin -> pin 2
 * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode
 * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode
 * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode
 * Emitters and DevKit GND share the ground rail
 * A higher PWM duty turns the transistor on for longer
 * Phone app: nRF Connect for Mobile
 * One write format: UTF-8 text
 * Colour: 255,80,0
 * Brightness: 0, 48, or 100
 * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

const int RED_PIN = 25;
const int GREEN_PIN = 26;
const int BLUE_PIN = 27;
const int PWM_FREQUENCY_HZ = 5000;
const int PWM_RESOLUTION_BITS = 8;
const size_t MAX_TEXT_BYTES = 16;

const char *DEVICE_NAME = "Solderi RGB";
const char *SERVICE_UUID = "8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24";
const char *COLOR_UUID = "8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24";
const char *BRIGHTNESS_UUID = "8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24";

int redValue = 255;
int greenValue = 0;
int blueValue = 0;
int brightnessPercent = 30;

bool clientConnected = false;

int channelDuty(int channel) {
  return (int)(((long)channel * (long)brightnessPercent) / 100L);
}

void applyColour() {
  ledcWrite(RED_PIN, channelDuty(redValue));
  ledcWrite(GREEN_PIN, channelDuty(greenValue));
  ledcWrite(BLUE_PIN, channelDuty(blueValue));
}

bool digitsOnly(const String &text) {
  if (text.length() == 0) {
    return false;
  }
  for (int i = 0; i < text.length(); i++) {
    char letter = text.charAt(i);
    if (letter < '0' || letter > '9') {
      return false;
    }
  }
  return true;
}

bool copyTextPayload(const uint8_t *data, size_t length, String &text) {
  text = "";
  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {
    return false;
  }
  for (size_t i = 0; i < length; i++) {
    char letter = (char)data[i];
    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';
    if (!allowed) {
      return false;
    }
    text += letter;
  }
  text.trim();
  return text.length() > 0;
}

bool parseColourText(const String &text) {
  if (text.indexOf(',') < 0) {
    return false;
  }
  int first = text.indexOf(',');
  int second = text.indexOf(',', first + 1);
  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {
    return false;
  }

  String redText = text.substring(0, first);
  String greenText = text.substring(first + 1, second);
  String blueText = text.substring(second + 1);
  redText.trim();
  greenText.trim();
  blueText.trim();
  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {
    return false;
  }

  long red = redText.toInt();
  long green = greenText.toInt();
  long blue = blueText.toInt();
  if (red > 255 || green > 255 || blue > 255) {
    return false;
  }

  redValue = (int)red;
  greenValue = (int)green;
  blueValue = (int)blue;
  return true;
}

bool parseBrightnessText(const String &text) {
  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {
    return false;
  }
  long value = text.toInt();
  if (value > 100) {
    return false;
  }
  brightnessPercent = (int)value;
  return true;
}

String colourText() {
  return String(redValue) + "," + String(greenValue) + "," + String(blueValue);
}

String brightnessText() {
  return String(brightnessPercent);
}

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    (void)server;
    clientConnected = true;
    Serial.println("Phone connected.");
  }

  void onDisconnect(BLEServer *server) override {
    (void)server;
    clientConnected = false;
    Serial.println("Phone disconnected. Advertising again.");
    BLEDevice::startAdvertising();
  }
};

class ColorCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String text;
    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);
    if (!accepted) {
      characteristic->setValue(colourText());
      Serial.print("Colour rejected: ");
      Serial.println(text);
      return;
    }

    applyColour();
    characteristic->setValue(colourText());
    Serial.print("Colour ");
    Serial.println(colourText());
  }
};

class BrightnessCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String text;
    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);
    if (!accepted) {
      characteristic->setValue(brightnessText());
      Serial.print("Brightness rejected: ");
      Serial.println(text);
      return;
    }

    applyColour();
    characteristic->setValue(brightnessText());
    Serial.print("Brightness ");
    Serial.println(brightnessPercent);
  }
};

void setup() {
  Serial.begin(115200);
  delay(300);

  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {
    Serial.println("PWM setup failed.");
  }
  applyColour();

  Serial.println("ESP32 Bluetooth RGB LED controller");
  Serial.println("Power-on colour is red at 30 percent brightness.");

  BLEDevice::init(DEVICE_NAME);
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService *service = server->createService(SERVICE_UUID);

  BLECharacteristic *colorCharacteristic = service->createCharacteristic(
    COLOR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  colorCharacteristic->setCallbacks(new ColorCallbacks());
  colorCharacteristic->setValue(colourText());

  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(
    BRIGHTNESS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());
  brightnessCharacteristic->setValue(brightnessText());

  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Advertising as Solderi RGB.");
}

void loop() {
  delay(200);
}

```


**Text: Upload**

Create a sketch named esp32_ble_rgb_controller and replace its contents with the program above. Do not add BluetoothSerial.h. Click Upload. Wait until the IDE reports the upload is done. Open the Serial Monitor at 115200 baud. Do not change pins 25, 26, or 27 unless you also change the wiring.


**Expected result: What you should observe**

The IDE finishes the upload. The Serial Monitor prints “ESP32 Bluetooth RGB LED controller”, “Power-on colour is red at 30 percent brightness.”, and “Advertising as Solderi RGB.” The LED is red and not at full brightness.

### Step 19 of 25

Stage 6: Phone control

Stored sort_order: 18. Stored stage_sort_order: 5.

Heading: Install nRF Connect and find Solderi RGB

Description: Use Nordic nRF Connect for Mobile. It is a BLE GATT app on Android and iOS.

Tip: Turn the phone’s Bluetooth on. This scan does not use the phone’s Wi-Fi.


**Text: Which app**

Install nRF Connect for Mobile, published by Nordic Semiconductor. On Android, install it from Google Play. On iPhone or iPad, install it from the App Store; Nordic’s listing is nRF Connect for Mobile, Apple id 1054362403, and the current listing requires a recent iOS. The app scans for Bluetooth Low Energy devices and can write a characteristic. This repository has not installed the app or connected it to a board. Do not use a Bluetooth Classic terminal. Those apps look for a serial-port profile, and this sketch does not advertise one. iOS does not provide that Classic serial profile to ordinary apps.


**Text: What to do**

Open nRF Connect and start a scan. Find the name Solderi RGB. The 128-bit service UUID fills most of the advertising packet, so the name is carried in the scan response. If a row has a blank name, open it and match the service that starts with 8c4a2e10. Connect. You should see a colour characteristic starting with 8c4a2e11 and a brightness characteristic starting with 8c4a2e12. A read of the colour characteristic returns the text 255,0,0 until you write a new colour. The Serial Monitor prints “Phone connected.”


**Expected result: Expected result**

The phone shows Solderi RGB as connected. The LED is still the power-on red, because connecting does not by itself change the colour.

### Step 20 of 25

Stage 6: Phone control

Stored sort_order: 19. Stored stage_sort_order: 5.

Heading: Write a colour

Description: Send 0,0,255 as text. The LED should turn blue and Serial should print that colour.

Tip: On Android, set the value format to Text. On iOS, use the UTF-8 string field. Both have been in nRF Connect since the iOS 1.8.8 text-input update. This session did not tap Send on a phone.


**Text: What to do**

Open the colour characteristic that starts with 8c4a2e11. On Android, tap the write icon and set the format to Text. On iOS, choose the UTF-8 string input rather than the hexadecimal byte field. Type 0,0,255. If the app offers Request and Command, either is accepted; Request is the normal write. Send it. Then send 255,80,0 the same way. If the iOS field will only take hex, type the UTF-8 bytes of that same text: 30 2C 30 2C 32 35 35 for 0,0,255, or 32 35 35 2C 38 30 2C 30 for 255,80,0. Do not send FF 50 00. Those three raw bytes are rejected.


**Expected result: Expected result**

Serial prints “Colour 0,0,255” and the LED is blue at the current brightness. The next write prints “Colour 255,80,0” and the light becomes orange. A read of the characteristic shows the text the sketch stored. Red may look brighter than green or blue at the same number because its forward voltage is lower, so the same 220 Ω passes more current. On a USB port near 5 V, typical blue and green current is about 5.5 mA and typical red current is about 10.5 mA.

### Step 21 of 25

Stage 6: Phone control

Stored sort_order: 20. Stored stage_sort_order: 5.

Heading: Write a brightness

Description: Brightness is a separate write from 0 to 100. It does not change the stored colour mix.

Tip: Text 100 is full scale for this circuit. Text 0 turns the LED off and leaves the phone connected.


**Text: What to do**

Open the brightness characteristic that starts with 8c4a2e12. Use the same Text or UTF-8 field. Write 100, then 48, then 0, then 30. 100 is full scale for this circuit, 48 is a mid value, 0 turns the LED off while the phone stays connected, and 30 returns to the power-on level. If the field will only take hex, type the UTF-8 bytes of those characters: 31 30 30 for 100, 34 38 for 48, 30 for 0, and 33 30 for 30. A single hex byte 30 is the character 0, so it sets brightness 0. It is not decimal 48.


**Expected result: Expected result**

Serial prints “Brightness 100”, then “Brightness 48”, then “Brightness 0”, then “Brightness 30”. The colour text stays whatever you wrote last. Disconnecting the phone prints “Phone disconnected. Advertising again.” and the LED stays at the last accepted colour and brightness. Connecting again does not change that colour.


**Warning**

Any phone nearby can write these characteristics. The sketch does not ask for a pairing code. Use it as a bench project, not as a lock or a private control.

### Step 22 of 25

Stage 7: Troubleshooting

Stored sort_order: 21. Stored stage_sort_order: 6.

Heading: The phone cannot connect

Description: Fix the app type, the board power, and the advertisement before you change the LED wiring.

Tip: None.


**Troubleshooting: Bluetooth connection**

Problem: Solderi RGB never appears in the scan

Solution: Confirm Serial printed “Advertising as Solderi RGB.” If it did not, the upload did not start the BLE server. Use nRF Connect’s BLE scanner, not a Bluetooth Classic device list. Stay within a few metres and scan again. Press EN once to restart advertising.

Problem: A serial Bluetooth app cannot find the board

Solution: That app is looking for Bluetooth Classic. This sketch does not call BluetoothSerial. Install nRF Connect for Mobile and scan for Solderi RGB.

Problem: The phone connects, then immediately drops

Solution: Keep the Serial Monitor open and read the next line. The sketch advertises again after “Phone disconnected. Advertising again.” Connect once more from nRF Connect. A second phone already connected can make the link look busy.

Problem: iOS shows the device but the write button does nothing

Solution: Stay on the connected screen. On Android set the format to Text. On iOS choose the UTF-8 string field. Type 0,0,255 and send a Write Request if the app lists Request and Command. This repository has not completed that write on an iPhone.

### Step 23 of 25

Stage 7: Troubleshooting

Stored sort_order: 22. Stored stage_sort_order: 6.

Heading: The colour or the wiring is wrong

Description: Match the Serial colour line to the LED before you rewrite the sketch.

Tip: A swapped cathode looks like the wrong colour even when the write was accepted.


**Troubleshooting: Colours and wiring**

Problem: Serial prints Colour 0,0,255 but the LED is not blue

Solution: The write worked. IO27 is not reaching the blue base, or the blue cathode is in another row. Trace IO27 through 1k blue to the blue base, then from the blue collector through 220 blue to the blue cathode. The anode must be on the 5V rail and the blue emitter on GND.

Problem: The LED stays dark after a successful colour line

Solution: Write brightness 100. A stored brightness of 0 keeps every duty at 0. If it is still dark, the anode is not on the 5V rail, an emitter is not on GND, or the part is not common anode. Stop. Do not move the common lead to GND and do not tie a cathode straight to a GPIO.

Problem: One colour stays off while the other two follow the phone

Solution: Check that colour’s 220 Ω resistor, the transistor lead order, and the 1 kΩ base resistor. A collector and emitter swapped, or a base left open, leaves that die dark. Do not bypass the 220 Ω resistor. Green and blue are expected to light from this 5 V path when the USB port is near 5 V. At a 4.1 V green drop the current is about 2 mA, so that die is dimmer than red. A weak USB port can leave a maximum-forward-voltage green or blue die dark.

Problem: Serial prints Colour rejected

Solution: Send UTF-8 text such as 255,80,0. Words, a trailing comma, a number above 255, or three raw bytes such as FF 50 00 are rejected. Serial prints Colour rejected and the previous colour stays.

Problem: One colour stays on at full brightness as soon as USB is plugged in, before upload

Solution: A cathode is connected toward ground without its transistor, or a base is tied to 5V. Unplug USB. Each cathode must reach ground only through its 220 Ω resistor and its transistor. Each GPIO must reach only a 1 kΩ resistor.

### Step 24 of 25

Stage 8: How the light mixes

Stored sort_order: 23. Stored stage_sort_order: 7.

Heading: PWM, BLE, and RGB mixing

Description: The phone sends a mix. PWM turns that mix into three pin duties.

Tip: None.


**Text: PWM**

LEDC switches each GPIO on and off at 5000 Hz with 8-bit resolution. The eye sees the average, not the individual pulses. Duty 0 is off. Duty 255 is on for the whole cycle. Brightness scales all three duties together, so 50 percent brightness halves each channel without changing the mix.


**Text: BLE**

Bluetooth Low Energy here is a GATT server. The ESP32 is the peripheral and advertises a name plus a service UUID. The phone is the central. A write is a short value to one characteristic, not a stream of serial bytes. Bluetooth Classic SPP is a different radio profile. This sketch never starts it, which is why a Classic terminal cannot connect, including on phones that only expose BLE to apps.


**Text: RGB mixing**

The three dice sit in one lens. 255,0,0 is red. 0,255,0 is green. 0,0,255 is blue. 255,255,255 turns all three on and looks white or slightly tinted, because red passes more current through the same 220 Ω. 255,80,0 is red plus a little green, which reads as orange. The numbers are not watts. They are fractions of each channel’s current from the 5V pin.

### Step 25 of 25

Stage 9: Final check

Stored sort_order: 24. Stored stage_sort_order: 8.

Heading: Final verification checklist

Description: Walk this list once on the bench. A printed line that you have not seen is still unchecked.

Tip: None.


**Test: Checklist**

The longest lead is pin 2, the common anode, and it is on the 5V rail. The lead nearest the flat is pin 1, red, and it reaches ground only through 220 red and Q red from IO25. Pin 3 is blue, through 220 blue and Q blue from IO27. Pin 4 is green, through 220 green and Q green from IO26. IO25, IO26, and IO27 each reach only their own 1 kΩ resistor. The 3V3 header is empty, and no second supply is on the 5V pin. The board is ESP32 Dev Module and the upload finished. Serial shows the power-on red line and “Advertising as Solderi RGB.” Pin 1 lights red at power-on. nRF Connect connects to Solderi RGB. Colour text 0,0,255 turns pin 3 blue and Serial prints Colour 0,0,255. Colour text 0,255,0 turns pin 4 green. Brightness text 48 changes the level, brightness text 0 turns it off, and brightness text 100 restores it. Disconnecting the phone prints the advertising-again line and leaves the last colour lit.


**Expected result: What you have now**

An ESP32 DevKit mixes one common-anode RGB LED from the 5V pin, with GPIO25, GPIO26, and GPIO27 switching PN2222A transistors, and a phone changes that mix with nRF Connect over BLE. The project is still unpublished, and a completed checklist on your bench is the hardware test this repository has not recorded.

## 7. Electrical connections and wiring diagram

These connections are the “Every electrical connection” table stored in the walkthrough. The same rows are the local connection list.

1. ESP32 DevKit 5V → Breadboard 5V rail (power)
2. Breadboard 5V rail → RGB LED Anode (power)
3. ESP32 DevKit GND → Breadboard GND rail (ground)
4. Breadboard GND rail → Q red Emitter (ground)
5. Breadboard GND rail → Q green Emitter (ground)
6. Breadboard GND rail → Q blue Emitter (ground)
7. ESP32 DevKit IO25 → 1k red leg 1 (signal)
8. 1k red leg 2 → Q red Base (signal)
9. Q red Collector → 220 red leg 1 (signal)
10. 220 red leg 2 → RGB LED Red (signal)
11. ESP32 DevKit IO26 → 1k green leg 1 (signal)
12. 1k green leg 2 → Q green Base (signal)
13. Q green Collector → 220 green leg 1 (signal)
14. 220 green leg 2 → RGB LED Green (signal)
15. ESP32 DevKit IO27 → 1k blue leg 1 (signal)
16. 1k blue leg 2 → Q blue Base (signal)
17. Q blue Collector → 220 blue leg 1 (signal)
18. 220 blue leg 2 → RGB LED Blue (signal)

The on-screen diagram is drawn from the local layout for slug `24`. It is not a separate image file. Wiring steps pass their connection lists to that layout. Earlier wiring blocks are prefixes of this list; the diagram highlights the active step and draws the earlier wires as already present.

Layout slug: `24`

Canvas: 360 × 560

Wire labels: ground `GND`, pwm `PWM`, powerLogic `5V`.

The breadboard element does not set a custom rail caption, so the symbol prints “+ 5V” and “− GND”.

Routed wires from the local layout and the connection list: 18. Kinds: pwm, pwm, pwm, pwm, pwm, pwm, pwm, pwm, ground, pwm, ground, ground, powerLogic, powerLogic, ground, pwm, pwm, pwm.

- ESP32 DevKit (`esp32`, kind `esp32-devkit`)
  Aliases: esp32, esp32 devkit
  Position: x 8, y 8, width 120, height 168
  Port 5V (`v5`): dx 128, dy 28; aliases 5v
  Port GND (`gnd`): dx 128, dy 58; aliases gnd
  Port IO25 (`io25`): dx 128, dy 96; aliases io25, gpio25
  Port IO26 (`io26`): dx 128, dy 128; aliases io26, gpio26
  Port IO27 (`io27`): dx 128, dy 156; aliases io27, gpio27
- Breadboard (`breadboard`, kind `breadboard`)
  Aliases: breadboard
  Position: x 8, y 184, width 344, height 364
  Port 5V rail (`plus`): dx 210, dy 19; aliases 5vrail, plusrail
  Port GND rail (`minus`): dx 142, dy 43; aliases gndrail
- 1k red (`base-red`, kind `resistor`)
  Aliases: red 1k, red base resistor
  Position: x 20, y 268, width 96, height 26
  resistorOhms: 1000
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- Q red (`q-red`, kind `npn`)
  Aliases: red transistor, red pn2222a
  Position: x 128, y 260, width 44, height 46
  Port Base (`base`): dx 0, dy 20; aliases b
  Port Collector (`collector`): dx 44, dy 10; aliases c
  Port Emitter (`emitter`): dx 22, dy 46; aliases e
- 220 red (`limit-red`, kind `resistor`)
  Aliases: red 220, red limiter
  Position: x 184, y 268, width 96, height 26
  resistorOhms: 220
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- 1k green (`base-green`, kind `resistor`)
  Aliases: green 1k, green base resistor
  Position: x 20, y 360, width 96, height 26
  resistorOhms: 1000
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- Q green (`q-green`, kind `npn`)
  Aliases: green transistor, green pn2222a
  Position: x 128, y 352, width 44, height 46
  Port Base (`base`): dx 0, dy 20; aliases b
  Port Collector (`collector`): dx 44, dy 10; aliases c
  Port Emitter (`emitter`): dx 22, dy 46; aliases e
- 220 green (`limit-green`, kind `resistor`)
  Aliases: green 220, green limiter
  Position: x 184, y 360, width 96, height 26
  resistorOhms: 220
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- 1k blue (`base-blue`, kind `resistor`)
  Aliases: blue 1k, blue base resistor
  Position: x 20, y 452, width 96, height 26
  resistorOhms: 1000
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- Q blue (`q-blue`, kind `npn`)
  Aliases: blue transistor, blue pn2222a
  Position: x 128, y 444, width 44, height 46
  Port Base (`base`): dx 0, dy 20; aliases b
  Port Collector (`collector`): dx 44, dy 10; aliases c
  Port Emitter (`emitter`): dx 22, dy 46; aliases e
- 220 blue (`limit-blue`, kind `resistor`)
  Aliases: blue 220, blue limiter
  Position: x 184, y 452, width 96, height 26
  resistorOhms: 220
  Port leg 1 (`leg1`): dx 0, dy 13; aliases leg1
  Port leg 2 (`leg2`): dx 96, dy 13; aliases leg2
- RGB LED (`led`, kind `rgb-led`)
  Aliases: rgb led, common anode rgb
  Position: x 292, y 250, width 56, height 140
  Port Red (`red`): dx 0, dy 52; aliases redcathode, pin1
  Port Anode (`anode`): dx 0, dy 74; aliases commonanode, pin2
  Port Blue (`blue`): dx 0, dy 96; aliases bluecathode, pin3
  Port Green (`green`): dx 0, dy 118; aliases greencathode, pin4

The written wiring names pin 1 red, pin 2 the common anode, pin 3 blue, and pin 4 green. The diagram labels those same leads Red, Anode, Blue, and Green from top to bottom. The connection table uses the colour names, not the pin numbers. The 220 Ω tip says the bands are red, red, brown, gold. The diagram’s 220 Ω symbols use the default resistor drawing: two red bands and one gold band, without a brown multiplier band. The 1 kΩ symbols draw brown, black, red, and gold, matching that tip.

## 8. Code snippets shown in the walkthrough

Each snippet is printed in full inside its step above. This list is the snippet inventory.

- Step 16, See how PWM sets each colour, block 2: `esp32_ble_rgb_controller.ino` (8 lines)
- Step 17, See how BLE accepts colour and brightness, block 2: `esp32_ble_rgb_controller.ino` (26 lines)
- Step 18, Paste the complete sketch and upload it, block 1: `esp32_ble_rgb_controller.ino` (231 lines)

## 9. Complete firmware stored in the tutorial

This is the program stored in step 18 (“Paste the complete sketch and upload it”). It is repeated here so the firmware can be read on its own. The local constant `ESP32_BLE_RGB_FIRMWARE` is compared with it in the discrepancy section.

```arduino
/*
 * ESP32 Bluetooth RGB LED Controller
 * Board: ESP32 Dev Module
 * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode
 * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode
 * DevKit 5V pin -> pin 2
 * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode
 * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode
 * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode
 * Emitters and DevKit GND share the ground rail
 * A higher PWM duty turns the transistor on for longer
 * Phone app: nRF Connect for Mobile
 * One write format: UTF-8 text
 * Colour: 255,80,0
 * Brightness: 0, 48, or 100
 * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

const int RED_PIN = 25;
const int GREEN_PIN = 26;
const int BLUE_PIN = 27;
const int PWM_FREQUENCY_HZ = 5000;
const int PWM_RESOLUTION_BITS = 8;
const size_t MAX_TEXT_BYTES = 16;

const char *DEVICE_NAME = "Solderi RGB";
const char *SERVICE_UUID = "8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24";
const char *COLOR_UUID = "8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24";
const char *BRIGHTNESS_UUID = "8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24";

int redValue = 255;
int greenValue = 0;
int blueValue = 0;
int brightnessPercent = 30;

bool clientConnected = false;

int channelDuty(int channel) {
  return (int)(((long)channel * (long)brightnessPercent) / 100L);
}

void applyColour() {
  ledcWrite(RED_PIN, channelDuty(redValue));
  ledcWrite(GREEN_PIN, channelDuty(greenValue));
  ledcWrite(BLUE_PIN, channelDuty(blueValue));
}

bool digitsOnly(const String &text) {
  if (text.length() == 0) {
    return false;
  }
  for (int i = 0; i < text.length(); i++) {
    char letter = text.charAt(i);
    if (letter < '0' || letter > '9') {
      return false;
    }
  }
  return true;
}

bool copyTextPayload(const uint8_t *data, size_t length, String &text) {
  text = "";
  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {
    return false;
  }
  for (size_t i = 0; i < length; i++) {
    char letter = (char)data[i];
    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';
    if (!allowed) {
      return false;
    }
    text += letter;
  }
  text.trim();
  return text.length() > 0;
}

bool parseColourText(const String &text) {
  if (text.indexOf(',') < 0) {
    return false;
  }
  int first = text.indexOf(',');
  int second = text.indexOf(',', first + 1);
  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {
    return false;
  }

  String redText = text.substring(0, first);
  String greenText = text.substring(first + 1, second);
  String blueText = text.substring(second + 1);
  redText.trim();
  greenText.trim();
  blueText.trim();
  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {
    return false;
  }

  long red = redText.toInt();
  long green = greenText.toInt();
  long blue = blueText.toInt();
  if (red > 255 || green > 255 || blue > 255) {
    return false;
  }

  redValue = (int)red;
  greenValue = (int)green;
  blueValue = (int)blue;
  return true;
}

bool parseBrightnessText(const String &text) {
  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {
    return false;
  }
  long value = text.toInt();
  if (value > 100) {
    return false;
  }
  brightnessPercent = (int)value;
  return true;
}

String colourText() {
  return String(redValue) + "," + String(greenValue) + "," + String(blueValue);
}

String brightnessText() {
  return String(brightnessPercent);
}

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    (void)server;
    clientConnected = true;
    Serial.println("Phone connected.");
  }

  void onDisconnect(BLEServer *server) override {
    (void)server;
    clientConnected = false;
    Serial.println("Phone disconnected. Advertising again.");
    BLEDevice::startAdvertising();
  }
};

class ColorCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String text;
    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);
    if (!accepted) {
      characteristic->setValue(colourText());
      Serial.print("Colour rejected: ");
      Serial.println(text);
      return;
    }

    applyColour();
    characteristic->setValue(colourText());
    Serial.print("Colour ");
    Serial.println(colourText());
  }
};

class BrightnessCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String text;
    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);
    if (!accepted) {
      characteristic->setValue(brightnessText());
      Serial.print("Brightness rejected: ");
      Serial.println(text);
      return;
    }

    applyColour();
    characteristic->setValue(brightnessText());
    Serial.print("Brightness ");
    Serial.println(brightnessPercent);
  }
};

void setup() {
  Serial.begin(115200);
  delay(300);

  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {
    Serial.println("PWM setup failed.");
  }
  applyColour();

  Serial.println("ESP32 Bluetooth RGB LED controller");
  Serial.println("Power-on colour is red at 30 percent brightness.");

  BLEDevice::init(DEVICE_NAME);
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService *service = server->createService(SERVICE_UUID);

  BLECharacteristic *colorCharacteristic = service->createCharacteristic(
    COLOR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  colorCharacteristic->setCallbacks(new ColorCallbacks());
  colorCharacteristic->setValue(colourText());

  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(
    BRIGHTNESS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());
  brightnessCharacteristic->setValue(brightnessText());

  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Advertising as Solderi RGB.");
}

void loop() {
  delay(200);
}

```

## 10. BLE identifiers and expected writes

These values are the string literals in the stored sketch:

- Device name: `Solderi RGB`
- Service UUID: `8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24`
- Colour characteristic UUID: `8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24`
- Brightness characteristic UUID: `8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24`

The sketch comments and the phone-control steps state the write format. Colour writes are UTF-8 text such as `255,80,0`, `0,0,255`, and `0,255,0`, with each number from 0 to 255. Brightness writes are UTF-8 text from `0` to `100`, including `0`, `48`, `30`, and `100`. The stored sketch prints `Colour ` plus the stored colour text after an accepted colour write, and `Brightness ` plus the number after an accepted brightness write. Rejected writes print `Colour rejected: ` or `Brightness rejected: ` and restore the previous text. Power-on serial lines in the stored sketch are `ESP32 Bluetooth RGB LED controller`, `Power-on colour is red at 30 percent brightness.`, and `Advertising as Solderi RGB.` Connection lines are `Phone connected.` and `Phone disconnected. Advertising again.`

The phone procedure, including the nRF Connect field names and the UTF-8 hex fallbacks, is copied in full in the phone-control steps.

## 11. Libraries and setup

Libraries named by the local firmware constant, and also named on the stored code blocks:

- BLE (ESP32 Arduino core)
- LEDC (ESP32 Arduino core)

Setup instructions are the Development environment and Firmware steps. They are copied in full in section 6, including the boards URL `https://espressif.github.io/arduino-esp32/package_esp32_index.json` and the board name ESP32 Dev Module.

## 12. Troubleshooting

Troubleshooting text is in the serial-port step and the two troubleshooting steps. Those steps are copied in full in section 6.

## Database and local-source discrepancies

The stored project row, bill of materials, catalogue descriptions, requirement roles, substitution policies, constraints, and all 25 step titles, descriptions, tips, stages, and blocks match the local authoring files. Pin-role rows: 0. Substitution-review rows: 0. The firmware string stored in the upload step matches `ESP32_BLE_RGB_FIRMWARE`. Every code block in the stored steps is contained in that sketch. The stored “Every electrical connection” table matches the local connection list, and every connection resolves on the local diagram.

Diagram and written instructions:

The written wiring names pin 1 red, pin 2 the common anode, pin 3 blue, and pin 4 green. The diagram labels those same leads Red, Anode, Blue, and Green from top to bottom. The connection table uses the colour names, not the pin numbers. The 220 Ω tip says the bands are red, red, brown, gold. The diagram’s 220 Ω symbols use the default resistor drawing: two red bands and one gold band, without a brown multiplier band. The 1 kΩ symbols draw brown, black, red, and gold, matching that tip.

## Missing content

- No photographic project cover is stored. The cover key `esp32BleRgb` is a placeholder in the app.
- No rendered picture of the wiring diagram is stored. The diagram data is the layout in section 7.
- No pin-profile rows are stored for the LED, the transistor, or the ESP32. The pinouts are the catalogue descriptions and the walkthrough text.
- No approved substitutions, pin roles, or substitution reviews are stored.
- Explain Code does not contain an explanation. The button opens a coming-soon dialog.
