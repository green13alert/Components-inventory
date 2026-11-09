import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import type { AuthoredProjectInput } from './project-authoring.ts'
import { CAPABILITY_BACKFILL, REQUIREMENT_CONSTRAINT_BACKFILL } from './capability-backfill.ts'
import {
  matchProjectInventory,
  type CapabilityFact,
  type CompatibilityComponent,
  type CompatibilityRequirement,
  type MatchableBomLine,
  type ProjectCompatibilityData,
  type ProjectInventoryMatch,
} from './compatibility.ts'

/**
 * Real BOM regression for matchProjectInventory.
 *
 * Lines come from localAuthoredProjects(), which copies the authored walkthrough
 * quantities. Catalogue slugs stand in for public.components.id. The matcher
 * only checks that the inventory id equals the BOM line id, so the slug is the
 * same identity the runtime compares as a UUID. No Supabase call is made.
 *
 * matchPercentage counts covered BOM lines, not individual pieces. A line stays
 * incomplete until the owned quantity of that exact component reaches the
 * required quantity.
 *
 * These limitations stay outside this matcher. The tests do not treat them as solved:
 * - usb-data-cable remains the legacy row. It does not satisfy a USB-B or Micro-USB line.
 * - usb-power-source is one generic catalogue row.
 * - A generic onboarding choice stays that catalogue row. It does not become a specific variant.
 * - Project 18's servo supply is authored and hardwareTested stays false. A full
 *   parts match is not a bench test.
 * - Each project is matched with the whole inventory. Nothing is reserved for a second project.
 * - The matcher trusts the catalogue id the user stored. It cannot detect a mislabelled part.
 */

const AUTHORED_SLUGS = ['8', '18', '23', '24', '25'] as const

type Stock = { componentId: string; quantity: number }

const genericEsp32Facts: CapabilityFact[] = [
  { capability: 'function', value: 'development_board' },
  { capability: 'logic_level_v', value: '3.3' },
  { capability: 'board_package', value: 'esp32' },
  { capability: 'physical_form', value: 'esp32_devkit' },
  { capability: 'header_profile', value: 'esp32_devkit' },
]

function authoredProject(slug: string): AuthoredProjectInput {
  const project = localAuthoredProjects().find((item) => item.slug === slug)
  assert.ok(project, slug)
  assert.equal(project.requirements.length, project.bom.length, `${slug} requirement rows`)
  assert.equal(project.hardwareTested, false, `${slug} parts coverage is not a hardware test`)
  for (const requirement of project.requirements) {
    assert.equal(requirement.policy, 'exact', slug)
    assert.deepEqual(requirement.approvedReviewIds, [], slug)
  }
  return project
}

function factsFor(slug: string): CapabilityFact[] {
  return CAPABILITY_BACKFILL.filter((row) => row.slug === slug).map((row) => ({
    capability: row.capability,
    value: row.value,
  }))
}

function bomLines(slug: string): MatchableBomLine[] {
  const project = authoredProject(slug)
  const seen = new Set<string>()
  return project.bom.map((item, index) => {
    assert.equal(seen.has(item.slug), false, `${slug} lists ${item.slug} once`)
    seen.add(item.slug)
    const catalogue = getCatalogueComponent(item.slug)
    assert.ok(catalogue, `${slug} catalogue ${item.slug}`)
    assert.equal(item.quantity > 0, true, `${item.slug} quantity`)
    return {
      id: `${slug}:${item.slug}`,
      componentId: item.slug,
      slug: item.slug,
      name: catalogue.name,
      description: catalogue.description,
      quantity: item.quantity,
      sortOrder: index + 1,
    }
  })
}

function componentRecord(componentId: string, capabilities: CapabilityFact[]): CompatibilityComponent {
  return { componentId, capabilities, pins: [] }
}

