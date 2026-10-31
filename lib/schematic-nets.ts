import type { WiringElementDef, WiringLayout, WiringPortDef, WiringSymbolKind } from '../constants/wiring-diagrams/types.ts'
import type { StepConnection, WiringSignal } from '../constants/walkthrough-content.ts'
import { physicalElectricalGroups } from './breadboard-layout.ts'
import { normalizeWiringToken } from './wiring-diagram.ts'

/**
 * Schematic connectivity derived from the connection list and, where a project
 * has one, the physical breadboard graph. Pixel positions are not read.
 * The Project 8 schematic sheet consumes this model.
 */

export type ElectricalIssueCode =
  | 'unknown-component'
  | 'unknown-pin'
  | 'ambiguous-component'
  | 'ambiguous-pin'
  | 'duplicate-port'
  | 'pin-not-placed'
  | 'connection-open'
  | 'breadboard-shorts-nets'
  | 'unlisted-physical-pin'
  | 'distinct-supplies-merged'
  | 'power-ground-short'
  | 'controller-pins-joined'

export type ElectricalIssue = {
  code: ElectricalIssueCode
  message: string
}

export type ElectricalPinRef = {
  componentId: string
  portId: string
}

export type PinPolarity = 'anode' | 'cathode' | 'base' | 'collector' | 'emitter'

export type PinRole = 'power-source' | 'ground' | 'power' | 'signal' | 'passive' | 'rail'

export type ElectricalPin = ElectricalPinRef & {
  label: string
  polarity: PinPolarity | null
  role: PinRole
  netId: string | null
}

export type ElectricalComponent = {
  id: string
  label: string
  kind: WiringSymbolKind
  catalogueId: string | null
  pins: ElectricalPin[]
}

export type ElectricalNetKind = 'power' | 'ground' | 'signal'

export type ElectricalNet = {
  id: string
  name: string
  kind: ElectricalNetKind
  members: ElectricalPinRef[]
  sources: ElectricalPinRef[]
  /** Strip and rail nodes from the physical graph. A crossing on a drawing is not a node. */
  nodes: string[]
}

export type ResolvedElectricalLink = {
  from: ElectricalPinRef
  to: ElectricalPinRef
  signal: WiringSignal | null
}

export type SchematicNetlist = {
  components: ElectricalComponent[]
  nets: ElectricalNet[]
  links: ResolvedElectricalLink[]
  issues: ElectricalIssue[]
}

const CONTROLLERS = new Set<WiringSymbolKind>(['arduino-uno', 'esp32-devkit'])

class UnionFind {
  private parent = new Map<string, string>()

  add(key: string) {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
    }
  }

  find(key: string): string {
    this.add(key)
    let current = key
    while (this.parent.get(current) !== current) {
      current = this.parent.get(current) as string
    }
    let cursor = key
    while (cursor !== current) {
      const next = this.parent.get(cursor) as string
      this.parent.set(cursor, current)
      cursor = next
    }
    return current
  }

  union(a: string, b: string) {
    const left = this.find(a)
    const right = this.find(b)
    if (left !== right) {
      this.parent.set(right, left)
    }
  }
}

export function pinKey(pin: ElectricalPinRef): string {
  return `${pin.componentId}:${pin.portId}`
}

export function netByMember(netlist: SchematicNetlist, componentId: string, portId: string): ElectricalNet | null {
  const key = pinKey({ componentId, portId })
  return netlist.nets.find((net) => net.members.some((member) => pinKey(member) === key)) ?? null
}

export function sameNet(
  netlist: SchematicNetlist,
  left: ElectricalPinRef,
  right: ElectricalPinRef,
): boolean {
  const net = netByMember(netlist, left.componentId, left.portId)
  return net != null && net.members.some((member) => member.componentId === right.componentId && member.portId === right.portId)
}

function tokensOf(port: WiringPortDef): string[] {
  return [...new Set([port.id, port.label, ...port.aliases].map(normalizeWiringToken).filter(Boolean))]
}

