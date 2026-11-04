import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { ONBOARDING_OFFERS, getOnboardingChoice } from '../constants/onboarding-offers.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { matchProjectInventory, type MatchableBomLine } from './compatibility.ts'
import {
  adjustSheetQuantity,
  applySheetQuantities,
  normalizeOnboardingComponents,
  planOnboardingInventoryInserts,
  ONBOARDING_SAVE_ERRORS,
  saveOnboardingInventory,
  sheetQuantitiesFromBench,
  type CatalogueIdentity,
  type OnboardingComponentSelection,
  type OnboardingInventoryGateway,
  type OnboardingInventoryInsert,
  type OnboardingSheetQuantity,
  type OwnedInventoryRow,
} from './onboarding-inventory.ts'

/**
 * Onboarding selections use catalogue slugs as component ids here, matching the
 * matcher tests. Persistence resolves those slugs to Supabase UUIDs and inserts
 * a missing inventory_items row. An existing row keeps its quantity.
 */

const CATALOGUE: CatalogueIdentity[] = [
  { id: 'uuid-devkit', slug: 'esp32-devkitc-v4' },
  { id: 'uuid-esp32', slug: 'esp32' },
  { id: 'uuid-220', slug: 'resistor-220' },
  { id: 'uuid-1k', slug: 'resistor-1k' },
  { id: 'uuid-resistor', slug: 'resistor' },
  { id: 'uuid-sg90', slug: 'sg90' },
  { id: 'uuid-mg90s', slug: 'mg90s' },
  { id: 'uuid-pn2222a', slug: 'pn2222a' },
  { id: 'uuid-mf', slug: 'jumper-male-female' },
  { id: 'uuid-mm', slug: 'jumper-wires' },
  { id: 'uuid-anode', slug: 'rgb-led-ca' },
  { id: 'uuid-cathode', slug: 'rgb-led-cc' },
]

type Memory = {
  rows: Map<string, number>
  inserts: OnboardingInventoryInsert[][]
  catalogueReads: number
  ownedReads: number
}

function memoryGateway(options?: {
  failCatalogue?: boolean
  failOwned?: boolean
  failInsert?: boolean
  staleOwned?: boolean
  catalogue?: CatalogueIdentity[]
}): { memory: Memory; gateway: OnboardingInventoryGateway } {
  const memory: Memory = {
    rows: new Map<string, number>(),
    inserts: [],
    catalogueReads: 0,
    ownedReads: 0,
  }
  const catalogue = options?.catalogue ?? CATALOGUE
  const gateway: OnboardingInventoryGateway = {
    async findCatalogueBySlug(slugs) {
      memory.catalogueReads += 1
      if (options?.failCatalogue) {
        return { rows: null, error: 'catalogue unavailable' }
      }
      return {
        rows: catalogue.filter((row) => slugs.includes(row.slug)),
        error: null,
      }
    },
    async findOwned(_userId, componentIds) {
      memory.ownedReads += 1
      if (options?.failOwned) {
        return { rows: null, error: 'inventory unavailable' }
      }
      if (options?.staleOwned && memory.ownedReads === 1) {
        return { rows: [], error: null }
      }
      const rows: OwnedInventoryRow[] = []
      for (const componentId of componentIds) {
        const quantity = memory.rows.get(componentId)
        if (quantity != null) {
          rows.push({ componentId, quantity })
        }
      }
      return { rows, error: null }
    },
    async insertMissing(_userId, rows) {
      memory.inserts.push(rows.map((row) => ({ ...row })))
      if (options?.failInsert) {
        return { error: 'insert failed', conflict: false }
      }
      if (rows.some((row) => memory.rows.has(row.componentId))) {
        return { error: 'duplicate key', conflict: true }
      }
      for (const row of rows) {
        memory.rows.set(row.componentId, row.quantity)
      }
      return { error: null, conflict: false }
    },
  }
  return { memory, gateway }
}

function authoredLines(slug: string): MatchableBomLine[] {
  const project = localAuthoredProjects().find((item) => item.slug === slug)
  assert.ok(project, slug)
  return project.bom.map((item, index) => ({
    id: `${slug}:${item.slug}`,
    componentId: item.slug,
    slug: item.slug,
    name: item.slug,
    description: null,
    quantity: item.quantity,
    sortOrder: index + 1,
  }))
}

