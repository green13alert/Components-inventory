import * as Linking from 'expo-linking';

export const AUTH_CALLBACK_PATH = 'auth/callback';

/** Deep-link destination embedded in Supabase confirmation emails. */
export function getEmailRedirectTo(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}
