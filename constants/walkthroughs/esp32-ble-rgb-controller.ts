// Authored source for ESP32 Bluetooth RGB LED Controller (slug 24).
// Live walkthrough data is public.project_steps. The project stays unpublished.
import type { ProjectComponent } from '../projects-data.ts';
import type { AuthoredWalkthroughStep, StepConnection } from '../walkthrough-content.ts';
import {
  ESP32_BLE_RGB_FIRMWARE,
  ESP32_BLE_RGB_LIBRARIES,
} from '../firmware/esp32-ble-rgb-controller.ts';

export const ESP32_BLE_RGB_PROJECT = {
  slug: '24',
  title: 'ESP32 Bluetooth RGB LED Controller',
  description: 'Intermediate build. Mix a red, green, and blue LED from a phone over Bluetooth Low Energy, using transistor switches and PWM.',
  overview:
    'Build a breadboard RGB light that a phone sets over Bluetooth Low Energy. The LED takes current from the DevKit 5 V pin. Three PN2222A transistors switch the colours, and PWM sets the mix.',
  category: 'iot' as const,
  difficulty: 'intermediate' as const,
  durationLabel: '3 hrs',
  imageKey: 'esp32BleRgb',
  isPublished: false,
  sortOrder: 24,
  learningObjectives: [
    'Switch a common-anode RGB LED from the DevKit 5 V pin with a PN2222A and a 220 Ω resistor on each colour',
    'Use LEDC PWM on GPIO25, GPIO26, and GPIO27 to drive those transistor bases through 1 kΩ',
    'Advertise a BLE GATT service that accepts colour and brightness writes',
    'Connect with nRF Connect for Mobile and compare the LED with the Serial Monitor',
  ],
};

export const ESP32_BLE_RGB_BOM = [
  { slug: 'esp32-devkitc-v4', name: 'ESP32-DevKitC V4', quantity: 1, role: 'microcontroller', illustrationId: 'esp32' as const },
  { slug: 'rgb-led-ca', name: 'Common-anode RGB LED', quantity: 1, role: 'rgb_led', illustrationId: 'rgb-led' as const },
  { slug: 'pn2222a', name: 'PN2222A transistor', quantity: 3, role: 'low_side_switch', illustrationId: 'transistor' as const },
  { slug: 'resistor-220', name: '220 Ω resistor', quantity: 3, role: 'led_limiter', illustrationId: 'resistor-band-220' as const },
  { slug: 'resistor-1k', name: '1 kΩ resistor', quantity: 3, role: 'base_resistor', illustrationId: 'resistor-band-1k' as const },
  { slug: 'breadboard', name: 'Breadboard', quantity: 1, role: 'breadboard', illustrationId: 'breadboard' as const },
  { slug: 'jumper-male-female', name: 'Male-to-female jumper wires', quantity: 5, role: 'jumper_wires', illustrationId: 'jumper-wires' as const },
  { slug: 'jumper-wires', name: 'Male-to-male jumper wires', quantity: 8, role: 'rail_jumpers', illustrationId: 'jumper-wires' as const },
  { slug: 'usb-data-cable', name: 'USB data cable', quantity: 1, role: 'usb_cable', illustrationId: 'usb-cable' as const },
  { slug: 'usb-power-source', name: 'USB power source', quantity: 1, role: 'usb_power', illustrationId: 'generic-module' as const },
] as const;

export const ESP32_BLE_RGB_CAPABILITIES = {
  'rgb-led-ca': [
    ['function', 'rgb_led'],
    ['physical_form', 'common_anode'],
  ],
  pn2222a: [
    ['function', 'npn_transistor'],
    ['physical_form', 'to-92'],
    ['physical_form', 'ebc'],
  ],
} as const;

