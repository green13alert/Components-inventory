import assert from 'node:assert/strict'
import { test } from 'node:test'

import { COMPONENT_CATALOGUE } from './component-catalogue.ts'
import {
  COMPONENT_ILLUSTRATION_IDS,
  resolveComponentIllustration,
  type ComponentIllustrationId,
} from './component-illustrations.ts'

const KNOWN = new Set<string>(COMPONENT_ILLUSTRATION_IDS)

function resolved(id: string): ComponentIllustrationId {
  return resolveComponentIllustration({ id, name: COMPONENT_CATALOGUE.find((entry) => entry.id === id)?.name })
}

test('every catalogue component resolves to a known illustration', () => {
  assert.equal(COMPONENT_CATALOGUE.length, 60)
  for (const entry of COMPONENT_CATALOGUE) {
    assert.equal(KNOWN.has(entry.image), true, entry.id)
    assert.equal(resolved(entry.id), entry.image)
    assert.equal(resolveComponentIllustration({ id: entry.image }), entry.image)
  }
})

test('resistor values share the resistor illustration', () => {
  for (const id of ['resistor', 'resistor-220', 'resistor-100', 'resistor-10k', 'resistor-100k']) {
    assert.equal(resolved(id), 'resistor')
  }
})

test('new passives are not drawn as development boards or as a resistor', () => {
  assert.equal(resolved('capacitor-100nf'), 'ceramic-capacitor')
  assert.equal(resolved('capacitor-10uf'), 'electrolytic-capacitor')
  assert.equal(resolved('capacitor-100uf'), 'electrolytic-capacitor')
  assert.equal(resolved('button-tactile'), 'tactile-button')
  assert.equal(resolved('potentiometer-10k'), 'potentiometer')
  assert.equal(resolved('potentiometer-10k') === 'resistor', false)
  for (const id of ['capacitor-100nf', 'capacitor-10uf', 'button-tactile', 'potentiometer-10k']) {
    assert.equal(resolved(id) === 'generic-board', false)
    assert.equal(resolved(id) === 'generic-module', false)
  }
})

test('boards are distinguished by family', () => {
  assert.equal(resolved('esp32'), 'esp32')
  assert.equal(resolved('esp32-cam'), 'esp32-cam')
  assert.equal(resolved('esp32-cam') === resolved('esp32'), false)
  assert.equal(resolved('raspberry-pi-pico'), 'raspberry-pi-pico')
  assert.equal(resolved('raspberry-pi-pico-w'), 'raspberry-pi-pico')
  assert.equal(resolved('raspberry-pi-4'), 'raspberry-pi')
  assert.equal(resolved('raspberry-pi-5'), 'raspberry-pi')
  assert.equal(resolved('raspberry-pi-4') === resolved('raspberry-pi-pico'), false)
  assert.equal(resolved('arduino-uno-r3'), 'arduino-uno')
  assert.equal(resolveComponentIllustration({ id: 'arduino-uno' }), 'arduino-uno')
})

test('an unknown illustration id falls back to the generic module', () => {
  assert.equal(resolveComponentIllustration({ id: 'not-a-component', name: 'Mystery part' }), 'generic-module')
})
