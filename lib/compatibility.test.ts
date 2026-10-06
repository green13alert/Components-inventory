import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  evaluateComponentCompatibility,
  type CapabilityFact,
  type CompatibilityComponent,
  type CompatibilityRequirement,
  type PinFact,
} from './compatibility.ts'

/**
 * Fixtures mirror the authored Blinking LED requirement and the capability
 * rows in 20261004210000_component_requirements_foundation.sql.
 * They are not loaded from Supabase, and they do not publish the project.
 */

const blinkRequirement: CompatibilityRequirement = {
  id: 'slug-11-microcontroller',
  policy: 'exact',
  canonicalComponentId: 'arduino-uno-r3',
  constraints: [
    { capability: 'function', value: 'development_board' },
    { capability: 'logic_level_v', value: '5' },
    { capability: 'gpio', value: 'digital_output' },
    { capability: 'programming_environment', value: 'arduino_ide' },
  ],
  pinRoles: [{ roleKey: 'led_output', pinFunction: 'digital_output', canonicalLabel: 'D9' }],
}

const unoCapabilities: CapabilityFact[] = [
  { capability: 'function', value: 'development_board' },
  { capability: 'logic_level_v', value: '5' },
  { capability: 'supply_v', value: '5' },
  { capability: 'gpio', value: 'digital_input' },
  { capability: 'gpio', value: 'digital_output' },
  { capability: 'gpio', value: 'pwm_output' },
  { capability: 'gpio', value: 'analog_input' },
  { capability: 'programming_environment', value: 'arduino_ide' },
  { capability: 'board_package', value: 'arduino_avr_uno' },
  { capability: 'adc_full_scale', value: '1023' },
  { capability: 'physical_form', value: 'uno_r3' },
  { capability: 'header_profile', value: 'uno_r3' },
]

const unoPins: PinFact[] = [
  { label: 'D9', pinFunction: 'digital_output' },
  { label: '5V', pinFunction: 'power' },
  { label: 'GND', pinFunction: 'ground' },
]

const uno: CompatibilityComponent = {
  componentId: 'arduino-uno-r3',
  capabilities: unoCapabilities,
  pins: unoPins,
}

const mega: CompatibilityComponent = {
  componentId: 'arduino-mega',
  capabilities: [
    { capability: 'function', value: 'development_board' },
    { capability: 'logic_level_v', value: '5' },
    { capability: 'supply_v', value: '5' },
    { capability: 'gpio', value: 'digital_input' },
    { capability: 'gpio', value: 'digital_output' },
    { capability: 'gpio', value: 'pwm_output' },
    { capability: 'gpio', value: 'analog_input' },
    { capability: 'programming_environment', value: 'arduino_ide' },
    { capability: 'board_package', value: 'arduino_avr_mega2560' },
    { capability: 'adc_full_scale', value: '1023' },
    { capability: 'physical_form', value: 'mega2560' },
    { capability: 'header_profile', value: 'mega2560' },
  ],
  pins: [],
}

const esp32: CompatibilityComponent = {
  componentId: 'esp32',
  capabilities: [
    { capability: 'function', value: 'development_board' },
    { capability: 'logic_level_v', value: '3.3' },
    { capability: 'supply_v', value: '3.3' },
    { capability: 'gpio', value: 'digital_input' },
    { capability: 'gpio', value: 'digital_output' },
    { capability: 'gpio', value: 'pwm_output' },
    { capability: 'gpio', value: 'analog_input' },
    { capability: 'programming_environment', value: 'arduino_ide' },
    { capability: 'board_package', value: 'esp32' },
    { capability: 'physical_form', value: 'esp32_devkit' },
    { capability: 'header_profile', value: 'esp32_devkit' },
  ],
  pins: [],
}

const esp8266: CompatibilityComponent = {
  componentId: 'esp8266',
  capabilities: [
    { capability: 'function', value: 'development_board' },
    { capability: 'gpio', value: 'digital_input' },
    { capability: 'gpio', value: 'digital_output' },
    { capability: 'programming_environment', value: 'arduino_ide' },
    { capability: 'board_package', value: 'esp8266' },
    { capability: 'header_profile', value: 'esp8266' },
  ],
  pins: [],
}

test('exact match: Arduino Uno R3 satisfies the exact Uno requirement', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkRequirement,
    canonical: uno,
    candidate: uno,
    review: null,
  })

  assert.equal(result.matchKind, 'exact')
  assert.equal(result.reasonCode, 'canonical_component')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.equal(result.reviewPresent, false)
  assert.equal(result.requiresChanges, false)
  assert.deepEqual(result.failedConstraints, [])
})

test('Mega against an exact Uno requirement is not supported', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkRequirement,
    canonical: uno,
    candidate: mega,
    review: null,
  })

  assert.equal(result.matchKind, 'not_supported')
  assert.equal(result.reasonCode, 'policy_exact')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.equal(result.candidateComponentId, 'arduino-mega')
  assert.deepEqual(result.failedConstraints, [])
})

test('ESP32 fails the authored 5 V logic constraint', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkRequirement,
    canonical: uno,
    candidate: esp32,
    review: null,
  })

  assert.equal(result.matchKind, 'incompatible')
  assert.equal(result.reasonCode, 'constraint_failed')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.deepEqual(result.failedConstraints, [
    {
      capability: 'logic_level_v',
      requiredValue: '5',
      actualValues: ['3.3'],
    },
  ])
})

