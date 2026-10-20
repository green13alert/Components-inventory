# ESP32 Bluetooth RGB LED Controller

Exported from the current linked Supabase records (`public.projects`, `public.project_steps`, `public.project_components`, `public.components`, and `public.project_requirements`) on 20 October 2026. Step text is verbatim. This file is for independent review.

## Project

- Slug: 24
- Title: ESP32 Bluetooth RGB LED Controller
- Description: Mix a red, green, and blue LED from a phone over Bluetooth Low Energy.
- Overview: Build a breadboard RGB light that a phone sets over Bluetooth Low Energy. The LED takes current from the DevKit 5 V pin. Three PN2222A transistors switch the colours, and PWM sets the mix.
- Category: iot
- Difficulty: beginner
- Estimated duration: 3 hrs
- Publication status: unpublished
- Cover image key: esp32BleRgb
- Cover asset: no bundled photograph. The app keeps the pending-cover placeholder.

### Learning objectives

- Switch a common-anode RGB LED from the DevKit 5 V pin with a PN2222A and a 220 Ω resistor on each colour
- Use LEDC PWM on GPIO25, GPIO26, and GPIO27 to drive those transistor bases through 1 kΩ
- Advertise a BLE GATT service that accepts colour and brightness writes
- Connect with nRF Connect for Mobile and compare the LED with the Serial Monitor

### Hardware-testing limit recorded in the exported text

No separate hardware-test certificate is stored in Supabase. The only testing limits are the ones written in the steps and firmware comments below. A published flag is not a record that the board was built.

## Bill of materials

| Qty | Catalogue id | Name | Category | Manufacturer | Part number |
| --- | --- | --- | --- | --- | --- |
| 1 | esp32 | ESP32 DevKit | microcontrollers |  |  |
| 1 | rgb-led-ca | Common-anode RGB LED | modules |  |  |
| 3 | pn2222a | PN2222A transistor | modules |  |  |
| 3 | resistor-220 | 220 Ω resistor | modules |  |  |
| 3 | resistor-1k | 1 kΩ resistor | modules |  |  |
| 1 | breadboard | Breadboard | modules |  |  |
| 5 | jumper-male-female | Male-to-female jumper wires | modules |  |  |
| 1 | usb-data-cable | USB data cable | modules |  |  |
| 1 | usb-power-source | USB power source | power |  |  |
| 8 | jumper-wires | Jumper Wires | modules |  |  |

- **ESP32 DevKit:** Wi-Fi and Bluetooth development board. This row does not fix header gender, USB socket, or board outline.
- **Common-anode RGB LED:** Kingbright WP154A4SEJ3VBDZGW/CA, a white-diffused 5 mm common-anode RGB LED. Datasheet DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, draws pin 1 as the red cathode, pin 2 as the common anode, pin 3 as the blue cathode, and pin 4 as the green cathode. The end view puts the flat of the flange next to pin 1. The package drawing labels the anode lead and shows it 2.5 mm minimum longer than the other leads. At 20 mA the forward voltage is 2.2 V typical and 2.8 V maximum for red, 3.3 V typical and 4.0 V maximum for blue, and 3.3 V typical and 4.1 V maximum for green. Absolute maximum DC forward current is 30 mA for red, 30 mA for blue, and 25 mA for green. This row is not a common-cathode LED and not an addressable pixel.
- **PN2222A transistor:** onsemi PN2222ABU, the bulk TO-92 formerly listed by Fairchild. Top mark PN2222A. The PN2222A Rev. 1.1.0 package sketch labels the leads E, B, C: flat face toward you and leads down, left to right is emitter, base, collector. A metal-can 2N2222, and some other TO-92 parts with a similar mark, use a different order. Absolute maximum collector current is 1 A. Used as a low-side switch.
- **220 Ω resistor:** Current-limiting resistor for a typical 5 V LED
- **1 kΩ resistor:** 1 kΩ through-hole resistor
- **Breadboard:** Solderless prototyping board
- **Male-to-female jumper wires:** Dupont wires with a female socket on one end and a male pin on the other. The socket fits a male header pin.
- **USB data cable:** Data-capable USB cable. Espressif ESP32-DevKitC V4 uses USB-A to Micro-B. The plug must match the DevKit socket.
- **USB power source:** Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.
- **Jumper Wires:** Dupont jumper wire pack

