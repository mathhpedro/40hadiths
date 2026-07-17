import { supabase } from './supabase'

export type AttendanceStatus = 'going' | 'maybe' | 'declined'

export interface ClassSession {
  id: string
  title: string
  scheduled_at: string
  hadith_numbers: number[]
  location: string | null
  notes: string | null
  created_by: string
  created_at: string
}

export interface AttendanceRow {
  session_id: string
  user_id: string
  status: AttendanceStatus
  display_name: string | null
  updated_at: string
}

export interface NewSession {
  title: string
  scheduled_at: string // ISO
  hadith_numbers: number[]
  location?: string | null
  notes?: string | null
}

export async function fetchSessions(): Promise<ClassSession[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('scheduled_at', { ascending: true })
  if (error || !data) return []
  return data as ClassSession[]
}

export async function fetchAttendance(): Promise<AttendanceRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('attendance').select('*')
  if (error || !data) return []
  return data as AttendanceRow[]
}

export async function createSession(
  userId: string,
  input: NewSession,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'offline' }
  const { error } = await supabase.from('sessions').insert({
    title: input.title,
    scheduled_at: input.scheduled_at,
    hadith_numbers: input.hadith_numbers,
    location: input.location ?? null,
    notes: input.notes ?? null,
    created_by: userId,
  })
  return { error: error ? error.message : null }
}

export async function deleteSession(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('sessions').delete().eq('id', id)
}

export async function setAttendance(
  sessionId: string,
  userId: string,
  status: AttendanceStatus,
  displayName: string | null,
): Promise<void> {
  if (!supabase) return
  await supabase.from('attendance').upsert(
    {
      session_id: sessionId,
      user_id: userId,
      status,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,user_id' },
  )
}

/** "1, 2 e 3" / "1 2 3" → [1,2,3], de-duped, clamped to 1..42, sorted. */
export function parseHadithNumbers(input: string, max: number): number[] {
  const nums = input
    .split(/[^0-9]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= max)
  return [...new Set(nums)].sort((a, b) => a - b)
}
