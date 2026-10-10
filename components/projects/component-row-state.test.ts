import assert from 'node:assert/strict'
import { test } from 'node:test'

import { componentRowPresentation, substituteNameFromInventory } from './component-row-state.ts'

test('canonical stock displays as Owned', () => {
  const presentation = componentRowPresentation({
    coverage: 'exact',
    isOwned: true,
    substituteName: '220 Ω resistor',
  })

  assert.equal(presentation.status, 'owned')
  assert.equal(presentation.badge, 'Owned')
  assert.equal(presentation.substituteLine, null)
})

test('an approved direct substitute shows its catalogue name and is not Owned', () => {
  const name = substituteNameFromInventory(
    'component-uuid',
    [{ componentId: 'component-uuid', catalogueId: 'resistor-220', name: '220 Ω resistor' }],
    (catalogueId) => (catalogueId === 'resistor-220' ? '220 Ω resistor' : undefined),
  )
  const presentation = componentRowPresentation({
    coverage: 'direct_substitute',
    isOwned: true,
    substituteName: name,
  })

  assert.equal(name, '220 Ω resistor')
  assert.equal(presentation.status, 'covered')
  assert.equal(presentation.badge, 'Covered')
  assert.equal(presentation.substituteLine, 'Covered by 220 Ω resistor')
})

test('an uncovered requirement displays as missing', () => {
  const presentation = componentRowPresentation({
    coverage: 'none',
    isOwned: false,
    substituteName: null,
  })

  assert.equal(presentation.status, 'missing')
  assert.equal(presentation.badge, 'Missing')
  assert.equal(presentation.substituteLine, null)
})
