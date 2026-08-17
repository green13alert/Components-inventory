import { Ionicons } from '@expo/vector-icons';

import { ProjectImage, PROJECT_IMAGES } from '@/constants/projects';

export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';
export type ProjectCategory = 'robotics' | 'iot' | 'sensors' | 'automation' | 'displays';
export type ProjectViewFilter = 'all' | 'in_progress' | 'favourites' | 'completed';
export type ProjectDifficultyFilter = 'all' | ProjectDifficulty;

export type ProjectComponent = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  owned: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  overview?: string;
  difficulty: ProjectDifficulty;
  duration: string;
  category: ProjectCategory;
  image: ProjectImage;
  ownedParts: number;
  totalParts: number;
  status: ProjectStatus;
  progress?: number;
};

export const DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  robotics: 'Robotics',
  iot: 'IoT',
  sensors: 'Sensors',
  automation: 'Automation',
  displays: 'Displays',
};

const STEP_COUNTS: Record<ProjectDifficulty, number> = {
  beginner: 6,
  intermediate: 8,
  advanced: 10,
};

const COMPONENT_POOLS: Record<
  ProjectCategory,
  { name: string; icon: keyof typeof Ionicons.glyphMap }[]
> = {
  robotics: [
    { name: 'Arduino Uno R3', icon: 'hardware-chip-outline' },
    { name: 'L293D Motor Driver', icon: 'flash-outline' },
    { name: 'DC Gear Motors', icon: 'cog-outline' },
    { name: 'HC-SR04 Ultrasonic', icon: 'radio-outline' },
    { name: 'IR Sensor Array', icon: 'scan-outline' },
    { name: 'Servo Motor SG90', icon: 'git-branch-outline' },
    { name: '9V Battery Pack', icon: 'battery-charging-outline' },
    { name: 'Breadboard', icon: 'grid-outline' },
    { name: 'Jumper Wires', icon: 'git-network-outline' },
    { name: 'Chassis Kit', icon: 'car-outline' },
    { name: 'MPU-6050 Gyro', icon: 'compass-outline' },
    { name: 'Bluetooth HC-05', icon: 'bluetooth-outline' },
    { name: 'Stepper Motor', icon: 'refresh-outline' },
    { name: 'A4988 Driver', icon: 'pulse-outline' },
    { name: 'Limit Switches', icon: 'toggle-outline' },
    { name: 'Propellers', icon: 'aperture-outline' },
    { name: 'ESC Controllers', icon: 'speedometer-outline' },
    { name: 'Flight Controller Board', icon: 'airplane-outline' },
  ],
  iot: [
    { name: 'ESP32 DevKit', icon: 'wifi-outline' },
    { name: 'DHT22 Sensor', icon: 'thermometer-outline' },
    { name: 'BMP280 Barometer', icon: 'speedometer-outline' },
    { name: 'OLED Display', icon: 'tv-outline' },
    { name: 'Relay Module', icon: 'flash-outline' },
    { name: 'SD Card Module', icon: 'save-outline' },
    { name: 'RFID RC522', icon: 'card-outline' },
    { name: 'Real-Time Clock', icon: 'time-outline' },
    { name: 'Soil Moisture Probe', icon: 'water-outline' },
    { name: 'Microphone Module', icon: 'mic-outline' },
    { name: 'LDR Photoresistor', icon: 'sunny-outline' },
    { name: 'Water Pump', icon: 'water-outline' },
    { name: 'Fan Module', icon: 'snow-outline' },
  ],
  sensors: [
    { name: 'Arduino Uno R3', icon: 'hardware-chip-outline' },
    { name: 'DHT22 Sensor', icon: 'thermometer-outline' },
    { name: 'Soil Moisture Probe', icon: 'water-outline' },
    { name: 'LDR Photoresistor', icon: 'sunny-outline' },
    { name: 'PIR Motion Sensor', icon: 'walk-outline' },
    { name: 'Piezo Buzzer', icon: 'volume-high-outline' },
    { name: 'LED Pack', icon: 'bulb-outline' },
    { name: 'Push Buttons', icon: 'radio-button-on-outline' },
    { name: 'MAX30102 Pulse Sensor', icon: 'heart-outline' },
    { name: 'Resistor Kit', icon: 'ellipse-outline' },
    { name: 'Breadboard', icon: 'grid-outline' },
    { name: 'Jumper Wires', icon: 'git-network-outline' },
  ],
  automation: [
    { name: 'Arduino Uno R3', icon: 'hardware-chip-outline' },
    { name: 'Relay Module 4-Channel', icon: 'flash-outline' },
    { name: 'RFID RC522', icon: 'card-outline' },
    { name: 'Keypad 4x4', icon: 'keypad-outline' },
    { name: 'Servo Motor SG90', icon: 'git-branch-outline' },
    { name: 'DHT22 Sensor', icon: 'thermometer-outline' },
    { name: 'LDR Photoresistor', icon: 'sunny-outline' },
    { name: 'LED Pack', icon: 'bulb-outline' },
    { name: 'Buzzer', icon: 'volume-high-outline' },
    { name: 'LDR Sensor Pair', icon: 'sunny-outline' },
    { name: 'Dual-Axis Servo Rig', icon: 'move-outline' },
    { name: 'Power Supply 12V', icon: 'battery-charging-outline' },
    { name: 'Terminal Blocks', icon: 'link-outline' },
    { name: 'Smart Relay Board', icon: 'flash-outline' },
    { name: 'Temperature Probe', icon: 'thermometer-outline' },
    { name: 'HVAC Relay', icon: 'snow-outline' },
  ],
  displays: [
    { name: 'Arduino Uno R3', icon: 'hardware-chip-outline' },
    { name: '8x8 LED Matrix', icon: 'grid-outline' },
    { name: 'MAX7219 Driver', icon: 'hardware-chip-outline' },
    { name: 'LED Pack', icon: 'bulb-outline' },
    { name: '220Ω Resistors', icon: 'ellipse-outline' },
    { name: 'Traffic Light LEDs', icon: 'color-filter-outline' },
    { name: 'Breadboard', icon: 'grid-outline' },
    { name: 'Jumper Wires', icon: 'git-network-outline' },
  ],
};

