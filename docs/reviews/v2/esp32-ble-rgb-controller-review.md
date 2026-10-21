# ESP32 Bluetooth RGB LED Controller

Review export generated from the current Supabase project record. This file is not a grade and it does not rewrite the tutorial.

## How to read the claims

- Tutorial sentences below are the Supabase text.
- Manufacturer-stated facts are only the sentences that name a datasheet, product page, or support reply.
- Firmware compilation is recorded separately. Project 24 compiled as passed for `esp32:esp32:esp32` (ESP32 Dev Module (ESP32-DevKitC V4)). Checksum `75b44cdd`.
- No project in this export was run on the specified hardware. Expected behaviour is not tested behaviour.

## Project record

- Slug: 24
- Title: ESP32 Bluetooth RGB LED Controller
- Difficulty: intermediate
- Published: false
- Description: Intermediate build. Mix a red, green, and blue LED from a phone over Bluetooth Low Energy, using transistor switches and PWM.
- Steps: 22

## Local and database comparison

Titles, descriptions, tips, stage names, and content blocks match the local walkthrough for every step.

The local authoritative firmware appears once, unchanged, in the Supabase code blocks.

## Bill of materials

### ESP32-DevKitC V4

- Catalogue id: `esp32-devkitc-v4`
- Catalogue description: Espressif ESP32-DevKitC V4 with male 0.1 inch headers and a Micro-USB socket. Header J2 starts 3V3, EN, and ends 5V. Header J3 includes IO22 and IO21.
- Category: microcontrollers
- Quantity: 1
- Sort order: 1
- Requirement role: microcontroller
- Substitution policy: exact
- Constraints: (none stored)

### Common-anode RGB LED

- Catalogue id: `rgb-led-ca`
- Catalogue description: Kingbright WP154A4SEJ3VBDZGW/CA, a white-diffused 5 mm common-anode RGB LED. Datasheet DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, draws pin 1 as the red cathode, pin 2 as the common anode, pin 3 as the blue cathode, and pin 4 as the green cathode. The end view puts the flat of the flange next to pin 1. The package drawing labels the anode lead and shows it 2.5 mm minimum longer than the other leads. At 20 mA the forward voltage is 2.2 V typical and 2.8 V maximum for red, 3.3 V typical and 4.0 V maximum for blue, and 3.3 V typical and 4.1 V maximum for green. Absolute maximum DC forward current is 30 mA for red, 30 mA for blue, and 25 mA for green. This row is not a common-cathode LED and not an addressable pixel.
- Category: modules
- Quantity: 1
- Sort order: 2
- Requirement role: rgb_led
- Substitution policy: exact
- Constraints: (none stored)

### PN2222A transistor

- Catalogue id: `pn2222a`
- Catalogue description: onsemi PN2222ABU, the bulk TO-92 formerly listed by Fairchild. Top mark PN2222A. The PN2222A Rev. 1.1.0 package sketch labels the leads E, B, C: flat face toward you and leads down, left to right is emitter, base, collector. A metal-can 2N2222, and some other TO-92 parts with a similar mark, use a different order. Absolute maximum collector current is 1 A. Used as a low-side switch.
- Category: modules
- Quantity: 3
- Sort order: 3
- Requirement role: led_switch
- Substitution policy: exact
- Constraints: (none stored)

### 220 Ω resistor

- Catalogue id: `resistor-220`
- Catalogue description: Current-limiting resistor for a typical 5 V LED
- Category: modules
- Quantity: 3
- Sort order: 4
- Requirement role: led_limiter
- Substitution policy: exact
- Constraints: (none stored)

### 1 kΩ resistor

- Catalogue id: `resistor-1k`
- Catalogue description: 1 kΩ through-hole resistor
- Category: modules
- Quantity: 3
- Sort order: 5
- Requirement role: base_resistor
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

### Male-to-female jumper wires

- Catalogue id: `jumper-male-female`
- Catalogue description: Dupont wires with a female socket on one end and a male pin on the other. The socket fits a male header pin.
- Category: modules
- Quantity: 5
- Sort order: 7
- Requirement role: header_wires
- Substitution policy: exact
- Constraints: (none stored)

### Jumper Wires

- Catalogue id: `jumper-wires`
- Catalogue description: Dupont jumper wire pack
- Category: modules
- Quantity: 8
- Sort order: 8
- Requirement role: jumper_wires
- Substitution policy: exact
- Constraints: (none stored)

