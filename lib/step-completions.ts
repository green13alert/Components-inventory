import {
  classifyCompletionFailure,
  completionQueryBounds,
  shareCompletionRequest,
  type StepCompletionEvent,
} from './build-activity.ts'
import { supabase } from './supabase.ts'

const STEP_COMPLETION_SELECT = 'id, user_id, project_id, step_index, completed_at'

type StepCompletionRow = {
  id: string
  user_id: string
  project_id: string
  step_index: number
  completed_at: string
}

export type StepCompletionFetch =
  | { status: 'ready'; events: StepCompletionEvent[] }
  | { status: 'missing_table' }
  | { status: 'unauthenticated' }
  | { status: 'failed'; error: string }

export type StepCompletionWrite =
  | { status: 'inserted'; event: StepCompletionEvent }
  | { status: 'duplicate' }
  | { status: 'missing_table' }
  | { status: 'unauthenticated' }
  | { status: 'failed'; error: string }

const completionWrites = new Map<string, Promise<StepCompletionWrite>>()

function mapRow(row: StepCompletionRow): StepCompletionEvent {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    stepIndex: row.step_index,
    completedAt: row.completed_at,
  }
}

async function authenticatedUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }
  return data.user.id
}

export async function fetchStepCompletions(today = new Date()): Promise<StepCompletionFetch> {
  const userId = await authenticatedUserId()
  if (!userId) {
    return { status: 'unauthenticated' }
  }

  const bounds = completionQueryBounds(today)
  let data: StepCompletionRow[] | null
  let error: { code?: string; message?: string } | null
  try {
    const result = await supabase
      .from('user_project_step_completions')
      .select(STEP_COMPLETION_SELECT)
      .eq('user_id', userId)
      .gte('completed_at', bounds.start)
      .lt('completed_at', bounds.end)
    data = (result.data as StepCompletionRow[] | null) ?? null
    error = result.error
  } catch (caught) {
    return {
      status: 'failed',
      error: caught instanceof Error ? caught.message : 'Could not load build activity.',
    }
  }

  if (error) {
    const kind = classifyCompletionFailure(error)
    if (kind === 'missing_table') {
      return { status: 'missing_table' }
    }
    return { status: 'failed', error: error.message ?? 'Could not load build activity.' }
  }

  const events = (data ?? []).map(mapRow).filter((event) => event.userId === userId)
  return { status: 'ready', events }
}

async function insertStepCompletionOnce(
  userId: string,
  projectId: string,
  stepIndex: number,
): Promise<StepCompletionWrite> {
  const { data, error } = await supabase
    .from('user_project_step_completions')
    .insert({
      user_id: userId,
      project_id: projectId,
      step_index: stepIndex,
    })
    .select(STEP_COMPLETION_SELECT)
    .single()

  if (error) {
    const kind = classifyCompletionFailure(error)
    if (kind === 'duplicate') {
      return { status: 'duplicate' }
    }
    if (kind === 'missing_table') {
      return { status: 'missing_table' }
    }
    return { status: 'failed', error: error.message ?? 'The step completion was not saved.' }
  }

  if (!data) {
    return { status: 'failed', error: 'The step completion was not saved.' }
  }

  const event = mapRow(data as StepCompletionRow)
  if (event.userId !== userId) {
    return { status: 'failed', error: 'The step completion was not saved.' }
  }
  return { status: 'inserted', event }
}

export function insertStepCompletion(
  userId: string,
  projectId: string,
  stepIndex: number,
): Promise<StepCompletionWrite> {
  const step = Math.max(0, Math.floor(stepIndex))
  return shareCompletionRequest(completionWrites, `${userId}:${projectId}:${step}`, async () => {
    try {
      const signedIn = await authenticatedUserId()
      if (!signedIn || signedIn !== userId) {
        return { status: 'unauthenticated' }
      }
      return await insertStepCompletionOnce(signedIn, projectId, step)
    } catch (caught) {
      return {
        status: 'failed',
        error: caught instanceof Error ? caught.message : 'The step completion was not saved.',
      }
    }
  })
}
