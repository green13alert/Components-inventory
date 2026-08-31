import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (__DEV__ && (!supabaseUrl || !supabasePublishableKey)) {
  console.warn(
    '[Solderi] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and add your project credentials.',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabasePublishableKey ?? '', {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

type SupabaseConnectionResult = {
  ok: boolean;
  message: string;
};

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return (
    value.includes('YOUR_PROJECT_REF') ||
    value.includes('YOUR_SUPABASE_PUBLISHABLE_KEY') ||
    value.includes('<SUBSTITUTE_')
  );
}

/**
 * Development-only check that the client can reach this Supabase project.
 * Uses the Auth health endpoint so it does not require any database tables.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionResult> {
  if (isPlaceholder(supabaseUrl) || isPlaceholder(supabasePublishableKey)) {
    return {
      ok: false,
      message:
        'Supabase env vars are missing or still placeholders. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabasePublishableKey!,
        Authorization: `Bearer ${supabasePublishableKey}`,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Supabase health check failed (${response.status}). Check the project URL and publishable key.`,
      };
    }

    return {
      ok: true,
      message: 'Supabase client initialized and project is reachable.',
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `Supabase connection failed: ${detail}`,
    };
  }
}
