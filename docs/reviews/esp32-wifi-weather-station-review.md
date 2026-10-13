# ESP32 Wi-Fi Weather Station

Review export of slug `23`. The walkthrough text below is the text stored in Supabase and loaded by the app. It is not a summary.

## 1. Project

Title: ESP32 Wi-Fi Weather Station

Slug: 23

Description: Measure temperature, humidity, and pressure, then read them on a local ESP32 web page.

Overview: Build a local weather station with an ESP32 DevKit and an Adafruit BME280. The board joins your Wi-Fi network and serves a dashboard that refreshes temperature, humidity, and pressure. No cloud account is required.

Difficulty: intermediate

Duration: 3 hrs

Category: iot

Publication: unpublished (`is_published` false in the database and in the local source)

Learning objectives:

- Wire an Adafruit BME280 to an ESP32 DevKit on I2C at 3.3 V
- Install the ESP32 Arduino board package and the Adafruit BME280 library
- Host a local web dashboard and JSON readings endpoint on the ESP32
- Use the Serial Monitor to diagnose the sensor and the Wi-Fi address

## 2. Bill of materials

Quantities and identities are the rows stored for slug 23.

- 1 × ESP32 DevKit
  Catalogue slug: `esp32`
  Requirement role: `microcontroller`
  Catalogue description: Wi-Fi & Bluetooth microcontroller
- 1 × Adafruit BME280
  Catalogue slug: `bme280`
  Requirement role: `environment_sensor`
  Catalogue description: Temperature, humidity, and pressure breakout. I2C uses Vin, GND, SCK, and SDI.
- 1 × Breadboard
  Catalogue slug: `breadboard`
  Requirement role: `breadboard`
  Catalogue description: Solderless prototyping board
- 1 × Jumper Wires
  Catalogue slug: `jumper-wires`
  Requirement role: `jumper_wires`
  Catalogue description: Dupont jumper wire pack
- 1 × USB data cable
  Catalogue slug: `usb-data-cable`
  Requirement role: `usb_cable`
  Catalogue description: Data-capable USB cable. Espressif ESP32-DevKitC V4 uses USB-A to Micro-B. The plug must match the DevKit socket.
- 1 × USB power source
  Catalogue slug: `usb-power-source`
  Requirement role: `usb_power`
  Catalogue description: Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.

## 3. Walkthrough

Step count stored in the database: 31.

### Step 1 of 31

Stage 1: Introduction

Heading: What the finished station does

Description: The ESP32 reads a BME280 and serves the readings on your own Wi-Fi network.

Tip: None.

Visual reference: imageKey `esp32WifiWeather`.

Stored caption: ESP32, BME280, and a local dashboard. This drawing is the project cover, not a photograph of a finished build.

Caption shown in the app: The workbench photograph is not in the app yet. The wiring diagram is the connection reference.

**Text: What you are building**

The finished station measures temperature in degrees Celsius, relative humidity in percent, and barometric pressure in hectopascals. The ESP32 DevKit joins a Wi-Fi network you choose and hosts a small web page. A phone or computer on that same network opens the page and sees the numbers update about every two seconds. Nothing is sent to a cloud service.

**Expected result: What done looks like**

The Serial Monitor prints an IP address such as 192.168.1.42, then repeating temperature, humidity, and pressure lines. Opening http:// and that address in a browser shows the same three readings.

### Step 2 of 31

Stage 1: Introduction

Heading: What you will learn

Description: This build is about one sensor bus, one Wi-Fi connection, and one local web page.

Tip: None.

**Text: Skills in this project**

You will identify the ESP32 pins 3V3, GND, IO21, and IO22, and the Adafruit BME280 pins Vin, GND, SCK, and SDI. You will install the ESP32 board package and the Adafruit BME280 library, upload a complete sketch, and read both the Serial Monitor and a browser. You will also see how a failed sensor or a failed Wi-Fi join is reported instead of being hidden.

**Text: What this project does not teach**

It does not use a BMP280. A BMP280 can report pressure and temperature, but it has no humidity measurement, and this dashboard needs humidity. It also does not use the ESP32-CAM, an ESP8266, or a Raspberry Pi. Those boards do not share this pin map.

### Step 3 of 31

Stage 1: Introduction

Heading: How the hardware and software work together

Description: Four wires carry power and I2C. The sketch turns those readings into a web page.

Tip: None.

**Text: The path of a reading**

USB power feeds the ESP32 DevKit. The board’s 3V3 pin feeds the BME280 Vin pin, and the two GND pins share a ground. IO21 is the I2C data line and goes to SDI. IO22 is the I2C clock and goes to SCK. The sketch asks the sensor at address 0x77 for temperature, humidity, and pressure, then stores the latest values. A browser requests the page at / and, every two seconds, the JSON document at /readings.

**Text: Why the address is 0x77**

Adafruit’s BME280 guide says the default I2C address is 0x77 while SDO is left open. Connecting SDO to GND changes the address to 0x76. This project leaves SDO, CS, and 3Vo unconnected, so the sketch calls begin(0x77).

### Step 4 of 31

Stage 1: Introduction

Heading: What a successful build should do

Description: Success is a local page with live units, plus a clear error when the sensor or Wi-Fi is missing.

Tip: None.

**Text: Check these behaviours**

After upload, the Serial Monitor at 115200 baud prints either “BME280 ready at 0x77.” or a not-found message. When Wi-Fi joins, it prints “Wi-Fi connected. IP address:” and the address. The web page shows temperature with C, humidity with %, and pressure with hPa. If the sensor is missing, the page shows the error text instead of fake numbers. If the browser is on another network, the page does not load.

**Warning**

This repository has not run the sketch on a physical ESP32. Treat the Serial and browser results below as the behaviour the code is written to produce, and compare them with what your board actually prints.

### Step 5 of 31

Stage 2: Hardware preparation

Heading: Identify every required component

Description: Every physical item in this build is on the BOM. None of these six items is optional.

Tip: A phone or computer is how you view the page. It is not a wired component, so it is not a BOM line.

**Components: Required parts**

- ESP32 DevKit — catalogue id `esp32`, quantity 1, illustration `esp32`
- Adafruit BME280 — catalogue id `bme280`, quantity 1, illustration `bme280`
- Breadboard — catalogue id `breadboard`, quantity 1, illustration `breadboard`
- Jumper Wires — catalogue id `jumper-wires`, quantity 1, illustration `jumper-wires`
- USB data cable — catalogue id `usb-data-cable`, quantity 1, illustration `usb-cable`
- USB power source — catalogue id `usb-power-source`, quantity 1, illustration `generic-module`

