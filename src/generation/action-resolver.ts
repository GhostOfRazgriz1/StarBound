import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { ActionResult, CombatResult } from '../types/llm'
import type { FOCrossRunMemory } from '../types/fo'
import type { PirateEncounter } from '../types/encounters'
import { buildMultiTurnContext, buildNarrationContext } from '../llm/context-builder'
import { buildCombatPrompt } from '../prompts/combat'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import { actionResultSchema, combatResultSchema } from '../schemas/action-result.schema'

export async function resolveAction(
  provider: LLMProvider,
  runState: RunState,
  foMemory: FOCrossRunMemory,
  _actionId: string,
  actionLabel: string,
  freeTextInput?: string,
): Promise<{ result: ActionResult; prompt: string; rawContent: string; tokensUsed: { input: number; output: number } }> {
  const playerAction = freeTextInput
    ? `The Captain types: "${freeTextInput}"`
    : `The Captain chooses: "${actionLabel}"`

  const prompt = [
    `PLAYER ACTION: ${playerAction}`,
    '',
    'Resolve this action in the current sector encounter.',
    '',
    `Encounter depth: ${runState.encounterDepth}`,
    runState.encounterDepth === 'standard'
      ? 'Resolve completely — describe the full outcome of this action.'
      : 'Resolve the immediate result only — present new options for the next decision.',
    '',
    'Respond with JSON:',
    '{ "narration": string, "foComment": string,',
    '  "stateChanges": { hull?, fuel?, supplies?, credits?, morale?, equipmentGained?, equipmentLost? },',
    '  "newActions": [{ id, label, description, type }],',
    '  "encounterContinues": boolean,',
    '  "combatTriggered": boolean }',
    '',
    'Include a "move_on" action if the encounter can be left.',
    'stateChanges values are deltas (e.g., fuel: -5 means lose 5 fuel).',
  ].join('\n')

  // Use multi-turn context: prior turns are real message pairs, system prompt omits inline history
  const messages = runState.sectorTurns.length > 0
    ? buildMultiTurnContext(runState, foMemory, prompt)
    : buildNarrationContext(runState, foMemory, prompt)

  const { data, rawContent, tokensUsed } = await chatJSONWithStreaming(
    provider,
    messages,
    (raw) => parseJSONResponse(raw, actionResultSchema),
  )

  return { result: data, prompt, rawContent, tokensUsed }
}

export async function resolveCombat(
  provider: LLMProvider,
  runState: RunState,
  foMemory: FOCrossRunMemory,
  enemy: PirateEncounter,
  actionLabel: string,
  freeTextInput?: string,
): Promise<{ result: CombatResult; prompt: string; rawContent: string; tokensUsed: { input: number; output: number } }> {
  const playerAction = freeTextInput || actionLabel
  const combatPrompt = buildCombatPrompt(runState, enemy, playerAction)

  // Use multi-turn context for combat too
  const messages = runState.sectorTurns.length > 0
    ? buildMultiTurnContext(runState, foMemory, combatPrompt)
    : buildNarrationContext(runState, foMemory, combatPrompt)

  const { data, rawContent, tokensUsed } = await chatJSONWithStreaming(
    provider,
    messages,
    (raw) => parseJSONResponse(raw, combatResultSchema),
  )

  return { result: data, prompt: combatPrompt, rawContent, tokensUsed }
}
