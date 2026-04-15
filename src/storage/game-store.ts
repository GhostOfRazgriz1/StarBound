import { create } from 'zustand'
import type { GamePhase, RunState, GameAction, SectorSummary, Scenario, ShipClassId } from '../types/game'
import type { Sector, SectorPreview, TraderItem } from '../types/encounters'
import type { FOArchetype, FOCrossRunMemory } from '../types/fo'
import type { Equipment } from '../types/equipment'
import { RARITY_CONFIG } from '../types/equipment'
import type { LLMConfig } from '../types/llm'
import { createShipFromClass, createCustomShip, SHIP_CLASSES } from '../types/game'
import { FO_ARCHETYPES } from '../types/fo'
import { getCustomShipStats } from './session'
import { createDefaultCaptainProfile } from '../types/fo'
import { TOTAL_SECTORS } from '../config'
import { loadStandingOrders, loadLanguage } from './cross-run'

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

  // Story arc
  advanceArc: () => void
  setArcMotivation: (motivation: string) => void
  setArcTarget: (target: string) => void

  // Captain's log
  updateCaptainsLog: (log: string) => void
  updateStandingOrders: (orders: string) => void

  // Captain profile
  trackDecision: (traits: Partial<Record<'riskAppetite' | 'diplomatic' | 'followsFOAdvice' | 'crewPriority' | 'curiosity', boolean>>) => void
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
  captainAnalysis: null,

  setCaptainAnalysis: (analysis) => set({ captainAnalysis: analysis }),

  setPhase: (phase) => set({ phase }),
  setLLMConfig: (config) => set({ llmConfig: config }),
  setLoading: (loading) => set({ loading }),
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
      availableActions: [],
      phase: 'sector_select',
      encounterDepth,
      turnCount: 0,
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

    set({ run: { ...run, ship } })
  },

  equipItem: (item) => {
    const run = get().run
    if (!run) return

    const equipment = { ...run.ship.equipment }
    const oldItem = equipment[item.slot]
    equipment[item.slot] = item

    // Old item goes to cargo
    const cargo = [...run.ship.cargo]
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

    const equipment = { ...run.ship.equipment }
    const oldItem = equipment[item.slot]

    equipment[item.slot] = item
    let cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    if (oldItem) {
      cargo = [...cargo, oldItem]
    }

    set({ run: { ...run, ship: { ...run.ship, equipment, cargo } } })
  },

  dropFromCargo: (itemId) => {
    const run = get().run
    if (!run) return
    const cargo = run.ship.cargo.filter((i) => i.id !== itemId)
    set({ run: { ...run, ship: { ...run.ship, cargo } } })
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
}))
