import type { ChatMessage } from '../types/llm'
import type { RunState } from '../types/game'
import type { FOCrossRunMemory } from '../types/fo'
import { FO_ARCHETYPES, getFamiliarityTier } from '../types/fo'
import { buildSystemPrompt } from '../prompts/system'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'

function getPlayerName(): string | undefined {
  const name = useGameStore.getState().playerName
  return name || undefined
}

function getLanguageInstruction(): string {
  const lang = useGameStore.getState().language
  if (lang === 'en') return ''
  const langName = LANGUAGES[lang] ?? 'English'
  return `\nIMPORTANT: All string values in the JSON (names, descriptions, text) MUST be in ${langName}. JSON keys remain in English.`
}

export function buildContext(
  runState: RunState,
  foMemory: FOCrossRunMemory,
  userMessage: string,
): ChatMessage[] {
  const fo = FO_ARCHETYPES[runState.foArchetype]
  const tier = getFamiliarityTier(runState.currentSectorNumber, runState.captainProfile.followsFOAdvice)

  const systemPrompt = buildSystemPrompt(runState, fo, tier, foMemory, getPlayerName())

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  return messages
}

export function buildGenerationContext(
  runState: RunState,
  generationPrompt: string,
): ChatMessage[] {
  const runStateCompact = serializeRunState(runState)

  const system = [
    'You are a game content generator for a text-based space exploration game.',
    'You generate structured JSON content based on the current game state.',
    'Always respond with valid JSON only, no additional text.',
    getLanguageInstruction(),
    '',
    '## Current Run State',
    runStateCompact,
  ].join('\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: generationPrompt },
  ]
}

export function buildNarrationContext(
  runState: RunState,
  foMemory: FOCrossRunMemory,
  narrationPrompt: string,
): ChatMessage[] {
  const fo = FO_ARCHETYPES[runState.foArchetype]
  const tier = getFamiliarityTier(runState.currentSectorNumber, runState.captainProfile.followsFOAdvice)
  const systemPrompt = buildSystemPrompt(runState, fo, tier, foMemory, getPlayerName())

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: narrationPrompt },
  ]
}

function serializeRunState(state: RunState): string {
  const ship = state.ship
  const lines = [
    `Sector: ${state.currentSectorNumber} of ${state.totalSectors}`,
    `Scenario: ${state.scenario}`,
    `Ship — Hull: ${ship.hull}/${ship.maxHull}, Fuel: ${ship.fuel}/${ship.maxFuel}, Supplies: ${ship.supplies}/${ship.maxSupplies}, Credits: ${ship.credits}, Morale: ${ship.morale}`,
    `Equipment — Weapons: ${ship.equipment.weapons?.name ?? 'none'}, Shields: ${ship.equipment.shields?.name ?? 'none'}, Engine: ${ship.equipment.engine?.name ?? 'none'}, Special: ${ship.equipment.special?.name ?? 'none'}`,
    `Consumables: ${(ship.consumables || []).length > 0 ? (ship.consumables || []).map(c => `${c.name} (${c.type})`).join(', ') : 'none'}`,
    `Story Arc — Stage: ${state.storyArc.stage}, Antagonist: ${state.storyArc.antagonist}${state.storyArc.motivation ? `, Motivation: ${state.storyArc.motivation}` : ''}`,
    `Encounter Depth: ${state.encounterDepth}`,
  ]

  if (state.sectorMap.length > 0) {
    lines.push('', 'Previous sectors:')
    for (const s of state.sectorMap) {
      lines.push(`  Sector ${s.sectorNumber} (${s.type}): ${s.summary}${s.retreated ? ' [RETREATED]' : ''}`)
    }
  }

  if (state.captainsLog.trim()) {
    lines.push('', "Captain's Log:", state.captainsLog)
  }

  if (state.standingOrders.trim()) {
    lines.push('', 'Standing Orders:', state.standingOrders)
  }

  return lines.join('\n')
}