function polarityOf(port: WiringPortDef): PinPolarity | null {
  if (
    port.id === 'anode' ||
    port.id === 'cathode' ||
    port.id === 'base' ||
    port.id === 'collector' ||
    port.id === 'emitter'
  ) {
    return port.id
  }
  const tokens = tokensOf(port)
  if (tokens.includes('anode') || tokens.some((token) => token.endsWith('anode'))) {
    return 'anode'
  }
  if (tokens.includes('cathode') || tokens.some((token) => token.endsWith('cathode'))) {
    return 'cathode'
  }
  return null
}

/** Board and adapter pins that actually source a rail. A matching voltage on another part is not a source. */
function isPowerSource(kind: WiringSymbolKind, portId: string): boolean {
  if (kind === 'arduino-uno' && (portId === '5v' || portId === '3v3')) {
    return true
  }
  if (kind === 'esp32-devkit' && (portId === 'v5' || portId === '3v3')) {
    return true
  }
  if ((kind === 'dc-jack' || kind === 'breadboard-psu') && (portId === '5v' || portId === '3v3')) {
    return true
  }
  return false
}

function isGroundPort(kind: WiringSymbolKind, portId: string): boolean {
  return portId === 'gnd' || (kind === 'breadboard' && portId === 'minus')
}

function roleOf(element: WiringElementDef, port: WiringPortDef): PinRole {
  if (isPowerSource(element.kind, port.id)) {
    return 'power-source'
  }
  if (isGroundPort(element.kind, port.id)) {
    return 'ground'
  }
  if (element.kind === 'breadboard') {
    return 'rail'
  }
  if (element.kind === 'resistor') {
    return 'passive'
  }
  if (port.id === 'vcc' || port.id === 'vin' || port.id === '5v' || port.id === 'anode') {
    return 'power'
  }
  return 'signal'
}

function isMedium(key: string): boolean {
  return key.startsWith('strip:') || key.startsWith('rail:')
}

function parsePin(key: string): ElectricalPinRef | null {
  if (isMedium(key)) {
    return null
  }
  const index = key.indexOf(':')
  if (index <= 0) {
    return null
  }
  return { componentId: key.slice(0, index), portId: key.slice(index + 1) }
}

function matchingElements(layout: WiringLayout, name: string): WiringElementDef[] {
  const token = normalizeWiringToken(name)
  if (!token) {
    return []
  }
  return layout.elements.filter((element) =>
    [element.id, element.label, ...element.aliases].some((alias) => normalizeWiringToken(alias) === token),
  )
}

function matchingPorts(element: WiringElementDef, name: string): WiringPortDef[] {
  const token = normalizeWiringToken(name)
  if (!token) {
    return []
  }
  return element.ports.filter((port) => tokensOf(port).includes(token))
}

function refSort(left: ElectricalPinRef, right: ElectricalPinRef): number {
  return pinKey(left).localeCompare(pinKey(right))
}

