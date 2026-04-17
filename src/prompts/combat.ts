import type { RunState } from '../types/game'
import type { PirateEncounter } from '../types/encounters'

export function buildCombatPrompt(
  runState: RunState,
  enemy: PirateEncounter,
  playerAction: string,
): string {
  const ship = runState.ship

  return [
    `COMBAT RESOLUTION — Player chose: "${playerAction}"`,
    '',
    'Enemy:',
    `  Faction: ${enemy.faction}`,
    `  Strength: ${enemy.strength}/5 relative to player`,
    `  Ships: ${enemy.ships}`,
    `  Demand: ${enemy.demand}`,
    `  Motivation: ${enemy.motivation}`,
    `  Negotiable: ${enemy.negotiable}`,
    '',
    `Player hull: ${ship.hull}/${ship.maxHull}`,
    '',
    'RESOLUTION GUIDELINES:',
    `- Enemy strength ${enemy.strength}/5 means: ${getStrengthDescription(enemy.strength)}`,
    '- The player\'s equipment (detailed in system context) directly affects outcome — reference it in narration',
    '- Resource costs should be proportional to enemy strength',
    '- If the player\'s approach is clever and matches their equipment, reward it',
    '- If the player\'s approach ignores their disadvantages, consequences should follow',
    enemy.negotiable
      ? '- This enemy IS open to negotiation if approached well'
      : '- This enemy is NOT interested in talking',
    '',
    `Encounter depth: ${runState.encounterDepth}`,
    runState.encounterDepth === 'standard'
      ? '- Resolve this in a single response. Describe the full outcome.'
      : '- Resolve only the immediate result of this action. Present new tactical options. Combat continues.',
    '',
    'Respond with JSON:',
    '{ "outcome": "victory"|"defeat"|"partial_success"|"negotiated"|"fled",',
    '  "narration": string, "foComment": string,',
    '  "stateChanges": { hull?, fuel?, credits?, morale?, supplies?, equipmentGained?, equipmentLost? },',
    '  "enemyStateChange": string (brief description of enemy status),',
    '  "newActions": [{ id, label, description, type }],',
    '  "combatContinues": boolean }',
  ].join('\n')
}

function getStrengthDescription(strength: number): string {
  switch (strength) {
    case 1: return 'very weak — should be trivially dispatched, minimal risk'
    case 2: return 'weak — manageable with basic equipment, low risk'
    case 3: return 'even match — outcome depends heavily on tactics and equipment'
    case 4: return 'strong — player should take damage even with good tactics'
    case 5: return 'overwhelming — player cannot win a straight fight, must be clever or flee'
    default: return 'unknown threat level'
  }
}
