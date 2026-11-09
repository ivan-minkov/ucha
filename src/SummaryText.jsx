// Keep editorial emphasis on whole words, including Cyrillic text.
function findTerm(text, term, cursor) {
  const word = /[\p{L}\p{N}_]/u
  let index = text.indexOf(term, cursor)
  while (index >= 0) {
    const before = text[index - 1] ?? ''
    const after = text[index + term.length] ?? ''
    if (!(word.test(term[0]) && word.test(before)) &&
        !(word.test(term.at(-1)) && word.test(after))) return index
    index = text.indexOf(term, index + 1)
  }
  return -1
}

export default function SummaryText({ text, highlights = [] }) {
  if (!highlights.length) return text
  const parts = []
  let cursor = 0
  while (cursor < text.length) {
    const match = highlights.filter(Boolean).map(term => ({ term, index: findTerm(text, term, cursor) }))
      .filter(item => item.index >= 0)
      .sort((a, b) => a.index - b.index || b.term.length - a.term.length)[0]
    if (!match) { parts.push(text.slice(cursor)); break }
    parts.push(text.slice(cursor, match.index))
    parts.push(<strong key={match.index}>{match.term}</strong>)
    cursor = match.index + match.term.length
  }
  return parts
}
