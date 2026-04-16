import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'

export function CaptainsLog() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'log' | 'orders'>('log')
  const run = useGameStore((s) => s.run)
  const updateCaptainsLog = useGameStore((s) => s.updateCaptainsLog)
  const updateStandingOrders = useGameStore((s) => s.updateStandingOrders)

  if (!run) return null

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-lg"
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Captain's Log
        </h3>
        <span className="text-xs text-gray-600">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Tab buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => setTab('log')}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                tab === 'log' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Mission Notes
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                tab === 'orders' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Standing Orders
            </button>
          </div>

          {tab === 'log' ? (
            <div>
              <textarea
                value={run.captainsLog}
                onChange={(e) => updateCaptainsLog(e.target.value)}
                placeholder="Record observations, clues, plans... The FO reads this."
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 resize-y focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-gray-600 mt-1">Per-run notes. The FO uses these for context.</p>
            </div>
          ) : (
            <div>
              <textarea
                value={run.standingOrders}
                onChange={(e) => updateStandingOrders(e.target.value)}
                placeholder="Always investigate derelicts. Never trade fuel below 40%..."
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 resize-y focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-gray-600 mt-1">Persists across runs. Teach your FO your preferences.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
