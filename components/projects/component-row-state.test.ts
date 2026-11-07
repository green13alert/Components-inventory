import assert from 'node:assert/strict'
import { test } from 'node:test'

import { matchProjectInventory } from '../../lib/compatibility.ts'
import { componentRowPresentation, requirementQuantityLabel, substituteNameFromInventory } from './component-row-state.ts'

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

test('requirement quantities use the allocated shortfall, not the whole stock pile', () => {
  assert.equal(
    requirementQuantityLabel({ requiredQuantity: 1, missingQuantity: 0, coverage: 'exact' }),
    '1/1 owned',
  )
  assert.equal(
    requirementQuantityLabel({ requiredQuantity: 10, missingQuantity: 4, coverage: 'none' }),
    '6/10 owned — 4 more needed',
  )
  assert.equal(
    requirementQuantityLabel({ requiredQuantity: 1, missingQuantity: 1, coverage: 'none' }),
    '0/1 owned — 1 more needed',
  )
  assert.equal(
    requirementQuantityLabel({ requiredQuantity: 1, missingQuantity: 0, coverage: 'direct_substitute' }),
    '1/1 owned',
  )

  const shared = matchProjectInventory(
    [
      { id: 'first', componentId: 'led', slug: 'led', name: 'LED', description: null, quantity: 1, sortOrder: 1 },
      { id: 'second', componentId: 'led', slug: 'led', name: 'LED', description: null, quantity: 1, sortOrder: 2 },
    ],
    [{ componentId: 'led', quantity: 1 }],
    null,
  )
  assert.equal(shared.lines[0]?.ownedQuantity, 1)
  assert.equal(shared.lines[1]?.ownedQuantity, 1)
  assert.equal(shared.lines[0]?.missingQuantity, 0)
  assert.equal(shared.lines[1]?.missingQuantity, 1)
  assert.equal(
    requirementQuantityLabel({
      requiredQuantity: shared.lines[0]!.requiredQuantity,
      missingQuantity: shared.lines[0]!.missingQuantity,
      coverage: shared.lines[0]!.coverage,
    }),
    '1/1 owned',
  )
  assert.equal(
    requirementQuantityLabel({
      requiredQuantity: shared.lines[1]!.requiredQuantity,
      missingQuantity: shared.lines[1]!.missingQuantity,
      coverage: shared.lines[1]!.coverage,
    }),
    '0/1 owned — 1 more needed',
  )
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
