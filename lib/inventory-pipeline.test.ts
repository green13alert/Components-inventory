import assert from 'node:assert/strict'
// The app tsconfig does not include Node types. The test runner still reads these screens.
// @ts-expect-error node types are not part of the Expo typecheck
import { readFileSync } from 'fs'
import { test } from 'node:test'

import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import { LISTED_PARTS_COMPLETE, listedPartsLabel } from '../constants/parts-match.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { CAPABILITY_BACKFILL } from './capability-backfill.ts'
import { matchProjectInventory, type MatchableBomLine, type ProjectInventoryMatch } from './compatibility.ts'
import {
  ONBOARDING_SAVE_ERRORS,
  planOnboardingInventoryInserts,
  saveOnboardingInventory,
  type CatalogueIdentity,
  type OnboardingComponentSelection,
  type OnboardingInventoryInsert,
} from './onboarding-inventory.ts'
import type { AuthoredProjectInput } from './project-authoring.ts'

/**
 * Inventory identity from onboarding through the matcher.
 *
 * Catalogue slugs are not used as component ids. Each slug gets its own UUID,
 * the same way `public.components.id` is distinct from `components.slug`.
 * BOM lines take that UUID as `componentId` and keep the slug for display,
 * which is what `mapProjectComponentRow` does with `project_components.component_id`
 * and the joined catalogue slug. Inventory rows take the UUID returned by the
 * onboarding insert plan. `matchProjectInventory` is the production matcher.
 *
 * No Supabase connection is opened.
 */

const PROJECT_SLUGS = ['8', '18', '23', '24', '25'] as const

type Stock = { componentId: string; quantity: number }

function authored(slug: string): AuthoredProjectInput {
  const project = localAuthoredProjects().find((item) => item.slug === slug)
  assert.ok(project, slug)
  return project
}

function quantityOf(project: AuthoredProjectInput, slug: string): number {
  const line = project.bom.find((item) => item.slug === slug)
  assert.ok(line, `${project.slug} ${slug}`)
  return line.quantity
}

function catalogueIds(slugs: readonly string[]): Map<string, string> {
  const ids = new Map<string, string>()
  for (const [index, slug] of [...slugs].sort().entries()) {
    const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
    assert.equal(id === slug, false, slug)
    ids.set(slug, id)
  }
  assert.equal(new Set(ids.values()).size, ids.size)
  return ids
}

function bomLines(project: AuthoredProjectInput, ids: ReadonlyMap<string, string>): MatchableBomLine[] {
  return project.bom.map((item, index) => {
    const componentId = ids.get(item.slug)
    assert.ok(componentId, item.slug)
    const catalogue = getCatalogueComponent(item.slug)
    assert.ok(catalogue, item.slug)
    return {
      id: `bom-${project.slug}-${item.slug}`,
      componentId,
      slug: item.slug,
      name: catalogue.name,
      description: catalogue.description,
      quantity: item.quantity,
      sortOrder: index + 1,
    }
  })
}

function stock(ids: ReadonlyMap<string, string>, slug: string, quantity: number): Stock {
  const componentId = ids.get(slug)
  assert.ok(componentId, slug)
  return { componentId, quantity }
}

function line(match: ProjectInventoryMatch, slug: string) {
  const row = match.lines.find((item) => item.slug === slug)
  assert.ok(row, slug)
  return row
}

function rowsFor(ids: ReadonlyMap<string, string>, slugs: readonly string[]): CatalogueIdentity[] {
  return slugs.map((slug) => {
    const id = ids.get(slug)
    assert.ok(id, slug)
    return { id, slug }
  })
}

async function persist(
  items: readonly OnboardingComponentSelection[],
  rows: readonly CatalogueIdentity[],
): Promise<{ error: string | null; inserted: OnboardingInventoryInsert[] }> {
  const inserted: OnboardingInventoryInsert[] = []
  const result = await saveOnboardingInventory('user-1', items, {
    findCatalogueBySlug: async (slugs) => ({
      rows: rows.filter((row) => slugs.includes(row.slug)),
      error: null,
    }),
    findOwned: async () => ({ rows: [], error: null }),
    insertMissing: async (_userId, next) => {
      inserted.push(...next)
      return { error: null, conflict: false }
    },
  })
  return { error: result.error, inserted }
}

const projects = PROJECT_SLUGS.map((slug) => authored(slug))
const catalogueSlugs = [...new Set(projects.flatMap((project) => project.bom.map((item) => item.slug)))]
const ids = catalogueIds([...catalogueSlugs, 'esp32', 'resistor'])
const catalogues = new Map(projects.map((project) => [project.slug, bomLines(project, ids)]))

