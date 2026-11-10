export const STEP_SCROLL_END_TOLERANCE = 16

export type StepScrollMeasurement = {
  offsetY?: number
  viewportHeight?: number
  instructionalHeight?: number
  /**
   * The user opened or closed an optional explanation. An end already reached
   * stays reached. An early short layout measurement must not set this.
   */
  preserveReachedEnd?: boolean
  /** The user already advanced past this step. Opening it does not require another scroll. */
  alreadyCompleted?: boolean
}

export type StepScrollGate = {
  stepKey: string
  reachedStepKey: string | null
  unlockedByScroll: boolean
  freshLayout: boolean
  offsetY: number
  viewportHeight: number
  instructionalHeight: number
  stepCompleted: boolean
}

export function initialStepScrollGate(): StepScrollGate {
  return {
    stepKey: '',
    reachedStepKey: null,
    unlockedByScroll: false,
    freshLayout: false,
    offsetY: 0,
    viewportHeight: 0,
    instructionalHeight: 0,
    stepCompleted: false,
  }
}

/**
 * A step whose content is taller than the viewport stays locked until the
 * bottom is actually in view. A step that already fits is unlocked. A fit
 * caused by an early short measurement is revoked if the content later grows.
 * Growth flagged as an optional explanation does not revoke an end already reached.
 */
export function getStepScrollState(input: {
  offsetY: number
  viewportHeight: number
  instructionalHeight: number
}): { ready: boolean; canScroll: boolean; atEnd: boolean } {
  if (input.viewportHeight <= 0 || input.instructionalHeight <= 0) {
    return { ready: false, canScroll: false, atEnd: false }
  }

  const canScroll = input.instructionalHeight > input.viewportHeight + STEP_SCROLL_END_TOLERANCE
  const atEnd =
    !canScroll ||
    Math.max(0, input.offsetY) + input.viewportHeight >= input.instructionalHeight - STEP_SCROLL_END_TOLERANCE

  return { ready: true, canScroll, atEnd }
}

export function updateStepScrollGate(
  gate: StepScrollGate,
  stepKey: string,
  metrics: StepScrollMeasurement,
): StepScrollGate {
  let next = gate
  const markedComplete = Boolean(metrics.alreadyCompleted)
  if (next.stepKey !== stepKey) {
    next = {
      ...next,
      stepKey,
      stepCompleted: markedComplete,
      reachedStepKey: markedComplete ? stepKey : null,
      unlockedByScroll: markedComplete,
      freshLayout: false,
      offsetY: 0,
      instructionalHeight: 0,
    }
  } else if (markedComplete) {
    next = { ...next, stepCompleted: true }
  }

  if (metrics.viewportHeight != null && metrics.viewportHeight > 0) {
    next = { ...next, viewportHeight: metrics.viewportHeight }
  }
  const hadFreshLayout = next.freshLayout
  if (metrics.instructionalHeight != null && metrics.instructionalHeight > 0) {
    next = {
      ...next,
      instructionalHeight: metrics.instructionalHeight,
      freshLayout: true,
      offsetY: hadFreshLayout ? next.offsetY : 0,
    }
  }
  if (metrics.offsetY != null && hadFreshLayout) {
    next = { ...next, offsetY: Math.max(0, metrics.offsetY) }
  }

  const state = getStepScrollState(next)
  if (!state.ready) {
    return next
  }

  if (!state.canScroll) {
    return { ...next, reachedStepKey: stepKey, unlockedByScroll: next.stepCompleted }
  }

  let reachedStepKey = next.reachedStepKey
  let unlockedByScroll = next.unlockedByScroll
  if (next.stepCompleted) {
    unlockedByScroll = true
    reachedStepKey = stepKey
  } else if (metrics.preserveReachedEnd && reachedStepKey === stepKey) {
    unlockedByScroll = true
  } else if (!unlockedByScroll && reachedStepKey === stepKey) {
    reachedStepKey = null
  }
  if (state.atEnd) {
    unlockedByScroll = true
    reachedStepKey = stepKey
  }
  return { ...next, reachedStepKey, unlockedByScroll }
}

export function stepAdvanceLocked(gate: StepScrollGate, stepKey: string): boolean {
  return gate.reachedStepKey !== stepKey
}