test('onboarding choices use the catalogue id and name, and generics stay generic', () => {
  const slugs = new Set<string>()
  for (const group of ONBOARDING_OFFERS) {
    for (const choice of group.choices) {
      assert.equal(slugs.has(choice.slug), false, choice.slug)
      slugs.add(choice.slug)
      const catalogue = getCatalogueComponent(choice.slug)
      assert.ok(catalogue, choice.slug)
      assert.equal(choice.slug, catalogue.id, choice.slug)
      assert.equal(choice.name, catalogue.name, choice.slug)
      assert.equal(getOnboardingChoice(choice.slug)?.slug, choice.slug)
    }
  }

  assert.equal(getOnboardingChoice('esp32-devkitc-v4')?.unspecified, false)
  assert.equal(getOnboardingChoice('esp32')?.unspecified, true)
  assert.equal(getOnboardingChoice('resistor-220')?.unspecified, false)
  assert.equal(getOnboardingChoice('resistor-1k')?.unspecified, false)
  assert.equal(getOnboardingChoice('resistor')?.unspecified, true)
  assert.equal(getOnboardingChoice('max7219')?.hint.includes('FC-16'), true)
  assert.equal(
    ONBOARDING_OFFERS.find((group) => group.id === 'max7219')?.choices.some((choice) => choice.unspecified),
    false,
  )
  assert.equal(getOnboardingChoice('servo-sg90'), null)
  assert.equal(getOnboardingChoice('esp32-devkitc'), null)
  assert.equal(getOnboardingChoice('max7219-generic'), null)
})

test('DevKitC V4 and a generic ESP32 resolve to different catalogue rows', () => {
  const devkit = planOnboardingInventoryInserts([{ slug: 'esp32-devkitc-v4', quantity: 1 }], CATALOGUE, [])
  const generic = planOnboardingInventoryInserts([{ slug: 'esp32', quantity: 1 }], CATALOGUE, [])
  assert.equal(devkit.ok, true)
  assert.equal(generic.ok, true)
  if (!devkit.ok || !generic.ok) {
    return
  }
  assert.deepEqual(devkit.plan.inserts, [{ componentId: 'uuid-devkit', quantity: 1 }])
  assert.deepEqual(generic.plan.inserts, [{ componentId: 'uuid-esp32', quantity: 1 }])
  assert.equal(devkit.plan.inserts[0]?.componentId === generic.plan.inserts[0]?.componentId, false)
})

test('a 220 ohm selection does not save a generic resistor or a 1 kohm resistor', () => {
  const plan = planOnboardingInventoryInserts([{ slug: 'resistor-220', quantity: 10 }], CATALOGUE, [])
  assert.equal(plan.ok, true)
  if (!plan.ok) {
    return
  }
  assert.deepEqual(plan.plan.inserts, [{ componentId: 'uuid-220', quantity: 10 }])
  assert.equal(
    plan.plan.inserts.some((row) => row.componentId === 'uuid-resistor' || row.componentId === 'uuid-1k'),
    false,
  )
})

test('SG90 times 2 and PN2222A times 3 keep those quantities', async () => {
  const servos = memoryGateway()
  const servoResult = await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], servos.gateway)
  assert.equal(servoResult.error, null)
  assert.deepEqual(servos.memory.inserts, [[{ componentId: 'uuid-sg90', quantity: 2 }]])
  assert.equal(servos.memory.rows.get('uuid-sg90'), 2)

  const transistors = memoryGateway()
  const transistorResult = await saveOnboardingInventory(
    'user-1',
    [{ slug: 'pn2222a', quantity: 3 }],
    transistors.gateway,
  )
  assert.equal(transistorResult.error, null)
  assert.equal(transistors.memory.rows.get('uuid-pn2222a'), 3)
})

test('invalid quantities are rejected before any inventory write', async () => {
  for (const quantity of [0, -1, 1.5, Number.NaN, 100, Number.POSITIVE_INFINITY]) {
    const normalized = normalizeOnboardingComponents([{ slug: 'sg90', quantity }])
    assert.equal(normalized.ok, false, `quantity ${quantity}`)
    const { memory, gateway } = memoryGateway()
    const saved = await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity }], gateway)
    assert.equal(saved.error, ONBOARDING_SAVE_ERRORS.invalidQuantity, `quantity ${quantity}`)
    assert.equal(memory.inserts.length, 0, `quantity ${quantity}`)
    assert.equal(memory.catalogueReads, 0, `quantity ${quantity}`)
  }
})

