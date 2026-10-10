export type ComponentRowCoverage = 'exact' | 'direct_substitute' | 'none'

export type ComponentRowStatus = 'owned' | 'covered' | 'missing'

type InventoryNameSource = {
  componentId?: string
  catalogueId?: string
  name: string
}

export function substituteNameFromInventory(
  componentId: string | null | undefined,
  inventory: readonly InventoryNameSource[],
  catalogueName: (catalogueId: string) => string | undefined,
): string | null {
  if (!componentId) {
    return null
  }
  const owned = inventory.find((item) => item.componentId === componentId)
  if (!owned) {
    return null
  }
  if (owned.catalogueId) {
    const name = catalogueName(owned.catalogueId)
    if (name) {
      return name
    }
  }
  return owned.name.length > 0 ? owned.name : null
}

export function componentRowPresentation(input: {
  coverage?: ComponentRowCoverage
  isOwned: boolean
  substituteName?: string | null
}): {
  status: ComponentRowStatus
  badge: 'Owned' | 'Covered' | 'Missing'
  substituteLine: string | null
} {
  if (input.coverage === 'direct_substitute') {
    const name = input.substituteName?.trim()
    return {
      status: 'covered',
      badge: 'Covered',
      substituteLine: name ? `Covered by ${name}` : null,
    }
  }
  if (input.coverage === 'exact' || (input.coverage == null && input.isOwned)) {
    return { status: 'owned', badge: 'Owned', substituteLine: null }
  }
  return { status: 'missing', badge: 'Missing', substituteLine: null }
}
