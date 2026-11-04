import {
  INTEREST_OPTIONS,
  ONBOARDING_SAVE_ERRORS,
  USER_PREFERENCE_TOPIC_KEY,
  type ExperienceLevel,
} from '@/constants/onboarding';
import {
  saveOnboardingInventory,
  type OnboardingComponentSelection,
  type OnboardingInventoryGateway,
} from '@/lib/onboarding-inventory';
import { supabase } from '@/lib/supabase';

export type OnboardingSelections = {
  skillLevel: ExperienceLevel | null;
  components: OnboardingComponentSelection[];
  interestIds: string[];
};

type PersistResult = {
  error: string | null;
};

const allowedTopicIds = new Set(INTEREST_OPTIONS.map((option) => option.id));

let pendingSelections: OnboardingSelections | null = null;
let persistStashOnAuth = true;

export function stashOnboardingSelections(selections: OnboardingSelections) {
  pendingSelections = {
    skillLevel: selections.skillLevel,
    components: selections.components.map((item) => ({ slug: item.slug, quantity: item.quantity })),
    interestIds: [...selections.interestIds],
  };
  persistStashOnAuth = true;
}

/** Clears in-memory onboarding picks that have not been saved. Does not touch Supabase. */
export function clearStashedOnboardingSelections() {
  pendingSelections = null;
  persistStashOnAuth = true;
}

/** Existing-account login must not write temporary onboarding picks. */
export function discardStashedOnboardingOnAuth() {
  persistStashOnAuth = false;
}

/** New-account sign-up / confirmation should save the temporary onboarding picks. */
export function keepStashedOnboardingForNewAccount() {
  persistStashOnAuth = true;
}

function mapPersistError(message: string | undefined): string {
  if (!message) {
    return ONBOARDING_SAVE_ERRORS.generic;
  }

  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return ONBOARDING_SAVE_ERRORS.generic;
  }

  return ONBOARDING_SAVE_ERRORS.generic;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

async function persistSkillLevel(userId: string, skillLevel: ExperienceLevel): Promise<PersistResult> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      skill_level: skillLevel,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return { error: mapPersistError(error.message) };
  }

  return { error: null };
}

function inventoryGateway(): OnboardingInventoryGateway {
  return {
    async findCatalogueBySlug(slugs) {
      const { data, error } = await supabase.from('components').select('id, slug').in('slug', [...slugs]);
      if (error) {
        return { rows: null, error: error.message };
      }
      return {
        rows: (data ?? []).map((row) => ({
          id: row.id as string,
          slug: row.slug as string,
        })),
        error: null,
      };
    },
    async findOwned(userId, componentIds) {
      if (componentIds.length === 0) {
        return { rows: [], error: null };
      }
      const { data, error } = await supabase
        .from('inventory_items')
        .select('component_id, quantity')
        .eq('user_id', userId)
        .in('component_id', [...componentIds]);
      if (error) {
        return { rows: null, error: error.message };
      }
      return {
        rows: (data ?? []).map((row) => ({
          componentId: row.component_id as string,
          quantity: row.quantity as number,
        })),
        error: null,
      };
    },
    async insertMissing(userId, rows) {
      const { error } = await supabase.from('inventory_items').insert(
        rows.map((row) => ({
          user_id: userId,
          component_id: row.componentId,
          quantity: row.quantity,
        })),
      );
      if (!error) {
        return { error: null, conflict: false };
      }
      return { error: error.message, conflict: error.code === '23505' };
    },
  };
}

async function persistInventory(
  userId: string,
  components: readonly OnboardingComponentSelection[],
): Promise<PersistResult> {
  return saveOnboardingInventory(userId, components, inventoryGateway());
}

async function persistTopics(userId: string, interestIds: string[]): Promise<PersistResult> {
  const nextTopics = [...new Set(interestIds.filter((id) => allowedTopicIds.has(id)))];

  if (nextTopics.length === 0) {
    return { error: null };
  }

  const { data: existing, error: existingError } = await supabase
    .from('user_preferences')
    .select('value')
    .eq('user_id', userId)
    .eq('key', USER_PREFERENCE_TOPIC_KEY);

  if (existingError) {
    return { error: mapPersistError(existingError.message) };
  }

  const existingSet = new Set((existing ?? []).map((row) => row.value as string));
  const nextSet = new Set(nextTopics);
  const toAdd = nextTopics.filter((value) => !existingSet.has(value));
  const toRemove = [...existingSet].filter((value) => !nextSet.has(value));

  if (toAdd.length > 0) {
    const { error } = await supabase.from('user_preferences').insert(
      toAdd.map((value) => ({
        user_id: userId,
        key: USER_PREFERENCE_TOPIC_KEY,
        value,
      })),
    );

    if (error) {
      return { error: mapPersistError(error.message) };
    }
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('key', USER_PREFERENCE_TOPIC_KEY)
      .in('value', toRemove);

    if (error) {
      return { error: mapPersistError(error.message) };
    }
  }

  return { error: null };
}

export async function persistOnboardingSelections(
  selections: OnboardingSelections,
): Promise<PersistResult> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { error: ONBOARDING_SAVE_ERRORS.unauthenticated };
  }

  if (selections.skillLevel) {
    const skillResult = await persistSkillLevel(userId, selections.skillLevel);
    if (skillResult.error) {
      return skillResult;
    }
  }

  const inventoryResult = await persistInventory(userId, selections.components);
  if (inventoryResult.error) {
    return inventoryResult;
  }

  return persistTopics(userId, selections.interestIds);
}

export async function persistStashedOnboardingSelections(): Promise<PersistResult> {
  if (!persistStashOnAuth) {
    pendingSelections = null;
    persistStashOnAuth = true;
    return { error: null };
  }

  if (!pendingSelections) {
    return { error: null };
  }

  const result = await persistOnboardingSelections(pendingSelections);
  if (!result.error) {
    pendingSelections = null;
  }

  return result;
}
