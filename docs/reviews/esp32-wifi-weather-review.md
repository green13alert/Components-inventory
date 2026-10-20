# ESP32 Wi-Fi Weather Station

Exported from the current linked Supabase records (`public.projects`, `public.project_steps`, `public.project_components`, `public.components`, and `public.project_requirements`) on 20 October 2026. Step text is verbatim. This file is for independent review.

## Project

- Slug: 23
- Title: ESP32 Wi-Fi Weather Station
- Description: Measure temperature, humidity, and pressure, then read them on a local ESP32 web page.
- Overview: Build a local weather station with an ESP32 DevKit and an Adafruit BME280. The board joins your Wi-Fi network and serves a dashboard that refreshes temperature, humidity, and pressure. No cloud account is required.
- Category: iot
- Difficulty: intermediate
- Estimated duration: 3 hrs
- Publication status: unpublished
- Cover image key: esp32WifiWeather
- Cover asset: assets/images/projects/project-esp32-wifi-weather.jpg (workbench photograph)

### Learning objectives

- Wire an Adafruit BME280 to an ESP32 DevKit on I2C at 3.3 V
- Install the ESP32 Arduino board package and the Adafruit BME280 library
- Host a local web dashboard and JSON readings endpoint on the ESP32
- Use the Serial Monitor to diagnose the sensor and the Wi-Fi address

### Hardware-testing limit recorded in the exported text

No separate hardware-test certificate is stored in Supabase. The only testing limits are the ones written in the steps and firmware comments below. A published flag is not a record that the board was built.

## Bill of materials

| Qty | Catalogue id | Name | Category | Manufacturer | Part number |
| --- | --- | --- | --- | --- | --- |
| 1 | esp32 | ESP32 DevKit | microcontrollers |  |  |
| 1 | bme280 | Adafruit BME280 | sensors |  |  |
| 1 | stemma-qt-cable | STEMMA QT to male cable | modules |  |  |
| 1 | breadboard | Breadboard | modules |  |  |
| 4 | jumper-male-female | Male-to-female jumper wires | modules |  |  |
| 1 | usb-data-cable | USB data cable | modules |  |  |
| 1 | usb-power-source | USB power source | power |  |  |

- **ESP32 DevKit:** Wi-Fi and Bluetooth development board. This row does not fix header gender, USB socket, or board outline.
- **Adafruit BME280:** Adafruit BME280. The sensor is soldered to the PCB; the 0.1 inch header is not. Current product 2652 has STEMMA QT sockets. I2C uses Vin, GND, SCK, and SDI.
- **STEMMA QT to male cable:** JST-SH female to four male pins, such as Adafruit 4209. Black is GND, red is VIN, blue is SDA, and yellow is SCL.
- **Breadboard:** Solderless prototyping board
- **Male-to-female jumper wires:** Dupont wires with a female socket on one end and a male pin on the other. The socket fits a male header pin.
- **USB data cable:** Data-capable USB cable. Espressif ESP32-DevKitC V4 uses USB-A to Micro-B. The plug must match the DevKit socket.
- **USB power source:** Computer USB port or USB charger. Espressif ESP32-DevKitC V4 takes power from USB, or the 5V pin, or the 3V3 pin, and only one of those at a time.

## Compatibility requirements

- ESP32 DevKit (`esp32`) ×1 — role `microcontroller`, policy `exact`
- Adafruit BME280 (`bme280`) ×1 — role `environment_sensor`, policy `exact`
- STEMMA QT to male cable (`stemma-qt-cable`) ×1 — role `sensor_cable`, policy `exact`
- Breadboard (`breadboard`) ×1 — role `breadboard`, policy `exact`
- Male-to-female jumper wires (`jumper-male-female`) ×4 — role `jumper_wires`, policy `exact`
- USB data cable (`usb-data-cable`) ×1 — role `usb_cable`, policy `exact`
- USB power source (`usb-power-source`) ×1 — role `usb_power`, policy `exact`

## Complete firmware source

This is the longest code block stored on the walkthrough. The same text is repeated, unabbreviated, on the step where the app shows it.

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

## Wiring diagram source

The app draws the physical diagram from the local layout `constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts`, not from a diagram stored in Supabase. The connections named inside each step below are the database records. Hole coordinates are listed here so a reviewer can find the placement without treating this prose as a substitute for the drawing.

Schematic canvas: 360 × 300. Legend voltages come from that layout file.

Breadboard rows: 17. Rail split after row: 15.

### Component leads

- bme280 vin → left plus rail row 6
- bme280 gnd → left minus rail row 6
- bme280 sdi → strip row 10 column a
- bme280 sck → strip row 14 column a

### Jumpers

- `devkit-3v3` (male-female) module esp32 port 3v3 → left plus rail row 9
- `devkit-gnd` (male-female) module esp32 port gnd → left minus rail row 9
- `devkit-io21` (male-female) module esp32 port io21 → strip row 10 column b
- `devkit-io22` (male-female) module esp32 port io22 → strip row 14 column b

