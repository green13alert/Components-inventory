import { Ionicons } from '@expo/vector-icons';

export type ComponentCategory =
  | 'all'
  | 'microcontrollers'
  | 'sensors'
  | 'actuators'
  | 'displays'
  | 'power'
  | 'modules';

export type InventoryComponent = {
  id: string;
  name: string;
  category: Exclude<ComponentCategory, 'all'>;
  quantity: number;
  icon: keyof typeof Ionicons.glyphMap;
};

export const COMPONENT_FILTERS: { id: ComponentCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'microcontrollers', label: 'Microcontrollers' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'actuators', label: 'Actuators' },
  { id: 'displays', label: 'Displays' },
  { id: 'power', label: 'Power' },
  { id: 'modules', label: 'Modules' },
];

export const MOCK_INVENTORY: InventoryComponent[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    category: 'microcontrollers',
    quantity: 2,
    icon: 'hardware-chip-outline',
  },
  {
    id: '2',
    name: 'ESP32 DevKit',
    category: 'microcontrollers',
    quantity: 1,
    icon: 'wifi-outline',
  },
  {
    id: '3',
    name: 'DHT22 Temp & Humidity',
    category: 'sensors',
    quantity: 3,
    icon: 'thermometer-outline',
  },
  {
    id: '4',
    name: 'HC-SR04 Ultrasonic',
    category: 'sensors',
    quantity: 2,
    icon: 'radio-outline',
  },
  {
    id: '5',
    name: 'PIR Motion Sensor',
    category: 'sensors',
    quantity: 4,
    icon: 'walk-outline',
  },
  {
    id: '6',
    name: 'SG90 Micro Servo',
    category: 'actuators',
    quantity: 6,
    icon: 'sync-outline',
  },
  {
    id: '7',
    name: 'L298N Motor Driver',
    category: 'actuators',
    quantity: 1,
    icon: 'speedometer-outline',
  },
  {
    id: '8',
    name: '16x2 LCD Display',
    category: 'displays',
    quantity: 2,
    icon: 'tv-outline',
  },
  {
    id: '9',
    name: '0.96" OLED Screen',
    category: 'displays',
    quantity: 1,
    icon: 'phone-portrait-outline',
  },
  {
    id: '10',
    name: '9V Battery Clip',
    category: 'power',
    quantity: 5,
    icon: 'battery-charging-outline',
  },
  {
    id: '11',
    name: 'LM7805 Regulator',
    category: 'power',
    quantity: 8,
    icon: 'flash-outline',
  },
  {
    id: '12',
    name: 'HC-05 Bluetooth',
    category: 'modules',
    quantity: 1,
    icon: 'bluetooth-outline',
  },
  {
    id: '13',
    name: 'Relay Module 5V',
    category: 'modules',
    quantity: 3,
    icon: 'toggle-outline',
  },
  {
    id: '14',
    name: 'Soil Moisture Sensor',
    category: 'sensors',
    quantity: 2,
    icon: 'leaf-outline',
  },
];

export const CATEGORY_LABELS: Record<Exclude<ComponentCategory, 'all'>, string> = {
  microcontrollers: 'Microcontroller',
  sensors: 'Sensor',
  actuators: 'Actuator',
  displays: 'Display',
  power: 'Power',
  modules: 'Module',
};
