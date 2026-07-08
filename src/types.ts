export type Lang = 'pt' | 'en'

export interface Meta {
  colecao: string
  colecao_en: string
  autor: string
  total_hadiths: number
  nota: string
  idiomas: string[]
  versao: string
}

/** A hadith from the An-Nawawi collection (numbered 1–42). */
export interface Hadith {
  number: number
  title_pt: string
  title_en: string
  arabic: string
  transliteration: string
  translation_pt: string
  translation_en: string
  narrator: string
  grade: string
  sources: string[]
  chain_note_pt: string
  chain_note_en: string
  teachings_pt: string[]
  teachings_en: string[]
  themes_pt: string[]
  themes_en: string[]
}

/** A complementary hadith (outside the 42) tied thematically to one of them. */
export interface RelatedHadith {
  id: string
  title_pt: string
  title_en: string
  arabic: string
  transliteration: string
  translation_pt: string
  translation_en: string
  narrator: string
  grade: string
  sources: string[]
  connection_pt: string
  connection_en: string
  themes_pt: string[]
  themes_en: string[]
}

export interface HadithData {
  meta: Meta
  hadiths: Hadith[]
  related_hadiths: RelatedHadith[]
}

/** A theme/tag normalised across languages so filters survive PT⇄EN switches. */
export interface ThemeEntry {
  id: string
  pt: string
  en: string
  count: number
  hadiths: number[]
}

/** Flattened, language-resolved view of a hadith for rendering. */
export interface LocalizedHadith {
  number: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  narrator: string
  grade: string
  sources: string[]
  chainNote: string
  teachings: string[]
  themes: string[]
}

export interface LocalizedRelated {
  id: string
  title: string
  arabic: string
  transliteration: string
  translation: string
  narrator: string
  grade: string
  sources: string[]
  connection: string
  themes: string[]
}