### Off-board modules

- esp32 at (-188, 12), 148 × 344
  - 3v3 (3V3) at (-172, 34)
  - gnd (GND) at (-172, 242)
  - io22 (IO22) at (-56, 66)
  - io21 (IO21) at (-56, 114)
- bme280 at (430, 48), 132 × 96

## Walkthrough

25 steps.

### Step 1 of 25 — What the finished station does

- Stage 0: Introduction
- Sort order: 0

The ESP32 reads a BME280 and serves the readings on your own Wi-Fi network.

**Block:** image

Image key: esp32WifiWeather
Asset: assets/images/projects/project-esp32-wifi-weather.jpg (workbench photograph)
Caption: The finished station is an ESP32-DevKitC V4 and an Adafruit BME280 beside a breadboard, powered from USB. The wiring diagram is the connection reference.

**Block:** text
**Heading:** What you are building

The finished station measures temperature in degrees Celsius, relative humidity in percent, and barometric pressure in hectopascals. The ESP32 DevKit joins a Wi-Fi network you choose and hosts a small web page. A phone or computer on that same network opens the page and sees the numbers update about every two seconds. Nothing is sent to a cloud service.

**Block:** expected
**Heading:** What done looks like

The Serial Monitor prints an IP address such as 192.168.1.42, then repeating temperature, humidity, and pressure lines. A browser on the same local network opens that address and shows the same three readings.

### Step 2 of 25 — Identify every required component

- Stage 1: Hardware preparation
- Sort order: 1

Every physical item in this build is on the BOM. None of these parts is optional.

**Tip:** A phone or computer is how you view the page. It is not a wired component, so it is not a BOM line.

**Block:** components
**Heading:** Required parts

- ESP32 DevKit ×1 — catalogue id `esp32`, illustration `esp32` (shared vector illustration, not a photograph)

- Adafruit BME280 ×1 — catalogue id `bme280`, illustration `bme280` (shared vector illustration, not a photograph)

- STEMMA QT to male cable ×1 — catalogue id `stemma-qt-cable`, illustration `jumper-wires` (shared vector illustration, not a photograph)

- Breadboard ×1 — catalogue id `breadboard`, illustration `breadboard` (shared vector illustration, not a photograph)

- Male-to-female jumper wires ×4 — catalogue id `jumper-male-female`, illustration `jumper-wires` (shared vector illustration, not a photograph)

- USB data cable ×1 — catalogue id `usb-data-cable`, illustration `usb-cable` (shared vector illustration, not a photograph)

- USB power source ×1 — catalogue id `usb-power-source`, illustration `generic-module` (shared vector illustration, not a photograph)

**Block:** text
**Heading:** What each part is for

The ESP32 DevKit is the controller and the web server. This build uses an Espressif ESP32-DevKitC V4 with male pin headers. The Adafruit BME280 is the only sensor. Its STEMMA QT socket takes the cable, so you do not solder the breakout. The breadboard joins the cable pins to four male-to-female jumpers. The USB data cable is USB-A to Micro-B and must carry data. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board.

**Block:** expected
**Heading:** Check

You can point to one ESP32-DevKitC V4 with male headers, one Adafruit BME280 with a STEMMA QT socket, one STEMMA QT to male cable, one breadboard, four male-to-female jumpers, one USB-A to Micro-B data cable, and a USB port or charger. A BMP280 board is not a substitute on this bench.

### Step 3 of 25 — Confirm the ESP32 DevKit labels

- Stage 1: Hardware preparation
- Sort order: 2

Use an Espressif ESP32-DevKitC V4 with male headers. A generic DevKit is not assumed to match it.

**Tip:** Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket, a Boot button, an EN button, and either male or female headers.

**Block:** text
**Heading:** What to look for

Solderi’s ESP32 DevKit row is only a 3.3 V board programmed with the Arduino-ESP32 package. It does not record one outline or one connector. This project’s mechanical steps are for the Espressif ESP32-DevKitC V4 with male pin headers. Its user guide puts 3V3 on header J2 and IO22 plus IO21 on header J3, so the wires use both sides of the board. Arduino-ESP32’s generic ESP32 default I2C pins are GPIO21 for SDA and GPIO22 for SCL. The male pins are already fitted. Do not solder the DevKit.

**Block:** text
**Heading:** USB socket and fit

The DevKitC V4 user guide names a Micro-USB port as the default power supply and says the board can be mounted on a breadboard or wired with jumpers. It also sells male-header and female-header versions, and this repository has not measured the distance between the two pin rows. Do not force the board across a breadboard’s centre gap. Place it beside the breadboard and use male-to-female jumpers: the female socket goes on a male header pin, and the male pin goes into the breadboard. Use a USB-A to Micro-B cable that carries data. A charge-only cable can light the board and still never appear as a serial port. A USB-C cable does not fit this socket.

