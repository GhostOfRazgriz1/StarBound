import { useGameStore } from '../../storage/game-store'
import { setSelectedFO } from '../../storage/session'
import { FO_ARCHETYPES, type FOArchetype } from '../../types/fo'

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
          <h2 className="text-2xl font-bold text-gray-100">Choose Your First Officer</h2>
          <p className="text-gray-500 text-sm">Your FO advises, remembers, and grows alongside you.</p>
        </div>

        <div className="grid gap-4">
          {archetypeOrder.map((key) => {
            const fo = FO_ARCHETYPES[key]
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-5 text-left transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {fo.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{fo.description}</p>
                  </div>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                    {fo.priority.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-3 italic">"{fo.tagline}"</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => useGameStore.getState().setPhase('setup')}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          Back to setup
        </button>
      </div>
    </div>
  )
}
