import assert from 'node:assert/strict'
// The app tsconfig does not include Node types. The test runner still reads these screens.
// @ts-expect-error node types are not part of the Expo typecheck
import { readFileSync } from 'fs'
import { test } from 'node:test'

import { shownInProjectCatalogue } from './catalogue-visibility.ts'
import { planInventoryRefresh } from './inventory-refresh.ts'
import {
  matchProjectInventory,
  type MatchableBomLine,
  type ProjectCompatibilityData,
  type ProjectInventoryMatch,
} from './compatibility.ts'
import {
  PROJECT_DIFFICULTY_OPTIONS,
  PROJECT_SORT_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  activateProjectMenu,
  difficultyMenuLabel,
  discoveryCoverage,
  discoverySections,
  draftPreviewDiagnostic,
  draftPreviewSectionVisible,
  initialProjectCatalogueFilters,
  listedComponentsAreOwned,
  orderDiscoveryProjects,
  projectCountLabel,
  projectListPresentation,
  projectMenuAnchorsFromRow,
  projectMenuButtonState,
  projectMenuFromOverlayTap,
  projectMenuOverlayMounted,
  projectMenuRowLayout,
  projectMatchesDifficulty,
  projectMatchesStatus,
  projectMenusOfferCanBuild,
  projectPartsSummary,
  resetProjectCatalogueFilters,
  selectProjectDifficulty,
  selectProjectSort,
  selectProjectStatus,
  sortMenuLabel,
  statusMenuLabel,
  type PartsCoverageState,
} from './project-discovery.ts'

const published = [
  { title: 'Motion Sensor Alarm', description: 'PIR alarm', isPublished: true, slug: '8' },
  { title: 'Servo Pan-Tilt Camera', description: 'Two servos', isPublished: true, slug: '18' },
]
const drafts = [
  { title: 'Smart Plant Monitor', description: 'Soil sensor', isPublished: false, slug: '1' },
  { title: 'ESP32 Wi-Fi Weather Station', description: 'BME280', isPublished: false, slug: '23' },
  { title: 'ESP32 Bluetooth RGB LED Controller', description: 'BLE colour', isPublished: false, slug: '24' },
]

test('published projects stay ahead of the development draft list', () => {
  const sections = discoverySections({ published, drafts, search: '', showDrafts: true })
  assert.deepEqual(
    sections.map((section) => section.id),
    ['published', 'drafts'],
  )
  assert.deepEqual(
    sections[0].projects.map((project) => project.slug),
    ['8', '18'],
  )
  assert.equal(sections[1].projects.some((project) => project.slug === '8' || project.slug === '18'), false)
  assert.equal(sections[1].projects.some((project) => project.slug === '23' || project.slug === '24'), true)
})

test('search finds a published project without leaving unrelated drafts above it', () => {
  const sections = discoverySections({ published, drafts, search: 'motion', showDrafts: true })
  assert.equal(sections[0].id, 'published')
  assert.deepEqual(
    sections[0].projects.map((project) => project.slug),
    ['8'],
  )
  assert.equal(sections.some((section) => section.id === 'drafts'), false)
})

test('unpublished projects stay out of the published section', () => {
  const sections = discoverySections({
    published: drafts,
    drafts,
    search: 'weather',
    showDrafts: true,
  })
  assert.deepEqual(sections[0].projects, [])
  assert.deepEqual(
    sections[1].projects.map((project) => project.slug),
    ['23'],
  )
})

const CANONICAL = '00000000-0000-4000-8000-000000000001'
const SUBSTITUTE = '00000000-0000-4000-8000-000000000002'
const OTHER = '00000000-0000-4000-8000-000000000003'

function bomLine(id: string, componentId: string, quantity: number, sortOrder = 1): MatchableBomLine {
  return {
    id,
    componentId,
    slug: componentId,
    name: componentId,
    description: null,
    quantity,
    sortOrder,
  }
}

function resistorCompatibility(): ProjectCompatibilityData {
  return {
    requirementsByBomLineId: new Map([
      [
        'bom-resistor',
        {
          id: 'req-resistor',
          policy: 'direct',
          canonicalComponentId: CANONICAL,
          constraints: [
            { capability: 'function', value: 'fixed_resistor' },
            { capability: 'resistance_ohms', value: '220' },
          ],
          pinRoles: [],
          quantity: 1,
        },
      ],
    ]),
    componentsById: new Map([
      [CANONICAL, { componentId: CANONICAL, capabilities: [], pins: [] }],
      [
        SUBSTITUTE,
        {
          componentId: SUBSTITUTE,
          capabilities: [
            { capability: 'function', value: 'fixed_resistor' },
            { capability: 'resistance_ohms', value: '220' },
          ],
          pins: [],
        },
      ],
      [
        OTHER,
        {
          componentId: OTHER,
          capabilities: [
            { capability: 'function', value: 'fixed_resistor' },
            { capability: 'resistance_ohms', value: '330' },
          ],
          pins: [],
        },
      ],
    ]),
    reviews: [{ requirementId: 'req-resistor', componentId: SUBSTITUTE, assessedResult: 'direct', changes: [] }],
  }
}

