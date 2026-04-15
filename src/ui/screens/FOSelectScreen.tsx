import { useGameStore } from '../../storage/game-store'
import { setSelectedFO } from '../../storage/session'
import type { FOArchetype } from '../../types/fo'
import { t } from '../../i18n'
import type { TranslationKey } from '../../i18n'

const archetypeOrder: FOArchetype[] = ['chen', 'osei', 'vasquez']

export function FOSelectScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  function handleSelect(archetype: FOArchetype) {
    setSelectedFO(archetype)
    setPhase('ship_select')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">{t('fo.title')}</h2>
          <p className="text-gray-500 text-sm">{t('fo.subtitle')}</p>
        </div>

        <div className="grid gap-4">
          {archetypeOrder.map((key) => {
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-5 text-left transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {t(`fo.${key}.name` as TranslationKey)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t(`fo.${key}.description` as TranslationKey)}</p>
                  </div>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                    {t(`fo.${key}.priority` as TranslationKey)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-3 italic">"{t(`fo.${key}.tagline` as TranslationKey)}"</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => useGameStore.getState().setPhase('setup')}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          {t('fo.backToSetup')}
        </button>
      </div>
    </div>
  )
}