**Block:** warning

If the silkscreen does not show 3V3, GND, IO21 or GPIO21, and IO22 or GPIO22, stop. If the headers are female sockets, stop: this BOM’s jumpers will not match them. Do not move the wires onto an ESP32-CAM or another module. Espressif warns that DevKitC V4 power must come from only one of USB, the 5V pin, or the 3V3 pin.

### Step 4 of 25 — Confirm the BME280 pin labels

- Stage 1: Hardware preparation
- Sort order: 3

Use the current Adafruit STEMMA QT breakout. Do not solder its header.

**Tip:** Leave 3Vo, SDO, CS, and the ADDR jumper empty for this project.

**Block:** text
**Heading:** Pins this project uses

Adafruit’s BME280 pinout names Vin, 3Vo, GND, SCK, SDO, SDI, and CS. Vin is the power input and accepts 3–5 V. This project feeds Vin from the ESP32 3V3 pin. Adafruit says the logic level follows Vin, and the ESP32 DevKit’s GPIO is 3.3 V, so Vin must not be tied to 5 V. 3Vo is a 3.3 V output from the breakout’s regulator. Leave it unconnected. GND is the common ground.

**Block:** text
**Heading:** I2C pins and address

SCK is the I2C clock and connects to IO22. SDI is the I2C data and connects to IO21. Adafruit’s I2C wiring uses those two signal pins plus Vin and GND, and says to leave the other pins disconnected. The default address is 0x77. A jumper from SDO to GND, or soldering the ADDR jumper on the back, changes the address to 0x76, which this sketch does not scan. Adafruit’s I2C page does not add a separate pull-up resistor, so this project does not put one on the BOM.

**Block:** text
**Heading:** How you connect it without soldering

Adafruit’s current product 2652 is the STEMMA QT board. The BME280 chip is already soldered to that PCB. The loose 0.1 inch header is not soldered, and Adafruit’s assembly page tells you to solder it only if you want the holes in a breadboard. This project does not do that. Plug a STEMMA QT to male cable, such as Adafruit 4209, into either STEMMA QT socket. Adafruit’s cable colours are black for GND, red for VIN, blue for SDA, and yellow for SCL. Blue is SDI. Yellow is SCK. An older breakout with no STEMMA QT socket is not this build.

**Block:** expected
**Heading:** Check

The board says BME280, has a STEMMA QT socket, and the cable is latched in. If the silk says BMP280, or there is no STEMMA QT socket, this wiring does not apply.

### Step 5 of 25 — Seat the board and the sensor

- Stage 1: Hardware preparation
- Sort order: 4

Leave both boards off the breadboard holes. USB stays unplugged.

**Tip:** A full-size breadboard often splits each coloured rail in the middle. Use one continuous half, or bridge that gap.

**Block:** text
**Heading:** What to do

Set the DevKitC V4 beside the breadboard. Do not press its headers into the holes, and do not push the BME280 board in either. The STEMMA QT cable’s male pins are what enter the breadboard: red in the left + rail at row 6, black in the left − rail at row 6, blue in a10, yellow in a14. Stay above a break in the rail. Leave USB unplugged until the wiring check.

**Block:** wiring
**Heading:** Cable seated
- Breadboard + rail → Adafruit BME280 Vin (power)
- Breadboard GND rail → Adafruit BME280 GND (ground)

Progressive assembly — parts introduced: bme280
Progressive assembly — jumpers introduced: (none)

**Block:** expected
**Heading:** What you should see

The DevKit is beside the breadboard, the sensor is beside it, and four male cable pins are in the breadboard: red in the red rail, black in the blue rail, blue and yellow in their own rows. You can still read 3V3, GND, IO21, and IO22 on the DevKit.

### Step 6 of 25 — Connect power and ground

- Stage 2: Wiring
- Sort order: 5

3V3 and GND go to the breadboard rails, then from those rails to Vin and GND.

**Tip:** Use the breadboard’s red rail for 3V3 and the blue rail for ground. This project’s positive rail is 3.3 V, not 5 V.

**Block:** text
**Heading:** Connection sequence

Use two male-to-female jumpers. DevKit 3V3 goes to the left + rail at row 9, on the same unbroken rail as the cable’s red pin at row 6. DevKit GND goes to the left − rail at row 9, with the cable’s black pin at row 6. Do not add another wire to the sensor for power. Do not connect ESP32 5V or BME280 3Vo. Leave the blue and yellow pins for the next step.

