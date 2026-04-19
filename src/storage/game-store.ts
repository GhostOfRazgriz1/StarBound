import { create } from 'zustand'
import type { GamePhase, RunState, GameAction, SectorSummary, Scenario, ShipClassId, EquipmentSlot, SectorTurn } from '../types/game'
import type { Sector, SectorPreview, TraderItem } from '../types/encounters'
import type { FOArchetype, FOCrossRunMemory } from '../types/fo'
import type { Equipment } from '../types/equipment'
import { RARITY_CONFIG } from '../types/equipment'
import type { Consumable } from '../types/consumable'
import { MAX_CONSUMABLES, CONSUMABLE_SELL_VALUES } from '../types/consumable'
import type { LLMConfig } from '../types/llm'
import { createShipFromClass, createCustomShip, SHIP_CLASSES } from '../types/game'
import { FO_ARCHETYPES } from '../types/fo'
import { getCustomShipStats } from './session'
import { createDefaultCaptainProfile } from '../types/fo'
import { TOTAL_SECTORS } from '../config'
import { loadStandingOrders, loadLanguage, saveActiveRun, loadActiveRun, clearActiveRun } from './cross-run'

interface GameStore {
  // Top-level state
  phase: GamePhase
  playerName: string
  language: string
  llmConfig: LLMConfig | null
  run: RunState | null
  foMemory: FOCrossRunMemory | null
  loading: boolean
  error: string | null

  // Token tracking for current run
  totalTokensUsed: { input: number; output: number }

  // Trade UI state
  showTrade: boolean
  tradeStock: TraderItem[]
  traderName: string

  // Black Market UI state
  showBlackMarket: boolean

  // Streaming narration
  streamingText: string
  setStreamingText: (text: string) => void
  appendStreamingText: (chunk: string) => void

  // Captain analysis (generated at run end)
  captainAnalysis: Record<string, unknown> | null
  setCaptainAnalysis: (analysis: Record<string, unknown>) => void

  // Actions
  setPhase: (phase: GamePhase) => void
  setLLMConfig: (config: LLMConfig) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFOMemory: (memory: FOCrossRunMemory) => void

  // Run lifecycle
  startRun: (scenario: Scenario, foArchetype: FOArchetype, shipClassId: ShipClassId, encounterDepth: 'standard' | 'deep') => void
  endRun: () => void

  // Sector management
  setSectorOptions: (options: SectorPreview[]) => void
  enterSector: (sector: Sector) => void
  departsector: (summary: string) => void

  // Action management
  setAvailableActions: (actions: GameAction[]) => void
  appendNarration: (entry: string) => void
  appendSectorTurn: (turn: SectorTurn) => void
  addTokensUsed: (tokens: { input: number; output: number }) => void

  // Ship state
  applyStateChanges: (changes: Record<string, number | undefined>) => void
  equipItem: (item: Equipment) => void
  addToCargo: (item: Equipment) => void
  equipFromCargo: (itemId: string) => void
  dropFromCargo: (itemId: string) => void

  // Trade
  openTrade: (traderName: string, stock: TraderItem[]) => void
  closeTrade: () => void
  buyItem: (index: number) => void
  sellFromCargo: (itemId: string) => void

  // Black Market
  openBlackMarket: () => void
  closeBlackMarket: () => void
  blackMarketBuyFuel: (amount: number) => void
  blackMarketBuySupplies: (amount: number) => void
  blackMarketSellCargo: (itemId: string) => void
  blackMarketSellConsumable: (consumableId: string) => void

  // Consumables
  addConsumable: (consumable: Consumable) => boolean
  removeConsumable: (consumableId: string) => void
  useConsumable: (consumableId: string) => Consumable | null
  sellConsumable: (consumableId: string) => void

  // Story arc
  advanceArc: () => void
  setArcMotivation: (motivation: string) => void
  setArcTarget: (target: string) => void

  // Captain's log
  updateCaptainsLog: (log: string) => void
  updateStandingOrders: (orders: string) => void

  // Captain profile
  trackDecision: (traits: Partial<Record<'riskAppetite' | 'diplomatic' | 'followsFOAdvice' | 'crewPriority' | 'curiosity', boolean>>) => void

  // Save/restore
  restoreRun: () => boolean
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'setup',
  playerName: '',
  language: loadLanguage(),
  llmConfig: null,
  run: null,
  foMemory: null,
  loading: false,
  error: null,
  totalTokensUsed: { input: 0, output: 0 },
  showTrade: false,
  tradeStock: [],
  traderName: '',
  showBlackMarket: false,
  streamingText: '',
  captainAnalysis: null,

