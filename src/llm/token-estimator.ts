import { MODEL_PRICING } from '../types/llm'

/** Rough estimate: ~4 chars per token for English text */
const CHARS_PER_TOKEN = 4

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

export function estimateCostUSD(
  inputTokens: number,
  outputTokens: number,
  model: string,
): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return inputCost + outputCost
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `<$0.01`
  return `$${usd.toFixed(2)}`
}