test('a required capability that is not authored stays not supported', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkRequirement,
    canonical: uno,
    candidate: esp8266,
    review: null,
  })

  assert.equal(result.matchKind, 'not_supported')
  assert.equal(result.reasonCode, 'capability_unknown')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.ok(
    result.missingConstraints.some(
      (finding) => finding.capability === 'logic_level_v' && finding.requiredValue === '5',
    ),
  )
  assert.deepEqual(result.failedConstraints, [])
})

test('a non-canonical candidate with no substitution review is not supported', () => {
  const requirement: CompatibilityRequirement = {
    ...blinkRequirement,
    policy: 'conditional',
  }
  const unreviewed: CompatibilityComponent = {
    componentId: 'unreviewed-board',
    capabilities: unoCapabilities.map((fact) =>
      fact.capability === 'board_package' ? { ...fact, value: 'some_other_package' } : fact,
    ),
    pins: [{ label: 'D9', pinFunction: 'digital_output' }],
  }

  const result = evaluateComponentCompatibility({
    requirement,
    canonical: uno,
    candidate: unreviewed,
    review: null,
  })

  assert.equal(result.matchKind, 'not_supported')
  assert.equal(result.reasonCode, 'review_missing')
  assert.equal(result.reviewPresent, false)
  assert.equal(result.safeToPresentAsSubstitute, false)
})

test('a candidate that contradicts an authored function constraint is incompatible', () => {
  const wrongFunction: CompatibilityComponent = {
    componentId: 'positional-servo-candidate',
    capabilities: [
      { capability: 'function', value: 'positional_servo' },
      { capability: 'logic_level_v', value: '5' },
      { capability: 'gpio', value: 'digital_output' },
      { capability: 'programming_environment', value: 'arduino_ide' },
    ],
  }

  const result = evaluateComponentCompatibility({
    requirement: blinkRequirement,
    canonical: uno,
    candidate: wrongFunction,
    review: null,
  })

  assert.equal(result.matchKind, 'incompatible')
  assert.equal(result.reasonCode, 'constraint_failed')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.deepEqual(result.failedConstraints, [
    {
      capability: 'function',
      requiredValue: 'development_board',
      actualValues: ['positional_servo'],
    },
  ])
})

/**
 * Fixtures for the slug 11 series-resistor requirement in
 * 20261006150000_blink_resistor_direct_substitute.sql.
 * The generic resistor has no capability rows. The 330 ohm part is not a catalogue row.
 */

const blinkResistorRequirement: CompatibilityRequirement = {
  id: 'slug-11-series-resistor',
  policy: 'direct',
  canonicalComponentId: 'resistor',
  constraints: [
    { capability: 'function', value: 'fixed_resistor' },
    { capability: 'resistance_ohms', value: '220' },
  ],
  pinRoles: [],
  quantity: 1,
}

const genericResistor: CompatibilityComponent = {
  componentId: 'resistor',
  capabilities: [],
  quantity: 1,
}

const resistor220: CompatibilityComponent = {
  componentId: 'resistor-220',
  capabilities: [
    { capability: 'function', value: 'fixed_resistor' },
    { capability: 'resistance_ohms', value: '220' },
  ],
  quantity: 1,
}

const resistor220Review = {
  requirementId: blinkResistorRequirement.id,
  componentId: 'resistor-220',
  assessedResult: 'direct' as const,
  changes: [],
}

test('canonical generic resistor satisfies the blink resistor requirement', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkResistorRequirement,
    canonical: genericResistor,
    candidate: genericResistor,
    review: null,
  })

  assert.equal(result.matchKind, 'exact')
  assert.equal(result.reasonCode, 'canonical_component')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.equal(result.requiresChanges, false)
  assert.deepEqual(result.failedConstraints, [])
  assert.deepEqual(result.missingConstraints, [])
})

test('approved resistor-220 is a direct substitute for the blink resistor', () => {
  const result = evaluateComponentCompatibility({
    requirement: blinkResistorRequirement,
    canonical: genericResistor,
    candidate: resistor220,
    review: resistor220Review,
  })

  assert.equal(result.matchKind, 'direct_substitute')
  assert.equal(result.reasonCode, 'direct_review')
  assert.equal(result.safeToPresentAsSubstitute, true)
  assert.equal(result.requiresChanges, false)
  assert.equal(result.reviewPresent, true)
  assert.deepEqual(result.changes, [])
  assert.deepEqual(result.failedConstraints, [])
})

test('a 220 ohm resistor with no review is not supported', () => {
  const unreviewed: CompatibilityComponent = {
    componentId: 'resistor-220-unreviewed',
    capabilities: resistor220.capabilities,
    quantity: 1,
  }

  const result = evaluateComponentCompatibility({
    requirement: blinkResistorRequirement,
    canonical: genericResistor,
    candidate: unreviewed,
    review: null,
  })

  assert.equal(result.matchKind, 'not_supported')
  assert.equal(result.reasonCode, 'review_missing')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.equal(result.reviewPresent, false)
})

test('a 330 ohm resistor fixture is incompatible with the blink resistor requirement', () => {
  const resistor330: CompatibilityComponent = {
    componentId: 'resistor-330-fixture',
    capabilities: [
      { capability: 'function', value: 'fixed_resistor' },
      { capability: 'resistance_ohms', value: '330' },
    ],
    quantity: 1,
  }

  const result = evaluateComponentCompatibility({
    requirement: blinkResistorRequirement,
    canonical: genericResistor,
    candidate: resistor330,
    review: null,
  })

  assert.equal(result.matchKind, 'incompatible')
  assert.equal(result.reasonCode, 'constraint_failed')
  assert.equal(result.safeToPresentAsSubstitute, false)
  assert.deepEqual(result.failedConstraints, [
    {
      capability: 'resistance_ohms',
      requiredValue: '220',
      actualValues: ['330'],
    },
  ])
})
