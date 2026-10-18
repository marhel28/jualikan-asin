import { ref, computed } from 'vue'

export type Locale = 'id' | 'en'

const currentLocale = ref<Locale>('id')

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('lba_locale')
  if (saved === 'en' || saved === 'id') {
    currentLocale.value = saved
  }
}

export const setLocale = (locale: Locale) => {
  currentLocale.value = locale
  if (typeof window !== 'undefined') {
    localStorage.setItem('lba_locale', locale)
  }
}

export const toggleLocale = () => {
  setLocale(currentLocale.value === 'id' ? 'en' : 'id')
}

export const useLocale = () => {
  const isEn = computed(() => currentLocale.value === 'en')
  
  return {
    locale: currentLocale,
    isEn,
    setLocale,
    toggleLocale,
    t: (idText: string, enText: string) => (currentLocale.value === 'en' ? enText : idText)
  }
}
