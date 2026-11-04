import { createClient } from '@supabase/supabase-js';
import { parseOrThrow, signInSchema, signUpSchema } from '../shared/lib/schemas';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

const AUTH_BASE = import.meta.env.VITE_AUTH_API_URL || '/api/auth';
const USE_LOCAL_DEV_AUTH = import.meta.env.DEV && !import.meta.env.VITE_AUTH_API_URL && !supabase;
const LOCAL_ACCOUNT_KEY = 'aquaflow_dev_account';
const LOCAL_SESSION_KEY = 'aquaflow_dev_session';

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToBase64(bits);
}

async function localSignUp(credentials) {
  if (localStorage.getItem(LOCAL_ACCOUNT_KEY))
    throw new Error('An account already exists on this device.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account = {
    name: credentials.name,
    username: credentials.username,
    email: credentials.email,
    salt: bytesToBase64(salt),
    passwordHash: await hashPassword(credentials.password, salt),
  };
  localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
  return {
    ok: true,
    requiresEmailVerification: false,
    user: { name: account.name, username: account.username, email: account.email },
  };
}

async function localSignIn(credentials) {
  const account = JSON.parse(localStorage.getItem(LOCAL_ACCOUNT_KEY) || 'null');
  if (!account) throw new Error('No local account found. Create an account first.');
  const identifier = credentials.identifier.toLowerCase();
  if (identifier !== account.username.toLowerCase() && identifier !== account.email.toLowerCase())
    throw new Error('Invalid username or password.');
  const valid =
    account.passwordHash ===
    (await hashPassword(credentials.password, base64ToBytes(account.salt)));
  if (!valid) throw new Error('Invalid username or password.');
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(24)));
  (credentials.remember ? localStorage : sessionStorage).setItem(LOCAL_SESSION_KEY, token);
  return {
    ok: true,
    user: { name: account.name, username: account.username, email: account.email },
  };
}

function localSessionExists() {
  return Boolean(
    sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY),
  );
}

async function authRequest(path, options = {}) {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      response.status === 401
        ? 'Invalid email or password.'
        : 'Authentication is temporarily unavailable.';
    throw new Error(message);
  }
  return data;
}

export async function signIn(credentials) {
  const input = parseOrThrow(signInSchema, credentials);
  if (supabase) {
    const email = input.identifier.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Invalid email or password.');
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please confirm your email or disable email confirmation in Supabase Auth.');
      }
      throw new Error(error.message || 'Authentication failed.');
    }
    const user = data.user;
    return {
      ok: true,
      user: {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Farm User',
        username: user.user_metadata?.username || user.email,
        email: user.email,
      },
    };
  }
  if (USE_LOCAL_DEV_AUTH) return localSignIn(input);
  return authRequest('/login', { method: 'POST', body: JSON.stringify(input) });
}

export async function signUp(credentials) {
  const input = parseOrThrow(signUpSchema, credentials);
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          name: input.name.trim(),
          username: input.username.trim(),
        },
      },
    });
    if (error) {
      throw new Error(error.message || 'Failed to create account.');
    }
    return {
      ok: true,
      requiresEmailVerification: !data.session,
      user: {
        name: input.name,
        username: input.username,
        email: input.email,
      },
    };
  }
  if (USE_LOCAL_DEV_AUTH) return localSignUp(input);
  return authRequest('/signup', { method: 'POST', body: JSON.stringify(input) });
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { ok: true };
  }
  if (USE_LOCAL_DEV_AUTH) {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return Promise.resolve({ ok: true });
  }
  return authRequest('/logout', { method: 'POST' });
}

export async function getSession() {
  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.user) {
      throw new Error('No session');
    }
    const user = data.session.user;
    return {
      ok: true,
      user: {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Farm User',
        username: user.user_metadata?.username || user.email,
        email: user.email,
      },
    };
  }
  if (USE_LOCAL_DEV_AUTH) {
    const account = JSON.parse(localStorage.getItem(LOCAL_ACCOUNT_KEY) || 'null');
    return localSessionExists() && account
      ? Promise.resolve({ ok: true, user: account })
      : Promise.reject(new Error('No session'));
  }
  return authRequest('/session');
}
