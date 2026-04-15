import type { ChatMessage, LLMResponse } from '../../types/llm'
import type { LLMProvider } from './base'

interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export class GoogleProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    const { systemInstruction, contents } = this.mapMessages(messages)

    const body: Record<string, unknown> = { contents }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google AI API error (${res.status}): ${err}`)
    }

    const json = await res.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return {
      content: text,
      tokensUsed: {
        input: json.usageMetadata?.promptTokenCount ?? 0,
        output: json.usageMetadata?.candidatesTokenCount ?? 0,
      },
    }
  }

  async chatJSON<T>(
    messages: ChatMessage[],
    parse: (raw: string) => T,
  ): Promise<{ data: T; tokensUsed: LLMResponse['tokensUsed'] }> {
    const { systemInstruction, contents } = this.mapMessages(messages)

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google AI API error (${res.status}): ${err}`)
    }

    const json = await res.json()
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const tokensUsed = {
      input: json.usageMetadata?.promptTokenCount ?? 0,
      output: json.usageMetadata?.candidatesTokenCount ?? 0,
    }

    const data = parse(content)
    return { data, tokensUsed }
  }

  private mapMessages(messages: ChatMessage[]): {
    systemInstruction: string
    contents: GeminiContent[]
  } {
    let systemInstruction = ''
    const contents: GeminiContent[] = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction += (systemInstruction ? '\n\n' : '') + msg.content
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }
    }

    return { systemInstruction, contents }
  }
}
