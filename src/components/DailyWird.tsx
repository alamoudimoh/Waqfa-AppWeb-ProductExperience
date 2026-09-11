import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { sessions } from '../content'
import { Arrow } from './Primitives'

export function DailyWird() {
  const [selected, setSelected] = useState(0)
  const id = useId()
  const session = sessions[selected]
  function selectWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = (index + 1) % sessions.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = (index + sessions.length - 1) % sessions.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = sessions.length - 1
    else return
    event.preventDefault()
    setSelected(next)
    document.getElementById(id + '-tab-' + next)?.focus()
  }
  return <div className="wird-scene">
    <div className="wird-plan">
      <p className="scene-label">لمحة توضيحية · خطتك اليومية</p>
      <h3>ما تعود إليه اليوم</h3>
      <div role="tablist" aria-label="استكشف جلسات الورد" aria-orientation="vertical" className="session-list">
        {sessions.map((item, index) => <button key={item.id} role="tab" id={id + '-tab-' + index} aria-controls={id + '-panel'} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => selectWithKeyboard(event, index)}><span className="session-index" aria-hidden="true">{['٠١', '٠٢', '٠٣'][index]}</span><span>{item.title}<small>{item.cue}</small></span><Arrow /></button>)}
      </div>
      <p className="scene-note">اختر وقفة لتتعرّف إليها.</p>
    </div>
    <div className="session-detail" role="tabpanel" tabIndex={0} id={id + '-panel'} aria-labelledby={id + '-tab-' + selected}>
      <p className="scene-label">مساحة للذكر</p>
      <h3>{session.title}</h3>
      <p>{session.description}</p>
      <span className="session-closing">{session.note}</span>
      <p className="scene-note">تقرأ. تُكمل. وتمضي إلى يومك.</p>
    </div>
  </div>
}
