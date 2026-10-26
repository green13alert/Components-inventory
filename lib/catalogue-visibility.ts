/** Slugs kept in the database for progress, but omitted from a fresh catalogue browse. */
export const RETIRED_FROM_DISCOVERY = ['18'] as const

export function retiredFromDiscovery(slug: string): boolean {
  return (RETIRED_FROM_DISCOVERY as readonly string[]).includes(slug)
}

/**
 * Home recommendations never include a retired slug.
 * Continue Building still uses in-progress projects, including a retired one.
 */
export function shownInRecommendations(slug: string): boolean {
  return !retiredFromDiscovery(slug)
}

/**
 * The projects catalogue hides a retired project until the learner has started it,
 * finished it, or marked it as a favourite. Those rows stay reachable.
 */
export function shownInProjectCatalogue(input: {
  slug: string
  status: string
  isFavourite: boolean
}): boolean {
  if (!retiredFromDiscovery(input.slug)) {
    return true
  }
  return input.status === 'in_progress' || input.status === 'completed' || input.isFavourite
}
