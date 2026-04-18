import type { ChatMessage } from '../types/llm'
import type { RunState } from '../types/game'
import type { FOCrossRunMemory } from '../types/fo'
import { FO_ARCHETYPES, getFamiliarityTier } from '../types/fo'
import { buildSystemPrompt } from '../prompts/system'
import { useGameStore } from '../storage/game-store'

function getPlayerName(): string | undefined {
  const name = useGameStore.getState().playerName
  return name || undefined
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

/**
 * Build a multi-turn conversation for within-sector action resolution.
 * The system prompt omits inline sector history; prior turns are replayed
 * as real user/assistant message pairs so providers can cache the prefix.
 */
export function buildMultiTurnContext(
  runState: RunState,
  foMemory: FOCrossRunMemory,
  userMessage: string,
): ChatMessage[] {
  const fo = FO_ARCHETYPES[runState.foArchetype]
  const tier = getFamiliarityTier(runState.currentSectorNumber, runState.captainProfile.followsFOAdvice)
  const systemPrompt = buildSystemPrompt(runState, fo, tier, foMemory, getPlayerName(), { omitSectorHistory: true })

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ]

  // Replay prior turns as user/assistant message pairs
  for (const turn of runState.sectorTurns) {
    messages.push({ role: 'user', content: turn.userPrompt })
    messages.push({ role: 'assistant', content: turn.assistantResponse })
  }

  messages.push({ role: 'user', content: userMessage })

  return messages
}
