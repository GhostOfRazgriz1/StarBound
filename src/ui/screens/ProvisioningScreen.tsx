import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'
import { getSelectedFO, getSelectedShip, getSelectedScenario, getCustomShipStats } from '../../storage/session'
import { SCENARIOS } from '../../config'
import { initializeRun } from '../../engine/game-engine'
import { SHIP_CLASSES, PROVISIONING } from '../../types/game'
import type { Equipment } from '../../types/equipment'
import type { Consumable } from '../../types/consumable'
import { RARITY_CONFIG } from '../../types/equipment'
import { CONSUMABLE_SELL_VALUES } from '../../types/consumable'
import { loadCreditBank, withdrawFromBank, loadEquipmentVault, removeFromVault, loadConsumableStash, removeFromStash, depositToBank, addToVault, addToStash, loadResearchBank, withdrawResearch } from '../../storage/cross-run'
import { createLLMProvider } from '../../llm/client'
import { rollEquipmentFromResearch, RESEARCH_TIERS } from '../../generation/research-roll'
import { t } from '../../i18n'

// Helper for keys not yet in TranslationKey union (added by translations agent)
const tt = (key: string, params?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], params)

export function ProvisioningScreen() {
  const error = useGameStore((s) => s.error)
  const llmConfig = useGameStore((s) => s.llmConfig)
  const [starting, setStarting] = useState(false)
  const [tab, setTab] = useState<'provisions' | 'loadout' | 'research'>('provisions')
  const [rolling, setRolling] = useState(false)
  const [rollResult, setRollResult] = useState<Equipment | null>(null)

  // Resolve selections
  const shipClassId = getSelectedShip()
  const scenarioInfo = getSelectedScenario()

  if (!shipClassId || !scenarioInfo) {
    useGameStore.getState().setPhase('scenario_select')
    return null
  }

  const scenario = SCENARIOS[scenarioInfo.id]
  const budget = scenario.provisioningBudget

  // Ship stats
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

  const baseFuel = Math.floor(maxFuel * PROVISIONING.baselineFuelPct)
  const baseSupplies = Math.floor(maxSupplies * PROVISIONING.baselineSuppliesPct)

  const [fuel, setFuel] = useState(maxFuel)
  const [supplies, setSupplies] = useState(maxSupplies)
  const [bankWithdraw, setBankWithdraw] = useState(0)

  // Loadout state — items selected from vault/stash to bring
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([])
  const [selectedConsumables, setSelectedConsumables] = useState<Consumable[]>([])

  const bankBalance = loadCreditBank()
  const [researchBalance, setResearchBalance] = useState(loadResearchBank)
  const vault = loadEquipmentVault()
  const stash = loadConsumableStash()

  const fuelCost = Math.max(0, fuel - baseFuel) * PROVISIONING.fuelCostPerUnit
  const suppliesCost = Math.max(0, supplies - baseSupplies) * PROVISIONING.suppliesCostPerUnit
  const totalProvisionCost = fuelCost + suppliesCost
  const remainingCredits = budget + bankWithdraw - totalProvisionCost
  const overBudget = remainingCredits < 0

  function handleWithdrawChange(amount: number) {
    setBankWithdraw(Math.max(0, Math.min(bankBalance, amount)))
  }

  function takeFromVault(itemId: string) {
    const item = vault.find((i) => i.id === itemId)
    if (!item) return
    removeFromVault(itemId)
    setSelectedEquipment([...selectedEquipment, item])
  }

  function returnToVault(itemId: string) {
    const item = selectedEquipment.find((i) => i.id === itemId)
    if (!item) return
    addToVault(item)
    setSelectedEquipment(selectedEquipment.filter((i) => i.id !== itemId))
  }

  function takeFromStash(itemId: string) {
    const item = stash.find((i) => i.id === itemId)
    if (!item) return
    removeFromStash(itemId)
    setSelectedConsumables([...selectedConsumables, item])
  }

  function returnToStash(itemId: string) {
    const item = selectedConsumables.find((i) => i.id === itemId)
    if (!item) return
    addToStash(item)
    setSelectedConsumables(selectedConsumables.filter((i) => i.id !== itemId))
  }

  function sellVaultItem(itemId: string) {
    const item = vault.find((i) => i.id === itemId)
    if (!item) return
    removeFromVault(itemId)
    depositToBank(RARITY_CONFIG[item.rarity]?.sellValue ?? 10)
  }

  function sellStashItem(itemId: string) {
    const item = stash.find((i) => i.id === itemId)
    if (!item) return
    removeFromStash(itemId)
    depositToBank(CONSUMABLE_SELL_VALUES[item.resolution] ?? 10)
  }

  async function handleLaunch() {
    const foArchetype = getSelectedFO()
    if (!foArchetype || !shipClassId || !scenarioInfo) {
      useGameStore.getState().setPhase('fo_select')
      return
    }

    // Withdraw from bank
    if (bankWithdraw > 0) {
      withdrawFromBank(bankWithdraw)
    }

    setStarting(true)
    try {
      const scenario = SCENARIOS[scenarioInfo.id as keyof typeof SCENARIOS]
      await initializeRun(
        scenario,
        foArchetype as Parameters<typeof initializeRun>[1],
        shipClassId as Parameters<typeof initializeRun>[2],
        scenarioInfo.depth,
        { fuel, supplies, credits: remainingCredits },
      )

      // Add selected loadout items to the ship
      const store = useGameStore.getState()
      const run = store.run
      if (run) {
        useGameStore.setState({
          run: {
            ...run,
            ship: {
              ...run.ship,
              cargo: [...run.ship.cargo, ...selectedEquipment],
              consumables: [...(run.ship.consumables || []), ...selectedConsumables],
            },
          },
        })
      }
    } catch {
      setStarting(false)
    }
  }

  async function handleResearchRoll(rpCost: number) {
    if (!llmConfig || researchBalance < rpCost) return
    setRolling(true)
    setRollResult(null)
    try {
      const provider = createLLMProvider(llmConfig)
      const { equipment } = await rollEquipmentFromResearch(provider, rpCost)
      withdrawResearch(rpCost)
      setResearchBalance(loadResearchBank())
      setRollResult(equipment)
      setSelectedEquipment([...selectedEquipment, equipment])
    } catch {
      // silently fail — user keeps their RP
    } finally {
      setRolling(false)
    }
  }

  const hasMetaProgress = bankBalance > 0 || vault.length > 0 || stash.length > 0 || researchBalance > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4 md:p-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">{t('provision.title')}</h2>
          <p className="text-gray-500 text-sm">
            {t('provision.subtitle', { budget })}
          </p>
        </div>

        {/* Tabs (only show if player has meta-progress) */}
        {hasMetaProgress && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setTab('provisions')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                tab === 'provisions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tt('provision.provisions')}
            </button>
            <button
              onClick={() => setTab('loadout')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                tab === 'loadout' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tt('provision.loadout')} ({selectedEquipment.length + selectedConsumables.length})
            </button>
            {researchBalance > 0 && (
              <button
                onClick={() => setTab('research')}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  tab === 'research' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Research Lab ({researchBalance} RP)
              </button>
            )}
          </div>
        )}

        {/* Budget display */}
        <div className="flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">{t('provision.budgetLabel')}</p>
            <p className="text-xl font-bold text-gray-300 font-mono">{budget}{bankWithdraw > 0 ? `+${bankWithdraw}` : ''}</p>
          </div>
          <div className="text-gray-700">-</div>
          <div>
            <p className="text-xs text-gray-500">{t('provision.provisionsLabel')}</p>
            <p className="text-xl font-bold text-yellow-400 font-mono">{totalProvisionCost}</p>
          </div>
          <div className="text-gray-700">=</div>
          <div>
            <p className="text-xs text-gray-500">{t('provision.creditsLabel')}</p>
            <p className={`text-xl font-bold font-mono ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
              {remainingCredits}
            </p>
          </div>
        </div>

        {tab === 'provisions' ? (
          <>
            {/* Bank withdraw */}
            {bankBalance > 0 && (
              <div className="bg-gray-900/50 border border-yellow-800/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-400">{tt('provision.creditBank')}</span>
                  <span className="text-sm text-gray-400 font-mono">{tt('provision.available', { amount: bankBalance })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{tt('provision.withdraw')}</span>
                  <input
                    type="range"
                    min={0}
                    max={bankBalance}
                    step={5}
                    value={bankWithdraw}
                    onChange={(e) => handleWithdrawChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-yellow-400 w-12 text-right">{bankWithdraw}</span>
                </div>
              </div>
            )}

            {/* Fuel/Supplies sliders */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
              <ProvisionSlider label={t('status.fuel')} value={fuel} min={baseFuel} max={maxFuel} baseline={baseFuel} costPerUnit={PROVISIONING.fuelCostPerUnit} color="#f59e0b" onChange={setFuel} />
              <ProvisionSlider label={t('status.supplies')} value={supplies} min={baseSupplies} max={maxSupplies} baseline={baseSupplies} costPerUnit={PROVISIONING.suppliesCostPerUnit} color="#10b981" onChange={setSupplies} />
            </div>

            <div className="text-xs text-gray-600 text-center space-y-1">
              <p>{t('provision.baseAllocation', { fuel: baseFuel, supplies: baseSupplies })}</p>
            </div>
          </>
        ) : tab === 'loadout' ? (
          <>
            {/* Loadout: Vault + Stash */}
            <div className="space-y-4">
              {/* Selected items to bring */}
              {(selectedEquipment.length > 0 || selectedConsumables.length > 0) && (
                <div className="bg-gray-900/50 border border-green-800/30 rounded-lg p-4">
                  <h4 className="text-xs text-green-400 uppercase tracking-wider mb-2">{tt('provision.bringingOnMission')}</h4>
                  <div className="space-y-1">
                    {selectedEquipment.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span style={{ color: RARITY_CONFIG[item.rarity]?.color }}>{item.name}</span>
                        <button onClick={() => returnToVault(item.id)} className="text-gray-500 hover:text-red-400">{tt('provision.return')}</button>
                      </div>
                    ))}
                    {selectedConsumables.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400">{item.name}</span>
                        <button onClick={() => returnToStash(item.id)} className="text-gray-500 hover:text-red-400">{tt('provision.return')}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment vault */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{tt('provision.equipmentVault')} ({vault.length})</h4>
                {vault.length === 0 ? (
                  <p className="text-xs text-gray-700 italic">{tt('provision.vaultEmpty')}</p>
                ) : (
                  <div className="space-y-2">
                    {vault.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs bg-gray-800/50 rounded p-2">
                        <div className="min-w-0">
                          <span style={{ color: RARITY_CONFIG[item.rarity]?.color }}>{item.name}</span>
                          <span className="text-gray-600 ml-1">[{item.slot}]</span>
                          <p className="text-gray-600 truncate">{item.effect}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => takeFromVault(item.id)} className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors">{tt('provision.take')}</button>
                          <button onClick={() => sellVaultItem(item.id)} className="px-2 py-0.5 rounded bg-green-900/40 border border-green-800/50 text-green-400 hover:bg-green-800/40 transition-colors">{tt('provision.sell')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consumable stash */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{tt('provision.consumableStash')} ({stash.length})</h4>
                {stash.length === 0 ? (
                  <p className="text-xs text-gray-700 italic">{tt('provision.stashEmpty')}</p>
                ) : (
                  <div className="space-y-2">
                    {stash.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 text-xs bg-gray-800/50 rounded p-2">
                        <div className="min-w-0">
                          <span className={item.resolution === 'instant' ? 'text-cyan-400' : 'text-amber-400'}>{item.name}</span>
                          <span className="text-gray-600 ml-1">[{item.type}]</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => takeFromStash(item.id)} className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors">{tt('provision.take')}</button>
                          <button onClick={() => sellStashItem(item.id)} className="px-2 py-0.5 rounded bg-green-900/40 border border-green-800/50 text-green-400 hover:bg-green-800/40 transition-colors">{tt('provision.sell')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : tab === 'research' ? (
          <>
            <div className="space-y-4">
              <div className="bg-gray-900/50 border border-cyan-800/30 rounded-lg p-4 text-center">
                <p className="text-sm text-cyan-400">Research Bank</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono">{researchBalance} RP</p>
                <p className="text-xs text-gray-500 mt-1">Spend RP to develop prototype equipment for this mission</p>
              </div>

              <div className="grid gap-3">
                {RESEARCH_TIERS.map((tier) => {
                  const canAfford = researchBalance >= tier.cost
                  return (
                    <button
                      key={tier.cost}
                      onClick={() => handleResearchRoll(tier.cost)}
                      disabled={!canAfford || rolling || !llmConfig}
                      className={`bg-gray-900/50 border rounded-lg p-4 text-left transition-colors ${
                        canAfford && !rolling
                          ? 'border-cyan-800/50 hover:border-cyan-500/50'
                          : 'border-gray-800 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-200">{tier.label}</h4>
                          <p className="text-xs text-gray-500">{tier.description}</p>
                          <p className="text-xs text-gray-600 mt-1">Rarity: {tier.rarityPool}</p>
                        </div>
                        <span className="text-cyan-400 font-mono font-bold shrink-0 ml-3">{tier.cost} RP</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {rolling && (
                <p className="text-sm text-cyan-400 text-center animate-pulse">Developing prototype...</p>
              )}

              {rollResult && !rolling && (
                <div className="bg-gray-900/50 border border-cyan-700/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-cyan-400 uppercase tracking-wider">Prototype Developed</p>
                  <p className="text-sm font-semibold" style={{ color: RARITY_CONFIG[rollResult.rarity]?.color }}>
                    {rollResult.name}
                  </p>
                  <p className="text-xs text-gray-500">[{rollResult.slot}] — {rollResult.effect}</p>
                  <p className="text-xs text-gray-600 italic">{rollResult.flavor}</p>
                  <p className="text-xs text-green-400">Added to mission loadout</p>
                </div>
              )}
            </div>
          </>
        ) : null}

        {overBudget && (
          <p className="text-red-400 text-sm text-center">{t('provision.overBudget')}</p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleLaunch}
            disabled={overBudget || starting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? t('provision.launching') : t('provision.launchMission')}
          </button>
          <button
            onClick={() => useGameStore.getState().setPhase('scenario_select')}
            disabled={starting}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors disabled:opacity-50"
          >
            {t('provision.back')}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

function ProvisionSlider({ label, value, min, max, baseline, costPerUnit, color, onChange }: {
  label: string; value: number; min: number; max: number; baseline: number; costPerUnit: number; color: string; onChange: (v: number) => void
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
          <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
          <span className="text-xs text-gray-600">/ {max}</span>
          {extraCost > 0 && <span className="text-xs text-yellow-400 font-mono">-{extraCost}cr</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 shrink-0">
          <button className={btnClass} onClick={() => adjust(-10)} disabled={value <= min}>-10</button>
          <button className={btnClass} onClick={() => adjust(-5)} disabled={value <= min}>-5</button>
          <button className={btnClass} onClick={() => adjust(-1)} disabled={value <= min}>-1</button>
        </div>
        <div className="relative flex-1">
          <div className="absolute top-0 h-2 border-r border-dashed border-gray-500 z-10" style={{ left: `${((baseline - min) / (max - min)) * 100}%` }} />
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button className={btnClass} onClick={() => adjust(1)} disabled={value >= max}>+1</button>
          <button className={btnClass} onClick={() => adjust(5)} disabled={value >= max}>+5</button>
          <button className={btnClass} onClick={() => adjust(10)} disabled={value >= max}>+10</button>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{t('provision.min', { value: min })}</span>
        <span>{t('provision.free', { value: baseline })}</span>
        <span>{t('provision.max', { value: max })}</span>
      </div>
    </div>
  )
}