test('authored BOM quantities stay on distinct catalogue UUIDs', () => {
  const project8 = authored('8')
  const project18 = authored('18')
  const project23 = authored('23')
  const project24 = authored('24')
  const project25 = authored('25')

  assert.equal(quantityOf(project8, 'resistor-220'), 1)
  assert.equal(quantityOf(project18, 'sg90'), 2)
  assert.equal(quantityOf(project18, 'jumper-wires'), 14)
  assert.equal(quantityOf(project23, 'esp32-devkitc-v4'), 1)
  assert.equal(project23.bom.some((item) => item.slug === 'esp32'), false)
  assert.equal(quantityOf(project24, 'resistor-220'), 3)
  assert.equal(quantityOf(project24, 'resistor-1k'), 3)
  assert.equal(quantityOf(project25, 'max7219'), 1)
  assert.equal(quantityOf(project25, 'jumper-wires'), 2)
  assert.equal(quantityOf(project25, 'jumper-male-female'), 10)
  assert.equal(getCatalogueComponent('jumper-male-male'), undefined)

  for (const project of projects) {
    assert.equal(project.hardwareTested, false, project.slug)
    const lines = catalogues.get(project.slug)
    assert.ok(lines)
    const componentIds = lines.map((item) => item.componentId)
    assert.equal(new Set(componentIds).size, componentIds.length, project.slug)
    for (const item of lines) {
      assert.equal(item.componentId === item.slug, false)
      assert.equal(item.quantity, quantityOf(project, item.slug))
    }
  }

  assert.equal(ids.get('esp32') === ids.get('esp32-devkitc-v4'), false)
  assert.equal(ids.get('resistor') === ids.get('resistor-220'), false)
  assert.equal(ids.get('resistor-220') === ids.get('resistor-1k'), false)
  assert.equal(ids.get('jumper-wires') === ids.get('jumper-male-female'), false)

  const matrix = getCatalogueComponent('max7219')
  assert.ok(matrix)
  assert.equal(/FC-16/.test(matrix.description), true)
  assert.equal(
    CAPABILITY_BACKFILL.some(
      (row) => row.slug === 'max7219' && row.capability === 'physical_form' && row.value === 'fc16_male_header',
    ),
    true,
  )
})

test('project 18 servo quantity is covered only while two SG90s are stored', async () => {
  const lines = catalogues.get('18')
  assert.ok(lines)
  const saved = await persist([{ slug: 'sg90', quantity: 2 }], rowsFor(ids, ['sg90']))
  assert.equal(saved.error, null)
  assert.deepEqual(saved.inserted, [stock(ids, 'sg90', 2)])

  const covered = matchProjectInventory(lines, saved.inserted, null)
  const servo = line(covered, 'sg90')
  assert.equal(servo.componentId, ids.get('sg90'))
  assert.equal(servo.ownedQuantity, 2)
  assert.equal(servo.missingQuantity, 0)
  assert.equal(servo.isOwned, true)

  const reduced = matchProjectInventory(lines, [stock(ids, 'sg90', 1)], null)
  const short = line(reduced, 'sg90')
  assert.equal(short.ownedQuantity, 1)
  assert.equal(short.missingQuantity, 1)
  assert.equal(short.isOwned, false)
  assert.equal(reduced.missingCount > 0, true)
})

test('project 23 keeps the DevKitC requirement missing for a generic ESP32 UUID', async () => {
  const lines = catalogues.get('23')
  assert.ok(lines)
  const catalogue = rowsFor(ids, ['esp32', 'esp32-devkitc-v4']).reverse()
  const generic = await persist([{ slug: 'esp32', quantity: 1 }], catalogue)
  assert.equal(generic.error, null)
  assert.deepEqual(generic.inserted, [stock(ids, 'esp32', 1)])

  const unmatched = matchProjectInventory(lines, generic.inserted, null)
  const missing = line(unmatched, 'esp32-devkitc-v4')
  assert.equal(missing.componentId, ids.get('esp32-devkitc-v4'))
  assert.equal(missing.isOwned, false)
  assert.equal(missing.missingQuantity, 1)

  const specific = await persist([{ slug: 'esp32-devkitc-v4', quantity: 1 }], catalogue)
  assert.deepEqual(specific.inserted, [stock(ids, 'esp32-devkitc-v4', 1)])
  const matched = matchProjectInventory(lines, specific.inserted, null)
  const board = line(matched, 'esp32-devkitc-v4')
  assert.equal(board.isOwned, true)
  assert.equal(board.missingQuantity, 0)
  assert.equal(board.ownedQuantity, 1)
})

