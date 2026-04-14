import type { ZodSchema } from 'zod'

export function parseJSONResponse<T>(raw: string, schema: ZodSchema<T>): T {
  const jsonStr = extractJSON(raw)
  const parsed = JSON.parse(jsonStr)

  // Normalize common LLM quirks before schema validation
  const normalized = normalizeKeys(parsed)

  return schema.parse(normalized)
}

function extractJSON(raw: string): string {
  const trimmed = raw.trim()

  // Already JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed
  }

  // Markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Find first { to last }
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  // Find first [ to last ]
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1)
  }

  return trimmed
}

/** Recursively normalize keys from various casings to camelCase */
function normalizeKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(normalizeKeys)
  if (typeof obj !== 'object') return obj

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const normalizedKey = toCamelCase(key)
    result[normalizedKey] = normalizeKeys(value)
  }
  return result
}

/** Convert snake_case or kebab-case to camelCase */
function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase())
}
