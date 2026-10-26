import type { WiringElementDef, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { PhysicalEndpoint, PhysicalJumper } from '../constants/wiring-diagrams/types.ts'
import type { StepConnection, WiringSignal } from '../constants/walkthrough-content.ts'
import { holeLabel } from './breadboard-layout.ts'
import { findPort } from './wiring-diagram.ts'

export type ConnectionStatus = 'this-step' | 'installed'

export type ConnectionEntry = {
  id: string
  group: string
  title: string
  detail: string
  status: ConnectionStatus
  wireIds: string[]
}

const GROUP_ORDER = ['Power', 'Ground', 'Red channel', 'Green channel', 'Blue channel', 'Signals']

const SIGNAL_LABEL: Record<WiringSignal, string> = {
  power: 'Power',
  ground: 'Ground',
  signal: 'Signal',
}

function connectionKey(row: StepConnection) {
  return `${row.fromComponent}|${row.fromPin}|${row.toComponent}|${row.toPin}`
}

function groupFor(row: StepConnection) {
  if (row.signal === 'power') {
    return 'Power'
  }
  if (row.signal === 'ground') {
    return 'Ground'
  }
  const text = `${row.fromComponent} ${row.fromPin} ${row.toComponent} ${row.toPin}`
  if (/red|io25|gpio25/i.test(text)) {
    return 'Red channel'
  }
  if (/green|io26|gpio26/i.test(text)) {
    return 'Green channel'
  }
  if (/blue|io27|gpio27/i.test(text)) {
    return 'Blue channel'
  }
  return 'Signals'
}

function findElement(layout: WiringLayout, name: string): WiringElementDef | undefined {
  const key = name.trim().toLowerCase()
  return layout.elements.find(
    (element) => element.label.toLowerCase() === key || element.aliases?.some((alias) => alias.toLowerCase() === key),
  )
}

function endpointHole(layout: WiringLayout, endpoint: PhysicalEndpoint): string | null {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    return null
  }
  return holeLabel(endpoint)
}

function isModulePort(endpoint: PhysicalEndpoint, elementId: string, portId: string) {
  return 'kind' in endpoint && endpoint.kind === 'module' && endpoint.elementId === elementId && endpoint.portId === portId
}

function jumpersTouching(layout: WiringLayout, elementId: string, portId: string): PhysicalJumper[] {
  return layout.physical?.jumpers.filter((jumper) => [jumper.from, jumper.to].some((endpoint) => isModulePort(endpoint, elementId, portId))) ?? []
}

function jumperTouching(layout: WiringLayout, elementId: string, portId: string): PhysicalJumper | undefined {
  return jumpersTouching(layout, elementId, portId)[0]
}

function wireIdsFor(layout: WiringLayout | null, row: StepConnection): string[] {
  if (!layout?.physical) {
    return []
  }
  const ids = new Set<string>()
  for (const [component, pin] of [
    [row.fromComponent, row.fromPin],
    [row.toComponent, row.toPin],
  ] as const) {
    const element = findElement(layout, component)
    const port = element ? findPort(element, pin) : null
    if (!element || !port) {
      continue
    }
    for (const jumper of jumpersTouching(layout, element.id, port.id)) {
      ids.add(jumper.id)
    }
  }
  return [...ids]
}

function holeFor(layout: WiringLayout | null, component: string, pin: string): string | null {
  if (!layout?.physical) {
    return null
  }
  const element = findElement(layout, component)
  const port = element ? findPort(element, pin) : null
  if (!element || !port) {
    return null
  }
  const lead = layout.physical.leads.find((item) => item.elementId === element.id && item.portId === port.id)
  if (lead) {
    return holeLabel(lead.hole)
  }
  const jumper = jumperTouching(layout, element.id, port.id)
  if (!jumper) {
    return null
  }
  const other = 'kind' in jumper.from && jumper.from.kind === 'module' && jumper.from.elementId === element.id && jumper.from.portId === port.id ? jumper.to : jumper.from
  return endpointHole(layout, other)
}

function wireKind(layout: WiringLayout | null, row: StepConnection): string | null {
  if (!layout?.physical) {
    return null
  }
  const from = findElement(layout, row.fromComponent)
  const fromPort = from ? findPort(from, row.fromPin) : null
  const jumper = from && fromPort ? jumperTouching(layout, from.id, fromPort.id) : undefined
  if (!jumper) {
    return null
  }
  if (jumper.gender === 'stemma-female') {
    return 'STEMMA QT female'
  }
  return jumper.gender === 'male-female' ? 'Male-to-female' : 'Male-to-male'
}

/**
 * Connections already introduced, taken from the step netlist.
 * A later step's wires are absent until that step is reached.
 */