function owned(lines: readonly MatchableBomLine[], compatibility: ProjectCompatibilityData | null = null) {
  return matchProjectInventory(
    lines,
    lines.map((line) => ({ componentId: line.componentId, quantity: line.quantity })),
    compatibility,
  )
}

test('complete listed coverage qualifies and a missing part does not', () => {
  const lines = [bomLine('bom-led', CANONICAL, 1)]
  const complete = owned(lines)
  assert.equal(listedComponentsAreOwned(complete, 'ready'), true)
  assert.equal(projectPartsSummary(complete, 'ready'), 'All listed components owned')

  const missing = matchProjectInventory(lines, [], null)
  assert.equal(listedComponentsAreOwned(missing, 'ready'), false)
  assert.equal(projectPartsSummary(missing, 'ready'), `Missing 1 ${CANONICAL}`)
})

test('insufficient quantity and an incompatible variant do not qualify', () => {
  const lines = [bomLine('bom-servo', CANONICAL, 2)]
  const short = matchProjectInventory(lines, [{ componentId: CANONICAL, quantity: 1 }], null)
  assert.equal(short.lines[0]?.missingQuantity, 1)
  assert.equal(listedComponentsAreOwned(short, 'ready'), false)

  const resistor = [bomLine('bom-resistor', CANONICAL, 1)]
  const approved = matchProjectInventory(resistor, [{ componentId: SUBSTITUTE, quantity: 1 }], resistorCompatibility())
  assert.equal(approved.lines[0]?.coverage, 'direct_substitute')
  assert.equal(listedComponentsAreOwned(approved, 'ready'), true)

  const incompatible = matchProjectInventory(resistor, [{ componentId: OTHER, quantity: 1 }], resistorCompatibility())
  assert.equal(incompatible.lines[0]?.coverage, 'none')
  assert.equal(listedComponentsAreOwned(incompatible, 'ready'), false)
})

test('an empty BOM and unresolved coverage do not qualify', () => {
  const empty = matchProjectInventory([], [], null)
  assert.equal(empty.matchPercentage, null)
  assert.equal(listedComponentsAreOwned(empty, 'ready'), false)
  assert.equal(projectPartsSummary(empty, 'ready'), 'Components not yet defined')

  const lines = [bomLine('bom-led', CANONICAL, 1)]
  const complete = owned(lines)
  for (const coverage of ['loading', 'unavailable'] as const satisfies readonly PartsCoverageState[]) {
    assert.equal(listedComponentsAreOwned(complete, coverage), false)
  }
  assert.equal(projectPartsSummary(complete, 'loading'), 'Checking inventory…')
  assert.equal(projectPartsSummary(complete, 'unavailable'), 'Parts check unavailable')
  assert.equal(projectPartsSummary(complete, 'ready').includes('hardware'), false)
  assert.equal(projectPartsSummary(complete, 'ready').includes('tested'), false)

  const rounded: ProjectInventoryMatch = {
    ...complete,
    matchPercentage: 100,
    lines: complete.lines.map((line) => ({ ...line, isOwned: false, coverage: 'none', missingQuantity: 1 })),
    totalMissing: 1,
    missingCount: 1,
  }
  assert.equal(listedComponentsAreOwned(rounded, 'ready'), false)
})

test('fewest missing parts sorts by units, then incomplete lines, then the existing order', () => {
  const oneShort = matchProjectInventory([bomLine('a', CANONICAL, 10)], [{ componentId: CANONICAL, quantity: 9 }], null)
  const tenShort = matchProjectInventory([bomLine('b', SUBSTITUTE, 10)], [], null)
  const projects = [
    { id: 'ten', sortOrder: 1 },
    { id: 'one', sortOrder: 2 },
  ]
  const matches = new Map([
    ['ten', tenShort],
    ['one', oneShort],
  ])
  assert.deepEqual(
    orderDiscoveryProjects({ projects, matches, coverage: 'ready', canBuild: false, sort: 'fewest-missing' }).map((item) => item.id),
    ['one', 'ten'],
  )
  assert.deepEqual(
    orderDiscoveryProjects({ projects, matches, coverage: 'ready', canBuild: false, sort: 'default' }).map((item) => item.id),
    ['ten', 'one'],
  )

  const fourOnOneLine = matchProjectInventory([bomLine('wide', CANONICAL, 4)], [], null)
  const fourOnTwoLines = matchProjectInventory(
    [bomLine('left', CANONICAL, 2, 1), bomLine('right', SUBSTITUTE, 2, 2)],
    [],
    null,
  )
  assert.equal(fourOnOneLine.totalMissing, fourOnTwoLines.totalMissing)
  assert.equal(fourOnOneLine.missingCount < fourOnTwoLines.missingCount, true)
  const tiedUnits = [
    { id: 'two-lines' },
    { id: 'one-line' },
    { id: 'same-as-first' },
  ]
  const tiedMatches = new Map([
    ['two-lines', fourOnTwoLines],
    ['one-line', fourOnOneLine],
    ['same-as-first', fourOnTwoLines],
  ])
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: tiedUnits,
      matches: tiedMatches,
      coverage: 'ready',
      canBuild: false,
      sort: 'fewest-missing',
    }).map((item) => item.id),
    ['one-line', 'two-lines', 'same-as-first'],
  )
})

