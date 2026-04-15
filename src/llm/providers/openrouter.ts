import type { ChatMessage, LLMResponse } from '../../types/llm'
import type { LLMProvider } from './base'

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string
  private model: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://ghostofrazgriz1.github.io/StarBound/',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter API error (${res.status}): ${err}`)
    }

    const json = await res.json()
    const choice = json.choices[0]

    return {
      content: choice.message.content,
      tokensUsed: {
        input: json.usage?.prompt_tokens ?? 0,
        output: json.usage?.completion_tokens ?? 0,
      },
    }
  }

  async chatJSON<T>(
    messages: ChatMessage[],
    parse: (raw: string) => T,
  ): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://ghostofrazgriz1.github.io/StarBound/',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter API error (${res.status}): ${err}`)
    }

    const json = await res.json()
    const content = json.choices[0].message.content
    const tokensUsed = {
      input: json.usage?.prompt_tokens ?? 0,
      output: json.usage?.completion_tokens ?? 0,
    }

    const data = parse(content)
    return { data, tokensUsed }
  }
}
