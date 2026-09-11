import { useEffect, useState } from 'react'
import { Mark } from './Brand'
import { journeyPhaseFor, journeyPhaseLabels, themeColorForPhase } from '../dayPhase'
import type { DayPhase, DayTheme, JourneyPhase } from '../dayPhase'

export function ScrollChrome({ initialTheme, initialPhase }: { initialTheme: DayTheme; initialPhase: DayPhase }) {
  const [theme, setTheme] = useState<DayTheme>(initialTheme)
  const [activePhase, setActivePhase] = useState<JourneyPhase>(journeyPhaseFor(initialPhase))
  const [progress, setProgress] = useState(0)
  const [markVisible, setMarkVisible] = useState(false)

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-phase]')]
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    themeMeta?.setAttribute('content', themeColorForPhase(initialPhase))

    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - innerHeight / 2) - Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - innerHeight / 2))
      const current = visible[0]?.target as HTMLElement | undefined
      const phase = (current?.dataset.journeyPhase || current?.dataset.phase) as DayPhase | undefined
      const currentTheme = current?.dataset.theme as DayTheme | undefined
      if (phase) {
        setActivePhase(journeyPhaseFor(phase))
        themeMeta?.setAttribute('content', themeColorForPhase(phase))
      }
      if (currentTheme === 'light' || currentTheme === 'dark') setTheme(currentTheme)
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 })
    sections.forEach(section => sectionObserver.observe(section))

    const header = document.querySelector('.masthead')
    const headerObserver = new IntersectionObserver(([entry]) => setMarkVisible(!entry.isIntersecting), { threshold: 0 })
    if (header) headerObserver.observe(header)

    const updateProgress = () => {
      const root = document.documentElement
      const available = root.scrollHeight - root.clientHeight
      setProgress(available > 0 ? Math.min(1, Math.max(0, root.scrollTop / available)) : 0)
    }
    updateProgress()
    addEventListener('scroll', updateProgress, { passive: true })
    addEventListener('resize', updateProgress)

    return () => {
      sectionObserver.disconnect()
      headerObserver.disconnect()
      removeEventListener('scroll', updateProgress)
      removeEventListener('resize', updateProgress)
    }
  }, [initialPhase])

  return <>
    <a className={`floating-mark ${markVisible ? 'is-visible' : ''}`} data-theme={theme} href="#top" aria-label="وقفة، العودة إلى البداية" aria-hidden={!markVisible} tabIndex={markVisible ? 0 : -1}><span className="floating-mark-space"><Mark /></span></a>
    <div className="journey-progress" aria-hidden="true"><span style={{ transform: `scaleY(${progress})` }} /></div>
    <div className="day-rail" data-theme={theme} aria-hidden="true">
      <span className="day-rail-label">{journeyPhaseLabels[activePhase]}</span>
      <span className="day-rail-marker" aria-hidden="true"><i /></span>
    </div>
  </>
}