export function getProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find((project) => project.id === id);
}

export function getProjectByTitle(title: string): Project | undefined {
  return MOCK_PROJECTS.find((project) => project.title === title);
}

export function getStepCount(difficulty: ProjectDifficulty): number {
  return STEP_COUNTS[difficulty];
}

export function getProjectOverview(project: Project): string {
  if (project.overview) return project.overview;

  return `${project.description}. This ${DIFFICULTY_LABELS[project.difficulty].toLowerCase()} ${CATEGORY_LABELS[project.category].toLowerCase()} build walks you through wiring, coding, and testing with step-by-step guidance tailored to your skill level.`;
}

export function getProjectComponents(project: Project): ProjectComponent[] {
  const pool = COMPONENT_POOLS[project.category];
  const count = Math.min(project.totalParts, pool.length);

  return pool.slice(0, count).map((component, index) => ({
    id: `${project.id}-component-${index}`,
    name: component.name,
    icon: component.icon,
    owned: index < project.ownedParts,
  }));
}

export function getStartButtonLabel(status: ProjectStatus): string {
  switch (status) {
    case 'in_progress':
      return 'Continue Building';
    case 'completed':
      return 'Review Project';
    default:
      return 'Get Started';
  }
}

export const INITIAL_FAVOURITE_PROJECT_IDS = ['3', '5', '10', '14', '17', '20'];

export const PROJECT_VIEW_FILTERS: { id: ProjectViewFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'completed', label: 'Completed' },
];

