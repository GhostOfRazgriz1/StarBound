import type { SectorPreview } from '../../types/encounters'
import type { Ship } from '../../types/game'
import { TRAVEL_COSTS } from '../../config'
import { t } from '../../i18n'

interface SectorSelectProps {
  sectors: SectorPreview[]
  ship: Ship
  onSelect: (sector: SectorPreview) => void
  currentSector: number
  totalSectors: number
  disabled: boolean
}

const DISTANCE_LABELS = ['', 'Nearby', 'Moderate', 'Distant']
const DISTANCE_COLORS = ['', 'text-green-500', 'text-yellow-500', 'text-orange-400']

function RiskBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-1.5 rounded-sm ${
            i <= level
              ? level >= 4 ? 'bg-red-500' : level >= 3 ? 'bg-yellow-500' : 'bg-green-500'
              : 'bg-gray-800'
          }`}
        />
      ))}
    </div>
  )
}

export function SectorSelect({ sectors, ship, onSelect, currentSector, totalSectors, disabled }: SectorSelectProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500">
          {t('sector.sectorOf', { current: currentSector, total: totalSectors })}
        </p>
        <h3 className="text-lg text-gray-200">{t('sector.chooseDestination')}</h3>
        <p className="text-xs text-gray-600">{t('sector.sensorsDetected')}</p>
      </div>

      <div className="grid gap-3">
        {sectors.map((sector) => {
          const fuelCost = sector.distance * TRAVEL_COSTS.fuelPerDistance
          const suppliesCost = sector.distance * TRAVEL_COSTS.suppliesPerDistance
          const canAfford = ship.fuel >= fuelCost && ship.supplies >= suppliesCost
          const cantReach = !canAfford

          return (
            <button
              key={sector.id}
              onClick={() => onSelect(sector)}
              disabled={disabled || cantReach}
              className={`bg-gray-900/50 border rounded-lg p-4 text-left transition-colors group ${
                cantReach
                  ? 'border-red-900/30 opacity-50 cursor-not-allowed'
                  : 'border-gray-800 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate">
                      {sector.name}
                    </h4>
                    <span className={`text-[10px] shrink-0 ${DISTANCE_COLORS[sector.distance]}`}>
                      {DISTANCE_LABELS[sector.distance]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{sector.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    {t('sector.risk')} <RiskBar level={sector.riskLevel} />
                  </span>
                  <span className="flex items-center gap-1">
                    {t('sector.interest')} <RiskBar level={sector.interestLevel} />
                  </span>
                </div>
              </div>

              {/* Travel cost */}
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <span className="text-amber-500">Fuel: -{fuelCost}</span>
                <span className="text-emerald-500">Supplies: -{suppliesCost}</span>
                {cantReach && (
                  <span className="text-red-400">Not enough resources</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
