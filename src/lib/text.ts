/** Fold accents and lowercase so search is diacritic-insensitive (útil ⇒ util). */
export function foldText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Highlightable match: does `haystack` contain the folded `needle`? */
export function matchesQuery(haystack: string, foldedQuery: string): boolean {
  if (!foldedQuery) return true
  return foldText(haystack).includes(foldedQuery)
}
