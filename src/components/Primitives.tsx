import type { ReactNode } from 'react'
import { appUrl } from '../content'

export function Arrow({ down = false }: { down?: boolean }) {
  return <svg className={down ? 'arrow down' : 'arrow'} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
export function AppLink({ children = 'ابدأ وقفتك' }: { children?: ReactNode }) {
  return <a href={appUrl} className="button primary">{children}<Arrow /></a>
}
export function Chapter({ children, number }: { children: ReactNode; number: string }) {
  return <p className="chapter"><span aria-hidden="true">{number}</span><span className="chapter-rule" aria-hidden="true" />{children}</p>
}
