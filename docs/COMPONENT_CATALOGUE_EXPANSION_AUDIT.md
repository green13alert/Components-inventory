# Component catalogue expansion audit

Planning only. This document does not insert components, change catalogue rows, add migrations, or approve substitutions.

Checked against the linked database on 10 October 2026, and against `constants/component-catalogue.ts`. The live `public.components` table matches the TypeScript catalogue: 42 slugs. The original seed `20260921210000_phase_2_3a_component_catalogue_seed.sql` is behind that table. It does not contain `resistor-220`, `joystick`, or `pan-tilt-bracket`.

Uncommitted work is present and was left untouched: project matching and the component-row substitute display, `lib/compatibility.ts`, `lib/projects.ts`, the traffic-light substitution migration, and `docs/NEXT_COMPATIBILITY_CANDIDATE_AUDIT.md`.

---

## 1. Current catalogue

42 components.

| Category | Count | What is actually in it |
| --- | ---: | --- |
| Microcontrollers | 6 | Uno R3, Nano, Mega 2560, one ESP32 DevKit, one ESP8266, Pico |
| Sensors | 11 | DHT11, DHT22, DHT20, DS18B20, HC-SR04, PIR, soil moisture, BMP280, MPU6050, LDR, MQ-2 |
| Actuators | 6 | SG90, MG90S, generic DC motor, 28BYJ-48, piezo buzzer, L298N |
| Displays | 4 | 16×2 LCD, 0.96" OLED, MAX7219 matrix, TM1637 |
| Power | 3 | 9 V clip, LM7805, breadboard PSU |
| Modules | 12 | LED, generic resistor, 220 Ω resistor, breadboard, jumpers, joystick, pan-tilt bracket, HC-05, HC-06, 5 V relay, RC522, DS3231 |

No Raspberry Pi computer is in the catalogue. Pico is the only Raspberry Pi product, and it is filed as a microcontroller. There is no capacitor, diode, transistor, MOSFET, button, switch, potentiometer, encoder, keypad, GPS, microphone, logic-level shifter, battery cell, or camera.

### Precise identities versus generic rows

Precise enough to inventory as a known part: the six boards, DHT11, DHT22, DHT20, DS18B20, HC-SR04, BMP280, MPU6050, MQ-2, SG90, MG90S, 28BYJ-48, MAX7219, TM1637, LM7805, HC-05, HC-06, RC522, DS3231, L298N, and `resistor-220`.

Overly generic or ambiguous:

| Slug | Problem |
| --- | --- |
| `resistor` | Unknown resistance. Alias list includes `10k resistor`. That alias is false. |
| `led` | No colour, size, or chemistry. Categorised as a module. |
| `buzzer` | Name says piezo, alias says active buzzer, description says audio indicator. |
| `soil-moisture` | Description covers both capacitive and resistive probes. |
| `dc-motor` | Name is a generic brushed gear motor. Alias `tt motor` is a more specific motor. |
| `breadboard` | One row. Alias `protoboard` is a different object. |
| `jumper-wires` | One pack. Alias `male to male` over-claims the gender. |
| `esp32` | One DevKit. Aliases include `esp32 wroom`, which hides CAM, S3, and WROVER boards. |
| `esp8266` | Aliases include both `esp-01` and `nodemcu`. Those are different boards. |
| `raspberry-pi-pico` | Alias `pico` will collide with a later Pico W row. |
| `bmp280` | Alias `bme280` is a different sensor. It is not a second component. |
| `dht11`, `dht22`, `dht20` | Three rows, one shared description, no supply or interface facts. |

No duplicate component names were found. The collisions are aliases, not second rows.

### Specifications and BOM use

Capability rows exist for the six boards and for `resistor-220` only. Every other row has a one-line description and no stored electrical value.

`public.components` can store `manufacturer` and `part_number`. Both are empty across the catalogue.

BOM lines exist for 7 of 22 projects. Parts that appear on at least one BOM: Uno, ESP32 DevKit, DHT22, soil moisture, LDR, PIR, BMP280, SG90, joystick, pan-tilt bracket, breadboard PSU, LED, generic resistor, `resistor-220`, breadboard, jumpers, OLED. The other 25 catalogue rows are inventory-only today.