export const PROJECT_DIFFICULTY_FILTERS: { id: ProjectDifficultyFilter; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Smart Plant Monitor',
    description: 'Track soil moisture and light levels for healthier plants',
    difficulty: 'beginner',
    duration: '3 hrs',
    category: 'sensors',
    image: PROJECT_IMAGES.smartPlantMonitor,
    ownedParts: 6,
    totalParts: 8,
    status: 'in_progress',
    progress: 52,
    overview:
      'Build a smart monitoring system that tracks soil moisture, ambient light, and temperature to keep your plants healthy. You\'ll wire analog sensors, calibrate readings, and display live data — perfect for learning sensor interfacing and conditional logic.',
  },
  {
    id: '2',
    title: 'LED Matrix Display',
    description: 'Build a scrolling text display with an 8x8 LED matrix',
    difficulty: 'beginner',
    duration: '2 hrs',
    category: 'displays',
    image: PROJECT_IMAGES.ledMatrix,
    ownedParts: 5,
    totalParts: 6,
    status: 'not_started',
  },
  {
    id: '3',
    title: 'Bluetooth RC Car',
    description: 'Control a motorized chassis from your phone over Bluetooth',
    difficulty: 'intermediate',
    duration: '5 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.bluetoothRcCar,
    ownedParts: 9,
    totalParts: 12,
    status: 'not_started',
  },
  {
    id: '4',
    title: 'Weather Station',
    description: 'Log temperature, humidity, and pressure to the cloud',
    difficulty: 'intermediate',
    duration: '4 hrs',
    category: 'iot',
    image: PROJECT_IMAGES.weatherStation,
    ownedParts: 7,
    totalParts: 9,
    status: 'not_started',
  },
  {
    id: '5',
    title: 'Home Automation Hub',
    description: 'Centralize lights, fans, and relays in one controller',
    difficulty: 'advanced',
    duration: '8 hrs',
    category: 'automation',
    image: PROJECT_IMAGES.homeAutomation,
    ownedParts: 10,
    totalParts: 16,
    status: 'not_started',
  },
  {
    id: '6',
    title: 'Line Following Robot',
    description: 'Use IR sensors to navigate a taped track autonomously',
    difficulty: 'beginner',
    duration: '3 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.lineFollowingRobot,
    ownedParts: 8,
    totalParts: 8,
    status: 'completed',
  },
  {
    id: '7',
    title: 'Arduino Door Lock System',
    description: 'Unlock your door with RFID or a keypad entry code',
    difficulty: 'intermediate',
    duration: '4 hrs',
    category: 'automation',
    image: PROJECT_IMAGES.doorLock,
    ownedParts: 8,
    totalParts: 10,
    status: 'not_started',
  },
  {
    id: '8',
    title: 'Motion Sensor Alarm',
    description: 'Trigger a buzzer and LED when movement is detected',
    difficulty: 'beginner',
    duration: '1.5 hrs',
    category: 'sensors',
    image: PROJECT_IMAGES.motionSensor,
    ownedParts: 5,
    totalParts: 6,
    status: 'completed',
  },
  {
    id: '9',
    title: 'Smart Thermostat',
    description: 'Regulate room temperature with a relay and sensor loop',
    difficulty: 'advanced',
    duration: '6 hrs',
    category: 'automation',
    image: PROJECT_IMAGES.smartThermostat,
    ownedParts: 11,
    totalParts: 14,
    status: 'not_started',
  },
  {
    id: '10',
    title: 'Automated Greenhouse',
    description: 'Automate watering, fans, and grow lights on a schedule',
    difficulty: 'advanced',
    duration: '10 hrs',
    category: 'iot',
    image: PROJECT_IMAGES.automatedGreenhouse,
    ownedParts: 9,
    totalParts: 12,
    status: 'not_started',
  },
  {
    id: '11',
    title: 'Blinking LED Starter',
    description: 'Learn the basics with your first Arduino sketch and an LED',
    difficulty: 'beginner',
    duration: '30 min',
    category: 'displays',
    image: PROJECT_IMAGES.blinkLed,
    ownedParts: 3,
    totalParts: 3,
    status: 'completed',
  },
  {
    id: '12',
    title: 'Traffic Light Simulator',
    description: 'Cycle red, yellow, and green LEDs with timed state logic',
    difficulty: 'beginner',
    duration: '1 hr',
    category: 'displays',
    image: PROJECT_IMAGES.trafficLight,
    ownedParts: 4,
    totalParts: 5,
    status: 'not_started',
  },
  {
    id: '13',
    title: 'Buzzer Piano',
    description: 'Play musical notes on a piezo buzzer with push buttons',
    difficulty: 'beginner',
    duration: '2 hrs',
    category: 'sensors',
    image: PROJECT_IMAGES.pianoBuzzer,
    ownedParts: 4,
    totalParts: 6,
    status: 'not_started',
  },
  {
    id: '14',
    title: 'Light-Activated Night Lamp',
    description: 'Turn on an LED automatically when the room gets dark',
    difficulty: 'beginner',
    duration: '1.5 hrs',
    category: 'automation',
    image: PROJECT_IMAGES.nightLamp,
    ownedParts: 4,
    totalParts: 5,
    status: 'not_started',
  },
  {
    id: '15',
    title: 'Pulse Oximeter',
    description: 'Measure heart rate and blood oxygen with an optical sensor',
    difficulty: 'intermediate',
    duration: '5 hrs',
    category: 'sensors',
    image: PROJECT_IMAGES.pulseOximeter,
    ownedParts: 7,
    totalParts: 9,
    status: 'not_started',
  },
  {
    id: '16',
    title: 'Obstacle Avoidance Robot',
    description: 'Navigate around objects using ultrasonic distance sensing',
    difficulty: 'intermediate',
    duration: '6 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.obstacleRobot,
    ownedParts: 8,
    totalParts: 11,
    status: 'not_started',
  },
  {
    id: '17',
    title: 'RFID Access Logger',
    description: 'Scan badge IDs and log entry times to an SD card',
    difficulty: 'intermediate',
    duration: '4 hrs',
    category: 'iot',
    image: PROJECT_IMAGES.rfidLogger,
    ownedParts: 6,
    totalParts: 8,
    status: 'not_started',
  },
  {
    id: '18',
    title: 'Servo Pan-Tilt Camera',
    description: 'Remotely aim a camera module with two servo motors',
    difficulty: 'intermediate',
    duration: '5 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.servoCamera,
    ownedParts: 7,
    totalParts: 10,
    status: 'not_started',
  },
  {
    id: '19',
    title: 'Drone Flight Controller',
    description: 'Stabilize a quadcopter with gyroscope and PID tuning',
    difficulty: 'advanced',
    duration: '12 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.droneController,
    ownedParts: 12,
    totalParts: 18,
    status: 'not_started',
  },
  {
    id: '20',
    title: 'CNC Pen Plotter',
    description: 'Draw vector art on paper with stepper motors and G-code',
    difficulty: 'advanced',
    duration: '14 hrs',
    category: 'robotics',
    image: PROJECT_IMAGES.cncPlotter,
    ownedParts: 10,
    totalParts: 15,
    status: 'not_started',
  },
  {
    id: '21',
    title: 'Voice-Controlled Assistant',
    description: 'Trigger actions with speech recognition and a microphone module',
    difficulty: 'advanced',
    duration: '9 hrs',
    category: 'iot',
    image: PROJECT_IMAGES.voiceAssistant,
    ownedParts: 9,
    totalParts: 13,
    status: 'not_started',
  },
  {
    id: '22',
    title: 'Solar Tracker System',
    description: 'Follow the sun with LDR sensors and a dual-axis servo rig',
    difficulty: 'advanced',
    duration: '7 hrs',
    category: 'automation',
    image: PROJECT_IMAGES.solarTracker,
    ownedParts: 8,
    totalParts: 11,
    status: 'completed',
  },
];
