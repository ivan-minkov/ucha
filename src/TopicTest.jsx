import { useEffect, useRef, useState } from 'react'
import LessonQuiz from './LessonQuiz'

export default function TopicTest({ subject, onExit }) {
  const [selected, setSelected] = useState([])
  const [size, setSize] = useState(6)
  const [test, setTest] = useState(null)
  const heading = useRef(null)
  const eligible = subject.lessons.filter(l => l.quiz?.length)
  const chosen = eligible.filter(l => selected.includes(l.id))
  const total = chosen.reduce((sum,l) => sum + l.quiz.length, 0)
  const count = Math.min(total, Math.max(size, chosen.length))
  useEffect(() => { heading.current?.focus() }, [test])
  function toggle(ids) {
    setSelected(previous => ids.every(id => previous.includes(id)) ? previous.filter(id => !ids.includes(id)) : [...new Set([...previous, ...ids])])
  }
  function start(event) {
    event.preventDefault()
    if (!chosen.length) return
    setTest({ id: 'mixed:' + subject.id + ':' + chosen.map(l => l.id).sort().join(',') + ':' + count, title: 'Тест по избрани теми', questionCount: count,
      quiz: chosen.flatMap(l => l.quiz.map(q => ({...q, id:l.id + ':' + q.id, sourceLessonId:l.id}))) })
  }
  return <section>
    <h2 tabIndex={-1} ref={heading}>{test ? `Тест по ${chosen.length} избрани теми` : 'Избери темите за теста'}</h2>
    {test ? <LessonQuiz key={test.id} lesson={test} onExit={() => setTest(null)} exitLabel="← Промени избраните теми"/> : <>
      <button className="back lesson-back" onClick={onExit}>← Всички уроци по география</button>
      <p className="catalog-note">Избери отделни теми или всички готови теми от раздел. В теста ще има въпроси от всяка избрана тема. Темите без въпроси ще станат достъпни, когато ги подготвим.</p>
      <form onSubmit={start}>
        {[...new Set(subject.lessons.map(l => l.section))].map(section => {
          const lessons = subject.lessons.filter(l => l.section === section)
          const available = lessons.filter(l => l.quiz?.length).map(l => l.id)
          const picked = available.filter(id => selected.includes(id)).length
          return <fieldset className="topic-group" key={section}><legend>{section}</legend>
            <label className="topic-select-all"><input type="checkbox" disabled={!available.length} checked={!!available.length && picked === available.length} ref={node => { if(node) node.indeterminate = picked > 0 && picked < available.length }} onChange={() => toggle(available)}/> Всички готови теми ({available.length} от {lessons.length})</label>
            {lessons.map(l => <label className={`topic-option ${!l.quiz?.length ? 'unavailable' : ''}`} key={l.id}><input type="checkbox" checked={selected.includes(l.id)} disabled={!l.quiz?.length} onChange={() => toggle([l.id])}/><span>{l.title}<small>{l.quiz?.length ? `${l.quiz.length} въпроса` : 'Въпросите предстоят'}</small></span></label>)}
          </fieldset>
        })}
        <div className="topic-actions"><label>Брой въпроси <select value={size} onChange={event => setSize(Number(event.target.value))}>{[6,10,15].map(n => <option key={n} value={n}>{n}</option>)}</select></label><p aria-live="polite">Избрани теми: {chosen.length} · Въпроси в теста: {count}</p><small>При много теми броят се увеличава, за да участва всяка. При недостатъчно въпроси използваме всички налични.</small><button className="quiz-primary" type="submit" disabled={!chosen.length}>Започни теста</button></div>
      </form>
    </>}
  </section>
}