**Block:** wiring
**Heading:** Power and ground
- ESP32 DevKit 3V3 → Breadboard + rail (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard + rail → Adafruit BME280 Vin (power)
- Breadboard GND rail → Adafruit BME280 GND (ground)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-3v3, devkit-gnd

**Block:** connections

3V3 to Vin · GND to GND
- ESP32 DevKit 3V3 → Breadboard + rail (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard + rail → Adafruit BME280 Vin (power)
- Breadboard GND rail → Adafruit BME280 GND (ground)

**Block:** warning

Adafruit says BME280 logic follows the voltage on Vin. Five volts on Vin would present 5 V logic to IO21 and IO22. The ESP32 DevKit is a 3.3 V board. Keep Vin on 3V3.

### Step 7 of 25 — Connect SDA and SCL

- Stage 2: Wiring
- Sort order: 6

IO21 goes to SDI. IO22 goes to SCK. Those are the only signal wires.

**Tip:** SDA is data. SCL is clock. On this breakout the silk says SDI and SCK, not SDA and SCL.

**Block:** text
**Heading:** Connection sequence

Put a male-to-female jumper on IO21 and its pin in b10, the same row as the cable’s blue SDI pin in a10. Put another on IO22 and its pin in b14, the same row as the yellow SCK pin in a14. That is four male-to-female jumpers in the whole build, plus the STEMMA QT cable. Leave SDO open so the address stays 0x77. Leave CS open and leave the ADDR jumper unsoldered.

**Block:** wiring
**Heading:** I2C signals
- ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
- ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

Progressive assembly — parts introduced: (none)
Progressive assembly — jumpers introduced: devkit-io21, devkit-io22

**Block:** connections

IO21 to SDI · IO22 to SCK
- ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
- ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Block:** expected
**Heading:** Check

IO21 shares a row only with the blue pin, and IO22 shares a row only with the yellow pin. Neither signal row touches the red rail or the blue rail.

### Step 8 of 25 — Read the complete wiring table

- Stage 2: Wiring
- Sort order: 7

These six connections are the whole circuit. The sketch uses the same GPIO numbers.

**Block:** wiring
**Heading:** Complete wiring diagram
- ESP32 DevKit 3V3 → Breadboard + rail (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard + rail → Adafruit BME280 Vin (power)
- Breadboard GND rail → Adafruit BME280 GND (ground)
- ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
- ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Block:** connections
**Heading:** Every electrical connection

IO21 SDA · IO22 SCL · 3V3 Vin · common GND · address 0x77
- ESP32 DevKit 3V3 → Breadboard + rail (power)
- ESP32 DevKit GND → Breadboard GND rail (ground)
- Breadboard + rail → Adafruit BME280 Vin (power)
- Breadboard GND rail → Adafruit BME280 GND (ground)
- ESP32 DevKit IO21 → Adafruit BME280 SDI (signal)
- ESP32 DevKit IO22 → Adafruit BME280 SCK (signal)

**Block:** text
**Heading:** How this matches the sketch

The firmware sets I2C_SDA to 21 and I2C_SCL to 22, then calls Wire.begin(I2C_SDA, I2C_SCL) and bme.begin(0x77). GPIO21 is the header labelled IO21. GPIO22 is the header labelled IO22. There is no other GPIO in this project. The diagram shows the STEMMA QT cable’s male pins in the breadboard and the four jumpers landing on those same rails and rows. The sensor PCB stays beside the breadboard. Blue is SDI and yellow is SCK. The + rail is 3.3 V, shown as + 3V3, not 5 V.

### Step 9 of 25 — Check the circuit before you apply power

- Stage 2: Wiring
- Sort order: 8

Look once more, then connect USB. Do not also feed the 5V or 3V3 header from a second supply.

**Tip:** Espressif’s DevKitC V4 guide says USB, the 5V pin, and the 3V3 pin are mutually exclusive power inputs.

**Block:** test
**Heading:** What to verify

Count four male-to-female jumpers and one four-wire cable. 3V3 and the red pin share the red rail, and that rail does not touch SCK, SDI, SDO, CS, or 3Vo. GND and the black pin share the blue rail. IO21 shares a row only with the blue pin. IO22 shares a row only with the yellow pin. SDO, CS, and ADDR are untouched. The USB cable is not yet plugged in, and nothing is connected to the 5V pin.

**Block:** text
**Heading:** Then apply power

Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the 5V Power On LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected.

**Block:** expected
**Heading:** Expected result

The board’s power LED is on. The sensor does not get hot. A quiet Serial Monitor is not required: the board may already contain a sketch that prints. You will replace that sketch when you upload.

### Step 10 of 25 — Install the ESP32 board package

- Stage 3: Development environment
- Sort order: 9

The Arduino IDE needs Espressif’s ESP32 package before this board appears in the Board menu.

**Tip:** Use the stable package URL. The development URL is a different, less settled package.

**Block:** text
**Heading:** What to do

Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. Restart the IDE if the new board list does not appear.

**Block:** text
**Heading:** Why this package

WiFi.h and WebServer.h come from that ESP32 package. They are not separate Library Manager installs. The generic ESP32 I2C defaults in that package are GPIO21 and GPIO22, which is why the sketch still names those pins explicitly.

**Block:** expected
**Heading:** What you should see

Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group.

### Step 11 of 25 — Select the board and the serial port

- Stage 3: Development environment
- Sort order: 10

Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.

**Tip:** If the port never appears, try another cable before you change any wiring.

**Block:** text
**Heading:** Board

Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. That is the generic ESP32 target for this DevKit. Do not choose ESP32-CAM or an S2, S3, or C3 board. Leave the other Tools menu flash settings at the ESP32 Dev Module defaults unless a later upload error tells you to change one.

**Block:** text
**Heading:** Port

Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears. Select it again after you plug the cable back in.

**Block:** troubleshooting
**Heading:** If the port is missing

**Problem:** No new port appears

The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port.

**Problem:** Several ports are listed

Unplug the DevKit, see which port vanishes, and select that one after reconnecting.

### Step 12 of 25 — Install the BME280 libraries

- Stage 3: Development environment
- Sort order: 11

Library Manager installs Adafruit BME280 Library together with its two dependencies.

**Tip:** Search for the library name Adafruit BME280 Library. Do not install a BMP280-only library in its place.

**Block:** text
**Heading:** What to install

Open Tools > Manage Libraries. Search for Adafruit BME280 Library and install it. Its library.properties file depends on Adafruit Unified Sensor and Adafruit BusIO. Accept the prompt to install those dependencies if the IDE offers it. If it does not, install both by those names from Library Manager as well.

**Block:** text
**Heading:** What you do not install

Do not install a separate Wi-Fi or web-server library. WiFi.h and WebServer.h are part of the ESP32 board package from the previous step. Do not install Adafruit BMP280 Library for this sketch. The include line is Adafruit_BME280.h, and begin() is the BME280 call.

**Block:** expected
**Heading:** Check

Library Manager shows Adafruit BME280 Library, Adafruit Unified Sensor, and Adafruit BusIO as installed.

### Step 13 of 25 — Set the Serial Monitor to 115200 baud

- Stage 3: Development environment
- Sort order: 12

The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text, not a dead board.

**Block:** text
**Heading:** What to do

Open Tools > Serial Monitor. In the baud menu at the corner of the monitor, choose 115200. Leave the line ending on Newline. You will not see the weather lines until the sketch is uploaded, but setting the speed now avoids mistaking baud noise for a failed sensor.

**Block:** expected
**Heading:** What you should observe

The monitor is open on the same port you selected for upload, and the baud value reads 115200. If you later see repeated characters that are not words, the baud setting has been changed.

### Step 14 of 25 — Create the sketch and set the Wi-Fi name

- Stage 4: Firmware
- Sort order: 13

Replace the two placeholders with your network name and password. Do not commit a real password into a shared copy.

**Tip:** The network must be 2.4 GHz. The ESP32 DevKit radio in this project does not join a 5 GHz-only network.

**Block:** text
**Heading:** What to do

Create a sketch named esp32_wifi_weather_station. Do not upload it yet. The code below is an excerpt of the finished program, not a sketch on its own. The only lines you will edit, once the complete program is pasted, are the two Wi-Fi placeholders. The SSID is your network name. Use the password for that same network. Your phone or computer must be able to join it as well.

**Block:** code

Language: Arduino
Filename: Excerpt only — not a complete sketch
Libraries: WiFi (ESP32 Arduino core), WebServer (ESP32 Arduino core), Wire (Arduino core), Adafruit Unified Sensor, Adafruit BusIO, Adafruit BME280 Library

```Arduino
const char *WIFI_SSID = "YOUR_WIFI_NAME";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

**Block:** code_explanation
**Heading:** Why these constants

WIFI_SSID and WIFI_PASSWORD are ordinary C strings. YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD are placeholders, not a working network. The rest of the sketch reads these two names, so you do not type the password anywhere else.

### Step 15 of 25 — Start I2C and the BME280

- Stage 4: Firmware
- Sort order: 14

The sketch opens GPIO21 and GPIO22, then looks for address 0x77.

**Block:** text
**Heading:** What this code does

This is another excerpt, not a second sketch. Wire.begin(21, 22) starts the hardware I2C peripheral on the same pins as the wiring table. bme.begin(0x77) asks the Adafruit library, the version that provides begin(uint8_t addr), to initialise the sensor on that address. A true result means the chip answered. A false result is stored as an error and printed. The web server still starts, so a browser that can reach the board can show that error.

**Block:** code

Language: Arduino
Filename: Excerpt only — not a complete sketch
Libraries: Wire, Adafruit BME280 Library, Adafruit Unified Sensor, Adafruit BusIO

```Arduino
Wire.begin(I2C_SDA, I2C_SCL);
  sensorReady = bme.begin(BME280_I2C_ADDRESS);
```

**Block:** code_explanation

readTemperature() returns degrees Celsius, readHumidity() returns percent, and readPressure() returns pascals as a float in the current Adafruit_BME280.h. The sketch divides pascals by 100 to show hectopascals. A NaN value becomes the invalid-reading error instead of a number on the page.

### Step 16 of 25 — Serve the page and the JSON endpoint

- Stage 4: Firmware
- Sort order: 15

The ESP32 answers / with HTML and /readings with the latest measurements.

**Tip:** The page asks /readings every two seconds. You do not refresh the browser by hand.

**Block:** text
**Heading:** What this code does

This excerpt is also part of the same program. WebServer server(80) listens on the normal web port. server.on registers two GET routes. handleRoot sends the dashboard HTML. handleReadings sends JSON fields ok, temperature_c, humidity_percent, pressure_hpa, wifi_connected, ip, and error. The HTML uses fetch("/readings") and setInterval(..., 2000). It does not load fonts or scripts from the internet.

**Block:** code

Language: Arduino
Filename: Excerpt only — not a complete sketch
Libraries: WebServer (ESP32 Arduino core)

```Arduino
server.on("/", HTTP_GET, handleRoot);
  server.on("/readings", HTTP_GET, handleReadings);
  server.begin();
```

**Block:** code_explanation

loop() calls server.handleClient() every pass so a browser that can still reach the board gets an answer. Wi-Fi retries are timed with millis() and WIFI_RETRY_MS. There is no while-loop waiting forever for a network. If the ESP32 leaves Wi-Fi, Serial prints “Connecting to Wi-Fi...” on the next retry. The page’s “Wi-Fi disconnected” text is sent only inside a successful /readings response. A browser that can no longer reach the ESP32 does not get that response. It shows “Dashboard not updating” instead.

### Step 17 of 25 — Paste the complete sketch and upload it

- Stage 4: Firmware
- Sort order: 16

This is the only program to paste and upload. The earlier code blocks were excerpts of it.

**Tip:** If the upload times out, hold the Boot button, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.

**Block:** code

Language: Arduino
Filename: esp32_wifi_weather_station.ino
Libraries: WiFi (ESP32 Arduino core), WebServer (ESP32 Arduino core), Wire (Arduino core), Adafruit Unified Sensor, Adafruit BusIO, Adafruit BME280 Library

```Arduino
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

**Block:** text
**Heading:** Upload

Select everything already in the sketch and replace it with the complete program above. Do not append it under an excerpt. Change YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD to your SSID and password. Click Upload. Wait until the IDE prints “Hard resetting via RTS pin...” or the equivalent done message. Then open the Serial Monitor at 115200 baud. Do not change IO21, IO22, or 0x77 unless you also change the wiring.

**Block:** expected
**Heading:** What you should observe

The IDE finishes the upload without a port error. The Serial Monitor then prints “ESP32 Wi-Fi weather station” and either the sensor-ready line or the not-found line.

### Step 18 of 25 — Read the Serial Monitor

- Stage 5: First run
- Sort order: 17

The first lines tell you whether the sensor answered and whether Wi-Fi has been attempted.

**Block:** text
**Heading:** What to do

Leave the USB cable on the computer. Open Tools > Serial Monitor at 115200 baud. Press the EN button once if you want a clean restart. Watch the first five seconds.

**Block:** expected
**Heading:** A healthy start

You should see “ESP32 Wi-Fi weather station”, then “BME280 ready at 0x77.”, then “Connecting to Wi-Fi...”, then “HTTP server started on port 80.” When the network accepts the board, the next line is “Wi-Fi connected. IP address:” followed by a number. After that, temperature, humidity, and pressure print about every two seconds.

**Block:** troubleshooting
**Heading:** If the text is wrong

**Problem:** The monitor shows symbols instead of words

Set the baud rate to 115200. The sketch does not use 9600.

**Problem:** Nothing is printed

Confirm the port is the DevKit port and that the upload finished. Press EN once.

### Step 19 of 25 — Find the ESP32 IP address

- Stage 5: First run
- Sort order: 18

The address is printed only after Wi-Fi connects. The dashboard uses that address.

**Tip:** Write the address down. It can change if the router hands out a new lease later.

**Block:** text
**Heading:** What to look for

Find the line “Wi-Fi connected. IP address:”. The four numbers after it, such as 192.168.1.42, are the local address. The sketch also puts that address in the JSON field ip. If the monitor keeps printing “Connecting to Wi-Fi...” every five seconds, the join has not succeeded and there is no page to open yet.

**Block:** expected
**Heading:** Expected result

One IPv4 address is printed, and it stays stable across the next sensor lines. If it is 192.168.1.42, the dashboard URL is http://192.168.1.42. Use the numbers from your own Serial Monitor.

### Step 20 of 25 — Confirm the sensor readings

- Stage 5: First run
- Sort order: 19

Temperature, humidity, and pressure should be plausible for the room before you trust the web page.

**Tip:** Breathing gently across the sensor should move humidity. Do not cover the board so tightly that it overheats.

**Block:** text
**Heading:** What to do

Read several Serial lines. Temperature is printed in C, humidity in %, and pressure in hPa. Compare the temperature with the room and the pressure with a local weather report. The report will not match to the last digit; it should be in the same neighbourhood, often near 1000 hPa at low altitude. Then breathe across the sensor and watch humidity.

**Block:** expected
**Heading:** Expected result

The three numbers keep updating. Humidity moves when you breathe on the sensor. Temperature does not jump by tens of degrees. If the monitor says “BME280 returned an invalid reading.” or the not-found message, fix the sensor before opening the dashboard.

### Step 21 of 25 — Open the web interface

- Stage 6: Dashboard
- Sort order: 20

Use the IP address from the Serial Monitor. Do not search for the board on the public internet.

**Tip:** Include http:// if the browser tries to search for the numbers instead of opening them.

**Block:** text
**Heading:** What to do

On a phone or computer that can reach the ESP32, open http:// and the IP address from the Serial Monitor, for example http://192.168.1.42. Include http:// so the browser does not search for the numbers. The ESP32 returns the dashboard for /. Leave that tab open. The page does not need an internet connection. It does need a path across your local network. A guest network, or a router setting called client isolation or AP isolation, can put two devices on the same SSID and still block this page.

**Block:** expected
**Heading:** What you should see

The title is “ESP32 Wi-Fi Weather Station”. A status line says “Connected at” and the IP address. Three cards show temperature, humidity, and pressure. The values change without a manual reload. If the sensor failed, a red error box shows the same message as the Serial Monitor and the cards show a dash.

### Step 22 of 25 — Use the page on a phone and a computer

- Stage 6: Dashboard
- Sort order: 21

Any browser on the same local network can open the station. A device on mobile data cannot.

**Tip:** If the phone is on cellular data, join the same Wi-Fi network as the ESP32 first.

**Block:** text
**Heading:** What to do

Open the same http:// address on a second device that is on the main Wi-Fi network, not on mobile data and not on a guest network. The page layout is a single column with large type so it fits a phone width. Both devices should show the same reading within one refresh. Leave the router running. Unplugging it does not make the open page display “Wi-Fi disconnected”; the browser loses /readings and shows “Dashboard not updating”.

**Block:** expected
**Heading:** Expected result

Both browsers show the dashboard. The status line includes the IP address while Wi-Fi is connected. Closing the Serial Monitor does not stop the page, because the page is served by the ESP32, not by the Arduino IDE.

### Step 23 of 25 — The ESP32 is not detected or the upload fails

- Stage 7: Troubleshooting
- Sort order: 22

Fix the cable, the port, and the boot button before you change the circuit.

**Block:** troubleshooting
**Heading:** Board and upload

**Problem:** The ESP32 never appears as a port

Use a USB-A to Micro-B data cable directly into the computer, select Tools > Port again, and confirm the power LED is on. A charge-only cable can light the LED and still provide no serial port. The DevKitC V4 guide names a USB-to-UART bridge and does not name a Windows driver in that component table. Read the chip beside the USB socket. Install the Silicon Labs CP210x VCP driver when the chip says CP2102 or CP2102N. Install a WCH CH340 driver only when the chip says CH340.

**Problem:** Upload times out or cannot connect

Confirm the board is ESP32 Dev Module and the port is the one that disappears when you unplug the cable. Hold Boot, tap EN, release Boot, and upload again. That is the DevKitC V4 firmware-download sequence.

**Problem:** The IDE cannot find WiFi.h or WebServer.h

The ESP32 board package is not selected or not installed. Install the esp32 package from the stable Espressif boards URL and choose ESP32 Dev Module.

### Step 24 of 25 — The sensor, Wi-Fi, or dashboard fails

- Stage 7: Troubleshooting
- Sort order: 23

The Serial line names the fault. Match it to the wiring or the network before rewriting the sketch.

**Tip:** Adafruit notes that intermittent I2C on the original non-STEMMA BME280 can be improved by jumpering CS to Vin. Try that only after the four main wires are correct.

**Block:** troubleshooting
**Heading:** Sensor, network, and page

**Problem:** Serial says the BME280 was not found at 0x77

Check red on the 3V3 rail, black on GND, blue on IO21, and yellow on IO22. Leave SDO open and do not solder the ADDR jumper. Either of those selects 0x76, and this sketch only calls begin(0x77). Do not edit the address to force a match unless the wiring steps change too. Confirm the board is a BME280 with a STEMMA QT socket, not a BMP280.

**Problem:** Serial says the BME280 returned an invalid reading

Power and ground are probably present because the chip answered begin(), but a later read failed. Reseat SCK and SDI, keep the wires short, and press EN to restart.

**Problem:** The monitor repeats “Connecting to Wi-Fi...”

Check the SSID and password, including capitals. The DevKit needs a 2.4 GHz network. The computer’s serial cable does not join Wi-Fi for the board; the board joins by itself.

**Problem:** The browser cannot open the IP address

Use http:// and the address from the latest “Wi-Fi connected” line, for example http://192.168.1.42. The phone or computer must be able to reach the ESP32. Mobile data cannot. A guest network or client isolation can block it even when both devices show the same Wi-Fi name. Use the main network. Internet access is not required.

**Problem:** The page stays on “Dashboard not updating”

The HTML loaded, then a later /readings request failed. That is the browser losing contact with the ESP32, not a reading that says Wi-Fi disconnected. Reload once. If Serial has stopped printing, press EN. If Serial still prints an IP address, confirm the browser is on the same local network and is not isolated from other devices.

### Step 25 of 25 — Check the finished station

- Stage 9: Final check
- Sort order: 24

Use this list before you treat the build as finished. It matches the learning objectives.

**Tip:** A ticked box means you saw that result on your own board.

**Block:** test
**Heading:** Hardware

The board is an ESP32-DevKitC V4 with male headers and a Micro-USB socket. The sensor is an Adafruit BME280 with a STEMMA QT cable, and no header was soldered. Four male-to-female jumpers land on 3V3, GND, IO21, and IO22. Red and black share the 3V3 and GND rails. Blue shares IO21. Yellow shares IO22. Only one power source is connected.

**Block:** test
**Heading:** Firmware and Serial Monitor

The uploaded file is the complete sketch, with your SSID and password in place of the placeholders. At 115200 baud, Serial prints “BME280 ready at 0x77.” and then “Wi-Fi connected. IP address:” plus an address. Temperature, humidity, and pressure follow about every two seconds. A not-found line or a repeating “Connecting to Wi-Fi...” line means that part is not finished.

**Block:** test
**Heading:** Dashboard

On the main Wi-Fi network, http:// and that address, for example http://192.168.1.42, shows “Connected at”, temperature in C, humidity in %, and pressure in hPa. The numbers move without a manual reload. The page still loads if the wider internet is down, as long as the ESP32 and the browser can reach each other. A guest or isolated network may fail this check even though both devices joined Wi-Fi.

**Block:** expected
**Heading:** What this check does not prove

Compare your Serial Monitor and browser with the lines above. If they differ, use the troubleshooting steps.

## Appendix — supporting notes

**NOT CURRENTLY SHOWN TO USERS**

These notes were removed from the main walkthrough and are kept in `constants/walkthroughs/supporting-notes.ts` for a future optional explanation. They are not step content and the app does not render them.

### What you will learn

This build identifies ESP32 pins 3V3, GND, IO21, and IO22, and Adafruit BME280 pins Vin, GND, SCK, and SDI. It installs the ESP32 board package and the Adafruit BME280 library, uploads one sketch, and reads the Serial Monitor and a browser. A BMP280 can report pressure and temperature, but it has no humidity measurement, so it cannot fill this dashboard. An ESP32-CAM, an ESP8266, or a Raspberry Pi does not share this pin map.

### How the hardware and software work together

USB power feeds the ESP32 DevKit. The board’s 3V3 pin feeds the BME280 Vin pin, and the two GND pins share a ground. IO21 is I2C data and goes to SDI. IO22 is the I2C clock and goes to SCK. The sketch asks address 0x77 for temperature, humidity, and pressure. A browser requests / and, every two seconds, the JSON document at /readings. Adafruit’s guide says the default address is 0x77 while SDO is left open. Connecting SDO to GND changes it to 0x76. This project leaves SDO, CS, and 3Vo unconnected.

### Words this guide uses

A GPIO is a header pin the sketch can name. IO21 is GPIO 21. I2C is a two-wire link: SDA, marked SDI on this sensor, carries data, and SCL, marked SCK, carries the clock. An SSID is the Wi-Fi network name. An IP address is the number the router gives the ESP32. JSON is the text format used by /readings.

### Understand each measurement

Temperature is degrees Celsius from readTemperature(). Humidity is relative humidity in percent from readHumidity(). Pressure is hectopascals, the library’s pascal reading divided by 100. The status line is the Wi-Fi state, not a forecast. The page calls /readings every 2000 ms, the same interval the sketch uses for a new sample.

### How this I2C link works

I2C uses SCL for the clock and SDA for the data. On this board those pins are IO22 and IO21. The ESP32 generates the clock and talks to the address in bme.begin. Arduino-ESP32 notes that SDA and SCL need pull-ups. Adafruit’s I2C wiring for this breakout does not add a separate resistor, and this project does not add one either. A BMP280 does not provide the humidity reading this dashboard needs.

### How the ESP32 hosts the page

After WiFi.begin succeeds, the router gives the ESP32 an address. server.begin() listens on port 80. A request for / receives the HTML, and the page then requests /readings. There is no API key, account, or external weather service. If the ESP32 drops off Wi-Fi, the open browser fails its next /readings request and shows “Dashboard not updating”. It does not receive a fresh status line from a board it can no longer reach.

## Local source comparison

The local TypeScript steps match these Supabase steps in sort order, stage, title, description, tip, and block content.
