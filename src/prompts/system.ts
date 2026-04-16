import type { RunState } from '../types/game'
import type { FOPersonality, FOCrossRunMemory, FamiliarityTier } from '../types/fo'
import { buildFOPromptBlock } from './fo-personality'
import { MAX_CONSUMABLES } from '../types/consumable'
import { useGameStore } from '../storage/game-store'
import { LANGUAGES } from '../i18n'

export function buildSystemPrompt(
  runState: RunState,
  fo: FOPersonality,
  tier: FamiliarityTier,
  foMemory: FOCrossRunMemory,
  playerName?: string,
): string {
  const foBlock = buildFOPromptBlock(fo, runState.captainProfile, tier, foMemory, runState.encounterDepth, playerName)

  const shipState = serializeShipState(runState)
  const sectorContext = serializeSectorContext(runState)

  const lang = useGameStore.getState().language
  const langName = LANGUAGES[lang] ?? 'English'
  const langInstruction = lang !== 'en'
    ? `\n\n# LANGUAGE\nAll narration, foComment, action labels, and action descriptions MUST be written in ${langName}. JSON keys remain in English. Only the string VALUES should be in ${langName}.`
    : ''

  const sections = [
    '# GAME CONTEXT',
    'You are running a text-based space exploration game. The player is the Captain of an exploration vessel on a deep space mission.',
    'You play the role of the First Officer (FO). You narrate events AND speak as the FO character.',
    langInstruction,
    '',
    '# OUTPUT FORMAT',
    'Always respond with valid JSON containing these fields:',
    '- narration: string — what happens (2-3 paragraphs, second person, present tense)',
    '- foComment: string — the FO\'s in-character reaction/advice (1-3 sentences)',
    '- stateChanges: object — resource changes as numbers (e.g., { fuel: -5, credits: 20 })',
    '- newActions: array of { id, label, description, type } — 3-5 available actions for the player',
    '- encounterContinues: boolean — whether the player is still in this encounter',
    '- combatTriggered: boolean — whether combat has started',
    '',
    '# NARRATION GUIDELINES',
    '- Write in second person present tense ("You see...", "Your sensors detect...")',
    '- Be vivid but concise — 2-3 short paragraphs max',
    '- Make resource costs and state changes feel consequential in the narration',
    '- Never reveal hidden information (secrets, clues) directly — let the FO connect dots',
    '',
    '# ANTI-REPETITION RULES',
    '- NEVER give the player the same item, information, or reward twice within a sector.',
    '- Check the "ACTIONS TAKEN THIS SECTOR" section below — if something was already given or revealed, do NOT repeat it.',
    '- If the player shares information with a civilization that the civilization already knows or that came FROM them, acknowledge it but do NOT give the same info/item back.',
    '- After 3-4 meaningful interactions in a sector, the encounter should wind down. Set encounterContinues to false and offer a "move on" action.',
    '- Avoid circular exchanges: if the player received X and shares X back, the response should be "they already know this" not "here is X again."',
    '',
    '# RESOURCE CHANGE RULES',
    '- credits: ONLY change during explicit trade, purchases, bribes, or rewards. Exploring, scanning, talking, moving — NEVER cost credits.',
    '- fuel: deduct only for travel between sectors, emergency maneuvers, or powering special systems. Normal actions within a sector cost NO fuel. When BUYING fuel from a trader, use { fuel: +20, credits: -30 }.',
    '- supplies: deduct only for crew injuries, extended stays, or using consumable resources. Most actions cost NO supplies. When BUYING supplies from a trader, use { supplies: +20, credits: -25 }.',
    '- hull: deduct only for combat damage, hazard exposure, or accidents. Never for routine actions.',
    '- morale: changes based on major events — victories, losses, discoveries, crew deaths. Not every action affects morale.',
    '- If an action has no meaningful resource cost, return an EMPTY stateChanges object: {}',
    '- Do NOT invent costs for actions that would logically be free.',
    '',
    '# EQUIPMENT AND ITEMS',
    '- When the player finds, buys, or is given a piece of EQUIPMENT (weapons, shields, engine, special module), include it in stateChanges.equipmentGained.',
    '- equipmentGained is an array of objects: [{ name, slot, rarity, origin, effect, flavor }]',
    '- slot MUST be one of: "weapons", "shields", "engine", "module_1", "module_2", "module_3"',
    '- Distribute equipment evenly across slots. Do NOT always generate module items — vary between weapons, shields, engine, and modules.',
    '- rarity MUST be one of: "common", "uncommon", "rare", "legendary"',
    '- Fuel and supply purchases are NOT equipment — use the numeric fields (fuel, supplies) for those.',
    '- Information and intel are NOT equipment — describe them in narration only.',
    '',
    '# CONSUMABLES',
    '- CONSUMABLES are single-use items separate from equipment. They go in stateChanges.consumablesGained.',
    '- consumablesGained format: [{ name, type, effect, magnitude?, uses? }]',
    '- type MUST be one of: "repair", "fuel", "shield", "decoy", "probe", "beacon", "data", "device", "diplomatic"',
    '- Instant types (repair, fuel, shield, decoy) MUST include a magnitude number (how much they restore/boost).',
    '- Triggered types (probe, beacon, data, device, diplomatic) have unpredictable context-dependent effects when activated.',
    '- Do NOT put consumables in equipmentGained — they are a separate category.',
    '- Consumables are found in derelicts, anomalies, as rewards, or sold by traders.',
    '',
    '# FIRST OFFICER',
    foBlock,
    '',
    '# CURRENT STATE',
    shipState,
    '',
    sectorContext,
  ]

  if (runState.standingOrders.trim()) {
    sections.push('', "# CAPTAIN'S STANDING ORDERS", runState.standingOrders)
  }

  if (runState.captainsLog.trim()) {
    sections.push('', "# CAPTAIN'S LOG (this run)", runState.captainsLog)
  }

  return sections.join('\n')
}