function compatibilityFor(
  slug: string,
  lines: readonly MatchableBomLine[],
  extras: readonly CompatibilityComponent[] = [],
): ProjectCompatibilityData {
  const requirementsByBomLineId = new Map<string, CompatibilityRequirement>()
  const componentsById = new Map<string, CompatibilityComponent>()
  for (const line of lines) {
    const constraints = REQUIREMENT_CONSTRAINT_BACKFILL.filter(
      (row) => row.projectSlug === slug && row.componentSlug === line.slug,
    ).map((row) => ({ capability: row.capability, value: row.value }))
    requirementsByBomLineId.set(line.id, {
      id: line.id,
      policy: 'exact',
      canonicalComponentId: line.componentId,
      constraints,
      pinRoles: [],
    })
    componentsById.set(line.componentId, componentRecord(line.componentId, factsFor(line.slug)))
  }
  for (const extra of extras) {
    componentsById.set(extra.componentId, extra)
  }
  return { requirementsByBomLineId, componentsById, reviews: [] }
}

function requiredQuantity(lines: readonly MatchableBomLine[], slug: string, quantity: number): MatchableBomLine {
  const line = lines.find((item) => item.slug === slug)
  assert.ok(line, slug)
  assert.equal(line.quantity, quantity, `${slug} authored quantity`)
  return line
}

function exactInventory(lines: readonly MatchableBomLine[]): Stock[] {
  return lines.map((line) => ({ componentId: line.componentId, quantity: line.quantity }))
}

function withStock(lines: readonly MatchableBomLine[], changes: Stock[], extras: Stock[] = []): Stock[] {
  const replaced = new Map(changes.map((item) => [item.componentId, item.quantity]))
  const items = lines.flatMap((line) => {
    const quantity = replaced.has(line.componentId) ? replaced.get(line.componentId) ?? 0 : line.quantity
    return quantity > 0 ? [{ componentId: line.componentId, quantity }] : []
  })
  return [...items, ...extras]
}

function matchLines(
  slug: string,
  inventory: readonly Stock[],
  extras: readonly CompatibilityComponent[] = [],
): ProjectInventoryMatch {
  const lines = bomLines(slug)
  return matchProjectInventory(lines, inventory, compatibilityFor(slug, lines, extras))
}

function assertComplete(match: ProjectInventoryMatch, label: string) {
  assert.equal(match.missingCount, 0, label)
  assert.equal(match.totalMissing, 0, label)
  assert.equal(match.ownedCount, match.totalRequired, label)
  assert.equal(match.matchPercentage, 100, label)
  for (const line of match.lines) {
    assert.equal(line.coverage, 'exact', `${label} ${line.slug}`)
    assert.equal(line.isOwned, true, `${label} ${line.slug}`)
    assert.equal(line.missingQuantity, 0, `${label} ${line.slug}`)
    assert.equal(line.satisfiedByComponentId, line.componentId, `${label} ${line.slug}`)
  }
}

function assertShort(match: ProjectInventoryMatch, slug: string, missingPieces: number) {
  const line = match.lines.find((item) => item.slug === slug)
  assert.ok(line, slug)
  assert.equal(line.coverage, 'none', slug)
  assert.equal(line.isOwned, false, slug)
  assert.equal(line.satisfiedByComponentId, null, slug)
  assert.equal(line.missingQuantity, missingPieces, slug)
  assert.equal(line.ownedQuantity, line.requiredQuantity - missingPieces, slug)
  for (const other of match.lines) {
    if (other.slug === slug) {
      continue
    }
    assert.equal(other.coverage, 'exact', other.slug)
    assert.equal(other.missingQuantity, 0, other.slug)
  }
  assert.equal(match.missingCount, 1, slug)
  assert.equal(match.totalMissing, missingPieces, slug)
  assert.equal(match.ownedCount, match.totalRequired - 1, slug)
  assert.equal(match.matchPercentage === 100, false, slug)
  assert.equal(match.matchPercentage, (match.ownedCount / match.totalRequired) * 100, slug)
}

for (const slug of AUTHORED_SLUGS) {
  test(`project ${slug} full inventory covers every authored BOM line`, () => {
    const lines = bomLines(slug)
    const inventory = exactInventory(lines)
    const match = matchLines(slug, inventory)
    assert.deepEqual(matchLines(slug, inventory), match)
    assertComplete(match, slug)
    const withUnrelated = matchLines(slug, [...inventory, { componentId: 'hc-sr04', quantity: 3 }])
    assert.deepEqual(withUnrelated, match)
  })
}

