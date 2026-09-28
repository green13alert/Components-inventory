import { MOTION_SENSOR_ALARM_LAYOUT } from './layouts/motion-sensor-alarm';
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from './layouts/servo-pan-tilt-camera';
import type { WiringLayout } from './types';

export type { WiringElementDef, WiringLayout, WiringPortDef, WiringRailDomain, WiringSymbolKind } from './types';

const LAYOUTS: Record<string, WiringLayout> = {
  [MOTION_SENSOR_ALARM_LAYOUT.slug]: MOTION_SENSOR_ALARM_LAYOUT,
  [SERVO_PAN_TILT_CAMERA_LAYOUT.slug]: SERVO_PAN_TILT_CAMERA_LAYOUT,
};

export function getWiringLayout(slug: string | undefined): WiringLayout | null {
  if (!slug) {
    return null;
  }
  return LAYOUTS[slug] ?? null;
}
