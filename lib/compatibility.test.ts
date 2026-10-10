import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  emptyProjectCompatibility,
  evaluateComponentCompatibility,
  matchProjectInventory,
  type CapabilityFact,
  type CompatibilityComponent,
  type CompatibilityRequirement,
  type MatchableBomLine,
  type PinFact,
  type ProjectCompatibilityData,
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

const resistorLine: MatchableBomLine = {
  id: 'bom-resistor',
  componentId: 'resistor',
  slug: 'resistor',
  name: 'Resistor',
  description: null,
  quantity: 1,
  sortOrder: 3,
}

const ledLine: MatchableBomLine = {
  id: 'bom-led',
  componentId: 'led',
  slug: 'led',
  name: 'LED',
  description: null,
  quantity: 1,
  sortOrder: 2,
}

const fixedResistorCapabilities: CapabilityFact[] = [
  { capability: 'function', value: 'fixed_resistor' },
  { capability: 'resistance_ohms', value: '220' },
]

function blinkBuildability(options?: {
  reviews?: ProjectCompatibilityData['reviews']
  extraComponents?: CompatibilityComponent[]
  secondRequirement?: CompatibilityRequirement
  secondLineId?: string
}): ProjectCompatibilityData {
  const componentsById = new Map<string, CompatibilityComponent>([
    ['resistor', { componentId: 'resistor', capabilities: [] }],
    ['resistor-220', { componentId: 'resistor-220', capabilities: fixedResistorCapabilities }],
    ['resistor-220-unreviewed', { componentId: 'resistor-220-unreviewed', capabilities: fixedResistorCapabilities }],
    [
      'resistor-330-fixture',
      {
        componentId: 'resistor-330-fixture',
        capabilities: [
          { capability: 'function', value: 'fixed_resistor' },
          { capability: 'resistance_ohms', value: '330' },
        ],
      },
    ],
  ])
  for (const component of options?.extraComponents ?? []) {
    componentsById.set(component.componentId, component)
  }

  const requirementsByBomLineId = new Map<string, CompatibilityRequirement>([
    ['bom-resistor', blinkResistorRequirement],
  ])
  if (options?.secondRequirement && options.secondLineId) {
    requirementsByBomLineId.set(options.secondLineId, options.secondRequirement)
  }

  return {
    requirementsByBomLineId,
    componentsById,
    reviews: options?.reviews ?? [resistor220Review],
  }
}

test('exact generic resistor covers the blink resistor line', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [
      { componentId: 'resistor', quantity: 1 },
      { componentId: 'resistor-220', quantity: 1 },
    ],
    blinkBuildability(),
  )

  assert.equal(match.lines[0]?.coverage, 'exact')
  assert.equal(match.lines[0]?.isOwned, true)
  assert.equal(match.lines[0]?.componentId, 'resistor')
  assert.equal(match.lines[0]?.satisfiedByComponentId, 'resistor')
  assert.equal(match.lines[0]?.ownedQuantity, 1)
  assert.equal(match.ownedCount, 1)
})

test('approved resistor-220 covers the blink resistor line as a direct substitute', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [{ componentId: 'resistor-220', quantity: 1 }],
    blinkBuildability(),
  )

  assert.equal(match.lines[0]?.coverage, 'direct_substitute')
  assert.equal(match.lines[0]?.isOwned, true)
  assert.equal(match.lines[0]?.componentId, 'resistor')
  assert.equal(match.lines[0]?.name, 'Resistor')
  assert.equal(match.lines[0]?.satisfiedByComponentId, 'resistor-220')
  assert.equal(match.lines[0]?.ownedQuantity, 0)
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(match.ownedCount, 1)
  assert.equal(match.matchPercentage, 100)
})

test('a 220 ohm candidate without an applicable review does not cover the line', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [{ componentId: 'resistor-220-unreviewed', quantity: 1 }],
    blinkBuildability(),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.satisfiedByComponentId, null)
  assert.equal(match.ownedCount, 0)
})

