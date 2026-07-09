import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client for optional cloud sync of progress + notes.
 *
 * The URL and publishable key below are *publishable* by design — every
 * Supabase web app ships them in the client. Real protection comes from
 * Row Level Security (see supabase/migrations): a signed-in user can only
 * read/write their own rows. Env vars override the baked defaults if set.
 */
const url =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://uhguulzgyfyvpieuaodp.supabase.co'
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_H5Bpc2VCB2tQa99g3aNcyQ_HL_jvgGD'

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'hadiths40:auth',
      },
    })
  : null
