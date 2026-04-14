import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'
import { getSelectedFO, getSelectedShip, getSelectedScenario, getCustomShipStats } from '../../storage/session'
import { SCENARIOS } from '../../config'
import { initializeRun } from '../../engine/game-engine'
import { SHIP_CLASSES, PROVISIONING } from '../../types/game'

export function ProvisioningScreen() {
  const error = useGameStore((s) => s.error)
  const [starting, setStarting] = useState(false)

  // Resolve selections
  const shipClassId = getSelectedShip()
  const scenarioInfo = getSelectedScenario()

  if (!shipClassId || !scenarioInfo) {
    useGameStore.getState().setPhase('scenario_select')
    return null
  }

  const scenario = SCENARIOS[scenarioInfo.id]
  const budget = scenario.provisioningBudget

  // Get ship max stats
  let maxFuel: number
  let maxSupplies: number
  if (shipClassId === 'custom') {
    const custom = getCustomShipStats()
    maxFuel = custom?.maxFuel ?? 100
    maxSupplies = custom?.maxSupplies ?? 100
  } else {
    const shipClass = SHIP_CLASSES[shipClassId]
    maxFuel = shipClass.stats.maxFuel
    maxSupplies = shipClass.stats.maxSupplies
  }

  // Baseline is free
  const baseFuel = Math.floor(maxFuel * PROVISIONING.baselineFuelPct)
  const baseSupplies = Math.floor(maxSupplies * PROVISIONING.baselineSuppliesPct)

  // Extra fuel/supplies cost credits
  const [fuel, setFuel] = useState(maxFuel)
  const [supplies, setSupplies] = useState(maxSupplies)

  const fuelCost = Math.max(0, fuel - baseFuel) * PROVISIONING.fuelCostPerUnit
  const suppliesCost = Math.max(0, supplies - baseSupplies) * PROVISIONING.suppliesCostPerUnit
  const totalProvisionCost = fuelCost + suppliesCost
  const remainingCredits = budget - totalProvisionCost
  const overBudget = remainingCredits < 0

  async function handleLaunch() {
    const foArchetype = getSelectedFO()
    if (!foArchetype || !shipClassId || !scenarioInfo) {
      useGameStore.getState().setPhase('fo_select')
      return
    }

    setStarting(true)
    try {
      await initializeRunWithProvisioning(
        scenarioInfo.id,
        foArchetype,
        shipClassId,
        scenarioInfo.depth,
        fuel,
        supplies,
        remainingCredits,
      )
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">Provision Your Ship</h2>
          <p className="text-gray-500 text-sm">
            Allocate your {budget} credit budget between fuel, supplies, and spending money.
          </p>
        </div>

        {/* Budget display */}
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-2xl font-bold text-gray-300 font-mono">{budget}</p>
          </div>
          <div className="text-gray-700">-</div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Provisions</p>
            <p className="text-2xl font-bold text-yellow-400 font-mono">{totalProvisionCost}</p>
          </div>
          <div className="text-gray-700">=</div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Credits</p>
            <p className={`text-2xl font-bold font-mono ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
              {remainingCredits}
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
          <ProvisionSlider
            label="Fuel"
            value={fuel}
            min={baseFuel}
            max={maxFuel}
            baseline={baseFuel}
            costPerUnit={PROVISIONING.fuelCostPerUnit}
            color="#f59e0b"
            onChange={setFuel}
          />
          <ProvisionSlider
            label="Supplies"
            value={supplies}
            min={baseSupplies}
            max={maxSupplies}
            baseline={baseSupplies}
            costPerUnit={PROVISIONING.suppliesCostPerUnit}
            color="#10b981"
            onChange={setSupplies}
          />
        </div>

        {/* Summary */}
        <div className="text-xs text-gray-600 text-center space-y-1">
          <p>Base allocation (free): {baseFuel} fuel + {baseSupplies} supplies</p>
          <p>Extra fuel: {Math.max(0, fuel - baseFuel)} units = {fuelCost}cr | Extra supplies: {Math.max(0, supplies - baseSupplies)} units = {suppliesCost}cr</p>
        </div>

        {overBudget && (
          <p className="text-red-400 text-sm text-center">Over budget! Reduce fuel or supplies.</p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleLaunch}
            disabled={overBudget || starting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? 'Launching...' : 'Launch Mission'}
          </button>
          <button
            onClick={() => useGameStore.getState().setPhase('scenario_select')}
            disabled={starting}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors disabled:opacity-50"
          >
            Back
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

function ProvisionSlider({
  label,
  value,
  min,
  max,
  baseline,
  costPerUnit,
  color,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  baseline: number
  costPerUnit: number
  color: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  const extraCost = Math.max(0, value - baseline) * costPerUnit

  function adjust(delta: number) {
    onChange(Math.max(min, Math.min(max, value + delta)))
  }

  const btnClass = 'px-1.5 py-0.5 text-[10px] rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-200">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold font-mono" style={{ color }}>
            {value}
          </span>
          <span className="text-xs text-gray-600">/ {max}</span>
          {extraCost > 0 && (
            <span className="text-xs text-yellow-400 font-mono">-{extraCost}cr</span>
          )}
        </div>
      </div>

      {/* Slider + adjustment buttons */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 shrink-0">
          <button className={btnClass} onClick={() => adjust(-10)} disabled={value <= min}>-10</button>
          <button className={btnClass} onClick={() => adjust(-5)} disabled={value <= min}>-5</button>
          <button className={btnClass} onClick={() => adjust(-1)} disabled={value <= min}>-1</button>
        </div>

        <div className="relative flex-1">
          {/* Baseline marker */}
          <div
            className="absolute top-0 h-2 border-r border-dashed border-gray-500 z-10"
            style={{ left: `${((baseline - min) / (max - min)) * 100}%` }}
            title={`Free baseline: ${baseline}`}
          />
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex gap-0.5 shrink-0">
          <button className={btnClass} onClick={() => adjust(1)} disabled={value >= max}>+1</button>
          <button className={btnClass} onClick={() => adjust(5)} disabled={value >= max}>+5</button>
          <button className={btnClass} onClick={() => adjust(10)} disabled={value >= max}>+10</button>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{min} (min)</span>
        <span>{baseline} (free)</span>
        <span>{max} (max)</span>
      </div>
    </div>
  )
}

async function initializeRunWithProvisioning(
  scenarioId: string,
  foArchetype: string,
  shipClassId: string,
  depth: 'standard' | 'deep',
  fuel: number,
  supplies: number,
  credits: number,
) {
  const scenario = SCENARIOS[scenarioId as keyof typeof SCENARIOS]
  await initializeRun(
    scenario,
    foArchetype as Parameters<typeof initializeRun>[1],
    shipClassId as Parameters<typeof initializeRun>[2],
    depth,
    { fuel, supplies, credits },
  )
}