**Text: What each part is for**

The ESP32 DevKit is the controller and the web server. The Adafruit BME280 is the only sensor. The breadboard holds the sensor and the jumper wires. One pack of jumper wires makes the six electrical connections. The USB data cable carries power and the upload. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board.

**Expected result: Check**

You can point to one ESP32 DevKit, one Adafruit BME280, one breadboard, one jumper pack, one data-capable USB cable, and a USB port or charger. A BMP280 board is not a substitute on this bench.

### Step 6 of 31

Stage 2: Hardware preparation

Heading: Confirm the ESP32 DevKit labels

Description: This guide uses the catalogue ESP32 DevKit only when its silkscreen matches the DevKitC labels used here.

Tip: Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket, a Boot button, and an EN button.

**Text: What to look for**

Solderi’s ESP32 DevKit row is a 3.3 V board programmed with the Arduino-ESP32 package. This project’s wiring uses four header labels: 3V3, GND, IO21, and IO22. Espressif’s ESP32-DevKitC V4 breaks those names out on the headers: J2 starts with 3V3, and J3 includes IO22 and IO21. Arduino-ESP32’s generic ESP32 default I2C pins are GPIO21 for SDA and GPIO22 for SCL, which are those same headers.

**Text: USB socket**

Espressif’s ESP32-DevKitC V4 uses a USB-A to Micro-B data cable, and its user guide says the Micro-USB port is the default power supply. The catalogue row does not record the socket on every board sold as a DevKit. Before you continue, confirm the silkscreen shows 3V3, GND, IO21 or GPIO21, and IO22 or GPIO22, and use a data cable that physically fits that socket. A charge-only cable can power the board and still never appear as a serial port.

**Warning**

If your board does not show those four labels, stop. Do not move the wires to similarly numbered pins on an ESP32-CAM or another module. Espressif also warns that DevKitC V4 power must come from only one of USB, the 5V pin, or the 3V3 pin.

### Step 7 of 31

Stage 2: Hardware preparation

Heading: Confirm the BME280 pin labels

Description: Use the Adafruit breakout pin names, not a BMP280 module and not a clone with different silk.

Tip: Leave 3Vo, SDO, and CS empty for this project.

**Text: Pins this project uses**

Adafruit’s BME280 pinout names Vin, 3Vo, GND, SCK, SDO, SDI, and CS. Vin is the power input and accepts 3–5 V. This project feeds Vin from the ESP32 3V3 pin. Adafruit says the logic level follows Vin, and the ESP32 DevKit’s GPIO is 3.3 V, so Vin must not be tied to 5 V. 3Vo is a 3.3 V output from the breakout’s regulator. Leave it unconnected. GND is the common ground.

**Text: I2C pins and address**

SCK is the I2C clock and connects to IO22. SDI is the I2C data and connects to IO21. Adafruit’s I2C wiring uses those two signal pins plus Vin and GND, and says to leave the other pins disconnected. The default address is 0x77. A jumper from SDO to GND would select 0x76, which this sketch does not scan. Do not add pull-up resistors: Adafruit’s I2C wiring for this breakout does not call for extra resistors.

**Expected result: Check**

The board in your hand says BME280 and shows Vin, GND, SCK, and SDI. If the silk says BMP280, or the pins are labelled differently, this wiring table does not apply.

### Step 8 of 31

Stage 2: Hardware preparation

Heading: Seat the board and the sensor

Description: Put both boards on the breadboard while USB is still unplugged.

Tip: Straddle the ESP32 across the breadboard centre gap if the headers allow it. Do not bend the header pins to force a fit.

**Text: What to do**

Press the ESP32 DevKit into the breadboard so 3V3, GND, IO21, and IO22 each have an empty hole in the same row. Press the BME280 in so Vin, GND, SCK, and SDI each have their own row. Keep the sensor away from the ESP32 antenna area. Leave the USB cable unplugged until the wiring check later in this guide.

**Expected result: What you should see**

Both boards sit flat. No pin is bent under a board. You can still read the silkscreen for 3V3, GND, IO21, IO22, Vin, GND, SCK, and SDI.

### Step 9 of 31

Stage 3: Wiring

Heading: Connect power and ground

Description: 3V3 and GND go to the breadboard rails, then from those rails to Vin and GND.

Tip: Use the breadboard’s red rail for 3V3 and the blue rail for ground. This project’s positive rail is 3.3 V, not 5 V.

**Text: Connection sequence**

First jumper ESP32 3V3 to the breadboard + rail. Second, jumper ESP32 GND to the breadboard − rail. Third, jumper the + rail to BME280 Vin. Fourth, jumper the − rail to BME280 GND. Do not connect ESP32 5V. Do not connect BME280 3Vo. Do not connect SCK or SDI yet.

**Wiring diagram data: Power and ground**

1. ESP32 DevKit 3V3 → Breadboard + rail (power)
2. ESP32 DevKit GND → Breadboard GND rail (ground)
3. Breadboard + rail → Adafruit BME280 Vin (power)
4. Breadboard GND rail → Adafruit BME280 GND (ground)

**Connection list**

3V3 to Vin · GND to GND

1. ESP32 DevKit 3V3 → Breadboard + rail (power)
2. ESP32 DevKit GND → Breadboard GND rail (ground)
3. Breadboard + rail → Adafruit BME280 Vin (power)
4. Breadboard GND rail → Adafruit BME280 GND (ground)

**Warning**

Adafruit says BME280 logic follows the voltage on Vin. Five volts on Vin would present 5 V logic to IO21 and IO22. The ESP32 DevKit is a 3.3 V board. Keep Vin on 3V3.

### Step 10 of 31

Stage 3: Wiring

Heading: Connect SDA and SCL

Description: IO21 goes to SDI. IO22 goes to SCK. Those are the only signal wires.

Tip: SDA is data. SCL is clock. On this breakout the silk says SDI and SCK, not SDA and SCL.

**Text: Connection sequence**

Jumper ESP32 IO21 to BME280 SDI. Jumper ESP32 IO22 to BME280 SCK. Leave SDO open so the address stays 0x77. Leave CS open. Adafruit’s I2C instructions do not add a separate pull-up resistor for this breakout.

**Wiring diagram data: I2C signals**

1. ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
2. ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Connection list**

IO21 to SDI · IO22 to SCK

1. ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
2. ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Expected result: Check**

You can trace IO21 to SDI and IO22 to SCK without either wire sharing a breadboard row with 3V3 or GND.

### Step 11 of 31

Stage 3: Wiring

Heading: Read the complete wiring table

