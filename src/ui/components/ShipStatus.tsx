import { memo } from 'react'
import type { Ship } from '../../types/game'
import { t } from '../../i18n'

function StatusBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: pct < 25 ? '#ef4444' : color }}
        />
      </div>
    </div>
  )
}

export const ShipStatus = memo(function ShipStatus({ ship }: { ship: Ship }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status.shipStatus')}</h3>
      <StatusBar label={t('status.hull')} value={ship.hull} max={ship.maxHull} color="#3b82f6" />
      <StatusBar label={t('status.fuel')} value={ship.fuel} max={ship.maxFuel} color="#f59e0b" />
      <StatusBar label={t('status.supplies')} value={ship.supplies} max={ship.maxSupplies} color="#10b981" />
      <StatusBar label={t('status.morale')} value={ship.morale} max={100} color="#8b5cf6" />
      <div className="flex justify-between text-sm pt-1 border-t border-gray-800">
        <span className="text-gray-500">{t('status.credits')}</span>
        <span className="text-gray-300">{ship.credits}</span>
      </div>
    </div>
  )
})
