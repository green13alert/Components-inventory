export type WiringSymbolKind =
  | 'arduino-uno'
  | 'breadboard'
  | 'breadboard-psu'
  | 'pir'
  | 'led'
  | 'resistor'
  | 'buzzer'
  | 'servo'
  | 'joystick';

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
};

export type WiringLayout = {
  slug: string;
  width: number;
  height: number;
  elements: WiringElementDef[];
};
