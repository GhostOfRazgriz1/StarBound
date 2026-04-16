import type { Sector, SectorPreview } from './encounters'
import type { Equipment } from './equipment'
import type { Consumable } from './consumable'
import type { FOArchetype, CaptainProfile } from './fo'

/** Top-level game phases */
export type GamePhase =
  | 'setup'
  | 'fo_select'
  | 'ship_select'
  | 'ship_custom'
  | 'scenario_select'
  | 'provisioning'
  | 'run_active'
  | 'run_end'
  | 'meta'

/** Sub-phases within an active run */
export type RunPhase =
  | 'sector_select'
  | 'sector_active'
  | 'combat'
  | 'sector_depart'

export interface Ship {
  hull: number       // 0-100
  maxHull: number
  fuel: number       // 0-100
  maxFuel: number
  supplies: number   // 0-100
  maxSupplies: number
  credits: number
  morale: number     // 0-100
  equipment: ShipEquipment
  cargo: Equipment[] // unequipped items
  consumables: Consumable[]
}

export interface ShipEquipment {
  weapons: Equipment | null
  shields: Equipment | null
  engine: Equipment | null
  module_1: Equipment | null
  module_2: Equipment | null
  module_3: Equipment | null
}

export type EquipmentSlot = keyof ShipEquipment

export interface StoryArc {
  stage: 1 | 2 | 3 | 4 | 5
  antagonist: string
  motivation: string | null   // revealed at stage 3
  target: string | null       // revealed at stage 4
  encountersSeen: number
}

export interface SectorSummary {
  sectorNumber: number
  type: string
  summary: string
  retreated: boolean
}

export interface RunState {
  id: string
  scenario: ScenarioId
  foArchetype: FOArchetype
  ship: Ship
  storyArc: StoryArc
  sectorMap: SectorSummary[]
  currentSector: Sector | null
  sectorOptions: SectorPreview[]
  currentSectorNumber: number
  totalSectors: number
  captainProfile: CaptainProfile
  captainsLog: string         // per-run notes
  standingOrders: string      // persists across runs
  sectorHistory: string[]     // narration entries for current sector
  availableActions: GameAction[]
  phase: RunPhase
  encounterDepth: 'standard' | 'deep'
  turnCount: number
}

export interface GameAction {
  id: string
  label: string
  description: string
  type: 'explore' | 'combat' | 'dialogue' | 'trade' | 'navigate' | 'retreat' | 'special'
}

export type ScenarioId =
  | 'deep_space_survey'
  | 'border_patrol'
  | 'first_contact'
  | 'distress_signal'

export interface Scenario {
  id: ScenarioId
  name: string
  description: string
  arcTemplate: Omit<StoryArc, 'encountersSeen'>
  encounterWeights: Record<string, number>
  provisioningBudget: number  // total credits for fuel + supplies + leftover spending money
}

export interface ProvisioningConfig {
  fuel: number       // how much fuel to load (0 to maxFuel)
  supplies: number   // how much supplies to load (0 to maxSupplies)
}

export const PROVISIONING = {
  fuelCostPerUnit: 1,
  suppliesCostPerUnit: 1,
  baselineFuelPct: 0.3,      // 30% comes free
  baselineSuppliesPct: 0.3,  // 30% comes free
} as const

export interface RunStats {
  sectorsExplored: number
  encountersSurvived: number
  retreats: number
  artifactsFound: number
  creditsEarned: number
  creditsSpent: number
  foAgreementRate: number
  combatEncounters: number
  combatsWon: number
  civilizationsContacted: number
}

export interface LifetimeStats {
  totalRuns: number
  totalSectors: number
  totalArtifacts: number
  longestRun: number
  favoriteFO: FOArchetype | null
  runHistory: RunEndSummary[]
}

export interface RunEndSummary {
  id: string
  scenario: ScenarioId
  fo: FOArchetype
  sectorsExplored: number
  survived: boolean
  stats: RunStats
  timestamp: number
}

export interface ShipUpgrade {
  id: string
  name: string
  description: string
  effect: string
  cost: number
  purchased: boolean
}

export type ShipClassId = 'explorer' | 'corvette' | 'freighter' | 'scout' | 'custom'

export interface CustomShipStats {
  maxHull: number
  maxFuel: number
  maxSupplies: number
}

export const CUSTOM_SHIP_BUDGET = 300  // total points across hull + fuel + supplies
export const CUSTOM_SHIP_MIN = 50     // minimum per stat
export const CUSTOM_SHIP_MAX = 200    // maximum per stat

export interface ShipClass {
  id: ShipClassId
  name: string
  description: string
  stats: {
    hull: number
    maxHull: number
    fuel: number
    maxFuel: number
    supplies: number
    maxSupplies: number
    morale: number
  }
  startingEquipment: Partial<ShipEquipment>
  strengths: string[]
  weaknesses: string[]
}

