import { ESP32_BLE_RGB_LAYOUT } from './layouts/esp32-ble-rgb-controller';
import { ESP32_WIFI_WEATHER_LAYOUT } from './layouts/esp32-wifi-weather-station';
import { LED_MATRIX_MAZE_LAYOUT } from './layouts/led-matrix-maze';
import { MOTION_SENSOR_ALARM_LAYOUT } from './layouts/motion-sensor-alarm';
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from './layouts/servo-pan-tilt-camera';
import type { WiringLayout } from './types';

export type { WiringElementDef, WiringLayout, WiringPortDef, WiringRailDomain, WiringSymbolKind } from './types';

const LAYOUTS: Record<string, WiringLayout> = {
  [ESP32_BLE_RGB_LAYOUT.slug]: ESP32_BLE_RGB_LAYOUT,
  [ESP32_WIFI_WEATHER_LAYOUT.slug]: ESP32_WIFI_WEATHER_LAYOUT,
  [LED_MATRIX_MAZE_LAYOUT.slug]: LED_MATRIX_MAZE_LAYOUT,
  [MOTION_SENSOR_ALARM_LAYOUT.slug]: MOTION_SENSOR_ALARM_LAYOUT,
  [SERVO_PAN_TILT_CAMERA_LAYOUT.slug]: SERVO_PAN_TILT_CAMERA_LAYOUT,
};

export function getWiringLayout(slug: string | undefined): WiringLayout | null {
  if (!slug) {
    return null;
  }
  return LAYOUTS[slug] ?? null;
}
