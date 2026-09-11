export type DayPhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night'
export type DayTheme = 'light' | 'dark'
export type JourneyPhase = 'dawn' | 'morning' | 'day' | 'evening' | 'night'

export const dayPhaseOrder: DayPhase[] = ['dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night']

export const dayPhaseLabels: Record<DayPhase, string> = {
  dawn: 'الفجر',
  morning: 'الصباح',
  noon: 'الظهر',
  afternoon: 'العصر',
  sunset: 'المغرب',
  night: 'الليل',
}

export const journeyPhaseLabels: Record<JourneyPhase, string> = {
  dawn: 'الفجر',
  morning: 'الصباح',
  day: 'النهار',
  evening: 'المساء',
  night: 'الليل',
}

export const localPhaseContext: Record<DayPhase, { hero: string; chapter: string }> = {
  dawn: { hero: 'من هذا الفجر، إلى آخر اليوم', chapter: 'مع أول يومك' },
  morning: { hero: 'من هذا الصباح، إلى آخر اليوم', chapter: 'مع صباحك' },
  noon: { hero: 'في قلب النهار، لك وقفة', chapter: 'في يومك الآن' },
  afternoon: { hero: 'في امتداد النهار، لك وقفة', chapter: 'في يومك الآن' },
  sunset: { hero: 'مع هذا المساء، لك وقفة', chapter: 'مع مساءك' },
  night: { hero: 'في هدوء الليل، لك وقفة', chapter: 'حين يهدأ يومك' },
}

export function journeyPhaseFor(phase: DayPhase): JourneyPhase {
  if (phase === 'noon' || phase === 'afternoon') return 'day'
  if (phase === 'sunset') return 'evening'
  return phase
}

// Values are official Waqfa tokens from the two immutable identity references.
export function themeColorForPhase(phase: DayPhase): string {
  if (phase === 'morning') return '#F7F3EC'
  if (phase === 'noon') return '#FFFFFF'
  if (phase === 'afternoon') return '#F0ECE5'
  if (phase === 'sunset') return '#0F3E36'
  if (phase === 'night') return '#08211D'
  return '#0F1140'
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
