import { COMPONENT_CATALOGUE } from '../constants/component-catalogue.ts'
import { ESP32_BLE_RGB_FIRMWARE } from '../constants/firmware/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_FIRMWARE } from '../constants/firmware/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from '../constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from '../constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import {
  MOTION_SENSOR_ALARM_COMPONENTS,
  MOTION_SENSOR_ALARM_CONNECTIONS,
  MOTION_SENSOR_ALARM_FIRMWARE,
  MOTION_SENSOR_ALARM_STEPS,
} from '../constants/walkthroughs/motion-sensor-alarm.ts'
import {
  SERVO_PAN_TILT_CAMERA_COMPONENTS,
  SERVO_PAN_TILT_CAMERA_CONNECTIONS,
  SERVO_PAN_TILT_CAMERA_FIRMWARE,
  SERVO_PAN_TILT_CAMERA_STEPS,
} from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import {
  ESP32_BLE_RGB_BOM,
  ESP32_BLE_RGB_CONNECTIONS,
  ESP32_BLE_RGB_PROJECT,
  ESP32_BLE_RGB_STEPS,
} from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import {
  ESP32_WIFI_WEATHER_BOM,
  ESP32_WIFI_WEATHER_CONNECTIONS,
  ESP32_WIFI_WEATHER_PROJECT,
  ESP32_WIFI_WEATHER_STEPS,
} from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { projectCoverIsPending } from './project-navigation.ts'
import type { AuthoredProjectInput } from './project-authoring.ts'

function catalogueIds(): Set<string> {
  return new Set(COMPONENT_CATALOGUE.map((entry) => entry.id))
}

export function localAuthoredProjects(): AuthoredProjectInput[] {
  const ids = catalogueIds()
  const weatherLayout = ESP32_WIFI_WEATHER_LAYOUT
  const motionLayout = MOTION_SENSOR_ALARM_LAYOUT
  const servoLayout = SERVO_PAN_TILT_CAMERA_LAYOUT

  return [
    {
      slug: '8',
      title: 'Motion Sensor Alarm',
      isPublished: true,
      learningObjectives: [],
      coverPending: projectCoverIsPending('motionSensor'),
      bom: MOTION_SENSOR_ALARM_COMPONENTS.map((item) => ({ slug: item.id, quantity: item.quantity })),
      catalogueIds: ids,
      steps: MOTION_SENSOR_ALARM_STEPS,
      connections: MOTION_SENSOR_ALARM_CONNECTIONS,
      layout: motionLayout,
      firmware: MOTION_SENSOR_ALARM_FIRMWARE,
      requirements: MOTION_SENSOR_ALARM_COMPONENTS.map(() => ({
        policy: 'exact' as const,
        approvedReviewIds: [],
      })),
      codeStyle: 'growing-sketches',
      compilation: 'passed',
      hardwareTested: false,
    },
    {
      slug: '18',
      title: 'Servo Pan-Tilt Camera',
      isPublished: true,
      learningObjectives: [],
      coverPending: projectCoverIsPending('servoCamera'),
      bom: SERVO_PAN_TILT_CAMERA_COMPONENTS.map((item) => ({ slug: item.id, quantity: item.quantity })),
      catalogueIds: ids,
      steps: SERVO_PAN_TILT_CAMERA_STEPS,
      connections: SERVO_PAN_TILT_CAMERA_CONNECTIONS,
      layout: servoLayout,
      firmware: SERVO_PAN_TILT_CAMERA_FIRMWARE,
      requirements: SERVO_PAN_TILT_CAMERA_COMPONENTS.map(() => ({
        policy: 'exact' as const,
        approvedReviewIds: [],
      })),
      codeStyle: 'growing-sketches',
      compilation: 'passed',
      hardwareTested: false,
    },
    {
      slug: ESP32_WIFI_WEATHER_PROJECT.slug,
      title: ESP32_WIFI_WEATHER_PROJECT.title,
      isPublished: ESP32_WIFI_WEATHER_PROJECT.isPublished,
      learningObjectives: ESP32_WIFI_WEATHER_PROJECT.learningObjectives,
      coverPending: projectCoverIsPending(ESP32_WIFI_WEATHER_PROJECT.imageKey),
      bom: ESP32_WIFI_WEATHER_BOM.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      catalogueIds: ids,
      steps: ESP32_WIFI_WEATHER_STEPS,
      connections: ESP32_WIFI_WEATHER_CONNECTIONS,
      layout: weatherLayout,
      firmware: ESP32_WIFI_WEATHER_FIRMWARE,
      requirements: ESP32_WIFI_WEATHER_BOM.map(() => ({
        policy: 'exact' as const,
        approvedReviewIds: [],
      })),
      codeStyle: 'single-program',
      compilation: 'passed',
      hardwareTested: false,
    },
    {
      slug: ESP32_BLE_RGB_PROJECT.slug,
      title: ESP32_BLE_RGB_PROJECT.title,
      isPublished: ESP32_BLE_RGB_PROJECT.isPublished,
      learningObjectives: ESP32_BLE_RGB_PROJECT.learningObjectives,
      coverPending: projectCoverIsPending(ESP32_BLE_RGB_PROJECT.imageKey),
      bom: ESP32_BLE_RGB_BOM.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      catalogueIds: ids,
      steps: ESP32_BLE_RGB_STEPS,
      connections: ESP32_BLE_RGB_CONNECTIONS,
      layout: ESP32_BLE_RGB_LAYOUT,
      firmware: ESP32_BLE_RGB_FIRMWARE,
      requirements: ESP32_BLE_RGB_BOM.map(() => ({
        policy: 'exact' as const,
        approvedReviewIds: [],
      })),
      codeStyle: 'single-program',
      compilation: 'passed',
      hardwareTested: false,
    },
  ]
}
