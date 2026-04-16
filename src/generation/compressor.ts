import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import { buildGenerationContext } from '../llm/context-builder'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import { compressionResultSchema } from '../schemas/action-result.schema'

export async function compressSector(
  provider: LLMProvider,
  runState: RunState,
): Promise<{
  summary: string
  arcUpdate?: {
    stageAdvance: boolean
    motivationRevealed?: string | null
    targetRevealed?: string | null
    antagonistUpdate?: string
  }
  tokensUsed: { input: number; output: number }
}> {
  const sector = runState.currentSector
  if (!sector) throw new Error('No current sector')

  const prompt = [
    'Compress the following sector visit into a 2-sentence summary.',
    'Also determine if the story arc should advance based on what happened.',
    '',
    `Sector: ${sector.name} (${sector.encounterType})`,
    'Encounter data:',
    JSON.stringify(sector.encounter, null, 2),
    '',
    'Actions taken:',
    ...runState.sectorHistory,
    '',
    `Current arc stage: ${runState.storyArc.stage}`,
    `Antagonist: ${runState.storyArc.antagonist}`,
    '',
    'Respond with JSON:',
    '{ "summary": "2 sentence summary of what happened",',
    '  "arcUpdate": {',
    '    "stageAdvance": boolean (should the arc advance to the next stage?),',
    '    "motivationRevealed": string | null (if the antagonist\'s motivation was revealed),',
    '    "targetRevealed": string | null (if the antagonist\'s target was revealed),',
    '    "antagonistUpdate": string (brief update on antagonist status, optional)',
    '  }',
    '}',
  ].join('\n')

  const messages = buildGenerationContext(runState, prompt)

  const { data, tokensUsed } = await chatJSONWithStreaming(
    provider,
    messages,
    (raw) => parseJSONResponse(raw, compressionResultSchema),
  )

  return {
    summary: data.summary,
    arcUpdate: data.arcUpdate ?? undefined,
    tokensUsed,
  }
}