function serializeShipState(state: RunState): string {
  const s = state.ship
  const eq = s.equipment
  return [
    `Ship — Hull: ${s.hull}/${s.maxHull}, Fuel: ${s.fuel}/${s.maxFuel}, Supplies: ${s.supplies}/${s.maxSupplies}, Credits: ${s.credits}, Morale: ${s.morale}`,
    `Equipment:`,
    `  Weapons: ${eq.weapons ? `${eq.weapons.name} (${eq.weapons.effect})` : 'standard issue'}`,
    `  Shields: ${eq.shields ? `${eq.shields.name} (${eq.shields.effect})` : 'standard issue'}`,
    `  Engine: ${eq.engine ? `${eq.engine.name} (${eq.engine.effect})` : 'standard issue'}`,
    `  Module 1: ${eq.module_1 ? `${eq.module_1.name} (${eq.module_1.effect})` : 'empty'}`,
    `  Module 2: ${eq.module_2 ? `${eq.module_2.name} (${eq.module_2.effect})` : 'empty'}`,
    `  Module 3: ${eq.module_3 ? `${eq.module_3.name} (${eq.module_3.effect})` : 'empty'}`,
    `Consumables (${(s.consumables || []).length}/${MAX_CONSUMABLES}):${(s.consumables || []).length > 0 ? '\n' + (s.consumables || []).map(c => `  - ${c.name} (${c.type}, ${c.resolution})${c.magnitude ? ` [str: ${c.magnitude}]` : ''} [uses: ${c.uses}]`).join('\n') : ' none'}`,
    `Sector: ${state.currentSectorNumber} of ${state.totalSectors}`,
    `Story Arc: stage ${state.storyArc.stage}, antagonist: ${state.storyArc.antagonist}`,
  ].join('\n')
}

function serializeSectorContext(state: RunState): string {
  const lines = ['# MISSION HISTORY']

  if (state.sectorMap.length === 0) {
    lines.push('No sectors visited yet — this is the beginning of the mission.')
  } else {
    for (const s of state.sectorMap) {
      lines.push(`Sector ${s.sectorNumber} (${s.type}): ${s.summary}${s.retreated ? ' [RETREATED]' : ''}`)
    }
  }

  if (state.currentSector) {
    lines.push('', '# CURRENT SECTOR', JSON.stringify(state.currentSector.encounter, null, 2))

    if (state.sectorHistory.length > 0) {
      lines.push('', '# ACTIONS TAKEN THIS SECTOR')
      for (const entry of state.sectorHistory) {
        lines.push(entry)
      }
    }
  }

  return lines.join('\n')
}