test('project 18 requires two position SG90 servos', () => {
  const lines = bomLines('18')
  requiredQuantity(lines, 'sg90', 2)
  const oneServo = matchLines('18', withStock(lines, [{ componentId: 'sg90', quantity: 1 }]))
  assertShort(oneServo, 'sg90', 1)

  const twoServos = matchLines('18', withStock(lines, [{ componentId: 'sg90', quantity: 2 }]))
  const servo = twoServos.lines.find((line) => line.slug === 'sg90')
  assert.ok(servo)
  assert.equal(servo.coverage, 'exact')
  assert.equal(servo.missingQuantity, 0)
  assert.equal(servo.ownedQuantity, 2)

  const continuous: CompatibilityComponent = componentRecord('continuous-rotation-servo', [
    { capability: 'function', value: 'servo' },
    { capability: 'servo_kind', value: 'continuous' },
  ])
  const wrongServo = matchLines(
    '18',
    withStock(lines, [{ componentId: 'sg90', quantity: 0 }], [{ componentId: continuous.componentId, quantity: 2 }]),
    [continuous],
  )
  assertShort(wrongServo, 'sg90', 2)
  assert.equal(wrongServo.lines.some((line) => line.satisfiedByComponentId === continuous.componentId), false)
})

test('project 24 keeps transistor and resistor quantities on their own lines', () => {
  const lines = bomLines('24')
  requiredQuantity(lines, 'pn2222a', 3)
  requiredQuantity(lines, 'resistor-220', 3)
  requiredQuantity(lines, 'resistor-1k', 3)
  requiredQuantity(lines, 'rgb-led-ca', 1)

  assertShort(matchLines('24', withStock(lines, [{ componentId: 'pn2222a', quantity: 2 }])), 'pn2222a', 1)
  assertShort(matchLines('24', withStock(lines, [{ componentId: 'resistor-220', quantity: 2 }])), 'resistor-220', 1)
  assertShort(matchLines('24', withStock(lines, [{ componentId: 'resistor-1k', quantity: 2 }])), 'resistor-1k', 1)

  const kilohmOnLimiter = matchLines(
    '24',
    withStock(lines, [
      { componentId: 'resistor-220', quantity: 0 },
      { componentId: 'resistor-1k', quantity: 6 },
    ]),
    [componentRecord('resistor-1k', factsFor('resistor-1k'))],
  )
  assertShort(kilohmOnLimiter, 'resistor-220', 3)

  const cathode = matchLines(
    '24',
    withStock(lines, [{ componentId: 'rgb-led-ca', quantity: 0 }], [{ componentId: 'rgb-led-cc', quantity: 1 }]),
    [componentRecord('rgb-led-cc', factsFor('rgb-led-cc'))],
  )
  assertShort(cathode, 'rgb-led-ca', 1)
})

test('project 25 keeps jumper gender and the FC-16 module exact', () => {
  const lines = bomLines('25')
  requiredQuantity(lines, 'jumper-wires', 2)
  requiredQuantity(lines, 'jumper-male-female', 10)
  requiredQuantity(lines, 'max7219', 1)
  const matrix = getCatalogueComponent('max7219')
  assert.ok(matrix)
  assert.equal(matrix.description.includes('FC-16'), true)

  assertShort(matchLines('25', withStock(lines, [{ componentId: 'jumper-wires', quantity: 1 }])), 'jumper-wires', 1)
  assertShort(
    matchLines('25', withStock(lines, [{ componentId: 'jumper-male-female', quantity: 9 }])),
    'jumper-male-female',
    1,
  )

  const swapped = matchLines(
    '25',
    withStock(
      lines,
      [
        { componentId: 'jumper-wires', quantity: 0 },
        { componentId: 'jumper-male-female', quantity: 12 },
      ],
    ),
    [componentRecord('jumper-male-female', factsFor('jumper-male-female'))],
  )
  assertShort(swapped, 'jumper-wires', 2)

  const genericMatrix = componentRecord('max7219-generic', factsFor('max7219'))
  const otherMatrix = matchLines(
    '25',
    withStock(lines, [{ componentId: 'max7219', quantity: 0 }], [{ componentId: genericMatrix.componentId, quantity: 1 }]),
    [genericMatrix],
  )
  assertShort(otherMatrix, 'max7219', 1)
})

