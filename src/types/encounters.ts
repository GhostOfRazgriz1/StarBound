import type { Equipment } from './equipment'

export type EncounterType =
  | 'civilization'
  | 'derelict'
  | 'anomaly'
  | 'pirate'
  | 'trader'
  | 'quiet'

/** Sector preview shown when choosing next destination */
export interface SectorPreview {
  id: string
  name: string
  description: string   // sensor readout
  riskLevel: number     // 1-5
  interestLevel: number // 1-5
  encounterType: EncounterType  // hidden from player, used for generation
}

/** Full sector data, generated when player enters */
export interface Sector {
  id: string
  name: string
  encounterType: EncounterType
  encounter: EncounterData
  visited: boolean
  summary: string | null  // set on departure
}

export type EncounterData =
  | CivilizationEncounter
  | DerelictEncounter
  | AnomalyEncounter
  | PirateEncounter
  | TraderEncounter
  | QuietEncounter

export interface CivilizationEncounter {
  type: 'civilization'
  name: string
  techLevel: number          // 1-5
  disposition: 'hostile' | 'wary' | 'neutral' | 'friendly' | 'desperate'
  cultureHook: string        // what makes them unique
  resource: string           // what they have to trade
  secret: string             // hidden info the FO can connect across sectors
  tradeWilling: boolean
}

export interface DerelictEncounter {
  type: 'derelict'
  origin: string             // who built/owned it
  age: string                // how long abandoned
  condition: string          // structural state
  hazard: string             // danger to boarding party
  loot: Equipment | null     // potential equipment find
  clue: string               // connects to story arc
}

export interface AnomalyEncounter {
  type: 'anomaly'
  phenomenon: string
  visual: string             // how it looks/feels
  risk: string               // what could go wrong
  reward: string             // what you gain from studying it
  scientificInterest: number // 1-5
}

export interface PirateEncounter {
  type: 'pirate'
  faction: string
  strength: number           // 1-5 relative to player
  ships: number
  demand: string             // what they want
  motivation: string         // why they're here
  negotiable: boolean
  connectedToArc: boolean
}

export interface TraderEncounter {
  type: 'trader'
  name: string
  stock: TraderItem[]
  personality: string
  rumor: string              // feeds story arc
}

export interface TraderItem {
  name: string
  type: 'equipment' | 'fuel' | 'supplies' | 'info'
  price: number
  effect: string
  amount?: number            // how much fuel/supplies this restores
  equipment?: Equipment      // if type is 'equipment'
}

export interface QuietEncounter {
  type: 'quiet'
  foReflection: string       // what the FO wants to discuss
}
