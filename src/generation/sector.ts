import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { Sector, SectorPreview, EncounterType } from '../types/encounters'
import { buildGenerationContext } from '../llm/context-builder'
import { buildSectorPreviewPrompt, buildSectorGenerationPrompt } from '../prompts/sector-gen'
import { parseJSONResponse } from '../llm/response-parser'
import { sectorPreviewsSchema, sectorGenerationSchema } from '../schemas/sector.schema'

export async function generateSectorPreviews(
  provider: LLMProvider,
  runState: RunState,
): Promise<{ previews: SectorPreview[]; tokensUsed: { input: number; output: number } }> {
  const prompt = buildSectorPreviewPrompt(runState)
  const messages = buildGenerationContext(runState, prompt)

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
    encounterType: s.encounterType as EncounterType,
  }))

  return { previews, tokensUsed }
}

export async function generateSector(
  provider: LLMProvider,
  preview: SectorPreview,
  runState: RunState,
): Promise<{ sector: Sector; tokensUsed: { input: number; output: number } }> {
  const prompt = buildSectorGenerationPrompt(preview.encounterType, preview.name, runState)
  const messages = buildGenerationContext(runState, prompt)

  const { data, tokensUsed } = await provider.chatJSON(
    messages,
    (raw) => parseJSONResponse(raw, sectorGenerationSchema),
  )

  const sector: Sector = {
    id: preview.id,
    name: data.name,
    encounterType: preview.encounterType,
    encounter: data.encounter as Sector['encounter'],
    visited: true,
    summary: null,
  }

  return { sector, tokensUsed }
}