test('project 23 accepts only the DevKitC V4 and the female STEMMA cable', () => {
  const lines = bomLines('23')
  requiredQuantity(lines, 'esp32-devkitc-v4', 1)
  requiredQuantity(lines, 'stemma-qt-female', 1)
  assert.equal(lines.some((line) => line.slug === 'esp32' || line.slug === 'stemma-qt-cable' || line.slug === 'breadboard'), false)

  const wrongBoard = matchLines(
    '23',
    withStock(lines, [{ componentId: 'esp32-devkitc-v4', quantity: 0 }], [{ componentId: 'esp32', quantity: 1 }]),
    [componentRecord('esp32', genericEsp32Facts)],
  )
  assertShort(wrongBoard, 'esp32-devkitc-v4', 1)
  const withoutCompatibilityData = matchProjectInventory(
    lines,
    withStock(lines, [{ componentId: 'esp32-devkitc-v4', quantity: 0 }], [{ componentId: 'esp32', quantity: 1 }]),
    null,
  )
  assert.equal(withoutCompatibilityData.lines.find((line) => line.slug === 'esp32-devkitc-v4')?.coverage, 'none')

  const maleCable = matchLines(
    '23',
    withStock(
      lines,
      [{ componentId: 'stemma-qt-female', quantity: 0 }],
      [{ componentId: 'stemma-qt-cable', quantity: 1 }],
    ),
    [componentRecord('stemma-qt-cable', factsFor('stemma-qt-cable'))],
  )
  assertShort(maleCable, 'stemma-qt-female', 1)

  const lookalike = componentRecord('esp32-devkitc-v4-lookalike', factsFor('esp32-devkitc-v4'))
  const sameFacts = matchLines(
    '23',
    withStock(lines, [{ componentId: 'esp32-devkitc-v4', quantity: 0 }], [{ componentId: lookalike.componentId, quantity: 1 }]),
    [lookalike],
  )
  assertShort(sameFacts, 'esp32-devkitc-v4', 1)

  const complete = matchLines('23', exactInventory(lines))
  for (const slug of ['esp32-devkitc-v4', 'stemma-qt-female'] as const) {
    const line = complete.lines.find((item) => item.slug === slug)
    assert.ok(line)
    assert.equal(line.coverage, 'exact')
    assert.equal(line.missingQuantity, 0)
  }
})

test('project 8 keeps the 220 ohm resistor, the active buzzer, and ten jumpers exact', () => {
  const lines = bomLines('8')
  requiredQuantity(lines, 'resistor-220', 1)
  requiredQuantity(lines, 'buzzer', 1)
  requiredQuantity(lines, 'jumper-wires', 10)
  assert.equal(lines.some((line) => line.slug === 'resistor'), false)

  const genericResistor = matchLines(
    '8',
    withStock(lines, [{ componentId: 'resistor-220', quantity: 0 }], [{ componentId: 'resistor', quantity: 10 }]),
    [componentRecord('resistor', factsFor('resistor'))],
  )
  assertShort(genericResistor, 'resistor-220', 1)

  const passivePiezo = componentRecord('passive-piezo', [
    { capability: 'function', value: 'buzzer' },
    { capability: 'physical_form', value: 'two_pin_element' },
  ])
  const wrongBuzzer = matchLines(
    '8',
    withStock(lines, [{ componentId: 'buzzer', quantity: 0 }], [{ componentId: passivePiezo.componentId, quantity: 1 }]),
    [passivePiezo],
  )
  assertShort(wrongBuzzer, 'buzzer', 1)

  assertShort(matchLines('8', withStock(lines, [{ componentId: 'jumper-wires', quantity: 9 }])), 'jumper-wires', 1)
  requiredQuantity(lines, 'usb-b-data-cable', 1)
  assertShort(
    matchLines('8', withStock(lines, [{ componentId: 'usb-b-data-cable', quantity: 0 }], [{ componentId: 'usb-data-cable', quantity: 1 }])),
    'usb-b-data-cable',
    1,
  )
  assertShort(
    matchLines('8', withStock(lines, [{ componentId: 'usb-b-data-cable', quantity: 0 }], [{ componentId: 'usb-micro-b-data-cable', quantity: 1 }])),
    'usb-b-data-cable',
    1,
  )
})

