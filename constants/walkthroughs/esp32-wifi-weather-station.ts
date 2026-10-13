// Authored source for ESP32 Wi-Fi Weather Station (slug 23).
// Live walkthrough data is public.project_steps. The project stays unpublished.
import type { ProjectComponent } from '../projects-data.ts';
import type { AuthoredWalkthroughStep, StepConnection } from '../walkthrough-content.ts';
import {
  ESP32_WIFI_WEATHER_FIRMWARE,
  ESP32_WIFI_WEATHER_LIBRARIES,
} from '../firmware/esp32-wifi-weather-station.ts';

export const ESP32_WIFI_WEATHER_PROJECT = {
  slug: '23',
  title: 'ESP32 Wi-Fi Weather Station',
  description: 'Measure temperature, humidity, and pressure, then read them on a local ESP32 web page.',
  overview:
    'Build a local weather station with an ESP32 DevKit and an Adafruit BME280. The board joins your Wi-Fi network and serves a dashboard that refreshes temperature, humidity, and pressure. No cloud account is required.',
  category: 'iot' as const,
  difficulty: 'intermediate' as const,
  durationLabel: '3 hrs',
  imageKey: 'esp32WifiWeather',
  isPublished: false,
  sortOrder: 23,
  learningObjectives: [
    'Wire an Adafruit BME280 to an ESP32 DevKit on I2C at 3.3 V',
    'Install the ESP32 Arduino board package and the Adafruit BME280 library',
    'Host a local web dashboard and JSON readings endpoint on the ESP32',
    'Use the Serial Monitor to diagnose the sensor and the Wi-Fi address',
  ],
};

export const ESP32_WIFI_WEATHER_BOM = [
  { slug: 'esp32', name: 'ESP32 DevKit', quantity: 1, role: 'microcontroller', illustrationId: 'esp32' as const },
  { slug: 'bme280', name: 'Adafruit BME280', quantity: 1, role: 'environment_sensor', illustrationId: 'bme280' as const },
  { slug: 'stemma-qt-cable', name: 'STEMMA QT to male cable', quantity: 1, role: 'sensor_cable', illustrationId: 'jumper-wires' as const },
  { slug: 'breadboard', name: 'Breadboard', quantity: 1, role: 'breadboard', illustrationId: 'breadboard' as const },
  { slug: 'jumper-male-female', name: 'Male-to-female jumper wires', quantity: 4, role: 'jumper_wires', illustrationId: 'jumper-wires' as const },
  { slug: 'usb-data-cable', name: 'USB data cable', quantity: 1, role: 'usb_cable', illustrationId: 'usb-cable' as const },
  { slug: 'usb-power-source', name: 'USB power source', quantity: 1, role: 'usb_power', illustrationId: 'generic-module' as const },
] as const;

export const ESP32_WIFI_WEATHER_CAPABILITIES = {
  bme280: [
    ['function', 'bme280'],
    ['interface', 'i2c'],
    ['interface', 'spi'],
  ],
} as const;

export const ESP32_WIFI_WEATHER_CONSTRAINTS = {
  esp32: [
    ['function', 'development_board'],
    ['logic_level_v', '3.3'],
    ['supply_v', '3.3'],
    ['programming_environment', 'arduino_ide'],
    ['board_package', 'esp32'],
  ],
  bme280: [
    ['function', 'bme280'],
    ['interface', 'i2c'],
  ],
} as const;

const COMPONENTS: ProjectComponent[] = ESP32_WIFI_WEATHER_BOM.map((item) => ({
  id: item.slug,
  name: item.name,
  illustrationId: item.illustrationId,
  owned: false,
  quantity: item.quantity,
}));

export const ESP32_WIFI_WEATHER_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'ESP32 DevKit', fromPin: '3V3', toComponent: 'Breadboard', toPin: '+ rail', signal: 'power' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'GND', toComponent: 'Breadboard', toPin: 'GND rail', signal: 'ground' },
  { fromComponent: 'Breadboard', fromPin: '+ rail', toComponent: 'Adafruit BME280', toPin: 'Vin', signal: 'power' },
  { fromComponent: 'Breadboard', fromPin: 'GND rail', toComponent: 'Adafruit BME280', toPin: 'GND', signal: 'ground' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'IO21', toComponent: 'Adafruit BME280', toPin: 'SDI', signal: 'signal' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'IO22', toComponent: 'Adafruit BME280', toPin: 'SCK', signal: 'signal' },
];

const POWER_CONNECTIONS = ESP32_WIFI_WEATHER_CONNECTIONS.slice(0, 4);
const SIGNAL_CONNECTIONS = ESP32_WIFI_WEATHER_CONNECTIONS.slice(4);

function excerpt(start: string, end: string): string {
  const from = ESP32_WIFI_WEATHER_FIRMWARE.indexOf(start);
  const to = ESP32_WIFI_WEATHER_FIRMWARE.indexOf(end, from);
  if (from < 0 || to < 0) {
    throw new Error(`Firmware excerpt not found: ${start}`);
  }
  return ESP32_WIFI_WEATHER_FIRMWARE.slice(from, to + end.length);
}

const WIFI_EXCERPT = excerpt('const char *WIFI_SSID', 'const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";');
const SENSOR_EXCERPT = excerpt('Wire.begin(I2C_SDA, I2C_SCL);', 'bme.begin(BME280_I2C_ADDRESS);');
const SERVER_EXCERPT = excerpt('server.on("/", HTTP_GET, handleRoot);', 'server.begin();');

const STAGE_INTRO = 'Introduction';
const STAGE_HARDWARE = 'Hardware preparation';
const STAGE_WIRING = 'Wiring';
const STAGE_ENVIRONMENT = 'Development environment';
const STAGE_FIRMWARE = 'Firmware';
const STAGE_FIRST_RUN = 'First run';
const STAGE_DASHBOARD = 'Dashboard';
const STAGE_TROUBLESHOOTING = 'Troubleshooting';
const STAGE_EXTEND = 'Understanding and extending the project';
const STAGE_CHECK = 'Final check';

