export const appUrl = (() => {
  try {
    const url = new URL(import.meta.env.VITE_WAQFA_APP_URL || 'https://my.waqfa.app')
    return url.protocol === 'https:' ? url.href : 'https://my.waqfa.app'
  } catch { return 'https://my.waqfa.app' }
})()

export const sections = [
  { id: 'journey', label: 'وقفة في يومك' },
  { id: 'promise', label: 'على أمانة' },
  { id: 'dedication', label: 'أصل وقفة' },
] as const

export const sessions = [
  { id: 'morning', title: 'أذكار الصباح', cue: 'بداية اليوم', description: 'افتح أذكار الصباح، واقرأ على مهل. وردٌ واضح تعود إليه حتى تكمله.', note: 'للبداية مكانها.' },
  { id: 'evening', title: 'أذكار المساء', cue: 'حين يهدأ النهار', description: 'مع تغيّر إيقاع يومك، عُد إلى أذكار المساء. مساحة للقراءة، ومتابعة ما بقي.', note: 'وللمساء وقفته.' },
  { id: 'sleep', title: 'أذكار النوم', cue: 'قبل أن ينتهي اليوم', description: 'اختم يومك بأذكار النوم في مساحة هادئة، تمنح القراءة وقتها.', note: 'وختامٌ على مهل.' },
] as const

export const week = [
  { day: 'السبت', completed: true },
  { day: 'الأحد', completed: true },
  { day: 'الاثنين', completed: false },
  { day: 'الثلاثاء', completed: true },
  { day: 'الأربعاء', completed: true },
  { day: 'الخميس', completed: false },
  { day: 'الجمعة', completed: true },
] as const
