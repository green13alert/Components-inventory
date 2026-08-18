/**
 * Real-world hardware colours for Solderi component illustrations.
 * Kept separate from SolderiColors — components use recognisable physical colours.
 */

export const HW = {
  // Arduino / generic blue PCB
  pcbBlue: '#008184',
  pcbBlueLight: '#00A8AC',
  pcbBlueDark: '#006568',
  pcbBlueHighlight: '#33BFC3',

  // ESP32 dark green PCB
  pcbGreen: '#1B4332',
  pcbGreenMid: '#2D6A4F',
  pcbGreenLight: '#40916C',

  // Metal / shield
  metal: '#B8BEC6',
  metalLight: '#E2E6EA',
  metalDark: '#889099',

  // Servo SG90
  servoBlue: '#2563EB',
  servoBlueLight: '#60A5FA',
  servoBlueDark: '#1D4ED8',
  servoWhite: '#F1F5F9',

  // Pins & connectors
  pinGold: '#C9A227',
  pinSilver: '#AEB4BC',
  usbSilver: '#9CA3AF',

  // Breadboard
  breadWhite: '#F4F4EF',
  breadCream: '#E6E6DE',
  breadHole: '#B8B8B0',
  railRed: '#DC2626',
  railBlue: '#2563EB',

  // Resistor
  resistorBody: '#D9C9A8',
  bandBrown: '#92400E',
  bandRed: '#DC2626',
  bandGold: '#CA8A04',

  // LED
  ledRed: '#EF4444',
  ledRedGlow: '#FCA5A5',
  ledGreen: '#22C55E',

  // Motor
  motorBody: '#78716C',
  motorBodyLight: '#A8A29E',
  motorShaft: '#57534E',

  // Displays
  screenDark: '#111827',
  screenMid: '#1E3A5F',
  screenGlow: '#38BDF8',

  // Sensor housings
  sensorBlue: '#1D4ED8',
  sensorBlueLight: '#3B82F6',
  sensorVent: '#2563EB',

  // Relay / modules
  relayBlack: '#374151',
  relayCoil: '#6B7280',

  // Battery
  batteryRed: '#DC2626',
  batteryBlack: '#1F2937',

  // Wires
  wireRed: '#EF4444',
  wireBlack: '#374151',
  wireGreen: '#22C55E',
  wireYellow: '#EAB308',

  // Lighting & depth
  highlight: 'rgba(255,255,255,0.55)',
  highlightSoft: 'rgba(255,255,255,0.28)',
  edgeShadow: 'rgba(0,0,0,0.18)',
  dropShadow: 'rgba(0,0,0,0.32)',

  // Chip / IC
  icBlack: '#1F2937',
  icPin: '#6B7280',

  // Placeholder generics
  genericBlue: '#0891B2',
  genericGreen: '#059669',
} as const;
