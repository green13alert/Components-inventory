/**
 * Arduino IDE sketch for the ESP32 Wi-Fi Weather Station.
 * Not physically tested on hardware in this repository.
 */
export const ESP32_WIFI_WEATHER_FIRMWARE = `/*
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
  json += "\\"ok\\":";
  json += sensorError.length() == 0 ? "true" : "false";
  json += ",\\"temperature_c\\":";
  json += jsonNumber(temperatureC);
  json += ",\\"humidity_percent\\":";
  json += jsonNumber(humidityPercent);
  json += ",\\"pressure_hpa\\":";
  json += jsonNumber(pressureHpa);
  json += ",\\"wifi_connected\\":";
  json += wifiConnected ? "true" : "false";
  json += ",\\"ip\\":\\"";
  json += wifiConnected ? WiFi.localIP().toString() : "";
  json += "\\",\\"error\\":\\"";
  json += sensorError;
  json += "\\"}";
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
`;

export const ESP32_WIFI_WEATHER_LIBRARIES = [
  'WiFi (ESP32 Arduino core)',
  'WebServer (ESP32 Arduino core)',
  'Wire (Arduino core)',
  'Adafruit Unified Sensor',
  'Adafruit BusIO',
  'Adafruit BME280 Library',
] as const;
