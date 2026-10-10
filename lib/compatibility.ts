/**
 * Pure compatibility evaluation for one project requirement and one inventory component.
 *
 * This module does not query Supabase.
 * Authored capability rows, pin rows, and substitution reviews are inputs.
 * Missing rows stay unknown. They are never filled in from names or categories.
 */

export type SubstitutionPolicy = 'exact' | 'direct' | 'conditional'

export type CompatibilityMatchKind =
  | 'exact'
  | 'direct_substitute'
  | 'conditional_substitute'
  | 'incompatible'
  | 'not_supported'
  | 'insufficient_quantity'

export type ReviewAssessment = 'direct' | 'conditional' | 'incompatible'

export type CompatibilityChangeKind =
  | 'board_package'
  | 'pin_map'
  | 'code'
  | 'wiring'
  | 'diagram'
  | 'supply'
  | 'troubleshooting'
  | 'visual'
  | 'mechanical'

export type CompatibilityReasonCode =
  | 'canonical_component'
  | 'policy_exact'
  | 'constraint_failed'
  | 'capability_unknown'
  | 'pin_unverified'
  | 'pin_function_missing'
  | 'review_missing'
  | 'review_incompatible'
  | 'review_direct_invalid'
  | 'review_conditional_incomplete'
  | 'policy_ceiling'
  | 'instruction_difference_uncovered'
  | 'direct_review'
  | 'conditional_review'
  | 'insufficient_quantity'

export type CapabilityFact = {
  capability: string
  value: string
}

export type PinFact = {
  label: string
  pinFunction: string
}

export type RequirementConstraint = {
  capability: string
  value: string
}

export type RequirementPinRole = {
  roleKey: string
  pinFunction: string
  canonicalLabel: string
}

export type SubstitutionChange = {
  changeKind: CompatibilityChangeKind
  summary: string
  stepSortOrder?: number | null
  payload?: Record<string, unknown>
}

export type SubstitutionReview = {
  requirementId: string
  componentId: string
  assessedResult: ReviewAssessment
  changes: SubstitutionChange[]
}

export type CompatibilityComponent = {
  componentId: string
  capabilities: CapabilityFact[]
  /** Authored pin-profile rows. Omit or leave empty when that profile has no pin rows. */
  pins?: PinFact[]
  quantity?: number
}

export type CompatibilityRequirement = {
  id: string
  policy: SubstitutionPolicy
  canonicalComponentId: string
  constraints: RequirementConstraint[]
  pinRoles: RequirementPinRole[]
  /** BOM quantity. Compared only when both this and the candidate quantity are provided. */
  quantity?: number
}

export type CompatibilityEvaluationInput = {
  requirement: CompatibilityRequirement
  canonical: CompatibilityComponent
  candidate: CompatibilityComponent
  /** The review for this requirement and this candidate, when one has been authored. */
  review?: SubstitutionReview | null
}

export type ConstraintFinding = {
  capability: string
  requiredValue: string
  /** Null when the candidate has no row for this capability. */
  actualValues: string[]
}

export type CompatibilityEvaluation = {
  matchKind: CompatibilityMatchKind
  reasonCode: CompatibilityReasonCode
  reason: string
  requirementId: string
  canonicalComponentId: string
  candidateComponentId: string
  failedConstraints: ConstraintFinding[]
  missingConstraints: ConstraintFinding[]
  reviewPresent: boolean
  /**
   * True only for an approved direct substitute.
   * A conditional result is not safe to present as a drop-in substitute.
   */
  safeToPresentAsSubstitute: boolean
  /** True when the result is conditional and the caller must show `changes`. */
  requiresChanges: boolean
  changes: SubstitutionChange[]
}

const INSTRUCTION_FACING_CAPABILITIES = [
  'board_package',
  'header_profile',
  'physical_form',
  'logic_level_v',
  'supply_v',
] as const

type InstructionFacingCapability = (typeof INSTRUCTION_FACING_CAPABILITIES)[number]

const CHANGE_KINDS_FOR_DIFFERENCE: Record<InstructionFacingCapability, readonly CompatibilityChangeKind[]> = {
  board_package: ['board_package'],
  header_profile: ['pin_map'],
  physical_form: ['mechanical', 'visual'],
  logic_level_v: ['supply'],
  supply_v: ['supply'],
}

type InstructionDifference = {
  capability: InstructionFacingCapability
  canonicalValues: string[]
  candidateValues: string[]
  status: 'different' | 'unknown'
}

