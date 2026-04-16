import { useState } from 'react'
import type { LLMProviderId, LLMConfig } from '../../types/llm'
import { useGameStore } from '../../storage/game-store'
import { saveLLMConfig, loadLLMConfig, loadPlayerName, savePlayerName, saveLanguage, loadLanguage, loadActiveRun } from '../../storage/cross-run'
import { AVAILABLE_MODELS } from '../../config'
import { LANGUAGES, t } from '../../i18n'

export function SetupScreen() {
  const setPhase = useGameStore((s) => s.setPhase)
  const setLLMConfig = useGameStore((s) => s.setLLMConfig)

  const saved = loadLLMConfig()
  const [playerName, setPlayerName] = useState(loadPlayerName())
  const [language, setLanguage] = useState(loadLanguage())
  const [provider, setProvider] = useState<LLMProviderId>(saved?.provider ?? 'openai')
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? '')
  const [model, setModel] = useState(saved?.model ?? AVAILABLE_MODELS.openai[0])
  const [error, setError] = useState<string | null>(null)

  const models = AVAILABLE_MODELS[provider] ?? []

  function handleProviderChange(p: LLMProviderId) {
    setProvider(p)
    setModel(AVAILABLE_MODELS[p][0])
  }

  function handleContinue() {
    if (!playerName.trim()) {
      setError(t('setup.errorNoName'))
      return
    }
    if (!apiKey.trim()) {
      setError(t('setup.errorNoKey'))
      return
    }

    savePlayerName(playerName.trim())
    saveLanguage(language)
    useGameStore.setState({ playerName: playerName.trim(), language })
    const config: LLMConfig = { provider, apiKey: apiKey.trim(), model }
    saveLLMConfig(config)
    setLLMConfig(config)
    setPhase('fo_select')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">{t('setup.title')}</h1>
          <p className="text-gray-500 text-sm">{t('setup.subtitle')}</p>
        </div>

        <div className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('setup.captainName')}</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => { setPlayerName(e.target.value); setError(null) }}
              placeholder={t('setup.captainNamePlaceholder')}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                saveLanguage(e.target.value)
                useGameStore.setState({ language: e.target.value })
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('setup.llmProvider')}</label>
            <div className="flex gap-2 flex-wrap">
              {([
                ['openai', 'OpenAI'],
                ['anthropic', 'Anthropic'],
                ['google', 'Google AI'],
                ['deepseek', 'DeepSeek'],
                ['qwen', 'Qwen'],
                ['zhipu', 'Zhipu (GLM)'],
                ['baichuan', 'Baichuan'],
                ['minimax', 'MiniMax'],
                ['moonshot', 'Moonshot'],
                ['doubao', 'Doubao'],
                ['openrouter', 'OpenRouter'],
              ] as const).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    provider === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('setup.apiKey')}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(null) }}
              placeholder={
                provider === 'anthropic' ? 'sk-ant-...' :
                provider === 'google' ? 'AIza...' :
                provider === 'openrouter' ? 'sk-or-...' :
                'sk-...'
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              {t('setup.apiKeyHint')}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('setup.model')}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-medium transition-colors"
          >
            {t('setup.continue')}
          </button>

          {loadActiveRun() && (
            <button
              onClick={() => useGameStore.getState().restoreRun()}
              className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded font-medium transition-colors"
            >
              {t('setup.resumeMission' as Parameters<typeof t>[0])}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-600">
          {t('setup.byokNote')}
        </p>
      </div>
    </div>
  )
}