### USB data cable

- Catalogue id: `usb-data-cable`
- Catalogue description: Data-capable USB cable. Match the plug to the board: Arduino Uno R3 uses USB-B, and Espressif ESP32-DevKitC V4 uses Micro-B. A charge-only cable can power a board and still fail upload.
- Category: modules
- Quantity: 1
- Sort order: 9
- Requirement role: usb_cable
- Substitution policy: exact
- Constraints: (none stored)

### USB power source

- Catalogue id: `usb-power-source`
- Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.
- Category: power
- Quantity: 1
- Sort order: 10
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
- Board: ESP32 Dev Module (ESP32-DevKitC V4)
- FQBN: `esp32:esp32:esp32`
- Sketch checksum: `75b44cdd`
- Hardware testing: not run. Do not treat this compile as a working build.

## Authoritative firmware

This is the local final sketch. The comparison above says whether the Supabase upload block is the same text.

```cpp
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

## Wiring and physical layout

Diagram geometry is local source. It is not a Supabase column. These are the current layout identities.

- Layout slug: 24
- Breadboard rows: 17
- ESP32 DevKit (`esp32`, esp32-devkit) catalogue `esp32-devkitc-v4`. Role: Receives the colour from the phone and drives the three transistors. Ports: 5V, GND, IO25, IO26, IO27.
- Breadboard (`breadboard`, breadboard) catalogue `breadboard`. Role: Joins leads that share a numbered row on the same side of the centre gap. Ports: 5V rail, GND rail.
- 1k red (`base-red`, resistor) catalogue `resistor-1k`. Role: Limits base current for the red transistor. Ports: leg 1, leg 2.
- Q red (`q-red`, npn) catalogue `pn2222a`. Role: Switches the red LED channel. Ports: Base, Collector, Emitter.
- 220 red (`limit-red`, resistor) catalogue `resistor-220`. Role: Limits current in the red LED channel. Ports: leg 1, leg 2.
- 1k green (`base-green`, resistor) catalogue `resistor-1k`. Role: Limits base current for the green transistor. Ports: leg 1, leg 2.
- Q green (`q-green`, npn) catalogue `pn2222a`. Role: Switches the green LED channel. Ports: Base, Collector, Emitter.
- 220 green (`limit-green`, resistor) catalogue `resistor-220`. Role: Limits current in the green LED channel. Ports: leg 1, leg 2.
- 1k blue (`base-blue`, resistor) catalogue `resistor-1k`. Role: Limits base current for the blue transistor. Ports: leg 1, leg 2.
- Q blue (`q-blue`, npn) catalogue `pn2222a`. Role: Switches the blue LED channel. Ports: Base, Collector, Emitter.
- 220 blue (`limit-blue`, resistor) catalogue `resistor-220`. Role: Limits current in the blue LED channel. Ports: leg 1, leg 2.
- RGB LED (`led`, rgb-led) catalogue `rgb-led-ca`. Role: Lights in the colour sent from the phone. Current enters the long common-anode lead. Ports: Red, Anode, Blue, Green.
- Jumper `devkit-5v` (male-female)
- Jumper `devkit-gnd` (male-female)
- Jumper `devkit-io25` (male-female)
- Jumper `devkit-io26` (male-female)
- Jumper `devkit-io27` (male-female)
- Jumper `red-emitter` (male-male)
- Jumper `green-emitter` (male-male)
- Jumper `blue-emitter` (male-male)
- Jumper `anode-rail` (male-male)
- Jumper `bridge-plus` (male-male)
- Jumper `bridge-minus` (male-male)
- Jumper `green-cathode` (male-male)
- Jumper `blue-cathode` (male-male)

## Known technical limitations

These notes are for the reviewer. They are not extra tutorial steps.

- This export does not record a physical build.
- The Kingbright common-anode lead order used by the layout was not re-read from the package drawing in this pass.
- Green and blue are expected to look dimmer than red on USB power. The circuit and firmware were not changed for this export.

## Tutorial

## Step 1

- Stage order: 0
- Stage: Introduction
- Title: Build a phone-controlled colour light

**Description**

One RGB LED follows the colour and brightness a phone sends.

**Tip**

(none)

#### Block 1: image

**Image key**

esp32BleRgb

**Caption**

The workbench photograph is not in the app yet. The wiring diagram is the connection reference.

#### Block 2: text

**Heading**

What you are building

**Body**

An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching.

#### Block 3: text

**Heading**

What it will do

**Body**

After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer.

## Step 2

- Stage order: 0
- Stage: Introduction
- Title: Follow one colour from the phone to the LED

**Description**

The phone sends text. The ESP32 switches current from the 5 V pin.

**Tip**

(none)

#### Block 1: text

**Heading**

Four parts, four jobs

**Body**

The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor.

#### Block 2: text

**Heading**

Why the transistor is there

**Body**

This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on.

#### Block 3: warning

**Body**

Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode.

#### Block 4: tip

**Body**

Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V.

## Step 3

- Stage order: 1
- Stage: Hardware preparation
- Title: Set the parts on the desk

**Description**

Five male-to-female wires reach the DevKit. Eight male-to-male wires finish the board.

**Tip**

(none)

#### Block 1: components

**Heading**

Required parts

- ESP32-DevKitC V4 ×1 — catalogue id `esp32-devkitc-v4`, illustration `esp32`, owned false
- Common-anode RGB LED ×1 — catalogue id `rgb-led-ca`, illustration `led`, owned false
- PN2222A transistor ×3 — catalogue id `pn2222a`, illustration `generic-module`, owned false
- 220 Ω resistor ×3 — catalogue id `resistor-220`, illustration `resistor-band-220`, owned false
- 1 kΩ resistor ×3 — catalogue id `resistor-1k`, illustration `resistor-band-1k`, owned false
- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard`, owned false
- Male-to-female jumper wires ×5 — catalogue id `jumper-male-female`, illustration `jumper-wires`, owned false
- Male-to-male jumper wires ×8 — catalogue id `jumper-wires`, illustration `jumper-wires`, owned false
- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable`, owned false
- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module`, owned false

