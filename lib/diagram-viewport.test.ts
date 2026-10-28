import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  INITIAL_DIAGRAM_VIEW,
  MAX_DIAGRAM_ZOOM,
  MIN_DIAGRAM_ZOOM,
  diagramFitHeight,
  diagramFrameKey,
  fitContentSize,
  panDiagram,
  shouldRefitViewport,
  zoomAroundFocal,
} from './diagram-viewport.ts'

test('the minimum zoom fits a tall diagram and a wide diagram inside the viewport', () => {
  const tall = fitContentSize(320, 500, 360, 700)
  assert.ok(tall.width <= 320)
  assert.ok(tall.height <= 500)
  assert.ok(Math.abs(tall.width / tall.height - 360 / 700) < 0.001)

  const wide = fitContentSize(320, 500, 1020, 760)
  assert.ok(wide.width <= 320)
  assert.ok(wide.height <= 500)
  assert.ok(Math.abs(wide.width / wide.height - 1020 / 760) < 0.001)

  const motion = fitContentSize(390, 520, 720, 500)
  assert.ok(Math.abs(motion.width / motion.height - 720 / 500) < 0.001)
  const weather = fitContentSize(390, 520, 360, 300)
  assert.ok(Math.abs(weather.width / weather.height - 360 / 300) < 0.001)
})

test('a centred diagram stays above a bottom control bar', () => {
  const viewportHeight = 700
  const covered = 56
  const available = diagramFitHeight(viewportHeight, covered)
  const fitted = fitContentSize(390, available, 620, 900)
  const bottomMargin = (viewportHeight - fitted.height) / 2
  assert.ok(bottomMargin >= covered)
  assert.ok(fitted.width <= 390)
  assert.ok(fitted.height <= available)
})

test('zoom stays between fit and the maximum and does not jump when the gesture scale is 1', () => {
  const held = zoomAroundFocal({
    startScale: 2,
    startX: 12,
    startY: -8,
    scaleFactor: 1,
    startFocalX: 40,
    startFocalY: 80,
    focalX: 40,
    focalY: 80,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 300,
    contentHeight: 400,
  })
  assert.equal(held.scale, 2)
  assert.equal(held.x, 12)
  assert.equal(held.y, -8)

  const tooSmall = zoomAroundFocal({
    startScale: 1,
    startX: 0,
    startY: 0,
    scaleFactor: 0.2,
    startFocalX: 150,
    startFocalY: 200,
    focalX: 150,
    focalY: 200,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 300,
    contentHeight: 400,
  })
  assert.equal(tooSmall.scale, MIN_DIAGRAM_ZOOM)
  assert.deepEqual(tooSmall, INITIAL_DIAGRAM_VIEW)

  const tooLarge = zoomAroundFocal({
    startScale: 3,
    startX: 0,
    startY: 0,
    scaleFactor: 4,
    startFocalX: 150,
    startFocalY: 200,
    focalX: 150,
    focalY: 200,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 300,
    contentHeight: 400,
  })
  assert.equal(tooLarge.scale, MAX_DIAGRAM_ZOOM)
})

test('zooming around a corner keeps that corner under the focal point', () => {
  const zoomed = zoomAroundFocal({
    startScale: 1,
    startX: 0,
    startY: 0,
    scaleFactor: 2,
    startFocalX: 0,
    startFocalY: 0,
    focalX: 0,
    focalY: 0,
    viewportWidth: 200,
    viewportHeight: 200,
    contentWidth: 200,
    contentHeight: 200,
  })
  assert.equal(zoomed.scale, 2)
  assert.equal(zoomed.x, 100)
  assert.equal(zoomed.y, 100)
})

test('panning is disabled when the diagram fits and stays inside the viewport when zoomed', () => {
  const fitted = panDiagram({
    startX: 0,
    startY: 0,
    translationX: 80,
    translationY: 80,
    scale: 1,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 360,
    contentHeight: 700,
  })
  assert.deepEqual(fitted, INITIAL_DIAGRAM_VIEW)

  const zoomed = panDiagram({
    startX: 0,
    startY: 0,
    translationX: 1000,
    translationY: -1000,
    scale: 2,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 300,
    contentHeight: 400,
  })
  assert.equal(zoomed.x, 150)
  assert.equal(zoomed.y, -200)
})

test('a moving pinch keeps the original point under the fingers', () => {
  const zoomed = zoomAroundFocal({
    startScale: 1,
    startX: 0,
    startY: 0,
    scaleFactor: 2,
    startFocalX: 50,
    startFocalY: 50,
    focalX: 80,
    focalY: 50,
    viewportWidth: 200,
    viewportHeight: 200,
    contentWidth: 200,
    contentHeight: 200,
  })
  assert.equal(zoomed.scale, 2)
  assert.equal(zoomed.x, 80)
  assert.equal(zoomed.y, 50)
})

test('switching diagram mode starts from the fitted view', () => {
  assert.deepEqual(INITIAL_DIAGRAM_VIEW, { scale: 1, x: 0, y: 0 })
})

test('a connection selection does not change the fitted frame or a zoomed view', () => {
  assert.equal(diagramFrameKey('physical', 640, 900), 'physical:640:900')
  assert.equal(diagramFrameKey('physical', 640, 900) === diagramFrameKey('schematic', 640, 900), false)
  assert.equal(shouldRefitViewport(390, 700, 700, true, 2), false)
  const held = panDiagram({
    startX: 40,
    startY: -20,
    translationX: 0,
    translationY: 0,
    scale: 2,
    viewportWidth: 300,
    viewportHeight: 400,
    contentWidth: 300,
    contentHeight: 400,
  })
  assert.equal(held.x, 40)
  assert.equal(held.y, -20)
})
