import assert from 'node:assert/strict'
// The app tsconfig does not include Node types. The test runner still reads these screens.
// @ts-expect-error node types are not part of the Expo typecheck
import { readFileSync } from 'fs'
import { test } from 'node:test'

import {
  matchProjectInventory,
  type MatchableBomLine,
  type ProjectCompatibilityData,
  type ProjectInventoryMatch,
} from './compatibility.ts'
import { joinInFlightRefresh } from './inventory-refresh.ts'
import {
  HOME_RECOMMENDATION_LIMIT,
  HOME_RECOMMENDATIONS_ALL_IN_PROGRESS,
  HOME_RECOMMENDATIONS_LOADING,
  HOME_RECOMMENDATIONS_NONE,
  compatibilityForAccount,
  homeCoverageLabel,
  homeRecommendationPresentation,
  parseSavedSkillLevel,
  planHomeRecommendations,
  skillLevelFromProfileRead,
  type HomeRecommendationProject,
  type RecommendationSkillLevel,
} from './home-recommendations.ts'
import { discoveryCoverage, listedComponentsAreOwned, projectPartsSummary } from './project-discovery.ts'

function bom(id: string, componentId: string, quantity: number, sortOrder = 1): MatchableBomLine {
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

function project(input: {
  id: string
  slug?: string
  difficulty?: RecommendationSkillLevel
  status?: HomeRecommendationProject['status']
  sortOrder?: number
  isPublished?: boolean
}): HomeRecommendationProject {
  return {
    id: input.id,
    slug: input.slug ?? input.id,
    isPublished: input.isPublished ?? true,
    difficulty: input.difficulty ?? 'beginner',
    status: input.status ?? 'not_started',
    sortOrder: input.sortOrder ?? 0,
  }
}

function ids(result: { recommendations: readonly { id: string }[] }): string[] {
  return result.recommendations.map((item) => item.id)
}

test('covered projects rank ahead of projects that are missing parts', () => {
  const coveredBom = [bom('covered-line', 'led', 1)]
  const missingBom = [bom('missing-line', 'servo', 1)]
  const matches = new Map<string, ProjectInventoryMatch>([
    ['covered', matchProjectInventory(coveredBom, [{ componentId: 'led', quantity: 1 }], null)],
    ['missing', matchProjectInventory(missingBom, [], null)],
  ])
  const ranked = planHomeRecommendations({
    projects: [
      project({ id: 'missing', sortOrder: 1 }),
      project({ id: 'covered', sortOrder: 2 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: null,
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(ranked), ['covered', 'missing'])
  assert.equal(projectPartsSummary(matches.get('covered')!, 'ready'), 'All listed components owned')
  assert.equal(listedComponentsAreOwned(matches.get('covered')!, 'ready'), true)
  assert.equal(projectPartsSummary(matches.get('covered')!, 'ready').includes('tested'), false)
})

test('fewest missing units rank first, then fewer incomplete lines', () => {
  const oneUnit = [bom('one', 'led', 1)]
  const threeUnits = [bom('three', 'wire', 3)]
  const twoLines = [bom('line-a', 'resistor', 1, 1), bom('line-b', 'cap', 1, 2)]
  const oneLine = [bom('pair', 'servo', 2)]
  const matches = new Map<string, ProjectInventoryMatch>([
    ['three', matchProjectInventory(threeUnits, [], null)],
    ['one', matchProjectInventory(oneUnit, [], null)],
    ['two-lines', matchProjectInventory(twoLines, [], null)],
    ['one-line', matchProjectInventory(oneLine, [], null)],
  ])
  assert.equal(matches.get('one')?.totalMissing, 1)
  assert.equal(matches.get('three')?.totalMissing, 3)
  assert.equal(matches.get('two-lines')?.totalMissing, 2)
  assert.equal(matches.get('two-lines')?.missingCount, 2)
  assert.equal(matches.get('one-line')?.totalMissing, 2)
  assert.equal(matches.get('one-line')?.missingCount, 1)

  const byUnits = planHomeRecommendations({
    projects: [project({ id: 'three', sortOrder: 1 }), project({ id: 'one', sortOrder: 2 })],
    matches,
    coverage: 'ready',
    skillLevel: null,
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(byUnits), ['one', 'three'])

  const byLines = planHomeRecommendations({
    projects: [project({ id: 'two-lines', sortOrder: 1 }), project({ id: 'one-line', sortOrder: 2 })],
    matches,
    coverage: 'ready',
    skillLevel: null,
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(byLines), ['one-line', 'two-lines'])
  assert.equal(projectPartsSummary(matches.get('one')!, 'ready'), 'Missing 1 LED')
})

test('an empty inventory still reports the real missing count', () => {
  const lines = [bom('led-line', 'led', 2)]
  const match = matchProjectInventory(lines, [], null)
  const ranked = planHomeRecommendations({
    projects: [project({ id: 'alarm', slug: '8' })],
    matches: new Map([['alarm', match]]),
    coverage: 'ready',
    skillLevel: 'beginner',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(ranked), ['alarm'])
  assert.equal(match.totalMissing, 2)
  assert.equal(projectPartsSummary(match, 'ready'), 'Missing 2 LEDs')
  assert.equal(listedComponentsAreOwned(match, 'ready'), false)
})

test('skill level breaks an equal inventory tie and does not beat better coverage', () => {
  const owned = matchProjectInventory([bom('owned', 'led', 1)], [{ componentId: 'led', quantity: 1 }], null)
  const missing = matchProjectInventory([bom('missing', 'servo', 1)], [], null)
  const otherMissing = matchProjectInventory([bom('other', 'wire', 1)], [], null)
  const matches = new Map<string, ProjectInventoryMatch>([
    ['beginner-owned', owned],
    ['intermediate-missing', missing],
    ['beginner-missing', otherMissing],
    ['intermediate-same', matchProjectInventory([bom('same', 'cap', 1)], [], null)],
  ])

  const skillWinsTie = planHomeRecommendations({
    projects: [
      project({ id: 'beginner-missing', difficulty: 'beginner', sortOrder: 1 }),
      project({ id: 'intermediate-same', difficulty: 'intermediate', sortOrder: 2 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: 'intermediate',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(skillWinsTie), ['intermediate-same', 'beginner-missing'])

  const coverageWins = planHomeRecommendations({
    projects: [
      project({ id: 'intermediate-missing', difficulty: 'intermediate', sortOrder: 1 }),
      project({ id: 'beginner-owned', difficulty: 'beginner', sortOrder: 2 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: 'intermediate',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(coverageWins), ['beginner-owned', 'intermediate-missing'])

  const noSkill = planHomeRecommendations({
    projects: [
      project({ id: 'beginner-missing', difficulty: 'beginner', sortOrder: 1 }),
      project({ id: 'intermediate-same', difficulty: 'intermediate', sortOrder: 2 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: null,
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(noSkill), ['beginner-missing', 'intermediate-same'])
})

test('completed projects follow unfinished ones, and Continue Building is not repeated', () => {
  const owned = matchProjectInventory([bom('owned', 'led', 1)], [{ componentId: 'led', quantity: 1 }], null)
  const missing = matchProjectInventory([bom('missing', 'servo', 1)], [], null)
  const matches = new Map<string, ProjectInventoryMatch>([
    ['done', owned],
    ['fresh', missing],
    ['building', owned],
    ['paused', missing],
  ])
  const ranked = planHomeRecommendations({
    projects: [
      project({ id: 'done', status: 'completed', sortOrder: 1 }),
      project({ id: 'fresh', sortOrder: 2 }),
      project({ id: 'building', status: 'in_progress', sortOrder: 3 }),
      project({ id: 'paused', status: 'in_progress', sortOrder: 4 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: 'advanced',
    continueProjectIds: new Set(['building']),
  })
  assert.deepEqual(ids(ranked), ['fresh', 'paused', 'done'])
  assert.equal(ranked.recommendations.some((item) => item.id === 'building'), false)
})

test('retired and unpublished projects are excluded, and an empty BOM is never fully covered', () => {
  const empty = matchProjectInventory([], [], null)
  const missing = matchProjectInventory([bom('led-line', 'led', 1)], [], null)
  const matches = new Map<string, ProjectInventoryMatch>([
    ['retired', matchProjectInventory([bom('servo', 'servo', 1)], [{ componentId: 'servo', quantity: 1 }], null)],
    ['draft', missing],
    ['empty', empty],
    ['alarm', missing],
  ])
  const ranked = planHomeRecommendations({
    projects: [
      project({ id: 'retired', slug: '18', sortOrder: 1 }),
      project({ id: 'draft', slug: '23', isPublished: false, sortOrder: 2 }),
      project({ id: 'empty', slug: '8', sortOrder: 3 }),
      project({ id: 'alarm', slug: '9', sortOrder: 4 }),
    ],
    matches,
    coverage: 'ready',
    skillLevel: 'beginner',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(ranked), ['alarm', 'empty'])
  assert.equal(ranked.eligible.some((item) => item.slug === '18' || item.slug === '23'), false)
  assert.equal(listedComponentsAreOwned(empty, 'ready'), false)
  assert.equal(projectPartsSummary(empty, 'ready'), 'Components not yet defined')
})

test('unknown coverage keeps catalogue order and never claims complete coverage', () => {
  const owned = matchProjectInventory([bom('owned', 'led', 1)], [{ componentId: 'led', quantity: 1 }], null)
  const missing = matchProjectInventory([bom('missing', 'servo', 1)], [], null)
  const projects = [
    project({ id: 'later-covered', sortOrder: 2 }),
    project({ id: 'earlier-missing', sortOrder: 1 }),
  ]
  const matches = new Map<string, ProjectInventoryMatch>([
    ['later-covered', owned],
    ['earlier-missing', missing],
  ])
  for (const coverage of ['loading', 'unavailable'] as const) {
    const ranked = planHomeRecommendations({
      projects,
      matches,
      coverage,
      skillLevel: 'advanced',
      continueProjectIds: new Set(),
    })
    assert.deepEqual(ids(ranked), ['earlier-missing', 'later-covered'])
    assert.equal(listedComponentsAreOwned(owned, coverage), false)
  }
  assert.equal(projectPartsSummary(owned, 'loading'), 'Checking inventory…')
  assert.equal(projectPartsSummary(owned, 'unavailable'), 'Parts check unavailable')

  const loading = discoveryCoverage({
    inventoryLoading: true,
    refreshPending: false,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  const failedRefresh = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: true,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: null,
  })
  const failedCompatibility = discoveryCoverage({
    inventoryLoading: false,
    refreshPending: false,
    refreshFailed: false,
    inventoryError: null,
    compatibilityPending: false,
    compatibilityError: 'Could not load compatibility',
  })
  assert.equal(loading, 'loading')
  assert.equal(failedRefresh, 'unavailable')
  assert.equal(failedCompatibility, 'unavailable')
  const duringFailure = planHomeRecommendations({
    projects,
    matches,
    coverage: failedRefresh,
    skillLevel: 'beginner',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(duringFailure), ['earlier-missing', 'later-covered'])
  assert.equal(projectPartsSummary(owned, failedRefresh), 'Parts check unavailable')
})

test('a missing, invalid, or failed skill level leaves equal projects in catalogue order', () => {
  assert.equal(parseSavedSkillLevel('beginner'), 'beginner')
  assert.equal(parseSavedSkillLevel('intermediate'), 'intermediate')
  assert.equal(parseSavedSkillLevel('advanced'), 'advanced')
  assert.equal(parseSavedSkillLevel('expert'), null)
  assert.equal(parseSavedSkillLevel(null), null)
  assert.equal(skillLevelFromProfileRead({ data: null, error: null }), null)
  assert.equal(skillLevelFromProfileRead({ data: { skill_level: 'Beginner' }, error: null }), null)
  assert.equal(skillLevelFromProfileRead({ data: { skill_level: 'advanced' }, error: 'network' }), null)

  const missing = matchProjectInventory([bom('line', 'led', 1)], [], null)
  const ranked = planHomeRecommendations({
    projects: [
      project({ id: 'first', difficulty: 'beginner', sortOrder: 1 }),
      project({ id: 'second', difficulty: 'advanced', sortOrder: 2 }),
    ],
    matches: new Map([
      ['first', missing],
      ['second', missing],
    ]),
    coverage: 'ready',
    skillLevel: skillLevelFromProfileRead({ data: null, error: 'permission denied' }),
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(ranked), ['first', 'second'])
})

test('recommendations stay short, unique, stable, and honest when the pool is small', () => {
  const missing = matchProjectInventory([bom('line', 'led', 1)], [], null)
  const projects = [1, 2, 3, 4, 5].map((sortOrder) =>
    project({ id: `p${sortOrder}`, sortOrder, difficulty: 'beginner' }),
  )
  const matches = new Map(projects.map((item) => [item.id, missing]))
  const input = {
    projects,
    matches,
    coverage: 'loading' as const,
    skillLevel: 'advanced' as const,
    continueProjectIds: new Set<string>(),
  }
  const first = planHomeRecommendations(input)
  const second = planHomeRecommendations(input)
  assert.deepEqual(ids(first), ['p1', 'p2', 'p3'])
  assert.deepEqual(ids(first), ids(second))
  assert.equal(first.recommendations.length, HOME_RECOMMENDATION_LIMIT)
  assert.equal(new Set(ids(first)).size, first.recommendations.length)

  const duplicated = planHomeRecommendations({
    ...input,
    projects: [projects[0], projects[0], projects[1]],
  })
  assert.deepEqual(ids(duplicated), ['p1', 'p2'])

  const onlyOne = planHomeRecommendations({
    projects: [project({ id: 'only', slug: '8' })],
    matches: new Map([['only', missing]]),
    coverage: 'ready',
    skillLevel: null,
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(onlyOne), ['only'])

  const none = planHomeRecommendations({
    projects: [
      project({ id: 'retired', slug: '18' }),
      project({ id: 'draft', slug: '25', isPublished: false }),
    ],
    matches: new Map(),
    coverage: 'ready',
    skillLevel: 'beginner',
    continueProjectIds: new Set(),
  })
  assert.deepEqual(ids(none), [])
  assert.deepEqual(
    homeRecommendationPresentation({
      projectsLoading: false,
      projectsError: null,
      publishedCount: 1,
      eligibleCount: none.eligible.length,
      recommendationCount: 0,
    }),
    { kind: 'empty', message: HOME_RECOMMENDATIONS_NONE },
  )
})

test('catalogue loading, failure, and an all-in-progress pool have distinct messages', () => {
  assert.deepEqual(
    homeRecommendationPresentation({
      projectsLoading: true,
      projectsError: null,
      publishedCount: 2,
      eligibleCount: 2,
      recommendationCount: 2,
    }),
    { kind: 'loading', message: HOME_RECOMMENDATIONS_LOADING },
  )
  assert.deepEqual(
    homeRecommendationPresentation({
      projectsLoading: false,
      projectsError: 'Could not load projects',
      publishedCount: 0,
      eligibleCount: 0,
      recommendationCount: 0,
    }),
    { kind: 'error', message: 'Could not load projects' },
  )
  assert.deepEqual(
    homeRecommendationPresentation({
      projectsLoading: false,
      projectsError: null,
      publishedCount: 1,
      eligibleCount: 1,
      recommendationCount: 0,
    }),
    { kind: 'empty', message: HOME_RECOMMENDATIONS_ALL_IN_PROGRESS },
  )
})

test('an in-flight inventory refresh and compatibility stay on the account that started them', async () => {
  let release: (() => void) | undefined
  const task = new Promise<string>((resolve) => {
    release = () => resolve('account-a')
  })
  const current = { accountId: 'account-a', task }
  assert.equal(joinInFlightRefresh(current, 'account-a'), task)
  assert.equal(joinInFlightRefresh(current, 'account-b'), null)
  assert.equal(joinInFlightRefresh(current, null), null)
  release?.()
  assert.equal(await task, 'account-a')

  assert.equal(compatibilityForAccount({ accountId: 'account-a', data: 'reviews' }, 'account-a'), 'reviews')
  assert.equal(compatibilityForAccount({ accountId: 'account-a', data: 'reviews' }, 'account-b'), null)
  assert.equal(compatibilityForAccount(null, 'account-a'), null)
})

function stocked(slug: string, quantity: number, owned: number, name = slug): ProjectInventoryMatch {
  return matchProjectInventory(
    [
      {
        id: `${slug}-line`,
        componentId: slug,
        slug,
        name,
        description: null,
        quantity,
        sortOrder: 1,
      },
    ],
    owned > 0 ? [{ componentId: slug, quantity: owned }] : [],
    null,
  )
}

test('home coverage wording names one missing part and counts several', () => {
  const covered = stocked('pir-sensor', 1, 1, 'PIR Motion Sensor')
  assert.equal(homeCoverageLabel(covered, 'ready'), 'All listed components owned')
  assert.equal(homeCoverageLabel(covered, 'ready').includes('tested'), false)

  const oneSensor = stocked('pir-sensor', 1, 0, 'PIR Motion Sensor')
  assert.equal(homeCoverageLabel(oneSensor, 'ready'), 'Missing 1 PIR Motion Sensor')

  const twoResistors = stocked('resistor', 2, 0, 'Resistor')
  assert.equal(homeCoverageLabel(twoResistors, 'ready'), 'Missing 2 resistors')

  const sensors = stocked('pir-sensor', 2, 0, 'PIR Motion Sensor')
  assert.equal(homeCoverageLabel(sensors, 'ready'), 'Missing 2 PIR Motion Sensors')

  const jumpers = stocked('jumper-wires', 10, 6, 'Jumper Wires')
  assert.equal(jumpers.totalMissing, 4)
  assert.equal(homeCoverageLabel(jumpers, 'ready'), 'Missing 4 Male-to-Male Jumper Wires')

  const several = matchProjectInventory(
    [
      {
        id: 'jumpers',
        componentId: 'jumpers',
        slug: 'jumper-wires',
        name: 'Jumper Wires',
        description: null,
        quantity: 3,
        sortOrder: 1,
      },
      {
        id: 'pir',
        componentId: 'pir',
        slug: 'pir-sensor',
        name: 'PIR Motion Sensor',
        description: null,
        quantity: 1,
        sortOrder: 2,
      },
    ],
    [],
    null,
  )
  assert.equal(several.totalMissing, 4)
  assert.equal(homeCoverageLabel(several, 'ready'), 'Missing 2 components')
  assert.equal(homeCoverageLabel(several, 'ready').includes('requirement'), false)

  const duplicateLines = matchProjectInventory(
    [
      {
        id: 'jumpers-a',
        componentId: 'jumpers',
        slug: 'jumper-wires',
        name: 'Jumper Wires',
        description: null,
        quantity: 2,
        sortOrder: 1,
      },
      {
        id: 'jumpers-b',
        componentId: 'jumpers',
        slug: 'jumper-wires',
        name: 'Jumper Wires',
        description: null,
        quantity: 1,
        sortOrder: 2,
      },
    ],
    [],
    null,
  )
  assert.equal(duplicateLines.lines.length, 2)
  assert.equal(homeCoverageLabel(duplicateLines, 'ready'), 'Missing 3 Male-to-Male Jumper Wires')

  const empty = matchProjectInventory([], [], null)
  assert.equal(homeCoverageLabel(empty, 'ready'), 'Components not yet defined')
  assert.equal(homeCoverageLabel({ ...covered, matchPercentage: null }, 'ready'), 'Components not yet defined')
  assert.equal(homeCoverageLabel(covered, 'loading'), 'Checking inventory…')
  assert.equal(homeCoverageLabel(covered, 'unavailable'), 'Parts check unavailable')
  assert.equal(listedComponentsAreOwned(covered, 'unavailable'), false)
})

test('a covered substitute is not described as missing', () => {
  const canonical = 'resistor'
  const substitute = 'resistor-220'
  const compatibility: ProjectCompatibilityData = {
    requirementsByBomLineId: new Map([
      [
        'bom-resistor',
        {
          id: 'req-resistor',
          policy: 'direct',
          canonicalComponentId: canonical,
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
      [canonical, { componentId: canonical, capabilities: [], pins: [] }],
      [
        substitute,
        {
          componentId: substitute,
          capabilities: [
            { capability: 'function', value: 'fixed_resistor' },
            { capability: 'resistance_ohms', value: '220' },
          ],
          pins: [],
        },
      ],
    ]),
    reviews: [{ requirementId: 'req-resistor', componentId: substitute, assessedResult: 'direct', changes: [] }],
  }
  const match = matchProjectInventory(
    [
      {
        id: 'bom-resistor',
        componentId: canonical,
        slug: canonical,
        name: 'Resistor',
        description: null,
        quantity: 1,
        sortOrder: 1,
      },
    ],
    [{ componentId: substitute, quantity: 1 }],
    compatibility,
  )
  assert.equal(match.lines[0]?.coverage, 'direct_substitute')
  assert.equal(match.lines[0]?.missingQuantity, 0)
  assert.equal(homeCoverageLabel(match, 'ready'), 'All listed components owned')
})

test('project cards render the shared summary instead of the old requirements sentence', () => {
  const cardMatch = matchProjectInventory(
    [
      {
        id: 'jumpers',
        componentId: 'jumpers',
        slug: 'jumper-wires',
        name: 'Jumper Wires',
        description: null,
        quantity: 4,
        sortOrder: 1,
      },
      {
        id: 'pir',
        componentId: 'pir',
        slug: 'pir-sensor',
        name: 'PIR Motion Sensor',
        description: null,
        quantity: 1,
        sortOrder: 2,
      },
    ],
    [],
    null,
  )
  assert.equal(cardMatch.totalMissing, 5)
  assert.equal(cardMatch.missingCount, 2)
  const summary = projectPartsSummary(cardMatch, 'ready')
  assert.equal(summary, 'Missing 2 components')
  assert.equal(homeCoverageLabel(cardMatch, 'ready'), summary)
  assert.equal(summary.includes('across'), false)

  const projectsCard = readFileSync('components/projects/ProjectListCard.tsx', 'utf8')
  const homeHook = readFileSync('hooks/use-home-recommendations.ts', 'utf8')
  const homeCard = readFileSync('components/home/HomeRecommendedCard.tsx', 'utf8')
  const summarySource = readFileSync('lib/project-discovery.ts', 'utf8')
  assert.equal(/projectPartsSummary\(match, partsState\)/.test(projectsCard), true)
  assert.equal(projectsCard.includes('across'), false)
  assert.equal(/homeCoverageLabel\(/.test(homeHook), true)
  assert.equal(homeHook.includes('across'), false)
  assert.equal(/\{partsLabel\}/.test(homeCard), true)
  assert.equal(homeCard.includes('across'), false)
  assert.equal(summarySource.includes('across'), false)
})

test('home recommendations use the shared refresh and do not request drafts', () => {
  const home = readFileSync('hooks/use-home-recommendations.ts', 'utf8')
  const screen = readFileSync('app/(tabs)/index.tsx', 'utf8')
  assert.equal(/useFocusEffect\(/.test(home), true)
  assert.equal(/reloadInventory\(\{ silent: true \}\)/.test(home), true)
  assert.equal(/fetchSavedSkillLevel\(/.test(home), true)
  assert.equal(/fetchProjectCompatibility\(/.test(home), true)
  assert.equal(/matchProjectInventory\(/.test(home), true)
  assert.equal(/fetchDraftProjects\(/.test(home), false)
  assert.equal(/fetchDraftProjects\(/.test(screen), false)
  assert.equal(screen.includes('Ready to build'), false)
  assert.equal(screen.includes('Hardware ready'), false)
  assert.equal(home.includes('.from(\'profiles\').upsert'), false)
  assert.equal(home.includes('is_published'), false)
})
