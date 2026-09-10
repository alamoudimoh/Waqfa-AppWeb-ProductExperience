import { useId, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { dayPhases } from './day-phases'

function resolveAppUrl() {
  try {
    const url = new URL(import.meta.env.VITE_WAQFA_APP_URL || 'https://my.waqfa.app')
    return url.protocol === 'https:' ? url.href : 'https://my.waqfa.app'
  } catch { return 'https://my.waqfa.app' }
}
const appUrl = resolveAppUrl()

function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" className={down ? 'arrow-down' : ''}><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? 'brand-footer' : ''}`} href="#top" aria-label="وقفة، العودة إلى بداية الصفحة"><span className="pause-mark" aria-hidden="true"><i /><i /></span><span>وقفة</span></a>
}
function Emblem({ kind }: { kind: 'privacy' | 'focus' | 'continuity' }) {
  return <svg aria-hidden="true" className="emblem" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">{kind === 'privacy' ? <><rect x="9" y="16" width="18" height="15" rx="5" /><path d="M12 16v-5a6 6 0 0 1 12 0v5M18 22v4" /></> : kind === 'focus' ? <><path d="M5 14V8a3 3 0 0 1 3-3h6m8 0h6a3 3 0 0 1 3 3v6m0 8v6a3 3 0 0 1-3 3h-6m-8 0H8a3 3 0 0 1-3-3v-6" /><path d="M15 13v10m6-10v10" /></> : <><path d="M27 12A11 11 0 1 0 29 23M27 5v8h-8" /><path d="m13 18 4 4 7-8" /></>}</svg>
}

