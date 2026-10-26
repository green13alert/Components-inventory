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