test('Can Build keeps difficulty, search, and publication rules', () => {
  const alarm = {
    id: 'alarm',
    slug: '8',
    title: 'Motion Sensor Alarm',
    description: 'PIR',
    isPublished: true,
    difficulty: 'intermediate',
  }
  const weather = {
    id: 'weather',
    slug: '23',
    title: 'Weather Station',
    description: 'BME280',
    isPublished: true,
    difficulty: 'beginner',
  }
  const lights = {
    id: 'lights',
    slug: '24',
    title: 'RGB Controller',
    description: 'Colour alarm',
    isPublished: true,
    difficulty: 'intermediate',
  }
  const draft = {
    id: 'draft',
    slug: '25',
    title: 'Maze',
    description: 'Motion maze',
    isPublished: false,
    difficulty: 'intermediate',
  }
  const lines = [bomLine('part', CANONICAL, 1)]
  const complete = owned(lines)
  const missing = matchProjectInventory(lines, [], null)
  const matches = new Map([
    ['alarm', complete],
    ['weather', complete],
    ['lights', missing],
    ['draft', complete],
  ])
  const byDifficulty = [alarm, weather, lights].filter((project) => project.difficulty === 'intermediate')
  const sections = discoverySections({
    published: byDifficulty,
    drafts: [draft],
    search: 'alarm',
    showDrafts: true,
  })
  const published = orderDiscoveryProjects({
    projects: sections[0].projects,
    matches,
    coverage: 'ready',
    canBuild: true,
    sort: 'default',
  })
  assert.deepEqual(published.map((project) => project.id), ['alarm'])
  assert.equal(sections.some((section) => section.projects.some((project) => project.id === 'draft')), false)

  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'not_started', isFavourite: false }), false)
  const retired = { ...alarm, id: 'retired', slug: '18', title: 'Pan Tilt' }
  const visible = [alarm, retired].filter((project) =>
    shownInProjectCatalogue({ slug: project.slug, status: 'not_started', isFavourite: false }),
  )
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: visible,
      matches,
      coverage: 'ready',
      canBuild: false,
      sort: 'default',
    }).map((project) => project.slug),
    ['8'],
  )
})

test('inventory changes and a signed-out check do not leave a false complete match', () => {
  const lines = [bomLine('servo', CANONICAL, 2)]
  const project = { id: 'servo-project' }
  const full = matchProjectInventory(lines, [{ componentId: CANONICAL, quantity: 2 }], null)
  const reduced = matchProjectInventory(lines, [{ componentId: CANONICAL, quantity: 1 }], null)
  const fullList = orderDiscoveryProjects({
    projects: [project],
    matches: new Map([[project.id, full]]),
    coverage: 'ready',
    canBuild: true,
    sort: 'default',
  })
  const reducedList = orderDiscoveryProjects({
    projects: [project],
    matches: new Map([[project.id, reduced]]),
    coverage: 'ready',
    canBuild: true,
    sort: 'default',
  })
  assert.deepEqual(fullList.map((item) => item.id), ['servo-project'])
  assert.deepEqual(reducedList, [])
  assert.equal(listedComponentsAreOwned(full, 'loading'), false)
  assert.equal(listedComponentsAreOwned(matchProjectInventory(lines, [], null), 'ready'), false)
})

test('an empty or unresolved BOM sorts after projects with known requirements', () => {
  const empty = matchProjectInventory([], [], null)
  assert.equal(empty.totalMissing, 0)
  const complete = owned([bomLine('owned', CANONICAL, 1)])
  const missing = matchProjectInventory([bomLine('short', SUBSTITUTE, 1)], [], null)
  const projects = [{ id: 'empty' }, { id: 'missing' }, { id: 'complete' }, { id: 'unknown' }]
  const matches = new Map([
    ['empty', empty],
    ['missing', missing],
    ['complete', complete],
  ])
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: 'ready',
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['complete', 'missing', 'empty', 'unknown'],
  )
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: 'ready',
      canBuild: false,
      sort: 'default',
    }).map((project) => project.id),
    ['empty', 'missing', 'complete', 'unknown'],
  )
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: 'unavailable',
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['empty', 'missing', 'complete', 'unknown'],
  )
  assert.equal(listedComponentsAreOwned(empty, 'ready'), false)
})

