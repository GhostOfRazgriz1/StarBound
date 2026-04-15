import type { LLMConfig } from '../types/llm'
import type { LLMProvider } from './providers/base'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { GoogleProvider } from './providers/google'
import { OpenRouterProvider } from './providers/openrouter'

export function createLLMProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model, config.baseUrl)
    case 'anthropic':
      return new AnthropicProvider(config.apiKey, config.model)
    case 'google':
      return new GoogleProvider(config.apiKey, config.model)
    case 'openrouter':
      return new OpenRouterProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