test('a 330 ohm candidate does not cover the blink resistor line', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [{ componentId: 'resistor-330-fixture', quantity: 1 }],
    blinkBuildability({
      reviews: [
        resistor220Review,
        {
          requirementId: blinkResistorRequirement.id,
          componentId: 'resistor-330-fixture',
          assessedResult: 'direct',
          changes: [],
        },
      ],
    }),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
})

test('an approved substitute with too few units does not cover the line', () => {
  const match = matchProjectInventory(
    [{ ...resistorLine, quantity: 2 }],
    [{ componentId: 'resistor-220', quantity: 1 }],
    blinkBuildability(),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.missingQuantity, 2)
})

test('one owned substitute is not allocated to two requirements', () => {
  const secondLine: MatchableBomLine = {
    id: 'bom-other-resistor',
    componentId: 'other-resistor',
    slug: 'other-resistor',
    name: 'Other resistor',
    description: null,
    quantity: 1,
    sortOrder: 4,
  }
  const secondRequirement: CompatibilityRequirement = {
    id: 'slug-11-second-resistor',
    policy: 'direct',
    canonicalComponentId: 'other-resistor',
    constraints: blinkResistorRequirement.constraints,
    pinRoles: [],
  }
  const match = matchProjectInventory(
    [secondLine, resistorLine],
    [{ componentId: 'resistor-220', quantity: 1 }],
    blinkBuildability({
      secondRequirement,
      secondLineId: secondLine.id,
      extraComponents: [{ componentId: 'other-resistor', capabilities: [] }],
      reviews: [
        resistor220Review,
        {
          requirementId: secondRequirement.id,
          componentId: 'resistor-220',
          assessedResult: 'direct',
          changes: [],
        },
      ],
    }),
  )

  assert.equal(match.lines.find((line) => line.componentId === 'resistor')?.coverage, 'direct_substitute')
  assert.equal(match.lines.find((line) => line.componentId === 'other-resistor')?.coverage, 'none')
  assert.equal(match.ownedCount, 1)
})

test('a conditional substitute is not treated as owned', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [{ componentId: 'resistor-220', quantity: 1 }],
    blinkBuildability({
      reviews: [
        {
          requirementId: blinkResistorRequirement.id,
          componentId: 'resistor-220',
          assessedResult: 'conditional',
          changes: [{ changeKind: 'wiring', summary: 'Move the resistor lead.' }],
        },
      ],
    }),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
})

test('projects without compatibility requirements keep exact matching', () => {
  const bom = [ledLine, resistorLine]
  const inventory = [{ componentId: 'resistor', quantity: 1 }]
  const exactOnly = matchProjectInventory(bom, inventory)
  const emptyData = matchProjectInventory(bom, inventory, emptyProjectCompatibility())

  assert.deepEqual(
    exactOnly.lines.map((line) => line.isOwned),
    [false, true],
  )
  assert.deepEqual(
    emptyData.lines.map((line) => [line.componentId, line.coverage, line.isOwned]),
    exactOnly.lines.map((line) => [line.componentId, line.coverage, line.isOwned]),
  )
  assert.equal(exactOnly.lines[1]?.coverage, 'exact')
  assert.equal(exactOnly.matchPercentage, 50)
})

/**
 * Fixtures for the slug 12 series-resistor requirement.
 * The slug 11 review is a different requirement and must not cover this line.
 */

const trafficResistorRequirement: CompatibilityRequirement = {
  id: 'slug-12-series-resistor',
  policy: 'direct',
  canonicalComponentId: 'resistor',
  constraints: blinkResistorRequirement.constraints,
  pinRoles: [],
  quantity: 3,
}

const trafficResistorLine: MatchableBomLine = {
  id: 'bom-traffic-resistor',
  componentId: 'resistor',
  slug: 'resistor',
  name: 'Resistor',
  description: null,
  quantity: 3,
  sortOrder: 3,
}

const trafficResistor220Review = {
  requirementId: trafficResistorRequirement.id,
  componentId: 'resistor-220',
  assessedResult: 'direct' as const,
  changes: [],
}

