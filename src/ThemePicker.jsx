import { useState } from 'react'

const themes = [
  { id: 'green', name: 'Зелена', color: '#295c45' },
  { id: 'blue', name: 'Синя', color: '#265e9d' },
  { id: 'pink', name: 'Розова', color: '#a32e68' },
  { id: 'purple', name: 'Лилава', color: '#7043a4' },
  { id: 'white', name: 'Бяла', color: '#ffffff' },
  { id: 'black', name: 'Черна', color: '#171c22' },
]
const storageKey = 'uroci:theme'
function readTheme() {
  try {
    const saved = localStorage.getItem(storageKey)
    if (themes.some(theme => theme.id === saved)) return saved
  } catch { /* The picker also works when storage is unavailable. */ }
  return 'green'
}
// Apply before React renders to avoid a flash of the default palette.
document.documentElement.dataset.theme = readTheme()

export default function ThemePicker() {
  const [selected, setSelected] = useState(readTheme)
  function selectTheme(id) {
    document.documentElement.dataset.theme = id
    setSelected(id)
    try { localStorage.setItem(storageKey, id) } catch { /* Keep the selection for this visit. */ }
  }
  return <div className="theme-picker" role="group" aria-label="Цветна тема">
    {themes.map(theme => <button key={theme.id} type="button" className="theme-swatch"
      aria-label={theme.name + ' тема'} title={theme.name + ' тема'} aria-pressed={selected === theme.id}
      style={{ '--swatch': theme.color, '--swatch-ink': theme.id === 'white' ? '#000' : '#fff', '--swatch-border': theme.id === 'white' ? '#999' : '#ffffff55' }} onClick={() => selectTheme(theme.id)}>
      <span aria-hidden="true">{selected === theme.id ? '✓' : ''}</span>
    </button>)}
  </div>
}
