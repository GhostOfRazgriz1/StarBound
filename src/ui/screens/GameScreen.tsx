import { useGameStore } from '../../storage/game-store'
import { selectSector, performAction } from '../../engine/game-engine'
import { ShipStatus } from '../components/ShipStatus'
import { EquipmentPanel } from '../components/EquipmentPanel'
import { CargoPanel } from '../components/CargoPanel'
import { TradePanel } from '../components/TradePanel'
import { Narration } from '../components/Narration'
import { ActionBar } from '../components/ActionBar'
import { SectorSelect } from '../components/SectorSelect'
import { CostIndicator } from '../components/CostIndicator'
import { FO_ARCHETYPES } from '../../types/fo'
import type { SectorPreview } from '../../types/encounters'
import { t } from '../../i18n'

export function GameScreen() {
  const run = useGameStore((s) => s.run)
  const loading = useGameStore((s) => s.loading)
  const error = useGameStore((s) => s.error)

  if (!run) return null

  const fo = FO_ARCHETYPES[run.foArchetype]

  function handleSectorSelect(sector: SectorPreview) {
    selectSector(sector)
  }

  function handleAction(actionId: string, actionLabel: string, freeText?: string) {
    performAction(actionId, actionLabel, freeText)
  }

  return (
    <div className="flex h-svh">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider">{t('game.firstOfficer')}</p>
          <p className="text-sm text-gray-300 font-semibold">{fo.fullName}</p>
        </div>

        <ShipStatus ship={run.ship} />
        <EquipmentPanel equipment={run.ship.equipment} />
        <CargoPanel cargo={run.ship.cargo} equipment={run.ship.equipment} />

        <div className="mt-auto">
          <CostIndicator />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2 className="text-lg text-gray-200">
              {run.currentSector
                ? run.currentSector.name
                : t('game.sectorOf', { current: run.currentSectorNumber, total: run.totalSectors })}
            </h2>
            <p className="text-xs text-gray-600">
              {t('game.arcStage', { stage: run.storyArc.stage, antagonist: run.storyArc.antagonist })}
            </p>
          </div>
          {run.phase === 'combat' && (
            <span className="px-2 py-1 bg-red-900/50 border border-red-700 rounded text-xs text-red-400 uppercase">
              {t('game.combat')}
            </span>
          )}
        </div>

        {/* Content area */}
        {run.phase === 'sector_select' ? (
          <SectorSelect
            sectors={run.sectorOptions}
            onSelect={handleSectorSelect}
            currentSector={run.currentSectorNumber}
            totalSectors={run.totalSectors}
            disabled={loading}
          />
        ) : (
          <>
            <Narration entries={run.sectorHistory} />
            <ActionBar
              actions={run.availableActions}
              onAction={handleAction}
              disabled={loading}
            />
          </>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mt-3 text-sm text-gray-500 animate-pulse">
            {run.phase === 'sector_select'
              ? t('game.scanning')
              : t('game.processing')}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded p-3">
            {error}
            <button
              onClick={() => useGameStore.getState().setError(null)}
              className="ml-2 text-red-500 hover:text-red-300 underline"
            >
              {t('game.dismiss')}
            </button>
          </div>
        )}
      </div>

      {/* Trade overlay */}
      <TradePanel />
    </div>
  )
}
