import type { ChatMessage, LLMResponse } from '../types/llm'
import type { LLMProvider } from './providers/base'
import { useGameStore } from '../storage/game-store'

/**
 * Stream-aware chatJSON: if the provider supports streaming, shows live text
 * in the streaming panel while collecting the full response for JSON parsing.
 * Falls back to regular chatJSON if streaming is not available.
 */
export async function chatJSONWithStreaming<T>(
  provider: LLMProvider,
  messages: ChatMessage[],
  parse: (raw: string) => T,
): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }> {
  const store = useGameStore.getState()

  // If provider doesn't support streaming, use regular chatJSON
  if (!provider.chatStream) {
    return provider.chatJSON(messages, parse)
  }

  // Stream the response
  store.setStreamingText('')

  const response = await provider.chatStream(messages, (chunk) => {
    store.appendStreamingText(chunk)
  })

  // Clear streaming text now that we have the full response
  store.setStreamingText('')

  // Parse the complete response as JSON
  const data = parse(response.content)
  return { data, tokensUsed: response.tokensUsed }
}
