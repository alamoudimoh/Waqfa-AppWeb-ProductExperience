import { Brand } from './components/Brand'
import { Header } from './components/Header'
import { AppLink, Arrow, Chapter } from './components/Primitives'
import { DailyWird } from './components/DailyWird'
import { Continuation, Continuity } from './components/Continuity'
import { DayEnvironment } from './components/DayEnvironment'
import { ScrollChrome } from './components/ScrollChrome'
import { SharePanel } from './components/SharePanel'
import { getLocalDayPhase, localPhaseContext, themeForPhase } from './dayPhase'
import type { DayTheme } from './dayPhase'

function Opening({ theme, phase }: { theme: DayTheme; phase: ReturnType<typeof getLocalDayPhase> }) {
  const context = localPhaseContext[phase]
  return <div className="opening phase" data-phase="dawn" data-journey-phase={phase} data-theme={theme}>
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-topline"><Chapter number="٠١">رفيق الذِّكر والوِرد</Chapter><span data-local-context="hero">{context.hero}</span></div>
      <div className="hero-composition"><h1 id="hero-title"><span className="hero-line">يمضي اليوم.</span><span className="hero-response">وتبقى لك وقفة.</span></h1></div>
      <div className="hero-bottom"><div className="hero-invitation"><AppLink /><p>وقفة للذكر.<br />ثم عودةٌ إلى الحياة.</p></div><div className="hero-description"><p>وسط ما يشغلك، مساحة تعود فيها إلى ذكر الله.<br />وردٌ يومي، وخطوةٌ تتّصل بما بعدها.</p><a className="journey-link" href="#journey">تعرّف إلى وقفة<Arrow down /></a></div></div>
    </section>
  </div>
}

function Morning({ phase }: { phase: ReturnType<typeof getLocalDayPhase> }) {
  return <section className="morning phase" data-phase="morning" data-theme="light" id="journey" aria-labelledby="morning-title"><div className="shell">
    <div data-local-context="journey"><Chapter number="٠٢">{localPhaseContext[phase].chapter}</Chapter></div>
    <div className="morning-heading"><h2 id="morning-title">لِما تريد أن تحافظ عليه،<br /><span>مكانٌ في يومك.</span></h2><p>تجمع وقفة أذكارك ووردك في خطة يومية واضحة.<br />تفتح ما حان وقته، تقرأ على مهل، وتتابع حتى تُكمل.</p></div>
    <DailyWird />
  </div></section>
}

function Promise() {
  return <section id="promise" className="promise phase" data-phase="sunset" data-theme="dark" aria-labelledby="promise-title"><div className="shell">
    <Chapter number="٠٥">مع سكينة المساء</Chapter>
    <h2 id="promise-title">مساحةٌ لك.<br /><span>وأمانةٌ علينا.</span></h2>
    <div className="promise-body"><p className="promise-statement">تأتي للذكر.<br />ووقتك يبقى لك.</p><div className="promise-notes"><article><h3>خصوصية تليق بهذه الوقفة</h3><p>وردك ومحاسبتك مساحة شخصية، بضوابط وصول تحفظ خصوصيتها. بلا إعلانات أو تصميم يدفعك للبقاء أكثر مما تحتاج.</p></article><article><h3>وللكلمة أمانتها</h3><p>يمرّ المحتوى الشرعي بالمراجعة والاعتماد من اللجنة قبل نشره. لتقرأ في مساحة تعتني بما تقدّمه لك.</p></article></div></div>
  </div></section>
}

function Closing() {
  return <div className="night phase" data-phase="night" data-theme="dark">
    <section className="dedication shell" id="dedication" aria-labelledby="dedication-title"><Chapter number="٠٦">الوقف</Chapter><div className="dedication-body"><h2 id="dedication-title">هذا التطبيق وقفٌ لله تعالى</h2><p>أوقفتُ هذا التطبيق لله تعالى، ليبقى نفعه ممتدًا ما دام يُعين على الذكر والطاعة.</p><p className="permanent-dedication">وأشركتُ في هذا الوقف كل من يساهم في نشره، أو يدلّ عليه، أو يحفّز غيره على الانتفاع به، رجاء أن يكتب الله الأجر للجميع.</p><SharePanel /></div></section>
    <section className="closing shell" aria-labelledby="closing-title"><p>هدأ اليوم.</p><h2 id="closing-title">ولك في كل يوم، وقفة.</h2><p className="closing-effect">وإن دللت عليها غيرك، امتد أثرها.</p><AppLink /></section>
  </div>
}

export default function App() {
  const localPhase = getLocalDayPhase()
  const topTheme = themeForPhase(localPhase)
  return <DayEnvironment startPhase={localPhase}>
    <ScrollChrome initialTheme={topTheme} initialPhase={localPhase} />
    <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
    <div className="masthead" id="top" data-theme={topTheme}><Header /></div>
    <main id="main" tabIndex={-1}><Opening theme={topTheme} phase={localPhase} /><Morning phase={localPhase} /><Continuation /><Continuity /><Promise /><Closing /></main>
    <div className="footer-environment" data-theme="dark"><footer className="footer shell"><Brand /><div className="footer-credit"><p>هذا التطبيق وقفٌ لله تعالى</p></div><a href="#top">إلى بداية اليوم<span aria-hidden="true">↑</span></a></footer></div>
  </DayEnvironment>
}