test('a failed inventory refresh keeps the cache and blocks a complete-parts claim', () => {
  const cached = [{ componentId: CANONICAL, quantity: 1 }]
  const lines = [bomLine('alarm', CANONICAL, 1)]
  const staleComplete = matchProjectInventory(lines, cached, null)
  assert.equal(listedComponentsAreOwned(staleComplete, 'ready'), true)

  const pending = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: true,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(pending, 'loading')
  assert.equal(projectPartsSummary(staleComplete, pending), 'Checking inventory…')
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: [{ id: 'alarm' }],
      matches: new Map([['alarm', staleComplete]]),
      coverage: pending,
      canBuild: true,
      sort: 'fewest-missing',
    }),
    [],
  )

  const failedPlan = planInventoryRefresh({
    cached,
    signedIn: true,
    silent: true,
    result: { data: null, error: 'Could not load your inventory. Please try again.' },
  })
  assert.equal(failedPlan.replaceInventory, false)
  assert.deepEqual([...failedPlan.inventory], cached)
  assert.equal(failedPlan.touchError, false)
  assert.equal(failedPlan.reportedError != null, true)

  const failed = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: failedPlan.reportedError != null,
    inventoryError: failedPlan.touchError ? failedPlan.storedError : null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(failed, 'unavailable')
  assert.equal(projectPartsSummary(staleComplete, failed), 'Parts check unavailable')
  assert.equal(listedComponentsAreOwned(staleComplete, failed), false)

  const recoveredPlan = planInventoryRefresh({
    cached,
    signedIn: true,
    silent: true,
    result: { data: [], error: null },
  })
  assert.equal(recoveredPlan.reportedError, null)
  assert.equal(recoveredPlan.replaceInventory, true)
  assert.deepEqual([...recoveredPlan.inventory], [])
  const recoveredCoverage = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: recoveredPlan.reportedError != null,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  const recoveredMatch = matchProjectInventory(lines, recoveredPlan.inventory, null)
  assert.equal(recoveredCoverage, 'ready')
  assert.equal(listedComponentsAreOwned(recoveredMatch, recoveredCoverage), false)
  assert.equal(projectPartsSummary(recoveredMatch, recoveredCoverage), `Missing 1 ${CANONICAL}`)

  const signedOut = planInventoryRefresh({
    cached,
    signedIn: false,
    silent: true,
    result: { data: null, error: 'Sign in to view your inventory.' },
  })
  assert.equal(signedOut.reportedError, null)
  assert.deepEqual([...signedOut.inventory], [])
  assert.equal(signedOut.replaceInventory, true)
})

test('a silent refocus keeps a settled parts label instead of the loading placeholder', () => {
  const lines = [
    bomLine('jumpers', 'jumper-wires', 4, 1),
    bomLine('pir', 'pir-sensor', 1, 2),
  ]
  const match = matchProjectInventory(lines, [], null)
  assert.equal(match.totalMissing, 5)
  assert.equal(match.missingCount, 2)

  const settled = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(settled, 'ready')
  assert.equal(projectPartsSummary(match, settled), 'Missing 2 components')

  const placeholder = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: true,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(projectPartsSummary(match, placeholder), 'Checking inventory…')

  const owned = matchProjectInventory(lines.slice(0, 1), [{ componentId: 'jumper-wires', quantity: 4 }], null)
  const failed = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: true,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(listedComponentsAreOwned(owned, 'ready'), true)
  assert.equal(projectPartsSummary(owned, failed), 'Parts check unavailable')

  const projectsScreen = readFileSync('app/(tabs)/projects.tsx', 'utf8')
  const homeHook = readFileSync('hooks/use-home-recommendations.ts', 'utf8')
  for (const source of [projectsScreen, homeHook]) {
    assert.equal(/useFocusEffect\(/.test(source), true)
    assert.equal(/reloadInventory\(\{ silent: true \}\)/.test(source), true)
    assert.equal(source.includes('setPartsRefreshPending(true)'), false)
    assert.equal(source.includes('setPartsRefreshFailed(false)'), false)
  }
})

test('the three dropdowns default to every status, every level, and catalogue order', () => {
  const filters = initialProjectCatalogueFilters()
  assert.equal(filters.status, 'all')
  assert.equal(filters.difficulty, 'all')
  assert.equal(filters.sort, 'default')
  assert.equal(statusMenuLabel(filters.status), 'All Statuses')
  assert.equal(difficultyMenuLabel(filters.difficulty), 'All Levels')
  assert.equal(sortMenuLabel(filters.sort), 'Default')
  assert.equal(projectMenuButtonState('status', filters).label, 'Status')
  assert.equal(projectMenuButtonState('difficulty', filters).label, 'Level')
  assert.equal(projectMenuButtonState('sort', filters).label, 'Sort')
  assert.equal(projectMenuButtonState('sort', filters).accent, false)
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: [{ id: 'later' }, { id: 'owned' }, { id: 'sooner' }],
      matches: new Map([
        ['later', matchProjectInventory([bomLine('many', CANONICAL, 3)], [], null)],
        ['owned', owned([bomLine('ready', CANONICAL, 1)])],
        ['sooner', matchProjectInventory([bomLine('one', CANONICAL, 1)], [], null)],
      ]),
      coverage: 'ready',
      canBuild: false,
      sort: filters.sort,
    }).map((project) => project.id),
    ['later', 'owned', 'sooner'],
  )
})

