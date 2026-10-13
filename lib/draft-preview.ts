/** Development builds may request drafts. Production builds must not. */
export function draftProjectsAreRequested(isDev: boolean): boolean {
  return isDev === true
}
