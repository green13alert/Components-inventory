/**
 * Keep a marker on screen when content above it changes height.
 * Expansion below the marker does not move it, so the adjustment is zero.
 * A user drag is never corrected.
 */
export function scrollAnchorDelta(previousScreenY: number | null, nextScreenY: number, userIsDragging: boolean): number {
  if (previousScreenY == null || userIsDragging || !Number.isFinite(nextScreenY)) {
    return 0
  }
  const delta = nextScreenY - previousScreenY
  if (Math.abs(delta) < 0.5) {
    return 0
  }
  return delta
}
