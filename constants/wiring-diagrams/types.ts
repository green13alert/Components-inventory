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

export type BreadboardColumn = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

export type BreadboardHole =
  | { kind: 'strip'; row: number; column: BreadboardColumn }
  | { kind: 'rail'; side: 'left' | 'right'; polarity: 'plus' | 'minus'; row: number };

export type PhysicalEndpoint = BreadboardHole | { kind: 'module'; elementId: string; portId: string };

export type PhysicalLead = {
  elementId: string;
  portId: string;
  hole: BreadboardHole;
};

export type PhysicalJumper = {
  id: string;
  gender: 'male-male' | 'male-female';
  from: PhysicalEndpoint;
  to: PhysicalEndpoint;
};

export type PhysicalRailBinding = {
  elementId: string;
  portId: string;
  side: 'left' | 'right';
  polarity: 'plus' | 'minus';
  segment: 'upper' | 'lower';
};

/** An off-board part. Pin coordinates use the same space as breadboard holes. */
export type PhysicalModulePlacement = {
  elementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pins: { portId: string; x: number; y: number; label: string }[];
  /** Unlabelled header positions, so the real pin order stays visible. */
  dots?: { x: number; y: number }[];
  /** Male cable ends are the element's leads. The socket stays on this part. */
  cableFrom?: { x: number; y: number };
};

/** A reproducible breadboard arrangement. Schematic symbols stay on WiringLayout.elements. */
export type PhysicalLayout = {
  rows: number;
  /** Last row of the upper rail segment. Null means the rails run the full length. */
  railSplitAfter: number | null;
  leads: PhysicalLead[];
  jumpers: PhysicalJumper[];
  railBindings: PhysicalRailBinding[];
  modules?: PhysicalModulePlacement[];
  /** Element ids drawn from the first physical step, such as the controller. */
  fixtures?: string[];
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
  physical?: PhysicalLayout;
};
