import assert from 'node:assert/strict'
import { test } from 'node:test'

import { shownInProjectCatalogue, shownInRecommendations } from './catalogue-visibility.ts'

test('project 18 stays out of recommendations and a fresh catalogue', () => {
  assert.equal(shownInRecommendations('18'), false)
  assert.equal(shownInRecommendations('8'), true)
  assert.equal(shownInRecommendations('25'), true)
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'not_started', isFavourite: false }), false)
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'in_progress', isFavourite: false }), true)
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'completed', isFavourite: false }), true)
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'not_started', isFavourite: true }), true)
  assert.equal(shownInProjectCatalogue({ slug: '8', status: 'not_started', isFavourite: false }), true)
  assert.equal(shownInProjectCatalogue({ slug: '23', status: 'not_started', isFavourite: false }), true)
  assert.equal(shownInProjectCatalogue({ slug: '24', status: 'not_started', isFavourite: false }), true)
})
