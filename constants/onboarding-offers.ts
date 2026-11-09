import { getCatalogueComponent } from './component-catalogue.ts';
import type { ComponentIllustrationId } from './component-illustrations.ts';
import type { ComponentCategory } from './onboarding.ts';

export type OnboardingChoice = {
  /** Catalogue id. This is the slug stored on `public.components`, not a display alias. */
  slug: string;
  name: string;
  hint: string;
  image: ComponentIllustrationId;
  /** True only for a real generic catalogue row. It never points at a specific variant. */
  unspecified: boolean;
};

export type OnboardingOffer = {
  id: string;
  category: ComponentCategory;
  title: string;
  image: ComponentIllustrationId;
  guidance: string;
  choices: readonly OnboardingChoice[];
};

function choice(slug: string, hint: string, unspecified = false): OnboardingChoice {
  const component = getCatalogueComponent(slug);
  if (!component || component.id !== slug) {
    throw new Error(`Onboarding offer missing catalogue component: ${slug}`);
  }
  return {
    slug: component.id,
    name: component.name,
    hint,
    image: component.image,
    unspecified,
  };
}

function offer(
  id: string,
  category: ComponentCategory,
  title: string,
  guidance: string,
  choices: readonly OnboardingChoice[],
): OnboardingOffer {
  const image = choices.find((item) => !item.unspecified)?.image ?? choices[0]?.image;
  if (!image) {
    throw new Error(`Onboarding offer has no choices: ${id}`);
  }
  return { id, category, title, image, guidance, choices };
}

/**
 * Parts a new workshop can record. Names come from the catalogue.
 * A generic row is offered only where that catalogue entry already exists.
 */
export const ONBOARDING_OFFERS: readonly OnboardingOffer[] = [
  offer('arduino-uno-r3', 'boards', 'Arduino Uno R3', 'This is the Uno R3. Another Arduino board is a different part.', [
    choice('arduino-uno-r3', 'ATmega328P board with a USB-B socket.'),
  ]),
  offer('esp32', 'boards', 'ESP32', 'Choose DevKitC V4 only when that name is printed on the board.', [
    choice('esp32-devkitc-v4', 'Espressif board with a Micro-USB socket.'),
    choice('esp32', 'Exact board unknown. This is not the DevKitC V4.', true),
  ]),
  offer('resistor', 'components', 'Resistor', 'Choose the colour-band value when you know it.', [
    choice('resistor-220', 'Current-limiting resistor for a typical 5 V LED.'),
    choice('resistor-1k', '1 kΩ through-hole resistor.'),
    choice('resistor', 'Value unknown. This does not count as 220 Ω or 1 kΩ.', true),
  ]),
  offer('led', 'components', 'LED', 'A single-colour LED. An RGB LED is a different part.', [
    choice('led', 'Standard indicator LED.'),
  ]),
  offer('rgb-led', 'components', 'RGB LED', 'Skip this if you are not sure which lead is shared.', [
    choice('rgb-led-ca', 'One shared anode lead.'),
    choice('rgb-led-cc', 'One shared cathode lead.'),
  ]),
  offer('pn2222a', 'components', 'PN2222A transistor', 'Add this when the flat side is marked PN2222A.', [
    choice('pn2222a', 'TO-92 transistor used as a switch.'),
  ]),
  offer('breadboard', 'components', 'Breadboard', 'A solderless breadboard.', [
    choice('breadboard', 'Solderless prototyping board.'),
  ]),
  offer('jumper-wires', 'components', 'Jumper wires', 'Pins and sockets are different. Add each kind you have.', [
    choice('jumper-wires', 'A pin on both ends.'),
    choice('jumper-male-female', 'A socket on one end and a pin on the other.'),
  ]),
  offer('usb-cable', 'components', 'USB data cable', 'Look at the plug that fits the board. An unknown plug does not count as either.', [
    choice('usb-b-data-cable', 'USB-A to USB-B. Fits an Arduino Uno R3.'),
    choice('usb-micro-b-data-cable', 'USB-A to Micro-USB. Fits an ESP32-DevKitC V4.'),
    choice('usb-data-cable', 'The plug was not recorded. This does not count as either cable.', true),
  ]),
  offer('stemma-qt', 'components', 'STEMMA QT cable', 'Skip this if you are not sure which end mates with the board.', [
    choice('stemma-qt-female', 'Four sockets that fit header pins.'),
    choice('stemma-qt-cable', 'Four pins that fit a breadboard.'),
  ]),
  offer('pir-sensor', 'sensors', 'PIR Motion Sensor', 'The motion-sensor module.', [
    choice('pir-sensor', 'HC-SR501-style module. Male header, usually VCC, OUT, GND.'),
  ]),
  offer('bme280', 'sensors', 'Adafruit BME280', 'A BMP280 is a different sensor.', [
    choice('bme280', 'Adafruit BME280 with STEMMA QT sockets.'),
  ]),
  offer('joystick', 'sensors', 'Analog Joystick Module', 'The five-pin joystick module.', [
    choice('joystick', 'Pins are usually GND, +5V, VRx, VRy, and SW.'),
  ]),
  offer('hc-sr04', 'sensors', 'HC-SR04', 'Ultrasonic distance sensor.', [
    choice('hc-sr04', 'Ultrasonic distance sensor.'),
  ]),
  offer('dht11', 'sensors', 'DHT11', 'A DHT22 is a different sensor.', [
    choice('dht11', 'Temperature and humidity sensor.'),
  ]),
  offer('servo', 'motors', 'Servo', 'Leave this out if the label is not SG90 or MG90S.', [
    choice('sg90', 'Positional SG90 micro servo.'),
    choice('mg90s', 'Metal-gear micro servo. This is not an SG90.'),
  ]),
  offer('buzzer', 'motors', 'Active buzzer', 'Leave this out if yours is a two-pin piezo.', [
    choice('buzzer', 'Male header, usually VCC, I/O, GND. Not a two-pin piezo.'),
  ]),
  offer('dc-motor', 'motors', 'DC Motor', 'A brushed hobby motor.', [
    choice('dc-motor', 'Brushed DC gear motor.'),
  ]),
  offer('oled-096', 'displays', '0.96" OLED', 'A small I2C OLED screen.', [
    choice('oled-096', '128×64 I2C OLED.'),
  ]),
  offer(
    'max7219',
    'displays',
    'MAX7219 LED Matrix',
    'Add this only for the assembled FC-16 module. Another matrix is a different part.',
    [choice('max7219', 'FC-16 module with a five-pin input header.')],
  ),
];

const choiceBySlug = new Map<string, OnboardingChoice>(
  ONBOARDING_OFFERS.flatMap((group) => group.choices.map((item) => [item.slug, item] as const)),
);

export function getOnboardingChoice(slug: string): OnboardingChoice | null {
  return choiceBySlug.get(slug) ?? null;
}

export function getOnboardingOffers(category: ComponentCategory): readonly OnboardingOffer[] {
  return ONBOARDING_OFFERS.filter((group) => group.category === category);
}
