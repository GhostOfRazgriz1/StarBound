import type { LLMProvider } from '../llm/providers/base'
import type { RunState } from '../types/game'
import type { CaptainProfile } from '../types/fo'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'
import { z } from 'zod'

const captainAnalysisSchema = z.object({
  typeName: z.string(),
  typeSubtitle: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  blindSpots: z.array(z.string()),
  foQuote: z.string(),
  commandStyle: z.string(),
}).passthrough()

export type CaptainAnalysis = z.infer<typeof captainAnalysisSchema>

export async function generateCaptainAnalysis(
  provider: LLMProvider,
  runState: RunState,
): Promise<{ analysis: CaptainAnalysis; tokensUsed: { input: number; output: number } }> {
  const profile = runState.captainProfile
  const sectorSummaries = runState.sectorMap.map(
    (s) => `Sector ${s.sectorNumber} (${s.type}): ${s.summary}${s.retreated ? ' [RETREATED]' : ''}`
  ).join('\n')

  const prompt = buildProfilePrompt(profile, sectorSummaries, runState)

  const { data, tokensUsed } = await chatJSONWithStreaming(
    provider,
    [
      { role: 'system', content: getProfileSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    (raw) => parseJSONResponse(raw, captainAnalysisSchema),
  )

  return { analysis: data, tokensUsed }
}

function buildProfilePrompt(profile: CaptainProfile, sectorSummaries: string, runState: RunState): string {
  return [
    'Analyze this starship captain\'s personality based on their decisions during a deep space exploration mission.',
    '',
    'DECISION PROFILE (0 = low, 1 = high):',
    `- Risk appetite: ${profile.riskAppetite.toFixed(2)} (${describeAxis(profile.riskAppetite, 'cautious and methodical', 'bold and daring')})`,
    `- Diplomatic tendency: ${profile.diplomatic.toFixed(2)} (${describeAxis(profile.diplomatic, 'prefers direct action', 'prefers negotiation')})`,
    `- Follows FO advice: ${profile.followsFOAdvice.toFixed(2)} (${describeAxis(profile.followsFOAdvice, 'independent, overrides often', 'collaborative, listens to crew')})`,
    `- Crew priority: ${profile.crewPriority.toFixed(2)} (${describeAxis(profile.crewPriority, 'mission-focused', 'crew safety first')})`,
    `- Curiosity: ${profile.curiosity.toFixed(2)} (${describeAxis(profile.curiosity, 'practical, skips optional', 'explorer, investigates everything')})`,
    `- Total decisions tracked: ${profile.decisionsTracked}`,
    '',
    'MISSION SUMMARY:',
    `- Scenario: ${runState.scenario}`,
    `- Sectors explored: ${runState.sectorMap.length}/${runState.totalSectors}`,
    `- Ship survived: ${runState.ship.hull > 0 ? 'yes' : 'no'}`,
    `- Retreats: ${runState.sectorMap.filter(s => s.retreated).length}`,
    '',
    'SECTOR LOG:',
    sectorSummaries,
    '',
    'Generate a personality profile for this captain. Think MBTI-style but for starship commanders.',
    'The type should feel like a real personality classification — a short evocative name (2-4 words).',
    '',
    'Respond with JSON:',
    '{',
    '  "typeName": "The [Type Name]" (e.g., "The Quiet Storm", "The Reckless Scholar", "The Iron Diplomat"),',
    '  "typeSubtitle": "one line that captures their essence" (e.g., "Talks first, shoots only when they have to"),',
    '  "description": "2-3 sentences describing this captain\'s command philosophy and how it played out this mission",',
    '  "strengths": ["strength 1", "strength 2"] (2 strengths based on their decisions),',
    '  "blindSpots": ["blind spot 1", "blind spot 2"] (2 weaknesses/risks of their style),',
    '  "foQuote": "A one-line quote from the FO about serving under this captain" (in character, reflecting the relationship),',
    '  "commandStyle": "one word" (e.g., "calculated", "instinctive", "empathetic", "ruthless", "curious")',
    '}',
    '',
    'Make it feel personal and specific to THIS run, not generic. Reference actual events from the sector log.',
  ].join('\n')
}

function getProfileSystemPrompt(): string {
  const lang = useGameStore.getState().language
  const langName = LANGUAGES[lang] ?? 'English'
  const langInstruction = lang !== 'en'
    ? ` All text values in your JSON response MUST be in ${langName}.`
    : ''
  return `You generate personality analyses for a space exploration game. Respond with JSON only.${langInstruction}`
}

function describeAxis(value: number, low: string, high: string): string {
  if (value < 0.35) return low
  if (value > 0.65) return high
  return 'balanced'
}