Add Component search reads `constants/component-catalogue.ts`, not the database. A database insert alone will not appear in the app. Aliases exist only in that TypeScript file.

Illustrations are a small set plus generic fallbacks. New parts can use `generic-module`, `generic-sensor`, `generic-board`, or `generic-display` until dedicated art exists. New art is not a blocker for a catalogue row.

---

## 2. Coverage gaps

Existing rows are not repeated as new parts.

| Checklist | Already present | Still missing as its own part |
| --- | --- | --- |
| Fixed resistors | Generic unknown resistor, 220 Ω | 100 Ω, 330 Ω, 470 Ω, 1 kΩ, 2.2 kΩ, 4.7 kΩ, 10 kΩ, 47 kΩ, 100 kΩ |
| Capacitors | None | Ceramic 100 nF, electrolytic 10 µF and 100 µF |
| LEDs and seven-segment | Generic LED, TM1637 module | 5 mm red, yellow, green, common-cathode RGB |
| Diodes, transistors, MOSFETs | None | 1N4007, 1N4148, 2N2222, IRF520 module |
| Controls | Joystick module | Tactile button, slide switch, 10 kΩ potentiometer, KY-040 encoder |
| Sound and prototyping | One ambiguous buzzer, one breadboard, one jumper pack | Passive buzzer, half and full breadboards, male-female and female-female jumpers |
| Climate, light, distance, motion, pressure, gas, soil | DHT family, LDR, HC-SR04, PIR, MPU6050, BMP280, MQ-2, soil row | Digital light, colour, microphone, air-quality, water, flow, current |
| Displays and wireless | LCD, OLED, matrix, HC-05, HC-06 | SPI TFT, 1.3" OLED, nRF24L01, GPS |
| Motors and drivers | SG90, MG90S, generic DC motor, 28BYJ-48, L298N | ULN2003 board, TB6612, DRV8833, A4988, PCA9685, TT motor as its own part |
| Storage, time, identity | DS3231, RC522 | SPI microSD module, PN532 |
| Power | 9 V clip, 7805, breadboard PSU | 3.3 V regulator module, TP4056, 18650 cell, buck and boost modules |
| ESP32 | One DevKit row | ESP32-CAM, and later S3 and WROVER boards |
| Raspberry Pi computers | None | Pi 4, Pi 5, Zero 2 W, supplies, boot card, camera, display, GPIO cobbler |
| Pico | Pico, no radio | Pico W as a separate microcontroller |

---

## 3. Identity rules

Keep the curated catalogue. Users pick a recognised row. They do not invent parts.

1. A generic row means the value is unknown. `resistor` must never satisfy `resistor-10k`. The same rule applies to capacitors, LEDs, motors, and breadboards.
2. Add a value-specific row only for a value a starter kit or a real project actually uses. Do not add every E12 value.
3. Board variants get separate rows when the chip, radio, camera, header, or power requirement differs. RAM size on a Pi 4 is a capability to verify later, not four products, until a project requires a minimum.
4. A module and a bare IC are different rows. DHT22 module is not the bare sensor plus a resistor. ESP32-CAM is not an OV2640 plus a DevKit.
5. Voltage and interface stay on the row. A 5 V relay module is not a 3.3 V relay module. HC-05 is not HC-06.
6. Aliases are search text for that one row. Do not alias a different part onto it. Remove `10k resistor` from `resistor`, `bme280` from `bmp280`, and `esp-01` / `nodemcu` from `esp8266` before adding the specific parts those words should find.
7. Do not store a specification that has not been checked. Descriptions can name the part. Capability numbers wait for a datasheet or the project text.
8. New illustrations are optional. Reuse a generic illustration id until art exists.
9. Keep today's six app categories until a `computers` category is added. Passives can stay under `modules` so the current filter still shows them. Raspberry Pi computers must not be filed as microcontrollers.
10. Catalogue expansion does not approve substitutions. A new 10 kΩ row does not become a substitute for any current BOM line.

---

## 4. Phase A — essential foundation

49 proposed rows. None of these slugs exist. Slugs are proposed names, not database ids.

Specs below are checks to perform before insertion. They are not values to copy in.

