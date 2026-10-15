export type WiringSymbolKind =
  | 'arduino-uno'
  | 'breadboard'
  | 'breadboard-psu'
  | 'pir'
  | 'led'
  | 'rgb-led'
  | 'npn'
  | 'resistor'
  | 'buzzer'
  | 'servo'
  | 'joystick'
  | 'esp32-devkit'
  | 'bme280';

export type WiringRailDomain = 'logic' | 'servo' | 'ground';

export type WiringPortDef = {
  id: string;
  label: string;
  dx: number;
  dy: number;
  aliases: string[];
};

export type WiringElementDef = {
  id: string;
  kind: WiringSymbolKind;
  label: string;
  aliases: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  ports: WiringPortDef[];
  railDomain?: WiringRailDomain;
  /** Replaces the default “+ 5V” breadboard rail caption. */
  powerRailLabel?: string;
  /** Draws a socket and cable so the ports are the cable’s male pins, not a header in the breadboard. */
  cableLabel?: string;
  /** Selects colour bands on a resistor symbol. Omitted resistors keep the existing band drawing. */
  resistorOhms?: 100 | 220 | 1000;
  /** Short placement caption drawn with this symbol. Omitted on other diagrams. */
  note?: string;
};

export type WiringLayout = {
  slug: string;
  width: number;
  height: number;
  elements: WiringElementDef[];
  /** Overrides the shared legend text for this diagram only. */
  wireLabels?: Partial<
    Record<'powerLogic' | 'powerServo' | 'ground' | 'digital' | 'analog' | 'pwm' | 'i2cData' | 'i2cClock', string>
  >;
};
