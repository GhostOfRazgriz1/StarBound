import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { ChatMessage } from '../types/llm'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import { compressionResultSchema } from '../schemas/action-result.schema'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'

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

  const lang = useGameStore.getState().language
  const langName = LANGUAGES[lang] ?? 'English'
  const langInstruction = lang !== 'en'
    ? `\nAll string values in the JSON MUST be in ${langName}. JSON keys remain in English.`
    : ''

  const system = [
    'You compress game sector visits into concise summaries and determine story arc progression.',
    'Respond with valid JSON only.',
    langInstruction,
  ].join('\n')

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
    `Story arc — stage: ${runState.storyArc.stage}, antagonist: ${runState.storyArc.antagonist}${runState.storyArc.motivation ? `, motivation: ${runState.storyArc.motivation}` : ''}`,
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

  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ]

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
