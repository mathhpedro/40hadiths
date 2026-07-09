import { supabase } from './supabase'
import type { CardState } from './srs'

/** Remote progress/notes reduced to (value, timestamp-in-ms) for LWW merging. */
export interface RemoteProgress {
  card: CardState
  ts: number
}
export interface RemoteNote {
  body: string
  ts: number
}

export interface RemoteSnapshot {
  progress: Record<number, RemoteProgress>
  notes: Record<number, RemoteNote>
}

export async function pullRemote(userId: string): Promise<RemoteSnapshot> {
  const empty: RemoteSnapshot = { progress: {}, notes: {} }
  if (!supabase) return empty
  const [p, n] = await Promise.all([
    supabase
      .from('progress')
      .select('hadith_number,box,due,last,reps,updated_at')
      .eq('user_id', userId),
    supabase.from('notes').select('hadith_number,body,updated_at').eq('user_id', userId),
  ])
  const snapshot: RemoteSnapshot = { progress: {}, notes: {} }
  for (const row of p.data ?? []) {
    snapshot.progress[row.hadith_number] = {
      card: { box: row.box, due: Number(row.due), last: Number(row.last), reps: row.reps },
      ts: Date.parse(row.updated_at),
    }
  }
  for (const row of n.data ?? []) {
    snapshot.notes[row.hadith_number] = { body: row.body, ts: Date.parse(row.updated_at) }
  }
  return snapshot
}

export async function pushProgress(
  userId: string,
  hadithNumber: number,
  card: CardState,
  ts: number,
): Promise<void> {
  if (!supabase) return
  await supabase.from('progress').upsert(
    {
      user_id: userId,
      hadith_number: hadithNumber,
      box: card.box,
      due: card.due,
      last: card.last,
      reps: card.reps,
      updated_at: new Date(ts).toISOString(),
    },
    { onConflict: 'user_id,hadith_number' },
  )
}

export async function pushNote(
  userId: string,
  hadithNumber: number,
  body: string,
  ts: number,
): Promise<void> {
  if (!supabase) return
  await supabase.from('notes').upsert(
    {
      user_id: userId,
      hadith_number: hadithNumber,
      body,
      updated_at: new Date(ts).toISOString(),
    },
    { onConflict: 'user_id,hadith_number' },
  )
}

/** Wipe this user's cloud data (used by the "erase everything" action). */
export async function clearRemote(userId: string): Promise<void> {
  if (!supabase) return
  await Promise.all([
    supabase.from('progress').delete().eq('user_id', userId),
    supabase.from('notes').delete().eq('user_id', userId),
  ])
}