#### Block 2: text

**Heading**

Count the wires before you start

**Body**

The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it.

#### Block 3: text

**Body**

You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list.

## Step 4

- Stage order: 1
- Stage: Hardware preparation
- Title: Confirm the LED is common anode

**Description**

Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.

**Tip**

(none)

#### Block 1: text

**Heading**

Find the leads

**Body**

Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens.

#### Block 2: text

**Heading**

The datasheet detail

**Body**

Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them.

#### Block 3: warning

**Body**

A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it.

## Step 5

- Stage order: 1
- Stage: Hardware preparation
- Title: Know the transistors and the resistors

**Description**

Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.

**Tip**

(none)

#### Block 1: text

**Heading**

Which way the transistor faces

**Body**

Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order.

#### Block 2: text

**Heading**

Why each resistor is there

**Body**

The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current. On USB power, green and blue look dimmer than red because those chips have a higher forward voltage.

#### Block 3: tip

**Body**

A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them.

## Step 6

- Stage order: 2
- Stage: Wiring
- Title: Seat every part on these rows

**Description**

Use rows 1–15. The physical diagram names the same holes.

**Tip**

(none)

#### Block 1: warning

**Body**

Holes a–e in one numbered row are joined. Holes f–j with the same number are a separate connection. Do not put two transistor leads in one row, or two LED leads in one row.

#### Block 2: text

**Heading**

The LED

**Body**

Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9.

#### Block 3: text

**Heading**

Red channel, left half

**Body**

Transistor flat to the right: emitter c1, base c2, collector c3. The 1 kΩ leads go in e2 and i2. The 220 Ω leads go in e3 and h6. h6 shares the right-hand row with f6. The resistor body sits above the gap and does not enter f6.

#### Block 4: text

**Heading**

Green channel, left half

**Body**

Emitter c10, base c11, collector c12, flat to the right. The 1 kΩ leads go in e11 and i11. The 220 Ω leads go in a12 and d15, on the left half. A male-to-male wire from b15 to j9 carries that node to f9. The wire arches over the board and enters only those two holes.

#### Block 5: text

**Heading**

Blue channel, right half

**Body**

Emitter h13, base h14, collector h15, flat to the right. The 1 kΩ leads go in e14 and g14. The 220 Ω leads go in j15 and g12. A male-to-male wire from j12 to j8 carries that node to f8. It stays in column j, arches over j9, and does not enter j9.

#### Block 6: wiring

