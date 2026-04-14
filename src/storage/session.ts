import type { FOArchetype } from '../types/fo'
import type { ShipClassId, CustomShipStats, ScenarioId } from '../types/game'

const FO_KEY = 'starbound_session_fo'
const SHIP_KEY = 'starbound_session_ship'
const CUSTOM_SHIP_KEY = 'starbound_session_custom_ship'
const SCENARIO_KEY = 'starbound_session_scenario'
const DEPTH_KEY = 'starbound_session_depth'

export function setSelectedFO(archetype: FOArchetype): void {
  sessionStorage.setItem(FO_KEY, archetype)
}

export function getSelectedFO(): FOArchetype | null {
  return sessionStorage.getItem(FO_KEY) as FOArchetype | null
}

export function setSelectedShip(shipClass: ShipClassId): void {
  sessionStorage.setItem(SHIP_KEY, shipClass)
}

export function getSelectedShip(): ShipClassId | null {
  return sessionStorage.getItem(SHIP_KEY) as ShipClassId | null
}

export function setCustomShipStats(stats: CustomShipStats): void {
  sessionStorage.setItem(CUSTOM_SHIP_KEY, JSON.stringify(stats))
}

export function getCustomShipStats(): CustomShipStats | null {
  const raw = sessionStorage.getItem(CUSTOM_SHIP_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setSelectedScenario(id: ScenarioId, depth: 'standard' | 'deep'): void {
  sessionStorage.setItem(SCENARIO_KEY, id)
  sessionStorage.setItem(DEPTH_KEY, depth)
}

export function getSelectedScenario(): { id: ScenarioId; depth: 'standard' | 'deep' } | null {
  const id = sessionStorage.getItem(SCENARIO_KEY) as ScenarioId | null
  const depth = (sessionStorage.getItem(DEPTH_KEY) ?? 'standard') as 'standard' | 'deep'
  if (!id) return null
  return { id, depth }
}
