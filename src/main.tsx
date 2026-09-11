import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './v3.css'
import { getLocalDayPhase, themeColorForPhase } from './dayPhase'

document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', themeColorForPhase(getLocalDayPhase()))

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
