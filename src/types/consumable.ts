export type ConsumableType =
  | 'repair' | 'fuel' | 'shield' | 'decoy'
  | 'probe' | 'beacon' | 'data' | 'device' | 'diplomatic'

export type ConsumableResolution = 'instant' | 'triggered'

export interface Consumable {
  id: string
  name: string
  type: ConsumableType
  effect: string
  resolution: ConsumableResolution
  magnitude?: number
  uses: number
}

export const MAX_CONSUMABLES = 8

export const CONSUMABLE_RESOLUTION: Record<ConsumableType, ConsumableResolution> = {
  repair: 'instant', fuel: 'instant', shield: 'instant', decoy: 'instant',
  probe: 'triggered', beacon: 'triggered', data: 'triggered', device: 'triggered', diplomatic: 'triggered',
}

export const CONSUMABLE_SELL_VALUES: Record<ConsumableResolution, number> = {
  instant: 10,
  triggered: 25,
}
