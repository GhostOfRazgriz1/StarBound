import type { RunState } from '../types/game'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

const ALL_BADGES: Array<Badge & { check: (run: RunState) => boolean }> = [
  {
    id: 'pacifist',
    name: 'Pacifist',
    description: 'Completed the mission without entering combat',
    icon: '\u2660',
    check: (run) => run.sectorMap.every((s) => s.type !== 'pirate') || run.sectorMap.filter((s) => s.type === 'pirate').every((s) => s.retreated),
  },
  {
    id: 'no_retreat',
    name: 'No Retreat',
    description: 'Never fled from an encounter',
    icon: '\u2693',
    check: (run) => run.sectorMap.every((s) => !s.retreated),
  },
  {
    id: 'explorer',
    name: 'Completionist',
    description: 'Visited every sector',
    icon: '\u2605',
    check: (run) => run.sectorMap.length >= run.totalSectors,
  },
  {
    id: 'fo_friend',
    name: "FO's Friend",
    description: 'Followed FO advice 80%+ of the time',
    icon: '\u2764',
    check: (run) => run.captainProfile.decisionsTracked >= 5 && run.captainProfile.followsFOAdvice >= 0.8,
  },
  {
    id: 'lone_wolf',
    name: 'Lone Wolf',
    description: 'Overrode FO advice 80%+ of the time',
    icon: '\u{1F43A}',
    check: (run) => run.captainProfile.decisionsTracked >= 5 && run.captainProfile.followsFOAdvice <= 0.2,
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Contacted 3+ civilizations peacefully',
    icon: '\u{1F54A}',
    check: (run) => run.sectorMap.filter((s) => s.type === 'civilization' && !s.retreated).length >= 3,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Finished with hull below 20%',
    icon: '\u{1F480}',
    check: (run) => run.ship.hull > 0 && run.ship.hull <= run.ship.maxHull * 0.2,
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: 'Ended the mission with 4+ cargo items',
    icon: '\u{1F4E6}',
    check: (run) => (run.ship.cargo.length + (run.ship.consumables || []).length) >= 4,
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Ended with more credits than you started with',
    icon: '\u{1F4B0}',
    check: (run) => run.ship.credits >= 300,
  },
  {
    id: 'risk_taker',
    name: 'Risk Taker',
    description: 'Risk appetite above 80%',
    icon: '\u{1F525}',
    check: (run) => run.captainProfile.decisionsTracked >= 5 && run.captainProfile.riskAppetite >= 0.8,
  },
  {
    id: 'curious',
    name: 'Insatiably Curious',
    description: 'Curiosity score above 80%',
    icon: '\u{1F52D}',
    check: (run) => run.captainProfile.decisionsTracked >= 5 && run.captainProfile.curiosity >= 0.8,
  },
]

export function evaluateBadges(run: RunState): Badge[] {
  return ALL_BADGES
    .filter((b) => b.check(run))
    .map(({ id, name, description, icon }) => ({ id, name, description, icon }))
}