| Name | Slug | Category | Platform | Priority | Example use | Verify before insertion |
| --- | --- | --- | --- | --- | --- | --- |
| 100 Ω resistor | `resistor-100` | modules | shared | first | LED series, speaker damping | Resistance and package. No wattage until checked. |
| 330 Ω resistor | `resistor-330` | modules | shared | first | Alternate LED limiter | Same. Do not treat it as already approved for blink. |
| 470 Ω resistor | `resistor-470` | modules | shared | first | LED limiter | Same. |
| 1 kΩ resistor | `resistor-1k` | modules | shared | first | Transistor base, signal limit | Same. |
| 2.2 kΩ resistor | `resistor-2k2` | modules | shared | first | Dividers | Same. |
| 4.7 kΩ resistor | `resistor-4k7` | modules | shared | first | Dividers, pull-ups | Same. |
| 10 kΩ resistor | `resistor-10k` | modules | shared | first | Pull-up, LDR divider | Same. Remove the false alias from `resistor` first. |
| 47 kΩ resistor | `resistor-47k` | modules | shared | A | Bias, dividers | Same. |
| 100 kΩ resistor | `resistor-100k` | modules | shared | A | Bias, dividers | Same. |
| 100 nF ceramic capacitor | `capacitor-100nf` | modules | shared | first | Supply decoupling | Capacitance and ceramic type. Voltage rating only if checked. |
| 10 µF electrolytic capacitor | `capacitor-10uf` | modules | shared | first | Regulator output | Capacitance and polarity. Voltage rating only if checked. |
| 100 µF electrolytic capacitor | `capacitor-100uf` | modules | shared | first | Supply bulk | Same. |
| 5 mm red LED | `led-red-5mm` | modules | shared | A | Traffic light, indicators | Colour and 5 mm package. Do not invent Vf or current. |
| 5 mm yellow LED | `led-yellow-5mm` | modules | shared | A | Traffic light | Same. |
| 5 mm green LED | `led-green-5mm` | modules | shared | A | Traffic light | Same. |
| Common-cathode RGB LED | `led-rgb-cc` | modules | shared | A | Colour mixing | Common cathode, not common anode. Pin order only if checked. |
| 1N4007 diode | `diode-1n4007` | modules | shared | A | Supply protection | Part number. Do not store a voltage from memory. |
| 1N4148 diode | `diode-1n4148` | modules | shared | A | Signal clamp | Part number. |
| 2N2222 NPN transistor | `transistor-2n2222` | modules | shared | A | Low-side switch | NPN, TO-92 pin order only if checked. |
| IRF520 MOSFET module | `mosfet-irf520` | modules | shared | A | Higher-current DC load | Module, not the bare FET. Gate voltage behaviour at 3.3 V must be checked before an ESP32 or Pi project uses it. |
| 6 mm tactile pushbutton | `button-tactile-6mm` | modules | shared | first | Piano, counters | Momentary, not latching. |
| SPDT slide switch | `switch-slide-spdt` | modules | shared | A | Power select | SPDT, not a pushbutton. |
| 10 kΩ rotary potentiometer | `potentiometer-10k` | modules | shared | first | Analog input | 10 kΩ only. An unknown pot stays a future generic row, not this one. |
| KY-040 rotary encoder | `encoder-ky040` | modules | shared | A | Menus, position | Module with push switch. Pin labels only if checked. |
| Passive piezo buzzer | `buzzer-passive` | actuators | shared | A | Tone playback | Passive element. Do not merge with the current `buzzer` row. |
| 400-point breadboard | `breadboard-400` | modules | shared | A | Small builds | Tie-point count and rail layout. |
| 830-point breadboard | `breadboard-830` | modules | shared | A | Larger builds | Same. Leave generic `breadboard` as unknown size. |
| Male-to-female jumper pack | `jumper-wires-mf` | modules | shared | A | Board to breadboard | Gender. Do not retitle the existing pack until its alias is fixed. |
| Female-to-female jumper pack | `jumper-wires-ff` | modules | shared | A | Module to module | Gender. |
| 2.54 mm male pin header | `pin-header-254-male` | modules | shared | A | Breakouts | Pitch. Not a Dupont wire. |
| KY-038 microphone module | `microphone-ky038` | sensors | shared | A | Clap or sound trigger | Analog and digital outputs only if the module actually has both. |
| ULN2003 driver board | `driver-uln2003` | actuators | shared | A | 28BYJ-48 | Board that ships with that stepper, not a loose ULN2003 chip. |
| 4×4 membrane keypad | `keypad-4x4` | modules | shared | A | Door lock | 4×4 membrane, not a keyboard. |
| SPI microSD module | `microsd-spi-module` | modules | shared | A | Arduino or ESP32 logging | SPI breakout. Not a Pi boot card. |
| 4-channel logic-level shifter | `level-shifter-4ch` | modules | shared | A | 5 V parts on 3.3 V boards | Bidirectional module. Voltage sides only if checked. |
| AMS1117 3.3 V module | `regulator-ams1117-3v3` | power | ESP32, Raspberry Pi | A | 3.3 V rail | Module output is 3.3 V only if the board is the 3.3 V version. |
| TP4056 charger module | `charger-tp4056` | power | ESP32 | A | Single-cell charging | Charger, not a cell. Charge current only if checked. |
| 18650 lithium cell | `battery-18650` | power | ESP32 | A | Portable nodes | Cell, not a holder or a claimed mAh. |
| ESP32-CAM | `esp32-cam` | microcontrollers | ESP32 | first | Wireless camera | Camera board, scarce GPIO, usually no onboard USB-UART. Not the existing DevKit. |
| Raspberry Pi 4 Model B | `raspberry-pi-4` | computers | Raspberry Pi | first | Desktop, camera, GPIO | Computer, not a Pico. RAM size is not a separate row yet. |
| Raspberry Pi 5 | `raspberry-pi-5` | computers | Raspberry Pi | A | Heavier dashboards | Different power and connectors from the Pi 4. Do not share a PSU row. |
| Raspberry Pi Zero 2 W | `raspberry-pi-zero-2-w` | computers | Raspberry Pi | A | Compact camera | Different shape, power, and camera cable from Pi 4 and 5. |
| Raspberry Pi Pico W | `raspberry-pi-pico-w` | microcontrollers | Raspberry Pi | first | Wireless Pico projects | Has radio. Do not alias it as `pico`. |
| Raspberry Pi 4 USB-C supply | `psu-pi-4` | power | Raspberry Pi | A | Pi 4 power | Verify the official voltage and current before storing them. Not for Pi 5. |
| Raspberry Pi 5 USB-C supply | `psu-pi-5` | power | Raspberry Pi | A | Pi 5 power | Separate requirement from the Pi 4 supply. Verify before storing numbers. |
| microSD card | `microsd-card` | modules | Raspberry Pi | A | Pi boot disk | Boot card. Capacity and speed class only if a project requires them. |
| Raspberry Pi Camera Module 3 | `camera-module-3` | modules | Raspberry Pi | A | Stills and video | Verify which Pi connectors it fits. No universal cable. |
| Raspberry Pi Touch Display 7" | `display-pi-touch-7` | displays | Raspberry Pi | A | Dashboard | Verify supported Pi models before a BOM uses it. |
| 40-pin GPIO cobbler | `gpio-cobbler-40` | modules | Raspberry Pi | A | Pi breadboard wiring | For 40-pin Pi computers. Not for Pico. |

