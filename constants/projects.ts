export type ProjectImage = {
  uri: string;
};

export const PROJECT_IMAGES = {
  smartPlantMonitor: {
    uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
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
  trafficLight: {
    uri: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&q=80',
  },
  pianoBuzzer: {
    uri: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
  },
  nightLamp: {
    uri: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80',
  },
  obstacleRobot: {
    uri: 'https://images.unsplash.com/photo-1531746790731-2484f39b66d5?w=600&q=80',
  },
  rfidLogger: {
    uri: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
  },
  servoCamera: {
    uri: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80',
  },
  droneController: {
    uri: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80',
  },
  cncPlotter: {
    uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
  },
  voiceAssistant: {
    uri: 'https://images.unsplash.com/photo-1589254066216-a83caea8e213?w=600&q=80',
  },
  solarTracker: {
    uri: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
  },
  blinkLed: {
    uri: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80',
  },
} as const satisfies Record<string, ProjectImage>;
