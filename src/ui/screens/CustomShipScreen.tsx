import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'
import { setSelectedShip, setCustomShipStats } from '../../storage/session'
import { CUSTOM_SHIP_BUDGET, CUSTOM_SHIP_MIN, CUSTOM_SHIP_MAX } from '../../types/game'

interface StatConfig {
  key: 'maxHull' | 'maxFuel' | 'maxSupplies'
  label: string
  icon: string
  color: string
  description: string
}

const STATS: StatConfig[] = [
  { key: 'maxHull', label: 'Hull', icon: 'H', color: '#3b82f6', description: 'How much damage your ship can take' },
  { key: 'maxFuel', label: 'Fuel', icon: 'F', color: '#f59e0b', description: 'How far you can travel between refueling' },
  { key: 'maxSupplies', label: 'Supplies', icon: 'S', color: '#10b981', description: 'Crew sustenance and repair materials' },
]

const DEFAULT_ALLOC = Math.floor(CUSTOM_SHIP_BUDGET / 3) // 100 each

export function CustomShipScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  const [stats, setStats] = useState({
    maxHull: DEFAULT_ALLOC,
    maxFuel: DEFAULT_ALLOC,
    maxSupplies: DEFAULT_ALLOC,
  })

  const spent = stats.maxHull + stats.maxFuel + stats.maxSupplies
  const remaining = CUSTOM_SHIP_BUDGET - spent

  function updateStat(key: 'maxHull' | 'maxFuel' | 'maxSupplies', value: number) {
    const clamped = Math.max(CUSTOM_SHIP_MIN, Math.min(CUSTOM_SHIP_MAX, value))
    const otherKeys = STATS.map((s) => s.key).filter((k) => k !== key) as Array<'maxHull' | 'maxFuel' | 'maxSupplies'>
    const othersTotal = otherKeys.reduce((sum, k) => sum + stats[k], 0)

    // Don't allow if it would push others below minimum
    if (clamped + othersTotal > CUSTOM_SHIP_BUDGET) {
      // Reduce others proportionally
      const excess = clamped + othersTotal - CUSTOM_SHIP_BUDGET
      const newStats = { ...stats, [key]: clamped }
      let toReduce = excess
      for (const ok of otherKeys) {
        const canReduce = Math.max(0, newStats[ok] - CUSTOM_SHIP_MIN)
        const reduction = Math.min(canReduce, toReduce)
        newStats[ok] -= reduction
        toReduce -= reduction
      }
      if (toReduce > 0) {
        // Can't fit — clamp this stat instead
        newStats[key] = clamped - toReduce
      }
      setStats(newStats)
    } else {
      setStats({ ...stats, [key]: clamped })
    }
  }

  function handleConfirm() {
    setCustomShipStats(stats)
    setSelectedShip('custom')
    setPhase('scenario_select')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">Build Custom Ship</h2>
          <p className="text-gray-500 text-sm">
            Allocate {CUSTOM_SHIP_BUDGET} points across your ship's systems. No starting equipment.
          </p>
        </div>

        {/* Budget indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-100">{spent}</p>
            <p className="text-xs text-gray-500">spent</p>
          </div>
          <div className="text-gray-700">/</div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-500">{CUSTOM_SHIP_BUDGET}</p>
            <p className="text-xs text-gray-500">budget</p>
          </div>
          {remaining > 0 && (
            <>
              <div className="text-gray-700">=</div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{remaining}</p>
                <p className="text-xs text-gray-500">unspent</p>
              </div>
            </>
          )}
        </div>

        {/* Stat sliders */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
          {STATS.map((stat) => {
            const value = stats[stat.key]
            const pct = ((value - CUSTOM_SHIP_MIN) / (CUSTOM_SHIP_MAX - CUSTOM_SHIP_MIN)) * 100
            return (
              <div key={stat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-200">{stat.label}</span>
                    <p className="text-xs text-gray-600">{stat.description}</p>
                  </div>
                  <span className="text-lg font-bold tabular-nums" style={{ color: stat.color }}>
                    {value}
                  </span>
                </div>

                {/* Slider track */}
                <div className="relative">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{ width: `${pct}%`, backgroundColor: stat.color }}
                    />
                  </div>
                  <input
                    type="range"
                    min={CUSTOM_SHIP_MIN}
                    max={CUSTOM_SHIP_MAX}
                    step={5}
                    value={value}
                    onChange={(e) => updateStat(stat.key, Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Quick buttons */}
                <div className="flex gap-1">
                  {[CUSTOM_SHIP_MIN, 75, 100, 125, CUSTOM_SHIP_MAX].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => updateStat(stat.key, preset)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        value === preset
                          ? 'bg-gray-600 text-gray-200'
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Preview comparison */}
        <div className="text-xs text-gray-600 text-center">
          Balanced (Explorer) = 100 / 100 / 100
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
          >
            Confirm Ship
          </button>
          <button
            onClick={() => setPhase('ship_select')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors"
          >
            Back to Presets
          </button>
        </div>
      </div>
    </div>
  )
}
