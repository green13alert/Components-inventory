import type { WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { PhysicalEndpoint } from '../constants/wiring-diagrams/types.ts'
import type { AssemblyIntroduction, StepBlock } from '../constants/walkthrough-content.ts'
import { holeKey } from './breadboard-layout.ts'

export type AssemblyPhase = 'before' | 'building' | 'after'

export type AssemblySnapshot = {
  hasSequence: boolean
  phase: AssemblyPhase
  installedParts: string[]
  newParts: string[]
  installedJumpers: string[]
  newJumpers: string[]
}

type StepLike = { blocks: readonly StepBlock[] }

function introductionOf(step: StepLike): AssemblyIntroduction | null {
  for (const block of step.blocks) {
    if (block.type === 'wiring' && block.assembly) {
      return block.assembly
    }
  }
  return null
}

function union(lists: AssemblyIntroduction[]) {
  const parts: string[] = []
  const jumpers: string[] = []
  for (const item of lists) {
    for (const part of item.parts) {
      if (!parts.includes(part)) {
        parts.push(part)
      }
    }
    for (const jumper of item.jumpers) {
      if (!jumpers.includes(jumper)) {
        jumpers.push(jumper)
      }
    }
  }
  return { parts, jumpers }
}

export function resolveAssembly(
  steps: readonly StepLike[],
  currentIndex: number,
  mode: 'current' | 'complete',
  fixtures: readonly string[] = [],
): AssemblySnapshot {
  const intros = steps
    .map((step, index) => ({ index, intro: introductionOf(step) }))
    .filter((item): item is { index: number; intro: AssemblyIntroduction } => item.intro != null)
  if (intros.length === 0) {
    return { hasSequence: false, phase: 'before', installedParts: [], newParts: [], installedJumpers: [], newJumpers: [] }
  }
  const everything = union(intros.map((item) => item.intro))
  const withFixtures = (parts: string[]) => [...fixtures.filter((id) => !parts.includes(id) && !everything.parts.includes(id)), ...parts]
  if (mode === 'complete') {
    return {
      hasSequence: true,
      phase: 'after',
      installedParts: withFixtures(everything.parts),
      newParts: [],
      installedJumpers: everything.jumpers,
      newJumpers: [],
    }
  }
  const current = intros.find((item) => item.index === currentIndex)
  const prior = union(intros.filter((item) => item.index < currentIndex).map((item) => item.intro))
  const future = intros.some((item) => item.index > currentIndex)
  if (current) {
    const installed = union([prior, current.intro])
    return {
      hasSequence: true,
      phase: 'building',
      installedParts: withFixtures(installed.parts),
      newParts: current.intro.parts.filter((id) => !fixtures.includes(id)),
      installedJumpers: installed.jumpers,
      newJumpers: current.intro.jumpers,
    }
  }
  if (!future && prior.parts.length + prior.jumpers.length > 0) {
    return {
      hasSequence: true,
      phase: 'after',
      installedParts: withFixtures(everything.parts),
      newParts: [],
      installedJumpers: everything.jumpers,
      newJumpers: [],
    }
  }
  return {
    hasSequence: true,
    phase: 'before',
    installedParts: withFixtures(prior.parts),
    newParts: [],
    installedJumpers: prior.jumpers,
    newJumpers: [],
  }
}

function sameHole(layout: WiringLayout, endpoint: PhysicalEndpoint, other: PhysicalEndpoint) {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return false
  }
  if ('kind' in other && other.kind === 'module') {
    return false
  }
  const split = layout.physical?.railSplitAfter ?? null
  return holeKey(endpoint, split) === holeKey(other, split)
}

function endpointReady(layout: WiringLayout, endpoint: PhysicalEndpoint, installed: Set<string>) {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return installed.has(endpoint.elementId)
  }
  if (endpoint.kind === 'rail') {
    return true
  }
  const leads = (layout.physical?.leads ?? []).filter((lead) => sameHole(layout, lead.hole, endpoint))
  return leads.every((lead) => installed.has(lead.elementId))
}

export function validateAssemblySequence(layout: WiringLayout, steps: readonly StepLike[]): string[] {
  const physical = layout.physical
  if (!physical) {
    return []
  }
  const errors: string[] = []
  const intros = steps
    .map((step, index) => ({ index, intro: introductionOf(step), title: 'title' in step ? String((step as { title?: string }).title ?? '') : `step ${index + 1}` }))
    .filter((item): item is { index: number; intro: AssemblyIntroduction; title: string } => item.intro != null)
  if (intros.length === 0) {
    return ['This breadboard project has no assembly sequence.']
  }
  const fixtures = new Set(physical.fixtures ?? [])
  const partIds = new Set(physical.leads.map((lead) => lead.elementId))
  for (const frame of physical.modules ?? []) {
    partIds.add(frame.elementId)
  }
  const seenParts = new Set<string>(fixtures)
  const seenJumpers = new Set<string>()
  for (const item of intros) {
    const installed = new Set(seenParts)
    for (const part of item.intro.parts) {
      if (seenParts.has(part)) {
        errors.push(`${item.title} introduces ${part} again.`)
      }
      if (!partIds.has(part) && !fixtures.has(part)) {
        errors.push(`${item.title} introduces unknown part ${part}.`)
      }
      installed.add(part)
      seenParts.add(part)
    }
    for (const jumperId of item.intro.jumpers) {
      if (seenJumpers.has(jumperId)) {
        errors.push(`${item.title} introduces jumper ${jumperId} again.`)
      }
      const jumper = physical.jumpers.find((candidate) => candidate.id === jumperId)
      if (!jumper) {
        errors.push(`${item.title} introduces unknown jumper ${jumperId}.`)
        continue
      }
      seenJumpers.add(jumperId)
      for (const endpoint of [jumper.from, jumper.to]) {
        if (!endpointReady(layout, endpoint, installed)) {
          errors.push(`${item.title} connects ${jumperId} before its part is on the board.`)
        }
      }
    }
  }
  for (const part of partIds) {
    if (!seenParts.has(part)) {
      errors.push(`Part ${part} is never introduced.`)
    }
  }
  for (const jumper of physical.jumpers) {
    if (!seenJumpers.has(jumper.id)) {
      errors.push(`Jumper ${jumper.id} is never introduced.`)
    }
  }
  return errors
}