test('project 24 resistor values stay on separate catalogue rows', async () => {
  const lines = catalogues.get('24')
  assert.ok(lines)
  const catalogue = rowsFor(ids, ['resistor', 'resistor-220', 'resistor-1k'])
  const saved = await persist(
    [
      { slug: 'resistor-220', quantity: 3 },
      { slug: 'resistor-1k', quantity: 3 },
    ],
    catalogue,
  )
  assert.equal(saved.error, null)
  assert.deepEqual(saved.inserted, [stock(ids, 'resistor-220', 3), stock(ids, 'resistor-1k', 3)])

  const matched = matchProjectInventory(lines, saved.inserted, null)
  assert.equal(line(matched, 'resistor-220').missingQuantity, 0)
  assert.equal(line(matched, 'resistor-1k').missingQuantity, 0)

  const changed = matchProjectInventory(
    lines,
    [stock(ids, 'resistor-220', 2), stock(ids, 'resistor-1k', 3)],
    null,
  )
  assert.equal(line(changed, 'resistor-220').missingQuantity, 1)
  assert.equal(line(changed, 'resistor-220').ownedQuantity, 2)
  assert.equal(line(changed, 'resistor-1k').missingQuantity, 0)
  assert.equal(line(changed, 'resistor-1k').ownedQuantity, 3)

  const generic = matchProjectInventory(lines, [stock(ids, 'resistor', 6)], null)
  assert.equal(line(generic, 'resistor-220').isOwned, false)
  assert.equal(line(generic, 'resistor-1k').isOwned, false)
})

test('project 25 male-to-female jumpers do not cover male-to-male jumpers', () => {
  const lines = catalogues.get('25')
  assert.ok(lines)
  const match = matchProjectInventory(
    lines,
    [stock(ids, 'jumper-male-female', 10), stock(ids, 'jumper-wires', 1)],
    null,
  )
  const maleToMale = line(match, 'jumper-wires')
  const maleToFemale = line(match, 'jumper-male-female')
  assert.equal(maleToMale.componentId, ids.get('jumper-wires'))
  assert.equal(maleToMale.missingQuantity, 1)
  assert.equal(maleToMale.isOwned, false)
  assert.equal(maleToFemale.missingQuantity, 0)
  assert.equal(maleToFemale.isOwned, true)
  assert.equal(line(match, 'max7219').componentId, ids.get('max7219'))
  assert.equal(line(match, 'max7219').isOwned, false)
})

test('an unresolved onboarding slug is not saved as another component', async () => {
  const inserted: OnboardingInventoryInsert[] = []
  const unknown = await saveOnboardingInventory('user-1', [{ slug: 'jumper-male-male', quantity: 2 }], {
    findCatalogueBySlug: async () => ({ rows: rowsFor(ids, ['jumper-wires']), error: null }),
    findOwned: async () => ({ rows: [], error: null }),
    insertMissing: async (_userId, next) => {
      inserted.push(...next)
      return { error: null, conflict: false }
    },
  })
  assert.equal(unknown.error, ONBOARDING_SAVE_ERRORS.missingComponents)
  assert.deepEqual(inserted, [])

  const swapped = await persist([{ slug: 'esp32', quantity: 1 }], rowsFor(ids, ['esp32-devkitc-v4']))
  assert.equal(swapped.error, ONBOARDING_SAVE_ERRORS.missingComponents)
  assert.deepEqual(swapped.inserted, [])

  const ambiguous = planOnboardingInventoryInserts(
    [{ slug: 'max7219', quantity: 1 }],
    [
      { id: ids.get('max7219') ?? '', slug: 'max7219' },
      { id: '99999999-9999-4999-8999-999999999999', slug: 'max7219' },
    ],
    [],
  )
  assert.equal(ambiguous.ok, false)
})

test('the next match uses the inventory loaded after a change', () => {
  const lines = catalogues.get('18')
  assert.ok(lines)
  const before = matchProjectInventory(lines, [stock(ids, 'sg90', 2)], null)
  const after = matchProjectInventory(lines, [stock(ids, 'sg90', 1)], null)
  assert.equal(line(before, 'sg90').missingQuantity, 0)
  assert.equal(line(after, 'sg90').missingQuantity, 1)
  assert.equal(before.missingCount === after.missingCount, false)

  const projectsScreen = readFileSync('app/(tabs)/projects.tsx', 'utf8')
  const detailScreen = readFileSync('app/project/[id].tsx', 'utf8')
  for (const source of [projectsScreen, detailScreen]) {
    assert.equal(/useFocusEffect\(/.test(source), true)
    assert.equal(/reloadInventory\(\{ silent: true \}\)/.test(source), true)
  }
  assert.equal(detailScreen.includes('LISTED_PARTS_COMPLETE'), true)
  assert.equal(projectsScreen.includes('% ready'), false)
  assert.equal(detailScreen.includes('You have all the parts needed!'), false)
})

test('a complete parts label describes listed components', () => {
  assert.equal(LISTED_PARTS_COMPLETE, 'You have every listed component.')
  assert.equal(listedPartsLabel(100, 9, 9), '100% of listed parts · 9/9 available')
  assert.equal(LISTED_PARTS_COMPLETE.includes('needed'), false)
  assert.equal(listedPartsLabel(50, 1, 2).includes('ready'), false)
})