type PinRoleFinding = {
  roleKey: string
  status: 'satisfied' | 'label_differs' | 'function_missing' | 'unverified'
  canonicalLabel: string
  pinFunction: string
}

function valuesFor(facts: CapabilityFact[], capability: string): string[] {
  return facts.filter((fact) => fact.capability === capability).map((fact) => fact.value)
}

function sameValueSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }
  const remaining = [...right]
  for (const value of left) {
    const index = remaining.indexOf(value)
    if (index === -1) {
      return false
    }
    remaining.splice(index, 1)
  }
  return true
}

function reviewApplies(
  review: SubstitutionReview | null | undefined,
  requirementId: string,
  candidateComponentId: string,
): review is SubstitutionReview {
  return (
    review != null &&
    review.requirementId === requirementId &&
    review.componentId === candidateComponentId
  )
}

function usableChanges(changes: SubstitutionChange[]): SubstitutionChange[] {
  return changes.filter((change) => change.summary.trim().length > 0)
}

function hasChangeKind(changes: SubstitutionChange[], kinds: readonly CompatibilityChangeKind[]): boolean {
  return changes.some((change) => kinds.includes(change.changeKind) && change.summary.trim().length > 0)
}

function baseResult(
  input: CompatibilityEvaluationInput,
  reviewPresent: boolean,
  partial: Pick<
    CompatibilityEvaluation,
    'matchKind' | 'reasonCode' | 'reason' | 'failedConstraints' | 'missingConstraints' | 'requiresChanges' | 'changes'
  >,
): CompatibilityEvaluation {
  return {
    ...partial,
    requirementId: input.requirement.id,
    canonicalComponentId: input.requirement.canonicalComponentId,
    candidateComponentId: input.candidate.componentId,
    reviewPresent,
    safeToPresentAsSubstitute: partial.matchKind === 'direct_substitute',
  }
}

function quantityShort(requirement: CompatibilityRequirement, candidate: CompatibilityComponent): boolean {
  return (
    requirement.quantity != null &&
    candidate.quantity != null &&
    candidate.quantity < requirement.quantity
  )
}

function withQuantity(
  input: CompatibilityEvaluationInput,
  reviewPresent: boolean,
  result: CompatibilityEvaluation,
): CompatibilityEvaluation {
  if (!quantityShort(input.requirement, input.candidate)) {
    return result
  }
  if (
    result.matchKind !== 'exact' &&
    result.matchKind !== 'direct_substitute' &&
    result.matchKind !== 'conditional_substitute'
  ) {
    return result
  }
  return baseResult(input, reviewPresent, {
    matchKind: 'insufficient_quantity',
    reasonCode: 'insufficient_quantity',
    reason: 'The candidate matches this requirement, and the owned quantity is below the BOM quantity.',
    failedConstraints: [],
    missingConstraints: [],
    requiresChanges: false,
    changes: [],
  })
}

function classifyConstraints(
  constraints: RequirementConstraint[],
  capabilities: CapabilityFact[],
): { failed: ConstraintFinding[]; missing: ConstraintFinding[]; supplyRails: RequirementConstraint[] } {
  const failed: ConstraintFinding[] = []
  const missing: ConstraintFinding[] = []
  const supplyRails: RequirementConstraint[] = []

  for (const constraint of constraints) {
    if (constraint.capability === 'supply_rail') {
      supplyRails.push(constraint)
      continue
    }

    const actualValues = valuesFor(capabilities, constraint.capability)
    const finding = {
      capability: constraint.capability,
      requiredValue: constraint.value,
      actualValues,
    }
    if (actualValues.length === 0) {
      missing.push(finding)
    } else if (!actualValues.includes(constraint.value)) {
      failed.push(finding)
    }
  }

  return { failed, missing, supplyRails }
}

function instructionDifferences(
  canonical: CapabilityFact[],
  candidate: CapabilityFact[],
): InstructionDifference[] {
  const differences: InstructionDifference[] = []
  for (const capability of INSTRUCTION_FACING_CAPABILITIES) {
    const canonicalValues = valuesFor(canonical, capability)
    const candidateValues = valuesFor(candidate, capability)
    if (canonicalValues.length === 0 && candidateValues.length === 0) {
      continue
    }
    if (canonicalValues.length === 0 || candidateValues.length === 0) {
      differences.push({ capability, canonicalValues, candidateValues, status: 'unknown' })
      continue
    }
    if (!sameValueSet(canonicalValues, candidateValues)) {
      differences.push({ capability, canonicalValues, candidateValues, status: 'different' })
    }
  }
  return differences
}

