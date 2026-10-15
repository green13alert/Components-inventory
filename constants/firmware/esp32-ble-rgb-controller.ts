/**
 * Arduino IDE sketch for the ESP32 Bluetooth RGB LED Controller.
 * BLE GATT only. The sketch does not open a Bluetooth Classic serial port.
 * Writes are UTF-8 text. A raw RGB byte triple is rejected.
 * Not run on hardware in this repository.
 */
export const ESP32_BLE_RGB_LIBRARIES = [
  'BLE (ESP32 Arduino core)',
  'LEDC (ESP32 Arduino core)',
] as const;

export const ESP32_BLE_RGB_FIRMWARE = `/*
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
`;
