import { useState } from 'react'
import { useGameStore } from '../../storage/game-store'
import { FO_ARCHETYPES } from '../../types/fo'
import { CostIndicator } from '../components/CostIndicator'
import { evaluateBadges } from '../../engine/badges'
import { t } from '../../i18n'

export function RunEndScreen() {
  const run = useGameStore((s) => s.run)
  const playerName = useGameStore((s) => s.playerName)
  const setPhase = useGameStore((s) => s.setPhase)
  const captainAnalysis = useGameStore((s) => s.captainAnalysis)
  const [copied, setCopied] = useState(false)

  if (!run) return null

  const fo = FO_ARCHETYPES[run.foArchetype]
  const survived = run.ship.hull > 0
  const sectorsExplored = run.sectorMap.length
  const retreats = run.sectorMap.filter((s) => s.retreated).length

  const analysis = captainAnalysis as {
    typeName?: string
    typeSubtitle?: string
    description?: string
    strengths?: string[]
    blindSpots?: string[]
    foQuote?: string
    commandStyle?: string
  } | null

  function buildShareText(): string {
    const lines = [
      `STARBOUND — Captain ${playerName || 'Unknown'}`,
      '',
    ]

    if (analysis?.typeName) {
      lines.push(`${analysis.typeName}`)
      if (analysis.typeSubtitle) lines.push(`"${analysis.typeSubtitle}"`)
      lines.push('')
    }

    lines.push(`Mission: ${run!.scenario.replace(/_/g, ' ')}`)
    lines.push(`FO: ${fo.fullName}`)
    lines.push(`Sectors: ${sectorsExplored} | ${survived ? 'Survived' : 'Ship destroyed'}`)
    lines.push('')

    if (analysis?.description) {
      lines.push(analysis.description)
      lines.push('')
    }

    if (analysis?.foQuote) {
      lines.push(`FO ${fo.name}: "${analysis.foQuote}"`)
      lines.push('')
    }

    lines.push(`Play at: [your-url-here]`)

    return lines.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Mission outcome */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-100">
            {survived ? t('end.missionComplete') : t('end.shipDestroyed')}
          </h1>
          <p className="text-gray-500">
            {survived
              ? t('end.survivedText')
              : t('end.destroyedText')}
          </p>
        </div>

        {/* Captain Profile Card */}
        {analysis?.typeName ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-blue-400 uppercase tracking-widest">Captain {playerName || 'Unknown'}</p>
              <h2 className="text-2xl font-bold text-gray-100">{analysis.typeName}</h2>
              {analysis.typeSubtitle && (
                <p className="text-sm text-gray-400 italic">"{analysis.typeSubtitle}"</p>
              )}
              {analysis.commandStyle && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-900/30 border border-blue-800/50 rounded-full text-xs text-blue-300 uppercase tracking-wider">
                  {analysis.commandStyle}
                </span>
              )}
            </div>

            {analysis.description && (
              <p className="text-sm text-gray-400 leading-relaxed text-center">
                {analysis.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div>
                  <p className="text-xs text-green-500 uppercase tracking-wider mb-1">{t('end.strengths')}</p>
                  {analysis.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-gray-400">+ {s}</p>
                  ))}
                </div>
              )}
              {analysis.blindSpots && analysis.blindSpots.length > 0 && (
                <div>
                  <p className="text-xs text-red-400 uppercase tracking-wider mb-1">{t('end.blindSpots')}</p>
                  {analysis.blindSpots.map((s, i) => (
                    <p key={i} className="text-xs text-gray-500">- {s}</p>
                  ))}
                </div>
              )}
            </div>

            {analysis.foQuote && (
              <div className="pt-3 border-t border-gray-700">
                <p className="text-sm text-blue-300/70 italic text-center">
                  "{analysis.foQuote}"
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  — {fo.fullName}
                </p>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
              >
                {copied ? t('end.copied') : t('end.copyToShare')}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-600 animate-pulse">
            {t('end.analyzing')}
          </div>
        )}

        {/* Badges */}
        {(() => {
          const badges = evaluateBadges(run)
          if (badges.length === 0) return null
          return (
            <div className="flex flex-wrap justify-center gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-900/50 border border-yellow-700/50 rounded-lg px-4 py-3 text-center min-w-[100px]"
                  title={badge.description}
                >
                  <p className="text-2xl">{badge.icon}</p>
                  <p className="text-xs text-yellow-400 font-semibold mt-1">{badge.name}</p>
                  <p className="text-[10px] text-gray-500">{badge.description}</p>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Mission stats */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('end.missionReport')}</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">{t('end.sectorsExplored')}</span>
              <p className="text-gray-200 text-lg">{sectorsExplored}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('end.retreats')}</span>
              <p className="text-gray-200 text-lg">{retreats}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('end.finalHull')}</span>
              <p className="text-gray-200 text-lg">{run.ship.hull}%</p>
            </div>
            <div>
              <span className="text-gray-500">{t('end.creditsRemaining')}</span>
              <p className="text-gray-200 text-lg">{run.ship.credits}</p>
              {survived && run.ship.credits > 0 && (
                <p className="text-xs text-yellow-400">{t('end.bankDeposit' as Parameters<typeof t>[0], { amount: Math.floor(run.ship.credits * 0.5) })}</p>
              )}
            </div>
            <div>
              <span className="text-gray-500">Research</span>
              <p className="text-gray-200 text-lg">{run.ship.research}</p>
              {survived && run.ship.research > 0 && (
                <p className="text-xs text-cyan-400">+{run.ship.research} RP banked</p>
              )}
            </div>
            <div>
              <span className="text-gray-500">{t('end.firstOfficer')}</span>
              <p className="text-gray-200">{fo.fullName}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('end.foAgreement')}</span>
              <p className="text-gray-200">{Math.round(run.captainProfile.followsFOAdvice * 100)}%</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <h4 className="text-xs text-gray-500 uppercase mb-2">{t('end.sectorsVisited')}</h4>
            <div className="space-y-1">
              {run.sectorMap.map((s, i) => (
                <div key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-gray-600 w-4">{s.sectorNumber}.</span>
                  <span className={s.retreated ? 'text-orange-400' : ''}>{s.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <CostIndicator />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setPhase('scenario_select')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
          >
            {t('end.newMission')}
          </button>
          <button
            onClick={() => setPhase('setup')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors"
          >
            {t('end.settings')}
          </button>
        </div>
      </div>
    </div>
  )
}
