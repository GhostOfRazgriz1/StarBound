import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { FOCrossRunMemory } from '../types/fo'
import { buildNarrationContext } from '../llm/context-builder'
import { parseJSONResponse } from '../llm/response-parser'
import { narrationResultSchema } from '../schemas/action-result.schema'

export async function generateArrivalNarration(
  provider: LLMProvider,
  runState: RunState,
  foMemory: FOCrossRunMemory,
): Promise<{
  narration: string
  foComment: string
  actions: Array<{ id: string; label: string; description: string; type: string }>
  tokensUsed: { input: number; output: number }
}> {
  const sector = runState.currentSector
  if (!sector) throw new Error('No current sector')

  const prompt = [
    `The Captain's ship has arrived at sector "${sector.name}".`,
    '',
    'This is the ARRIVAL at a new sector. Generate:',
    '1. narration: 2-3 paragraphs describing what the Captain sees/detects (second person, present tense)',
    '2. foComment: the FO\'s reaction and initial assessment (1-3 sentences, in character)',
    '3. actions: 3-5 available actions the Captain can take',
    '',
    'The encounter data for this sector:',
    JSON.stringify(sector.encounter, null, 2),
    '',
    'Respond with JSON: { "narration": string, "foComment": string, "actions": [{ "id": string, "label": string, "description": string, "type": string }] }',
    '',
    'Action types: "explore", "combat", "dialogue", "trade", "navigate", "retreat", "special"',
    'Always include a "move_on" action (type: "navigate") to leave the sector.',
  ].join('\n')

  const messages = buildNarrationContext(runState, foMemory, prompt)

  const { data, tokensUsed } = await provider.chatJSON(
    messages,
    (raw) => parseJSONResponse(raw, narrationResultSchema),
  )

  return {
    narration: data.narration,
    foComment: data.foComment,
    actions: data.actions,
    tokensUsed,
  }
}