`computers` is not an app category today. Those three computer rows need the category change in section 7 before they ship. Pico W can use `microcontrollers` now.

---

## 5. Phase B — broader project coverage

31 proposed rows.

| Name | Slug | Category | Platform | Example use | Verify before insertion |
| --- | --- | --- | --- | --- | --- |
| VL53L0X distance module | `sensor-vl53l0x` | sensors | shared | Short-range ranging | I2C module, not HC-SR04. |
| TCS34725 colour module | `sensor-tcs34725` | sensors | shared | Colour sorting | I2C. Supply voltage. |
| BH1750 light module | `sensor-bh1750` | sensors | shared | Digital light level | I2C. Not an LDR. |
| MQ-135 module | `sensor-mq135` | sensors | shared | Air quality | Distinct from MQ-2. Heater voltage. |
| Water level module | `sensor-water-level` | sensors | shared | Tank alarm | Analog module. Not a flow meter. |
| YF-S201 flow sensor | `sensor-yf-s201` | sensors | shared | Flow count | Pulse output and pipe size. |
| INA219 module | `sensor-ina219` | sensors | shared | Current and bus voltage | I2C. Shunt value only if checked. |
| RCWL-0516 motion module | `sensor-rcwl0516` | sensors | shared | Microwave motion | Not a PIR. Supply voltage. |
| TCRT5000 module | `sensor-tcrt5000` | sensors | Arduino | Line follower | Reflective IR module. Not a bare LED. |
| NEO-6M GPS module | `gps-neo-6m` | modules | shared | Location logger | UART. Antenna included or not. |
| nRF24L01 module | `radio-nrf24l01` | modules | Arduino, Raspberry Pi | Radio link | 3.3 V supply. Pin pitch variant only if both are stocked. |
| ST7735 1.8" TFT | `display-st7735` | displays | shared | Colour UI | Controller and SPI. Not the OLED row. |
| ILI9341 SPI TFT | `display-ili9341` | displays | shared | Larger colour UI | Controller. Touch variant is a different row if the panel has no touch. |
| 1.3" SH1106 OLED | `oled-sh1106-13` | displays | shared | Larger text | SH1106, not SSD1306. |
| TB6612FNG module | `driver-tb6612` | actuators | shared | Small robot | Not an L298N. Logic voltage. |
| DRV8833 module | `driver-drv8833` | actuators | shared | Low-voltage motors | Not a TB6612. |
| A4988 stepper driver | `driver-a4988` | actuators | shared | NEMA stepper | Current set by the trimmer. Do not store a current limit from memory. |
| PCA9685 servo board | `driver-pca9685` | modules | shared | Many servos | I2C PWM board. Logic and servo power are separate. |
| 4-channel 5 V relay module | `relay-5v-4ch` | modules | shared | Several mains or DC loads | 5 V coils. Input level at 3.3 V must be checked. Not the existing 1-channel row. |
| PN532 NFC module | `nfc-pn532` | modules | shared | Tags beyond MFRC522 | Interface mode the board is strapped for. |
| ESP32-S3-DevKitC-1 | `esp32-s3-devkitc-1` | microcontrollers | ESP32 | USB and newer ESP32 projects | S3, not the existing DevKit. Pin map and USB. |
| ESP32-WROVER DevKit | `esp32-wrover-devkit` | microcontrollers | ESP32 | Projects that need PSRAM | Confirm PSRAM before storing it. |
| 2N7000 MOSFET | `mosfet-2n7000` | modules | shared | Small low-side switch | Bare FET, not the IRF520 module. |
| Raspberry Pi Camera Module 2 | `camera-module-2` | modules | Raspberry Pi | Older camera builds | Different from Module 3. |
| Pi Zero camera cable | `cable-pi-zero-camera` | modules | Raspberry Pi | Zero camera | This cable is not the Pi 4 or Pi 5 cable. |
| Raspberry Pi 5 Active Cooler | `cooler-pi-5-active` | modules | Raspberry Pi | Pi 5 sustained load | Pi 5 only. |
| Raspberry Pi Sense HAT | `hat-sense` | modules | Raspberry Pi | Onboard environment display | Which Pi headers it fits. Not a sensor assortment. |
| 5" HDMI display | `display-hdmi-5` | displays | Raspberry Pi | Dashboard | HDMI plus power. Touch only if that exact panel has it. |
| LM2596 buck module | `regulator-lm2596` | power | shared | Step-down from a higher supply | Adjustable output. Do not store a fixed output. |
| MT3608 boost module | `converter-mt3608` | power | shared | Step-up | Adjustable. Same warning. |
| 4×AA battery holder | `holder-4xaa` | power | shared | Portable Arduino | Holder, not cells. |

