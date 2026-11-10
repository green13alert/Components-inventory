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

/**
 * An explanation opening above a diagram moves the marker, but the page
 * should stay where the user left it. Holding accepts the new marker position
 * without scrolling. A later panel change is measured from that position.
 */
export function anchoredMarkerUpdate(input: {
  previousScreenY: number | null
  nextScreenY: number
  userIsDragging: boolean
  holdPosition: boolean
}): { delta: number; expectedScreenY: number } {
  if (input.holdPosition || !Number.isFinite(input.nextScreenY)) {
    return { delta: 0, expectedScreenY: input.nextScreenY }
  }
  const delta = scrollAnchorDelta(input.previousScreenY, input.nextScreenY, input.userIsDragging)
  if (delta === 0) {
    return { delta: 0, expectedScreenY: input.nextScreenY }
  }
  return { delta, expectedScreenY: input.nextScreenY - delta }
}