Description: These six connections are the whole circuit. The sketch uses the same GPIO numbers.

Tip: None.

**Wiring diagram data: Complete wiring diagram**

1. ESP32 DevKit 3V3 → Breadboard + rail (power)
2. ESP32 DevKit GND → Breadboard GND rail (ground)
3. Breadboard + rail → Adafruit BME280 Vin (power)
4. Breadboard GND rail → Adafruit BME280 GND (ground)
5. ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
6. ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Connection list: Every electrical connection**

IO21 SDA · IO22 SCL · 3V3 Vin · common GND · address 0x77

1. ESP32 DevKit 3V3 → Breadboard + rail (power)
2. ESP32 DevKit GND → Breadboard GND rail (ground)
3. Breadboard + rail → Adafruit BME280 Vin (power)
4. Breadboard GND rail → Adafruit BME280 GND (ground)
5. ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
6. ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Text: How this matches the sketch**

The firmware sets I2C_SDA to 21 and I2C_SCL to 22, then calls Wire.begin(I2C_SDA, I2C_SCL) and bme.begin(0x77). GPIO21 is the header labelled IO21. GPIO22 is the header labelled IO22. There is no other GPIO in this project.

### Step 12 of 31

Stage 3: Wiring

Heading: Check the circuit before you apply power

Description: Look once more, then connect USB. Do not also feed the 5V or 3V3 header from a second supply.

Tip: Espressif’s DevKitC V4 guide says USB, the 5V pin, and the 3V3 pin are mutually exclusive power inputs.

**Check: What to verify**

Count six jumpers. 3V3 reaches Vin and does not reach SCK, SDI, SDO, CS, or 3Vo. GND reaches BME280 GND. IO21 reaches only SDI. IO22 reaches only SCK. SDO and CS are empty. The USB cable is not yet plugged in, and nothing else is connected to the 5V pin.

**Text: Then apply power**

Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the 5V Power On LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected.

**Expected result: Expected result**

The board’s power LED is on. The sensor does not get hot. No sketch is running yet, so the Serial Monitor stays quiet until you upload.

### Step 13 of 31

Stage 4: Development environment

Heading: Install the ESP32 board package

Description: The Arduino IDE needs Espressif’s ESP32 package before this board appears in the Board menu.

Tip: Use the stable package URL. The development URL is a different, less settled package.

**Text: What to do**

Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. Restart the IDE if the new board list does not appear.

**Text: Why this package**

WiFi.h and WebServer.h come from that ESP32 package. They are not separate Library Manager installs. The generic ESP32 I2C defaults in that package are GPIO21 and GPIO22, which is why the sketch still names those pins explicitly.

**Expected result: What you should see**

Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group.

### Step 14 of 31

Stage 4: Development environment

Heading: Select the board and the serial port

Description: Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.

Tip: If the port never appears, try another cable before you change any wiring.

**Text: Board**

Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. That is the generic ESP32 target for this DevKit. Do not choose ESP32-CAM or an S2, S3, or C3 board. Leave the other Tools menu flash settings at the ESP32 Dev Module defaults unless a later upload error tells you to change one.

**Text: Port**

Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears. Select it again after you plug the cable back in.

**Troubleshooting: If the port is missing**

- Problem: No new port appears
  Solution: The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port.
- Problem: Several ports are listed
  Solution: Unplug the DevKit, see which port vanishes, and select that one after reconnecting.

### Step 15 of 31

Stage 4: Development environment

Heading: Install the BME280 libraries

Description: Library Manager installs Adafruit BME280 Library together with its two dependencies.

Tip: Search for the library name Adafruit BME280 Library. Do not install a BMP280-only library in its place.

**Text: What to install**

Open Tools > Manage Libraries. Search for Adafruit BME280 Library and install it. Its library.properties file depends on Adafruit Unified Sensor and Adafruit BusIO. Accept the prompt to install those dependencies if the IDE offers it. If it does not, install both by those names from Library Manager as well.

**Text: What you do not install**

Do not install a separate Wi-Fi or web-server library. WiFi.h and WebServer.h are part of the ESP32 board package from the previous step. Do not install Adafruit BMP280 Library for this sketch. The include line is Adafruit_BME280.h, and begin() is the BME280 call.

**Expected result: Check**

Library Manager shows Adafruit BME280 Library, Adafruit Unified Sensor, and Adafruit BusIO as installed.

### Step 16 of 31

Stage 4: Development environment

Heading: Set the Serial Monitor to 115200 baud

Description: The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text, not a dead board.

Tip: None.

**Text: What to do**

Open Tools > Serial Monitor. In the baud menu at the corner of the monitor, choose 115200. Leave the line ending on Newline. You will not see the weather lines until the sketch is uploaded, but setting the speed now avoids mistaking baud noise for a failed sensor.

**Expected result: What you should observe**

The monitor is open on the same port you selected for upload, and the baud value reads 115200. If you later see repeated characters that are not words, the baud setting has been changed.

### Step 17 of 31

Stage 5: Firmware

Heading: Create the sketch and set the Wi-Fi name

Description: Replace the two placeholders with your network name and password. Do not commit a real password into a shared copy.

Tip: The network must be 2.4 GHz. The ESP32 DevKit radio in this project does not join a 5 GHz-only network.

**Text: What to do**

Create a sketch named esp32_wifi_weather_station. You will paste the complete program in a later step. The only lines you edit are the two Wi-Fi placeholders. Use the SSID and password of the same network your phone or computer will use to open the dashboard.

**Code: esp32_wifi_weather_station.ino**

Language: Arduino

Libraries named on this snippet: WiFi (ESP32 Arduino core); WebServer (ESP32 Arduino core); Wire (Arduino core); Adafruit Unified Sensor; Adafruit BusIO; Adafruit BME280 Library

```arduino
const char *WIFI_SSID = "YOUR_WIFI_NAME";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

**Code explanation: Why these constants**

WIFI_SSID and WIFI_PASSWORD are ordinary C strings. YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD are placeholders, not a working network. The rest of the sketch reads these two names, so you do not type the password anywhere else.

### Step 18 of 31

Stage 5: Firmware

Heading: Start I2C and the BME280

Description: The sketch opens GPIO21 and GPIO22, then looks for address 0x77.

Tip: None.

**Text: What this code does**

Wire.begin(21, 22) starts the hardware I2C peripheral on the same pins as the wiring table. bme.begin(0x77) asks the Adafruit library, version that provides begin(uint8_t addr), to initialise the sensor on that address. A true result means the chip answered. A false result is stored as an error and printed. The web server still starts, so the dashboard can show that error.

**Code: esp32_wifi_weather_station.ino**

Language: Arduino

Libraries named on this snippet: Wire; Adafruit BME280 Library; Adafruit Unified Sensor; Adafruit BusIO

```arduino
Wire.begin(I2C_SDA, I2C_SCL);
  sensorReady = bme.begin(BME280_I2C_ADDRESS);
