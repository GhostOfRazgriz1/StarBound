import type { ChatMessage, LLMResponse } from '../../types/llm'

export interface LLMProvider {
  chat(messages: ChatMessage[]): Promise<LLMResponse>
  chatJSON<T>(messages: ChatMessage[], parse: (raw: string) => T): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }>
}