export function connectionReference(
  layout: WiringLayout | null,
  current: readonly StepConnection[],
  prior: readonly StepConnection[] = [],
): ConnectionEntry[] {
  const seen = new Set<string>()
  const entries: ConnectionEntry[] = []
  const add = (row: StepConnection, status: ConnectionStatus) => {
    const id = connectionKey(row)
    if (seen.has(id)) {
      return
    }
    seen.add(id)
    const holes = [holeFor(layout, row.fromComponent, row.fromPin), holeFor(layout, row.toComponent, row.toPin)].filter(
      (hole): hole is string => Boolean(hole),
    )
    const detail = [row.signal ? SIGNAL_LABEL[row.signal] : null, wireKind(layout, row), holes.length > 0 ? holes.join(' → ') : null]
      .filter((part): part is string => Boolean(part))
      .join(' · ')
    entries.push({
      id,
      group: groupFor(row),
      title: `${row.fromComponent} ${row.fromPin} → ${row.toComponent} ${row.toPin}`,
      detail,
      status,
      wireIds: wireIdsFor(layout, row),
    })
  }
  for (const row of current) {
    add(row, 'this-step')
  }
  for (const row of prior) {
    add(row, 'installed')
  }
  return sortEntries(entries)
}

function sortEntries(entries: ConnectionEntry[]) {
  return entries.sort((a, b) => {
    const group = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    if (group !== 0) {
      return group
    }
    if (a.status !== b.status) {
      return a.status === 'this-step' ? -1 : 1
    }
    return a.title.localeCompare(b.title)
  })
}

function endpointTitle(layout: WiringLayout, endpoint: PhysicalEndpoint) {
  if ('kind' in endpoint && endpoint.kind === 'module') {
    const element = layout.elements.find((item) => item.id === endpoint.elementId)
    const port = element?.ports.find((item) => item.id === endpoint.portId)
    return `${element?.label ?? endpoint.elementId} ${port?.label ?? endpoint.portId}`
  }
  return `Breadboard ${holeLabel(endpoint)}`
}

export function describeJumper(layout: WiringLayout, jumperId: string) {
  const jumper = layout.physical?.jumpers.find((item) => item.id === jumperId)
  if (!jumper) {
    return null
  }
  const names = `${jumper.id} ${'portId' in jumper.from ? jumper.from.portId : ''} ${'portId' in jumper.to ? jumper.to.portId : ''}`
  const group = /gnd|minus/.test(names) ? 'Ground' : /5v|vcc|3v3|plus|vin/.test(names) ? 'Power' : 'Signals'
  const gender = jumper.gender === 'stemma-female' ? 'STEMMA QT female' : jumper.gender === 'male-female' ? 'Male-to-female' : 'Male-to-male'
  return {
    group,
    title: `${endpointTitle(layout, jumper.from)} → ${endpointTitle(layout, jumper.to)}`,
    detail: gender,
  }
}

function sameIds(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false
  }
  const a = [...left].sort()
  const b = [...right].sort()
  return a.every((id, index) => id === b[index])
}

/**
 * Step rows, plus any jumper drawn on the current diagram that those rows do not already name.
 * Keeps the panel aligned with the wires a learner can see.
 */
export function visibleConnectionEntries(
  layout: WiringLayout | null,
  current: readonly StepConnection[],
  prior: readonly StepConnection[],
  visibleJumperIds: readonly string[],
  newJumperIds: readonly string[] = [],
): ConnectionEntry[] {
  const entries = connectionReference(layout, current, prior)
  if (!layout?.physical) {
    return entries
  }
  const covered = new Set(entries.flatMap((entry) => entry.wireIds))
  const fresh = new Set(newJumperIds)
  for (const id of visibleJumperIds) {
    if (covered.has(id)) {
      continue
    }
    const described = describeJumper(layout, id)
    if (!described) {
      continue
    }
    covered.add(id)
    entries.push({
      id: `wire:${id}`,
      wireIds: [id],
      group: described.group,
      title: described.title,
      detail: described.detail,
      status: fresh.has(id) ? 'this-step' : 'installed',
    })
  }
  return sortEntries(entries)
}

export function focusCaption(layout: WiringLayout | null, entries: readonly ConnectionEntry[], ids: readonly string[]) {
  const match = entries.find((entry) => sameIds(entry.wireIds, ids))
  if (match) {
    return { title: match.title, detail: match.detail }
  }
  if (layout && ids.length === 1) {
    const described = describeJumper(layout, ids[0])
    if (described) {
      return { title: described.title, detail: described.detail }
    }
  }
  return { title: ids.join(', '), detail: '' }
}
