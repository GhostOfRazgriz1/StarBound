import type { EquipmentSlot } from './game'

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: RarityTier
  origin: string          // where it came from (lore)
  effect: string          // what it does mechanically (injected into combat/action prompts)
  flavor: string          // flavor text
}

export interface ArtifactRecord {
  equipment: Equipment
  foundInRun: string      // run id
  foundInSector: number
  timestamp: number
}

export const RARITY_CONFIG: Record<RarityTier, { label: string; color: string; weight: number; sellValue: number }> = {
  common:    { label: 'Common',    color: '#9ca3af', weight: 50, sellValue: 15 },
  uncommon:  { label: 'Uncommon',  color: '#22d3ee', weight: 30, sellValue: 35 },
  rare:      { label: 'Rare',      color: '#a78bfa', weight: 15, sellValue: 75 },
  legendary: { label: 'Legendary', color: '#fbbf24', weight: 5,  sellValue: 150 },
}