test('each status option matches only that progress or favourite', () => {
  assert.deepEqual(
    PROJECT_STATUS_OPTIONS.map((option) => option.label),
    ['All Statuses', 'In Progress', 'Favourites', 'Completed'],
  )
  assert.equal(projectMatchesStatus({ status: 'all', progress: 'not_started', isFavourite: false }), true)
  assert.equal(projectMatchesStatus({ status: 'in_progress', progress: 'in_progress', isFavourite: false }), true)
  assert.equal(projectMatchesStatus({ status: 'in_progress', progress: 'completed', isFavourite: true }), false)
  assert.equal(projectMatchesStatus({ status: 'favourites', progress: 'not_started', isFavourite: true }), true)
  assert.equal(projectMatchesStatus({ status: 'favourites', progress: 'in_progress', isFavourite: false }), false)
  assert.equal(projectMatchesStatus({ status: 'completed', progress: 'completed', isFavourite: false }), true)
  assert.equal(projectMatchesStatus({ status: 'completed', progress: 'in_progress', isFavourite: true }), false)
})

test('each difficulty option matches only that level', () => {
  assert.deepEqual(
    PROJECT_DIFFICULTY_OPTIONS.map((option) => option.label),
    ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
  )
  for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
    assert.equal(projectMatchesDifficulty('all', level), true)
    assert.equal(projectMatchesDifficulty(level, level), true)
  }
  assert.equal(projectMatchesDifficulty('beginner', 'advanced'), false)
  assert.equal(projectMatchesDifficulty('intermediate', 'beginner'), false)
  assert.equal(projectMatchesDifficulty('advanced', 'intermediate'), false)
})

test('Fewest Missing Parts keeps covered projects and orders the rest by missing units', () => {
  const filters = selectProjectSort(initialProjectCatalogueFilters(), 'fewest-missing')
  assert.equal(sortMenuLabel(filters.sort), 'Fewest Missing Parts')
  assert.deepEqual(
    PROJECT_SORT_OPTIONS.map((option) => option.label),
    ['Default', 'Fewest Missing Parts'],
  )
  const projects = [{ id: 'several' }, { id: 'covered' }, { id: 'one' }, { id: 'empty' }]
  const matches = new Map([
    ['several', matchProjectInventory([bomLine('many', CANONICAL, 3)], [], null)],
    ['covered', owned([bomLine('ready', CANONICAL, 1)])],
    ['one', matchProjectInventory([bomLine('short', CANONICAL, 1)], [], null)],
    ['empty', matchProjectInventory([], [], null)],
  ])
  assert.equal(listedComponentsAreOwned(matches.get('covered')!, 'ready'), true)
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: 'ready',
      canBuild: false,
      sort: filters.sort,
    }).map((project) => project.id),
    ['covered', 'one', 'several', 'empty'],
  )
  const tied = [
    { id: 'two-lines' },
    { id: 'one-line' },
  ]
  const fourOnOneLine = matchProjectInventory([bomLine('wide', CANONICAL, 4)], [], null)
  const fourOnTwoLines = matchProjectInventory(
    [bomLine('left', CANONICAL, 2, 1), bomLine('right', SUBSTITUTE, 2, 2)],
    [],
    null,
  )
  assert.equal(fourOnOneLine.totalMissing, fourOnTwoLines.totalMissing)
  assert.equal(fourOnOneLine.missingCount < fourOnTwoLines.missingCount, true)
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: tied,
      matches: new Map([
        ['two-lines', fourOnTwoLines],
        ['one-line', fourOnOneLine],
      ]),
      coverage: 'ready',
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['one-line', 'two-lines'],
  )
  assert.deepEqual(
    orderDiscoveryProjects({
      projects: [{ id: 'second' }, { id: 'first' }],
      matches: new Map([
        ['second', matchProjectInventory([bomLine('a', CANONICAL, 2)], [], null)],
        ['first', matchProjectInventory([bomLine('b', CANONICAL, 2)], [], null)],
      ]),
      coverage: 'ready',
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['second', 'first'],
  )
})

