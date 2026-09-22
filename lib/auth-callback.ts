import * as Linking from 'expo-linking';
import type { EmailOtpType } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

import { AUTH_ERRORS } from '@/constants/auth';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type AuthCallbackResult = {
  handled: boolean;
  error: string | null;
};

const EMAIL_LINK_TYPES: readonly EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
];

const processedUrls = new Map<string, Promise<AuthCallbackResult>>();

function firstString(value: string | string[] | undefined | null): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' && value[0].length > 0 ? value[0] : undefined;
  }

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function extractRawParams(url: string): string {
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const chunks: string[] = [];

  if (queryIndex >= 0) {
    const end = hashIndex > queryIndex ? hashIndex : url.length;
    chunks.push(url.slice(queryIndex + 1, end));
  }

  if (hashIndex >= 0) {
    chunks.push(url.slice(hashIndex + 1));
  }

  return chunks.join('&');
}

function collectAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  new URLSearchParams(extractRawParams(url)).forEach((value, key) => {
    if (value) {
      params[key] = value;
    }
  });

  const parsed = Linking.parse(url);
  for (const [key, value] of Object.entries(parsed.queryParams ?? {})) {
    const text = firstString(value);
    if (text && !params[key]) {
      params[key] = text;
    }
  }

  return params;
}

function isAuthCallbackUrl(url: string): boolean {
  if (/auth\/callback/i.test(url)) {
    return true;
  }

  const params = collectAuthParams(url);
  return Boolean(params.code || params.access_token || params.refresh_token || params.token_hash);
}

function mapCallbackError(message: string | undefined, code?: string): string {
  const lower = `${code ?? ''} ${message ?? ''}`.toLowerCase();

  if (
    lower.includes('otp_expired') ||
    lower.includes('expired') ||
    lower.includes('flow_state_expired')
  ) {
    return AUTH_ERRORS.confirmationExpired;
  }

  if (
    lower.includes('flow_state_not_found') ||
    lower.includes('already been used') ||
    lower.includes('token has been used') ||
    lower.includes('already used')
  ) {
    return AUTH_ERRORS.confirmationUsed;
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return AUTH_ERRORS.network;
  }

  return AUTH_ERRORS.confirmationInvalid;
}

function emailLinkTypeFromParam(value: string | undefined): EmailOtpType {
  if (value && EMAIL_LINK_TYPES.includes(value as EmailOtpType)) {
    return value as EmailOtpType;
  }

  return 'signup';
}

async function completeAuthCallback(url: string): Promise<AuthCallbackResult> {
  const params = collectAuthParams(url);
  const errorParam = params.error || params.error_code;
  const errorDescription = params.error_description?.replace(/\+/g, ' ');

  if (errorParam || errorDescription) {
    return {
      handled: true,
      error: mapCallbackError(errorDescription ?? errorParam, errorParam),
    };
  }

  const code = params.code;
  const flowId = params.sb_flow_id;
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  const tokenHash =
    params.token_hash ?? (params.token && params.token.length > 16 ? params.token : undefined);

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );
      if (error) {
        return { handled: true, error: mapCallbackError(error.message, error.code) };
      }
      return { handled: true, error: null };
    }

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        return { handled: true, error: mapCallbackError(error.message, error.code) };
      }
      return { handled: true, error: null };
    }

    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: emailLinkTypeFromParam(params.type),
      });
      if (error) {
        return { handled: true, error: mapCallbackError(error.message, error.code) };
      }
      return { handled: true, error: null };
    }

    return { handled: true, error: AUTH_ERRORS.confirmationMissing };
  } catch {
    return { handled: true, error: AUTH_ERRORS.network };
  }
}

function callbackCacheKey(url: string): string {
  const params = collectAuthParams(url);
  if (params.code) {
    return `code:${params.code}`;
  }
  if (params.access_token) {
    return `access:${params.access_token}`;
  }
  if (params.token_hash) {
    return `hash:${params.token_hash}`;
  }
  if (params.token && params.token.length > 16) {
    return `token:${params.token}`;
  }
  return url;
}

export async function processAuthCallbackUrl(url: string): Promise<AuthCallbackResult> {
  if (!isAuthCallbackUrl(url)) {
    return { handled: false, error: null };
  }

  const cacheKey = callbackCacheKey(url);
  const existing = processedUrls.get(cacheKey);
  if (existing) {
    return existing;
  }

  const work = completeAuthCallback(url).then((result) => {
    if (result.error === AUTH_ERRORS.network) {
      processedUrls.delete(cacheKey);
    }
    return result;
  });

  processedUrls.set(cacheKey, work);
  return work;
}

export async function processAuthCallbackParams(
  params: Record<string, string | string[] | undefined>,
): Promise<AuthCallbackResult> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    const text = firstString(value);
    if (text) {
      flat[key] = text;
    }
  }

  if (
    !flat.code &&
    !flat.access_token &&
    !flat.token_hash &&
    !flat.token &&
    !flat.error &&
    !flat.error_code
  ) {
    return { handled: false, error: null };
  }

  return processAuthCallbackUrl(`atlas://auth/callback?${new URLSearchParams(flat).toString()}`);
}