```

**Code explanation**

readTemperature() returns degrees Celsius, readHumidity() returns percent, and readPressure() returns pascals as a float in the current Adafruit_BME280.h. The sketch divides pascals by 100 to show hectopascals. A NaN value becomes the invalid-reading error instead of a number on the page.

### Step 19 of 31

Stage 5: Firmware

Heading: Serve the page and the JSON endpoint

Description: The ESP32 answers / with HTML and /readings with the latest measurements.

Tip: The page asks /readings every two seconds. You do not refresh the browser by hand.

**Text: What this code does**

WebServer server(80) listens on the normal web port. server.on registers two GET routes. handleRoot sends the dashboard HTML. handleReadings sends JSON fields ok, temperature_c, humidity_percent, pressure_hpa, wifi_connected, ip, and error. The HTML uses fetch("/readings") and setInterval(..., 2000). It does not load fonts or scripts from the internet.

**Code: esp32_wifi_weather_station.ino**

Language: Arduino

Libraries named on this snippet: WebServer (ESP32 Arduino core)

```arduino
server.on("/", HTTP_GET, handleRoot);
  server.on("/readings", HTTP_GET, handleReadings);
  server.begin();
```

**Code explanation**

loop() calls server.handleClient() every pass so the page stays responsive. Wi-Fi retries are timed with millis() and WIFI_RETRY_MS. There is no while-loop waiting forever for a network. If the join drops, the next retry prints “Connecting to Wi-Fi...” and the page’s status line says Wi-Fi disconnected until the address returns.

### Step 20 of 31

Stage 5: Firmware

Heading: Paste the complete sketch and upload it

Description: The program below is the whole firmware. Upload it with the board and port you already selected.

Tip: If the upload times out, hold the Boot button, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.

**Code: esp32_wifi_weather_station.ino**

Language: Arduino

Libraries named on this snippet: WiFi (ESP32 Arduino core); WebServer (ESP32 Arduino core); Wire (Arduino core); Adafruit Unified Sensor; Adafruit BusIO; Adafruit BME280 Library

```arduino
/*
 * ESP32 Wi-Fi Weather Station
 * Board: ESP32 Dev Module
 * Sensor: Adafruit BME280 over I2C at 0x77
 * IO21 = SDA = BME280 SDI
 * IO22 = SCL = BME280 SCK
 * 3V3 = BME280 Vin
 * GND = BME280 GND
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

const char *WIFI_SSID = "YOUR_WIFI_NAME";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const int I2C_SDA = 21;
const int I2C_SCL = 22;
const uint8_t BME280_I2C_ADDRESS = 0x77;

const unsigned long SENSOR_INTERVAL_MS = 2000;
const unsigned long WIFI_RETRY_MS = 5000;

Adafruit_BME280 bme;
WebServer server(80);

bool sensorReady = false;
String sensorError = "Sensor has not been read yet.";
float temperatureC = NAN;
float humidityPercent = NAN;
float pressureHpa = NAN;
unsigned long lastSensorReadMs = 0;
unsigned long lastWifiAttemptMs = 0;
bool wifiWasConnected = false;

bool readingIsValid(float value) {
  return !isnan(value);
}

void readSensor() {
  if (!sensorReady) {
    sensorError = "BME280 was not found at address 0x77.";
    temperatureC = NAN;
    humidityPercent = NAN;
    pressureHpa = NAN;
    return;
  }

  float nextTemperature = bme.readTemperature();
  float nextHumidity = bme.readHumidity();
  float nextPressurePa = bme.readPressure();

  if (!readingIsValid(nextTemperature) || !readingIsValid(nextHumidity) || !readingIsValid(nextPressurePa)) {
    sensorError = "BME280 returned an invalid reading.";
    temperatureC = NAN;
    humidityPercent = NAN;
    pressureHpa = NAN;
    return;
  }

  temperatureC = nextTemperature;
  humidityPercent = nextHumidity;
  pressureHpa = nextPressurePa / 100.0f;
  sensorError = "";
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();
  if (lastWifiAttemptMs != 0 && now - lastWifiAttemptMs < WIFI_RETRY_MS) {
    return;
  }

  lastWifiAttemptMs = now;
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

String jsonNumber(float value) {
  if (!readingIsValid(value)) {
    return "null";
  }
  return String(value, 2);
}

String readingsJson() {
  bool wifiConnected = WiFi.status() == WL_CONNECTED;
  String json = "{";
  json += "\"ok\":";
  json += sensorError.length() == 0 ? "true" : "false";
  json += ",\"temperature_c\":";
  json += jsonNumber(temperatureC);
  json += ",\"humidity_percent\":";
  json += jsonNumber(humidityPercent);
  json += ",\"pressure_hpa\":";
  json += jsonNumber(pressureHpa);
  json += ",\"wifi_connected\":";
  json += wifiConnected ? "true" : "false";
  json += ",\"ip\":\"";
  json += wifiConnected ? WiFi.localIP().toString() : "";
  json += "\",\"error\":\"";
  json += sensorError;
  json += "\"}";
  return json;
}

const char DASHBOARD_PAGE[] PROGMEM = R"HTML(<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32 Weather</title>
<style>
body{margin:0;background:#0f172a;color:#e2e8f0;font-family:sans-serif}
main{max-width:28rem;margin:0 auto;padding:1.25rem}
h1{font-size:1.35rem}
.grid{display:grid;gap:.75rem}
.card{background:#1e293b;border-radius:12px;padding:1rem}
.label{color:#94a3b8;font-size:.85rem}
.value{font-size:2rem;margin-top:.25rem}
.error{background:#7f1d1d;border-radius:12px;padding:.75rem 1rem}
</style>
</head>
<body>
<main>
<h1>ESP32 Wi-Fi Weather Station</h1>
<p id="status">Waiting for readings.</p>
<p id="error" class="error" hidden></p>
<div class="grid">
<section class="card"><div class="label">Temperature</div><div id="temperature" class="value">-</div></section>
<section class="card"><div class="label">Humidity</div><div id="humidity" class="value">-</div></section>
<section class="card"><div class="label">Pressure</div><div id="pressure" class="value">-</div></section>
</div>
</main>
<script>
function show(id, text){document.getElementById(id).textContent = text;}
async function refresh(){
  var status = document.getElementById("status");
  var error = document.getElementById("error");
  try {
    var response = await fetch("/readings");
    if (!response.ok) { throw new Error("request failed"); }
    var data = await response.json();
    status.textContent = data.wifi_connected ? "Connected at " + data.ip : "Wi-Fi disconnected";
    if (data.ok) {
      error.hidden = true;
      show("temperature", Number(data.temperature_c).toFixed(1) + " C");
      show("humidity", Number(data.humidity_percent).toFixed(1) + " %");
      show("pressure", Number(data.pressure_hpa).toFixed(1) + " hPa");
    } else {
      error.hidden = false;
      error.textContent = data.error || "Sensor reading unavailable";
      show("temperature", "-");
      show("humidity", "-");
      show("pressure", "-");
    }
  } catch (err) {
    status.textContent = "Dashboard not updating";
    error.hidden = false;
    error.textContent = "This browser could not read /readings. Use the ESP32 IP on the same Wi-Fi network.";
  }
}
refresh();
setInterval(refresh, 2000);
</script>
</body>
</html>)HTML";

void handleRoot() {
  server.send(200, "text/html", DASHBOARD_PAGE);
}

void handleReadings() {
  server.send(200, "application/json", readingsJson());
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("ESP32 Wi-Fi weather station");

  Wire.begin(I2C_SDA, I2C_SCL);
  sensorReady = bme.begin(BME280_I2C_ADDRESS);
  if (sensorReady) {
    Serial.println("BME280 ready at 0x77.");
  } else {
    sensorError = "BME280 was not found at address 0x77.";
    Serial.println(sensorError);
    Serial.println("Leave SDO unconnected for 0x77. A wire from SDO to GND selects 0x76, which this sketch does not use.");
  }

  WiFi.mode(WIFI_STA);
  connectWifi();

  server.on("/", HTTP_GET, handleRoot);
  server.on("/readings", HTTP_GET, handleReadings);
  server.begin();
  Serial.println("HTTP server started on port 80.");
}

void loop() {
  bool wifiConnected = WiFi.status() == WL_CONNECTED;
  if (!wifiConnected) {
    wifiWasConnected = false;
    connectWifi();
  } else if (!wifiWasConnected) {
    wifiWasConnected = true;
    Serial.print("Wi-Fi connected. IP address: ");
    Serial.println(WiFi.localIP());
  }

  server.handleClient();

  unsigned long now = millis();
  if (now - lastSensorReadMs >= SENSOR_INTERVAL_MS) {
    lastSensorReadMs = now;
    readSensor();
    if (sensorError.length() == 0) {
      Serial.print("Temperature C: ");
      Serial.print(temperatureC, 1);
      Serial.print("  Humidity %: ");
      Serial.print(humidityPercent, 1);
      Serial.print("  Pressure hPa: ");
      Serial.println(pressureHpa, 1);
    } else {
      Serial.println(sensorError);
    }
  }
}

```

**Text: Upload**

Replace the two Wi-Fi placeholders if you have not already. Click Upload. Wait until the IDE prints “Hard resetting via RTS pin...” or the equivalent done message. Then open the Serial Monitor at 115200 baud. Do not change IO21, IO22, or 0x77 unless you also change the wiring.

**Expected result: What you should observe**

The IDE finishes the upload without a port error. The Serial Monitor then prints “ESP32 Wi-Fi weather station” and either the sensor-ready line or the not-found line.

### Step 21 of 31

Stage 6: First run

Heading: Read the Serial Monitor

Description: The first lines tell you whether the sensor answered and whether Wi-Fi has been attempted.

Tip: None.

**Text: What to do**

Leave the USB cable on the computer. Open Tools > Serial Monitor at 115200 baud. Press the EN button once if you want a clean restart. Watch the first five seconds.

**Expected result: A healthy start**

You should see “ESP32 Wi-Fi weather station”, then “BME280 ready at 0x77.”, then “Connecting to Wi-Fi...”, then “HTTP server started on port 80.” When the network accepts the board, the next line is “Wi-Fi connected. IP address:” followed by a number. After that, temperature, humidity, and pressure print about every two seconds.

**Troubleshooting: If the text is wrong**

- Problem: The monitor shows symbols instead of words
  Solution: Set the baud rate to 115200. The sketch does not use 9600.
- Problem: Nothing is printed
  Solution: Confirm the port is the DevKit port and that the upload finished. Press EN once.

### Step 22 of 31

Stage 6: First run

Heading: Find the ESP32 IP address

Description: The address is printed only after Wi-Fi connects. The dashboard uses that address.

Tip: Write the address down. It can change if the router hands out a new lease later.

**Text: What to look for**

Find the line “Wi-Fi connected. IP address:”. The four numbers after it, such as 192.168.1.42, are the local address. The sketch also puts that address in the JSON field ip. If the monitor keeps printing “Connecting to Wi-Fi...” every five seconds, the join has not succeeded and there is no page to open yet.

**Expected result: Expected result**

One IPv4 address is printed, and it stays stable across the next sensor lines. You will type http:// and that address into a browser on the same network.

### Step 23 of 31

Stage 6: First run

Heading: Confirm the sensor readings

Description: Temperature, humidity, and pressure should be plausible for the room before you trust the web page.

Tip: Breathing gently across the sensor should move humidity. Do not cover the board so tightly that it overheats.

**Text: What to do**

Read several Serial lines. Temperature is printed in C, humidity in %, and pressure in hPa. Compare the temperature with the room and the pressure with a local weather report. The report will not match to the last digit; it should be in the same neighbourhood, often near 1000 hPa at low altitude. Then breathe across the sensor and watch humidity.

**Expected result: Expected result**

The three numbers keep updating. Humidity moves when you breathe on the sensor. Temperature does not jump by tens of degrees. If the monitor says “BME280 returned an invalid reading.” or the not-found message, fix the sensor before opening the dashboard.

### Step 24 of 31

Stage 7: Dashboard

Heading: Open the web interface

Description: Use the IP address from the Serial Monitor. Do not search for the board on the public internet.

Tip: Include http:// if the browser tries to search for the numbers instead of opening them.

**Text: What to do**

On a phone or computer joined to the same Wi-Fi network, open a browser to http:// and the IP address from the Serial Monitor. The ESP32 returns the dashboard for /. Leave that tab open.

**Expected result: What you should see**

The title is “ESP32 Wi-Fi Weather Station”. A status line says “Connected at” and the IP address. Three cards show temperature, humidity, and pressure. The values change without a manual reload. If the sensor failed, a red error box shows the same message as the Serial Monitor and the cards show a dash.

### Step 25 of 31

Stage 7: Dashboard

Heading: Understand each measurement

Description: The page uses the same units as the Serial Monitor.

Tip: None.

**Text: The three cards**

Temperature is degrees Celsius from readTemperature(). Humidity is relative humidity in percent from readHumidity(). Pressure is hectopascals, which is the library’s pascal reading divided by 100. The status line is the Wi-Fi state, not a weather forecast. There is no outdoor temperature, rainfall, or wind in this project.

**Text: Automatic updates**

The page calls /readings every 2000 ms, which is the same SENSOR_INTERVAL_MS the sketch uses to take a new sample. You should see the numbers change, or the error box appear, without pressing reload. You can also open http://THE_IP/readings directly to see the JSON document the page is using.

### Step 26 of 31

Stage 7: Dashboard

Heading: Use the page on a phone and a computer

Description: Any browser on the same local network can open the station. A device on mobile data cannot.

Tip: If the phone is on cellular data, join the same Wi-Fi network as the ESP32 first.

**Text: What to do**

Open the same http://IP address on a second device. The page layout is a single column with large type so it fits a phone width. Both devices should show the same reading within one refresh. Unplug the Wi-Fi router only if you are ready to watch the status change to Wi-Fi disconnected; otherwise leave the network up.

**Expected result: Expected result**

Both browsers show the dashboard. The status line includes the IP address while Wi-Fi is connected. Closing the Serial Monitor does not stop the page, because the page is served by the ESP32, not by the Arduino IDE.

### Step 27 of 31

Stage 8: Troubleshooting

Heading: The ESP32 is not detected or the upload fails

Description: Fix the cable, the port, and the boot button before you change the circuit.

Tip: None.

**Troubleshooting: Board and upload**

- Problem: The ESP32 never appears as a port
  Solution: Use a data-capable cable that fits the socket. Plug it directly into the computer, select Tools > Port again, and confirm the power LED is on. A charge-only cable can light the LED and still provide no serial port.
- Problem: Upload times out or cannot connect
  Solution: Confirm the board is ESP32 Dev Module and the port is the one that disappears when you unplug the cable. Hold Boot, tap EN, release Boot, and upload again. That is the DevKitC V4 firmware-download sequence.
- Problem: The IDE cannot find WiFi.h or WebServer.h
  Solution: The ESP32 board package is not selected or not installed. Install the esp32 package from the stable Espressif boards URL and choose ESP32 Dev Module.

### Step 28 of 31

Stage 8: Troubleshooting

Heading: The sensor, Wi-Fi, or dashboard fails

Description: The Serial line names the fault. Match it to the wiring or the network before rewriting the sketch.

Tip: Adafruit notes that intermittent I2C on the original non-STEMMA BME280 can be improved by jumpering CS to Vin. Try that only after the four main wires are correct.

**Troubleshooting: Sensor, network, and page**

- Problem: Serial says the BME280 was not found at 0x77
  Solution: Check Vin on 3V3, GND on GND, SDI on IO21, and SCK on IO22. Leave SDO open. A wire from SDO to GND selects 0x76, and this sketch will not find that address. Confirm the board is a BME280, not a BMP280.
- Problem: Serial says the BME280 returned an invalid reading
  Solution: Power and ground are probably present because the chip answered begin(), but a later read failed. Reseat SCK and SDI, keep the wires short, and press EN to restart.
- Problem: The monitor repeats “Connecting to Wi-Fi...”
  Solution: Check the SSID and password, including capitals. The DevKit needs a 2.4 GHz network. The computer’s serial cable does not join Wi-Fi for the board; the board joins by itself.
- Problem: The browser cannot open the IP address
  Solution: Use http:// and the address from the latest “Wi-Fi connected” line. The phone or computer must be on that same network. Another network, or mobile data, cannot route to the ESP32.
- Problem: The page stays on “Dashboard not updating”
  Solution: The HTML loaded, but /readings did not. Reload once. If Serial has stopped printing, press EN. If Serial is printing and the page still fails, confirm you opened the ESP32 address and not a cached page from another device.

### Step 29 of 31

Stage 9: Understanding and extending the project

Heading: How this I2C link works

Description: Two wires and one address are enough because the ESP32 is the only master.

Tip: None.

**Text: Clock and data**

I2C uses SCL for the clock and SDA for the data. On this board those pins are IO22 and IO21. The ESP32 generates the clock and talks to the address in bme.begin. The BME280 does not send readings until that address is used. Arduino-ESP32 documents that SDA and SCL need pull-ups; this project relies on the Adafruit breakout’s I2C wiring, which connects SCK and SDI without extra resistors.

**Text: Why BMP280 is a different part**

The BME280 measures humidity as well as pressure and temperature. A BMP280 does not provide that humidity reading, so it cannot fill this dashboard even if it shares a similar package. Solderi keeps the two parts as different catalogue rows, and this project does not approve the BMP280 as a substitute.

### Step 30 of 31

Stage 9: Understanding and extending the project

Heading: How the ESP32 hosts the page

Description: The board is a small web server on your LAN. Your browser is the client.

Tip: None.

**Text: Address and routes**

After WiFi.begin succeeds, the router gives the ESP32 an address. server.begin() listens on port 80. A browser request for / receives the HTML. The script inside that HTML requests /readings. handleReadings sends the latest sample as JSON. The sketch updates that sample on SENSOR_INTERVAL_MS without waiting inside a blocking Wi-Fi loop.

**Text: What is deliberately absent**

There is no API key, no account, and no external weather service. If your internet connection drops but the local Wi-Fi router stays up, the page can still load. If the ESP32 itself drops off Wi-Fi, the status line changes and connectWifi() tries again every five seconds.

### Step 31 of 31

Stage 9: Understanding and extending the project

Heading: Ideas that are not part of this build

Description: These extensions need their own wiring or code review. They are not already supported.

Tip: None.

**Text: Possible later work**

A second sensor, an outdoor enclosure, a display, or a cloud upload would change the BOM, the power budget, or the firmware. Switching SDO to ground would require changing BME280_I2C_ADDRESS to 0x76 and saying so in the wiring steps. None of that is included here. The working station is the six-wire circuit, the sketch you uploaded, and the local dashboard.

**Expected result: What you have now**

An ESP32 DevKit reads an Adafruit BME280 at 0x77 on IO21 and IO22, joins your Wi-Fi, and shows temperature, humidity, and pressure in a browser on the same network.

## 4. Wiring connections and diagram data

These six connections are the project wiring list. The same rows are embedded in the wiring steps above.

1. ESP32 DevKit 3V3 → Breadboard + rail (power)
2. ESP32 DevKit GND → Breadboard GND rail (ground)
3. Breadboard + rail → Adafruit BME280 Vin (power)
4. Breadboard GND rail → Adafruit BME280 GND (ground)
5. ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
6. ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

The on-screen diagram is drawn from this layout. It is not a separate image file.

Layout slug: `23`

Canvas: 720 × 460

- ESP32 DevKit (`esp32`, kind `esp32-devkit`)
  Aliases: esp32, esp32 devkit
  Position: x 16, y 36, width 210, height 380
  Port 3V3 (`3v3`): dx 210, dy 78; aliases 3v3
  Port GND (`gnd`): dx 210, dy 118; aliases gnd
  Port IO21 (`io21`): dx 210, dy 198; aliases io21, gpio21
  Port IO22 (`io22`): dx 210, dy 238; aliases io22, gpio22
- Breadboard (`breadboard`, kind `breadboard`)
  Aliases: breadboard
  Position: x 250, y 36, width 210, height 380
  Power rail label: + 3V3
  Port + rail (`plus`): dx 28, dy 19; aliases plusrail
  Port GND rail (`minus`): dx 28, dy 43; aliases gndrail
- BME280 (`bme280`, kind `bme280`)
  Aliases: bme280, adafruit bme280
  Position: x 490, y 110, width 200, height 210
  Port Vin (`vin`): dx 0, dy 58; aliases vin
  Port GND (`gnd`): dx 0, dy 90; aliases gnd
  Port SCK (`sck`): dx 0, dy 132; aliases sck, scl
  Port SDI (`sdi`): dx 0, dy 164; aliases sdi, sda

## 5. Code snippets shown in the walkthrough

Each snippet is printed in full inside its step above. This list is the snippet inventory.

- Step 17, Create the sketch and set the Wi-Fi name, block 2: `esp32_wifi_weather_station.ino` (2 lines)
- Step 18, Start I2C and the BME280, block 2: `esp32_wifi_weather_station.ino` (2 lines)
- Step 19, Serve the page and the JSON endpoint, block 2: `esp32_wifi_weather_station.ino` (3 lines)
- Step 20, Paste the complete sketch and upload it, block 1: `esp32_wifi_weather_station.ino` (237 lines)

## 6. Complete final ESP32 firmware

This is `ESP32_WIFI_WEATHER_FIRMWARE`. Step 20 pastes this same program.

```arduino
/*
 * ESP32 Wi-Fi Weather Station
 * Board: ESP32 Dev Module
 * Sensor: Adafruit BME280 over I2C at 0x77
 * IO21 = SDA = BME280 SDI
 * IO22 = SCL = BME280 SCK
 * 3V3 = BME280 Vin
 * GND = BME280 GND
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

const char *WIFI_SSID = "YOUR_WIFI_NAME";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const int I2C_SDA = 21;
const int I2C_SCL = 22;
const uint8_t BME280_I2C_ADDRESS = 0x77;

const unsigned long SENSOR_INTERVAL_MS = 2000;
const unsigned long WIFI_RETRY_MS = 5000;

Adafruit_BME280 bme;
WebServer server(80);

bool sensorReady = false;
String sensorError = "Sensor has not been read yet.";
float temperatureC = NAN;
float humidityPercent = NAN;
float pressureHpa = NAN;
unsigned long lastSensorReadMs = 0;
unsigned long lastWifiAttemptMs = 0;
bool wifiWasConnected = false;

bool readingIsValid(float value) {
  return !isnan(value);
}

void readSensor() {
  if (!sensorReady) {
    sensorError = "BME280 was not found at address 0x77.";
    temperatureC = NAN;
    humidityPercent = NAN;
    pressureHpa = NAN;
    return;
  }

  float nextTemperature = bme.readTemperature();
  float nextHumidity = bme.readHumidity();
  float nextPressurePa = bme.readPressure();

  if (!readingIsValid(nextTemperature) || !readingIsValid(nextHumidity) || !readingIsValid(nextPressurePa)) {
    sensorError = "BME280 returned an invalid reading.";
    temperatureC = NAN;
    humidityPercent = NAN;
    pressureHpa = NAN;
    return;
  }

  temperatureC = nextTemperature;
  humidityPercent = nextHumidity;
  pressureHpa = nextPressurePa / 100.0f;
  sensorError = "";
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();
  if (lastWifiAttemptMs != 0 && now - lastWifiAttemptMs < WIFI_RETRY_MS) {
    return;
  }

  lastWifiAttemptMs = now;
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

String jsonNumber(float value) {
  if (!readingIsValid(value)) {
    return "null";
  }
  return String(value, 2);
}

String readingsJson() {
  bool wifiConnected = WiFi.status() == WL_CONNECTED;
  String json = "{";
  json += "\"ok\":";
  json += sensorError.length() == 0 ? "true" : "false";
  json += ",\"temperature_c\":";
  json += jsonNumber(temperatureC);
  json += ",\"humidity_percent\":";
  json += jsonNumber(humidityPercent);
  json += ",\"pressure_hpa\":";
  json += jsonNumber(pressureHpa);
  json += ",\"wifi_connected\":";
  json += wifiConnected ? "true" : "false";
  json += ",\"ip\":\"";
  json += wifiConnected ? WiFi.localIP().toString() : "";
  json += "\",\"error\":\"";
  json += sensorError;
  json += "\"}";
  return json;
}

const char DASHBOARD_PAGE[] PROGMEM = R"HTML(<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32 Weather</title>
<style>
body{margin:0;background:#0f172a;color:#e2e8f0;font-family:sans-serif}
main{max-width:28rem;margin:0 auto;padding:1.25rem}
h1{font-size:1.35rem}
.grid{display:grid;gap:.75rem}
.card{background:#1e293b;border-radius:12px;padding:1rem}
.label{color:#94a3b8;font-size:.85rem}
.value{font-size:2rem;margin-top:.25rem}
.error{background:#7f1d1d;border-radius:12px;padding:.75rem 1rem}
</style>
</head>
<body>
<main>
<h1>ESP32 Wi-Fi Weather Station</h1>
<p id="status">Waiting for readings.</p>
<p id="error" class="error" hidden></p>
<div class="grid">
<section class="card"><div class="label">Temperature</div><div id="temperature" class="value">-</div></section>
<section class="card"><div class="label">Humidity</div><div id="humidity" class="value">-</div></section>
<section class="card"><div class="label">Pressure</div><div id="pressure" class="value">-</div></section>
</div>
</main>
<script>
function show(id, text){document.getElementById(id).textContent = text;}
async function refresh(){
  var status = document.getElementById("status");
  var error = document.getElementById("error");
  try {
    var response = await fetch("/readings");
    if (!response.ok) { throw new Error("request failed"); }
    var data = await response.json();
    status.textContent = data.wifi_connected ? "Connected at " + data.ip : "Wi-Fi disconnected";
    if (data.ok) {
      error.hidden = true;
      show("temperature", Number(data.temperature_c).toFixed(1) + " C");
      show("humidity", Number(data.humidity_percent).toFixed(1) + " %");
      show("pressure", Number(data.pressure_hpa).toFixed(1) + " hPa");
    } else {
      error.hidden = false;
      error.textContent = data.error || "Sensor reading unavailable";
      show("temperature", "-");
      show("humidity", "-");
      show("pressure", "-");
    }
  } catch (err) {
    status.textContent = "Dashboard not updating";
    error.hidden = false;
    error.textContent = "This browser could not read /readings. Use the ESP32 IP on the same Wi-Fi network.";
  }
}
refresh();
setInterval(refresh, 2000);
</script>
</body>
</html>)HTML";

void handleRoot() {
  server.send(200, "text/html", DASHBOARD_PAGE);
}

void handleReadings() {
  server.send(200, "application/json", readingsJson());
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("ESP32 Wi-Fi weather station");

  Wire.begin(I2C_SDA, I2C_SCL);
  sensorReady = bme.begin(BME280_I2C_ADDRESS);
  if (sensorReady) {
    Serial.println("BME280 ready at 0x77.");
  } else {
    sensorError = "BME280 was not found at address 0x77.";
    Serial.println(sensorError);
    Serial.println("Leave SDO unconnected for 0x77. A wire from SDO to GND selects 0x76, which this sketch does not use.");
  }

  WiFi.mode(WIFI_STA);
  connectWifi();

  server.on("/", HTTP_GET, handleRoot);
  server.on("/readings", HTTP_GET, handleReadings);
  server.begin();
  Serial.println("HTTP server started on port 80.");
}

void loop() {
  bool wifiConnected = WiFi.status() == WL_CONNECTED;
  if (!wifiConnected) {
    wifiWasConnected = false;
    connectWifi();
  } else if (!wifiWasConnected) {
    wifiWasConnected = true;
    Serial.print("Wi-Fi connected. IP address: ");
    Serial.println(WiFi.localIP());
  }

  server.handleClient();

  unsigned long now = millis();
  if (now - lastSensorReadMs >= SENSOR_INTERVAL_MS) {
    lastSensorReadMs = now;
    readSensor();
    if (sensorError.length() == 0) {
      Serial.print("Temperature C: ");
      Serial.print(temperatureC, 1);
      Serial.print("  Humidity %: ");
      Serial.print(humidityPercent, 1);
      Serial.print("  Pressure hPa: ");
      Serial.println(pressureHpa, 1);
    } else {
      Serial.println(sensorError);
    }
  }
}

```

## 7. Libraries, dependencies and setup

Libraries named by the firmware constant:

- WiFi (ESP32 Arduino core)
- WebServer (ESP32 Arduino core)
- Wire (Arduino core)
- Adafruit Unified Sensor
- Adafruit BusIO
- Adafruit BME280 Library

Setup instructions are the Development environment and Firmware steps (steps 13–20). They are copied in full in section 3, including the boards URL `https://espressif.github.io/arduino-esp32/package_esp32_index.json` and the board name ESP32 Dev Module.

## 8. Troubleshooting

Troubleshooting text is in steps 14, 21, 27 and 28. Those steps are copied in full in section 3.

## 9. Compatibility requirements and approved substitutions

Every requirement is stored with substitution policy `exact`. No pin roles are stored. No substitution reviews are stored. There are no approved substitutions.

Requirement constraints stored for slug 23:

- `esp32` function = development_board
- `esp32` logic_level_v = 3.3
- `esp32` supply_v = 3.3
- `esp32` programming_environment = arduino_ide
- `esp32` board_package = esp32
- `bme280` function = bme280
- `bme280` interface = i2c

Catalogue capabilities stored on the BME280 component, separate from the project requirement:

- function = bme280
- interface = i2c
- interface = spi

The walkthrough text says a BMP280, an ESP32-CAM, an ESP8266, and a Raspberry Pi are not this project’s parts. Those sentences are in steps 2, 5 and 29.

## 10. References named by the tutorial

The project does not store a separate bibliography. These are the external documents and URLs named in the stored steps:

- Adafruit’s BME280 guide, pinout, and I2C wiring. No URL is stored.
- Espressif’s ESP32-DevKitC V4 user guide. No URL is stored.
- Arduino-ESP32 generic ESP32 default I2C pins, and the note that SDA and SCL need pull-ups. No URL is stored.
- Arduino IDE from arduino.cc.
- Boards Manager URL: `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
- Adafruit BME280 Library, including its `library.properties` dependencies Adafruit Unified Sensor and Adafruit BusIO.
- `Adafruit_BME280.h` for `begin(uint8_t addr)`, `readTemperature()`, `readHumidity()`, and `readPressure()`.

## Database and local-source discrepancies

The stored project row, bill of materials, requirement roles, substitution policies, constraints, and all 31 step titles, descriptions, tips, and stages match the local authoring files. Pin-role rows: 0. Substitution-review rows: 0.

The only stored instructional difference is the step 1 image caption:

- Database: `ESP32, BME280, and a local dashboard. This drawing is the project cover, not a photograph of a finished build.`
- Local authoring file: `The finished station is an ESP32 DevKit and a BME280 on a breadboard, powered from USB. The workbench photograph is not in the app yet. The wiring diagram is the connection reference.`
- Caption the app shows for that image, because the stored caption does not already say the photograph is missing: `The workbench photograph is not in the app yet. The wiring diagram is the connection reference.`

Every other step block matches `constants/walkthroughs/esp32-wifi-weather-station.ts` after sorting JSON keys. The firmware string stored in step 20 matches `ESP32_WIFI_WEATHER_FIRMWARE`. The wiring diagram layout and the firmware constant are local files. They are not separate database rows. The firmware text is also stored inside step 20.

## Missing content

- No photographic project cover is stored. The cover key `esp32WifiWeather` is a placeholder in the app.
- No rendered picture of the wiring diagram is stored. The diagram data is the layout in section 4.
- No separate bibliography is stored. Section 10 lists only the documents and the one URL named inside the steps.
- No approved substitutions, pin roles, or substitution reviews are stored.