function evaluatePinRoles(roles: RequirementPinRole[], pins: PinFact[] | undefined): PinRoleFinding[] {
  if (roles.length === 0) {
    return []
  }
  if (pins == null || pins.length === 0) {
    return roles.map((role) => ({
      roleKey: role.roleKey,
      status: 'unverified',
      canonicalLabel: role.canonicalLabel,
      pinFunction: role.pinFunction,
    }))
  }

  return roles.map((role) => {
    const sameFunction = pins.filter((pin) => pin.pinFunction === role.pinFunction)
    if (sameFunction.length === 0) {
      return {
        roleKey: role.roleKey,
        status: 'function_missing',
        canonicalLabel: role.canonicalLabel,
        pinFunction: role.pinFunction,
      }
    }
    const labelMatches = sameFunction.some((pin) => pin.label === role.canonicalLabel)
    return {
      roleKey: role.roleKey,
      status: labelMatches ? 'satisfied' : 'label_differs',
      canonicalLabel: role.canonicalLabel,
      pinFunction: role.pinFunction,
    }
  })
}

function uncoveredDifferences(
  differences: InstructionDifference[],
  labelDiffers: boolean,
  supplyRails: RequirementConstraint[],
  changes: SubstitutionChange[],
): string[] {
  const uncovered: string[] = []
  for (const difference of differences) {
    if (difference.status === 'unknown') {
      uncovered.push(difference.capability)
      continue
    }
    if (!hasChangeKind(changes, CHANGE_KINDS_FOR_DIFFERENCE[difference.capability])) {
      uncovered.push(difference.capability)
    }
  }
  if (labelDiffers && !hasChangeKind(changes, ['pin_map'])) {
    uncovered.push('pin_label')
  }
  if (supplyRails.length > 0 && !hasChangeKind(changes, ['supply'])) {
    uncovered.push('supply_rail')
  }
  return uncovered
}

