import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { ChatMessage } from '../types/llm'
import type { Sector, SectorPreview, EncounterType } from '../types/encounters'
import { buildSectorPreviewPrompt, buildSectorGenerationPrompt } from '../prompts/sector-gen'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import type { FOCrossRunMemory } from '../types/fo'
import { buildNarrationContext } from '../llm/context-builder'
import { sectorPreviewsSchema, sectorWithNarrationSchema } from '../schemas/sector.schema'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'

export async function generateSectorPreviews(
  provider: LLMProvider,
  runState: RunState,
): Promise<{ previews: SectorPreview[]; tokensUsed: { input: number; output: number } }> {
  const prompt = buildSectorPreviewPrompt(runState)

  // Minimal context — previews only need the prompt, not full ship/equipment state
  const lang = useGameStore.getState().language
  const langName = LANGUAGES[lang] ?? 'English'
  const langInstruction = lang !== 'en'
    ? `\nAll string values in the JSON MUST be in ${langName}. JSON keys remain in English.`
    : ''

  const system = [
    'You are a game content generator for a text-based space exploration game.',
    'You generate structured JSON content based on the current game state.',
    'Always respond with valid JSON only, no additional text.',
    langInstruction,
  ].join('\n')

  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ]

  // Use chatJSON directly — no streaming needed for previews
  // (sector preview JSON has no "narration" field so streaming shows nothing)
  const { data, tokensUsed } = await provider.chatJSON(
    messages,
    (raw) => parseJSONResponse(raw, sectorPreviewsSchema),
  )

  const previews: SectorPreview[] = data.sectors.map((s) => ({
    id: crypto.randomUUID(),
    name: s.name,
    description: s.description,
    riskLevel: s.riskLevel,
    interestLevel: s.interestLevel,
    distance: (s as { distance?: number }).distance ?? 1,
    encounterType: s.encounterType as EncounterType,
  }))

  return { previews, tokensUsed }
}

/**
 * Combined: generates sector data + arrival narration in a single LLM call.
 * Saves ~2K tokens per sector by avoiding a separate narration call.
 */
export async function generateSectorWithNarration(
  provider: LLMProvider,
  preview: SectorPreview,
  runState: RunState,
  foMemory: FOCrossRunMemory,
): Promise<{
  sector: Sector
  narration: string
  foComment: string
  actions: Array<{ id: string; label: string; description: string; type: string }>
  prompt: string
  rawContent: string
  tokensUsed: { input: number; output: number }
}> {
  const encounterInstructions = buildSectorGenerationPrompt(preview.encounterType, preview.name, runState)

  const prompt = [
    encounterInstructions,
    '',
    'ADDITIONALLY, generate the arrival narration for this sector.',
    'The player has just arrived. Describe what they see/detect.',
    '',
    'Your JSON response must include ALL of these fields:',
    '- name: sector name',
    '- encounter: the full encounter data object (as specified above)',
    '- narration: 2-3 paragraphs of arrival narration (second person, present tense)',
    '- foComment: the FO\'s reaction and initial assessment (1-3 sentences, in character)',
    '- actions: 3-5 available actions as [{ id, label, description, type }]',
    '',
    'Action types: "explore", "combat", "dialogue", "trade", "navigate", "retreat", "special"',
    'Always include a "move_on" action (type: "navigate") to leave the sector.',
  ].join('\n')

  const messages = buildNarrationContext(runState, foMemory, prompt)

  const { data, rawContent, tokensUsed } = await chatJSONWithStreaming(
    provider,
    messages,
    (raw) => parseJSONResponse(raw, sectorWithNarrationSchema),
  )

  const sector: Sector = {
    id: preview.id,
    name: data.name,
    encounterType: preview.encounterType,
    encounter: data.encounter as Sector['encounter'],
    visited: true,
    summary: null,
  }

  return {
    sector,
    narration: data.narration,
    foComment: data.foComment,
    actions: data.actions,
    prompt,
    rawContent,
    tokensUsed,
  }
}
