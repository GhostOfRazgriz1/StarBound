import type { SectorPreview } from '../../types/encounters'

interface SectorSelectProps {
  sectors: SectorPreview[]
  onSelect: (sector: SectorPreview) => void
  currentSector: number
  totalSectors: number
  disabled: boolean
}

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

export function SectorSelect({ sectors, onSelect, currentSector, totalSectors, disabled }: SectorSelectProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500">
          Sector {currentSector} of {totalSectors}
        </p>
        <h3 className="text-lg text-gray-200">Choose Your Next Destination</h3>
        <p className="text-xs text-gray-600">Long-range sensors have detected the following:</p>
      </div>

      <div className="grid gap-3">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => onSelect(sector)}
            disabled={disabled}
            className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-4 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                {sector.name}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  Risk <RiskBar level={sector.riskLevel} />
                </span>
                <span className="flex items-center gap-1">
                  Interest <RiskBar level={sector.interestLevel} />
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{sector.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