ESP32-C3, C6, and H2 are different chips. They stay off this roadmap until a project needs one.

---

## 6. Phase C — advanced builds

19 proposed rows.

| Name | Slug | Category | Platform | Example use | Verify before insertion |
| --- | --- | --- | --- | --- | --- |
| MG996R servo | `servo-mg996r` | actuators | shared | Robotic arm | Metal-gear standard servo, not SG90 or MG90S. |
| TT geared motor | `motor-tt` | actuators | shared | Robot chassis | Specific motor. Leave `dc-motor` generic. |
| NEMA17 stepper | `stepper-nema17` | actuators | shared | Plotter or axis | Frame size and wiring. Current only if checked. |
| 5 kg load cell | `loadcell-5kg` | sensors | shared | Scale | Rated load. Needs HX711, which is a separate row. |
| HX711 module | `adc-hx711` | modules | shared | Load-cell ADC | Module, not the cell. |
| AS608 fingerprint module | `sensor-as608` | sensors | shared | Access | UART module. Supply voltage. |
| SX1278 LoRa module | `radio-sx1278` | modules | shared | Long-range link | Frequency variant. Do not mix 433 MHz and 868 MHz in one row. |
| SIM800L module | `modem-sim800l` | modules | shared | Cellular | Supply current bursts. Logic voltage. |
| 6 V hobby solar panel | `panel-solar-6v` | power | shared | Solar tracker | Voltage printed on the panel. Do not invent wattage. |
| 12 V DC supply | `psu-12v` | power | shared | Motor rail | Voltage. Current only if the exact supply is chosen. |
| CNC shield | `shield-cnc-v3` | modules | Arduino | Plotter | Which Arduino header it fits. Drivers are separate. |
| Raspberry Pi NVMe HAT | `hat-nvme-pi5` | modules | Raspberry Pi | Pi 5 storage | Pi 5 only. |
| Raspberry Pi PoE+ HAT | `hat-poe-plus` | modules | Raspberry Pi | Power over Ethernet | Which Pi models. Not a USB supply. |
| USB-C PD trigger board | `board-usb-pd-trigger` | power | shared | Negotiated DC from USB-C | Requested voltage must be verified per board. |
| USB keyboard | `peripheral-usb-keyboard` | modules | Raspberry Pi | Cyberdeck or desktop | Generic HID keyboard. Not a keypad. |
| USB mouse | `peripheral-usb-mouse` | modules | Raspberry Pi | Desktop | Generic HID mouse. |
| USB-C power bank | `battery-usb-c-power-bank` | power | shared | Portable Pi or ESP32 | Output voltage and current only for the chosen bank. |
| Raspberry Pi AI Kit | `raspberry-pi-ai-kit` | modules | Raspberry Pi | Vision accelerator | Exact official product and supported Pi models. |
| Camera Module 3 Wide | `camera-module-3-wide` | modules | Raspberry Pi | Wider field | Distinct from Camera Module 3 only if the lens differs. |

