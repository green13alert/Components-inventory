import assert from 'node:assert/strict'
import { test } from 'node:test'

import { diagramChromeFit, shouldRefitViewport } from './diagram-viewport.ts'
import { panelTransition, toggleDiagramPanel, type DiagramPanel } from './diagram-panel.ts'

test('components and connections cannot be open together', () => {
  let panel: DiagramPanel = 'none'
  assert.equal(panel, 'none')
  panel = toggleDiagramPanel(panel, 'components')
  assert.equal(panel, 'components')
  panel = toggleDiagramPanel(panel, 'components')
  assert.equal(panel, 'none')
  panel = toggleDiagramPanel(panel, 'components')
  panel = toggleDiagramPanel(panel, 'connections')
  assert.equal(panel, 'connections')
  panel = toggleDiagramPanel(panel, 'connections')
  assert.equal(panel, 'none')
  panel = toggleDiagramPanel(panel, 'connections')
  panel = toggleDiagramPanel(panel, 'components')
  assert.equal(panel, 'components')
})

test('opening or switching a panel keeps the current zoom and pan', () => {
  const zoomed = { scale: 2.4, x: 18, y: -36 }
  const components = panelTransition(zoomed, 'none', 'components')
  assert.equal(components.panel, 'components')
  assert.deepEqual(components.transform, zoomed)
  const connections = panelTransition(components.transform, components.panel, 'connections')
  assert.equal(connections.panel, 'connections')
  assert.deepEqual(connections.transform, zoomed)
  const closed = panelTransition(connections.transform, connections.panel, 'connections')
  assert.equal(closed.panel, 'none')
  assert.deepEqual(closed.transform, zoomed)
})

test('panel and selection layouts do not replace a zoomed viewport', () => {
  assert.equal(shouldRefitViewport(390, 700, 0, false, 1), true)
  assert.equal(shouldRefitViewport(390, 700, 700, true, 1), false)
  assert.equal(shouldRefitViewport(390, 640, 700, true, 1), false)
  assert.equal(shouldRefitViewport(390, 760, 700, true, 2.4), false)
  assert.equal(shouldRefitViewport(390, 760, 700, true, 1), true)
})

test('an expanded list is not part of the fitted diagram size', () => {
  const fitted = diagramChromeFit(390, 844, 642, 928, 52)
  const again = diagramChromeFit(390, 844, 642, 928, 52)
  assert.deepEqual(again, fitted)
  const listIncluded = diagramChromeFit(390, 844, 642, 928, 52 + 220)
  assert.ok(listIncluded.height < fitted.height * 0.8)
})
