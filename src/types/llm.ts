export type LLMProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'deepseek' | 'qwen' | 'zhipu' | 'baichuan' | 'minimax' | 'moonshot' | 'doubao'

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
  consumablesGained?: Array<{
    name: string
    type: string
    effect: string
    magnitude?: number
    uses?: number
  }>
  consumablesLost?: string[]
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
  // Google Gemini
  'gemini-2.0-flash':  { input: 0.10,  output: 0.40 },
  'gemini-2.5-flash':  { input: 0.15,  output: 0.60 },
  'gemini-2.5-pro':    { input: 1.25,  output: 10.00 },
  // OpenRouter (approximate, includes markup)
  'google/gemini-2.5-flash':         { input: 0.20,  output: 0.80 },
  'anthropic/claude-sonnet-4':       { input: 3.50,  output: 17.50 },
  'meta-llama/llama-4-maverick':     { input: 0.50,  output: 0.70 },
  'deepseek/deepseek-chat-v3':       { input: 0.30,  output: 0.90 },
  // DeepSeek
  'deepseek-chat':     { input: 0.27,  output: 1.10 },
  'deepseek-reasoner': { input: 0.55,  output: 2.19 },
  // Qwen (Alibaba)
  'qwen-plus':         { input: 0.80,  output: 2.00 },
  'qwen-turbo':        { input: 0.30,  output: 0.60 },
  'qwen-max':          { input: 2.40,  output: 9.60 },
  // Zhipu (GLM)
  'glm-4-plus':        { input: 0.70,  output: 0.70 },
  'glm-4-flash':       { input: 0.01,  output: 0.01 },
  'glm-4':             { input: 1.40,  output: 1.40 },
  // Baichuan
  'Baichuan4':         { input: 1.40,  output: 1.40 },
  'Baichuan3-Turbo':   { input: 0.17,  output: 0.17 },
  // MiniMax
  'MiniMax-Text-01':   { input: 0.15,  output: 0.55 },
  'abab6.5s-chat':     { input: 0.14,  output: 0.14 },
  // Moonshot (Kimi)
  'moonshot-v1-8k':    { input: 0.17,  output: 0.17 },
  'moonshot-v1-32k':   { input: 0.34,  output: 0.34 },
  'moonshot-v1-128k':  { input: 0.86,  output: 0.86 },
  // Doubao (ByteDance/豆包)
  'doubao-1.5-pro-32k':  { input: 0.11,  output: 0.27 },
  'doubao-1.5-lite-32k': { input: 0.04,  output: 0.08 },
  'doubao-pro-32k':      { input: 0.11,  output: 0.27 },
}
