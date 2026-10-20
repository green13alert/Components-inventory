import { getCatalogueComponent } from '../constants/component-catalogue.ts'
import type { WiringElementDef, WiringLayout } from '../constants/wiring-diagrams/types.ts'

export type KeySelection = { kind: 'group'; catalogueId: string } | { kind: 'instance'; id: string }

export type ComponentKeyInstance = {
  id: string
  label: string
  role: string
  orientation?: string
  pins?: string
  /** Catalogue description, shortened for the key. */
  summary: string
  catalogueName: string
  installed: boolean
  /** Diagram part ids to outline. Empty while the part is still hidden. */
  highlightIds: string[]
}

export type ComponentKeyGroup = {
  catalogueId: string
  name: string
  summary: string
  illustrationId: string
  /** Diagram symbol, so the key matches the part on the breadboard. */
  kind: string
  instances: ComponentKeyInstance[]
}

function brief(text: string) {
  const sentence = text.split(/(?<=\.)\s/)[0] ?? text
  if (sentence.length <= 180) {
    return sentence
  }
  return `${sentence.slice(0, 177).trimEnd()}…`
}

function pinSummary(element: WiringElementDef) {
  const labels = element.ports.map((port) => port.label)
  if (labels.length === 0 || labels.every((label) => /^leg \d+$/i.test(label))) {
    return undefined
  }
  return labels.join(', ')
}

function physicalElementIds(layout: WiringLayout) {
  const ids = new Set<string>()
  const physical = layout.physical
  if (!physical) {
    return ids
  }
  if (layout.elements.some((element) => element.id === 'breadboard')) {
    ids.add('breadboard')
  }
  for (const id of physical.fixtures ?? []) {
    ids.add(id)
  }
  for (const lead of physical.leads) {
    ids.add(lead.elementId)
  }
  for (const frame of physical.modules ?? []) {
    ids.add(frame.elementId)
  }
  return ids
}

export function componentKeyProblems(layout: WiringLayout): string[] {
  if (!layout.physical) {
    return []
  }
  const problems: string[] = []
  const seen = new Set<string>()
  for (const id of physicalElementIds(layout)) {
    const element = layout.elements.find((candidate) => candidate.id === id)
    if (!element) {
      problems.push(`Physical part ${id} has no diagram element.`)
      continue
    }
    if (seen.has(element.id)) {
      problems.push(`Component ${element.id} is listed twice.`)
    }
    seen.add(element.id)
    const catalogueId = element.identity?.catalogueId
    if (!catalogueId || !element.identity?.role.trim()) {
      problems.push(`${element.label} has no catalogue identity.`)
      continue
    }
    if (!getCatalogueComponent(catalogueId)) {
      problems.push(`${element.label} points at unknown catalogue id ${catalogueId}.`)
    }
    if (element.accessory) {
      if (seen.has(element.accessory.id)) {
        problems.push(`Component ${element.accessory.id} is listed twice.`)
      }
      seen.add(element.accessory.id)
      if (!getCatalogueComponent(element.accessory.catalogueId)) {
        problems.push(`${element.accessory.id} points at unknown catalogue id ${element.accessory.catalogueId}.`)
      }
      if (!element.accessory.role.trim()) {
        problems.push(`${element.accessory.id} has no role.`)
      }
    }
  }
  return problems
}

export function buildComponentKey(layout: WiringLayout, installedIds: ReadonlySet<string> | null): ComponentKeyGroup[] {
  const wanted = physicalElementIds(layout)
  const groups: ComponentKeyGroup[] = []
  const byCatalogue = new Map<string, ComponentKeyGroup>()
  const add = (instance: ComponentKeyInstance, catalogueId: string, kind: string) => {
    const catalogue = getCatalogueComponent(catalogueId)
    const name = catalogue?.name ?? instance.catalogueName
    const summary = catalogue ? brief(catalogue.description) : instance.summary
    const illustrationId = catalogue?.image ?? kind
    let group = byCatalogue.get(catalogueId)
    if (!group) {
      group = { catalogueId, name, summary, illustrationId, kind, instances: [] }
      byCatalogue.set(catalogueId, group)
      groups.push(group)
    }
    group.instances.push({ ...instance, catalogueName: name, summary })
  }
  for (const element of layout.elements) {
    if (!wanted.has(element.id) || !element.identity) {
      continue
    }
    const installed = installedIds == null || installedIds.has(element.id) || element.id === 'breadboard'
    add(
      {
        id: element.id,
        label: element.identity.keyLabel ?? element.label,
        role: element.identity.role,
        orientation: element.identity.orientation,
        pins: pinSummary(element),
        summary: '',
        catalogueName: element.label,
        installed,
        highlightIds: installed ? [element.id] : [],
      },
      element.identity.catalogueId,
      element.kind,
    )
    if (element.accessory) {
      add(
        {
          id: element.accessory.id,
          label: getCatalogueComponent(element.accessory.catalogueId)?.name ?? element.accessory.id,
          role: element.accessory.role,
          orientation: element.accessory.orientation,
          pins: undefined,
          summary: '',
          catalogueName: element.label,
          installed,
          highlightIds: installed ? [element.id] : [],
        },
        element.accessory.catalogueId,
        'cable',
      )
    }
  }
  return groups
}

export function highlightedPartIds(groups: readonly ComponentKeyGroup[], selection: KeySelection | null): string[] {
  if (!selection) {
    return []
  }
  if (selection.kind === 'instance') {
    for (const group of groups) {
      const instance = group.instances.find((item) => item.id === selection.id)
      if (instance) {
        return [...instance.highlightIds]
      }
    }
    return []
  }
  const group = groups.find((item) => item.catalogueId === selection.catalogueId)
  if (!group) {
    return []
  }
  return [...new Set(group.instances.flatMap((instance) => instance.highlightIds))]
}

export function reconcileSelection(selection: KeySelection | null, groups: readonly ComponentKeyGroup[]): KeySelection | null {
  if (!selection) {
    return null
  }
  if (selection.kind === 'instance') {
    const found = groups.some((group) => group.instances.some((instance) => instance.id === selection.id))
    return found ? selection : null
  }
  return groups.some((group) => group.catalogueId === selection.catalogueId) ? selection : null
}

export function toggleKeySelection(current: KeySelection | null, next: KeySelection): KeySelection | null {
  if (!current) {
    return next
  }
  if (current.kind === 'group' && next.kind === 'group' && current.catalogueId === next.catalogueId) {
    return null
  }
  if (current.kind === 'instance' && next.kind === 'instance' && current.id === next.id) {
    return null
  }
  return next
}

export function findKeyInstance(groups: readonly ComponentKeyGroup[], id: string) {
  for (const group of groups) {
    const instance = group.instances.find((item) => item.id === id)
    if (instance) {
      return { group, instance }
    }
  }
  return null
}
