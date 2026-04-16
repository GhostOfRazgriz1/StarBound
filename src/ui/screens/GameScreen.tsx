import { useGameStore } from '../../storage/game-store'
import { useRef, useState } from 'react'
import { selectSector, performAction, generateAndSetSectorOptions } from '../../engine/game-engine'
import { ShipStatus } from '../components/ShipStatus'
import { EquipmentPanel } from '../components/EquipmentPanel'
import { CargoPanel } from '../components/CargoPanel'
import { ConsumablesPanel } from '../components/ConsumablesPanel'
import { CaptainsLog } from '../components/CaptainsLog'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const lastActionRef = useRef<(() => void) | null>(null)

  if (!run) return null

  const fo = FO_ARCHETYPES[run.foArchetype]

  function handleSectorSelect(sector: SectorPreview) {
    lastActionRef.current = () => selectSector(sector)
    selectSector(sector)
  }

  function handleAction(actionId: string, actionLabel: string, freeText?: string) {
    lastActionRef.current = () => performAction(actionId, actionLabel, freeText)
    performAction(actionId, actionLabel, freeText)
  }

  function handleRetry() {
    useGameStore.getState().setError(null)
    if (lastActionRef.current) {
      lastActionRef.current()
    } else if (run?.phase === 'sector_select' && run?.sectorOptions.length === 0) {
      generateAndSetSectorOptions()
    }
  }

  const sidebarContent = (
    <>
      <div className="text-center">
        <p className="text-xs text-gray-600 uppercase tracking-wider">{t('game.firstOfficer')}</p>
        <p className="text-sm text-gray-300 font-semibold">{fo.fullName}</p>
      </div>

      <ShipStatus ship={run.ship} />
      <EquipmentPanel equipment={run.ship.equipment} />
      <CargoPanel cargo={run.ship.cargo} equipment={run.ship.equipment} />
      <ConsumablesPanel consumables={run.ship.consumables || []} />
      <CaptainsLog />

      <div className="mt-auto">
        <CostIndicator />
      </div>
    </>
  )

  return (
    <div className="flex h-svh relative">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-gray-800 p-4 flex-col gap-4 overflow-y-auto">
        {sidebarContent}
      </div>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto z-50 transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="self-end text-gray-500 hover:text-gray-300 text-sm"
        >
          Close
        </button>
        {sidebarContent}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0 gap-2">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-xs shrink-0"
          >
            Ship
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg text-gray-200 truncate">
              {run.currentSector
                ? run.currentSector.name
                : t('game.sectorOf', { current: run.currentSectorNumber, total: run.totalSectors })}
            </h2>
            <p className="text-xs text-gray-600 truncate">
              {t('game.arcStage', { stage: run.storyArc.stage, antagonist: run.storyArc.antagonist })}
            </p>
          </div>

          {run.phase === 'combat' && (
            <span className="px-2 py-1 bg-red-900/50 border border-red-700 rounded text-xs text-red-400 uppercase shrink-0">
              {t('game.combat')}
            </span>
          )}
        </div>

        {/* Content area */}
        {run.phase === 'sector_select' ? (
          <SectorSelect
            sectors={run.sectorOptions}
            ship={run.ship}
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
          <div className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded p-3 flex items-center gap-3">
            <span className="flex-1">{error}</span>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-800/50 hover:bg-red-700/50 text-red-300 rounded text-xs transition-colors"
            >
              {t('game.retry' as Parameters<typeof t>[0])}
            </button>
            <button
              onClick={() => useGameStore.getState().setError(null)}
              className="text-red-500 hover:text-red-300 text-xs underline"
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
