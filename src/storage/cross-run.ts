import type { FOArchetype, FOCrossRunMemory } from '../types/fo'
import type { ArtifactRecord } from '../types/equipment'
import type { LifetimeStats, RunEndSummary, ShipUpgrade } from '../types/game'
import type { LLMConfig } from '../types/llm'
import { createDefaultFOMemory } from '../types/fo'

const STORAGE_KEYS = {
  FO_MEMORIES: 'starbound_fo_memories',
  ARTIFACTS: 'starbound_artifacts',
  LIFETIME_STATS: 'starbound_lifetime_stats',
  SHIP_UPGRADES: 'starbound_ship_upgrades',
  STANDING_ORDERS: 'starbound_standing_orders',
  LLM_CONFIG: 'starbound_llm_config',
  PLAYER_NAME: 'starbound_player_name',
  LANGUAGE: 'starbound_language',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// FO Memories
export function loadFOMemory(archetype: FOArchetype): FOCrossRunMemory {
  const all = load<Record<string, FOCrossRunMemory>>(STORAGE_KEYS.FO_MEMORIES, {})
  return all[archetype] ?? createDefaultFOMemory(archetype)
}

export function saveFOMemory(memory: FOCrossRunMemory): void {
  const all = load<Record<string, FOCrossRunMemory>>(STORAGE_KEYS.FO_MEMORIES, {})
  all[memory.archetype] = memory
  save(STORAGE_KEYS.FO_MEMORIES, all)
}

// Artifacts
export function loadArtifacts(): ArtifactRecord[] {
  return load<ArtifactRecord[]>(STORAGE_KEYS.ARTIFACTS, [])
}

export function saveArtifact(artifact: ArtifactRecord): void {
  const all = loadArtifacts()
  all.push(artifact)
  save(STORAGE_KEYS.ARTIFACTS, all)
}

// Lifetime Stats
export function loadLifetimeStats(): LifetimeStats {
  return load<LifetimeStats>(STORAGE_KEYS.LIFETIME_STATS, {
    totalRuns: 0,
    totalSectors: 0,
    totalArtifacts: 0,
    longestRun: 0,
    favoriteFO: null,
    runHistory: [],
  })
}

export function saveRunToLifetimeStats(summary: RunEndSummary): void {
  const stats = loadLifetimeStats()
  stats.totalRuns++
  stats.totalSectors += summary.sectorsExplored
  stats.totalArtifacts += summary.stats.artifactsFound
  stats.longestRun = Math.max(stats.longestRun, summary.sectorsExplored)
  stats.runHistory.push(summary)

  // Compute favorite FO
  const foCounts: Record<string, number> = {}
  for (const run of stats.runHistory) {
    foCounts[run.fo] = (foCounts[run.fo] ?? 0) + 1
  }
  stats.favoriteFO = Object.entries(foCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as FOArchetype ?? null

  save(STORAGE_KEYS.LIFETIME_STATS, stats)
}

// Standing Orders
export function loadStandingOrders(): string {
  return load<string>(STORAGE_KEYS.STANDING_ORDERS, '')
}

export function saveStandingOrders(orders: string): void {
  save(STORAGE_KEYS.STANDING_ORDERS, orders)
}

// LLM Config
export function loadLLMConfig(): LLMConfig | null {
  return load<LLMConfig | null>(STORAGE_KEYS.LLM_CONFIG, null)
}

export function saveLLMConfig(config: LLMConfig): void {
  save(STORAGE_KEYS.LLM_CONFIG, config)
}

// Ship Upgrades
export function loadShipUpgrades(): ShipUpgrade[] {
  return load<ShipUpgrade[]>(STORAGE_KEYS.SHIP_UPGRADES, [])
}

export function saveShipUpgrades(upgrades: ShipUpgrade[]): void {
  save(STORAGE_KEYS.SHIP_UPGRADES, upgrades)
}

// Player Name
export function loadPlayerName(): string {
  return load<string>(STORAGE_KEYS.PLAYER_NAME, '')
}

export function savePlayerName(name: string): void {
  save(STORAGE_KEYS.PLAYER_NAME, name)
}

// Language
export function loadLanguage(): string {
  return load<string>(STORAGE_KEYS.LANGUAGE, 'en')
}

export function saveLanguage(language: string): void {
  save(STORAGE_KEYS.LANGUAGE, language)
}
