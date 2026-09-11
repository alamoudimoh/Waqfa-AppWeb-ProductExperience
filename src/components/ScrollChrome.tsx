import { useEffect, useState } from 'react'
import { Brand } from './Brand'
import { dayPhaseLabels, dayPhaseOrder } from '../dayPhase'
import type { DayPhase, DayTheme } from '../dayPhase'

export function ScrollChrome({ initialTheme, initialPhase }: { initialTheme: DayTheme; initialPhase: DayPhase }) {
  const [theme, setTheme] = useState<DayTheme>(initialTheme)
  const [activePhase, setActivePhase] = useState<DayPhase>(initialPhase)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-phase]')]
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - innerHeight / 2) - Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - innerHeight / 2))
      const current = visible[0]?.target as HTMLElement | undefined
      const phase = (current?.dataset.journeyPhase || current?.dataset.phase) as DayPhase | undefined
      const currentTheme = current?.dataset.theme as DayTheme | undefined
      if (phase && dayPhaseOrder.includes(phase)) setActivePhase(phase)
      if (currentTheme === 'light' || currentTheme === 'dark') setTheme(currentTheme)
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 })

    sections.forEach(section => observer.observe(section))

    const updateProgress = () => {
      const root = document.documentElement
      const available = root.scrollHeight - root.clientHeight
      setProgress(available > 0 ? Math.min(1, Math.max(0, root.scrollTop / available)) : 0)
    }
    updateProgress()
    addEventListener('scroll', updateProgress, { passive: true })
    addEventListener('resize', updateProgress)

    return () => {
      observer.disconnect()
      removeEventListener('scroll', updateProgress)
      removeEventListener('resize', updateProgress)
    }
  }, [])

  return <>
    <div className="floating-brand" data-theme={theme}><Brand /></div>
    <div className="journey-progress" aria-hidden="true"><span style={{ transform: `scaleY(${progress})` }} /></div>
    <div className="day-rail" aria-hidden="true">
      {dayPhaseOrder.map(phase => <span key={phase} className={activePhase === phase ? 'active' : ''} title={dayPhaseLabels[phase]} />)}
    </div>
  </>
}
