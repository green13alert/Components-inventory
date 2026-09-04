import {
  INTEREST_OPTIONS,
  ONBOARDING_COMPONENT_SLUGS,
  ONBOARDING_SAVE_ERRORS,
  USER_PREFERENCE_TOPIC_KEY,
  type ExperienceLevel,
} from '@/constants/onboarding';
import { supabase } from '@/lib/supabase';

export type OnboardingSelections = {
  skillLevel: ExperienceLevel | null;
  componentIds: string[];
  interestIds: string[];
};

type PersistResult = {
  error: string | null;
};

const allowedTopicIds = new Set(INTEREST_OPTIONS.map((option) => option.id));

let pendingSelections: OnboardingSelections | null = null;

export function stashOnboardingSelections(selections: OnboardingSelections) {
  pendingSelections = {
    skillLevel: selections.skillLevel,
    componentIds: [...selections.componentIds],
    interestIds: [...selections.interestIds],
  };
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

async function persistInventory(userId: string, componentIds: string[]): Promise<PersistResult> {
  const slugs = [
    ...new Set(
      componentIds
        .map((id) => ONBOARDING_COMPONENT_SLUGS[id])
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];

  if (slugs.length === 0) {
    return { error: null };
  }

  const { data: catalogueRows, error: catalogueError } = await supabase
    .from('components')
    .select('id, slug')
    .in('slug', slugs);

  if (catalogueError) {
    return { error: mapPersistError(catalogueError.message) };
  }

  const foundSlugs = new Set((catalogueRows ?? []).map((row) => row.slug as string));
  if (foundSlugs.size !== slugs.length) {
    return { error: ONBOARDING_SAVE_ERRORS.missingComponents };
  }

  const rows = (catalogueRows ?? []).map((row) => ({
    user_id: userId,
    component_id: row.id as string,
    quantity: 1,
  }));

  const { error } = await supabase.from('inventory_items').upsert(rows, {
    onConflict: 'user_id,component_id',
    ignoreDuplicates: true,
  });

  if (error) {
    return { error: mapPersistError(error.message) };
  }

  return { error: null };
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

  const inventoryResult = await persistInventory(userId, selections.componentIds);
  if (inventoryResult.error) {
    return inventoryResult;
  }

  return persistTopics(userId, selections.interestIds);
}

export async function persistStashedOnboardingSelections(): Promise<PersistResult> {
  if (!pendingSelections) {
    return { error: null };
  }

  const result = await persistOnboardingSelections(pendingSelections);
  if (!result.error) {
    pendingSelections = null;
  }

  return result;
}