export function buildSchematicNetlist(
  layout: WiringLayout,
  connections: readonly StepConnection[],
): SchematicNetlist {
  const issues: ElectricalIssue[] = []
  const elements = new Map(layout.elements.map((element) => [element.id, element]))

  for (const element of layout.elements) {
    const ids = new Set<string>()
    const tokens = new Map<string, string>()
    for (const port of element.ports) {
      if (ids.has(port.id)) {
        issues.push({
          code: 'duplicate-port',
          message: `${element.label} has two ports with id ${port.id}.`,
        })
      }
      ids.add(port.id)
      for (const token of tokensOf(port)) {
        const previous = tokens.get(token)
        if (previous && previous !== port.id) {
          issues.push({
            code: 'ambiguous-pin',
            message: `${element.label} uses "${token}" for both ${previous} and ${port.id}.`,
          })
        } else {
          tokens.set(token, port.id)
        }
      }
    }
  }

  const links: ResolvedElectricalLink[] = []
  const nets = new UnionFind()

  for (const connection of connections) {
    const fromElements = matchingElements(layout, connection.fromComponent)
    const toElements = matchingElements(layout, connection.toComponent)
    const fromElement = takeOne(fromElements, 'component', connection.fromComponent, issues)
    const toElement = takeOne(toElements, 'component', connection.toComponent, issues)
    if (!fromElement || !toElement) {
      continue
    }
    const fromPort = takeOne(
      matchingPorts(fromElement, connection.fromPin),
      'pin',
      `${fromElement.label} "${connection.fromPin}"`,
      issues,
    )
    const toPort = takeOne(
      matchingPorts(toElement, connection.toPin),
      'pin',
      `${toElement.label} "${connection.toPin}"`,
      issues,
    )
    if (!fromPort || !toPort) {
      continue
    }
    const from = { componentId: fromElement.id, portId: fromPort.id }
    const to = { componentId: toElement.id, portId: toPort.id }
    links.push({ from, to, signal: connection.signal ?? null })
    nets.union(pinKey(from), pinKey(to))
  }

  const provisional = new Map<string, string>()
  for (const link of links) {
    for (const pin of [link.from, link.to]) {
      const key = pinKey(pin)
      provisional.set(key, nets.find(key))
    }
  }

  const physical = physicalElectricalGroups(layout)
  const placed = new Map<string, string>()
  for (const [root, members] of physical) {
    for (const member of members) {
      placed.set(member, root)
    }
  }

  for (const key of provisional.keys()) {
    if (!placed.has(key)) {
      const pin = parsePin(key)
      const element = pin ? elements.get(pin.componentId) : undefined
      const label = element && pin ? `${element.label} ${pin.portId}` : key
      issues.push({
        code: 'pin-not-placed',
        message: `${label} is in the connection list and is not on the physical layout.`,
      })
    }
  }

  for (const link of links) {
    const left = placed.get(pinKey(link.from))
    const right = placed.get(pinKey(link.to))
    if (left && right && left !== right) {
      const fromElement = elements.get(link.from.componentId)
      const toElement = elements.get(link.to.componentId)
      issues.push({
        code: 'connection-open',
        message: `${fromElement?.label ?? link.from.componentId} ${link.from.portId} does not meet ${toElement?.label ?? link.to.componentId} ${link.to.portId} on the physical layout.`,
      })
    }
  }

  const extras = new Map<string, { pins: ElectricalPinRef[]; nodes: string[] }>()
  for (const members of physical.values()) {
    const pins = members.map(parsePin).filter((pin): pin is ElectricalPinRef => pin != null)
    const connected = pins.filter((pin) => provisional.has(pinKey(pin)))
    const roots = new Set(connected.map((pin) => provisional.get(pinKey(pin)) as string))
    for (const pin of pins) {
      const element = elements.get(pin.componentId)
      if (element && element.kind !== 'breadboard' && !provisional.has(pinKey(pin))) {
        issues.push({
          code: 'unlisted-physical-pin',
          message: `${element.label} ${pin.portId} is placed on the physical layout and is missing from the connection list.`,
        })
      }
    }
    if (roots.size > 1) {
      const names = [...roots]
        .map((root) => connected.filter((pin) => provisional.get(pinKey(pin)) === root).map(pinKey).sort()[0])
        .filter(Boolean)
        .sort()
      issues.push({
        code: 'breadboard-shorts-nets',
        message: `One breadboard node joins ${names.join(' and ')}.`,
      })
      continue
    }
    if (roots.size !== 1) {
      continue
    }
    const root = [...roots][0]
    const anchor = connected[0]
    if (!root || !anchor) {
      continue
    }
    const anchorPlace = placed.get(pinKey(anchor))
    const placedMembers = [...provisional.keys()].filter((key) => provisional.get(key) === root && placed.has(key))
    if (placedMembers.some((key) => placed.get(key) !== anchorPlace)) {
      continue
    }
    const extra = extras.get(root) ?? { pins: [], nodes: [] }
    for (const pin of pins) {
      const element = elements.get(pin.componentId)
      if (element?.kind === 'breadboard' && !provisional.has(pinKey(pin))) {
        extra.pins.push(pin)
      }
    }
    for (const member of members) {
      if (isMedium(member)) {
        extra.nodes.push(member)
      }
    }
    extras.set(root, extra)
  }

  const groups = new Map<string, Set<string>>()
  for (const key of provisional.keys()) {
    const root = provisional.get(key) as string
    const group = groups.get(root) ?? new Set<string>()
    group.add(key)
    groups.set(root, group)
  }
  for (const [root, extra] of extras) {
    const group = groups.get(root) ?? new Set<string>()
    for (const pin of extra.pins) {
      group.add(pinKey(pin))
    }
    groups.set(root, group)
  }

  const built: ElectricalNet[] = []
  for (const [root, group] of groups) {
    const members = [...group].map(parsePin).filter((pin): pin is ElectricalPinRef => pin != null).sort(refSort)
    const sources = members.filter((pin) => {
      const element = elements.get(pin.componentId)
      return element != null && isPowerSource(element.kind, pin.portId)
    })
    const grounded = members.some((pin) => {
      const element = elements.get(pin.componentId)
      return element != null && isGroundPort(element.kind, pin.portId)
    })
    const kind: ElectricalNetKind = sources.length > 0 ? 'power' : grounded ? 'ground' : 'signal'
    const controllerSignals = members.filter((pin) => {
      const element = elements.get(pin.componentId)
      const port = element?.ports.find((item) => item.id === pin.portId)
      return element != null && port != null && CONTROLLERS.has(element.kind) && roleOf(element, port) === 'signal'
    })
    if (sources.length > 1) {
      issues.push({
        code: 'distinct-supplies-merged',
        message: `${sources.map(pinKey).join(' and ')} are different supplies and share one net.`,
      })
    }
    if (sources.length > 0 && grounded) {
      issues.push({
        code: 'power-ground-short',
        message: `${sources.map(pinKey).join(', ')} shares a net with ground.`,
      })
    }
    if (controllerSignals.length > 1) {
      issues.push({
        code: 'controller-pins-joined',
        message: `${controllerSignals.map(pinKey).join(' and ')} share one net.`,
      })
    }
    const nodes = [...new Set(extras.get(root)?.nodes ?? [])].sort()
    built.push({
      id: `net:${members.map(pinKey).join('+')}`,
      name: '',
      kind,
      members,
      sources,
      nodes,
    })
  }

  const groundNets = built.filter((net) => net.kind === 'ground')
  for (const net of built) {
    net.name = nameOf(net, elements, groundNets.length)
  }
  built.sort((left, right) => left.id.localeCompare(right.id))

  const netIdOf = new Map<string, string>()
  for (const net of built) {
    for (const member of net.members) {
      netIdOf.set(pinKey(member), net.id)
    }
  }

  const components: ElectricalComponent[] = layout.elements.map((element) => ({
    id: element.id,
    label: element.label,
    kind: element.kind,
    catalogueId: element.identity?.catalogueId ?? null,
    pins: element.ports.map((port) => ({
      componentId: element.id,
      portId: port.id,
      label: port.label,
      polarity: polarityOf(port),
      role: roleOf(element, port),
      netId: netIdOf.get(pinKey({ componentId: element.id, portId: port.id })) ?? null,
    })),
  }))

  issues.sort((left, right) => left.code.localeCompare(right.code) || left.message.localeCompare(right.message))

  return { components, nets: built, links, issues }
}

