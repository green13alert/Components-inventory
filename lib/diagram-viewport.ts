export const MIN_DIAGRAM_ZOOM = 1
export const MAX_DIAGRAM_ZOOM = 4

export type DiagramViewState = {
  scale: number
  x: number
  y: number
}

export const INITIAL_DIAGRAM_VIEW: DiagramViewState = { scale: MIN_DIAGRAM_ZOOM, x: 0, y: 0 }

export function clampNumber(value: number, min: number, max: number) {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

export function clampDiagramScale(scale: number) {
  'worklet'
  return clampNumber(scale, MIN_DIAGRAM_ZOOM, MAX_DIAGRAM_ZOOM)
}

/** Size of the diagram when it is fitted inside the viewport at zoom 1. */
export function fitContentSize(viewportWidth: number, viewportHeight: number, contentWidth: number, contentHeight: number) {
  'worklet'
  if (viewportWidth <= 0 || viewportHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
    return { width: 0, height: 0 }
  }
  const fit = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight)
  return { width: contentWidth * fit, height: contentHeight * fit }
}

export function clampDiagramTranslation(
  x: number,
  y: number,
  scale: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
) {
  'worklet'
  const fitted = fitContentSize(viewportWidth, viewportHeight, contentWidth, contentHeight)
  const maxX = Math.max(0, (fitted.width * scale - viewportWidth) / 2)
  const maxY = Math.max(0, (fitted.height * scale - viewportHeight) / 2)
  return {
    x: clampNumber(x, -maxX, maxX),
    y: clampNumber(y, -maxY, maxY),
  }
}

/**
 * Zoom around a focal point measured from the top-left of the viewport.
 * Translation is in viewport pixels and is applied after scaling about the viewport centre.
 * The content under the focal point at the start of the gesture stays under the fingers
 * as the focal point moves.
 */
export function zoomAroundFocal(input: {
  startScale: number
  startX: number
  startY: number
  scaleFactor: number
  startFocalX: number
  startFocalY: number
  focalX: number
  focalY: number
  viewportWidth: number
  viewportHeight: number
  contentWidth: number
  contentHeight: number
}): DiagramViewState {
  'worklet'
  const startScale = input.startScale === 0 ? MIN_DIAGRAM_ZOOM : input.startScale
  const scale = clampDiagramScale(startScale * input.scaleFactor)
  const ratio = scale / startScale
  const startFocalX = input.startFocalX - input.viewportWidth / 2
  const startFocalY = input.startFocalY - input.viewportHeight / 2
  const focalX = input.focalX - input.viewportWidth / 2
  const focalY = input.focalY - input.viewportHeight / 2
  const moved = clampDiagramTranslation(
    focalX - (startFocalX - input.startX) * ratio,
    focalY - (startFocalY - input.startY) * ratio,
    scale,
    input.viewportWidth,
    input.viewportHeight,
    input.contentWidth,
    input.contentHeight,
  )
  return { scale, x: moved.x, y: moved.y }
}

export function panDiagram(input: {
  startX: number
  startY: number
  translationX: number
  translationY: number
  scale: number
  viewportWidth: number
  viewportHeight: number
  contentWidth: number
  contentHeight: number
}) {
  'worklet'
  const moved = clampDiagramTranslation(
    input.startX + input.translationX,
    input.startY + input.translationY,
    input.scale,
    input.viewportWidth,
    input.viewportHeight,
    input.contentWidth,
    input.contentHeight,
  )
  return { scale: input.scale, x: moved.x, y: moved.y }
}