## Compatibility requirements

- ESP32 DevKit (`esp32`) ×1 — role `microcontroller`, policy `exact`
- Common-anode RGB LED (`rgb-led-ca`) ×1 — role `rgb_led`, policy `exact`
- PN2222A transistor (`pn2222a`) ×3 — role `low_side_switch`, policy `exact`
- 220 Ω resistor (`resistor-220`) ×3 — role `led_limiter`, policy `exact`
- 1 kΩ resistor (`resistor-1k`) ×3 — role `base_resistor`, policy `exact`
- Breadboard (`breadboard`) ×1 — role `breadboard`, policy `exact`
- Male-to-female jumper wires (`jumper-male-female`) ×5 — role `jumper_wires`, policy `exact`
- USB data cable (`usb-data-cable`) ×1 — role `usb_cable`, policy `exact`
- USB power source (`usb-power-source`) ×1 — role `usb_power`, policy `exact`
- Jumper Wires (`jumper-wires`) ×8 — role `rail_jumpers`, policy `exact`

## Complete firmware source

This is the longest code block stored on the walkthrough. The same text is repeated, unabbreviated, on the step where the app shows it.

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

## Wiring diagram source

The app draws the physical diagram from the local layout `constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts`, not from a diagram stored in Supabase. The connections named inside each step below are the database records. Hole coordinates are listed here so a reviewer can find the placement without treating this prose as a substitute for the drawing.

Schematic canvas: 360 × 700. Legend voltages come from that layout file.

Breadboard rows: 17. Rail split after row: 15.

### Component leads

- q-red emitter → strip row 1 column c
- q-red base → strip row 2 column c
- q-red collector → strip row 3 column c
- base-red leg1 → strip row 2 column i
- base-red leg2 → strip row 2 column e
- limit-red leg1 → strip row 3 column e
- limit-red leg2 → strip row 6 column h
- led red → strip row 6 column f
- led anode → strip row 7 column f
- led blue → strip row 8 column f
- led green → strip row 9 column f
- q-green emitter → strip row 10 column c
- q-green base → strip row 11 column c
- q-green collector → strip row 12 column c
- base-green leg1 → strip row 11 column i
- base-green leg2 → strip row 11 column e
- limit-green leg1 → strip row 12 column a
- limit-green leg2 → strip row 15 column d
- q-blue emitter → strip row 13 column h
- q-blue base → strip row 14 column h
- q-blue collector → strip row 15 column h
- base-blue leg1 → strip row 14 column e
- base-blue leg2 → strip row 14 column g
- limit-blue leg1 → strip row 15 column j
- limit-blue leg2 → strip row 12 column g

### Jumpers

- `devkit-5v` (male-female) module esp32 port v5 → left plus rail row 2
- `devkit-gnd` (male-female) module esp32 port gnd → left minus rail row 2
- `devkit-io25` (male-female) module esp32 port io25 → strip row 2 column j
- `devkit-io26` (male-female) module esp32 port io26 → strip row 11 column j
- `devkit-io27` (male-female) module esp32 port io27 → strip row 14 column a
- `red-emitter` (male-male) strip row 1 column a → left minus rail row 3
- `green-emitter` (male-male) strip row 10 column a → left minus rail row 10
- `blue-emitter` (male-male) strip row 13 column j → right minus rail row 13
- `anode-rail` (male-male) strip row 7 column j → right plus rail row 7
- `bridge-plus` (male-male) left plus rail row 1 → right plus rail row 1
- `bridge-minus` (male-male) left minus rail row 1 → right minus rail row 1
- `green-cathode` (male-male) strip row 15 column b → strip row 9 column j
- `blue-cathode` (male-male) strip row 12 column j → strip row 8 column j

### Off-board modules

- esp32 at (400, 12), 148 × 344
  - v5 (5V) at (416, 322)
  - gnd (GND) at (416, 242)
  - io25 (IO25) at (416, 162)
  - io26 (IO26) at (416, 178)
  - io27 (IO27) at (416, 194)