export const ESP32_WIFI_WEATHER_STEPS: AuthoredWalkthroughStep[] = [
  {
    sortOrder: 0,
    stageSortOrder: 0,
    stageTitle: STAGE_INTRO,
    title: 'What the finished station does',
    description: 'The ESP32 reads a BME280 and serves the readings on your own Wi-Fi network.',
    tip: null,
    blocks: [
      {
        type: 'image',
        imageKey: 'esp32WifiWeather',
        caption: 'The finished station is an ESP32-DevKitC V4 and an Adafruit BME280 beside a breadboard, powered from USB. The wiring diagram is the connection reference.',
      },
      {
        type: 'text',
        heading: 'What you are building',
        body: 'The finished station measures temperature in degrees Celsius, relative humidity in percent, and barometric pressure in hectopascals. The ESP32 DevKit joins a Wi-Fi network you choose and hosts a small web page. A phone or computer on that same network opens the page and sees the numbers update about every two seconds. Nothing is sent to a cloud service.',
      },
      {
        type: 'text',
        heading: 'Words this guide uses',
        body: 'A GPIO is a header pin the sketch can name. IO21 is GPIO 21. I2C is a two-wire link: SDA, marked SDI on this sensor, carries data, and SCL, marked SCK, carries the clock. An SSID is the Wi-Fi network name. An IP address is the number the router gives the ESP32, such as 192.168.1.42, so the example dashboard URL is http://192.168.1.42. JSON is the text format used by /readings. It is a list of named fields, not a web page.',
      },
      {
        type: 'expected',
        heading: 'What done looks like',
        body: 'The Serial Monitor prints an IP address such as 192.168.1.42, then repeating temperature, humidity, and pressure lines. A browser on the same local network opens http://192.168.1.42, using the address your board actually printed, and shows the same three readings. These are the results the sketch is written to produce. This repository has not confirmed them on a physical board.',
      },
    ],
  },
  {
    sortOrder: 1,
    stageSortOrder: 0,
    stageTitle: STAGE_INTRO,
    title: 'What you will learn',
    description: 'This build is about one sensor bus, one Wi-Fi connection, and one local web page.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Skills in this project',
        body: 'You will identify the ESP32 pins 3V3, GND, IO21, and IO22, and the Adafruit BME280 pins Vin, GND, SCK, and SDI. You will install the ESP32 board package and the Adafruit BME280 library, upload a complete sketch, and read both the Serial Monitor and a browser. You will also see how a failed sensor or a failed Wi-Fi join is reported instead of being hidden.',
      },
      {
        type: 'text',
        heading: 'What this project does not teach',
        body: 'It does not use a BMP280. A BMP280 can report pressure and temperature, but it has no humidity measurement, and this dashboard needs humidity. It also does not use the ESP32-CAM, an ESP8266, or a Raspberry Pi. Those boards do not share this pin map.',
      },
    ],
  },
  {
    sortOrder: 2,
    stageSortOrder: 0,
    stageTitle: STAGE_INTRO,
    title: 'How the hardware and software work together',
    description: 'Four wires carry power and I2C. The sketch turns those readings into a web page.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'The path of a reading',
        body: 'USB power feeds the ESP32 DevKit. The board’s 3V3 pin feeds the BME280 Vin pin, and the two GND pins share a ground. IO21 is the I2C data line and goes to SDI. IO22 is the I2C clock and goes to SCK. The sketch asks the sensor at address 0x77 for temperature, humidity, and pressure, then stores the latest values. A browser requests the page at / and, every two seconds, the JSON document at /readings.',
      },
      {
        type: 'text',
        heading: 'Why the address is 0x77',
        body: 'Adafruit’s BME280 guide says the default I2C address is 0x77 while SDO is left open. Connecting SDO to GND changes the address to 0x76. This project leaves SDO, CS, and 3Vo unconnected, so the sketch calls begin(0x77).',
      },
    ],
  },
  {
    sortOrder: 3,
    stageSortOrder: 0,
    stageTitle: STAGE_INTRO,
    title: 'What a successful build should do',
    description: 'Success is a local page with live units, plus a clear error when the sensor or Wi-Fi is missing.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Check these behaviours',
        body: 'After upload, the Serial Monitor at 115200 baud prints either “BME280 ready at 0x77.” or a not-found message. When the ESP32 joins Wi-Fi, Serial prints “Wi-Fi connected. IP address:” and the address. A browser that can open that address shows “Connected at” and the same address, with temperature in C, humidity in %, and pressure in hPa. If the sensor is missing and the page still loads, the page shows the error text and the cards show a dash. If the browser cannot reach the ESP32, the request fails: a page that was already open changes to “Dashboard not updating” and says it could not read /readings. The words “Wi-Fi disconnected” appear only after a successful /readings response whose wifi_connected field is false. A browser that has lost the ESP32 does not receive that update. No internet connection is required when the phone and the ESP32 can still reach each other on the local network.',
      },
      {
        type: 'warning',
        body: 'This repository has not run the sketch on a physical ESP32. Treat the Serial and browser results below as the behaviour the code is written to produce, and compare them with what your board actually prints.',
      },
    ],
  },
  {
    sortOrder: 4,
    stageSortOrder: 1,
    stageTitle: STAGE_HARDWARE,
    title: 'Identify every required component',
    description: 'Every physical item in this build is on the BOM. None of these parts is optional.',
    tip: 'A phone or computer is how you view the page. It is not a wired component, so it is not a BOM line.',
    blocks: [
      {
        type: 'components',
        heading: 'Required parts',
        items: COMPONENTS,
      },
      {
        type: 'text',
        heading: 'What each part is for',
        body: 'The ESP32 DevKit is the controller and the web server. This build uses an Espressif ESP32-DevKitC V4 with male pin headers. The Adafruit BME280 is the only sensor. Its STEMMA QT socket takes the cable, so you do not solder the breakout. The breadboard joins the cable pins to four male-to-female jumpers. The USB data cable is USB-A to Micro-B and must carry data. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'You can point to one ESP32-DevKitC V4 with male headers, one Adafruit BME280 with a STEMMA QT socket, one STEMMA QT to male cable, one breadboard, four male-to-female jumpers, one USB-A to Micro-B data cable, and a USB port or charger. A BMP280 board is not a substitute on this bench.',
      },
    ],
  },
  {
    sortOrder: 5,
    stageSortOrder: 1,
    stageTitle: STAGE_HARDWARE,
    title: 'Confirm the ESP32 DevKit labels',
    description: 'Use an Espressif ESP32-DevKitC V4 with male headers. A generic DevKit is not assumed to match it.',
    tip: 'Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket, a Boot button, an EN button, and either male or female headers.',
    blocks: [
      {
        type: 'text',
        heading: 'What to look for',
        body: 'Solderi’s ESP32 DevKit row is only a 3.3 V board programmed with the Arduino-ESP32 package. It does not record one outline or one connector. This project’s mechanical steps are for the Espressif ESP32-DevKitC V4 with male pin headers. Its user guide puts 3V3 on header J2 and IO22 plus IO21 on header J3, so the wires use both sides of the board. Arduino-ESP32’s generic ESP32 default I2C pins are GPIO21 for SDA and GPIO22 for SCL. The male pins are already fitted. Do not solder the DevKit.',
      },
      {
        type: 'text',
        heading: 'USB socket and fit',
        body: 'The DevKitC V4 user guide names a Micro-USB port as the default power supply and says the board can be mounted on a breadboard or wired with jumpers. It also sells male-header and female-header versions, and this repository has not measured the distance between the two pin rows. Do not force the board across a breadboard’s centre gap. Place it beside the breadboard and use male-to-female jumpers: the female socket goes on a male header pin, and the male pin goes into the breadboard. Use a USB-A to Micro-B cable that carries data. A charge-only cable can light the board and still never appear as a serial port. A USB-C cable does not fit this socket.',
      },
      {
        type: 'warning',
        body: 'If the silkscreen does not show 3V3, GND, IO21 or GPIO21, and IO22 or GPIO22, stop. If the headers are female sockets, stop: this BOM’s jumpers will not match them. Do not move the wires onto an ESP32-CAM or another module. Espressif warns that DevKitC V4 power must come from only one of USB, the 5V pin, or the 3V3 pin.',
      },
    ],
  },
  {
    sortOrder: 6,
    stageSortOrder: 1,
    stageTitle: STAGE_HARDWARE,
    title: 'Confirm the BME280 pin labels',
    description: 'Use the current Adafruit STEMMA QT breakout. Do not solder its header.',
    tip: 'Leave 3Vo, SDO, CS, and the ADDR jumper empty for this project.',
    blocks: [
      {
        type: 'text',
        heading: 'Pins this project uses',
        body: 'Adafruit’s BME280 pinout names Vin, 3Vo, GND, SCK, SDO, SDI, and CS. Vin is the power input and accepts 3–5 V. This project feeds Vin from the ESP32 3V3 pin. Adafruit says the logic level follows Vin, and the ESP32 DevKit’s GPIO is 3.3 V, so Vin must not be tied to 5 V. 3Vo is a 3.3 V output from the breakout’s regulator. Leave it unconnected. GND is the common ground.',
      },
      {
        type: 'text',
        heading: 'I2C pins and address',
        body: 'SCK is the I2C clock and connects to IO22. SDI is the I2C data and connects to IO21. Adafruit’s I2C wiring uses those two signal pins plus Vin and GND, and says to leave the other pins disconnected. The default address is 0x77. A jumper from SDO to GND, or soldering the ADDR jumper on the back, changes the address to 0x76, which this sketch does not scan. Adafruit’s I2C page does not add a separate pull-up resistor, so this project does not put one on the BOM. This repository has not measured the resistor value on the PCB.',
      },
      {
        type: 'text',
        heading: 'How you connect it without soldering',
        body: 'Adafruit’s current product 2652 is the STEMMA QT board. The BME280 chip is already soldered to that PCB. The loose 0.1 inch header is not soldered, and Adafruit’s assembly page tells you to solder it only if you want the holes in a breadboard. This project does not do that. Plug a STEMMA QT to male cable, such as Adafruit 4209, into either STEMMA QT socket. Adafruit’s cable colours are black for GND, red for VIN, blue for SDA, and yellow for SCL. Blue is SDI. Yellow is SCK. An older breakout with no STEMMA QT socket is not this build.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'The board says BME280, has a STEMMA QT socket, and the cable is latched in. If the silk says BMP280, or there is no STEMMA QT socket, this wiring does not apply.',
      },
    ],
  },
  {
    sortOrder: 7,
    stageSortOrder: 1,
    stageTitle: STAGE_HARDWARE,
    title: 'Seat the board and the sensor',
    description: 'Leave both boards off the breadboard holes. USB stays unplugged.',
    tip: 'A full-size breadboard often splits each coloured rail in the middle. Use one continuous half, or bridge that gap.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Set the DevKitC V4 beside the breadboard. Do not press its two header rows into the breadboard. Insert the cable’s red pin into the red rail and the black pin into the blue rail, on the same unbroken stretch of each rail. Insert the blue pin and the yellow pin into two separate breadboard rows that are not the power rails. Lay the sensor PCB beside the breadboard, not pushed into the holes. Leave the USB cable unplugged until the wiring check later in this guide.',
      },
      {
        type: 'expected',
        heading: 'What you should see',
        body: 'The DevKit is beside the breadboard, the sensor is beside it, and four male cable pins are in the breadboard: red in the red rail, black in the blue rail, blue and yellow in their own rows. You can still read 3V3, GND, IO21, and IO22 on the DevKit.',
      },
    ],
  },
  {
    sortOrder: 8,
    stageSortOrder: 2,
    stageTitle: STAGE_WIRING,
    title: 'Connect power and ground',
    description: '3V3 and GND go to the breadboard rails, then from those rails to Vin and GND.',
    tip: 'Use the breadboard’s red rail for 3V3 and the blue rail for ground. This project’s positive rail is 3.3 V, not 5 V.',
    blocks: [
      {
        type: 'text',
        heading: 'Connection sequence',
        body: 'Put the female socket of one jumper on the DevKit 3V3 pin and its male pin in the same red rail as the cable’s red VIN pin. Put a second jumper’s socket on a DevKit GND pin and its male pin in the same blue rail as the cable’s black GND pin. The red and black cable pins are already the Vin and GND connections, so you do not add another wire to the sensor. Do not connect ESP32 5V. Do not connect BME280 3Vo. Do not connect the blue or yellow pins yet. If the coloured line on a rail has a break, both pins on that rail must be on the same side of the break.',
      },
      {
        type: 'wiring',
        heading: 'Power and ground',
        connections: POWER_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: '3V3 to Vin · GND to GND',
        rows: POWER_CONNECTIONS,
      },
      {
        type: 'warning',
        body: 'Adafruit says BME280 logic follows the voltage on Vin. Five volts on Vin would present 5 V logic to IO21 and IO22. The ESP32 DevKit is a 3.3 V board. Keep Vin on 3V3.',
      },
    ],
  },
  {
    sortOrder: 9,
    stageSortOrder: 2,
    stageTitle: STAGE_WIRING,
    title: 'Connect SDA and SCL',
    description: 'IO21 goes to SDI. IO22 goes to SCK. Those are the only signal wires.',
    tip: 'SDA is data. SCL is clock. On this breakout the silk says SDI and SCK, not SDA and SCL.',
    blocks: [
      {
        type: 'text',
        heading: 'Connection sequence',
        body: 'Put a jumper socket on IO21 and its male pin in the same breadboard row as the cable’s blue SDA pin. That blue wire is SDI. Put a jumper socket on IO22 and its male pin in the same row as the cable’s yellow SCL pin. That yellow wire is SCK. Leave SDO open so the address stays 0x77. Leave CS open and leave the ADDR jumper unsoldered. Adafruit’s I2C instructions do not add a separate pull-up resistor for this breakout.',
      },
      {
        type: 'wiring',
        heading: 'I2C signals',
        connections: SIGNAL_CONNECTIONS,
      },
      {
        type: 'connections',
        summary: 'IO21 to SDI · IO22 to SCK',
        rows: SIGNAL_CONNECTIONS,
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'IO21 shares a row only with the blue pin, and IO22 shares a row only with the yellow pin. Neither signal row touches the red rail or the blue rail.',
      },
    ],
  },
  {
    sortOrder: 10,
    stageSortOrder: 2,
    stageTitle: STAGE_WIRING,
    title: 'Read the complete wiring table',
    description: 'These six connections are the whole circuit. The sketch uses the same GPIO numbers.',
    tip: null,
    blocks: [
      {
        type: 'wiring',
        heading: 'Complete wiring diagram',
        connections: ESP32_WIFI_WEATHER_CONNECTIONS,
      },
      {
        type: 'connections',
        heading: 'Every electrical connection',
        summary: 'IO21 SDA · IO22 SCL · 3V3 Vin · common GND · address 0x77',
        rows: ESP32_WIFI_WEATHER_CONNECTIONS,
      },
      {
        type: 'text',
        heading: 'How this matches the sketch',
        body: 'The firmware sets I2C_SDA to 21 and I2C_SCL to 22, then calls Wire.begin(I2C_SDA, I2C_SCL) and bme.begin(0x77). GPIO21 is the header labelled IO21. GPIO22 is the header labelled IO22. There is no other GPIO in this project. The diagram shows the STEMMA QT cable’s male pins in the breadboard and the four jumpers landing on those same rails and rows. The sensor PCB stays beside the breadboard. Blue is SDI and yellow is SCK. The + rail is 3.3 V, shown as + 3V3, not 5 V.',
      },
    ],
  },
  {
    sortOrder: 11,
    stageSortOrder: 2,
    stageTitle: STAGE_WIRING,
    title: 'Check the circuit before you apply power',
    description: 'Look once more, then connect USB. Do not also feed the 5V or 3V3 header from a second supply.',
    tip: 'Espressif’s DevKitC V4 guide says USB, the 5V pin, and the 3V3 pin are mutually exclusive power inputs.',
    blocks: [
      {
        type: 'test',
        heading: 'What to verify',
        body: 'Count four male-to-female jumpers and one four-wire cable. 3V3 and the red pin share the red rail, and that rail does not touch SCK, SDI, SDO, CS, or 3Vo. GND and the black pin share the blue rail. IO21 shares a row only with the blue pin. IO22 shares a row only with the yellow pin. SDO, CS, and ADDR are untouched. The USB cable is not yet plugged in, and nothing is connected to the 5V pin.',
      },
      {
        type: 'text',
        heading: 'Then apply power',
        body: 'Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the 5V Power On LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The board’s power LED is on. The sensor does not get hot. A quiet Serial Monitor is not required: the board may already contain a sketch that prints. You will replace that sketch when you upload.',
      },
    ],
  },
  {
    sortOrder: 12,
    stageSortOrder: 3,
    stageTitle: STAGE_ENVIRONMENT,
    title: 'Install the ESP32 board package',
    description: 'The Arduino IDE needs Espressif’s ESP32 package before this board appears in the Board menu.',
    tip: 'Use the stable package URL. The development URL is a different, less settled package.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. Restart the IDE if the new board list does not appear.',
      },
      {
        type: 'text',
        heading: 'Why this package',
        body: 'WiFi.h and WebServer.h come from that ESP32 package. They are not separate Library Manager installs. The generic ESP32 I2C defaults in that package are GPIO21 and GPIO22, which is why the sketch still names those pins explicitly.',
      },
      {
        type: 'expected',
        heading: 'What you should see',
        body: 'Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group.',
      },
    ],
  },
  {
    sortOrder: 13,
    stageSortOrder: 3,
    stageTitle: STAGE_ENVIRONMENT,
    title: 'Select the board and the serial port',
    description: 'Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.',
    tip: 'If the port never appears, try another cable before you change any wiring.',
    blocks: [
      {
        type: 'text',
        heading: 'Board',
        body: 'Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. That is the generic ESP32 target for this DevKit. Do not choose ESP32-CAM or an S2, S3, or C3 board. Leave the other Tools menu flash settings at the ESP32 Dev Module defaults unless a later upload error tells you to change one.',
      },
      {
        type: 'text',
        heading: 'Port',
        body: 'Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears. Select it again after you plug the cable back in.',
      },
      {
        type: 'troubleshooting',
        heading: 'If the port is missing',
        items: [
          {
            problem: 'No new port appears',
            solution: 'The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port.',
          },
          {
            problem: 'Several ports are listed',
            solution: 'Unplug the DevKit, see which port vanishes, and select that one after reconnecting.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 14,
    stageSortOrder: 3,
    stageTitle: STAGE_ENVIRONMENT,
    title: 'Install the BME280 libraries',
    description: 'Library Manager installs Adafruit BME280 Library together with its two dependencies.',
    tip: 'Search for the library name Adafruit BME280 Library. Do not install a BMP280-only library in its place.',
    blocks: [
      {
        type: 'text',
        heading: 'What to install',
        body: 'Open Tools > Manage Libraries. Search for Adafruit BME280 Library and install it. Its library.properties file depends on Adafruit Unified Sensor and Adafruit BusIO. Accept the prompt to install those dependencies if the IDE offers it. If it does not, install both by those names from Library Manager as well.',
      },
      {
        type: 'text',
        heading: 'What you do not install',
        body: 'Do not install a separate Wi-Fi or web-server library. WiFi.h and WebServer.h are part of the ESP32 board package from the previous step. Do not install Adafruit BMP280 Library for this sketch. The include line is Adafruit_BME280.h, and begin() is the BME280 call.',
      },
      {
        type: 'expected',
        heading: 'Check',
        body: 'Library Manager shows Adafruit BME280 Library, Adafruit Unified Sensor, and Adafruit BusIO as installed.',
      },
    ],
  },
  {
    sortOrder: 15,
    stageSortOrder: 3,
    stageTitle: STAGE_ENVIRONMENT,
    title: 'Set the Serial Monitor to 115200 baud',
    description: 'The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text, not a dead board.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Open Tools > Serial Monitor. In the baud menu at the corner of the monitor, choose 115200. Leave the line ending on Newline. You will not see the weather lines until the sketch is uploaded, but setting the speed now avoids mistaking baud noise for a failed sensor.',
      },
      {
        type: 'expected',
        heading: 'What you should observe',
        body: 'The monitor is open on the same port you selected for upload, and the baud value reads 115200. If you later see repeated characters that are not words, the baud setting has been changed.',
      },
    ],
  },
  {
    sortOrder: 16,
    stageSortOrder: 4,
    stageTitle: STAGE_FIRMWARE,
    title: 'Create the sketch and set the Wi-Fi name',
    description: 'Replace the two placeholders with your network name and password. Do not commit a real password into a shared copy.',
    tip: 'The network must be 2.4 GHz. The ESP32 DevKit radio in this project does not join a 5 GHz-only network.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Create a sketch named esp32_wifi_weather_station. Do not upload it yet. The code below is an excerpt of the finished program, not a sketch on its own. The only lines you will edit, once the complete program is pasted, are the two Wi-Fi placeholders. The SSID is your network name. Use the password for that same network. Your phone or computer must be able to join it as well.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'Excerpt only — not a complete sketch',
        libraries: [...ESP32_WIFI_WEATHER_LIBRARIES],
        code: WIFI_EXCERPT,
      },
      {
        type: 'code_explanation',
        heading: 'Why these constants',
        body: 'WIFI_SSID and WIFI_PASSWORD are ordinary C strings. YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD are placeholders, not a working network. The rest of the sketch reads these two names, so you do not type the password anywhere else.',
      },
    ],
  },
  {
    sortOrder: 17,
    stageSortOrder: 4,
    stageTitle: STAGE_FIRMWARE,
    title: 'Start I2C and the BME280',
    description: 'The sketch opens GPIO21 and GPIO22, then looks for address 0x77.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What this code does',
        body: 'This is another excerpt, not a second sketch. Wire.begin(21, 22) starts the hardware I2C peripheral on the same pins as the wiring table. bme.begin(0x77) asks the Adafruit library, the version that provides begin(uint8_t addr), to initialise the sensor on that address. A true result means the chip answered. A false result is stored as an error and printed. The web server still starts, so a browser that can reach the board can show that error.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'Excerpt only — not a complete sketch',
        libraries: ['Wire', 'Adafruit BME280 Library', 'Adafruit Unified Sensor', 'Adafruit BusIO'],
        code: SENSOR_EXCERPT,
      },
      {
        type: 'code_explanation',
        body: 'readTemperature() returns degrees Celsius, readHumidity() returns percent, and readPressure() returns pascals as a float in the current Adafruit_BME280.h. The sketch divides pascals by 100 to show hectopascals. A NaN value becomes the invalid-reading error instead of a number on the page.',
      },
    ],
  },
  {
    sortOrder: 18,
    stageSortOrder: 4,
    stageTitle: STAGE_FIRMWARE,
    title: 'Serve the page and the JSON endpoint',
    description: 'The ESP32 answers / with HTML and /readings with the latest measurements.',
    tip: 'The page asks /readings every two seconds. You do not refresh the browser by hand.',
    blocks: [
      {
        type: 'text',
        heading: 'What this code does',
        body: 'This excerpt is also part of the same program. WebServer server(80) listens on the normal web port. server.on registers two GET routes. handleRoot sends the dashboard HTML. handleReadings sends JSON fields ok, temperature_c, humidity_percent, pressure_hpa, wifi_connected, ip, and error. The HTML uses fetch("/readings") and setInterval(..., 2000). It does not load fonts or scripts from the internet.',
      },
      {
        type: 'code',
        language: 'Arduino',
        filename: 'Excerpt only — not a complete sketch',
        libraries: ['WebServer (ESP32 Arduino core)'],
        code: SERVER_EXCERPT,
      },
      {
        type: 'code_explanation',
        body: 'loop() calls server.handleClient() every pass so a browser that can still reach the board gets an answer. Wi-Fi retries are timed with millis() and WIFI_RETRY_MS. There is no while-loop waiting forever for a network. If the ESP32 leaves Wi-Fi, Serial prints “Connecting to Wi-Fi...” on the next retry. The page’s “Wi-Fi disconnected” text is sent only inside a successful /readings response. A browser that can no longer reach the ESP32 does not get that response. It shows “Dashboard not updating” instead.',
      },
    ],
  },
  {
    sortOrder: 19,
    stageSortOrder: 4,
    stageTitle: STAGE_FIRMWARE,
    title: 'Paste the complete sketch and upload it',
    description: 'This is the only program to paste and upload. The earlier code blocks were excerpts of it.',
    tip: 'If the upload times out, hold the Boot button, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.',
    blocks: [
      {
        type: 'code',
        language: 'Arduino',
        filename: 'esp32_wifi_weather_station.ino',
        libraries: [...ESP32_WIFI_WEATHER_LIBRARIES],
        code: ESP32_WIFI_WEATHER_FIRMWARE,
      },
      {
        type: 'text',
        heading: 'Upload',
        body: 'Select everything already in the sketch and replace it with the complete program above. Do not append it under an excerpt. Change YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD to your SSID and password. Click Upload. Wait until the IDE prints “Hard resetting via RTS pin...” or the equivalent done message. Then open the Serial Monitor at 115200 baud. Do not change IO21, IO22, or 0x77 unless you also change the wiring.',
      },
      {
        type: 'expected',
        heading: 'What you should observe',
        body: 'The IDE finishes the upload without a port error. The Serial Monitor then prints “ESP32 Wi-Fi weather station” and either the sensor-ready line or the not-found line.',
      },
    ],
  },
  {
    sortOrder: 20,
    stageSortOrder: 5,
    stageTitle: STAGE_FIRST_RUN,
    title: 'Read the Serial Monitor',
    description: 'The first lines tell you whether the sensor answered and whether Wi-Fi has been attempted.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Leave the USB cable on the computer. Open Tools > Serial Monitor at 115200 baud. Press the EN button once if you want a clean restart. Watch the first five seconds.',
      },
      {
        type: 'expected',
        heading: 'A healthy start',
        body: 'You should see “ESP32 Wi-Fi weather station”, then “BME280 ready at 0x77.”, then “Connecting to Wi-Fi...”, then “HTTP server started on port 80.” When the network accepts the board, the next line is “Wi-Fi connected. IP address:” followed by a number. After that, temperature, humidity, and pressure print about every two seconds.',
      },
      {
        type: 'troubleshooting',
        heading: 'If the text is wrong',
        items: [
          {
            problem: 'The monitor shows symbols instead of words',
            solution: 'Set the baud rate to 115200. The sketch does not use 9600.',
          },
          {
            problem: 'Nothing is printed',
            solution: 'Confirm the port is the DevKit port and that the upload finished. Press EN once.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 21,
    stageSortOrder: 5,
    stageTitle: STAGE_FIRST_RUN,
    title: 'Find the ESP32 IP address',
    description: 'The address is printed only after Wi-Fi connects. The dashboard uses that address.',
    tip: 'Write the address down. It can change if the router hands out a new lease later.',
    blocks: [
      {
        type: 'text',
        heading: 'What to look for',
        body: 'Find the line “Wi-Fi connected. IP address:”. The four numbers after it, such as 192.168.1.42, are the local address. The sketch also puts that address in the JSON field ip. If the monitor keeps printing “Connecting to Wi-Fi...” every five seconds, the join has not succeeded and there is no page to open yet.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'One IPv4 address is printed, and it stays stable across the next sensor lines. If it is 192.168.1.42, the dashboard URL is http://192.168.1.42. Use the numbers from your own Serial Monitor.',
      },
    ],
  },
  {
    sortOrder: 22,
    stageSortOrder: 5,
    stageTitle: STAGE_FIRST_RUN,
    title: 'Confirm the sensor readings',
    description: 'Temperature, humidity, and pressure should be plausible for the room before you trust the web page.',
    tip: 'Breathing gently across the sensor should move humidity. Do not cover the board so tightly that it overheats.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Read several Serial lines. Temperature is printed in C, humidity in %, and pressure in hPa. Compare the temperature with the room and the pressure with a local weather report. The report will not match to the last digit; it should be in the same neighbourhood, often near 1000 hPa at low altitude. Then breathe across the sensor and watch humidity.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'The three numbers keep updating. Humidity moves when you breathe on the sensor. Temperature does not jump by tens of degrees. If the monitor says “BME280 returned an invalid reading.” or the not-found message, fix the sensor before opening the dashboard.',
      },
    ],
  },
  {
    sortOrder: 23,
    stageSortOrder: 6,
    stageTitle: STAGE_DASHBOARD,
    title: 'Open the web interface',
    description: 'Use the IP address from the Serial Monitor. Do not search for the board on the public internet.',
    tip: 'Include http:// if the browser tries to search for the numbers instead of opening them.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'On a phone or computer that can reach the ESP32, open http:// and the IP address from the Serial Monitor, for example http://192.168.1.42. Include http:// so the browser does not search for the numbers. The ESP32 returns the dashboard for /. Leave that tab open. The page does not need an internet connection. It does need a path across your local network. A guest network, or a router setting called client isolation or AP isolation, can put two devices on the same SSID and still block this page.',
      },
      {
        type: 'expected',
        heading: 'What you should see',
        body: 'The title is “ESP32 Wi-Fi Weather Station”. A status line says “Connected at” and the IP address. Three cards show temperature, humidity, and pressure. The values change without a manual reload. If the sensor failed, a red error box shows the same message as the Serial Monitor and the cards show a dash.',
      },
    ],
  },
  {
    sortOrder: 24,
    stageSortOrder: 6,
    stageTitle: STAGE_DASHBOARD,
    title: 'Understand each measurement',
    description: 'The page uses the same units as the Serial Monitor.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'The three cards',
        body: 'Temperature is degrees Celsius from readTemperature(). Humidity is relative humidity in percent from readHumidity(). Pressure is hectopascals, which is the library’s pascal reading divided by 100. The status line is the Wi-Fi state, not a weather forecast. There is no outdoor temperature, rainfall, or wind in this project.',
      },
      {
        type: 'text',
        heading: 'Automatic updates',
        body: 'The page calls /readings every 2000 ms, which is the same SENSOR_INTERVAL_MS the sketch uses to take a new sample. You should see the numbers change, or the error box appear, without pressing reload. You can also open http://192.168.1.42/readings, with your own address, to see the JSON document. The status line says “Connected at” and the IP when that JSON has wifi_connected set to true.',
      },
    ],
  },
  {
    sortOrder: 25,
    stageSortOrder: 6,
    stageTitle: STAGE_DASHBOARD,
    title: 'Use the page on a phone and a computer',
    description: 'Any browser on the same local network can open the station. A device on mobile data cannot.',
    tip: 'If the phone is on cellular data, join the same Wi-Fi network as the ESP32 first.',
    blocks: [
      {
        type: 'text',
        heading: 'What to do',
        body: 'Open the same http:// address on a second device that is on the main Wi-Fi network, not on mobile data and not on a guest network. The page layout is a single column with large type so it fits a phone width. Both devices should show the same reading within one refresh. Leave the router running. Unplugging it does not make the open page display “Wi-Fi disconnected”; the browser loses /readings and shows “Dashboard not updating”.',
      },
      {
        type: 'expected',
        heading: 'Expected result',
        body: 'Both browsers show the dashboard. The status line includes the IP address while Wi-Fi is connected. Closing the Serial Monitor does not stop the page, because the page is served by the ESP32, not by the Arduino IDE.',
      },
    ],
  },
  {
    sortOrder: 26,
    stageSortOrder: 7,
    stageTitle: STAGE_TROUBLESHOOTING,
    title: 'The ESP32 is not detected or the upload fails',
    description: 'Fix the cable, the port, and the boot button before you change the circuit.',
    tip: null,
    blocks: [
      {
        type: 'troubleshooting',
        heading: 'Board and upload',
        items: [
          {
            problem: 'The ESP32 never appears as a port',
            solution: 'Use a USB-A to Micro-B data cable directly into the computer, select Tools > Port again, and confirm the power LED is on. A charge-only cable can light the LED and still provide no serial port. The DevKitC V4 guide names a USB-to-UART bridge and does not name a Windows driver in that component table. Read the chip beside the USB socket. Install the Silicon Labs CP210x VCP driver when the chip says CP2102 or CP2102N. Install a WCH CH340 driver only when the chip says CH340.',
          },
          {
            problem: 'Upload times out or cannot connect',
            solution: 'Confirm the board is ESP32 Dev Module and the port is the one that disappears when you unplug the cable. Hold Boot, tap EN, release Boot, and upload again. That is the DevKitC V4 firmware-download sequence.',
          },
          {
            problem: 'The IDE cannot find WiFi.h or WebServer.h',
            solution: 'The ESP32 board package is not selected or not installed. Install the esp32 package from the stable Espressif boards URL and choose ESP32 Dev Module.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 27,
    stageSortOrder: 7,
    stageTitle: STAGE_TROUBLESHOOTING,
    title: 'The sensor, Wi-Fi, or dashboard fails',
    description: 'The Serial line names the fault. Match it to the wiring or the network before rewriting the sketch.',
    tip: 'Adafruit notes that intermittent I2C on the original non-STEMMA BME280 can be improved by jumpering CS to Vin. Try that only after the four main wires are correct.',
    blocks: [
      {
        type: 'troubleshooting',
        heading: 'Sensor, network, and page',
        items: [
          {
            problem: 'Serial says the BME280 was not found at 0x77',
            solution: 'Check red on the 3V3 rail, black on GND, blue on IO21, and yellow on IO22. Leave SDO open and do not solder the ADDR jumper. Either of those selects 0x76, and this sketch only calls begin(0x77). Do not edit the address to force a match unless the wiring steps change too. Confirm the board is a BME280 with a STEMMA QT socket, not a BMP280.',
          },
          {
            problem: 'Serial says the BME280 returned an invalid reading',
            solution: 'Power and ground are probably present because the chip answered begin(), but a later read failed. Reseat SCK and SDI, keep the wires short, and press EN to restart.',
          },
          {
            problem: 'The monitor repeats “Connecting to Wi-Fi...”',
            solution: 'Check the SSID and password, including capitals. The DevKit needs a 2.4 GHz network. The computer’s serial cable does not join Wi-Fi for the board; the board joins by itself.',
          },
          {
            problem: 'The browser cannot open the IP address',
            solution: 'Use http:// and the address from the latest “Wi-Fi connected” line, for example http://192.168.1.42. The phone or computer must be able to reach the ESP32. Mobile data cannot. A guest network or client isolation can block it even when both devices show the same Wi-Fi name. Use the main network. Internet access is not required.',
          },
          {
            problem: 'The page stays on “Dashboard not updating”',
            solution: 'The HTML loaded, then a later /readings request failed. That is the browser losing contact with the ESP32, not a reading that says Wi-Fi disconnected. Reload once. If Serial has stopped printing, press EN. If Serial still prints an IP address, confirm the browser is on the same local network and is not isolated from other devices.',
          },
        ],
      },
    ],
  },
  {
    sortOrder: 28,
    stageSortOrder: 8,
    stageTitle: STAGE_EXTEND,
    title: 'How this I2C link works',
    description: 'Two wires and one address are enough because the ESP32 is the only master.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Clock and data',
        body: 'I2C uses SCL for the clock and SDA for the data. On this board those pins are IO22 and IO21, which the cable marks yellow and blue. The ESP32 generates the clock and talks to the address in bme.begin. The BME280 does not send readings until that address is used. Arduino-ESP32 notes that SDA and SCL need pull-ups. Adafruit’s I2C wiring for this breakout does not add a separate resistor, and this project does not add one either. The resistor value on the PCB was not measured here.',
      },
      {
        type: 'text',
        heading: 'Why BMP280 is a different part',
        body: 'The BME280 measures humidity as well as pressure and temperature. A BMP280 does not provide that humidity reading, so it cannot fill this dashboard even if it shares a similar package. Solderi keeps the two parts as different catalogue rows, and this project does not approve the BMP280 as a substitute.',
      },
    ],
  },
  {
    sortOrder: 29,
    stageSortOrder: 8,
    stageTitle: STAGE_EXTEND,
    title: 'How the ESP32 hosts the page',
    description: 'The board is a small web server on your LAN. Your browser is the client.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Address and routes',
        body: 'After WiFi.begin succeeds, the router gives the ESP32 an address. server.begin() listens on port 80. A browser request for / receives the HTML. The script inside that HTML requests /readings. handleReadings sends the latest sample as JSON. The sketch updates that sample on SENSOR_INTERVAL_MS without waiting inside a blocking Wi-Fi loop.',
      },
      {
        type: 'text',
        heading: 'What is deliberately absent',
        body: 'There is no API key, no account, and no external weather service. If your internet connection drops but the ESP32 and the browser can still reach each other through the local router, the page can still load. If the ESP32 drops off Wi-Fi, connectWifi() tries again every five seconds and Serial prints “Connecting to Wi-Fi...”. The open browser then fails its next /readings request and shows “Dashboard not updating”. It does not receive a fresh status line from a board it can no longer reach.',
      },
    ],
  },
  {
    sortOrder: 30,
    stageSortOrder: 8,
    stageTitle: STAGE_EXTEND,
    title: 'Ideas that are not part of this build',
    description: 'These extensions need their own wiring or code review. They are not already supported.',
    tip: null,
    blocks: [
      {
        type: 'text',
        heading: 'Possible later work',
        body: 'A second sensor, an outdoor enclosure, a display, or a cloud upload would change the BOM, the power budget, or the firmware. Switching SDO to ground, or closing the ADDR jumper, would require changing BME280_I2C_ADDRESS to 0x76 and saying so in the wiring steps. None of that is included here. The working station is the DevKitC V4, the STEMMA QT BME280, the six electrical connections, the sketch you uploaded, and the local dashboard.',
      },
      {
        type: 'expected',
        heading: 'What you have now',
        body: 'An ESP32-DevKitC V4 reads an Adafruit BME280 at 0x77 on IO21 and IO22, joins your Wi-Fi, and shows temperature, humidity, and pressure in a browser that can reach that board.',
      },
    ],
  },
  {
    sortOrder: 31,
    stageSortOrder: 9,
    stageTitle: STAGE_CHECK,
    title: 'Check the finished station',
    description: 'Use this list before you treat the build as finished. It matches the learning objectives.',
    tip: 'A ticked box means you saw that result. It does not mean this repository tested your board.',
    blocks: [
      {
        type: 'test',
        heading: 'Hardware',
        body: 'The board is an ESP32-DevKitC V4 with male headers and a Micro-USB socket. The sensor is an Adafruit BME280 with a STEMMA QT cable, and no header was soldered. Four male-to-female jumpers land on 3V3, GND, IO21, and IO22. Red and black share the 3V3 and GND rails. Blue shares IO21. Yellow shares IO22. Only one power source is connected.',
      },
      {
        type: 'test',
        heading: 'Firmware and Serial Monitor',
        body: 'The uploaded file is the complete sketch, with your SSID and password in place of the placeholders. At 115200 baud, Serial prints “BME280 ready at 0x77.” and then “Wi-Fi connected. IP address:” plus an address. Temperature, humidity, and pressure follow about every two seconds. A not-found line or a repeating “Connecting to Wi-Fi...” line means that part is not finished.',
      },
      {
        type: 'test',
        heading: 'Dashboard',
        body: 'On the main Wi-Fi network, http:// and that address, for example http://192.168.1.42, shows “Connected at”, temperature in C, humidity in %, and pressure in hPa. The numbers move without a manual reload. The page still loads if the wider internet is down, as long as the ESP32 and the browser can reach each other. A guest or isolated network may fail this check even though both devices joined Wi-Fi.',
      },
      {
        type: 'expected',
        heading: 'What this check does not prove',
        body: 'This repository has not run the sketch on a physical ESP32, and the workbench photograph is still not in the app. Compare your Serial Monitor and browser with the lines above. If they differ, use the troubleshooting steps rather than treating the page as already verified.',
      },
    ],
  },
];
