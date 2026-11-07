import { skillLevelFromProfileRead, type RecommendationSkillLevel } from '@/lib/home-recommendations';
import { supabase } from '@/lib/supabase';

/** Reads the onboarding skill level. It does not create or update the profile. */
export async function fetchSavedSkillLevel(): Promise<RecommendationSkillLevel | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('skill_level')
    .eq('id', userData.user.id)
    .maybeSingle();

  return skillLevelFromProfileRead({
    data: data ? { skill_level: data.skill_level } : null,
    error: error ? error.message : null,
  });
}
