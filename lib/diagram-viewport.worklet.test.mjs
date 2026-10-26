import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { diagramChromeFit, panDiagram, zoomAroundFocal } from './diagram-viewport.ts'

const require = createRequire(import.meta.url)

test('the Expo worklet transform can fit, zoom, and pan the enlarged diagram', () => {
  const babel = require('@babel/core')
  const source = fileURLToPath(new URL('./diagram-viewport.ts', import.meta.url))
  const transformed = babel.transformFileSync(source, {
    babelrc: false,
    configFile: false,
    sourceType: 'unambiguous',
    presets: [[require.resolve('babel-preset-expo'), { native: { unstable_transformProfile: 'hermes-stable' } }]],
  })
  const directory = mkdtempSync(path.join(tmpdir(), 'diagram-viewport-'))
  const compiledPath = path.join(directory, 'diagram-viewport.cjs')
  writeFileSync(compiledPath, transformed.code)
  try {
    const compiled = require(compiledPath)
    const input = [390, 844, 642, 928, 52]
    assert.deepEqual(compiled.diagramChromeFit(...input), diagramChromeFit(...input))
    const gesture = {
      startScale: 1,
      startX: 0,
      startY: 0,
      scaleFactor: 2,
      startFocalX: 100,
      startFocalY: 100,
      focalX: 120,
      focalY: 80,
      viewportWidth: 390,
      viewportHeight: 700,
      contentWidth: 642,
      contentHeight: 928,
    }
    const zoomed = compiled.zoomAroundFocal(gesture)
    assert.deepEqual(zoomed, zoomAroundFocal(gesture))
    assert.ok(zoomed.scale > 1)
    const panInput = {
      startX: zoomed.x,
      startY: zoomed.y,
      translationX: 12,
      translationY: -8,
      scale: zoomed.scale,
      viewportWidth: 390,
      viewportHeight: 700,
      contentWidth: 642,
      contentHeight: 928,
    }
    assert.deepEqual(compiled.panDiagram(panInput), panDiagram(panInput))
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
