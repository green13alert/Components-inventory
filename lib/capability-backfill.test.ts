import assert from 'node:assert/strict'
import { test } from 'node:test'

import { COMPONENT_CATALOGUE } from '../constants/component-catalogue.ts'
import { evaluateComponentCompatibility } from './compatibility.ts'
import {
  CAPABILITY_BACKFILL,
  REQUIREMENT_CONSTRAINT_BACKFILL,
  capabilityBackfillSql,
  rowsJoinedToCatalogue,
} from './capability-backfill.ts'

const catalogueIds = new Set(COMPONENT_CATALOGUE.map((entry) => entry.id))

function facts(slug: string) {
  return CAPABILITY_BACKFILL.filter((row) => row.slug === slug).map((row) => ({
    capability: row.capability,
    value: row.value,
  }))
}

function requirement(projectSlug: string, componentSlug: string) {
  return {
    id: `${projectSlug}-${componentSlug}`,
    policy: 'exact' as const,
    canonicalComponentId: componentSlug,
    constraints: REQUIREMENT_CONSTRAINT_BACKFILL.filter(
      (row) => row.projectSlug === projectSlug && row.componentSlug === componentSlug,
    ).map((row) => ({ capability: row.capability, value: row.value })),
    pinRoles: [],
  }
}

function candidate(componentId: string, capabilities: { capability: string; value: string }[]) {
  return { componentId, capabilities, pins: [] }
}

test('a capability insert that joins a missing slug stores nothing', () => {
  assert.equal(rowsJoinedToCatalogue([{ slug: 'undefined' }], catalogueIds).length, 0)
  assert.equal(rowsJoinedToCatalogue(CAPABILITY_BACKFILL, catalogueIds).length, CAPABILITY_BACKFILL.length)
  assert.equal(
    rowsJoinedToCatalogue(
      REQUIREMENT_CONSTRAINT_BACKFILL.map((row) => ({ componentSlug: row.componentSlug })),
      catalogueIds,
    ).length,
    REQUIREMENT_CONSTRAINT_BACKFILL.length,
  )
  const sql = capabilityBackfillSql()
  assert.equal(sql.includes("'undefined'"), false)
  assert.equal(sql.includes('join public.components as component on component.slug = spec.slug'), true)
  assert.equal(sql.includes('join public.components as component on component.slug = spec.component_slug'), true)
})

test('the exact required part matches and a contradictory part does not', () => {
  const board = requirement('23', 'esp32-devkitc-v4')
  const exact = evaluateComponentCompatibility({
    requirement: board,
    canonical: candidate('esp32-devkitc-v4', facts('esp32-devkitc-v4')),
    candidate: candidate('esp32-devkitc-v4', facts('esp32-devkitc-v4')),
    review: null,
  })
  assert.equal(exact.matchKind, 'exact')

  const genericEsp32 = evaluateComponentCompatibility({
    requirement: board,
    canonical: candidate('esp32-devkitc-v4', facts('esp32-devkitc-v4')),
    candidate: candidate('esp32', [
      { capability: 'function', value: 'development_board' },
      { capability: 'logic_level_v', value: '3.3' },
      { capability: 'board_package', value: 'esp32' },
      { capability: 'physical_form', value: 'esp32_devkit' },
      { capability: 'header_profile', value: 'esp32_devkit' },
    ]),
    review: null,
  })
  assert.equal(genericEsp32.matchKind, 'incompatible')
  assert.equal(genericEsp32.reasonCode, 'constraint_failed')

  const cathode = evaluateComponentCompatibility({
    requirement: requirement('24', 'rgb-led-ca'),
    canonical: candidate('rgb-led-ca', facts('rgb-led-ca')),
    candidate: candidate('rgb-led-cc', facts('rgb-led-cc')),
    review: null,
  })
  assert.equal(cathode.matchKind, 'incompatible')

  const otherPinout = evaluateComponentCompatibility({
    requirement: requirement('24', 'pn2222a'),
    canonical: candidate('pn2222a', facts('pn2222a')),
    candidate: candidate('other-transistor', [
      { capability: 'function', value: 'npn_transistor' },
      { capability: 'physical_form', value: 'to-92' },
      { capability: 'physical_form', value: 'cbe' },
    ]),
    review: null,
  })
  assert.equal(otherPinout.matchKind, 'incompatible')

  const piezo = evaluateComponentCompatibility({
    requirement: requirement('8', 'buzzer'),
    canonical: candidate('buzzer', facts('buzzer')),
    candidate: candidate('passive-piezo', [
      { capability: 'function', value: 'buzzer' },
      { capability: 'physical_form', value: 'two_pin_element' },
    ]),
    review: null,
  })
  assert.equal(piezo.matchKind, 'incompatible')

  const continuous = evaluateComponentCompatibility({
    requirement: requirement('18', 'sg90'),
    canonical: candidate('sg90', facts('sg90')),
    candidate: candidate('continuous-servo', [
      { capability: 'function', value: 'servo' },
      { capability: 'servo_kind', value: 'continuous' },
    ]),
    review: null,
  })
  assert.equal(continuous.matchKind, 'incompatible')

  const wrongResistor = evaluateComponentCompatibility({
    requirement: requirement('24', 'resistor-220'),
    canonical: candidate('resistor-220', facts('resistor-220')),
    candidate: candidate('resistor-1k', facts('resistor-1k')),
    review: null,
  })
  assert.equal(wrongResistor.matchKind, 'incompatible')

  const nineVolt = evaluateComponentCompatibility({
    requirement: requirement('18', 'gst18a05-p1j'),
    canonical: candidate('gst18a05-p1j', facts('gst18a05-p1j')),
    candidate: candidate('nine-volt', [
      { capability: 'function', value: 'power_supply' },
      { capability: 'supply_v', value: '9' },
    ]),
    review: null,
  })
  assert.equal(nineVolt.matchKind, 'incompatible')

  const maleCable = evaluateComponentCompatibility({
    requirement: requirement('23', 'stemma-qt-female'),
    canonical: candidate('stemma-qt-female', facts('stemma-qt-female')),
    candidate: candidate('stemma-qt-cable', facts('stemma-qt-cable')),
    review: null,
  })
  assert.equal(maleCable.matchKind, 'incompatible')
})