export default function App() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const phase = dayPhases[phaseIndex]
  const tabsId = useId()
  const themeStyle = { '--phase-color': phase.color, '--phase-pale': phase.pale, '--phase-glow': phase.glow } as CSSProperties
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | undefined
    if (event.key === 'ArrowLeft') next = (index + 1) % dayPhases.length
    if (event.key === 'ArrowRight') next = (index - 1 + dayPhases.length) % dayPhases.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = dayPhases.length - 1
    if (next !== undefined) {
      event.preventDefault()
      setPhaseIndex(next)
      document.getElementById(`${tabsId}-tab-${next}`)?.focus()
    }
  }
  return <div style={themeStyle}>
    <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
    <main id="main">
    <div className="opening" id="top">
      <header className="header page-width">
        <Brand />
        <nav className={`navigation ${menuOpen ? 'is-open' : ''}`} aria-label="التنقل الرئيسي">
          <a href="#journey" onClick={() => setMenuOpen(false)}>وقفة في يومك</a>
          <a href="#promise" onClick={() => setMenuOpen(false)}>ما نؤمن به</a>
          <a href="#dedication" onClick={() => setMenuOpen(false)}>أصل الحكاية</a>
        </nav>
        <div className="header-actions"><a href={appUrl} className="button button-outline">ابدأ وقفتك <Arrow /></a><button className="menu-toggle" aria-expanded={menuOpen} id="menu-toggle" aria-controls="mobile-navigation" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
      </header>
      <nav hidden={!menuOpen} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus() } }} className="mobile-navigation" id="mobile-navigation" aria-label="قائمة الجوال"><a href="#journey" onClick={() => setMenuOpen(false)}>وقفة في يومك</a><a href="#promise" onClick={() => setMenuOpen(false)}>ما نؤمن به</a><a href="#dedication" onClick={() => setMenuOpen(false)}>أصل الحكاية</a></nav>
      <div className="hero-region">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="tiny-line" /> رفيق يومك، من الفجر إلى الليل</p>
            <h1 id="hero-title">لك في زحمة اليوم،<br /><span>وقفة.</span></h1>
            <p className="hero-description">مساحة تعود فيها إلى الذكر، وإلى نفسك.<br />رفيق عربي لوردك اليومي، يعينك على الاستمرار<br className="desktop-break" /> بهدوء… وقفةً بعد وقفة.</p>
            <div className="hero-actions"><a className="button button-primary" href={appUrl}>ابدأ وقفتك <Arrow /></a><a className="text-link" href="#journey">اكتشف يومك مع وقفة <Arrow down /></a></div>
            <p className="hero-footnote">بلا إعلانات. بلا ضجيج. بنيّة خالصة.</p>
          </div>
          <div className="day-orbit" aria-label="استكشف أوقات اليوم">
            <div className="orbit-rings" aria-hidden="true"><div /><div /><div /><span className="orbit-axis" /></div>
            <div className="orbit-core" aria-live="polite" aria-atomic="true"><span className="orbit-kicker">ولكل وقتٍ وقفته</span><span className="orbit-name">{phase.name}</span><span className="orbit-note">{phase.cue}</span></div>
            {dayPhases.map((item, index) => <button type="button" key={item.id} className={`orbit-stop stop-${index} ${phaseIndex === index ? 'is-active' : ''}`} onClick={() => setPhaseIndex(index)} aria-pressed={phaseIndex === index} aria-label={`استكشف وقت ${item.name}`}><span className="orbit-dot" /><span>{item.name}</span></button>)}
            <p className="orbit-caption">اختر وقتًا، وتأمّل وقفته</p>
          </div>
        </section>
        <div className="opening-bottom page-width"><span>مساحة للذكر، لا للمشتتات</span><a href="#journey" aria-label="تابع رحلة اليوم"><Arrow down /></a><span>من أول الضوء، إلى آخر اليوم</span></div>
      </div>
    </div>

    <section className="introduction page-width" aria-labelledby="intro-title"><p className="eyebrow">هذه هي وقفة</p><h2 id="intro-title">ليس كل ما يملأ يومك،<br /><span>يترك أثرًا في قلبك.</span></h2><div className="intro-description"><span className="small-pause" aria-hidden="true">‖</span><p>وقفة رفيق يومي للذكر والورد.<br />يجمع خطتك الروحية في مساحة عربية هادئة، ويساعدك على الإكمال في وقته، وبناء استمرارية تشبهك.</p><p>تأتي إليه لتكون أكثر حضورًا.<br />ثم تمضي إلى يومك، ومعك شيء من السكينة.</p></div></section>

    <section className="journey" id="journey" aria-labelledby="journey-title">
      <div className="page-width">
        <div className="section-heading"><div><p className="eyebrow">يومٌ كامل، بخيط من السكينة</p><h2 id="journey-title">يتغيّر الضوء.<br /><span>وتبقى وقفتك.</span></h2></div><p>من أول لحظة في الصباح إلى هدوء الليل،<br />رفيق يعينك على العودة، في كل وقت.</p></div>
        <div className="day-tabs" role="tablist" aria-label="رحلة اليوم">{dayPhases.map((item, index) => <button id={`${tabsId}-tab-${index}`} role="tab" type="button" aria-selected={index === phaseIndex} aria-controls={`${tabsId}-panel`} tabIndex={index === phaseIndex ? 0 : -1} className={index === phaseIndex ? 'active' : ''} key={item.id} onClick={() => setPhaseIndex(index)} onKeyDown={event => onTabKey(event, index)}><span className={`phase-swatch swatch-${item.id}`} /><span>{item.name}</span><span className="tab-number">{item.number}</span></button>)}</div>
        <div className="journey-panel" id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-tab-${phaseIndex}`} tabIndex={0}>
          <div className="journey-story" key={phase.id}><span className="chapter-number">{phase.number}<span> / ٠٦</span></span><p className="eyebrow">{phase.name} · {phase.cue}</p><h3>{phase.title}</h3><p>{phase.description}</p><span className="story-note">{phase.note}</span></div>
          <div className="day-preview"><div className="preview-top"><span className="preview-brand">وقفة</span><span>{phase.name}</span></div><div className="preview-body"><span className="preview-label">وقتك، على مهل</span><h4>{phase.focus}</h4><div className="preview-list">{phase.items.map((item, index) => <div key={item} className="preview-item"><span className={`item-status ${index === 0 ? 'completed' : ''}`} aria-hidden="true">{index === 0 ? '✓' : ''}</span><span>{item}</span><span className="item-detail">{index === 0 ? 'مكتمل' : index === 1 ? 'خطوتك التالية' : 'على مهل'}</span></div>)}</div><div className="preview-footer"><span className="preview-progress" aria-hidden="true"><i /></span><span>خطوة صغيرة، وأثر يبقى.</span></div></div><span className="preview-caption">لمحة توضيحية من التجربة</span></div>
        </div>
      </div>
    </section>

    <section className="continuity page-width" aria-labelledby="continuity-title"><div className="continuity-copy"><p className="eyebrow">خطوة صغيرة تستحق أن تبقى</p><h2 id="continuity-title">المهم أن تعود.<br /><span>لا أن تسبق.</span></h2><p>لا نختزل قربك في عدد، ولا نجعل وردك منافسة.<br />وقفة تحتفي بالإكمال والاستمرارية، وتترك لك مساحتك لتبدأ من جديد كلما احتجت.</p><a href={appUrl} className="text-link">ابدأ بما تستطيع <Arrow /></a></div><div className="rhythm" aria-label="تصوّر توضيحي للاستمرارية دون مقارنة"><div className="rhythm-heading"><span>شيءٌ قليل، يتّصل.</span><span>على وتيرتك</span></div><div className="rhythm-days" aria-hidden="true">{['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map((day,i)=><div className={`rhythm-day rhythm-day-${i}`} key={day}><span className="rhythm-bar"><i /></span><span>{day}</span></div>)}</div><p>وإن فاتتك وقفة، يبقى باب العودة مفتوحًا.</p></div></section>

    <section className="promise" id="promise" aria-labelledby="promise-title"><div className="page-width"><div className="section-heading"><div><p className="eyebrow">صُمّمت لتطمئن</p><h2 id="promise-title">ما تحتاجه من حضور.<br /><span>وما تستحقه من خصوصية.</span></h2></div><p>قرارات صغيرة في التصميم،<br />تحفظ لهذه المساحة معناها.</p></div><div className="principles"><article><Emblem kind="privacy" /><h3>خصوصيتك من البداية</h3><p>لا يظهر اسمك الحقيقي أو بريدك في المساحات العامة. والمحاسبة الشخصية لها وصول مقيّد وضوابط تحمي خصوصيتها.</p></article><article><Emblem kind="focus" /><h3>لا شيء يقطع وقفتك</h3><p>بلا إعلانات، أو أنماط مضللة، أو مقاطعات غير ضرورية أثناء الذكر. هذه المساحة لوردك، ووقتك لك.</p></article><article><Emblem kind="continuity" /><h3>معنى يسبق الأرقام</h3><p>الإكمال في وقته والاستمرار هما الأساس. لا مطاردة للنقرات، ولا تصميم يدفعك للبقاء أكثر مما تحتاج.</p></article></div><div className="content-trust"><span className="trust-line" /><p>وللكلمة أمانتها. المحتوى الشرعي يخضع للمراجعة والاعتماد قبل النشر.</p></div></div></section>

    <section className="dedication" id="dedication" aria-labelledby="dedication-title"><div className="dedication-light" aria-hidden="true" /><div className="dedication-content"><span className="pause-mark large" aria-hidden="true"><i /><i /></span><p className="eyebrow">من القلب، إلى كل من يحتاج وقفة</p><h2 id="dedication-title">بدأت بوقفة.<br />وأردنا لأثرها أن يمتد.</h2><div className="letter"><p>وُلدت وقفة من تجربة شخصية، في مرحلة أثقلتها الضغوط.<br className="desktop-break" /> كان الذكر فيها طريقًا للثبات، وكانت العودة إليه، مرة بعد مرة، وقفة صادقة مع الله.</p><p>من هنا جاء الاسم. ثم وجدنا فيه معنى العطاء أيضًا؛<br className="desktop-break" /> أن تبقى هذه المساحة وقفًا لله، ينفع بها من يحتاجها.</p><p>نهدي هذا العمل إلى كل من أثقله يومه،<br />وإلى كل قلب يحاول أن يعود.<br /><span>نسأل الله أن يجعل فيه نفعًا وأثرًا طيبًا.</span></p></div><span className="dedication-signature">القائمون على وقفة</span><div className="closing-cta"><span>لك في هذا اليوم، وقفة.</span><a href={appUrl} className="button button-light">ابدأ وقفتك <Arrow /></a><p>من الفجر إلى الليل، معك.</p></div></div><footer className="footer page-width"><Brand footer /><p>رفيق عربي. بنيّة خالصة.</p><a href="#top" className="back-to-top">إلى البداية <span aria-hidden="true">↑</span></a></footer></section>
    </main>
  </div>
}
