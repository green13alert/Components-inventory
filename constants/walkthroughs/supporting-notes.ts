/**
 * Educational explanations taken out of the main walkthrough.
 *
 * The app does not import this file. There is no expandable-explanation control yet,
 * so this text stays here for the planned reusable explanation system and a future
 * Learn section. Do not paste it back into a walkthrough step unless the build
 * cannot be completed without it.
 */

export type SupportingNote = {
  sourceTitle: string
  body: string
}

export const SUPPORTING_NOTES: Record<'8' | '18' | '23' | '24', SupportingNote[]> = {
  '8': [
    {
      sourceTitle: 'How the Motion Sensor Works',
      body: 'PIR means passive infrared. The sensor does not emit a beam. It watches for a change in infrared energy, typically a person walking past. When that change is large enough, OUT goes HIGH. When the scene is still, OUT sits LOW. After power-up the module needs about 30 seconds to settle, and OUT can chatter during that time. A HIGH is a motion event, then it returns LOW. It is not proof that someone is still in the room. The alarm lasts as long as the sketch holds the outputs.',
    },
    {
      sourceTitle: 'Understand the Components',
      body: 'The Uno is the controller. The PIR is the input. The LED is a silent visual alarm. The 220 Ω resistor limits LED current so D8 is not shorted to ground through the diode. The catalogue buzzer is an active buzzer: a HIGH on its signal pin makes it sound. A passive piezo will not sound with digitalWrite, and this sketch does not call tone(). The breadboard and jumpers are the wiring.',
    },
  ],
  '18': [
    {
      sourceTitle: 'How Pan-Tilt Works',
      body: 'An SG90 is a geared motor plus a position sensor. write(90) means go to mid-travel and hold. The number is degrees, roughly 0 to 180. The Arduino pin only sends a control pulse. The servo draws its running current from the red VCC wire, not from that signal pin. The lower servo yaws the upper assembly. The upper servo pitches the camera plate. Mechanical stops are tighter than the 0–180 software range, which is why the sketch uses 20–160. Do not force a servo by hand while it is powered. If the bracket binds, remove power and ease the horn off.',
    },
    {
      sourceTitle: 'Understand the Components',
      body: 'The Uno is the controller. Two SG90s are the joints. The pan-tilt bracket kit is the mechanical frame and camera plate. The analog joystick is the input. Servo power comes from the GST18A05-P1J through an Adafruit 368 screw-terminal jack, not from a breadboard regulator and not through the breadboard positive rail. A camera is optional payload, and this sketch never talks to a camera module. Use position servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes.',
    },
  ],
  '23': [
    {
      sourceTitle: 'What you will learn',
      body: 'This build identifies ESP32 pins 3V3, GND, IO21, and IO22, and Adafruit BME280 pins Vin, GND, SCK, and SDI. It installs the ESP32 board package and the Adafruit BME280 library, uploads one sketch, and reads the Serial Monitor and a browser. A BMP280 can report pressure and temperature, but it has no humidity measurement, so it cannot fill this dashboard. An ESP32-CAM, an ESP8266, or a Raspberry Pi does not share this pin map.',
    },
    {
      sourceTitle: 'How the hardware and software work together',
      body: 'USB power feeds the ESP32 DevKit. The board’s 3V3 pin feeds the BME280 Vin pin, and the two GND pins share a ground. IO21 is I2C data and goes to SDI. IO22 is the I2C clock and goes to SCK. The sketch asks address 0x77 for temperature, humidity, and pressure. A browser requests / and, every two seconds, the JSON document at /readings. Adafruit’s guide says the default address is 0x77 while SDO is left open. Connecting SDO to GND changes it to 0x76. This project leaves SDO, CS, and 3Vo unconnected.',
    },
    {
      sourceTitle: 'Words this guide uses',
      body: 'A GPIO is a header pin the sketch can name. IO21 is GPIO 21. I2C is a two-wire link: SDA, marked SDI on this sensor, carries data, and SCL, marked SCK, carries the clock. An SSID is the Wi-Fi network name. An IP address is the number the router gives the ESP32. JSON is the text format used by /readings.',
    },
    {
      sourceTitle: 'Understand each measurement',
      body: 'Temperature is degrees Celsius from readTemperature(). Humidity is relative humidity in percent from readHumidity(). Pressure is hectopascals, the library’s pascal reading divided by 100. The status line is the Wi-Fi state, not a forecast. The page calls /readings every 2000 ms, the same interval the sketch uses for a new sample.',
    },
    {
      sourceTitle: 'How this I2C link works',
      body: 'I2C uses SCL for the clock and SDA for the data. On this board those pins are IO22 and IO21. The ESP32 generates the clock and talks to the address in bme.begin. Arduino-ESP32 notes that SDA and SCL need pull-ups. Adafruit’s I2C wiring for this breakout does not add a separate resistor, and this project does not add one either. A BMP280 does not provide the humidity reading this dashboard needs.',
    },
    {
      sourceTitle: 'How the ESP32 hosts the page',
      body: 'After WiFi.begin succeeds, the router gives the ESP32 an address. server.begin() listens on port 80. A request for / receives the HTML, and the page then requests /readings. There is no API key, account, or external weather service. If the ESP32 drops off Wi-Fi, the open browser fails its next /readings request and shows “Dashboard not updating”. It does not receive a fresh status line from a board it can no longer reach.',
    },
  ],
  '24': [
    {
      sourceTitle: 'Learn the breadboard before you insert a part',
      body: 'The middle of the board is split by a gap. In one half, holes a, b, c, d, and e of the same row number are connected. Holes f, g, h, i, and j of that row are a separate connection. The gap is not a wire. The long red and blue strips are the power rails. Holes in one strip connect along that strip until a break in the coloured line. The left rail is not connected to the right rail until a wire joins them. This build uses rows 1–15, above the usual mid-board break. Two leads connect when they sit in the same numbered row on the same side of the gap. A resistor body may pass over a row it must not join. Only the holes that hold its leads are connected. Do not put two transistor leads in one row, and do not put two LED leads in one row.',
    },
    {
      sourceTitle: 'The numbers',
      body: 'From a USB port near 5 V, the DevKit 5 V pin is about 4.7 V. Allow about 0.2 V across the transistor. Red at its typical 2.2 V then has about (4.7 − 2.2 − 0.2) / 220 = 10.5 mA. From a 5.0 V pin that is about 12 mA, still under the 30 mA red maximum. Blue and green at a typical 3.3 V have about 5.5 mA. A blue chip at its 4.0 V maximum has about 2.3 mA, and a green chip at 4.1 V has about 1.8 mA, so those colours can look dim. A weak USB port near 4.4 V can leave a high-forward-voltage green or blue chip dark. Each base takes about (3.3 − 0.7) / 1000 = 2.6 mA, about 8 mA for all three pins.',
    },
    {
      sourceTitle: 'What you will learn',
      body: 'Each colour needs a transistor and two resistors. A phone writes a colour over Bluetooth Low Energy. BLE is the short-range radio this project uses. It is a different system from the classic Bluetooth link a speaker uses.',
    },
  ],
}
