export type DayPhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night'
export type DayTheme = 'light' | 'dark'

export const dayPhaseOrder: DayPhase[] = ['dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night']

export const dayPhaseLabels: Record<DayPhase, string> = {
  dawn: 'الفجر',
  morning: 'الصباح',
  noon: 'الظهر',
  afternoon: 'العصر',
  sunset: 'المغرب',
  night: 'الليل',
}

export function getLocalDayPhase(date = new Date()): DayPhase {
  const hour = date.getHours() + date.getMinutes() / 60
  if (hour >= 4.5 && hour < 6) return 'dawn'
  if (hour >= 6 && hour < 11.5) return 'morning'
  if (hour >= 11.5 && hour < 15) return 'noon'
  if (hour >= 15 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 20) return 'sunset'
  return 'night'
}

export function themeForPhase(phase: DayPhase): DayTheme {
  return phase === 'morning' || phase === 'noon' || phase === 'afternoon' ? 'light' : 'dark'
}
