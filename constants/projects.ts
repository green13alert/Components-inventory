import type { ImageSource } from 'expo-image';

export type ProjectImage = ImageSource;

/** Bundled 16:9 catalogue photos generated for Solderi (reusable in-app assets). */
export const PROJECT_IMAGES = {
  smartPlantMonitor: require('../assets/images/projects/project-smart-plant-monitor.jpg'),
  ledMatrix: require('../assets/images/projects/project-led-matrix.jpg'),
  bluetoothRcCar: require('../assets/images/projects/project-bluetooth-rc-car.jpg'),
  weatherStation: require('../assets/images/projects/project-weather-station.jpg'),
  homeAutomation: require('../assets/images/projects/project-home-automation.jpg'),
  lineFollowingRobot: require('../assets/images/projects/project-line-following-robot.jpg'),
  doorLock: require('../assets/images/projects/project-door-lock.jpg'),
  motionSensor: require('../assets/images/projects/project-motion-sensor.jpg'),
  smartThermostat: require('../assets/images/projects/project-smart-thermostat.jpg'),
  pulseOximeter: require('../assets/images/projects/project-pulse-oximeter.jpg'),
  automatedGreenhouse: require('../assets/images/projects/project-automated-greenhouse.jpg'),
  trafficLight: require('../assets/images/projects/project-traffic-light.jpg'),
  pianoBuzzer: require('../assets/images/projects/project-piano-buzzer.jpg'),
  nightLamp: require('../assets/images/projects/project-night-lamp.jpg'),
  obstacleRobot: require('../assets/images/projects/project-obstacle-robot.jpg'),
  rfidLogger: require('../assets/images/projects/project-rfid-logger.jpg'),
  servoCamera: require('../assets/images/projects/project-servo-camera.jpg'),
  droneController: require('../assets/images/projects/project-drone-controller.jpg'),
  cncPlotter: require('../assets/images/projects/project-cnc-plotter.jpg'),
  voiceAssistant: require('../assets/images/projects/project-voice-assistant.jpg'),
  solarTracker: require('../assets/images/projects/project-solar-tracker.jpg'),
  blinkLed: require('../assets/images/projects/project-blink-led.jpg'),
} as const satisfies Record<string, ProjectImage>;