**Heading**

Where the parts sit

**Connections**


**Progressive assembly**

Parts: led, q-red, q-green, q-blue, base-red, base-green, base-blue, limit-red, limit-green, limit-blue

Jumpers: (none)

#### Block 7: test

**Heading**

Checkpoint

**Body**

Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet.

## Step 7

- Stage order: 2
- Stage: Wiring
- Title: Connect 5 V and ground

**Description**

Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.

**Tip**

(none)

#### Block 1: text

**Body**

Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a1 to the left − rail at row 3, a10 to the left − rail at row 10, and j13 to the right − rail at row 13. Leave USB unplugged.

#### Block 2: wiring

**Heading**

Supply and ground

**Connections**

- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)

**Progressive assembly**

Parts: (none)

Jumpers: devkit-5v, devkit-gnd, bridge-plus, bridge-minus, anode-rail, red-emitter, green-emitter, blue-emitter

#### Block 3: connections

**Heading**

These six links

**Connections**

- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)

#### Block 4: test

**Heading**

Checkpoint

**Body**

Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a1, a10, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged.

## Step 8

- Stage order: 2
- Stage: Wiring
- Title: Build the red channel

**Description**

GPIO25 switches the red cathode through j2 and f6.

**Tip**

(none)

#### Block 1: text

**Body**

Join DevKit GPIO25 to j2 with a male-to-female wire. e2 and i2 hold the red 1 kΩ. c2 is the base. e3 and h6 hold the red 220 Ω, and f6 is LED pin 1.

#### Block 2: wiring

**Heading**

Red channel

**Connections**

- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)

**Progressive assembly**

Parts: (none)

Jumpers: devkit-io25

#### Block 3: connections

**Heading**

Red links

**Connections**

- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)

#### Block 4: test

**Heading**

Checkpoint

**Body**

GPIO25 is in j2, the 1 kΩ in e2 and i2, and the base in c2. The collector is c3 and the 220 Ω meets it at e3 and the LED at h6. No two of those leads share one hole.

## Step 9

- Stage order: 2
- Stage: Wiring
- Title: Build the green channel

**Description**

GPIO26 switches the green cathode through j11, b15, and f9.

**Tip**

(none)

#### Block 1: text

**Body**

Join GPIO26 to j11. The green 1 kΩ is in e11 and i11, the base is c11, and the 220 Ω runs from a12 to d15. Add the male-to-male wire from b15 to j9. j9 shares the row with LED pin 4 in f9.

#### Block 2: wiring

**Heading**

Green channel

**Connections**

- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)

**Progressive assembly**

Parts: (none)

Jumpers: devkit-io26, green-cathode

#### Block 3: connections

**Heading**

Green links

**Connections**

- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)

#### Block 4: test

**Heading**

Checkpoint

**Body**

GPIO26 is in j11. The 1 kΩ lead is not in c10, c11, or c12. The b15 to j9 wire is the only extra lead in the green cathode row. f9 still holds the LED lead.

## Step 10

- Stage order: 2
- Stage: Wiring
- Title: Build the blue channel

**Description**

GPIO27 switches the blue cathode through a14, j12, and f8.

**Tip**

(none)

#### Block 1: text

**Body**

Join GPIO27 to a14. The blue 1 kΩ is in e14 and g14, the base is h14, and the 220 Ω runs from j15 to g12. Add the male-to-male wire from j12 to j8. j8 shares the row with LED pin 3 in f8. The wire arches over j9 and does not enter it.

#### Block 2: wiring

**Heading**

Blue channel

**Connections**

- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

**Progressive assembly**

Parts: (none)

Jumpers: devkit-io27, blue-cathode

#### Block 3: connections

**Heading**

Blue links

**Connections**

- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

#### Block 4: test

**Heading**

Checkpoint

**Body**

GPIO27 is in a14. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each. j9 is only the green link.

## Step 11

- Stage order: 2
- Stage: Wiring
- Title: Check the whole circuit, then plug in USB

**Description**

This is the only full connection list. Use it once, before power.

**Tip**

(none)

#### Block 1: connections

**Heading**

All 18 connections

**Summary**

Five male-to-female wires leave the DevKit. Eight male-to-male wires join the rails, the emitters, and the green and blue cathode links. Every other join is two leads in the same five-hole row.

**Connections**

- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)
- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)
- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)
- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

