import { useState } from 'react'
import { sections, appUrl } from '../content'
import { Arrow } from './Primitives'
import { Brand } from './Brand'

export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="header shell">
    <Brand />
    <nav className="desktop-nav" aria-label="التنقل الرئيسي">{sections.map(section => <a key={section.id} href={'#' + section.id}>{section.label}</a>)}</nav>
    <a className="header-entry" href={appUrl}>الدخول إلى وقفة<Arrow /></a>
    <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-nav" id="menu-button" onClick={() => setOpen(!open)}>{open ? 'إغلاق' : 'القائمة'}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <nav hidden={!open} id="mobile-nav" className="mobile-nav" aria-label="التنقل على الجوال" onKeyDown={event => {
      if (event.key === 'Escape') { setOpen(false); document.getElementById('menu-button')?.focus() }
    }}>{sections.map(section => <a key={section.id} href={'#' + section.id} onClick={() => setOpen(false)}>{section.label}<Arrow /></a>)}<a href={appUrl}>الدخول إلى وقفة<Arrow /></a></nav>
  </header>
}
