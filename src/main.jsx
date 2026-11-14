import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { grades, subjects } from './data'
import './styles.css'
import LessonQuiz from './LessonQuiz'
import TopicTest from './TopicTest'
import ThemePicker from './ThemePicker'
import SummaryText from './SummaryText'

function Icon({ type = 'book', ...props }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {type === 'arrow' ? <path d="M5 12h14m-6-6 6 6-6 6" /> : type === 'globe' ? <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></> : type === 'leaf' ? <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></> : <><path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v15"/></>}
  </svg>
}

function GlobeArt() {
  return <div className="illustration" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="spark spark-one">✦</span><span className="spark spark-two">+</span><div className="globe"><svg viewBox="0 0 240 240"><defs><clipPath id="earth"><circle cx="120" cy="120" r="104"/></clipPath></defs><circle cx="120" cy="120" r="104" fill="#dbe7d5"/><g clipPath="url(#earth)"><g fill="none" stroke="#abc6ab" strokeWidth="1"><ellipse cx="120" cy="120" rx="48" ry="104"/><ellipse cx="120" cy="120" rx="85" ry="104"/><path d="M16 120h208M24 80h192M24 160h192M50 40h140M50 200h140"/></g><g fill="#54836b"><path d="m87 17 25 12-9 17 15 13-8 21-17-2-6 19-21 7-7 20-16-3-5-26-20-12 12-31Z"/><path d="m89 115 25 4 17 23-10 22-10 5-5 27-16 22-6-31-12-17-6-27Z"/><path d="m153 32 40 9 30 38-17 10-21-7-10 15-28-9-5-18-19-8Z"/><path d="m150 105 27 2 12 25-19 38-15-4-16-32Z"/><path d="m199 168 24 3 7 24-35 4-8-12Z"/></g></g><circle cx="120" cy="120" r="104" fill="none" stroke="#335e49" strokeWidth="2"/></svg></div><div className="art-label"><span className="dot"/> Светът е пълен с открития</div></div>
}

function App() {
  const [grade, setGrade] = useState(() => grades.find(item => item.id === new URLSearchParams(window.location.search).get('grade')) ?? null)
  const [subject, setSubject] = useState(() => subjects.find(item => item.id === new URLSearchParams(window.location.search).get('subject') && item.gradeId === new URLSearchParams(window.location.search).get('grade')) ?? null)
  const [lesson, setLesson] = useState(() => subject?.lessons.find(item => item.id === new URLSearchParams(window.location.search).get('lesson')) ?? null)
  const [topicTestOpen, setTopicTestOpen] = useState(() => Boolean(subject) && new URLSearchParams(window.location.search).get('view') === 'topics')
  const [quizOpen, setQuizOpen] = useState(() => Boolean(lesson) && new URLSearchParams(window.location.search).get('view') === 'test')
  useEffect(() => {
    const url = new URL(window.location.href)
    for (const [key, value] of Object.entries({ grade: grade?.id, subject: subject?.id, lesson: lesson?.id, view: topicTestOpen ? 'topics' : quizOpen && lesson ? 'test' : null })) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    window.history.replaceState(null, '', url)
  }, [grade, subject, lesson, quizOpen, topicTestOpen])
  const step = subject ? 2 : grade ? 1 : 0
  const heading = useRef(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    heading.current?.focus()
  }, [step, lesson, quizOpen, topicTestOpen])
  function goTo(index) {
    setTopicTestOpen(false)
    setQuizOpen(false)
    setLesson(null)
    if (index === 0) { setGrade(null); setSubject(null) }
    if (index === 1) setSubject(null)
  }
  const title = topicTestOpen ? 'Тест по избрани теми' : (quizOpen && lesson ? `Тест: ${lesson.title}` : lesson?.title) ?? ['В кой клас си?', 'Какво ще учим днес?', subject?.name ?? 'Уроци'][step]
  return <div className="app">
    <header className="header"><button className="brand" onClick={() => goTo(0)} aria-label="Уроци — начало"><span className="brand-icon"><Icon/></span>уроци<span className="brand-period">.</span></button><ThemePicker/></header>
    <main>
      <nav className="steps" aria-label="Стъпки">
        {['Клас', 'Предмет', 'Уроци'].map((label, i) => <React.Fragment key={label}>{i > 0 && <span className="step-line"/>}<button disabled={i > step} onClick={() => goTo(i)} aria-current={step === i ? 'step' : undefined} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}><span>{i < step ? '✓' : `0${i + 1}`}</span>{label}</button></React.Fragment>)}
      </nav>
      <section className={`content ${step === 2 ? 'lessons-layout' : ''}`}>
        <div className="main-content">
          <p className="eyebrow">{step === 0 ? 'ТВОЕТО МЯСТО ЗА УЧЕНЕ' : step === 1 ? `${grade.name} · СЛЕДВАЩАТА СТЪПКА` : `${grade.name} · ТВОИТЕ УРОЦИ`}</p>
          <h1 ref={heading} tabIndex={-1}>{title}</h1>
          <p className="intro">{topicTestOpen ? 'Провери знанията си по избраните теми.' : step === 0 ? 'Големите знания започват с малка стъпка. Избери своя клас и да започваме.' : step === 1 ? 'Избери предмет и открий най-важното от уроците на едно място.' : lesson ? `${lesson.section} · Страница ${lesson.page} в учебника` : 'Всички теми от учебника, подредени по раздели. Избери урок, за да отвориш неговото обобщение.'}</p>
          {step === 0 && <div className="choices">{grades.map(item => <button className="choice" key={item.id} onClick={() => setGrade(item)}><span className="grade-number">7<span>КЛАС</span></span><span className="choice-text"><strong>Седми клас</strong><span>Нова година, нови открития</span></span><span className="choice-arrow"><Icon type="arrow"/></span></button>)}<p className="availability">Започваме със 7. клас. Останалите предстоят.</p></div>}
          {step === 1 && <div className="choices">{subjects.filter(item => item.gradeId === grade.id).map(item => <button className="choice" key={item.id} onClick={() => setSubject(item)}><span className="subject-icon"><Icon type={item.icon ?? 'book'} width="38" height="38"/></span><span className="choice-text"><strong>{item.name}</strong><span>{item.description}</span></span><span className="choice-arrow"><Icon type="arrow"/></span></button>)}<p className="availability">Избери предмет от {grade.name}.</p></div>}
          {step === 2 && !quizOpen && !topicTestOpen && lesson && subject.textbook && <div className="lesson-top-actions"><button className="back lesson-back" onClick={() => setLesson(null)}>← Всички уроци по {subject.name.toLowerCase()}</button><a className="textbook-link" href={`${import.meta.env.BASE_URL}${subject.textbook}?lesson=${encodeURIComponent(lesson.id)}#page-${lesson.page + (subject.pageOffset ?? 0)}`}><Icon/> Отвори учебника <span aria-hidden="true">→</span></a></div>}
          {step === 2 && <div className="lesson-area">
            {topicTestOpen ? <TopicTest subject={subject} onExit={() => setTopicTestOpen(false)}/> : lesson ? quizOpen ? <LessonQuiz key={lesson.id} lesson={lesson} onExit={() => setQuizOpen(false)}/> : <>
              {!subject.textbook && <button className="back lesson-back" onClick={() => setLesson(null)}>← Всички уроци по {subject.name.toLowerCase()}</button>}
              {lesson.summary ? <article className="lesson-summary"><h2>Най-важното накратко</h2>{lesson.summarySections ? lesson.summarySections.map(section => <section className="summary-section" key={section.title}><h3>{section.title}</h3><p><SummaryText text={section.text} highlights={section.highlights}/></p></section>) : <p>{lesson.summary}</p>}{lesson.image && <figure className="summary-figure"><img src={`${import.meta.env.BASE_URL}${lesson.image.src}`} alt={lesson.image.alt} loading="lazy"/>{lesson.image.caption && <figcaption>{lesson.image.caption}</figcaption>}</figure>}</article> : <div className="empty-state"><span className="empty-icon"><Icon width="34" height="34"/></span><h2>Обобщението предстои</h2><p>Все още няма добавена обобщена информация за този урок.</p><span className="soon"><span className="dot"/> Очаквай скоро</span></div>}
              <div className="quiz-area quiz-invitation"><div><h2>Прочете ли урока?</h2><p>Провери какво запомни с кратък тест.</p></div><button className="quiz-primary" onClick={() => setQuizOpen(true)}>Направи тест</button></div>
            </> : <>
              <div className="section-heading"><h2>Всички уроци</h2><span>{subject.lessons.length} теми</span></div>
              <p className="catalog-note">Включени са уроците, упражненията, проектите и преговорите. Готови обобщения: {subject.lessons.filter(item => item.summary).length} от {subject.lessons.length}.</p>
              {[...new Set(subject.lessons.map(item => item.section))].map(section => <section className="lesson-group" key={section} aria-label={section}>
                <h3>{section}</h3>
                <ol className="lesson-catalog">{subject.lessons.filter(item => item.section === section).map(item => <li key={item.id}><button className="lesson-row" onClick={() => setLesson(item)}><span className="lesson-row-text"><strong>{item.title}</strong><span>Стр. {item.page} · {item.summary ? 'Обобщението е готово' : 'Обобщението предстои'}</span></span><Icon type="arrow"/></button></li>)}</ol>
              </section>)}
              <div className="catalog-tools">
                <div className="mixed-test-entry"><div><strong>Тест по избрани теми</strong><p>Избери раздел или няколко урока за общ тест.</p></div><button className="quiz-primary" onClick={() => setTopicTestOpen(true)}>Започни тест</button></div>
                {subject.textbook && <a className="textbook-link" href={`${import.meta.env.BASE_URL}${subject.textbook}`}><Icon/> Отвори учебника <span aria-hidden="true">→</span></a>}
              </div>
            </>}
          </div>}
          {step > 0 && !lesson && !topicTestOpen && <button className="back" onClick={() => goTo(step - 1)}><span aria-hidden="true">←</span> {step === 1 ? 'Обратно към класовете' : 'Обратно към предметите'}</button>}
        </div>
        {step < 2 && <aside className="visual-panel"><GlobeArt/><p>Любопитството е<br/>най-доброто начало.</p><span>Един урок по-близо до „Разбрах!“</span></aside>}
      </section>
    </main>
    <footer><span>Създадено за любопитни умове.</span><span>Учи с разбиране <span className="footer-star">✦</span></span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