export const SHIP_CLASSES: Record<Exclude<ShipClassId, 'custom'>, ShipClass> = {
  explorer: {
    id: 'explorer',
    name: 'Atlas-Class Explorer',
    description: 'A balanced vessel built for deep space survey missions. No major weaknesses, no standout strengths — reliable in any situation.',
    stats: { hull: 100, maxHull: 100, fuel: 80, maxFuel: 100, supplies: 70, maxSupplies: 100, morale: 75 },
    startingEquipment: {},
    strengths: ['Balanced stats', 'Good fuel range', 'Solid hull'],
    weaknesses: ['No starting equipment', 'No specialization'],
  },
  corvette: {
    id: 'corvette',
    name: 'Talon-Class Corvette',
    description: 'A nimble warship with reinforced armor and military-grade weapons. Burns through fuel fast and carries minimal supplies.',
    stats: { hull: 130, maxHull: 130, fuel: 90, maxFuel: 90, supplies: 80, maxSupplies: 80, morale: 80 },
    startingEquipment: {
      weapons: {
        id: 'starting_weapons_corvette',
        name: 'Military-Grade Pulse Cannon',
        slot: 'weapons',
        rarity: 'uncommon',
        origin: 'Fleet armory standard issue',
        effect: 'Reliable damage output; enables aggressive combat tactics',
        flavor: 'Bore-sighted and battle-tested.',
      },
    },
    strengths: ['High hull', 'Starting weapons', 'High morale'],
    weaknesses: ['Low fuel capacity', 'Low supplies', 'Burns resources fast'],
  },
  freighter: {
    id: 'freighter',
    name: 'Oxbow-Class Freighter',
    description: 'A converted cargo hauler with massive supply bays and extra fuel tanks. Slow and lightly armed, but you can carry everything you find.',
    stats: { hull: 80, maxHull: 80, fuel: 110, maxFuel: 110, supplies: 110, maxSupplies: 110, morale: 70 },
    startingEquipment: {
      module_1: {
        id: 'starting_module_freighter',
        name: 'Expanded Cargo Module',
        slot: 'module_1',
        rarity: 'common',
        origin: 'Aftermarket modification',
        effect: 'Trade prices are more favorable; can carry extra salvage',
        flavor: 'Bolted on where the escape pods used to be.',
      },
    },
    strengths: ['Huge fuel/supply capacity', 'Trading advantage', 'Long range'],
    weaknesses: ['Weak hull', 'No combat equipment', 'Sluggish'],
  },
  scout: {
    id: 'scout',
    name: 'Whisper-Class Scout',
    description: 'A fast, stealthy reconnaissance ship with advanced sensors. Fragile but hard to pin down — built for information, not confrontation.',
    stats: { hull: 75, maxHull: 75, fuel: 120, maxFuel: 120, supplies: 105, maxSupplies: 105, morale: 70 },
    startingEquipment: {
      engine: {
        id: 'starting_engine_scout',
        name: 'Silent-Running Drive',
        slot: 'engine',
        rarity: 'uncommon',
        origin: 'Intelligence division surplus',
        effect: 'Retreat costs less fuel; enables stealth approach options',
        flavor: 'Whisper-quiet. The name is literal.',
      },
    },
    strengths: ['Cheap retreats', 'Stealth options', 'Good fuel range'],
    weaknesses: ['Low hull', 'Poor in direct combat'],
  },
}

export function createShipFromClass(shipClass: ShipClass, startingCredits: number): Ship {
  return {
    ...shipClass.stats,
    credits: startingCredits,
    equipment: {
      weapons: shipClass.startingEquipment.weapons ?? null,
      shields: shipClass.startingEquipment.shields ?? null,
      engine: shipClass.startingEquipment.engine ?? null,
      module_1: shipClass.startingEquipment.module_1 ?? null,
      module_2: shipClass.startingEquipment.module_2 ?? null,
      module_3: shipClass.startingEquipment.module_3 ?? null,
    },
    cargo: [],
    consumables: [],
  }
}

export function createCustomShip(stats: CustomShipStats, startingCredits: number): Ship {
  return {
    hull: stats.maxHull,
    maxHull: stats.maxHull,
    fuel: stats.maxFuel,
    maxFuel: stats.maxFuel,
    supplies: stats.maxSupplies,
    maxSupplies: stats.maxSupplies,
    credits: startingCredits,
    morale: 75,
    equipment: {
      weapons: null,
      shields: null,
      engine: null,
      module_1: null,
      module_2: null,
      module_3: null,
    },
    cargo: [],
    consumables: [],
  }
}
