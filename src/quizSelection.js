export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createAttempt(pool, previousIds = [], size = 6, random = Math.random) {
  const previous = new Set(previousIds)
  const fresh = shuffle(pool.filter(q => !previous.has(q.id)), random)
  const repeated = shuffle(pool.filter(q => previous.has(q.id)), random)
  const ordered = [...fresh, ...repeated]
  const groups = new Map()
  for (const q of ordered) {
    const key = q.sourceLessonId ?? 'single'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(q)
  }
  const selected = []
  const queues = shuffle([...groups.values()], random)
  while (selected.length < Math.min(size, pool.length)) {
    for (const queue of queues) {
      if (queue.length && selected.length < size) selected.push(queue.shift())
    }
  }
  return shuffle(selected, random).map(q => {
    const options = shuffle(q.options.map((text, originalIndex) => ({ text, originalIndex })), random)
    return { ...q, options: options.map(o => o.text), correctIndex: options.findIndex(o => o.originalIndex === q.correctIndex) }
  })
}
