import { useState } from 'react'
import type { LLMProviderId, LLMConfig } from '../../types/llm'
import { useGameStore } from '../../storage/game-store'
import { saveLLMConfig, loadLLMConfig, loadPlayerName, savePlayerName } from '../../storage/cross-run'
import { AVAILABLE_MODELS } from '../../config'

export function SetupScreen() {
  const setPhase = useGameStore((s) => s.setPhase)
  const setLLMConfig = useGameStore((s) => s.setLLMConfig)

  const saved = loadLLMConfig()
  const [playerName, setPlayerName] = useState(loadPlayerName())
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
      setError('What should we call you, Captain?')
      return
    }
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    savePlayerName(playerName.trim())
    useGameStore.setState({ playerName: playerName.trim() })
    const config: LLMConfig = { provider, apiKey: apiKey.trim(), model }
    saveLLMConfig(config)
    setLLMConfig(config)
    setPhase('fo_select')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">STARBOUND</h1>
          <p className="text-gray-500 text-sm">A text-based space exploration game powered by AI</p>
        </div>

        <div className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Captain Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => { setPlayerName(e.target.value); setError(null) }}
              placeholder="What should the crew call you?"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">LLM Provider</label>
            <div className="flex gap-2">
              {(['openai', 'anthropic'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    provider === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(null) }}
              placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Your key is stored locally and never sent to our servers.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Model</label>
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
            Continue
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          BYOK — You bring your own API key. All LLM calls are made directly from your browser.
        </p>
      </div>
    </div>
  )
}