function nameOf(net: ElectricalNet, elements: Map<string, WiringElementDef>, groundCount: number): string {
  if (net.kind === 'power' && net.sources.length === 1) {
    return pinKey(net.sources[0])
  }
  if (net.kind === 'power') {
    return net.sources.map(pinKey).join('+') || net.id
  }
  if (net.kind === 'ground') {
    if (groundCount === 1) {
      return 'GND'
    }
    const grounds = net.members.filter((pin) => {
      const element = elements.get(pin.componentId)
      return element != null && isGroundPort(element.kind, pin.portId)
    })
    return `GND:${grounds.map(pinKey).join('+')}`
  }
  const controller = net.members.find((pin) => {
    const element = elements.get(pin.componentId)
    return element != null && CONTROLLERS.has(element.kind)
  })
  if (controller) {
    return pinKey(controller)
  }
  return net.members.map(pinKey).join('+')
}

function takeOne<T>(
  matches: T[],
  kind: 'component' | 'pin',
  label: string,
  issues: ElectricalIssue[],
): T | null {
  if (matches.length === 1) {
    return matches[0]
  }
  if (matches.length === 0) {
    issues.push({
      code: kind === 'component' ? 'unknown-component' : 'unknown-pin',
      message: kind === 'component' ? `No component matches "${label}".` : `No pin matches ${label}.`,
    })
    return null
  }
  issues.push({
    code: kind === 'component' ? 'ambiguous-component' : 'ambiguous-pin',
    message: kind === 'component' ? `"${label}" matches more than one component.` : `${label} matches more than one pin.`,
  })
  return null
}