#### Block 2: wiring

**Heading**

Finished arrangement

**Connections**

- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)
- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)
- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)
- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

#### Block 3: test

**Heading**

Before USB

**Body**

LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply.

## Step 12

- Stage order: 3
- Stage: Development environment
- Title: Install the ESP32 board package

**Description**

The Arduino IDE needs the Espressif package before it can see this board.

**Tip**

(none)

#### Block 1: text

**Body**

Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach.

#### Block 2: tip

**Body**

If the board list has no ESP32 Dev Module after the install, close the IDE and open it again.

## Step 13

- Stage order: 3
- Stage: Development environment
- Title: Select the board and the port

**Description**

The sketch talks to the computer at 115200 baud.

**Tip**

(none)

#### Block 1: text

**Body**

Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing.

#### Block 2: expected

**Heading**

If the port is missing

**Body**

Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in.

## Step 14

- Stage order: 4
- Stage: Firmware
- Title: See how PWM sets the brightness

**Description**

GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.

**Tip**

(none)

#### Block 1: text

**Heading**

Why these pins

**Body**

GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter.

#### Block 2: text

**Body**

The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment.

#### Block 3: code

**Language**

cpp

**Filename**

excerpt-brightness.ino

**Code**

```cpp
int channelDuty(int channel) {
  return (int)(((long)channel * (long)brightnessPercent) / 100L);
}

void applyColour() {
  ledcWrite(RED_PIN, channelDuty(redValue));
  ledcWrite(GREEN_PIN, channelDuty(greenValue));
  ledcWrite(BLUE_PIN, channelDuty(blueValue));
```

#### Block 4: text

**Heading**

What that excerpt does

**Body**

channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour.

#### Block 5: text

**Body**

This second excerpt is the setup that attaches those pins. Do not upload it on its own.

#### Block 6: code

**Language**

cpp

**Filename**

excerpt-pwm-setup.ino

**Code**

```cpp
if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {
    Serial.println("PWM setup failed.");
  }
  applyColour();
```

#### Block 7: text

**Heading**

What ledcAttach does

**Body**

ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent.

## Step 15

- Stage order: 4
- Stage: Firmware
- Title: Watch the write 255,80,0 travel through the sketch

**Description**

A characteristic is one value the phone can read or write.

**Tip**

(none)

#### Block 1: text

**Heading**

The path of one colour

**Body**

The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it.

#### Block 2: text

**Body**

Both blocks below are excerpts. The complete sketch is in the next step.

#### Block 3: code

**Language**

cpp

**Filename**

excerpt-advertise.ino

**Code**

