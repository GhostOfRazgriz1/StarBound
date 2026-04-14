import { useGameStore } from '../../storage/game-store'
import { setSelectedShip } from '../../storage/session'
import { SHIP_CLASSES, CUSTOM_SHIP_MAX } from '../../types/game'

type PresetShipId = keyof typeof SHIP_CLASSES
const shipOrder: PresetShipId[] = ['explorer', 'corvette', 'freighter', 'scout']

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-gray-500 w-6 text-right">{value}</span>
    </div>
  )
}

export function ShipSelectScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  function handleSelect(id: PresetShipId) {
    setSelectedShip(id)
    setPhase('scenario_select')
  }

  // All bars use the same scale so equal values = equal bars
  const statMax = CUSTOM_SHIP_MAX  // 150

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">Choose Your Ship</h2>
          <p className="text-gray-500 text-sm">Each vessel has different strengths — pick the one that matches your playstyle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shipOrder.map((id) => {
            const ship = SHIP_CLASSES[id]
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-5 text-left transition-colors group"
              >
                <h3 className="text-base font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                  {ship.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">{ship.description}</p>

                <div className="space-y-1.5 mb-3">
                  <StatBar label="Hull" value={ship.stats.maxHull} max={statMax} color="#3b82f6" />
                  <StatBar label="Fuel" value={ship.stats.maxFuel} max={statMax} color="#f59e0b" />
                  <StatBar label="Supplies" value={ship.stats.maxSupplies} max={statMax} color="#10b981" />
                </div>

                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-green-500">+</span>
                    {ship.strengths.map((s, i) => (
                      <span key={i} className="text-gray-400">{i > 0 ? ', ' : ' '}{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs mt-1">
                  <span className="text-red-500">-</span>
                  {ship.weaknesses.map((w, i) => (
                    <span key={i} className="text-gray-500">{i > 0 ? ', ' : ' '}{w}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => setPhase('ship_custom')}
            className="px-5 py-3 border border-dashed border-gray-700 hover:border-blue-500/50 rounded-lg text-sm text-gray-400 hover:text-blue-400 transition-colors"
          >
            Or build a custom ship...
          </button>
        </div>

        <button
          onClick={() => setPhase('fo_select')}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          Back to FO selection
        </button>
      </div>
    </div>
  )
}
