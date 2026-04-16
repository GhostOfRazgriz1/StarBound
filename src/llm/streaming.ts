import type { ChatMessage, LLMResponse } from '../types/llm'
import type { LLMProvider } from './providers/base'
import { useGameStore } from '../storage/game-store'

const MAX_RETRIES = 1
const STREAM_THROTTLE_MS = 100 // ~10fps

/**
 * Stream-aware chatJSON with auto-retry on parse failure.
 * If streaming is available, shows live text while collecting the full response.
 * If parsing fails, sends the error back to the LLM and retries once.
 */
export async function chatJSONWithStreaming<T>(
  provider: LLMProvider,
  messages: ChatMessage[],
  parse: (raw: string) => T,
): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }> {
  let lastError: unknown = null
  let lastRawContent = ''
  let totalTokens = { input: 0, output: 0 }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      let rawContent: string
      let tokensUsed: LLMResponse['tokensUsed']

      const currentMessages = attempt === 0
        ? messages
        : [
            ...messages,
            { role: 'assistant' as const, content: lastRawContent },
            { role: 'user' as const, content: `Your previous response caused a JSON parsing error:\n${lastError instanceof Error ? lastError.message : String(lastError)}\n\nPlease fix the JSON and respond again with valid JSON only.` },
          ]

      if (provider.chatStream && attempt === 0) {
        // Stream only on first attempt
        useGameStore.getState().setStreamingText('')
        let streamBuffer = ''
        let lastFlush = 0
        const response = await provider.chatStream(currentMessages, (chunk) => {
          streamBuffer += chunk
          const now = Date.now()
          if (now - lastFlush >= STREAM_THROTTLE_MS) {
            useGameStore.getState().setStreamingText(
              useGameStore.getState().streamingText + streamBuffer
            )
            streamBuffer = ''
            lastFlush = now
          }
        })
        if (streamBuffer) {
          useGameStore.getState().setStreamingText(
            useGameStore.getState().streamingText + streamBuffer
          )
        }
        useGameStore.getState().setStreamingText('')
        rawContent = response.content
        tokensUsed = response.tokensUsed
      } else {
        // Non-streaming (retry or no stream support)
        const response = await provider.chat(currentMessages)
        rawContent = response.content
        tokensUsed = response.tokensUsed
      }

      totalTokens.input += tokensUsed.input
      totalTokens.output += tokensUsed.output
      lastRawContent = rawContent

      const data = parse(rawContent)
      return { data, tokensUsed: totalTokens }
    } catch (err) {
      lastError = err
      if (attempt < MAX_RETRIES) {
        // Will retry
        continue
      }
      throw err
    }
  }

  throw lastError
}