export function evaluateComponentCompatibility(
  input: CompatibilityEvaluationInput,
): CompatibilityEvaluation {
  const { requirement, canonical, candidate } = input
  const review = reviewApplies(input.review, requirement.id, candidate.componentId) ? input.review : null
  const reviewPresent = review != null

  if (candidate.componentId === requirement.canonicalComponentId) {
    return withQuantity(
      input,
      reviewPresent,
      baseResult(input, reviewPresent, {
        matchKind: 'exact',
        reasonCode: 'canonical_component',
        reason: 'The candidate is the canonical component for this requirement.',
        failedConstraints: [],
        missingConstraints: [],
        requiresChanges: false,
        changes: [],
      }),
    )
  }

  if (canonical.componentId !== requirement.canonicalComponentId) {
    return baseResult(input, reviewPresent, {
      matchKind: 'not_supported',
      reasonCode: 'capability_unknown',
      reason: 'Canonical capability data does not belong to this requirement’s canonical component.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  const constraints = classifyConstraints(requirement.constraints, candidate.capabilities)
  if (constraints.failed.length > 0) {
    const first = constraints.failed[0]
    return baseResult(input, reviewPresent, {
      matchKind: 'incompatible',
      reasonCode: 'constraint_failed',
      reason: `Authored constraint ${first.capability}=${first.requiredValue} does not match this component.`,
      failedConstraints: constraints.failed,
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }
  if (constraints.missing.length > 0) {
    const first = constraints.missing[0]
    return baseResult(input, reviewPresent, {
      matchKind: 'not_supported',
      reasonCode: 'capability_unknown',
      reason: `Required capability ${first.capability} is not authored for this component.`,
      failedConstraints: [],
      missingConstraints: constraints.missing,
      requiresChanges: false,
      changes: [],
    })
  }

  if (requirement.policy === 'exact') {
    return baseResult(input, reviewPresent, {
      matchKind: 'not_supported',
      reasonCode: 'policy_exact',
      reason: 'This requirement allows only its canonical component.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  const pinFindings = evaluatePinRoles(requirement.pinRoles, candidate.pins)
  const missingFunction = pinFindings.find((finding) => finding.status === 'function_missing')
  if (missingFunction) {
    return baseResult(input, reviewPresent, {
      matchKind: 'incompatible',
      reasonCode: 'pin_function_missing',
      reason: `The authored pin profile has no ${missingFunction.pinFunction} pin for ${missingFunction.roleKey}.`,
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }
  if (pinFindings.some((finding) => finding.status === 'unverified')) {
    return baseResult(input, reviewPresent, {
      matchKind: 'not_supported',
      reasonCode: 'pin_unverified',
      reason: 'Pin-profile data for this requirement’s pin roles is not authored for this component.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  const differences = instructionDifferences(canonical.capabilities, candidate.capabilities)
  const labelDiffers = pinFindings.some((finding) => finding.status === 'label_differs')
  const blocksDirect =
    differences.length > 0 || labelDiffers || constraints.supplyRails.length > 0

  if (!review) {
    return baseResult(input, false, {
      matchKind: 'not_supported',
      reasonCode: 'review_missing',
      reason: 'No authored substitution review exists for this requirement and component.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  if (review.assessedResult === 'incompatible') {
    return baseResult(input, true, {
      matchKind: 'incompatible',
      reasonCode: 'review_incompatible',
      reason: 'The authored substitution review marks this component incompatible with this requirement.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  const changes = usableChanges(review.changes)

  if (review.assessedResult === 'direct') {
    if (blocksDirect || review.changes.length > 0) {
      return baseResult(input, true, {
        matchKind: 'not_supported',
        reasonCode: 'review_direct_invalid',
        reason: 'A direct review cannot cover instruction, pin, or supply differences, and it cannot include change rows.',
        failedConstraints: [],
        missingConstraints: [],
        requiresChanges: false,
        changes: [],
      })
    }
    return withQuantity(
      input,
      true,
      baseResult(input, true, {
        matchKind: 'direct_substitute',
        reasonCode: 'direct_review',
        reason: 'The authored review accepts this component with no instruction-facing difference.',
        failedConstraints: [],
        missingConstraints: [],
        requiresChanges: false,
        changes: [],
      }),
    )
  }

  if (requirement.policy !== 'conditional') {
    return baseResult(input, true, {
      matchKind: 'not_supported',
      reasonCode: 'policy_ceiling',
      reason: 'This requirement’s policy does not allow a conditional substitute.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  if (changes.length === 0) {
    return baseResult(input, true, {
      matchKind: 'not_supported',
      reasonCode: 'review_conditional_incomplete',
      reason: 'A conditional review requires at least one change with a summary.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  const uncovered = uncoveredDifferences(differences, labelDiffers, constraints.supplyRails, changes)
  if (uncovered.length > 0) {
    return baseResult(input, true, {
      matchKind: 'not_supported',
      reasonCode: 'instruction_difference_uncovered',
      reason: `Authored changes do not cover: ${uncovered.join(', ')}.`,
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: false,
      changes: [],
    })
  }

  return withQuantity(
    input,
    true,
    baseResult(input, true, {
      matchKind: 'conditional_substitute',
      reasonCode: 'conditional_review',
      reason: 'The authored review accepts this component only with the listed changes.',
      failedConstraints: [],
      missingConstraints: [],
      requiresChanges: true,
      changes,
    }),
  )
}

export type RequirementCoverage = 'exact' | 'direct_substitute' | 'none'

export type MatchableBomLine = {
  id: string
  componentId: string
  slug: string
  name: string
  description: string | null
  quantity: number
  sortOrder: number
}

export type MatchedBomComponent = {
  componentId: string
  slug: string
  name: string
  description: string | null
  requiredQuantity: number
  /** Owned quantity of the canonical component, not of a substitute. */
  ownedQuantity: number
  missingQuantity: number
  isOwned: boolean
  coverage: RequirementCoverage
  /** Canonical id, approved substitute id, or null when the line is uncovered. */
  satisfiedByComponentId: string | null
}

export type ProjectInventoryMatch = {
  lines: MatchedBomComponent[]
  totalRequired: number
  totalOwned: number
  totalMissing: number
  ownedCount: number
  missingCount: number
  matchPercentage: number | null
}

export type ProjectCompatibilityData = {
  requirementsByBomLineId: ReadonlyMap<string, CompatibilityRequirement>
  componentsById: ReadonlyMap<string, CompatibilityComponent>
  reviews: readonly SubstitutionReview[]
}

type InventoryStock = {
  componentId?: string
  quantity: number
}

export function emptyProjectCompatibility(): ProjectCompatibilityData {
  return {
    requirementsByBomLineId: new Map(),
    componentsById: new Map(),
    reviews: [],
  }
}

function ownedTotals(inventory: readonly InventoryStock[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const item of inventory) {
    if (!item.componentId || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      continue
    }
    totals.set(item.componentId, (totals.get(item.componentId) ?? 0) + item.quantity)
  }
  return totals
}

function componentFacts(
  componentId: string,
  componentsById: ReadonlyMap<string, CompatibilityComponent>,
  quantity: number | undefined,
): CompatibilityComponent {
  const known = componentsById.get(componentId)
  return {
    componentId,
    capabilities: known?.capabilities ?? [],
    pins: known?.pins ?? [],
    quantity,
  }
}

function reviewFor(
  reviews: readonly SubstitutionReview[],
  requirementId: string,
  componentId: string,
): SubstitutionReview | null {
  return (
    reviews.find((review) => review.requirementId === requirementId && review.componentId === componentId) ??
    null
  )
}

/**
 * Exact catalogue ids are allocated first. A different owned part can cover a
 * line only when the evaluator's direct-substitute result explicitly allows it.
 * One owned unit is never allocated to two lines. Missing compatibility data
 * does not create a substitute.
 */
export function matchProjectInventory(
  bom: readonly MatchableBomLine[],
  inventory: readonly InventoryStock[],
  compatibility?: ProjectCompatibilityData | null,
): ProjectInventoryMatch {
  if (bom.length === 0) {
    return {
      lines: [],
      totalRequired: 0,
      totalOwned: 0,
      totalMissing: 0,
      ownedCount: 0,
      missingCount: 0,
      matchPercentage: null,
    }
  }

  const totals = ownedTotals(inventory)
  const remaining = new Map(totals)
  const coverageByLineId = new Map<string, { coverage: RequirementCoverage; satisfiedByComponentId: string }>()
  const ordered = bom
    .map((line, index) => ({ line, index }))
    .sort((a, b) => a.line.sortOrder - b.line.sortOrder || a.index - b.index)

  for (const { line } of ordered) {
    const available = remaining.get(line.componentId) ?? 0
    if (available < line.quantity) {
      continue
    }
    remaining.set(line.componentId, available - line.quantity)
    coverageByLineId.set(line.id, {
      coverage: 'exact',
      satisfiedByComponentId: line.componentId,
    })
  }

  if (compatibility) {
    const candidateIds = [...remaining.keys()].sort()
    for (const { line } of ordered) {
      if (coverageByLineId.has(line.id)) {
        continue
      }
      const stored = compatibility.requirementsByBomLineId.get(line.id)
      if (!stored || stored.canonicalComponentId !== line.componentId) {
        continue
      }
      const requirement: CompatibilityRequirement = {
        ...stored,
        quantity: line.quantity,
      }
      const canonical = componentFacts(line.componentId, compatibility.componentsById, undefined)

      for (const candidateId of candidateIds) {
        if (candidateId === line.componentId) {
          continue
        }
        const available = remaining.get(candidateId) ?? 0
        if (available < line.quantity) {
          continue
        }
        const result = evaluateComponentCompatibility({
          requirement,
          canonical,
          candidate: componentFacts(candidateId, compatibility.componentsById, available),
          review: reviewFor(compatibility.reviews, requirement.id, candidateId),
        })
        if (!result.safeToPresentAsSubstitute) {
          continue
        }
        remaining.set(candidateId, available - line.quantity)
        coverageByLineId.set(line.id, {
          coverage: 'direct_substitute',
          satisfiedByComponentId: candidateId,
        })
        break
      }
    }
  }

  const lines = bom.map((line) => {
    const ownedQuantity = totals.get(line.componentId) ?? 0
    const satisfied = coverageByLineId.get(line.id)
    const isOwned = satisfied != null
    return {
      componentId: line.componentId,
      slug: line.slug,
      name: line.name,
      description: line.description,
      requiredQuantity: line.quantity,
      ownedQuantity,
      missingQuantity: isOwned ? 0 : Math.max(line.quantity - ownedQuantity, 0),
      isOwned,
      coverage: satisfied?.coverage ?? 'none',
      satisfiedByComponentId: satisfied?.satisfiedByComponentId ?? null,
    }
  })

  const ownedCount = lines.filter((line) => line.isOwned).length
  const missingCount = lines.length - ownedCount

  return {
    lines,
    totalRequired: lines.length,
    totalOwned: lines.reduce((sum, line) => sum + line.ownedQuantity, 0),
    totalMissing: lines.reduce((sum, line) => sum + line.missingQuantity, 0),
    ownedCount,
    missingCount,
    matchPercentage: (ownedCount / lines.length) * 100,
  }
}
