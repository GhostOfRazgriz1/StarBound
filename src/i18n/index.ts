import { translations, type TranslationKey } from './translations'
import { useGameStore } from '../storage/game-store'

export type { TranslationKey } from './translations'

/**
 * Map of supported language codes to their display names (in their own language).
 */
export const LANGUAGES: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

/**
 * Translate a key using the current language from the game store.
 * Supports template placeholders like {budget} that can be replaced via the `params` argument.
 *
 * @example
 *   t('setup.title')                         // "STARBOUND"
 *   t('custom.subtitle', { budget: '300' })  // "Allocate 300 points..."
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = useGameStore.getState().language
  const table = translations[lang] ?? translations.en
  let text = table[key] ?? translations.en[key] ?? key

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }

  return text
}
