import { useEffect, useRef, type ReactNode } from 'react'
import { useGameStore } from '../../storage/game-store'

export function Narration({ entries }: { entries: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamingText = useGameStore((s) => s.streamingText)
  const loading = useGameStore((s) => s.loading)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length, streamingText])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {entries.map((entry, i) => (
        <div key={i} className="text-base leading-loose text-gray-300">
          {formatNarration(stripThinking(entry))}
        </div>
      ))}
      {loading && streamingText && (
        <div className="text-base leading-loose text-gray-400 animate-pulse">
          {extractNarrationFromStream(stripThinking(streamingText))}
          <span className="inline-block w-1.5 h-4 bg-blue-400/60 ml-0.5 animate-pulse" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

/** Try to extract the narration field from a partial JSON stream */
function extractNarrationFromStream(text: string): string {
  // Try to extract "narration": "..." from partial JSON
  const match = text.match(/"narration"\s*:\s*"([\s\S]*?)(?:"|$)/)
  if (match) {
    // Unescape JSON string escapes
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
  // If no JSON structure, show raw text (for non-JSON streaming)
  if (!text.includes('{')) return text
  return ''
}

/** Strip thinking/reasoning tags that some models emit */
function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<reflection>[\s\S]*?<\/reflection>/gi, '')
    .trim()
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInlineMarkdown(text: string): (string | ReactNode)[] {
  const result: (string | ReactNode)[] = []
  // Match **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIdx = 0

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      result.push(<strong key={keyIdx++} className="text-gray-100 font-semibold">{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      result.push(<em key={keyIdx++} className="text-gray-400">{match[3]}</em>)
    } else if (match[4]) {
      // `code`
      result.push(<code key={keyIdx++} className="text-blue-300 bg-gray-800 px-1 rounded text-xs">{match[4]}</code>)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result.length > 0 ? result : [text]
}

function formatNarration(text: string) {
  // Split by double newlines into paragraphs
  const blocks = text.split(/\n\n+/)

  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // FO comment block
    if (trimmed.startsWith('FO: "') || trimmed.startsWith('FO："')) {
      return (
        <div key={i} className="mt-2 pl-3 border-l-2 border-blue-500/40 text-blue-300/80">
          {renderInlineMarkdown(trimmed)}
        </div>
      )
    }

    // Quoted dialogue from NPCs (starts with ")
    if (trimmed.startsWith('"') || trimmed.startsWith('"')) {
      return (
        <p key={i} className="pl-3 border-l-2 border-gray-700 text-gray-400 italic">
          {renderInlineMarkdown(trimmed)}
        </p>
      )
    }

    // Heading-style lines (### or ##)
    if (trimmed.startsWith('### ')) {
      return <h4 key={i} className="text-gray-200 font-semibold text-sm mt-2">{trimmed.slice(4)}</h4>
    }
    if (trimmed.startsWith('## ')) {
      return <h3 key={i} className="text-gray-100 font-semibold mt-2">{trimmed.slice(3)}</h3>
    }

    // Bold-only line (system messages like retreat)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <p key={i} className="text-yellow-400/80 font-semibold">
          {trimmed.slice(2, -2)}
        </p>
      )
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const items = trimmed.split('\n').filter((l) => l.trim())
      return (
        <ul key={i} className="list-disc list-inside space-y-0.5 text-gray-400">
          {items.map((item, j) => (
            <li key={j}>{renderInlineMarkdown(item.replace(/^[-•]\s*/, ''))}</li>
          ))}
        </ul>
      )
    }

    // Regular paragraph with inline markdown
    return <p key={i}>{renderInlineMarkdown(trimmed)}</p>
  })
}
