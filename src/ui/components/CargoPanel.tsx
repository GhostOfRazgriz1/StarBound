import { useState } from 'react'
import type { Equipment } from '../../types/equipment'
import type { ShipEquipment } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'
import { useGameStore } from '../../storage/game-store'

const SLOT_LABELS: Record<string, string> = {
  weapons: 'Weapons',
  shields: 'Shields',
  engine: 'Engine',
  special: 'Special',
}

export function CargoPanel({ cargo, equipment }: { cargo: Equipment[]; equipment: ShipEquipment }) {
  const [open, setOpen] = useState(false)
  const equipFromCargo = useGameStore((s) => s.equipFromCargo)
  const dropFromCargo = useGameStore((s) => s.dropFromCargo)

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-lg"
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Cargo ({cargo.length})
        </h3>
        <span className="text-xs text-gray-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {cargo.length === 0 ? (
            <p className="text-xs text-gray-700 italic">Empty</p>
          ) : (
            cargo.map((item) => {
              const currentInSlot = equipment[item.slot]
              return (
                <div
                  key={item.id}
                  className="bg-gray-800/50 border border-gray-700/50 rounded p-2 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: RARITY_CONFIG[item.rarity].color }}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-600 ml-1">
                        [{SLOT_LABELS[item.slot]}]
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-1 rounded shrink-0"
                      style={{
                        color: RARITY_CONFIG[item.rarity].color,
                        backgroundColor: RARITY_CONFIG[item.rarity].color + '15',
                      }}
                    >
                      {RARITY_CONFIG[item.rarity].label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">{item.effect}</p>

                  {currentInSlot && (
                    <p className="text-[10px] text-gray-600">
                      Replaces: {currentInSlot.name}
                    </p>
                  )}

                  <div className="flex gap-1 pt-1">
                    <button
                      onClick={() => equipFromCargo(item.id)}
                      className="px-2 py-0.5 text-[10px] rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors"
                    >
                      Equip
                    </button>
                    <button
                      onClick={() => dropFromCargo(item.id)}
                      className="px-2 py-0.5 text-[10px] rounded bg-gray-800 border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-800/50 transition-colors"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
