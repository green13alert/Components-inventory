/** Relative joystick aiming. Deflection sets degrees per second. A centred stick holds the angle. */

export const JOYSTICK_ADC_MAX = 1023
export const JOYSTICK_MAX_DEG_PER_SEC = 90
export const JOYSTICK_MAX_DT_SECONDS = 0.2

export type AxisLimits = {
  min: number
  max: number
  center: number
}

export type AimState = {
  pan: number
  tilt: number
}

export type JoystickFrameInput = {
  x: number
  y: number
  switchClosed: boolean
  xCenter: number
  yCenter: number
  deadzone: number
  invertX: boolean
  invertY: boolean
  dtSeconds: number
  pan: AxisLimits
  tilt: AxisLimits
}

export function axisDegreesPerSecond(
  raw: number,
  center: number,
  deadzone: number,
  invert: boolean,
  maxDegreesPerSecond = JOYSTICK_MAX_DEG_PER_SEC,
  adcMax = JOYSTICK_ADC_MAX,
): number {
  let delta = raw - center
  if (invert) {
    delta = -delta
  }
  if (Math.abs(delta) <= deadzone) {
    return 0
  }
  let span = delta > 0 ? adcMax - center - deadzone : center - deadzone
  if (span < 1) {
    span = 1
  }
  let magnitude = (Math.abs(delta) - deadzone) / span
  if (magnitude > 1) {
    magnitude = 1
  }
  const sign = delta > 0 ? 1 : -1
  return sign * magnitude * maxDegreesPerSecond
}

export function stepAngle(
  angle: number,
  degreesPerSecond: number,
  dtSeconds: number,
  min: number,
  max: number,
): number {
  let dt = dtSeconds
  if (dt < 0) {
    dt = 0
  }
  if (dt > JOYSTICK_MAX_DT_SECONDS) {
    dt = JOYSTICK_MAX_DT_SECONDS
  }
  const next = angle + degreesPerSecond * dt
  if (next < min) {
    return min
  }
  if (next > max) {
    return max
  }
  return next
}

export function applyJoystickFrame(state: AimState, input: JoystickFrameInput): AimState {
  if (input.switchClosed) {
    return { pan: input.pan.center, tilt: input.tilt.center }
  }
  return {
    pan: stepAngle(
      state.pan,
      axisDegreesPerSecond(input.x, input.xCenter, input.deadzone, input.invertX),
      input.dtSeconds,
      input.pan.min,
      input.pan.max,
    ),
    tilt: stepAngle(
      state.tilt,
      axisDegreesPerSecond(input.y, input.yCenter, input.deadzone, input.invertY),
      input.dtSeconds,
      input.tilt.min,
      input.tilt.max,
    ),
  }
}
