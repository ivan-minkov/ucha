import { useEffect, useRef, useState } from 'react'
import { createAttempt } from './quizSelection'

export default function LessonQuiz({ lesson, onExit, exitLabel = '← Обратно към урока' }) {
  const pool = lesson.quiz ?? []
  const storageKey = 'uroci:last-quiz:' + lesson.id
  const [questions, setQuestions] = useState(() => {
    let previous = []
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(saved)) previous = saved.filter(id => typeof id === 'string')
    } catch { /* Storage is optional. */ }
    return createAttempt(pool, previous, lesson.questionCount ?? 6)
  })
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(questions.map(q => q.id))) } catch { /* Storage is optional. */ }
  }, [questions, storageKey])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const resultRef = useRef(null)
  const complete = questions.length > 0 && questions.every(q => Number.isInteger(answers[q.id]))
  const score = questions.filter(q => answers[q.id] === q.correctIndex).length

  function finish(event) {
    event.preventDefault()
    if (!complete || submitted) return
    setSubmitted(true)
    requestAnimationFrame(() => resultRef.current?.focus())
  }

  return <section className="quiz-area" aria-label="Тест към урока">
    <button className="quiz-secondary" onClick={onExit}>{exitLabel}</button>
      {!questions.length ? <div className="empty-state"><h3>Тестът предстои</h3><p>Въпросите ще бъдат добавени заедно с обобщението на този урок.</p></div> : <form onSubmit={finish}>
        <p className="catalog-note">{questions.length} въпроса · Избери един отговор на всеки въпрос.</p>
        {submitted && <div className="quiz-result" ref={resultRef} tabIndex={-1} role="status"><h3>{score} от {questions.length} верни отговора</h3><p>{score === questions.length ? 'Отлично! Запомнил си основното.' : 'Прегледай поправките по-долу и опитай отново.'}</p></div>}
        {questions.map((q, number) => <fieldset className="quiz-question" key={q.id} disabled={submitted}>
          <legend>{number + 1}. {q.question}</legend>
          {q.options.map((option, index) => <label className={`quiz-option ${submitted && index === q.correctIndex ? 'correct' : ''} ${submitted && answers[q.id] === index && index !== q.correctIndex ? 'incorrect' : ''}`} key={index}><input type="radio" name={q.id} value={index} required checked={answers[q.id] === index} onChange={() => setAnswers(previous => ({ ...previous, [q.id]: index }))}/><span>{option}{submitted && index === q.correctIndex && <strong> — Верен отговор</strong>}{submitted && answers[q.id] === index && index !== q.correctIndex && <strong> — Твоят отговор</strong>}</span></label>)}
          {submitted && <p className="quiz-explanation">{q.explanation}</p>}
        </fieldset>)}
        {submitted ? <button type="button" className="quiz-primary" onClick={() => { setQuestions(createAttempt(pool, questions.map(q => q.id), lesson.questionCount ?? 6)); setAnswers({}); setSubmitted(false); requestAnimationFrame(() => document.querySelector('.quiz-question input')?.focus()) }}>Опитай отново</button> : <><p className="catalog-note" aria-live="polite">Отговорени: {Object.keys(answers).length} от {questions.length}</p><button className="quiz-primary" type="submit" disabled={!complete}>Провери отговорите</button></>}
      </form>}
  </section>
}