test('a legacy USB cable does not prove a Micro-USB socket, and quantities stay on their own lines', () => {
  const weather = bomLines('23')
  requiredQuantity(weather, 'usb-micro-b-data-cable', 1)
  assertShort(
    matchLines('23', withStock(weather, [{ componentId: 'usb-micro-b-data-cable', quantity: 0 }], [{ componentId: 'usb-data-cable', quantity: 1 }])),
    'usb-micro-b-data-cable',
    1,
  )
  assertShort(
    matchLines('23', withStock(weather, [{ componentId: 'usb-micro-b-data-cable', quantity: 0 }], [{ componentId: 'usb-b-data-cable', quantity: 1 }])),
    'usb-micro-b-data-cable',
    1,
  )
  const exact = matchLines('23', exactInventory(weather))
  assertComplete(exact, 'weather cables')

  const rgb = bomLines('24')
  requiredQuantity(rgb, 'pn2222a', 3)
  requiredQuantity(rgb, 'resistor-220', 3)
  requiredQuantity(rgb, 'resistor-1k', 3)
  assertShort(matchLines('24', withStock(rgb, [{ componentId: 'pn2222a', quantity: 2 }])), 'pn2222a', 1)
})

/**
 * Policy cases the five authored BOMs do not contain.
 * The direct-substitute review below is a test fixture, not an authored approval.
 */

test('an exact component is allocated before an approved direct substitute', () => {
  const line: MatchableBomLine = {
    id: 'synthetic-limiter',
    componentId: 'resistor-220',
    slug: 'resistor-220',
    name: '220 Ω resistor',
    description: null,
    quantity: 1,
    sortOrder: 1,
  }
  const requirement = {
    id: 'synthetic-limiter',
    policy: 'direct' as const,
    canonicalComponentId: 'resistor-220',
    constraints: [],
    pinRoles: [],
  }
  const review = {
    requirementId: requirement.id,
    componentId: 'resistor',
    assessedResult: 'direct' as const,
    changes: [],
  }
  const data: ProjectCompatibilityData = {
    requirementsByBomLineId: new Map([[line.id, requirement]]),
    componentsById: new Map([
      ['resistor-220', componentRecord('resistor-220', [])],
      ['resistor', componentRecord('resistor', [])],
    ]),
    reviews: [review],
  }
  const both = matchProjectInventory(
    [line],
    [
      { componentId: 'resistor-220', quantity: 1 },
      { componentId: 'resistor', quantity: 1 },
    ],
    data,
  )
  assert.equal(both.lines[0]?.coverage, 'exact')
  assert.equal(both.lines[0]?.satisfiedByComponentId, 'resistor-220')

  const substituteOnly = matchProjectInventory([line], [{ componentId: 'resistor', quantity: 1 }], data)
  assert.equal(substituteOnly.lines[0]?.coverage, 'direct_substitute')
  assert.equal(substituteOnly.lines[0]?.satisfiedByComponentId, 'resistor')
  assert.equal(substituteOnly.lines[0]?.isOwned, true)
  assert.equal(substituteOnly.lines[0]?.missingQuantity, 0)
})

