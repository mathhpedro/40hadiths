/**
 * Minimal Leitner-style spaced repetition. Three self-graded answers map to
 * box movement; the box picks the next interval. Pure functions — the React
 * layer just stores the returned CardState.
 */
export type SrsGrade = 'know' | 'almost' | 'dont'

export interface CardState {
  box: number // 0..5
  due: number // epoch ms when the card is next due
  last: number // epoch ms of last review (0 = never)
  reps: number
}

const DAY = 86_400_000
// Interval (in days) to wait after landing in each box.
const INTERVALS_DAYS = [0, 1, 3, 7, 16, 35]
export const MAX_BOX = INTERVALS_DAYS.length - 1

export function initCard(now: number): CardState {
  return { box: 0, due: now, last: 0, reps: 0 }
}

export function review(card: CardState | undefined, grade: SrsGrade, now: number): CardState {
  const prev = card ?? initCard(now)
  let box = prev.box
  if (grade === 'know') box = Math.min(box + 1, MAX_BOX)
  else if (grade === 'dont') box = 0
  // "almost" keeps the box but schedules a shorter interval than a full pass.
  const baseDays = INTERVALS_DAYS[box]
  const intervalDays = grade === 'almost' ? Math.max(1, Math.round(baseDays / 2)) : baseDays
  return { box, due: now + intervalDays * DAY, last: now, reps: prev.reps + 1 }
}

export function isDue(card: CardState | undefined, now: number): boolean {
  return !card || card.due <= now
}

export type MemoStatus = 'new' | 'learning' | 'memorized'

export function statusFromCard(card: CardState | undefined): MemoStatus {
  if (!card || card.reps === 0) return 'new'
  if (card.box >= MAX_BOX) return 'memorized'
  return 'learning'
}