## Walkthrough

22 steps.

### Step 1 of 22 — Build a phone-controlled colour light

- Stage 0: Introduction
- Sort order: 0

One RGB LED follows the colour and brightness a phone sends.

**Block:** image

Image key: esp32BleRgb
Asset: no bundled photograph for this key. The app uses its pending-cover placeholder.
Caption: The workbench photograph is not in the app yet. The wiring diagram is the connection reference.

**Block:** text
**Heading:** What you are building

An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching.

**Block:** text
**Heading:** What it will do

After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer.

### Step 2 of 22 — Follow one colour from the phone to the LED

- Stage 0: Introduction
- Sort order: 1

The phone sends text. The ESP32 switches current from the 5 V pin.

**Block:** text
**Heading:** Four parts, four jobs

The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor.

**Block:** text
**Heading:** Why the transistor is there

This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on.

**Block:** warning

Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode.

**Block:** tip

Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V.

### Step 3 of 22 — Set the parts on the desk

- Stage 1: Hardware preparation
- Sort order: 2

Five male-to-female wires reach the DevKit. Eight male-to-male wires finish the board.

**Block:** components
**Heading:** Required parts

- ESP32 DevKit ×1 — catalogue id `esp32`, illustration `esp32` (shared vector illustration, not a photograph)

- Common-anode RGB LED ×1 — catalogue id `rgb-led-ca`, illustration `led` (shared vector illustration, not a photograph)

- PN2222A transistor ×3 — catalogue id `pn2222a`, illustration `generic-module` (shared vector illustration, not a photograph)

- 220 Ω resistor ×3 — catalogue id `resistor-220`, illustration `resistor-band-220` (shared vector illustration, not a photograph)

- 1 kΩ resistor ×3 — catalogue id `resistor-1k`, illustration `resistor-band-1k` (shared vector illustration, not a photograph)

- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard` (shared vector illustration, not a photograph)

- Male-to-female jumper wires ×5 — catalogue id `jumper-male-female`, illustration `jumper-wires` (shared vector illustration, not a photograph)

- Male-to-male jumper wires ×8 — catalogue id `jumper-wires`, illustration `jumper-wires` (shared vector illustration, not a photograph)

- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable` (shared vector illustration, not a photograph)

- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module` (shared vector illustration, not a photograph)

**Block:** text
**Heading:** Count the wires before you start

The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it.

**Block:** text

You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list.

### Step 4 of 22 — Confirm the LED is common anode

- Stage 1: Hardware preparation
- Sort order: 3

Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.

**Block:** text
**Heading:** Find the leads

Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens.

**Block:** text
**Heading:** The datasheet detail

Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them.

**Block:** warning

A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it.

### Step 5 of 22 — Know the transistors and the resistors

- Stage 1: Hardware preparation
- Sort order: 4

Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.

**Block:** text
**Heading:** Which way the transistor faces

Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order.

**Block:** text
**Heading:** Why each resistor is there

The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current.

**Block:** tip

A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them.

### Step 6 of 22 — Seat every part on these rows

- Stage 2: Wiring
- Sort order: 5

Use rows 1–15. The physical diagram names the same holes.

**Block:** warning

Holes a–e in one numbered row are joined. Holes f–j with the same number are a separate connection. Do not put two transistor leads in one row, or two LED leads in one row.

**Block:** text
**Heading:** The LED

Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9.

**Block:** text
**Heading:** Red channel, left half

Transistor flat to the right: emitter c1, base c2, collector c3. The 1 kΩ leads go in e2 and i2. The 220 Ω leads go in e3 and h6. h6 shares the right-hand row with f6. The resistor body sits above the gap and does not enter f6.

**Block:** text
**Heading:** Green channel, left half

Emitter c10, base c11, collector c12, flat to the right. The 1 kΩ leads go in e11 and i11. The 220 Ω leads go in a12 and d15, on the left half. A male-to-male wire from b15 to j9 carries that node to f9. The wire arches over the board and enters only those two holes.

**Block:** text
**Heading:** Blue channel, right half

Emitter h13, base h14, collector h15, flat to the right. The 1 kΩ leads go in e14 and g14. The 220 Ω leads go in j15 and g12. A male-to-male wire from j12 to j8 carries that node to f8. It stays in column j, arches over j9, and does not enter j9.

**Block:** wiring
**Heading:** Where the parts sit

Progressive assembly — parts introduced: led, q-red, q-green, q-blue, base-red, base-green, base-blue, limit-red, limit-green, limit-blue
Progressive assembly — jumpers introduced: (none)

**Block:** test
**Heading:** Checkpoint

Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet.

### Step 7 of 22 — Connect 5 V and ground

- Stage 2: Wiring
- Sort order: 6

Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.

**Block:** text

Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a1 to the left − rail at row 3, a10 to the left − rail at row 10, and j13 to the right − rail at row 13. Leave USB unplugged.

**Block:** wiring
**Heading:** Supply and ground
- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-5v, devkit-gnd, bridge-plus, bridge-minus, anode-rail, red-emitter, green-emitter, blue-emitter

**Block:** connections
**Heading:** These six links
- ESP32 DevKit 5V → Breadboard 5V rail (power)
- Breadboard 5V rail → RGB LED Anode (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard GND rail → Q red Emitter (ground)
- Breadboard GND rail → Q green Emitter (ground)
- Breadboard GND rail → Q blue Emitter (ground)

**Block:** test
**Heading:** Checkpoint

Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a1, a10, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged.

### Step 8 of 22 — Build the red channel

- Stage 2: Wiring
- Sort order: 7

GPIO25 switches the red cathode through j2 and f6.

**Block:** text

Join DevKit GPIO25 to j2 with a male-to-female wire. e2 and i2 hold the red 1 kΩ. c2 is the base. e3 and h6 hold the red 220 Ω, and f6 is LED pin 1.

**Block:** wiring
**Heading:** Red channel
- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-io25

**Block:** connections
**Heading:** Red links
- ESP32 DevKit IO25 → 1k red leg 1 (signal)
- 1k red leg 2 → Q red Base (signal)
- Q red Collector → 220 red leg 1 (signal)
- 220 red leg 2 → RGB LED Red (signal)

**Block:** test
**Heading:** Checkpoint

GPIO25 is in j2, the 1 kΩ in e2 and i2, and the base in c2. The collector is c3 and the 220 Ω meets it at e3 and the LED at h6. No two of those leads share one hole.

### Step 9 of 22 — Build the green channel

- Stage 2: Wiring
- Sort order: 8

GPIO26 switches the green cathode through j11, b15, and f9.

**Block:** text

Join GPIO26 to j11. The green 1 kΩ is in e11 and i11, the base is c11, and the 220 Ω runs from a12 to d15. Add the male-to-male wire from b15 to j9. j9 shares the row with LED pin 4 in f9.

**Block:** wiring
**Heading:** Green channel
- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-io26, green-cathode

**Block:** connections
**Heading:** Green links
- ESP32 DevKit IO26 → 1k green leg 1 (signal)
- 1k green leg 2 → Q green Base (signal)
- Q green Collector → 220 green leg 1 (signal)
- 220 green leg 2 → RGB LED Green (signal)

**Block:** test
**Heading:** Checkpoint

GPIO26 is in j11. The 1 kΩ lead is not in c10, c11, or c12. The b15 to j9 wire is the only extra lead in the green cathode row. f9 still holds the LED lead.

### Step 10 of 22 — Build the blue channel

- Stage 2: Wiring
- Sort order: 9

GPIO27 switches the blue cathode through a14, j12, and f8.

**Block:** text

Join GPIO27 to a14. The blue 1 kΩ is in e14 and g14, the base is h14, and the 220 Ω runs from j15 to g12. Add the male-to-male wire from j12 to j8. j8 shares the row with LED pin 3 in f8. The wire arches over j9 and does not enter it.

**Block:** wiring
**Heading:** Blue channel
- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-io27, blue-cathode

**Block:** connections
**Heading:** Blue links
- ESP32 DevKit IO27 → 1k blue leg 1 (signal)
- 1k blue leg 2 → Q blue Base (signal)
- Q blue Collector → 220 blue leg 1 (signal)
- 220 blue leg 2 → RGB LED Blue (signal)

**Block:** test
**Heading:** Checkpoint

GPIO27 is in a14. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each. j9 is only the green link.

### Step 11 of 22 — Check the whole circuit, then plug in USB

- Stage 2: Wiring
- Sort order: 10

This is the only full connection list. Use it once, before power.

**Block:** connections
**Heading:** All 18 connections

Five male-to-female wires leave the DevKit. Eight male-to-male wires join the rails, the emitters, and the green and blue cathode links. Every other join is two leads in the same five-hole row.
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

**Block:** wiring
**Heading:** Finished arrangement
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

**Block:** test
**Heading:** Before USB

LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply.

### Step 12 of 22 — Install the ESP32 board package

- Stage 3: Development environment
- Sort order: 11

The Arduino IDE needs the Espressif package before it can see this board.

**Block:** text

Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach.

**Block:** tip

If the board list has no ESP32 Dev Module after the install, close the IDE and open it again.

### Step 13 of 22 — Select the board and the port

- Stage 3: Development environment
- Sort order: 12

The sketch talks to the computer at 115200 baud.

**Block:** text

Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing.

**Block:** expected
**Heading:** If the port is missing

Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in.

### Step 14 of 22 — See how PWM sets the brightness

- Stage 4: Firmware
- Sort order: 13

GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.

**Block:** text
**Heading:** Why these pins

GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter.

**Block:** text

The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment.

**Block:** code

Language: cpp
Filename: excerpt-brightness.ino

```cpp
int channelDuty(int channel) {
  return (int)(((long)channel * (long)brightnessPercent) / 100L);
}