  setStreamingText: (text) => set({ streamingText: text }),
  appendStreamingText: (chunk) => set((state) => ({ streamingText: state.streamingText + chunk })),
  setCaptainAnalysis: (analysis) => set({ captainAnalysis: analysis }),

  setPhase: (phase) => set({ phase }),
  setLLMConfig: (config) => set({ llmConfig: config }),
  setLoading: (loading) => set({ loading, ...(loading ? {} : { streamingText: '' }) }),
  setError: (error) => set({ error }),
  setFOMemory: (memory) => set({ foMemory: memory }),

  startRun: (scenario, foArchetype, shipClassId, encounterDepth) => {
    let ship
    if (shipClassId === 'custom') {
      const customStats = getCustomShipStats()
      if (!customStats) throw new Error('No custom ship stats set')
      ship = createCustomShip(customStats, scenario.provisioningBudget)
    } else {
      const shipClass = SHIP_CLASSES[shipClassId]
      ship = createShipFromClass(shipClass, scenario.provisioningBudget)
    }

    const run: RunState = {
      id: crypto.randomUUID(),
      scenario: scenario.id,
      foArchetype,
      ship,
      storyArc: { ...scenario.arcTemplate, encountersSeen: 0 },
      sectorMap: [],
      currentSector: null,
      sectorOptions: [],
      currentSectorNumber: 1,
      totalSectors: TOTAL_SECTORS,
      captainProfile: createDefaultCaptainProfile(),
      captainsLog: '',
      standingOrders: loadStandingOrders(),
      sectorHistory: [],
      sectorTurns: [],
      beaconHint: null,
      availableActions: [],
      phase: 'sector_select',
      encounterDepth,
    }

    set({ run, phase: 'run_active', totalTokensUsed: { input: 0, output: 0 }, error: null })
  },

  endRun: () => {
    set({ phase: 'run_end' })
  },

