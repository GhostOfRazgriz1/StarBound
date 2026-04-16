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
    case 'deepseek':
      return new OpenAIProvider(config.apiKey, config.model, 'https://api.deepseek.com/v1')
    case 'qwen':
      return new OpenAIProvider(config.apiKey, config.model, 'https://dashscope.aliyuncs.com/compatible-mode/v1')
    case 'zhipu':
      return new OpenAIProvider(config.apiKey, config.model, 'https://open.bigmodel.cn/api/paas/v4')
    case 'baichuan':
      return new OpenAIProvider(config.apiKey, config.model, 'https://api.baichuan-ai.com/v1')
    case 'minimax':
      return new OpenAIProvider(config.apiKey, config.model, 'https://api.minimax.chat/v1')
    case 'moonshot':
      return new OpenAIProvider(config.apiKey, config.model, 'https://api.moonshot.cn/v1')
    case 'stepfun':
      return new OpenAIProvider(config.apiKey, config.model, 'https://api.stepfun.com/v1')
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
