import raw from './40-hadiths-nawawi.json'
import type {
  HadithData,
  Hadith,
  RelatedHadith,
  Lang,
  ThemeEntry,
  LocalizedHadith,
  LocalizedRelated,
} from '../types'
import { foldText } from '../lib/text'

export const data = raw as HadithData
export const meta = data.meta
export const hadiths = data.hadiths
export const relatedHadiths = data.related_hadiths

/** number → hadith, for O(1) detail lookups. */
const byNumber = new Map<number, Hadith>(hadiths.map((h) => [h.number, h]))
export function getHadith(n: number): Hadith | undefined {
  return byNumber.get(n)
}

const relatedById = new Map<string, RelatedHadith>(
  relatedHadiths.map((r) => [r.id, r]),
)
export function getRelated(id: string): RelatedHadith | undefined {
  return relatedById.get(id)
}

// ---------------------------------------------------------------------------
// Theme index — normalised across languages (EN slug is the stable id) so a
// theme filter keeps working when the user flips PT⇄EN.
// ---------------------------------------------------------------------------
function buildThemeIndex(): ThemeEntry[] {
  const map = new Map<string, ThemeEntry>()
  for (const h of hadiths) {
    const n = Math.min(h.themes_pt.length, h.themes_en.length)
    for (let i = 0; i < n; i++) {
      const pt = h.themes_pt[i]
      const en = h.themes_en[i]
      const id = foldText(en)
      const existing = map.get(id)
      if (existing) {
        if (!existing.hadiths.includes(h.number)) {
          existing.hadiths.push(h.number)
          existing.count++
        }
      } else {
        map.set(id, { id, pt, en, count: 1, hadiths: [h.number] })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.en.localeCompare(b.en))
}
export const themeIndex: ThemeEntry[] = buildThemeIndex()

/** Set of theme ids for a given hadith (used by the theme filter). */
export function themeIdsOf(h: Hadith): string[] {
  return h.themes_en.map((en) => foldText(en))
}

// ---------------------------------------------------------------------------
// Source index (Bukhari, Muslim, Tirmidhi…). Source names are language-neutral.
// ---------------------------------------------------------------------------
function buildSourceIndex(): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const h of hadiths) {
    for (const s of h.sources) map.set(s, (map.get(s) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
export const sourceIndex = buildSourceIndex()

// ---------------------------------------------------------------------------
// Precomputed fold-text search blob per hadith (title + translation +
// transliteration + narrator + themes, both languages).
// ---------------------------------------------------------------------------
const searchBlobs = new Map<number, string>(
  hadiths.map((h) => [
    h.number,
    foldText(
      [
        h.number,
        h.title_pt,
        h.title_en,
        h.translation_pt,
        h.translation_en,
        h.transliteration,
        h.narrator,
        ...h.themes_pt,
        ...h.themes_en,
      ].join(' '),
    ),
  ]),
)
export function hadithMatches(h: Hadith, foldedQuery: string): boolean {
  if (!foldedQuery) return true
  return (searchBlobs.get(h.number) ?? '').includes(foldedQuery)
}

// ---------------------------------------------------------------------------
// Localisation — collapse the *_pt / *_en fields down to the active language.
// ---------------------------------------------------------------------------
export function localizeHadith(h: Hadith, lang: Lang): LocalizedHadith {
  return {
    number: h.number,
    title: lang === 'pt' ? h.title_pt : h.title_en,
    arabic: h.arabic,
    transliteration: h.transliteration,
    translation: lang === 'pt' ? h.translation_pt : h.translation_en,
    narrator: h.narrator,
    grade: h.grade,
    sources: h.sources,
    chainNote: lang === 'pt' ? h.chain_note_pt : h.chain_note_en,
    teachings: lang === 'pt' ? h.teachings_pt : h.teachings_en,
    themes: lang === 'pt' ? h.themes_pt : h.themes_en,
  }
}

export function localizeRelated(r: RelatedHadith, lang: Lang): LocalizedRelated {
  return {
    id: r.id,
    title: lang === 'pt' ? r.title_pt : r.title_en,
    arabic: r.arabic,
    transliteration: r.transliteration,
    translation: lang === 'pt' ? r.translation_pt : r.translation_en,
    narrator: r.narrator,
    grade: r.grade,
    sources: r.sources,
    connection: lang === 'pt' ? r.connection_pt : r.connection_en,
    themes: lang === 'pt' ? r.themes_pt : r.themes_en,
  }
}

/** Deterministic "hadith of the day": rotates through all 42 by calendar day. */
export function hadithOfTheDay(date = new Date()): Hadith {
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  )
  return hadiths[((dayIndex % hadiths.length) + hadiths.length) % hadiths.length]
}

/** Pull the number a related hadith connects to (e.g. "Hadith 16" → 16). */
export function connectionNumbers(r: RelatedHadith): number[] {
  const nums = new Set<number>()
  for (const m of r.connection_en.matchAll(/Hadith[s]?\s+(\d+)(?:\s+and\s+(\d+))?/gi)) {
    if (m[1]) nums.add(Number(m[1]))
    if (m[2]) nums.add(Number(m[2]))
  }
  return [...nums]
}
