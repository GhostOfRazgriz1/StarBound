export type LLMProviderId = 'openai' | 'anthropic'

export interface LLMConfig {
  provider: LLMProviderId
  apiKey: string
  model: string
  baseUrl?: string     // for OpenAI-compatible endpoints
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
  }
}

export interface GenerationResult<T> {
  data: T
  narration: string
  foComment: string
  tokensUsed: {
    input: number
    output: number
  }
}

export interface ActionResult {
  narration: string
  foComment: string
  stateChanges: StateChanges
  newActions: Array<{
    id: string
    label: string
    description: string
    type: string
  }>
  encounterContinues: boolean
  combatTriggered: boolean
}

export interface CombatResult {
  outcome: 'victory' | 'defeat' | 'partial_success' | 'negotiated' | 'fled'
  narration: string
  foComment: string
  stateChanges: StateChanges
  enemyStateChange: string
  newActions: Array<{
    id: string
    label: string
    description: string
    type: string
  }>
  combatContinues: boolean
}

export interface StateChanges {
  hull?: number
  fuel?: number
  supplies?: number
  credits?: number
  morale?: number
  equipmentGained?: Array<{
    name: string
    slot: string
    rarity: string
    origin: string
    effect: string
    flavor: string
  }>
  equipmentLost?: string[]
}

export interface SectorGenerationResult {
  name: string
  encounterType: string
  encounter: Record<string, unknown>
  riskLevel: number
  interestLevel: number
}

/** Token cost estimates per 1M tokens (USD) */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini':       { input: 0.15,  output: 0.60 },
  'gpt-4o':            { input: 2.50,  output: 10.00 },
  'gpt-4.1-nano':      { input: 0.10,  output: 0.40 },
  'gpt-4.1-mini':      { input: 0.40,  output: 1.60 },
  'gpt-4.1':           { input: 2.00,  output: 8.00 },
  'claude-haiku-4-5-20251001':  { input: 0.80,  output: 4.00 },
  'claude-sonnet-4-6': { input: 3.00,  output: 15.00 },
  'claude-opus-4-6':   { input: 15.00, output: 75.00 },
}
