import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'
import { setSelectedScenario } from '../../storage/session'
import { SCENARIOS } from '../../config'
import type { ScenarioId } from '../../types/game'
import { t } from '../../i18n'
import type { TranslationKey } from '../../i18n'

const scenarioOrder: ScenarioId[] = ['deep_space_survey', 'distress_signal', 'first_contact', 'border_patrol']

/** Convert snake_case scenario id to camelCase for translation keys */
function scenarioKeyPrefix(id: ScenarioId): string {
  return id.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function ScenarioScreen() {
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard')

  function handleSelect(scenarioId: ScenarioId) {
    setSelectedScenario(scenarioId, depth)
    useGameStore.getState().setPhase('provisioning')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">{t('scenario.title')}</h2>
          <p className="text-gray-500 text-sm">{t('scenario.subtitle')}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setDepth('standard')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              depth === 'standard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t('scenario.standard')}
          </button>
          <button
            onClick={() => setDepth('deep')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              depth === 'deep'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t('scenario.deep')}
          </button>
        </div>

        <div className="grid gap-4">
          {scenarioOrder.map((id) => {
            const scenario = SCENARIOS[id]
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-5 text-left transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {t(`scenario.${scenarioKeyPrefix(id)}.name` as TranslationKey)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t(`scenario.${scenarioKeyPrefix(id)}.description` as TranslationKey)}</p>
                  </div>
                  <span className="text-xs text-yellow-400 font-mono shrink-0 ml-3">
                    {scenario.provisioningBudget}cr
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => useGameStore.getState().setPhase('ship_select')}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          {t('scenario.backToShip')}
        </button>
      </div>
    </div>
  )
}