test('status, difficulty, and search narrow the same catalogue without changing sort', () => {
  const filters = selectProjectSort(
    selectProjectDifficulty(selectProjectStatus(initialProjectCatalogueFilters(), 'in_progress'), 'beginner'),
    'fewest-missing',
  )
  const projects = [
    {
      id: 'kept',
      title: 'Motion Sensor Alarm',
      description: 'PIR',
      isPublished: true,
      difficulty: 'beginner' as const,
      progress: 'in_progress' as const,
      isFavourite: false,
    },
    {
      id: 'other-level',
      title: 'Motion Servo',
      description: 'Pan',
      isPublished: true,
      difficulty: 'advanced' as const,
      progress: 'in_progress' as const,
      isFavourite: false,
    },
    {
      id: 'finished',
      title: 'Motion Done',
      description: 'Alarm',
      isPublished: true,
      difficulty: 'beginner' as const,
      progress: 'completed' as const,
      isFavourite: true,
    },
  ]
  const visible = projects.filter(
    (project) =>
      projectMatchesStatus({
        status: filters.status,
        progress: project.progress,
        isFavourite: project.isFavourite,
      }) && projectMatchesDifficulty(filters.difficulty, project.difficulty),
  )
  const sections = discoverySections({ published: visible, drafts: [], search: 'alarm', showDrafts: false })
  assert.deepEqual(sections[0].projects.map((project) => project.id), ['kept'])
  assert.equal(filters.sort, 'fewest-missing')
  assert.equal(projectMatchesStatus({ status: 'favourites', progress: 'not_started', isFavourite: true }), true)
  assert.equal(projectMatchesDifficulty('intermediate', 'intermediate'), true)
})

test('the project menus do not offer Can Build', () => {
  assert.equal(projectMenusOfferCanBuild(), false)
  assert.equal(PROJECT_SORT_OPTIONS.some((option) => option.id === 'default'), true)
  assert.equal(PROJECT_SORT_OPTIONS.some((option) => option.id === 'fewest-missing'), true)
  const covered = owned([bomLine('ready', CANONICAL, 1)])
  assert.equal(listedComponentsAreOwned(covered, 'ready'), true)
  assert.equal(projectPartsSummary(covered, 'ready'), 'All listed components owned')
})

test('closing a menu keeps the selection and reset clears only the dropdowns', () => {
  const search = 'alarm'
  const selected = selectProjectSort(
    selectProjectDifficulty(selectProjectStatus(initialProjectCatalogueFilters(), 'favourites'), 'intermediate'),
    'fewest-missing',
  )
  assert.equal(selected.status, 'favourites')
  assert.equal(selected.difficulty, 'intermediate')
  assert.equal(selected.sort, 'fewest-missing')
  assert.deepEqual(resetProjectCatalogueFilters(), initialProjectCatalogueFilters())
  assert.equal(selected.sort, 'fewest-missing')
  assert.equal(search, 'alarm')
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'not_started', isFavourite: false }), false)
  assert.equal(shownInProjectCatalogue({ slug: '18', status: 'in_progress', isFavourite: false }), true)
})

test('an empty catalogue is distinct from selectors that hide published projects', () => {
  const base = {
    projectsLoading: false,
    projectsError: null,
    searchActive: false,
    statusActive: false,
    difficultyActive: false,
  }
  const nonePublished = projectListPresentation({ ...base, catalogueCount: 0, visibleCount: 0 })
  assert.equal(nonePublished.kind, 'empty')
  if (nonePublished.kind === 'empty') {
    assert.equal(nonePublished.title, 'No published projects')
    assert.equal(nonePublished.resetFilters, false)
  }
  const noMatch = projectListPresentation({
    ...base,
    catalogueCount: 1,
    visibleCount: 0,
    difficultyActive: true,
  })
  assert.equal(noMatch.kind, 'empty')
  if (noMatch.kind === 'empty') {
    assert.equal(noMatch.title, 'No matching projects')
    assert.equal(noMatch.description, 'Try another difficulty.')
    assert.equal(noMatch.resetFilters, true)
  }
  const statusOnly = projectListPresentation({
    ...base,
    catalogueCount: 1,
    visibleCount: 0,
    statusActive: true,
  })
  assert.equal(statusOnly.kind, 'empty')
  if (statusOnly.kind === 'empty') {
    assert.equal(statusOnly.resetFilters, true)
    assert.equal(statusOnly.description, 'Try another project status.')
  }
  const searchOnly = projectListPresentation({
    ...base,
    catalogueCount: 1,
    visibleCount: 0,
    searchActive: true,
  })
  assert.equal(searchOnly.kind, 'empty')
  if (searchOnly.kind === 'empty') {
    assert.equal(searchOnly.resetFilters, false)
    assert.equal(searchOnly.description, 'Try a different search.')
  }
})