function trafficBuildability(
  reviews: ProjectCompatibilityData['reviews'] = [trafficResistor220Review],
): ProjectCompatibilityData {
  return {
    requirementsByBomLineId: new Map([[trafficResistorLine.id, trafficResistorRequirement]]),
    componentsById: new Map([
      ['resistor', { componentId: 'resistor', capabilities: [] }],
      ['resistor-220', { componentId: 'resistor-220', capabilities: fixedResistorCapabilities }],
    ]),
    reviews,
  }
}

test('three 220 ohm resistors cover the traffic light line as a direct substitute', () => {
  const match = matchProjectInventory(
    [trafficResistorLine],
    [{ componentId: 'resistor-220', quantity: 3 }],
    trafficBuildability(),
  )

  assert.equal(match.lines[0]?.coverage, 'direct_substitute')
  assert.equal(match.lines[0]?.isOwned, true)
  assert.equal(match.lines[0]?.componentId, 'resistor')
  assert.equal(match.lines[0]?.slug, 'resistor')
  assert.equal(match.lines[0]?.name, 'Resistor')
  assert.equal(match.lines[0]?.satisfiedByComponentId, 'resistor-220')
  assert.equal(match.lines[0]?.ownedQuantity, 0)
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(match.ownedCount, 1)
})

test('one or two 220 ohm resistors do not cover the traffic light line', () => {
  for (const quantity of [1, 2]) {
    const match = matchProjectInventory(
      [trafficResistorLine],
      [{ componentId: 'resistor-220', quantity }],
      trafficBuildability(),
    )

    assert.equal(match.lines[0]?.coverage, 'none')
    assert.equal(match.lines[0]?.isOwned, false)
    assert.equal(match.lines[0]?.componentId, 'resistor')
    assert.equal(match.lines[0]?.missingQuantity, 3)
  }
})

test('the blink review does not cover the traffic light resistor line', () => {
  const match = matchProjectInventory(
    [trafficResistorLine],
    [{ componentId: 'resistor-220', quantity: 3 }],
    trafficBuildability([resistor220Review]),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.componentId, 'resistor')
  assert.equal(match.lines[0]?.satisfiedByComponentId, null)
})

test('unreviewed 220 ohm stock does not cover the traffic light line', () => {
  const match = matchProjectInventory(
    [trafficResistorLine],
    [{ componentId: 'resistor-220', quantity: 3 }],
    trafficBuildability([]),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.componentId, 'resistor')
})

test('a conditional traffic light review is not direct coverage', () => {
  const match = matchProjectInventory(
    [trafficResistorLine],
    [{ componentId: 'resistor-220', quantity: 3 }],
    trafficBuildability([
      {
        requirementId: trafficResistorRequirement.id,
        componentId: 'resistor-220',
        assessedResult: 'conditional',
        changes: [{ changeKind: 'wiring', summary: 'Use a different series position.' }],
      },
    ]),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.componentId, 'resistor')
})

test('a new resistor value is not a substitute for the blink resistor requirement', () => {
  const match = matchProjectInventory(
    [resistorLine],
    [{ componentId: 'resistor-10k', quantity: 1 }],
    blinkBuildability({
      extraComponents: [
        {
          componentId: 'resistor-10k',
          capabilities: [
            { capability: 'function', value: 'fixed_resistor' },
            { capability: 'resistance_ohms', value: '10000' },
          ],
        },
      ],
    }),
  )

  assert.equal(match.lines[0]?.coverage, 'none')
  assert.equal(match.lines[0]?.isOwned, false)
  assert.equal(match.lines[0]?.componentId, 'resistor')
  assert.equal(match.lines[0]?.satisfiedByComponentId, null)
})

test('missing compatibility data does not accept a substitute', () => {
  const inventory = [{ componentId: 'resistor-220', quantity: 1 }]
  const omitted = matchProjectInventory([resistorLine], inventory)
  const failedLoad = matchProjectInventory([resistorLine], inventory, null)

  assert.equal(omitted.lines[0]?.coverage, 'none')
  assert.equal(omitted.lines[0]?.isOwned, false)
  assert.deepEqual(
    failedLoad.lines.map((line) => [line.coverage, line.isOwned, line.satisfiedByComponentId]),
    omitted.lines.map((line) => [line.coverage, line.isOwned, line.satisfiedByComponentId]),
  )
})
