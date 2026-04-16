import type { SectorSummary } from '../../types/game'
import type { SectorPreview } from '../../types/encounters'
import { t } from '../../i18n'

const tt = (key: string) => t(key as Parameters<typeof t>[0])

const ENCOUNTER_COLORS: Record<string, string> = {
  civilization: '#3b82f6',
  derelict: '#9ca3af',
  anomaly: '#a78bfa',
  pirate: '#ef4444',
  trader: '#f59e0b',
  quiet: '#6b7280',
  unknown: '#4b5563',
}

const NODE_RADIUS = 20
const NODE_SPACING_Y = 100  // vertical spacing between sectors
const NODE_SPACING_X = 120  // horizontal spread for option branches
const PADDING = 50
const CENTER_X = 300        // center column X position

interface StarChartProps {
  sectorMap: SectorSummary[]
  currentSectorNumber: number
  totalSectors: number
  currentSectorName: string | null
  sectorOptions: SectorPreview[]
  onClose: () => void
}

export function StarChart({
  sectorMap,
  currentSectorNumber,
  totalSectors,
  currentSectorName,
  sectorOptions,
  onClose,
}: StarChartProps) {
  // Build node list: visited + current + upcoming options
  const nodes: Array<{
    x: number
    y: number
    label: string
    type: string
    status: 'visited' | 'current' | 'option' | 'future'
    retreated: boolean
    sectorNum: number
  }> = []

  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; dimmed: boolean }> = []

  // Total rows needed for layout (visited + current + options + future)
  const totalRows = sectorMap.length + (currentSectorName ? 1 : 0) + (sectorOptions.length > 0 ? 1 : 0) + Math.min(3, totalSectors - currentSectorNumber)
  const chartHeight = PADDING * 2 + totalRows * NODE_SPACING_Y

  // Helper: Y position for a given row index (0 = bottom, higher = up)
  function rowY(row: number): number {
    return chartHeight - PADDING - row * NODE_SPACING_Y
  }

  // Visited sectors (bottom to top)
  for (let i = 0; i < sectorMap.length; i++) {
    const s = sectorMap[i]
    nodes.push({
      x: CENTER_X,
      y: rowY(i),
      label: s.summary.split('.')[0].slice(0, 30),
      type: s.type,
      status: 'visited',
      retreated: s.retreated,
      sectorNum: s.sectorNumber,
    })

    if (i > 0) {
      edges.push({
        x1: CENTER_X, y1: rowY(i - 1),
        x2: CENTER_X, y2: rowY(i),
        dimmed: false,
      })
    }
  }

  // Current sector
  const currentRow = sectorMap.length
  if (currentSectorName) {
    nodes.push({
      x: CENTER_X,
      y: rowY(currentRow),
      label: currentSectorName,
      type: 'unknown',
      status: 'current',
      retreated: false,
      sectorNum: currentSectorNumber,
    })

    if (sectorMap.length > 0) {
      edges.push({
        x1: CENTER_X, y1: rowY(currentRow - 1),
        x2: CENTER_X, y2: rowY(currentRow),
        dimmed: false,
      })
    }
  }

  // Sector options (branch left/right from the top of the path)
  const optionRow = currentSectorName ? currentRow + 1 : currentRow
  const fromRow = currentSectorName ? currentRow : Math.max(0, currentRow - 1)

  const optionStartX = CENTER_X - ((sectorOptions.length - 1) * NODE_SPACING_X) / 2
  for (let i = 0; i < sectorOptions.length; i++) {
    const opt = sectorOptions[i]
    const optX = optionStartX + i * NODE_SPACING_X

    nodes.push({
      x: optX,
      y: rowY(optionRow),
      label: opt.name,
      type: opt.encounterType,
      status: 'option',
      retreated: false,
      sectorNum: currentSectorNumber + (currentSectorName ? 1 : 0),
    })

    edges.push({
      x1: CENTER_X, y1: rowY(fromRow),
      x2: optX, y2: rowY(optionRow),
      dimmed: true,
    })
  }

  // Future placeholder nodes
  const futureStartRow = sectorOptions.length > 0 ? optionRow + 1 : optionRow
  const remainingSectors = totalSectors - currentSectorNumber - (currentSectorName ? 0 : -1)
  for (let i = 0; i < Math.min(remainingSectors, 3); i++) {
    nodes.push({
      x: CENTER_X,
      y: rowY(futureStartRow + i),
      label: tt('chart.unknown'),
      type: 'unknown',
      status: 'future',
      retreated: false,
      sectorNum: currentSectorNumber + i + 1,
    })
  }

  // Center all nodes: find bounds, then shift so content is centered
  const rawMinX = Math.min(...nodes.map((n) => n.x))
  const rawMaxX = Math.max(...nodes.map((n) => n.x))
  const contentWidth = rawMaxX - rawMinX + NODE_RADIUS * 2 + 160 // extra for labels
  const svgWidth = Math.max(contentWidth + PADDING * 2, 500)
  const svgHeight = Math.max(chartHeight, 300)

  // Shift everything so it's centered in the SVG
  const centerShift = (svgWidth / 2) - ((rawMinX + rawMaxX) / 2)
  for (const n of nodes) n.x += centerShift
  for (const e of edges) { e.x1 += centerShift; e.x2 += centerShift }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Chart window */}
      <div
        className="relative bg-[#0c0e14] border border-gray-700 rounded-lg shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-300 uppercase tracking-wider">{tt('chart.title')}</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-xs transition-colors"
          >
            {tt('chart.close')}
          </button>
        </div>

        {/* Scrollable chart area */}
        <div className="flex-1 overflow-auto p-4">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="min-w-full"
          >
          {/* Starfield background dots */}
          {Array.from({ length: 40 }, (_, i) => (
            <circle
              key={`star-${i}`}
              cx={(i * 137.5 + 50) % svgWidth}
              cy={(i * 83.7 + 20) % svgHeight}
              r={0.5 + (i % 3) * 0.5}
              fill="#374151"
            />
          ))}

          {/* Edges */}
          {edges.map((e, i) => (
            <line
              key={`edge-${i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.dimmed ? '#374151' : '#4b5563'}
              strokeWidth={e.dimmed ? 1 : 2}
              strokeDasharray={e.dimmed ? '4 4' : undefined}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const color = ENCOUNTER_COLORS[node.type] ?? ENCOUNTER_COLORS.unknown
            const isCurrent = node.status === 'current'
            const isOption = node.status === 'option'
            const isFuture = node.status === 'future'

            return (
              <g key={`node-${i}`}>
                {/* Pulse ring for current sector */}
                {isCurrent && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.4}
                  >
                    <animate
                      attributeName="r"
                      values={`${NODE_RADIUS + 4};${NODE_RADIUS + 10};${NODE_RADIUS + 4}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.1;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isFuture ? 6 : NODE_RADIUS}
                  fill={isFuture ? '#1f2937' : isOption ? '#1f2937' : color}
                  stroke={isFuture ? '#374151' : color}
                  strokeWidth={isOption ? 2 : isCurrent ? 2.5 : 1.5}
                  opacity={isFuture ? 0.4 : node.retreated ? 0.5 : 1}
                  strokeDasharray={isOption ? '3 3' : undefined}
                />

                {/* Retreat X mark */}
                {node.retreated && (
                  <>
                    <line x1={node.x - 7} y1={node.y - 7} x2={node.x + 7} y2={node.y + 7} stroke="#ef4444" strokeWidth={2.5} />
                    <line x1={node.x + 7} y1={node.y - 7} x2={node.x - 7} y2={node.y + 7} stroke="#ef4444" strokeWidth={2.5} />
                  </>
                )}

                {/* Sector number */}
                {!isFuture && (
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isOption ? color : '#fff'}
                    fontSize={13}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.sectorNum}
                  </text>
                )}

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 18}
                  textAnchor="middle"
                  fill={isFuture ? '#4b5563' : isOption ? '#6b7280' : '#9ca3af'}
                  fontSize={12}
                  fontFamily="sans-serif"
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${svgWidth / 2 - 250}, 20)`}>
            {Object.entries(ENCOUNTER_COLORS).filter(([k]) => k !== 'unknown').map(([type, color], i) => (
              <g key={type} transform={`translate(${i * 90}, 0)`}>
                <circle cx={6} cy={0} r={4} fill={color} />
                <text x={14} y={3} fill="#6b7280" fontSize={11} fontFamily="sans-serif">
                  {tt(`chart.${type}`)}
                </text>
              </g>
            ))}
          </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