test('unknown data, a conditional review, and a failed lookup do not cover a different part', () => {
  const line: MatchableBomLine = {
    id: 'synthetic-board',
    componentId: 'esp32-devkitc-v4',
    slug: 'esp32-devkitc-v4',
    name: 'ESP32-DevKitC V4',
    description: null,
    quantity: 1,
    sortOrder: 1,
  }
  const requirement = {
    id: 'synthetic-board',
    policy: 'direct' as const,
    canonicalComponentId: 'esp32-devkitc-v4',
    constraints: [],
    pinRoles: [],
  }
  const inventory = [{ componentId: 'esp32', quantity: 1 }]
  const base = {
    requirementsByBomLineId: new Map([[line.id, requirement]]),
    componentsById: new Map([
      ['esp32-devkitc-v4', componentRecord('esp32-devkitc-v4', [])],
      ['esp32', componentRecord('esp32', genericEsp32Facts)],
    ]),
  }
  const unknown = matchProjectInventory([line], inventory, { ...base, reviews: [] })
  assert.equal(unknown.lines[0]?.coverage, 'none')
  assert.equal(unknown.lines[0]?.isOwned, false)

  const conditional = matchProjectInventory([line], inventory, {
    ...base,
    reviews: [
      {
        requirementId: requirement.id,
        componentId: 'esp32',
        assessedResult: 'conditional',
        changes: [{ changeKind: 'wiring', summary: 'Use different header pins.' }],
      },
    ],
  })
  assert.equal(conditional.lines[0]?.coverage, 'none')
  assert.equal(conditional.lines[0]?.isOwned, false)

  const failedLookup = matchProjectInventory([line], inventory, null)
  assert.equal(failedLookup.lines[0]?.coverage, 'none')
  assert.equal(failedLookup.lines[0]?.isOwned, false)
})

/**
 * Synthetic stock-allocation cases. None of these bills of materials are authored
 * projects. A direct-substitute review in this section is a fixture, not an approval.
 * ownedQuantity stays the canonical inventory total. missingQuantity is what that
 * line still needs after earlier lines have taken units.
 */

function servoLine(id: string, quantity: number, sortOrder: number): MatchableBomLine {
  return {
    id,
    componentId: 'sg90',
    slug: 'sg90',
    name: 'SG90 Micro Servo',
    description: null,
    quantity,
    sortOrder,
  }
}

function twoServoLines(quantity: number): [MatchableBomLine, MatchableBomLine] {
  return [servoLine('synthetic-servo-a', quantity, 1), servoLine('synthetic-servo-b', quantity, 2)]
}

test('scenario A: one SG90 covers the first of two exact lines and the second is short by one', () => {
  const [first, second] = twoServoLines(1)
  const inventory = [{ componentId: 'sg90', quantity: 1 }]
  const match = matchProjectInventory([first, second], inventory)
  assert.deepEqual(match, matchProjectInventory([first, second], inventory), 'allocation is deterministic')
  assert.equal(match.lines[0]?.coverage, 'exact', 'first line takes the only unit')
  assert.equal(match.lines[0]?.isOwned, true)
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(match.lines[0]?.ownedQuantity, 1, 'owned quantity stays the canonical total')
  assert.equal(match.lines[1]?.coverage, 'none', 'second line stays uncovered')
  assert.equal(match.lines[1]?.isOwned, false)
  assert.equal(match.lines[1]?.satisfiedByComponentId, null)
  assert.equal(match.lines[1]?.missingQuantity, 1, 'the allocated unit is no longer available')
  assert.equal(match.lines[1]?.ownedQuantity, 1)
  assert.equal(match.missingCount, 1)
  assert.equal(match.ownedCount, 1)
  assert.equal(match.totalRequired, 2)
  assert.equal(match.totalMissing, 1)
  assert.equal(match.matchPercentage, 50)

  const reversed = matchProjectInventory([second, first], inventory)
  assert.equal(reversed.lines[0]?.coverage, 'none', 'later sort order does not take the unit')
  assert.equal(reversed.lines[0]?.missingQuantity, 1)
  assert.equal(reversed.lines[1]?.coverage, 'exact')
  assert.equal(reversed.lines[1]?.missingQuantity, 0)
})