test('loading and a failed refresh do not sort unknown coverage as complete', () => {
  const projects = [{ id: 'later' }, { id: 'sooner' }]
  const matches = new Map([
    ['later', matchProjectInventory([bomLine('many', CANONICAL, 3)], [], null)],
    ['sooner', owned([bomLine('ready', CANONICAL, 1)])],
  ])
  const loading = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: true,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(loading, 'loading')
  assert.equal(listedComponentsAreOwned(matches.get('sooner')!, loading), false)
  assert.equal(projectPartsSummary(matches.get('sooner')!, loading), 'Checking inventory…')
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: loading,
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['later', 'sooner'],
  )
  const failed = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: true,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  assert.equal(failed, 'unavailable')
  assert.equal(projectPartsSummary(matches.get('sooner')!, failed), 'Parts check unavailable')
  assert.deepEqual(
    orderDiscoveryProjects({
      projects,
      matches,
      coverage: failed,
      canBuild: false,
      sort: 'fewest-missing',
    }).map((project) => project.id),
    ['later', 'sooner'],
  )
  const presentation = projectListPresentation({
    projectsLoading: true,
    projectsError: null,
    catalogueCount: 0,
    visibleCount: 0,
    searchActive: false,
    statusActive: true,
    difficultyActive: true,
  })
  assert.equal(presentation.kind, 'loading')
})

test('unauthorised accounts do not get a draft section and authorised previews still do', () => {
  assert.equal(draftPreviewSectionVisible({ requested: true, authorized: false }), false)
  assert.equal(draftPreviewSectionVisible({ requested: false, authorized: true }), false)
  assert.equal(draftPreviewSectionVisible({ requested: true, authorized: true }), true)
  const hidden = discoverySections({
    published,
    drafts,
    search: '',
    showDrafts: draftPreviewSectionVisible({ requested: true, authorized: false }),
  })
  assert.deepEqual(hidden.map((section) => section.id), ['published'])
  const shown = discoverySections({
    published,
    drafts,
    search: '',
    showDrafts: draftPreviewSectionVisible({ requested: true, authorized: true }),
  })
  assert.deepEqual(shown.map((section) => section.id), ['published', 'drafts'])
  assert.equal(shown[1].projects.length, drafts.length)
  const userId = '11111111-1111-4111-8111-111111111111'
  const diagnostic = draftPreviewDiagnostic({ userId, error: 'permission denied' })
  assert.equal(diagnostic.includes(userId), true)
  assert.equal(diagnostic.includes('draft_previewers'), true)
  assert.equal(shown[0].projects.some((project) => project.slug === '8'), true)
})

test('dropdown taps open, close, switch, and leave no overlay behind', () => {
  const anchors = [
    { menu: 'status' as const, x: 20, y: 120, width: 90, height: 44 },
    { menu: 'difficulty' as const, x: 118, y: 120, width: 90, height: 44 },
    { menu: 'sort' as const, x: 216, y: 120, width: 90, height: 44 },
  ]
  let open = activateProjectMenu(null, 'status')
  assert.equal(open, 'status')
  assert.equal(projectMenuOverlayMounted(open), true)
  open = activateProjectMenu(open, 'status')
  assert.equal(open, null)
  assert.equal(projectMenuOverlayMounted(open), false)

  open = activateProjectMenu(null, 'status')
  open = projectMenuFromOverlayTap(open, anchors, 140, 130)
  assert.equal(open, 'difficulty')
  assert.equal(projectMenuOverlayMounted(open), true)
  open = projectMenuFromOverlayTap(open, anchors, 10, 10)
  assert.equal(open, null)
  assert.equal(projectMenuOverlayMounted(open), false)

  open = activateProjectMenu(null, 'sort')
  open = activateProjectMenu(open, 'status')
  open = activateProjectMenu(open, 'difficulty')
  open = projectMenuFromOverlayTap(open, anchors, 230, 140)
  open = activateProjectMenu(open, 'sort')
  assert.equal(open, null)
  assert.equal(projectMenuOverlayMounted(open), false)
})

test('closed dropdowns stay neutral and keep their selection', () => {
  const filters = selectProjectSort(
    selectProjectDifficulty(selectProjectStatus(initialProjectCatalogueFilters(), 'favourites'), 'intermediate'),
    'fewest-missing',
  )
  for (const menu of ['status', 'difficulty', 'sort'] as const) {
    assert.equal(projectMenuButtonState(menu, filters).accent, false)
  }
  assert.equal(projectMenuButtonState('status', filters).accessibilityLabel, 'Status, Favourites')
  assert.equal(projectMenuButtonState('difficulty', filters).accessibilityLabel, 'Level, Intermediate')
  assert.equal(projectMenuButtonState('sort', filters).accessibilityLabel, 'Sort, Fewest Missing Parts')
  assert.equal(projectMenuButtonState('status', filters).selected, true)
  assert.equal(projectMenuButtonState('sort', initialProjectCatalogueFilters()).selected, false)
  const open = activateProjectMenu(activateProjectMenu(null, 'status'), 'status')
  assert.equal(open, null)
  assert.equal(filters.status, 'favourites')
  assert.equal(filters.sort, 'fewest-missing')
})

