export function sameWireIds(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false
  }
  const a = [...left].sort()
  const b = [...right].sort()
  return a.every((id, index) => id === b[index])
}

/** Selecting the focused connection again returns to the normal diagram. */
export function toggleWireFocus(current: readonly string[] | null, next: readonly string[]): string[] | null {
  if (next.length === 0) {
    return null
  }
  if (current && sameWireIds(current, next)) {
    return null
  }
  return [...next]
}

/** A focused wire stays focused when the scene is rebuilt, and clears when that wire is no longer drawn. */
export function retainWireFocus(current: readonly string[] | null, available: readonly string[]): string[] | null {
  if (!current || current.length === 0) {
    return null
  }
  return current.every((id) => available.includes(id)) ? [...current] : null
}

export type WireEmphasis = 'active' | 'prior' | 'context'

export type WirePaint = {
  id: string
  opacity: number
  strokeWidth: number
  halo: 'focus' | 'new' | 'none'
  ends: boolean
  focused: boolean
}

/**
 * How each visible wire is drawn.
 * A manual focus fades the other wires and paints the chosen wire last.
 * With no focus, wires introduced on this step keep their own highlight.
 */
export function paintConnectionWires(
  wires: readonly { id: string; emphasis: WireEmphasis; related: boolean }[],
  focusedIds: readonly string[],
  options: { introducing: boolean; selecting: boolean },
): WirePaint[] {
  const focused = new Set(focusedIds)
  const isolating = focused.size > 0
  const painted = wires.map((wire) => {
    const marked = isolating ? focused.has(wire.id) : options.selecting && wire.related
    const dimmed = isolating ? !focused.has(wire.id) : options.selecting && !wire.related
    const quiet = wire.emphasis !== 'active'
    const fresh = options.introducing && wire.emphasis === 'active' && !options.selecting && !isolating
    return {
      id: wire.id,
      opacity: marked ? 1 : dimmed ? 0.22 : quiet ? 0.38 : 1,
      strokeWidth: marked ? 3.6 : quiet ? 2.2 : 2.8,
      halo: marked ? ('focus' as const) : fresh ? ('new' as const) : ('none' as const),
      ends: marked || fresh,
      focused: isolating && focused.has(wire.id),
    }
  })
  return painted.sort((a, b) => Number(a.focused) - Number(b.focused))
}

/** A connection focus does not dim component artwork. Part selection still does. */
export function focusedPartOpacity(isolating: boolean, selecting: boolean, selected: boolean, emphasis: WireEmphasis) {
  if (!isolating && selecting && !selected) {
    return 0.55
  }
  return emphasis === 'context' ? 0.5 : 1
}
