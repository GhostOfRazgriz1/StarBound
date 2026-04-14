import type { ChatMessage, LLMResponse } from '../../types/llm'
import type { LLMProvider } from './base'

export class AnthropicProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    const { system, turns } = this.splitMessages(messages)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system,
        messages: turns,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${err}`)
    }

    const json = await res.json()

    return {
      content: json.content[0].text,
      tokensUsed: {
        input: json.usage?.input_tokens ?? 0,
        output: json.usage?.output_tokens ?? 0,
      },
    }
  }

  async chatJSON<T>(
    messages: ChatMessage[],
    parse: (raw: string) => T,
  ): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }> {
    const { system, turns } = this.splitMessages(messages)

    // Append instruction to return JSON and prefill opening brace
    const jsonTurns = [
      ...turns,
      { role: 'assistant' as const, content: '{' },
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        system,
        messages: jsonTurns,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${err}`)
    }

    const json = await res.json()
    const content = '{' + json.content[0].text
    const tokensUsed = {
      input: json.usage?.input_tokens ?? 0,
      output: json.usage?.output_tokens ?? 0,
    }

    const data = parse(content)
    return { data, tokensUsed }
  }

  private splitMessages(messages: ChatMessage[]): {
    system: string
    turns: Array<{ role: 'user' | 'assistant'; content: string }>
  } {
    let system = ''
    const turns: Array<{ role: 'user' | 'assistant'; content: string }> = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        system += (system ? '\n\n' : '') + msg.content
      } else {
        turns.push({ role: msg.role, content: msg.content })
      }
    }

    return { system, turns }
  }
}