test('scenario B: two owned SG90s cover two exact lines', () => {
  const lines = twoServoLines(1)
  const inventory = [{ componentId: 'sg90', quantity: 2 }]
  const match = matchProjectInventory(lines, inventory)
  assert.deepEqual(match, matchProjectInventory(lines, inventory))
  assert.equal(match.ownedCount, 2)
  assert.equal(match.missingCount, 0)
  assert.equal(match.totalMissing, 0)
  assert.equal(match.matchPercentage, 100)
  for (const [index, line] of match.lines.entries()) {
    const label = `line ${index + 1}`
    assert.equal(line.coverage, 'exact', label)
    assert.equal(line.isOwned, true, label)
    assert.equal(line.missingQuantity, 0, label)
    assert.equal(line.satisfiedByComponentId, 'sg90', label)
    assert.equal(line.ownedQuantity, 2, label)
  }
})

test('scenario C: three SG90s cover a line of two and leave the next line short by one', () => {
  const lines = twoServoLines(2)
  const match = matchProjectInventory(lines, [{ componentId: 'sg90', quantity: 3 }])
  assert.equal(match.lines[0]?.coverage, 'exact')
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(match.lines[0]?.ownedQuantity, 3)
  assert.equal(match.lines[1]?.coverage, 'none', 'one leftover unit does not finish a line of two')
  assert.equal(match.lines[1]?.isOwned, false)
  assert.equal(match.lines[1]?.missingQuantity, 1, 'the leftover unit reduces the shortfall')
  assert.equal(match.lines[1]?.ownedQuantity, 3)
  assert.equal(match.ownedCount, 1)
  assert.equal(match.missingCount, 1)
  assert.equal(match.totalMissing, 1)
  assert.equal(match.matchPercentage, 50)

  const uncovered = [
    servoLine('synthetic-servo-a', 2, 1),
    servoLine('synthetic-servo-b', 2, 2),
    servoLine('synthetic-servo-c', 2, 3),
  ]
  const partial = matchProjectInventory(uncovered, [{ componentId: 'sg90', quantity: 1 }])
  assert.deepEqual(
    partial.lines.map((line) => line.missingQuantity),
    [1, 2, 2],
    'one leftover unit is credited to the first uncovered line only',
  )
  assert.equal(partial.ownedCount, 0)
  assert.equal(partial.missingCount, 3)
  assert.equal(partial.totalMissing, 5)
  assert.equal(partial.matchPercentage, 0)
})

test('scenario D: no SG90 stock leaves both lines short by one', () => {
  const lines = twoServoLines(1)
  const match = matchProjectInventory(lines, [])
  assert.equal(match.ownedCount, 0)
  assert.equal(match.missingCount, 2)
  assert.equal(match.totalMissing, 2)
  assert.equal(match.matchPercentage, 0)
  for (const [index, line] of match.lines.entries()) {
    const label = `line ${index + 1}`
    assert.equal(line.coverage, 'none', label)
    assert.equal(line.isOwned, false, label)
    assert.equal(line.missingQuantity, 1, label)
    assert.equal(line.ownedQuantity, 0, label)
    assert.equal(line.satisfiedByComponentId, null, label)
  }
})

test('scenario E: unrelated stock does not change shared-component allocation', () => {
  const cases = [
    { lines: twoServoLines(1), inventory: [{ componentId: 'sg90', quantity: 1 }] },
    { lines: twoServoLines(1), inventory: [{ componentId: 'sg90', quantity: 2 }] },
    { lines: twoServoLines(2), inventory: [{ componentId: 'sg90', quantity: 3 }] },
    { lines: twoServoLines(1), inventory: [] as Stock[] },
  ]
  for (const [index, item] of cases.entries()) {
    const plain = matchProjectInventory(item.lines, item.inventory)
    const withExtra = matchProjectInventory(item.lines, [
      ...item.inventory,
      { componentId: 'hc-sr04', quantity: 4 },
    ])
    assert.deepEqual(withExtra, plain, `case ${index}`)
  }
})

