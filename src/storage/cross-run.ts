import type { FOArchetype, FOCrossRunMemory } from '../types/fo'
import type { ArtifactRecord, Equipment } from '../types/equipment'
import type { Consumable } from '../types/consumable'
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
  ACTIVE_RUN: 'starbound_active_run',
  ACTIVE_RUN_META: 'starbound_active_run_meta',
  CREDIT_BANK: 'starbound_credit_bank',
  RESEARCH_BANK: 'starbound_research_bank',
  EQUIPMENT_VAULT: 'starbound_equipment_vault',
  CONSUMABLE_STASH: 'starbound_consumable_stash',
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
const SUPPORTED_LANGS = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt']

function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'
  const browserLang = navigator.language?.toLowerCase() ?? ''
  // Exact match first (e.g., 'zh', 'ja')
  const prefix = browserLang.split('-')[0]
  if (SUPPORTED_LANGS.includes(prefix)) return prefix
  return 'en'
}

export function loadLanguage(): string {
  const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
  if (saved) {
    try { return JSON.parse(saved) } catch { /* fall through */ }
  }
  // First visit — detect from browser
  return detectBrowserLanguage()
}

export function saveLanguage(language: string): void {
  save(STORAGE_KEYS.LANGUAGE, language)
}

// Active Run (auto-save)
export function saveActiveRun(runState: unknown, foMemory: unknown, tokensUsed: unknown): void {
  save(STORAGE_KEYS.ACTIVE_RUN, runState)
  save(STORAGE_KEYS.ACTIVE_RUN_META, { foMemory, tokensUsed })
}

export function loadActiveRun(): { run: unknown; foMemory: unknown; tokensUsed: unknown } | null {
  const run = load<unknown>(STORAGE_KEYS.ACTIVE_RUN, null)
  const meta = load<{ foMemory: unknown; tokensUsed: unknown } | null>(STORAGE_KEYS.ACTIVE_RUN_META, null)
  if (!run || !meta) return null
  return { run, foMemory: meta.foMemory, tokensUsed: meta.tokensUsed }
}

export function clearActiveRun(): void {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_RUN)
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_RUN_META)
}

// Credit Bank
export function loadCreditBank(): number {
  return load<number>(STORAGE_KEYS.CREDIT_BANK, 0)
}

export function saveCreditBank(credits: number): void {
  save(STORAGE_KEYS.CREDIT_BANK, Math.max(0, credits))
}

export function depositToBank(amount: number): void {
  const current = loadCreditBank()
  saveCreditBank(current + amount)
}

export function withdrawFromBank(amount: number): boolean {
  const current = loadCreditBank()
  if (amount > current) return false
  saveCreditBank(current - amount)
  return true
}

// Research Bank
export function loadResearchBank(): number {
  return load<number>(STORAGE_KEYS.RESEARCH_BANK, 0)
}

export function saveResearchBank(rp: number): void {
  save(STORAGE_KEYS.RESEARCH_BANK, Math.max(0, rp))
}

export function depositResearch(amount: number): void {
  const current = loadResearchBank()
  saveResearchBank(current + amount)
}

export function withdrawResearch(amount: number): boolean {
  const current = loadResearchBank()
  if (amount > current) return false
  saveResearchBank(current - amount)
  return true
}

// Equipment Vault (max 12)
export const VAULT_MAX = 12

export function loadEquipmentVault(): Equipment[] {
  return load<Equipment[]>(STORAGE_KEYS.EQUIPMENT_VAULT, [])
}

export function saveEquipmentVault(items: Equipment[]): void {
  save(STORAGE_KEYS.EQUIPMENT_VAULT, items.slice(0, VAULT_MAX))
}

export function addToVault(item: Equipment): boolean {
  const vault = loadEquipmentVault()
  if (vault.length >= VAULT_MAX) return false
  vault.push(item)
  saveEquipmentVault(vault)
  return true
}

export function removeFromVault(itemId: string): Equipment | null {
  const vault = loadEquipmentVault()
  const item = vault.find((i) => i.id === itemId)
  if (!item) return null
  saveEquipmentVault(vault.filter((i) => i.id !== itemId))
  return item
}

// Consumable Stash (shares vault max)
export function loadConsumableStash(): Consumable[] {
  return load<Consumable[]>(STORAGE_KEYS.CONSUMABLE_STASH, [])
}

export function saveConsumableStash(items: Consumable[]): void {
  save(STORAGE_KEYS.CONSUMABLE_STASH, items.slice(0, VAULT_MAX))
}

export function addToStash(item: Consumable): boolean {
  const stash = loadConsumableStash()
  if (stash.length >= VAULT_MAX) return false
  stash.push(item)
  saveConsumableStash(stash)
  return true
}

export function removeFromStash(itemId: string): Consumable | null {
  const stash = loadConsumableStash()
  const item = stash.find((i) => i.id === itemId)
  if (!item) return null
  saveConsumableStash(stash.filter((i) => i.id !== itemId))
  return item
}
