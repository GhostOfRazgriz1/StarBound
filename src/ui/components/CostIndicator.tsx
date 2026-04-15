import { useGameStore } from '../../storage/game-store'
import { estimateCostUSD, formatCost } from '../../llm/token-estimator'
import { t } from '../../i18n'

export function CostIndicator() {
  const tokens = useGameStore((s) => s.totalTokensUsed)
  const model = useGameStore((s) => s.llmConfig?.model ?? '')

  const cost = estimateCostUSD(tokens.input, tokens.output, model)

  return (
    <div className="text-xs text-gray-600 flex items-center gap-3">
      <span>{t('cost.tokens', { count: (tokens.input + tokens.output).toLocaleString() })}</span>
      <span>{t('cost.estCost', { cost: formatCost(cost) })}</span>
    </div>
  )
}