---

## 7. What has to change before rows are added

No new table is required. `public.components` already stores name, category, description, and slug.

Required before the computer rows ship:

- Add a `computers` value to the app category union and the inventory filter. The database category column is free text, so the app is the constraint. Do not put a Pi 4 in `microcontrollers`.

Not required for the first resistor and passive batch:

- New capability keys. Capacitance, LED colour, and supply output are not capability names today. Insert the rows with honest descriptions. Add keys only when a requirement needs to read them.
- New illustrations.
- Compatibility reviews.
- RLS changes. Catalogue reads already follow the current component policies.

Required process for every later batch:

- Update `constants/component-catalogue.ts` and the database together. Search will not see a database-only row.
- Do not rewrite the old phase 2.3A seed. Add a new migration.
- Fix the false aliases in section 1 before inserting the parts those aliases name.

---

## 8. Data-quality issues to fix first

1. Remove `10k resistor` from `resistor`.
2. Remove `bme280` from `bmp280`.
3. Remove `esp-01` and `nodemcu` from `esp8266`, or split those boards later. Do not leave both names on one row.
4. Decide what `buzzer` is before adding `buzzer-passive`. The current aliases disagree with the name.
5. Stop describing `soil-moisture` as both capacitive and resistive.
6. Remove `protoboard` from `breadboard`.
7. Stop calling the generic jumper pack male-to-male until that is the only gender in the row.
8. Narrow `pico` so it cannot mean Pico W.
9. Give DHT11, DHT22, and DHT20 distinct descriptions when their supplies and interfaces are actually checked. Do not invent those voltages in the cleanup.
10. Leave the 15 projects with no BOM unpublished. Catalogue growth does not make them buildable.