```cpp
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

#### Block 4: code

**Language**

cpp

**Filename**

excerpt-colour-write.ino

**Code**

```cpp
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
```

#### Block 5: text

**Heading**

Rejected writes and a disconnect

**Body**

A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED.

#### Block 6: code

**Language**

cpp

**Filename**

excerpt-disconnect.ino

**Code**

```cpp
void onDisconnect(BLEServer *server) override {
    (void)server;
    clientConnected = false;
    Serial.println("Phone disconnected. Advertising again.");
    BLEDevice::startAdvertising();
```

## Step 16

- Stage order: 4
- Stage: Firmware
- Title: Upload the complete sketch

**Description**

This is the program to copy. The earlier blocks were excerpts.

**Tip**

(none)

#### Block 1: text

**Body**

Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB.

#### Block 2: code

**Language**

cpp

**Filename**

esp32-ble-rgb-controller.ino

**Libraries**

[
  "BLE (ESP32 Arduino core)",
  "LEDC (ESP32 Arduino core)"
]

**Code**

```cpp
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

#### Block 3: expected

**Heading**

After a successful upload

**Body**

The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it.

## Step 17

- Stage order: 5
- Stage: Phone control
- Title: Find Solderi RGB in nRF Connect

**Description**

Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.

**Tip**

(none)

#### Block 1: text

**Body**

Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral.

#### Block 2: text

**Heading**

The service, once

**Body**

After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write.

#### Block 3: expected

**Heading**

When the connection works

**Body**

nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24.

## Step 18

- Stage order: 5
- Stage: Phone control
- Title: Write a colour as text

**Description**

The write format is UTF-8 text, three numbers separated by commas.

**Tip**

(none)

#### Block 1: text

**Body**

On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent.

#### Block 2: text

**Heading**

If the app asks for hex

**Body**

Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text.

#### Block 3: warning

**Body**

Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas.

## Step 19

- Stage order: 5
- Stage: Phone control
- Title: Change brightness, then disconnect and come back

**Description**

Brightness is a second text value, from 0 to 100.

**Tip**

(none)

#### Block 1: text

**Body**

On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red.

#### Block 2: text

**Body**

A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected.

#### Block 3: tip

**Body**

Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted.

## Step 20

- Stage order: 6
- Stage: Troubleshooting
- Title: Fix the light before you blame the phone

**Description**

Match the symptom, then work down the checks.

**Tip**

(none)

#### Block 1: troubleshooting

**Heading**

The LED itself

**Item 1**

Problem: The LED stays dark after upload.

Solution: The usual causes are USB not powering the board, the anode off the + rail, or an emitter off the − rail. Confirm the monitor prints the advertising line. The anode jumper is j7 on the right + rail, and the two + rails are bridged on row 1. Emitters are a1 and a10 on the left − rail and j13 on the right − rail, with the − rails bridged on row 1. Those rows are above the rail break. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed: pin 2, the anode, is the lead in f7.

**Item 2**

Problem: Only red lights. Green and blue stay off.

Solution: Either those links are in the wrong holes, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, confirm the green wire is in b15 and j9, and the blue wire is in j12 and j8. j9 shares the row with LED pin 4 in f9. j8 shares the row with LED pin 3 in f8. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark.

**Item 3**

Problem: One colour is stuck on, or two colours light together.

Solution: Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin.

**Item 4**

Problem: The LED is very hot or a resistor smells.

Solution: Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step.

## Step 21

- Stage order: 6
- Stage: Troubleshooting
- Title: Fix the phone connection

**Description**

The board has to be advertising before the phone can write.

**Tip**

(none)

#### Block 1: troubleshooting

**Heading**

nRF Connect

**Item 1**

Problem: Solderi RGB never appears in the scanner.

Solution: The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds.

**Item 2**

Problem: The app connects, then the write does nothing.

Solution: The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255.

**Item 3**

Problem: Upload never finishes.

Solution: The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line.

**Item 4**

Problem: It worked once, and the phone cannot reconnect.

Solution: Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan.

## Step 22

- Stage order: 7
- Stage: Final check
- Title: Walk the finished controller

**Description**

Do these in order and compare the LED with each line.

**Tip**

(none)

#### Block 1: text

**Body**

The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct.

#### Block 2: expected

**Heading**

Checklist

**Body**

The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0.

## Supporting notes

NOT CURRENTLY SHOWN TO USERS

The app does not render `constants/walkthroughs/supporting-notes.ts`. The text below is that hidden source.

### Learn the breadboard before you insert a part

The middle of the board is split by a gap. In one half, holes a, b, c, d, and e of the same row number are connected. Holes f, g, h, i, and j of that row are a separate connection. The gap is not a wire. The long red and blue strips are the power rails. Holes in one strip connect along that strip until a break in the coloured line. The left rail is not connected to the right rail until a wire joins them. This build uses rows 1–15, above the usual mid-board break. Two leads connect when they sit in the same numbered row on the same side of the gap. A resistor body may pass over a row it must not join. Only the holes that hold its leads are connected. Do not put two transistor leads in one row, and do not put two LED leads in one row.

### The numbers

From a USB port near 5 V, the DevKit 5 V pin is about 4.7 V. Allow about 0.2 V across the transistor. Red at its typical 2.2 V then has about (4.7 − 2.2 − 0.2) / 220 = 10.5 mA. From a 5.0 V pin that is about 12 mA, still under the 30 mA red maximum. Blue and green at a typical 3.3 V have about 5.5 mA. A blue chip at its 4.0 V maximum has about 2.3 mA, and a green chip at 4.1 V has about 1.8 mA, so those colours can look dim. A weak USB port near 4.4 V can leave a high-forward-voltage green or blue chip dark. Each base takes about (3.3 − 0.7) / 1000 = 2.6 mA, about 8 mA for all three pins.

### What you will learn

Each colour needs a transistor and two resistors. A phone writes a colour over Bluetooth Low Energy. BLE is the short-range radio this project uses. It is a different system from the classic Bluetooth link a speaker uses.