test('closed labels name the current selection', () => {
  const wide = 350
  const narrow = 280
  const initial = initialProjectCatalogueFilters()
  assert.deepEqual(
    projectMenuRowLayout(initial, wide).buttons.map((button) => button.label),
    ['Status', 'Level', 'Sort'],
  )
  assert.equal(projectMenuButtonState('status', selectProjectStatus(initial, 'in_progress'), wide).label, 'In Progress')
  assert.equal(projectMenuButtonState('status', selectProjectStatus(initial, 'favourites'), wide).label, 'Favourites')
  assert.equal(projectMenuButtonState('status', selectProjectStatus(initial, 'completed'), wide).label, 'Completed')
  assert.equal(projectMenuButtonState('difficulty', selectProjectDifficulty(initial, 'beginner'), wide).label, 'Beginner')
  assert.equal(projectMenuButtonState('difficulty', selectProjectDifficulty(initial, 'intermediate'), wide).label, 'Intermediate')
  assert.equal(projectMenuButtonState('difficulty', selectProjectDifficulty(initial, 'advanced'), wide).label, 'Advanced')
  assert.equal(projectMenuButtonState('sort', selectProjectSort(initial, 'default'), wide).label, 'Sort')
  assert.equal(projectMenuButtonState('sort', selectProjectSort(initial, 'fewest-missing'), wide).label, 'Fewest Missing')

  let filters = initial
  assert.equal(projectMenuButtonState('status', filters, narrow).label, 'Status')
  filters = selectProjectStatus(filters, 'completed')
  assert.equal(projectMenuButtonState('status', filters, narrow).label, 'Completed')
  assert.equal(filters.status, 'completed')
})

test('long labels stay full when they fit and abbreviate only together at 320 points', () => {
  const filters = selectProjectSort(
    selectProjectDifficulty(selectProjectStatus(initialProjectCatalogueFilters(), 'in_progress'), 'intermediate'),
    'fewest-missing',
  )
  const narrow = projectMenuRowLayout(filters, 280)
  const wide = projectMenuRowLayout(filters, 350)
  assert.deepEqual(
    narrow.buttons.map((button) => button.label),
    ['In Prog.', 'Intermed.', 'Fewest'],
  )
  assert.deepEqual(
    wide.buttons.map((button) => button.label),
    ['In Progress', 'Intermediate', 'Fewest'],
  )
  assert.equal(narrow.buttons[0].accessibilityLabel, 'Status, In Progress')
  assert.equal(narrow.buttons[1].accessibilityLabel, 'Level, Intermediate')
  assert.equal(narrow.buttons[2].accessibilityLabel, 'Sort, Fewest Missing Parts')
  assert.deepEqual(
    PROJECT_STATUS_OPTIONS.map((option) => option.label),
    ['All Statuses', 'In Progress', 'Favourites', 'Completed'],
  )
  for (const contentWidth of [280, 350]) {
    const buttons = projectMenuRowLayout(filters, contentWidth).buttons
    const occupied = buttons.reduce((sum, button) => sum + button.width, 0) + 8 * 2
    assert.equal(occupied, contentWidth)
    for (const button of buttons) {
      assert.equal(button.width >= 44, true)
      assert.equal(button.accent, false)
    }
  }
  assert.equal(
    projectMenuButtonState('difficulty', selectProjectDifficulty(initialProjectCatalogueFilters(), 'intermediate'), 280).label,
    'Intermediate',
  )
})

test('menu hitboxes follow the widths after a selection changes', () => {
  const long = selectProjectSort(
    selectProjectDifficulty(selectProjectStatus(initialProjectCatalogueFilters(), 'in_progress'), 'intermediate'),
    'fewest-missing',
  )
  const place = (filters: ReturnType<typeof initialProjectCatalogueFilters>) =>
    projectMenuAnchorsFromRow({
      buttons: projectMenuRowLayout(filters, 280).buttons,
      x: 20,
      y: 120,
      gap: 8,
      height: 44,
    })
  const selected = place(long)
  const cleared = place(initialProjectCatalogueFilters())
  const selectedSort = selected.find((anchor) => anchor.menu === 'sort')
  const clearedSort = cleared.find((anchor) => anchor.menu === 'sort')
  if (!selectedSort || !clearedSort) {
    throw new Error('missing sort anchor')
  }
  assert.equal(selectedSort.x === clearedSort.x, false)
  const center = clearedSort.x + Math.floor(clearedSort.width / 2)
  assert.equal(projectMenuFromOverlayTap('status', cleared, center, clearedSort.y + 4), 'sort')
  assert.equal(projectMenuFromOverlayTap('status', selected, selected[1].x + 2, selected[1].y + 4), 'difficulty')
})

test('project counts use singular and plural labels', () => {
  assert.equal(projectCountLabel(0), '0 projects')
  assert.equal(projectCountLabel(1), '1 project')
  assert.equal(projectCountLabel(2), '2 projects')
})