test('different variants are stored as separate rows', async () => {
  const selection: OnboardingComponentSelection[] = [
    { slug: 'esp32-devkitc-v4', quantity: 1 },
    { slug: 'esp32', quantity: 1 },
    { slug: 'resistor-220', quantity: 10 },
    { slug: 'resistor-1k', quantity: 3 },
    { slug: 'resistor', quantity: 4 },
    { slug: 'sg90', quantity: 2 },
    { slug: 'jumper-male-female', quantity: 20 },
    { slug: 'jumper-wires', quantity: 8 },
    { slug: 'rgb-led-ca', quantity: 1 },
    { slug: 'rgb-led-cc', quantity: 1 },
  ]
  const { memory, gateway } = memoryGateway()
  const saved = await saveOnboardingInventory('user-1', selection, gateway)
  assert.equal(saved.error, null)
  assert.equal(memory.rows.size, selection.length)
  assert.equal(memory.rows.get('uuid-devkit'), 1)
  assert.equal(memory.rows.get('uuid-esp32'), 1)
  assert.equal(memory.rows.get('uuid-220'), 10)
  assert.equal(memory.rows.get('uuid-1k'), 3)
  assert.equal(memory.rows.get('uuid-resistor'), 4)
  assert.equal(memory.rows.get('uuid-mf'), 20)
  assert.equal(memory.rows.get('uuid-anode'), 1)
  assert.equal(memory.rows.get('uuid-cathode'), 1)
})

test('saving the same selection again does not increase quantities', async () => {
  const { memory, gateway } = memoryGateway()
  const selection = [
    { slug: 'sg90', quantity: 2 },
    { slug: 'pn2222a', quantity: 3 },
  ]
  assert.equal((await saveOnboardingInventory('user-1', selection, gateway)).error, null)
  assert.equal((await saveOnboardingInventory('user-1', selection, gateway)).error, null)
  assert.equal(memory.inserts.length, 1)
  assert.equal(memory.rows.get('uuid-sg90'), 2)
  assert.equal(memory.rows.get('uuid-pn2222a'), 3)
})

test('an existing inventory row keeps its quantity', async () => {
  const higher = memoryGateway()
  higher.memory.rows.set('uuid-sg90', 5)
  const higherResult = await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], higher.gateway)
  assert.equal(higherResult.error, null)
  assert.equal(higher.memory.inserts.length, 0)
  assert.equal(higher.memory.rows.get('uuid-sg90'), 5)

  const lower = memoryGateway()
  lower.memory.rows.set('uuid-pn2222a', 1)
  const lowerResult = await saveOnboardingInventory('user-1', [{ slug: 'pn2222a', quantity: 3 }], lower.gateway)
  assert.equal(lowerResult.error, null)
  assert.equal(lower.memory.inserts.length, 0)
  assert.equal(lower.memory.rows.get('uuid-pn2222a'), 1)
})

test('an unknown variant is not saved as a different component', async () => {
  for (const slug of ['esp32-devkitc', 'servo-sg90', 'max7219-generic', 'resistor-330']) {
    const normalized = normalizeOnboardingComponents([{ slug, quantity: 1 }])
    assert.equal(normalized.ok, false, slug)
    const { memory, gateway } = memoryGateway()
    const saved = await saveOnboardingInventory('user-1', [{ slug, quantity: 1 }], gateway)
    assert.equal(saved.error, ONBOARDING_SAVE_ERRORS.missingComponents, slug)
    assert.equal(memory.inserts.length, 0, slug)
    assert.equal(memory.rows.size, 0, slug)
  }

  const { memory, gateway } = memoryGateway({
    catalogue: [
      { id: 'uuid-devkit', slug: 'esp32-devkitc-v4' },
      { id: 'uuid-esp32', slug: 'esp32' },
    ],
  })
  const saved = await saveOnboardingInventory('user-1', [{ slug: 'esp32', quantity: 1 }], gateway)
  assert.equal(saved.error, null)
  assert.deepEqual([...memory.rows.keys()], ['uuid-esp32'])
})

