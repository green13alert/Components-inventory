-- Phase 2.3A: seed the full local COMPONENT_CATALOGUE into public.components.
-- Does not change schema. Does not touch inventory_items, scans, RLS, or UI.
-- Slugs match constants/component-catalogue.ts ids and Phase 2.2 onboarding slugs.

insert into public.components (name, category, description, slug)
values
  ('Arduino Uno R3', 'microcontrollers', 'ATmega328P development board', 'arduino-uno-r3'),
  ('Arduino Nano', 'microcontrollers', 'Compact ATmega328P board', 'arduino-nano'),
  ('Arduino Mega 2560', 'microcontrollers', 'ATmega2560 development board', 'arduino-mega'),
  ('ESP32 DevKit', 'microcontrollers', 'Wi-Fi & Bluetooth microcontroller', 'esp32'),
  ('ESP8266', 'microcontrollers', 'Wi-Fi microcontroller module', 'esp8266'),
  ('Raspberry Pi Pico', 'microcontrollers', 'RP2040 microcontroller board', 'raspberry-pi-pico'),
  ('DHT11', 'sensors', 'Temperature & Humidity Sensor', 'dht11'),
  ('DHT22', 'sensors', 'Temperature & Humidity Sensor', 'dht22'),
  ('DHT20', 'sensors', 'Temperature & Humidity Sensor', 'dht20'),
  ('DS18B20', 'sensors', 'One-wire temperature probe', 'ds18b20'),
  ('HC-SR04', 'sensors', 'Ultrasonic distance sensor', 'hc-sr04'),
  ('PIR Motion Sensor', 'sensors', 'Passive infrared motion detector', 'pir-sensor'),
  ('Soil Moisture Sensor', 'sensors', 'Capacitive / resistive soil probe', 'soil-moisture'),
  ('BMP280', 'sensors', 'Pressure & temperature sensor', 'bmp280'),
  ('MPU6050', 'sensors', '6-axis gyroscope & accelerometer', 'mpu6050'),
  ('LDR Photoresistor', 'sensors', 'Light-dependent resistor', 'ldr'),
  ('MQ-2 Gas Sensor', 'sensors', 'Combustible gas & smoke sensor', 'mq2'),
  ('SG90 Micro Servo', 'actuators', '9g hobby servo motor', 'sg90'),
  ('MG90S Servo', 'actuators', 'Metal-gear micro servo', 'mg90s'),
  ('DC Motor', 'actuators', 'Brushed DC gear motor', 'dc-motor'),
  ('28BYJ-48 Stepper', 'actuators', '5V unipolar stepper motor', 'stepper-28byj'),
  ('Piezo Buzzer', 'actuators', 'Audio indicator module', 'buzzer'),
  ('16x2 LCD Display', 'displays', '16×2 character LCD', 'lcd-16x2'),
  ('0.96" OLED', 'displays', '128×64 I2C OLED screen', 'oled-096'),
  ('MAX7219 LED Matrix', 'displays', '8×8 LED matrix module', 'max7219'),
  ('TM1637 7-Segment', 'displays', '4-digit 7-segment display', 'tm1637'),
  ('9V Battery Clip', 'power', '9V battery snap connector', '9v-battery-clip'),
  ('LM7805 Regulator', 'power', '5V linear voltage regulator', 'lm7805'),
  ('Breadboard Power Supply', 'power', '3.3V / 5V breadboard PSU', 'breadboard-psu'),
  ('HC-05 Bluetooth', 'modules', 'Bluetooth serial module', 'hc-05'),
  ('HC-06 Bluetooth', 'modules', 'Bluetooth slave module', 'hc-06'),
  ('Relay Module 5V', 'modules', 'Optocoupled 5V relay', 'relay-5v'),
  ('L298N Motor Driver', 'actuators', 'Dual H-bridge motor driver', 'l298n'),
  ('RFID-RC522', 'modules', '13.56 MHz RFID reader', 'rfid-rc522'),
  ('DS3231 RTC', 'modules', 'Precision real-time clock', 'ds3231'),
  ('LED', 'modules', 'Standard indicator LED', 'led'),
  ('Resistor', 'modules', 'Through-hole resistor', 'resistor'),
  ('Breadboard', 'modules', 'Solderless prototyping board', 'breadboard'),
  ('Jumper Wires', 'modules', 'Dupont jumper wire pack', 'jumper-wires')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description;
