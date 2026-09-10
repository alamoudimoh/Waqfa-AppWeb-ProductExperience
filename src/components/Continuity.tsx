import { useState } from 'react'
import { week } from '../content'
import { Chapter, Arrow } from './Primitives'

export function Continuation() {
  const [device, setDevice] = useState<'phone' | 'computer'>('phone')
  return <section className="continuation phase" data-phase="noon" data-theme="light" aria-labelledby="continuation-title">
    <div className="shell continuation-layout">
      <div><Chapter number="٠٣">وسط الانشغال</Chapter><h2 id="continuation-title">عُد من حيث توقّفت.</h2><p>على هاتفك أو حاسوبك، تابع وردك من آخر حالة مؤكدة.<br />تتبدّل تفاصيل اليوم، وتبقى خطتك قريبة.</p></div>
      <div className="resume-scene">
        <div className="device-switch" role="group" aria-label="جهاز المتابعة في المثال"><button aria-pressed={device === 'phone'} onClick={() => setDevice('phone')}>الهاتف</button><span aria-hidden="true">—</span><button aria-pressed={device === 'computer'} onClick={() => setDevice('computer')}>الحاسوب</button></div>
        <div className="resume-state" aria-live="polite" aria-atomic="true"><span className="resume-symbol" aria-hidden="true">↶</span><div><strong>وردك اليومي</strong><p>{device === 'phone' ? 'آخر موضع محفوظ على الهاتف' : 'الموضع نفسه، على الحاسوب'}</p></div><Arrow /></div>
        <p className="scene-note">مثال توضيحي للمتابعة بين الأجهزة</p>
      </div>
    </div>
  </section>
}

export function Continuity() {
  return <section className="continuity phase" data-phase="afternoon" data-theme="light" aria-labelledby="continuity-title">
    <div className="shell">
      <Chapter number="٠٤">حين يميل النهار</Chapter>
      <div className="continuity-heading"><h2 id="continuity-title">العبرة بما تُكمل.<br /><span>وبأن تعود.</span></h2><p>الاستمرارية ليست سباقًا في الأعداد.<br />ترى ما أكملته، وتعرف ما بقي، وتجد مجالًا لبداية جديدة.</p></div>
      <figure className="week"><figcaption><span>إيقاعٌ يتّصل، يومًا بعد يوم</span><span className="scene-note">مثال توضيحي للاستمرارية</span></figcaption>
        <ol className="week-days">{week.map(item => <li key={item.day}><span>{item.day}</span><span className={item.completed ? 'day-status completed' : 'day-status'} aria-label={item.completed ? 'مكتمل' : 'لم يكتمل'}>{item.completed ? '✓' : '—'}</span></li>)}</ol>
        <div className="week-foot"><p>وإن فاتتك وقفة، فالعودة ممكنة.</p><span>✓ مكتمل <span aria-hidden="true"> · </span> — لم يكتمل</span></div>
      </figure>
      <div className="reflection"><span className="reflection-label">وقفة مع أسبوعك</span><p>تأمّل ما مضى في محاسبتك الأسبوعية،<br />وجدّد نيتك لما يأتي.</p><span className="reflection-question">ما الذي أريد أن أحافظ عليه؟</span></div>
    </div>
  </section>
}
