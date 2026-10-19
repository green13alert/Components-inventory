export type DiscoveryProject = {
  title: string
  description: string
  isPublished: boolean
}

export type DiscoverySection<T> = {
  id: 'published' | 'drafts'
  projects: T[]
}

function matchesSearch<T extends DiscoveryProject>(project: T, query: string) {
  if (query.length === 0) {
    return true
  }
  return project.title.toLowerCase().includes(query) || project.description.toLowerCase().includes(query)
}

/**
 * Published projects are the catalogue. Development drafts stay in a later section
 * and never replace a published row. A search looks at both, with published matches first.
 */
export function discoverySections<T extends DiscoveryProject>(input: {
  published: readonly T[]
  drafts: readonly T[]
  search: string
  showDrafts: boolean
}): DiscoverySection<T>[] {
  const query = input.search.trim().toLowerCase()
  const sections: DiscoverySection<T>[] = [
    {
      id: 'published',
      projects: input.published.filter((project) => project.isPublished && matchesSearch(project, query)),
    },
  ]
  if (!input.showDrafts) {
    return sections
  }
  const drafts = input.drafts.filter((project) => !project.isPublished && matchesSearch(project, query))
  if (query.length === 0 || drafts.length > 0) {
    sections.push({ id: 'drafts', projects: drafts })
  }
  return sections
}
