import { useState } from 'react'
import type { GameAction } from '../../types/game'

interface ActionBarProps {
  actions: GameAction[]
  onAction: (actionId: string, actionLabel: string, freeText?: string) => void
  disabled: boolean
}

const ACTION_COLORS: Record<string, string> = {
  explore: 'border-green-700 hover:bg-green-900/30 text-green-400',
  combat: 'border-red-700 hover:bg-red-900/30 text-red-400',
  dialogue: 'border-blue-700 hover:bg-blue-900/30 text-blue-400',
  trade: 'border-yellow-700 hover:bg-yellow-900/30 text-yellow-400',
  navigate: 'border-gray-700 hover:bg-gray-800 text-gray-400',
  retreat: 'border-orange-700 hover:bg-orange-900/30 text-orange-400',
  special: 'border-purple-700 hover:bg-purple-900/30 text-purple-400',
}

export function ActionBar({ actions, onAction, disabled }: ActionBarProps) {
  const [freeText, setFreeText] = useState('')

  function handleSubmitFreeText(e: React.FormEvent) {
    e.preventDefault()
    if (!freeText.trim() || disabled) return
    onAction('free_text', freeText.trim(), freeText.trim())
    setFreeText('')
  }

  return (
    <div className="space-y-3 border-t border-gray-800 pt-4">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id, action.label)}
            disabled={disabled}
            className={`px-3 py-2 rounded border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              ACTION_COLORS[action.type] ?? ACTION_COLORS.special
            }`}
            title={action.description}
          >
            {action.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmitFreeText} className="flex gap-2">
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          disabled={disabled}
          placeholder="Or type your own action..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={disabled || !freeText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}
