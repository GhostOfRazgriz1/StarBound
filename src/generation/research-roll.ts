import type { LLMProvider } from '../llm/providers/base'
import type { ChatMessage } from '../types/llm'
import type { Equipment } from '../types/equipment'
import { parseJSONResponse } from '../llm/response-parser'
import { chatJSONWithStreaming } from '../llm/streaming'
import { equipmentLootSchema } from '../schemas/encounter.schema'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'

export const RESEARCH_TIERS = [
  { cost: 10, label: 'Basic Research', rarityPool: 'common or uncommon', description: 'Standard-issue prototypes' },
  { cost: 25, label: 'Advanced Research', rarityPool: 'uncommon or rare', description: 'Experimental tech' },
  { cost: 50, label: 'Breakthrough Research', rarityPool: 'rare or legendary', description: 'Cutting-edge discoveries' },
] as const

export async function rollEquipmentFromResearch(
  provider: LLMProvider,
  rpSpent: number,
): Promise<{ equipment: Equipment; tokensUsed: { input: number; output: number } }> {
  const tier = RESEARCH_TIERS.find(t => t.cost === rpSpent) ?? RESEARCH_TIERS[0]

  const lang = useGameStore.getState().language
  const langName = LANGUAGES[lang] ?? 'English'
  const langInstruction = lang !== 'en'
    ? `\nAll string values MUST be in ${langName}. JSON keys remain in English.`
    : ''

  const system = [
    'You generate equipment items for a space exploration game. Respond with JSON only.',
    langInstruction,
  ].join('\n')

  const prompt = [
    `The captain is spending ${rpSpent} research points to develop new technology.`,
    '',
    `Generate ONE piece of ship equipment with rarity: ${tier.rarityPool}.`,
    '',
    'Equipment JSON format:',
    '{ "name": string, "slot": "weapons"|"shields"|"engine"|"module", "rarity": "common"|"uncommon"|"rare"|"legendary",',
    '  "origin": string (where/how it was developed), "effect": string (mechanical effect), "flavor": string (flavor text) }',
    '',
    'Guidelines:',
    '- The item should feel like it was DEVELOPED through research, not found or bought.',
    '- Origin should reference a research lab, prototype facility, or scientific breakthrough.',
    '- Vary the slot — do not always generate modules. Distribute across weapons, shields, engine, and module.',
    '- Higher rarity = stronger effect, more creative name, more interesting origin story.',
    '- Effect should be specific and mechanically relevant (not vague "improves combat").',
  ].join('\n')

  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ]

  const { data, tokensUsed } = await chatJSONWithStreaming(
    provider,
    messages,
    (raw) => parseJSONResponse(raw, equipmentLootSchema),
  )

  const equipment: Equipment = {
    id: crypto.randomUUID(),
    name: data.name,
    slot: data.slot as Equipment['slot'],
    rarity: data.rarity as Equipment['rarity'],
    origin: data.origin,
    effect: data.effect,
    flavor: data.flavor,
  }

  return { equipment, tokensUsed }
}
