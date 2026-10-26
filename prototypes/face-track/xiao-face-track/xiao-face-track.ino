// Isolated prototype for a XIAO ESP32-S3 Sense face-tracking camera.
// Not a published Solderi walkthrough. Camera pins match the ESP32 Arduino
// core 3.3.12 CameraWebServer example for CAMERA_MODEL_XIAO_ESP32S3.
//
// The board serves one page, single JPEG frames, and a steering rate.
// Face detection is not done on the board. Servo power must come from a
// separate 5 V supply. This sketch only drives the signal pin.

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  10
#define SIOD_GPIO_NUM  40
#define SIOC_GPIO_NUM  39
#define Y9_GPIO_NUM    48
#define Y8_GPIO_NUM    11
#define Y7_GPIO_NUM    12
#define Y6_GPIO_NUM    14
#define Y5_GPIO_NUM    16
#define Y4_GPIO_NUM    18
#define Y3_GPIO_NUM    17
#define Y2_GPIO_NUM    15
#define VSYNC_GPIO_NUM 38
#define HREF_GPIO_NUM  47
#define PCLK_GPIO_NUM  13

const int SERVO_PIN = 4;
const int PAN_MIN = 30;
const int PAN_MAX = 150;
const char *AP_SSID = "face-track";
const char *AP_PASS = "track-camera";

WebServer server(80);
float panAngle = 90;
float panRate = 0;
unsigned long lastMs = 0;
bool cameraReady = false;

int servoDuty(float angle) {
  if (angle < 0) angle = 0;
  if (angle > 180) angle = 180;
  int pulseUs = 1000 + (int)(angle * 1000.0f / 180.0f);
  return (pulseUs * 16384) / 20000;
}

void writeServo(float angle) {
  ledcWrite(SERVO_PIN, servoDuty(angle));
}

void handleCapture() {
  if (!cameraReady) {
    server.send(503, "text/plain", "camera not ready");
    return;
  }
  camera_fb_t *frame = esp_camera_fb_get();
  if (!frame) {
    server.send(500, "text/plain", "no frame");
    return;
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send_P(200, "image/jpeg", (const char *)frame->buf, frame->len);
  esp_camera_fb_return(frame);
}

void handleSteer() {
  if (!server.hasArg("rate")) {
    server.send(400, "text/plain", "missing rate");
    return;
  }
  panRate = server.arg("rate").toFloat();
  if (panRate > 40) panRate = 40;
  if (panRate < -40) panRate = -40;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", String(panAngle, 1));
}

void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

void handleRoot() {
  server.send(200, "text/html",
    "<!DOCTYPE html><html><body><p>Face-track prototype. Poll /capture and POST /steer?rate= degrees per second. Detection runs in the browser, not on this board.</p></body></html>");
}

void setup() {
  Serial.begin(115200);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QVGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 2;

  cameraReady = esp_camera_init(&config) == ESP_OK;
  if (cameraReady) {
    sensor_t *sensor = esp_camera_sensor_get();
    if (sensor) {
      sensor->set_framesize(sensor, FRAMESIZE_QVGA);
    }
  }

  ledcAttachChannel(SERVO_PIN, 50, 14, 2);
  writeServo(panAngle);

  WiFi.softAP(AP_SSID, AP_PASS);
  server.on("/", HTTP_GET, handleRoot);
  server.on("/capture", HTTP_GET, handleCapture);
  server.on("/capture", HTTP_OPTIONS, handleOptions);
  server.on("/steer", HTTP_POST, handleSteer);
  server.on("/steer", HTTP_OPTIONS, handleOptions);
  server.begin();
  lastMs = millis();
}

void loop() {
  server.handleClient();
  unsigned long now = millis();
  float dt = (now - lastMs) / 1000.0f;
  lastMs = now;
  if (dt < 0) dt = 0;
  if (dt > 0.2f) dt = 0.2f;
  panAngle += panRate * dt;
  if (panAngle < PAN_MIN) panAngle = PAN_MIN;
  if (panAngle > PAN_MAX) panAngle = PAN_MAX;
  writeServo(panAngle);
}
