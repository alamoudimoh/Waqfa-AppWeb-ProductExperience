import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * One background for the document, anchored to its actual layout rather than
 * viewport or scroll position. ResizeObserver follows fonts, wrapping and tab
 * content. No scroll listener, animation loop or extra transition elements.
 */
export function DayEnvironment({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const sections = [...root.querySelectorAll<HTMLElement>('[data-phase]')]
    const update = () => {
      const origin = root.getBoundingClientRect().top
      // Project layout coordinates onto the 168-degree light direction.
      // Centre alignment keeps the transition anchored while light reaches
      // different inline positions at different points in the day.
      const slope = Number(getComputedStyle(root).getPropertyValue('--light-inclination')) * Math.PI / 180
      const project = (y: number) => y * Math.cos(slope) + root.clientWidth * Math.sin(slope) / 2
      for (const section of sections) {
        const bounds = section.getBoundingClientRect()
        root.style.setProperty('--' + section.dataset.phase + '-start', project(bounds.top - origin) + 'px')
        root.style.setProperty('--' + section.dataset.phase + '-middle', project(bounds.top - origin + bounds.height / 2) + 'px')
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])
  return <div className="day-environment" ref={ref}>{children}</div>
}