export const ESP32_BLE_RGB_CONSTRAINTS = {
  'esp32-devkitc-v4': [
    ['function', 'development_board'],
    ['logic_level_v', '3.3'],
    ['board_package', 'esp32'],
    ['physical_form', 'male_header'],
  ],
  'rgb-led-ca': [
    ['function', 'rgb_led'],
    ['physical_form', 'common_anode'],
  ],
  pn2222a: [
    ['function', 'npn_transistor'],
    ['physical_form', 'to-92'],
    ['physical_form', 'ebc'],
  ],
} as const;

const COMPONENTS: ProjectComponent[] = ESP32_BLE_RGB_BOM.map((item) => ({
  id: item.slug,
  name: item.name,
  illustrationId: item.illustrationId,
  owned: false,
  quantity: item.quantity,
}));

export const ESP32_BLE_RGB_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'ESP32 DevKit', fromPin: '5V', toComponent: 'Breadboard', toPin: '5V rail', signal: 'power' },
  { fromComponent: 'Breadboard', fromPin: '5V rail', toComponent: 'RGB LED', toPin: 'Anode', signal: 'power' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'GND', toComponent: 'Breadboard', toPin: 'GND rail', signal: 'ground' },
  { fromComponent: 'Breadboard', fromPin: 'GND rail', toComponent: 'Q red', toPin: 'Emitter', signal: 'ground' },
  { fromComponent: 'Breadboard', fromPin: 'GND rail', toComponent: 'Q green', toPin: 'Emitter', signal: 'ground' },
  { fromComponent: 'Breadboard', fromPin: 'GND rail', toComponent: 'Q blue', toPin: 'Emitter', signal: 'ground' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'IO25', toComponent: '1k red', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '1k red', fromPin: 'leg 2', toComponent: 'Q red', toPin: 'Base', signal: 'signal' },
  { fromComponent: 'Q red', fromPin: 'Collector', toComponent: '220 red', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '220 red', fromPin: 'leg 2', toComponent: 'RGB LED', toPin: 'Red', signal: 'signal' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'IO26', toComponent: '1k green', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '1k green', fromPin: 'leg 2', toComponent: 'Q green', toPin: 'Base', signal: 'signal' },
  { fromComponent: 'Q green', fromPin: 'Collector', toComponent: '220 green', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '220 green', fromPin: 'leg 2', toComponent: 'RGB LED', toPin: 'Green', signal: 'signal' },
  { fromComponent: 'ESP32 DevKit', fromPin: 'IO27', toComponent: '1k blue', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '1k blue', fromPin: 'leg 2', toComponent: 'Q blue', toPin: 'Base', signal: 'signal' },
  { fromComponent: 'Q blue', fromPin: 'Collector', toComponent: '220 blue', toPin: 'leg 1', signal: 'signal' },
  { fromComponent: '220 blue', fromPin: 'leg 2', toComponent: 'RGB LED', toPin: 'Blue', signal: 'signal' },
];

const SUPPLY_CONNECTIONS = ESP32_BLE_RGB_CONNECTIONS.slice(0, 6);
const RED_CONNECTIONS = ESP32_BLE_RGB_CONNECTIONS.slice(6, 10);
const GREEN_CONNECTIONS = ESP32_BLE_RGB_CONNECTIONS.slice(10, 14);
const BLUE_CONNECTIONS = ESP32_BLE_RGB_CONNECTIONS.slice(14, 18);

function excerpt(start: string, end: string): string {
  const from = ESP32_BLE_RGB_FIRMWARE.indexOf(start);
  const to = ESP32_BLE_RGB_FIRMWARE.indexOf(end, from);
  if (from < 0 || to < 0) {
    throw new Error(`Firmware excerpt not found: ${start}`);
  }
  return ESP32_BLE_RGB_FIRMWARE.slice(from, to + end.length);
}

const PWM_EXCERPT = excerpt('int channelDuty(int channel) {', 'ledcWrite(BLUE_PIN, channelDuty(blueValue));');
const LEDC_EXCERPT = excerpt(
  'if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||',
  'applyColour();',
);
const BLE_EXCERPT = excerpt('BLEDevice::init(DEVICE_NAME);', 'Serial.println("Advertising as Solderi RGB.");');
const WRITE_EXCERPT = excerpt(
  'class ColorCallbacks : public BLECharacteristicCallbacks {',
  'Serial.println(colourText());',
);
const DISCONNECT_EXCERPT = excerpt(
  'void onDisconnect(BLEServer *server) override {',
  'BLEDevice::startAdvertising();',
);

