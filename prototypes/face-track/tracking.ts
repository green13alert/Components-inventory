/**
 * Browser-side steering for a single-axis face tracker.
 * The microcontroller only applies the rate. Detection stays on the computer.
 * This file is a prototype and is not part of a published walkthrough.
 */

export const FRAME_WIDTH = 320
export const DEADZONE_FRACTION = 0.08
export const MAX_DEG_PER_SEC = 40
export const PAN_MIN = 30
export const PAN_MAX = 150
export const PAN_CENTER = 90

export type FaceBox = {
  x: number
  width: number
  height: number
}

export type TrackInput = {
  faces: readonly FaceBox[]
  frameWidth: number
  tracking: boolean
  /** -1 left, 0 hold, 1 right. Used only while tracking is off. */
  manual: -1 | 0 | 1
}

/** Largest box wins. An equal area keeps the box nearer the frame centre. */
export function selectFace(faces: readonly FaceBox[], frameWidth: number): FaceBox | null {
  if (faces.length === 0) {
    return null
  }
  const mid = frameWidth / 2
  return faces.reduce((best, face) => {
    const area = face.width * face.height
    const bestArea = best.width * best.height
    if (area > bestArea) {
      return face
    }
    if (area < bestArea) {
      return best
    }
    const faceOffset = Math.abs(face.x + face.width / 2 - mid)
    const bestOffset = Math.abs(best.x + best.width / 2 - mid)
    return faceOffset < bestOffset ? face : best
  })
}

export function faceDegreesPerSecond(input: TrackInput): number {
  if (!input.tracking) {
    return input.manual * MAX_DEG_PER_SEC
  }
  const face = selectFace(input.faces, input.frameWidth)
  if (!face || input.frameWidth <= 0) {
    return 0
  }
  const offset = (face.x + face.width / 2 - input.frameWidth / 2) / input.frameWidth
  const halfDeadzone = DEADZONE_FRACTION / 2
  if (Math.abs(offset) <= halfDeadzone) {
    return 0
  }
  const span = 0.5 - halfDeadzone
  const magnitude = Math.min(1, (Math.abs(offset) - halfDeadzone) / span)
  const sign = offset > 0 ? 1 : -1
  return sign * magnitude * MAX_DEG_PER_SEC
}

export function stepPan(angle: number, degreesPerSecond: number, dtSeconds: number): number {
  const dt = Math.min(0.2, Math.max(0, dtSeconds))
  const next = angle + degreesPerSecond * dt
  if (next < PAN_MIN) {
    return PAN_MIN
  }
  if (next > PAN_MAX) {
    return PAN_MAX
  }
  return next
}