test('scenario F: an approved substitute covers a second line without consuming the exact unit twice', () => {
  const [first, second] = twoLimiterLines()
  const third: MatchableBomLine = { ...first, id: 'synthetic-limiter-c', sortOrder: 3 }
  const data = limiterCompatibility([first, second, third])
  const exactAndSubstitute = [
    { componentId: 'resistor-220', quantity: 1 },
    { componentId: 'resistor', quantity: 1 },
  ]
  const match = matchProjectInventory([first, second, third], exactAndSubstitute, data)
  assert.deepEqual(match, matchProjectInventory([first, second, third], exactAndSubstitute, data))
  assert.equal(match.lines[0]?.coverage, 'exact', 'exact stock is allocated before the substitute')
  assert.equal(match.lines[0]?.satisfiedByComponentId, 'resistor-220')
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(match.lines[1]?.coverage, 'direct_substitute')
  assert.equal(match.lines[1]?.satisfiedByComponentId, 'resistor', 'the substitute covers only the next line')
  assert.equal(match.lines[1]?.missingQuantity, 0)
  assert.equal(match.lines[1]?.ownedQuantity, 1, 'owned quantity counts the canonical part, not the substitute')
  assert.equal(match.lines[2]?.coverage, 'none')
  assert.equal(match.lines[2]?.isOwned, false)
  assert.equal(match.lines[2]?.missingQuantity, 1, 'one exact unit and one substitute leave the third line short')
  assert.equal(match.ownedCount, 2)
  assert.equal(match.missingCount, 1)
  assert.equal(match.totalMissing, 1)
  assert.equal(match.matchPercentage, (2 / 3) * 100)

  const substituteOnly = matchProjectInventory([first, second], [{ componentId: 'resistor', quantity: 1 }], data)
  assert.equal(substituteOnly.lines[0]?.coverage, 'direct_substitute')
  assert.equal(substituteOnly.lines[0]?.missingQuantity, 0)
  assert.equal(substituteOnly.lines[0]?.ownedQuantity, 0)
  assert.equal(substituteOnly.lines[1]?.coverage, 'none', 'one substitute unit is not used twice')
  assert.equal(substituteOnly.lines[1]?.missingQuantity, 1)
  assert.equal(substituteOnly.lines[1]?.ownedQuantity, 0)
  assert.equal(substituteOnly.totalMissing, 1)

  const conditional: ProjectCompatibilityData = {
    ...data,
    reviews: data.reviews.map((review) =>
      review.requirementId === second.id
        ? {
            ...review,
            assessedResult: 'conditional' as const,
            changes: [{ changeKind: 'wiring' as const, summary: 'Move one lead.' }],
          }
        : review,
    ),
  }
  const held = matchProjectInventory(
    [first, second],
    exactAndSubstitute,
    conditional,
  )
  assert.equal(held.lines[0]?.coverage, 'exact')
  assert.equal(held.lines[0]?.satisfiedByComponentId, 'resistor-220', 'the conditional review does not take the exact unit')
  assert.equal(held.lines[1]?.coverage, 'none', 'a conditional review is not coverage')
  assert.equal(held.lines[1]?.missingQuantity, 1)
  assert.equal(held.totalMissing, 1)
})

function twoLimiterLines(): [MatchableBomLine, MatchableBomLine] {
  return [
    {
      id: 'synthetic-limiter-a',
      componentId: 'resistor-220',
      slug: 'resistor-220',
      name: '220 Ω resistor',
      description: null,
      quantity: 1,
      sortOrder: 1,
    },
    {
      id: 'synthetic-limiter-b',
      componentId: 'resistor-220',
      slug: 'resistor-220',
      name: '220 Ω resistor',
      description: null,
      quantity: 1,
      sortOrder: 2,
    },
  ]
}

function limiterCompatibility(lines: readonly MatchableBomLine[]): ProjectCompatibilityData {
  return {
    requirementsByBomLineId: new Map(
      lines.map((line) => [
        line.id,
        {
          id: line.id,
          policy: 'direct' as const,
          canonicalComponentId: line.componentId,
          constraints: [],
          pinRoles: [],
        },
      ]),
    ),
    componentsById: new Map([
      ['resistor-220', componentRecord('resistor-220', [])],
      ['resistor', componentRecord('resistor', [])],
    ]),
    reviews: lines.map((line) => ({
      requirementId: line.id,
      componentId: 'resistor',
      assessedResult: 'direct' as const,
      changes: [],
    })),
  }
}