const STAGES = {
  intro: { sort: 0, title: 'Introduction' },
  hardware: { sort: 1, title: 'Hardware preparation' },
  wiring: { sort: 2, title: 'Wiring' },
  environment: { sort: 3, title: 'Development environment' },
  firmware: { sort: 4, title: 'Firmware' },
  phone: { sort: 5, title: 'Phone control' },
  trouble: { sort: 6, title: 'Troubleshooting' },
  check: { sort: 7, title: 'Final check' },
} as const;

function lesson(
  stage: (typeof STAGES)[keyof typeof STAGES],
  sortOrder: number,
  title: string,
  description: string,
  blocks: AuthoredWalkthroughStep['blocks'],
  tip: string | null = null,
): AuthoredWalkthroughStep {
  return {
    sortOrder,
    stageSortOrder: stage.sort,
    stageTitle: stage.title,
    title,
    description,
    tip,
    blocks,
  };
}

export const ESP32_BLE_RGB_STEPS: AuthoredWalkthroughStep[] = [
  lesson(
    STAGES.intro,
    0,
    'Build a phone-controlled colour light',
    'One RGB LED follows the colour and brightness a phone sends.',
    [
      {
        type: 'image',
        imageKey: 'esp32BleRgb',
        caption: 'The workbench photograph is not in the app yet. The wiring diagram is the connection reference.',
      },
      {
        type: 'text',
        heading: 'What you are building',
        body: 'An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching.',
      },
      {
        type: 'text',
        heading: 'What it will do',
        body: 'After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer.',
      },
    ],
  ),
  lesson(
    STAGES.intro,
    1,
    'Follow one colour from the phone to the LED',
    'The phone sends text. The ESP32 switches current from the 5 V pin.',
    [
      {
        type: 'text',
        heading: 'Four parts, four jobs',
        body: 'The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor.',
      },
      {
        type: 'text',
        heading: 'Why the transistor is there',
        body: 'This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on.',
      },
      {
        type: 'warning',
        body: 'Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode.',
      },
      {
        type: 'tip',
        body: 'Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V.',
      },
    ],
  ),
  lesson(
    STAGES.hardware,
    2,
    'Set the parts on the desk',
    'Five male-to-female wires reach the DevKit. Eight male-to-male wires finish the board.',
    [
      { type: 'components', heading: 'Required parts', items: COMPONENTS },
      {
        type: 'text',
        heading: 'Count the wires before you start',
        body: 'The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it.',
      },
      {
        type: 'text',
        body: 'You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list.',
      },
    ],
  ),
  lesson(
    STAGES.hardware,
    3,
    'Confirm the LED is common anode',
    'Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.',
    [
      {
        type: 'text',
        heading: 'Find the leads',
        body: 'Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens.',
      },
      {
        type: 'text',
        heading: 'The datasheet detail',
        body: 'Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them.',
      },
      {
        type: 'warning',
        body: 'A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it.',
      },
    ],
  ),
  lesson(
    STAGES.hardware,
    4,
    'Know the transistors and the resistors',
    'Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.',
    [
      {
        type: 'text',
        heading: 'Which way the transistor faces',
        body: 'Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order.',
      },
      {
        type: 'text',
        heading: 'Why each resistor is there',
        body: 'The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current. On USB power, green and blue look dimmer than red because those chips have a higher forward voltage.',
      },
      {
        type: 'tip',
        body: 'A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    5,
    'Seat every part on these rows',
    'Use rows 1–15. The physical diagram names the same holes.',
    [
      {
        type: 'warning',
        body: 'Holes a–e in one numbered row are joined. Holes f–j with the same number are a separate connection. Do not put two transistor leads in one row, or two LED leads in one row.',
      },
      {
        type: 'text',
        heading: 'The LED',
        body: 'Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9.',
      },
      {
        type: 'text',
        heading: 'Red channel, left half',
        body: 'Transistor flat to the right: emitter c1, base c2, collector c3. The 1 kΩ leads go in e2 and i2. The 220 Ω leads go in e3 and h6. h6 shares the right-hand row with f6. The resistor body sits above the gap and does not enter f6.',
      },
      {
        type: 'text',
        heading: 'Green channel, left half',
        body: 'Emitter c10, base c11, collector c12, flat to the right. The 1 kΩ leads go in e11 and i11. The 220 Ω leads go in a12 and d15, on the left half. A male-to-male wire from b15 to j9 carries that node to f9. The wire arches over the board and enters only those two holes.',
      },
      {
        type: 'text',
        heading: 'Blue channel, right half',
        body: 'Emitter h13, base h14, collector h15, flat to the right. The 1 kΩ leads go in e14 and g14. The 220 Ω leads go in j15 and g12. A male-to-male wire from j12 to j8 carries that node to f8. It stays in column j, arches over j9, and does not enter j9.',
      },
      {
        type: 'wiring',
        heading: 'Where the parts sit',
        connections: [],
        assembly: {
          parts: ['led', 'q-red', 'q-green', 'q-blue', 'base-red', 'base-green', 'base-blue', 'limit-red', 'limit-green', 'limit-blue'],
          jumpers: [],
        },
      },
      {
        type: 'test',
        heading: 'Checkpoint',
        body: 'Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    6,
    'Connect 5 V and ground',
    'Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.',
    [
      {
        type: 'text',
        body: 'Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a1 to the left − rail at row 3, a10 to the left − rail at row 10, and j13 to the right − rail at row 13. Leave USB unplugged.',
      },
      {
        type: 'wiring',
        heading: 'Supply and ground',
        connections: SUPPLY_CONNECTIONS,
        assembly: {
          parts: [],
          jumpers: ['devkit-5v', 'devkit-gnd', 'bridge-plus', 'bridge-minus', 'anode-rail', 'red-emitter', 'green-emitter', 'blue-emitter'],
        },
      },
      { type: 'connections', heading: 'These six links', rows: SUPPLY_CONNECTIONS },
      {
        type: 'test',
        heading: 'Checkpoint',
        body: 'Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a1, a10, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    7,
    'Build the red channel',
    'GPIO25 switches the red cathode through j2 and f6.',
    [
      {
        type: 'text',
        body: 'Join DevKit GPIO25 to j2 with a male-to-female wire. e2 and i2 hold the red 1 kΩ. c2 is the base. e3 and h6 hold the red 220 Ω, and f6 is LED pin 1.',
      },
      { type: 'wiring', heading: 'Red channel', connections: RED_CONNECTIONS, assembly: { parts: [], jumpers: ['devkit-io25'] } },
      { type: 'connections', heading: 'Red links', rows: RED_CONNECTIONS },
      {
        type: 'test',
        heading: 'Checkpoint',
        body: 'GPIO25 is in j2, the 1 kΩ in e2 and i2, and the base in c2. The collector is c3 and the 220 Ω meets it at e3 and the LED at h6. No two of those leads share one hole.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    8,
    'Build the green channel',
    'GPIO26 switches the green cathode through j11, b15, and f9.',
    [
      {
        type: 'text',
        body: 'Join GPIO26 to j11. The green 1 kΩ is in e11 and i11, the base is c11, and the 220 Ω runs from a12 to d15. Add the male-to-male wire from b15 to j9. j9 shares the row with LED pin 4 in f9.',
      },
      { type: 'wiring', heading: 'Green channel', connections: GREEN_CONNECTIONS, assembly: { parts: [], jumpers: ['devkit-io26', 'green-cathode'] } },
      { type: 'connections', heading: 'Green links', rows: GREEN_CONNECTIONS },
      {
        type: 'test',
        heading: 'Checkpoint',
        body: 'GPIO26 is in j11. The 1 kΩ lead is not in c10, c11, or c12. The b15 to j9 wire is the only extra lead in the green cathode row. f9 still holds the LED lead.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    9,
    'Build the blue channel',
    'GPIO27 switches the blue cathode through a14, j12, and f8.',
    [
      {
        type: 'text',
        body: 'Join GPIO27 to a14. The blue 1 kΩ is in e14 and g14, the base is h14, and the 220 Ω runs from j15 to g12. Add the male-to-male wire from j12 to j8. j8 shares the row with LED pin 3 in f8. The wire arches over j9 and does not enter it.',
      },
      { type: 'wiring', heading: 'Blue channel', connections: BLUE_CONNECTIONS, assembly: { parts: [], jumpers: ['devkit-io27', 'blue-cathode'] } },
      { type: 'connections', heading: 'Blue links', rows: BLUE_CONNECTIONS },
      {
        type: 'test',
        heading: 'Checkpoint',
        body: 'GPIO27 is in a14. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each. j9 is only the green link.',
      },
    ],
  ),
  lesson(
    STAGES.wiring,
    10,
    'Check the whole circuit, then plug in USB',
    'This is the only full connection list. Use it once, before power.',
    [
      {
        type: 'connections',
        heading: 'All 18 connections',
        rows: ESP32_BLE_RGB_CONNECTIONS,
        summary: 'Five male-to-female wires leave the DevKit. Eight male-to-male wires join the rails, the emitters, and the green and blue cathode links. Every other join is two leads in the same five-hole row.',
      },
      {
        type: 'wiring',
        heading: 'Finished arrangement',
        connections: ESP32_BLE_RGB_CONNECTIONS,
      },
      {
        type: 'test',
        heading: 'Before USB',
        body: 'LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply.',
      },
    ],
  ),
  lesson(
    STAGES.environment,
    11,
    'Install the ESP32 board package',
    'The Arduino IDE needs the Espressif package before it can see this board.',
    [
      {
        type: 'text',
        body: 'Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach.',
      },
      {
        type: 'tip',
        body: 'If the board list has no ESP32 Dev Module after the install, close the IDE and open it again.',
      },
    ],
  ),
  lesson(
    STAGES.environment,
    12,
    'Select the board and the port',
    'The sketch talks to the computer at 115200 baud.',
    [
      {
        type: 'text',
        body: 'Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing.',
      },
      {
        type: 'expected',
        heading: 'If the port is missing',
        body: 'Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in.',
      },
    ],
  ),
  lesson(
    STAGES.firmware,
    13,
    'See how PWM sets the brightness',
    'GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.',
    [
      {
        type: 'text',
        heading: 'Why these pins',
        body: 'GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter.',
      },
      {
        type: 'text',
        body: 'The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment.',
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'excerpt-brightness.ino',
        code: PWM_EXCERPT,
      },
      {
        type: 'text',
        heading: 'What that excerpt does',
        body: 'channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour.',
      },
      {
        type: 'text',
        body: 'This second excerpt is the setup that attaches those pins. Do not upload it on its own.',
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'excerpt-pwm-setup.ino',
        code: LEDC_EXCERPT,
      },
      {
        type: 'text',
        heading: 'What ledcAttach does',
        body: 'ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent.',
      },
    ],
  ),
  lesson(
    STAGES.firmware,
    14,
    'Watch the write 255,80,0 travel through the sketch',
    'A characteristic is one value the phone can read or write.',
    [
      {
        type: 'text',
        heading: 'The path of one colour',
        body: 'The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it.',
      },
      {
        type: 'text',
        body: 'Both blocks below are excerpts. The complete sketch is in the next step.',
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'excerpt-advertise.ino',
        code: BLE_EXCERPT,
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'excerpt-colour-write.ino',
        code: WRITE_EXCERPT,
      },
      {
        type: 'text',
        heading: 'Rejected writes and a disconnect',
        body: 'A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED.',
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'excerpt-disconnect.ino',
        code: DISCONNECT_EXCERPT,
      },
    ],
  ),
  lesson(
    STAGES.firmware,
    15,
    'Upload the complete sketch',
    'This is the program to copy. The earlier blocks were excerpts.',
    [
      {
        type: 'text',
        body: 'Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB.',
      },
      {
        type: 'code',
        language: 'cpp',
        filename: 'esp32-ble-rgb-controller.ino',
        libraries: [...ESP32_BLE_RGB_LIBRARIES],
        code: ESP32_BLE_RGB_FIRMWARE,
      },
      {
        type: 'expected',
        heading: 'After a successful upload',
        body: 'The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it.',
      },
    ],
  ),
  lesson(
    STAGES.phone,
    16,
    'Find Solderi RGB in nRF Connect',
    'Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.',
    [
      {
        type: 'text',
        body: 'Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral.',
      },
      {
        type: 'text',
        heading: 'The service, once',
        body: 'After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write.',
      },
      {
        type: 'expected',
        heading: 'When the connection works',
        body: 'nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24.',
      },
    ],
  ),
  lesson(
    STAGES.phone,
    17,
    'Write a colour as text',
    'The write format is UTF-8 text, three numbers separated by commas.',
    [
      {
        type: 'text',
        body: 'On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent.',
      },
      {
        type: 'text',
        heading: 'If the app asks for hex',
        body: 'Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text.',
      },
      {
        type: 'warning',
        body: 'Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas.',
      },
    ],
  ),
  lesson(
    STAGES.phone,
    18,
    'Change brightness, then disconnect and come back',
    'Brightness is a second text value, from 0 to 100.',
    [
      {
        type: 'text',
        body: 'On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red.',
      },
      {
        type: 'text',
        body: 'A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected.',
      },
      {
        type: 'tip',
        body: 'Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted.',
      },
    ],
  ),
  lesson(
    STAGES.trouble,
    19,
    'Fix the light before you blame the phone',
    'Match the symptom, then work down the checks.',
    [
      {
        type: 'troubleshooting',
        heading: 'The LED itself',
        items: [
          {
            problem: 'The LED stays dark after upload.',
            solution:
              'The usual causes are USB not powering the board, the anode off the + rail, or an emitter off the − rail. Confirm the monitor prints the advertising line. The anode jumper is j7 on the right + rail, and the two + rails are bridged on row 1. Emitters are a1 and a10 on the left − rail and j13 on the right − rail, with the − rails bridged on row 1. Those rows are above the rail break. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed: pin 2, the anode, is the lead in f7.',
          },
          {
            problem: 'Only red lights. Green and blue stay off.',
            solution:
              'Either those links are in the wrong holes, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, confirm the green wire is in b15 and j9, and the blue wire is in j12 and j8. j9 shares the row with LED pin 4 in f9. j8 shares the row with LED pin 3 in f8. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark.',
          },
          {
            problem: 'One colour is stuck on, or two colours light together.',
            solution:
              'Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin.',
          },
          {
            problem: 'The LED is very hot or a resistor smells.',
            solution:
              'Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step.',
          },
        ],
      },
    ],
  ),
  lesson(
    STAGES.trouble,
    20,
    'Fix the phone connection',
    'The board has to be advertising before the phone can write.',
    [
      {
        type: 'troubleshooting',
        heading: 'nRF Connect',
        items: [
          {
            problem: 'Solderi RGB never appears in the scanner.',
            solution:
              'The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds.',
          },
          {
            problem: 'The app connects, then the write does nothing.',
            solution:
              'The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255.',
          },
          {
            problem: 'Upload never finishes.',
            solution:
              'The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line.',
          },
          {
            problem: 'It worked once, and the phone cannot reconnect.',
            solution:
              'Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan.',
          },
        ],
      },
    ],
  ),
  lesson(
    STAGES.check,
    21,
    'Walk the finished controller',
    'Do these in order and compare the LED with each line.',
    [
      {
        type: 'text',
        body: 'The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct.',
      },
      {
        type: 'expected',
        heading: 'Checklist',
        body: 'The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0.',
      },
    ],
  ),
];
