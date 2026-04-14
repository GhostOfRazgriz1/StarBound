import { useEffect, useRef } from 'react'

export function Narration({ entries }: { entries: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {entries.map((entry, i) => (
        <div key={i} className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
          {formatNarration(entry)}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function formatNarration(text: string) {
  // Split text and render FO comments differently
  const parts = text.split(/(FO: ".*?")/s)
  return parts.map((part, i) => {
    if (part.startsWith('FO: "')) {
      return (
        <div key={i} className="mt-2 pl-3 border-l-2 border-blue-500/40 text-blue-300/80 italic">
          {part}
        </div>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <p key={i} className="text-yellow-400/80 font-semibold">
          {part.slice(2, -2)}
        </p>
      )
    }
    return <p key={i}>{part}</p>
  })
}