test('a catalogue miss or a failed write does not report success', async () => {
  const missing = memoryGateway({ catalogue: [] })
  const missingResult = await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], missing.gateway)
  assert.equal(missingResult.error, ONBOARDING_SAVE_ERRORS.missingComponents)
  assert.equal(missing.memory.inserts.length, 0)

  const catalogueDown = memoryGateway({ failCatalogue: true })
  assert.equal(
    (await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], catalogueDown.gateway)).error,
    ONBOARDING_SAVE_ERRORS.generic,
  )
  assert.equal(catalogueDown.memory.inserts.length, 0)

  const ownedDown = memoryGateway({ failOwned: true })
  assert.equal(
    (await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], ownedDown.gateway)).error,
    ONBOARDING_SAVE_ERRORS.generic,
  )
  assert.equal(ownedDown.memory.inserts.length, 0)

  const insertDown = memoryGateway({ failInsert: true })
  assert.equal(
    (await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], insertDown.gateway)).error,
    ONBOARDING_SAVE_ERRORS.generic,
  )
  assert.equal(insertDown.memory.rows.size, 0)
})

test('a conflicting insert leaves the stored quantity unchanged', async () => {
  const { memory, gateway } = memoryGateway({ staleOwned: true })
  memory.rows.set('uuid-sg90', 4)
  const saved = await saveOnboardingInventory('user-1', [{ slug: 'sg90', quantity: 2 }], gateway)
  assert.equal(saved.error, null)
  assert.equal(memory.inserts.length, 1)
  assert.equal(memory.rows.get('uuid-sg90'), 4)
})

test('onboarding quantities match the authored project requirements', () => {
  const servoProject = authoredLines('18')
  const servoLine = servoProject.find((line) => line.slug === 'sg90')
  assert.ok(servoLine)
  assert.equal(servoLine.quantity, 2)

  const twoServos = matchProjectInventory(servoProject, [{ componentId: 'sg90', quantity: 2 }])
  const covered = twoServos.lines.find((line) => line.slug === 'sg90')
  assert.equal(covered?.coverage, 'exact')
  assert.equal(covered?.missingQuantity, 0)

  const oneServo = matchProjectInventory(servoProject, [{ componentId: 'sg90', quantity: 1 }])
  const short = oneServo.lines.find((line) => line.slug === 'sg90')
  assert.equal(short?.coverage, 'none')
  assert.equal(short?.missingQuantity, 1)

  const otherServo = matchProjectInventory(servoProject, [{ componentId: 'mg90s', quantity: 2 }])
  assert.equal(otherServo.lines.find((line) => line.slug === 'sg90')?.coverage, 'none')

  const weather = authoredLines('23')
  assert.equal(weather.some((line) => line.slug === 'esp32'), false)
  assert.equal(weather.some((line) => line.slug === 'esp32-devkitc-v4'), true)
  const genericBoard = matchProjectInventory(weather, [{ componentId: 'esp32', quantity: 1 }])
  assert.equal(genericBoard.lines.find((line) => line.slug === 'esp32-devkitc-v4')?.coverage, 'none')
  const exactBoard = matchProjectInventory(weather, [{ componentId: 'esp32-devkitc-v4', quantity: 1 }])
  assert.equal(exactBoard.lines.find((line) => line.slug === 'esp32-devkitc-v4')?.coverage, 'exact')

  const rgb = authoredLines('24')
  const resistorLine = rgb.find((line) => line.slug === 'resistor-220')
  assert.ok(resistorLine)
  assert.equal(resistorLine.quantity, 3)
  const resistors = matchProjectInventory(rgb, [{ componentId: 'resistor-220', quantity: 3 }])
  assert.equal(resistors.lines.find((line) => line.slug === 'resistor-220')?.coverage, 'exact')
  assert.equal(resistors.lines.find((line) => line.slug === 'resistor-220')?.missingQuantity, 0)
  const wrongValue = matchProjectInventory(rgb, [{ componentId: 'resistor', quantity: 3 }])
  assert.equal(wrongValue.lines.find((line) => line.slug === 'resistor-220')?.coverage, 'none')
})

const ESP32_SLUGS = ['esp32-devkitc-v4', 'esp32'] as const

function quantityOf(items: readonly { slug: string; quantity: number }[], slug: string): number | null {
  const matches = items.filter((item) => item.slug === slug)
  assert.equal(matches.length <= 1, true, slug)
  return matches[0]?.quantity ?? null
}