void applyColour() {
  ledcWrite(RED_PIN, channelDuty(redValue));
  ledcWrite(GREEN_PIN, channelDuty(greenValue));
  ledcWrite(BLUE_PIN, channelDuty(blueValue));
```

**Block:** text
**Heading:** What that excerpt does

channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour.

**Block:** text

This second excerpt is the setup that attaches those pins. Do not upload it on its own.

**Block:** code

Language: cpp
Filename: excerpt-pwm-setup.ino

```cpp
if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||
      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {
    Serial.println("PWM setup failed.");
  }
  applyColour();
```

**Block:** text
**Heading:** What ledcAttach does

ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent.

### Step 15 of 22 — Watch the write 255,80,0 travel through the sketch

- Stage 4: Firmware
- Sort order: 14

A characteristic is one value the phone can read or write.

**Block:** text
**Heading:** The path of one colour

The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it.

**Block:** text

Both blocks below are excerpts. The complete sketch is in the next step.

**Block:** code

Language: cpp
Filename: excerpt-advertise.ino

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

**Block:** code

Language: cpp
Filename: excerpt-colour-write.ino

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

**Block:** text
**Heading:** Rejected writes and a disconnect

A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED.

**Block:** code

Language: cpp
Filename: excerpt-disconnect.ino

```cpp
void onDisconnect(BLEServer *server) override {
    (void)server;
    clientConnected = false;
    Serial.println("Phone disconnected. Advertising again.");
    BLEDevice::startAdvertising();
```

### Step 16 of 22 — Upload the complete sketch

- Stage 4: Firmware
- Sort order: 15

This is the program to copy. The earlier blocks were excerpts.

**Block:** text

Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB.

**Block:** code

Language: cpp
Filename: esp32-ble-rgb-controller.ino
Libraries: BLE (ESP32 Arduino core), LEDC (ESP32 Arduino core)

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

**Block:** expected
**Heading:** After a successful upload

The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it.

### Step 17 of 22 — Find Solderi RGB in nRF Connect

- Stage 5: Phone control
- Sort order: 16

Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.

**Block:** text

Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral.

**Block:** text
**Heading:** The service, once

After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write.

**Block:** expected
**Heading:** When the connection works

nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24.

### Step 18 of 22 — Write a colour as text

- Stage 5: Phone control
- Sort order: 17

The write format is UTF-8 text, three numbers separated by commas.

**Block:** text

On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent.

**Block:** text
**Heading:** If the app asks for hex

Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text.

**Block:** warning

Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas.

### Step 19 of 22 — Change brightness, then disconnect and come back

- Stage 5: Phone control
- Sort order: 18

Brightness is a second text value, from 0 to 100.

**Block:** text

On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red.

**Block:** text

A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected.

**Block:** tip

Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted.

### Step 20 of 22 — Fix the light before you blame the phone

- Stage 6: Troubleshooting
- Sort order: 19

Match the symptom, then work down the checks.

**Block:** troubleshooting
**Heading:** The LED itself

**Problem:** The LED stays dark after upload.

The usual causes are USB not powering the board, the anode off the + rail, or an emitter off the − rail. Confirm the monitor prints the advertising line. The anode jumper is j7 on the right + rail, and the two + rails are bridged on row 1. Emitters are a1 and a10 on the left − rail and j13 on the right − rail, with the − rails bridged on row 1. Those rows are above the rail break. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed: pin 2, the anode, is the lead in f7.

**Problem:** Only red lights. Green and blue stay off.

Either those links are in the wrong holes, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, confirm the green wire is in b15 and j9, and the blue wire is in j12 and j8. j9 shares the row with LED pin 4 in f9. j8 shares the row with LED pin 3 in f8. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark.

**Problem:** One colour is stuck on, or two colours light together.

Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin.

**Problem:** The LED is very hot or a resistor smells.

Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step.

### Step 21 of 22 — Fix the phone connection

- Stage 6: Troubleshooting
- Sort order: 20

The board has to be advertising before the phone can write.

**Block:** troubleshooting
**Heading:** nRF Connect

**Problem:** Solderi RGB never appears in the scanner.

The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds.

**Problem:** The app connects, then the write does nothing.

The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255.

**Problem:** Upload never finishes.

The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line.

**Problem:** It worked once, and the phone cannot reconnect.

Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan.

### Step 22 of 22 — Walk the finished controller

- Stage 7: Final check
- Sort order: 21

Do these in order and compare the LED with each line.

**Block:** text

The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct.

**Block:** expected
**Heading:** Checklist

The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0.

## Appendix — supporting notes

**NOT CURRENTLY SHOWN TO USERS**

These notes were removed from the main walkthrough and are kept in `constants/walkthroughs/supporting-notes.ts` for a future optional explanation. They are not step content and the app does not render them.

### Learn the breadboard before you insert a part

The middle of the board is split by a gap. In one half, holes a, b, c, d, and e of the same row number are connected. Holes f, g, h, i, and j of that row are a separate connection. The gap is not a wire. The long red and blue strips are the power rails. Holes in one strip connect along that strip until a break in the coloured line. The left rail is not connected to the right rail until a wire joins them. This build uses rows 1–15, above the usual mid-board break. Two leads connect when they sit in the same numbered row on the same side of the gap. A resistor body may pass over a row it must not join. Only the holes that hold its leads are connected. Do not put two transistor leads in one row, and do not put two LED leads in one row.

### The numbers

From a USB port near 5 V, the DevKit 5 V pin is about 4.7 V. Allow about 0.2 V across the transistor. Red at its typical 2.2 V then has about (4.7 − 2.2 − 0.2) / 220 = 10.5 mA. From a 5.0 V pin that is about 12 mA, still under the 30 mA red maximum. Blue and green at a typical 3.3 V have about 5.5 mA. A blue chip at its 4.0 V maximum has about 2.3 mA, and a green chip at 4.1 V has about 1.8 mA, so those colours can look dim. A weak USB port near 4.4 V can leave a high-forward-voltage green or blue chip dark. Each base takes about (3.3 − 0.7) / 1000 = 2.6 mA, about 8 mA for all three pins.

### What you will learn

Each colour needs a transistor and two resistors. A phone writes a colour over Bluetooth Low Energy. BLE is the short-range radio this project uses. It is a different system from the classic Bluetooth link a speaker uses.

## Local source comparison

The local TypeScript steps match these Supabase steps in sort order, stage, title, description, tip, and block content.
