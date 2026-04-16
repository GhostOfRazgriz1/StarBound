import { useState } from 'react'
import type { Consumable } from '../../types/consumable'
import { MAX_CONSUMABLES } from '../../types/consumable'
import { useGameStore } from '../../storage/game-store'
import { useConsumableItem } from '../../engine/game-engine'
import { t } from '../../i18n'

const RESOLUTION_COLORS: Record<string, string> = {
  instant: '#22d3ee',
  triggered: '#fbbf24',
}

export function ConsumablesPanel({ consumables }: { consumables: Consumable[] }) {
  const [open, setOpen] = useState(false)
  const loading = useGameStore((s) => s.loading)

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-lg"
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('consumable.title' as Parameters<typeof t>[0])} ({consumables.length}/{MAX_CONSUMABLES})
        </h3>
        <span className="text-xs text-gray-600">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {consumables.length === 0 ? (
            <p className="text-xs text-gray-700 italic">{t('consumable.empty' as Parameters<typeof t>[0])}</p>
          ) : (
            consumables.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/50 border border-gray-700/50 rounded p-2 space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: RESOLUTION_COLORS[item.resolution] ?? '#9ca3af' }}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-600 ml-1">[{item.type}]</span>
                  </div>
                  <span
                    className="text-[10px] px-1 rounded shrink-0"
                    style={{
                      color: RESOLUTION_COLORS[item.resolution],
                      backgroundColor: (RESOLUTION_COLORS[item.resolution] ?? '#9ca3af') + '15',
                    }}
                  >
                    {item.resolution === 'instant' ? t('consumable.instant' as Parameters<typeof t>[0]) : t('consumable.triggered' as Parameters<typeof t>[0])}
                  </span>
                </div>

                <p className="text-xs text-gray-500">{item.effect}</p>
                {item.magnitude && item.resolution === 'instant' && (
                  <p className="text-[10px] text-gray-600">{t('consumable.strength' as Parameters<typeof t>[0], { value: item.magnitude })}</p>
                )}
                {item.uses > 1 && (
                  <p className="text-[10px] text-gray-600">{t('consumable.usesLeft' as Parameters<typeof t>[0], { count: item.uses })}</p>
                )}

                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => useConsumableItem(item.id)}
                    disabled={loading}
                    className="px-2 py-0.5 text-[10px] rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('consumable.use' as Parameters<typeof t>[0])}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