test('one sheet can add two ESP32 variants without dropping either quantity', async () => {
  const opened = sheetQuantitiesFromBench(ESP32_SLUGS, [])
  assert.deepEqual(
    opened.map((item) => item.quantity),
    [0, 0],
  )

  const withDevkit = adjustSheetQuantity(opened, 'esp32-devkitc-v4', 3)
  assert.ok(withDevkit)
  const draft = adjustSheetQuantity(withDevkit, 'esp32', 2)
  assert.ok(draft)
  assert.equal(quantityOf(draft, 'esp32-devkitc-v4'), 3)
  assert.equal(quantityOf(draft, 'esp32'), 2)

  const bench = applySheetQuantities([{ slug: 'sg90', quantity: 2 }], draft)
  assert.ok(bench)
  assert.equal(quantityOf(bench, 'esp32-devkitc-v4'), 3)
  assert.equal(quantityOf(bench, 'esp32'), 2)
  assert.equal(quantityOf(bench, 'sg90'), 2)
  assert.equal(new Set(bench.map((item) => item.slug)).size, bench.length)

  const reopened = sheetQuantitiesFromBench(ESP32_SLUGS, bench)
  assert.equal(quantityOf(reopened, 'esp32-devkitc-v4'), 3)
  assert.equal(quantityOf(reopened, 'esp32'), 2)

  const edited = adjustSheetQuantity(reopened, 'esp32-devkitc-v4', 4)
  assert.ok(edited)
  assert.equal(quantityOf(edited, 'esp32-devkitc-v4'), 4)
  assert.equal(quantityOf(edited, 'esp32'), 2)
  assert.equal(quantityOf(bench, 'esp32-devkitc-v4'), 3, 'an unconfirmed edit leaves the bench unchanged')

  const removed = adjustSheetQuantity(edited, 'esp32', 0)
  assert.ok(removed)
  const afterRemoval = applySheetQuantities(bench, removed)
  assert.ok(afterRemoval)
  assert.equal(quantityOf(afterRemoval, 'esp32-devkitc-v4'), 4)
  assert.equal(quantityOf(afterRemoval, 'esp32'), null)
  assert.equal(quantityOf(afterRemoval, 'sg90'), 2)

  const duplicated: OnboardingComponentSelection[] = [
    { slug: 'esp32-devkitc-v4', quantity: 1 },
    { slug: 'esp32-devkitc-v4', quantity: 9 },
  ]
  const collapsed = applySheetQuantities(duplicated, [
    { slug: 'esp32-devkitc-v4', quantity: 3 },
    { slug: 'esp32', quantity: 2 },
  ])
  assert.ok(collapsed)
  assert.equal(collapsed.filter((item) => item.slug === 'esp32-devkitc-v4').length, 1)
  assert.equal(quantityOf(collapsed, 'esp32-devkitc-v4'), 3)

  assert.equal(adjustSheetQuantity(draft, 'esp32', 100), null)
  assert.equal(applySheetQuantities(bench, [{ slug: 'esp32', quantity: 0 }, { slug: 'esp32', quantity: 2 }]), null)

  const { memory, gateway } = memoryGateway()
  const saved = await saveOnboardingInventory('user-1', collapsed, gateway)
  assert.equal(saved.error, null)
  assert.equal(memory.rows.get('uuid-devkit'), 3)
  assert.equal(memory.rows.get('uuid-esp32'), 2)
  assert.equal(memory.rows.size, 2)
})

test('resistor, RGB, jumper, and STEMMA sheets keep each variant', () => {
  const groups = ['resistor', 'rgb-led', 'jumper-wires', 'stemma-qt'] as const
  for (const id of groups) {
    const group = ONBOARDING_OFFERS.find((item) => item.id === id)
    assert.ok(group, id)
    assert.equal(group.choices.length > 1, true, id)
    let draft: OnboardingSheetQuantity[] | null = sheetQuantitiesFromBench(
      group.choices.map((choice) => choice.slug),
      [],
    )
    group.choices.forEach((choice, index) => {
      assert.ok(draft)
      draft = adjustSheetQuantity(draft, choice.slug, index + 1)
    })
    assert.ok(draft)
    const bench = applySheetQuantities([], draft)
    assert.ok(bench, id)
    assert.equal(bench.length, group.choices.length, id)
    group.choices.forEach((choice, index) => {
      assert.equal(quantityOf(bench, choice.slug), index + 1, choice.slug)
    })
  }
})
