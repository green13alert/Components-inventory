export type InventoryRefreshPlan<T> = {
  /** When false, the cached rows stay in place. */
  replaceInventory: boolean
  inventory: readonly T[]
  /** When false, the shared inventory error is left as it was. */
  touchError: boolean
  storedError: string | null
  /** Error reported to the caller. A silent failure is reported here and does not clear the cache. */
  reportedError: string | null
}

/**
 * Decides what a reload may change.
 * A signed-out session and a successful empty list are legitimate empty inventories.
 * A silent failure keeps the last loaded rows. A non-silent failure still replaces
 * them with an empty list so the inventory screen can show its existing error state.
 */
export function planInventoryRefresh<T>(input: {
  cached: readonly T[]
  signedIn: boolean
  silent: boolean
  result: { data: readonly T[] | null; error: string | null }
}): InventoryRefreshPlan<T> {
  if (!input.signedIn) {
    return {
      replaceInventory: true,
      inventory: [],
      touchError: true,
      storedError: null,
      reportedError: null,
    }
  }
  if (input.result.error) {
    if (input.silent) {
      return {
        replaceInventory: false,
        inventory: input.cached,
        touchError: false,
        storedError: null,
        reportedError: input.result.error,
      }
    }
    return {
      replaceInventory: true,
      inventory: [],
      touchError: true,
      storedError: input.result.error,
      reportedError: input.result.error,
    }
  }
  return {
    replaceInventory: true,
    inventory: input.result.data ?? [],
    touchError: true,
    storedError: null,
    reportedError: null,
  }
}

/**
 * A second silent refresh for the same account waits on the refresh already
 * running. A different account never receives that result.
 */
export function joinInFlightRefresh<T>(
  current: { accountId: string | null; task: Promise<T> } | null,
  accountId: string | null,
): Promise<T> | null {
  if (!current || current.accountId !== accountId) {
    return null
  }
  return current.task
}