  setSectorOptions: (options) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, sectorOptions: options, phase: 'sector_select' } })
  },

  enterSector: (sector) => {
    const run = get().run
    if (!run) return
    set({
      run: {
        ...run,
        currentSector: sector,
        sectorHistory: [],
        sectorTurns: [],
        phase: 'sector_active',
      },
    })
  },

  departsector: (summary) => {
    const run = get().run
    if (!run || !run.currentSector) return

    const sectorSummary: SectorSummary = {
      sectorNumber: run.currentSectorNumber,
      type: run.currentSector.encounterType,
      summary,
      retreated: false,
    }

    const nextSectorNumber = run.currentSectorNumber + 1
    const isLastSector = nextSectorNumber > run.totalSectors

    set({
      run: {
        ...run,
        sectorMap: [...run.sectorMap, sectorSummary],
        currentSector: null,
        sectorHistory: [],
        sectorTurns: [],
        currentSectorNumber: nextSectorNumber,
        availableActions: [],
        phase: 'sector_select',
      },
      phase: isLastSector ? 'run_end' : 'run_active',
    })
  },

  setAvailableActions: (actions) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, availableActions: actions } })
  },

  appendNarration: (entry) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, sectorHistory: [...run.sectorHistory, entry] } })
  },

  appendSectorTurn: (turn) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, sectorTurns: [...run.sectorTurns, turn] } })
  },

  addTokensUsed: (tokens) => {
    const prev = get().totalTokensUsed
    set({
      totalTokensUsed: {
        input: prev.input + tokens.input,
        output: prev.output + tokens.output,
      },
    })
  },

  applyStateChanges: (changes) => {
    const run = get().run
    if (!run) return

    const ship = { ...run.ship }
    if (changes.hull !== undefined) ship.hull = Math.max(0, Math.min(ship.maxHull, ship.hull + changes.hull))
    if (changes.fuel !== undefined) ship.fuel = Math.max(0, Math.min(ship.maxFuel, ship.fuel + changes.fuel))
    if (changes.supplies !== undefined) ship.supplies = Math.max(0, Math.min(ship.maxSupplies, ship.supplies + changes.supplies))
    if (changes.credits !== undefined) ship.credits = Math.max(0, ship.credits + changes.credits)
    if (changes.morale !== undefined) ship.morale = Math.max(0, Math.min(100, ship.morale + changes.morale))
    if (changes.research !== undefined) ship.research = Math.max(0, ship.research + changes.research)

    set({ run: { ...run, ship } })
  },

  equipItem: (item) => {
    const run = get().run
    if (!run) return

    const equipment = { ...run.ship.equipment }
    const cargo = [...run.ship.cargo]
    let targetSlot = item.slot

    // Module queue: find first empty slot, or rotate (oldest out, new in at end)
    if (targetSlot === 'module_1' || targetSlot === 'module_2' || targetSlot === 'module_3') {
      if (!equipment.module_1) {
        targetSlot = 'module_1'
      } else if (!equipment.module_2) {
        targetSlot = 'module_2'
      } else if (!equipment.module_3) {
        targetSlot = 'module_3'
      } else {
        // All full — queue rotation: oldest (module_1) goes to cargo, shift down, new goes to module_3
        if (equipment.module_1) cargo.push(equipment.module_1)
        equipment.module_1 = equipment.module_2
        equipment.module_2 = equipment.module_3
        equipment.module_3 = { ...item, slot: 'module_3' as EquipmentSlot }

        const note = `[Module queue full — oldest module removed, ${item.name} installed]`
        const sectorHistory = [...run.sectorHistory, note]
        set({ run: { ...run, ship: { ...run.ship, equipment, cargo }, sectorHistory } })
        return
      }
    }

    const oldItem = equipment[targetSlot]
    equipment[targetSlot] = { ...item, slot: targetSlot }

    if (oldItem) {
      cargo.push(oldItem)
    }

    set({ run: { ...run, ship: { ...run.ship, equipment, cargo } } })
  },

  addToCargo: (item) => {
    const run = get().run
    if (!run) return
    const cargo = [...run.ship.cargo, item]
    set({ run: { ...run, ship: { ...run.ship, cargo } } })
  },

  equipFromCargo: (itemId) => {
    const run = get().run
    if (!run) return

    const item = run.ship.cargo.find((i) => i.id === itemId)
    if (!item) return

    // Use equipItem which handles module queue rotation
    // First remove from cargo, then equip
    const cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    set({ run: { ...run, ship: { ...run.ship, cargo } } })
    get().equipItem(item)

    const note = `[Equipped ${item.name} in ${item.slot} slot]`
    const updatedRun = get().run
    if (updatedRun) {
      set({ run: { ...updatedRun, sectorHistory: [...updatedRun.sectorHistory, note] } })
    }
  },

  dropFromCargo: (itemId) => {
    const run = get().run
    if (!run) return
    const item = run.ship.cargo.find((i) => i.id === itemId)
    const cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    const sectorHistory = item
      ? [...run.sectorHistory, `[Dropped ${item.name} from cargo]`]
      : run.sectorHistory
    set({ run: { ...run, ship: { ...run.ship, cargo }, sectorHistory } })
  },

  openTrade: (traderName, stock) => {
    set({ showTrade: true, traderName, tradeStock: stock })
  },

  closeTrade: () => {
    set({ showTrade: false, tradeStock: [], traderName: '' })
  },

  buyItem: (index) => {
    const run = get().run
    const stock = get().tradeStock
    const traderName = get().traderName
    if (!run || index >= stock.length) return

    const item = stock[index]
    if (run.ship.credits < item.price) return

    const fo = FO_ARCHETYPES[run.foArchetype]
    const ship = { ...run.ship, credits: run.ship.credits - item.price }
    let narration = ''
    let foComment = ''

    if (item.type === 'fuel') {
      const restoreAmount = item.amount ?? 20
      if (ship.fuel >= ship.maxFuel) {
        // Tank is full — refund and skip
        ship.credits += item.price
        narration = `Your fuel tanks are already full. ${traderName} shrugs and takes the canister back.`
        foComment = `We don't have room for more fuel, Captain.`
        const sectorHistory = [...run.sectorHistory, `${narration}\n\nFO: "${foComment}"`]
        set({ run: { ...run, ship, sectorHistory } })
        return
      }
      const added = Math.min(restoreAmount, ship.maxFuel - ship.fuel)
      ship.fuel = Math.min(ship.maxFuel, ship.fuel + restoreAmount)
      narration = `You purchase ${item.name} from ${traderName}. +${added} fuel, -${item.price} credits.`
      foComment = added < restoreAmount
        ? `Tanks are nearly full — we only took on ${added} units. But better safe than stranded.`
        : `Fuel reserves looking healthier. Good call.`
    } else if (item.type === 'supplies') {
      const restoreAmount = item.amount ?? 20
      if (ship.supplies >= ship.maxSupplies) {
        ship.credits += item.price
        narration = `Supply bays are already full. ${traderName} keeps the goods.`
        foComment = `No room for more supplies, Captain.`
        const sectorHistory = [...run.sectorHistory, `${narration}\n\nFO: "${foComment}"`]
        set({ run: { ...run, ship, sectorHistory } })
        return
      }
      const added = Math.min(restoreAmount, ship.maxSupplies - ship.supplies)
      ship.supplies = Math.min(ship.maxSupplies, ship.supplies + restoreAmount)
      narration = `You load ${item.name} from ${traderName}. +${added} supplies, -${item.price} credits.`
      foComment = added < restoreAmount
        ? `Stores are almost full — only took on ${added} units.`
        : `We needed that. Stores were getting thin.`
    } else if (item.type === 'equipment' && item.equipment) {
      const eq: Equipment = {
        id: crypto.randomUUID(),
        name: item.equipment.name,
        slot: item.equipment.slot,
        rarity: item.equipment.rarity,
        origin: item.equipment.origin,
        effect: item.equipment.effect,
        flavor: item.equipment.flavor,
      }
      ship.cargo = [...ship.cargo, eq]
      narration = `You purchase ${eq.name} from ${traderName} for ${item.price} credits. The equipment is stowed in your cargo hold.`
      if (fo.expertise === 'technology') {
        foComment = `Interesting piece of tech. ${eq.effect}. I'd recommend we install it when there's a quiet moment.`
      } else if (fo.priority === 'crew_safety') {
        foComment = `If that keeps us alive out here, it's worth every credit.`
      } else {
        foComment = `New gear for the cargo hold. We can equip it whenever you're ready, Captain.`
      }
    } else if (item.type === 'consumable' && item.consumable) {
      const consumables = ship.consumables || []
      if (consumables.length >= MAX_CONSUMABLES) {
        ship.credits += item.price
        narration = `Your consumable storage is full. ${traderName} puts the item back.`
        foComment = `No room for more consumables, Captain. We'd have to use or drop something first.`
        const sectorHistory = [...run.sectorHistory, `${narration}\n\nFO: "${foComment}"`]
        set({ run: { ...run, ship, sectorHistory } })
        return
      }
      const consumable: Consumable = {
        id: crypto.randomUUID(),
        name: item.consumable.name,
        type: item.consumable.type,
        effect: item.consumable.effect,
        resolution: item.consumable.resolution,
        magnitude: item.consumable.magnitude,
        uses: item.consumable.uses,
      }
      ship.consumables = [...consumables, consumable]
      narration = `You purchase ${consumable.name} from ${traderName} for ${item.price} credits.`
      foComment = consumable.resolution === 'triggered'
        ? `Interesting find. Hard to say what that'll do until we use it.`
        : `Good to have on hand. ${consumable.effect}.`
    } else if (item.type === 'info') {
      narration = `You pay ${traderName} ${item.price} credits for information.\n\n"${item.effect}"`
      // Connect to any trader rumor for extra context
      const encounter = run.currentSector?.encounter
      const rumor = encounter?.type === 'trader' ? encounter.rumor : ''
      if (rumor && rumor !== item.effect) {
        narration += `\n\n${traderName} leans in closer: "${rumor}"`
      }
      if (fo.priority === 'discovery') {
        foComment = `Fascinating. This could change our approach to the next few sectors entirely.`
      } else if (fo.expertise === 'tactics') {
        foComment = `Good intel. Let me cross-reference this with what we already know.`
      } else {
        foComment = `Worth knowing. I'll factor this into our planning.`
      }
    }

    // Append narration
    const sectorHistory = [...run.sectorHistory]
    if (narration) {
      sectorHistory.push(`${narration}\n\nFO: "${foComment}"`)
    }

    // Remove from stock
    const newStock = stock.filter((_, i) => i !== index)

    set({ run: { ...run, ship, sectorHistory }, tradeStock: newStock })
  },

  sellFromCargo: (itemId) => {
    const run = get().run
    if (!run) return

    const item = run.ship.cargo.find((i) => i.id === itemId)
    if (!item) return

    const fo = FO_ARCHETYPES[run.foArchetype]
    const sellValue = RARITY_CONFIG[item.rarity]?.sellValue ?? 10

    const cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    const credits = run.ship.credits + sellValue

    let foComment: string
    if (item.rarity === 'rare' || item.rarity === 'legendary') {
      foComment = fo.temperament < 0.4
        ? `Are you sure about parting with that, Captain? We may not find another.`
        : `Bold move. Credits in hand are worth more than gear in the hold, I suppose.`
    } else {
      foComment = `${sellValue} credits for ${item.name}. Fair enough.`
    }

    const sectorHistory = [...run.sectorHistory,
      `You sell ${item.name} to the trader for ${sellValue} credits.\n\nFO: "${foComment}"`
    ]

    set({ run: { ...run, ship: { ...run.ship, cargo, credits }, sectorHistory } })
  },

  addConsumable: (consumable) => {
    const run = get().run
    if (!run) return false
    const consumables = run.ship.consumables || []
    if (consumables.length >= MAX_CONSUMABLES) return false
    set({ run: { ...run, ship: { ...run.ship, consumables: [...consumables, consumable] } } })
    return true
  },

  removeConsumable: (consumableId) => {
    const run = get().run
    if (!run) return
    const consumables = (run.ship.consumables || []).filter((c) => c.id !== consumableId)
    set({ run: { ...run, ship: { ...run.ship, consumables } } })
  },

  useConsumable: (consumableId) => {
    const run = get().run
    if (!run) return null
    const consumables = run.ship.consumables || []
    const item = consumables.find((c) => c.id === consumableId)
    if (!item || item.uses <= 0) return null
    const remaining = item.uses - 1
    const newConsumables = remaining <= 0
      ? consumables.filter((c) => c.id !== consumableId)
      : consumables.map((c) => c.id === consumableId ? { ...c, uses: remaining } : c)
    set({ run: { ...run, ship: { ...run.ship, consumables: newConsumables } } })
    return item
  },

  sellConsumable: (consumableId) => {
    const run = get().run
    if (!run) return
    const consumables = run.ship.consumables || []
    const item = consumables.find((c) => c.id === consumableId)
    if (!item) return
    const sellValue = CONSUMABLE_SELL_VALUES[item.resolution]
    const newConsumables = consumables.filter((c) => c.id !== consumableId)
    const credits = run.ship.credits + sellValue
    const foComment = item.resolution === 'triggered'
      ? `We never did find out what that does. ${sellValue} credits is ${sellValue} credits.`
      : `${sellValue} credits for ${item.name}. Reasonable.`
    const sectorHistory = [...run.sectorHistory,
      `You sell ${item.name} to the trader for ${sellValue} credits.\n\nFO: "${foComment}"`
    ]
    set({ run: { ...run, ship: { ...run.ship, consumables: newConsumables, credits }, sectorHistory } })
  },

  // Black Market
  openBlackMarket: () => set({ showBlackMarket: true }),
  closeBlackMarket: () => set({ showBlackMarket: false }),

  blackMarketBuyFuel: (amount) => {
    const run = get().run
    if (!run) return
    const cost = amount * 3  // premium price: 3cr per unit
    if (run.ship.credits < cost) return
    if (run.ship.fuel >= run.ship.maxFuel) return
    const added = Math.min(amount, run.ship.maxFuel - run.ship.fuel)
    const actualCost = added * 3
    const ship = { ...run.ship, fuel: run.ship.fuel + added, credits: run.ship.credits - actualCost }
    const sectorHistory = [...run.sectorHistory,
      `You purchase ${added} units of fuel on the black market for ${actualCost} credits. The price stings, but fuel is fuel.`
    ]
    set({ run: { ...run, ship, sectorHistory } })
  },

  blackMarketBuySupplies: (amount) => {
    const run = get().run
    if (!run) return
    const cost = amount * 3
    if (run.ship.credits < cost) return
    if (run.ship.supplies >= run.ship.maxSupplies) return
    const added = Math.min(amount, run.ship.maxSupplies - run.ship.supplies)
    const actualCost = added * 3
    const ship = { ...run.ship, supplies: run.ship.supplies + added, credits: run.ship.credits - actualCost }
    const sectorHistory = [...run.sectorHistory,
      `You acquire ${added} units of supplies through back channels for ${actualCost} credits. No questions asked.`
    ]
    set({ run: { ...run, ship, sectorHistory } })
  },

  blackMarketSellCargo: (itemId) => {
    const run = get().run
    if (!run) return
    const item = run.ship.cargo.find((i) => i.id === itemId)
    if (!item) return
    const normalValue = RARITY_CONFIG[item.rarity]?.sellValue ?? 10
    const sellValue = Math.floor(normalValue * 0.6)
    const cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    const credits = run.ship.credits + sellValue
    const sectorHistory = [...run.sectorHistory,
      `You offload ${item.name} on the black market for ${sellValue} credits. Not great, but no haggling.`
    ]
    set({ run: { ...run, ship: { ...run.ship, cargo, credits }, sectorHistory } })
  },

  blackMarketSellConsumable: (consumableId) => {
    const run = get().run
    if (!run) return
    const consumables = run.ship.consumables || []
    const item = consumables.find((c) => c.id === consumableId)
    if (!item) return
    const normalValue = CONSUMABLE_SELL_VALUES[item.resolution]
    const sellValue = Math.floor(normalValue * 0.6)
    const newConsumables = consumables.filter((c) => c.id !== consumableId)
    const credits = run.ship.credits + sellValue
    const sectorHistory = [...run.sectorHistory,
      `You fence ${item.name} on the black market for ${sellValue} credits. The buyer doesn't ask where it came from.`
    ]
    set({ run: { ...run, ship: { ...run.ship, consumables: newConsumables, credits }, sectorHistory } })
  },

  advanceArc: () => {
    const run = get().run
    if (!run || run.storyArc.stage >= 5) return

    const nextStage = (run.storyArc.stage + 1) as 1 | 2 | 3 | 4 | 5
    set({ run: { ...run, storyArc: { ...run.storyArc, stage: nextStage } } })
  },

  setArcMotivation: (motivation) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, storyArc: { ...run.storyArc, motivation } } })
  },

  setArcTarget: (target) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, storyArc: { ...run.storyArc, target } } })
  },

  updateCaptainsLog: (log) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, captainsLog: log } })
  },

  updateStandingOrders: (orders) => {
    const run = get().run
    if (!run) return
    set({ run: { ...run, standingOrders: orders } })
  },

  trackDecision: (traits) => {
    const run = get().run
    if (!run) return

    const profile = { ...run.captainProfile }
    const n = profile.decisionsTracked + 1
    const weight = 1 / n  // diminishing weight for new observations

    for (const [key, value] of Object.entries(traits)) {
      if (value === undefined) continue
      const k = key as keyof typeof traits
      const current = profile[k] as number
      profile[k] = current + weight * ((value ? 1 : 0) - current)
    }
    profile.decisionsTracked = n

    set({ run: { ...run, captainProfile: profile } })
  },

  restoreRun: () => {
    const saved = loadActiveRun()
    if (!saved || !saved.run) return false

    // Restore LLM config from localStorage
    const llmConfig = ((): GameStore['llmConfig'] => {
      try {
        const raw = localStorage.getItem('starbound_llm_config')
        return raw ? JSON.parse(raw) : null
      } catch { return null }
    })()

    // Restore player name
    const playerName = (() => {
      try {
        const raw = localStorage.getItem('starbound_player_name')
        return raw ? JSON.parse(raw) : ''
      } catch { return '' }
    })()

    const restoredRun = saved.run as GameStore['run']
    set({
      run: restoredRun ? { ...restoredRun, sectorTurns: [], beaconHint: restoredRun.beaconHint ?? null } : null,
      foMemory: saved.foMemory as GameStore['foMemory'],
      totalTokensUsed: (saved.tokensUsed as GameStore['totalTokensUsed']) ?? { input: 0, output: 0 },
      llmConfig,
      playerName,
      language: loadLanguage(),
      phase: 'run_active' as GamePhase,
    })
    return true
  },
}))

// Auto-save: debounced to avoid excessive writes during streaming
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

function flushSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = null
  const s = useGameStore.getState()
  if (s.run && s.phase === 'run_active') {
    // Strip sectorTurns from save — raw LLM responses are large and only needed for active session
    const runToSave = { ...s.run, sectorTurns: [] }
    saveActiveRun(runToSave, s.foMemory, s.totalTokensUsed)
  }
}

useGameStore.subscribe((state) => {
  if (state.phase === 'run_end' || state.phase === 'setup') {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    clearActiveRun()
    return
  }
  if (state.run && state.phase === 'run_active') {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(flushSave, 2000)
  }
})

// Flush save immediately when tab is closing
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushSave)
}
