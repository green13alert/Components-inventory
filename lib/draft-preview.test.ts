import assert from 'node:assert/strict'
import { test } from 'node:test'

import { draftProjectsAreRequested } from './draft-preview.ts'

test('draft project requests stay off outside development', () => {
  assert.equal(draftProjectsAreRequested(false), false)
  assert.equal(draftProjectsAreRequested(true), true)
})
