export type ProjectImage = {
  uri: string;
};

export const PROJECT_IMAGES = {
  smartPlantMonitor: {
    uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
  },
  ledMatrix: {
    uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  },
  bluetoothRcCar: {
    uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  weatherStation: {
    uri: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&q=80',
  },
  homeAutomation: {
    uri: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
  },
  lineFollowingRobot: {
    uri: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  },
  doorLock: {
    uri: 'https://images.unsplash.com/photo-1558008802-48f9e4e7574f?w=600&q=80',
  },
  motionSensor: {
    uri: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80',
  },
  smartThermostat: {
    uri: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
  },
  pulseOximeter: {
    uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  },
  automatedGreenhouse: {
    uri: 'https://images.unsplash.com/photo-1534723328310-e82dad3d43d5?w=600&q=80',
  },
} as const satisfies Record<string, ProjectImage>;
