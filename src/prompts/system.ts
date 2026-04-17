import type { RunState } from '../types/game'
import type { Sector } from '../types/encounters'
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
  options?: { omitSectorHistory?: boolean },
): string {
  const foBlock = buildFOPromptBlock(fo, runState.captainProfile, tier, foMemory, runState.encounterDepth, playerName)

  const shipState = serializeShipState(runState)
  const sectorContext = serializeSectorContext(runState, options?.omitSectorHistory ?? false)

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
    '- stateChanges: object — resource changes as numbers (e.g., { fuel: -5, credits: 20, research: 3 })',
    '- newActions: array of { id, label, description, type } — 3-5 available actions for the player',
    '- encounterContinues: boolean — whether the player is still in this encounter',
    '- combatTriggered: boolean — whether combat has started',
    '',
    '# NARRATION GUIDELINES',
    '- Write in second person present tense ("You see...", "Your sensors detect...")',
    '- Be vivid but concise — 2-3 short paragraphs max',
    '- Make resource costs and state changes feel consequential in the narration',
    '- Never reveal hidden information (secrets, clues) directly — let the FO connect dots',
    '- If an item is granted in stateChanges (equipmentGained/consumablesGained), the narration must show the player TAKING it — not just seeing it. Do not offer "secure the item" as a follow-up action for something already in stateChanges.',
    '',
    '# ANTI-REPETITION RULES',
    '- NEVER give the player the same item, information, or reward twice within a sector.',
    '- If an item was already included in equipmentGained or consumablesGained in a PREVIOUS response, do NOT include it again. The player already has it.',
    '- An item that was narratively discovered or given in a previous response should NOT appear in stateChanges again — reference it in narration only ("the generator you secured earlier").',
    '- Check your own prior responses in this conversation — if something was already given or revealed, do NOT repeat it.',
    '- Items mentioned narratively (discovered, spotted) are NOT yet acquired. Only items returned in stateChanges.equipmentGained or consumablesGained are owned. Do not re-grant them.',
    '- If the player shares information with a civilization that the civilization already knows or that came FROM them, acknowledge it but do NOT give the same info/item back.',
    '- Avoid circular exchanges: if the player received X and shares X back, the response should be "they already know this" not "here is X again."',
    '',
    '# ENCOUNTER PACING',
    '- A sector encounter should last 2-4 meaningful interactions, then END. Set encounterContinues to false.',
    '- Using a consumable is NOT a meaningful interaction — it should resolve quickly and return to the existing encounter options. Do NOT generate new consumables when the player uses one.',
    '- Do NOT pad encounters with filler actions. If the encounter\'s main content is resolved (item found, deal made, data gathered), the encounter is OVER.',
    '- When setting encounterContinues to false, narrate a natural conclusion and include ONLY a "move_on" action.',
    '- Beacons and probes, when used, should reveal information about nearby sectors or the story arc — NOT generate more items. They are intel tools.',
    '- If the player keeps choosing to explore/investigate after the main encounter is resolved, wrap it up: "There is nothing more of interest here."',
    '',
    '# RESOURCE CHANGE RULES',
    '- credits: ONLY change during explicit trade, purchases, bribes, or rewards. Exploring, scanning, talking, moving — NEVER cost credits.',
    '- fuel: deduct only for travel between sectors, emergency maneuvers, or powering special systems. Normal actions within a sector cost NO fuel. When BUYING fuel from a trader, use { fuel: +20, credits: -30 }.',
    '- supplies: deduct only for crew injuries, extended stays, or using consumable resources. Most actions cost NO supplies. When BUYING supplies from a trader, use { supplies: +20, credits: -25 }.',
    '- hull: deduct only for combat damage, hazard exposure, or accidents. Never for routine actions.',
    '- morale: changes based on major events — victories, losses, discoveries, crew deaths. Not every action affects morale.',
    '- research: award 1-5 RP for scientific discoveries, anomaly study, derelict data extraction, civilization cultural exchange, or using data consumables. Anomalies and derelicts are the primary sources. Do NOT award research for combat, trade, or routine navigation.',
    '- If an action has no meaningful resource cost, return an EMPTY stateChanges object: {}',
    '- Do NOT invent costs for actions that would logically be free.',
    '',
    '# EQUIPMENT AND ITEMS',
    '- When the player finds, buys, or is given a piece of EQUIPMENT (weapons, shields, engine, special module), include it in stateChanges.equipmentGained.',
    '- equipmentGained is an array of objects: [{ name, slot, rarity, origin, effect, flavor }]',
    '- slot MUST be one of: "weapons", "shields", "engine", "module"',
    '- The ship has 3 module slots that work as a queue (oldest replaced when full).',
    '- Distribute equipment evenly. Do NOT always generate module items — vary between weapons, shields, engine, and module.',
    '- rarity MUST be one of: "common", "uncommon", "rare", "legendary"',
    '- Fuel and supply purchases are NOT equipment — use the numeric fields (fuel, supplies) for those.',
    '- Information and intel are NOT equipment — describe them in narration only.',
    '',
    '# CONSUMABLES',
    '- CONSUMABLES are single-use items separate from equipment. They go in stateChanges.consumablesGained.',
    '- consumablesGained format: [{ name, type, effect, magnitude?, uses? }]',
    '- type MUST be one of: "repair", "fuel", "shield", "decoy", "probe", "beacon", "data", "device", "diplomatic"',
    '- Instant types (repair, fuel, shield, decoy, data, beacon) MUST include a magnitude number or a descriptive effect.',
    '- "data" type consumables are INSTANT — they grant research points equal to their magnitude when used.',
    '- "beacon" type consumables are INSTANT — their effect field should describe what the beacon detects (e.g., "Faint energy signature from a derelict research station"). When used, this unlocks a bonus sector destination matching the description.',
    '- Triggered types (probe, device, diplomatic) have unpredictable context-dependent effects when activated.',
    '- Do NOT put consumables in equipmentGained — they are a separate category.',
    '- Consumables should be given FREQUENTLY — most non-combat encounters should yield at least one consumable.',
    '- Derelicts should almost always contain a consumable (repair kits, data chips, fuel cells, etc.).',
    '- Anomalies should yield data consumables when studied.',
    '- Civilizations may gift diplomatic caches or probes as goodwill gestures.',
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
    `Ship — Hull: ${s.hull}/${s.maxHull}, Fuel: ${s.fuel}/${s.maxFuel}, Supplies: ${s.supplies}/${s.maxSupplies}, Credits: ${s.credits}, Morale: ${s.morale}, Research: ${s.research}`,
    `Equipment:`,
    `  Weapons: ${eq.weapons ? `${eq.weapons.name} (${eq.weapons.effect})` : 'standard issue'}`,
    `  Shields: ${eq.shields ? `${eq.shields.name} (${eq.shields.effect})` : 'standard issue'}`,
    `  Engine: ${eq.engine ? `${eq.engine.name} (${eq.engine.effect})` : 'standard issue'}`,
    `  Modules (${[eq.module_1, eq.module_2, eq.module_3].filter(Boolean).length}/3 queue): ${[eq.module_1, eq.module_2, eq.module_3].filter(Boolean).map(m => `${m!.name} (${m!.effect})`).join(', ') || 'empty'}`,
    `Consumables (${(s.consumables || []).length}/${MAX_CONSUMABLES}):${(s.consumables || []).length > 0 ? '\n' + (s.consumables || []).map(c => `  - ${c.name} (${c.type}, ${c.resolution})${c.magnitude ? ` [str: ${c.magnitude}]` : ''} [uses: ${c.uses}]`).join('\n') : ' none'}`,
    `Sector: ${state.currentSectorNumber} of ${state.totalSectors}`,
    `Story Arc: stage ${state.storyArc.stage}, antagonist: ${state.storyArc.antagonist}`,
  ].join('\n')
}

function serializeSectorContext(state: RunState, omitSectorHistory: boolean): string {
  const lines = ['# MISSION HISTORY']

  if (state.sectorMap.length === 0) {
    lines.push('No sectors visited yet — this is the beginning of the mission.')
  } else {
    for (const s of state.sectorMap) {
      lines.push(`Sector ${s.sectorNumber} (${s.type}): ${s.summary}${s.retreated ? ' [RETREATED]' : ''}`)
    }
  }

  if (state.currentSector) {
    // Full encounter JSON on first action; compact summary on subsequent actions
    if (state.sectorHistory.length === 0) {
      lines.push('', '# CURRENT SECTOR', JSON.stringify(state.currentSector.encounter, null, 2))
    } else {
      lines.push('', '# CURRENT SECTOR (summary)', buildCompactEncounterSummary(state.currentSector))
    }

    // In multi-turn mode, history comes from message pairs — skip inline serialization
    if (!omitSectorHistory && state.sectorHistory.length > 0) {
      lines.push('', '# ACTIONS TAKEN THIS SECTOR')
      const MAX_FULL_ENTRIES = 3
      if (state.sectorHistory.length > MAX_FULL_ENTRIES) {
        const older = state.sectorHistory.slice(0, -MAX_FULL_ENTRIES)
        const recent = state.sectorHistory.slice(-MAX_FULL_ENTRIES)
        lines.push(`[${older.length} earlier actions: ${older.map(e => {
          const firstLine = e.split('\n')[0]
          return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine
        }).join(' | ')}]`)
        lines.push('')
        for (const entry of recent) {
          lines.push(entry)
        }
      } else {
        for (const entry of state.sectorHistory) {
          lines.push(entry)
        }
      }
    }
  }

  return lines.join('\n')
}

function buildCompactEncounterSummary(sector: Sector): string {
  const enc = sector.encounter
  switch (enc.type) {
    case 'trader':
      return `Trader: ${enc.name} — ${enc.stock.length} items in stock. Personality: ${enc.personality}.`
    case 'pirate':
      return `Pirates: ${enc.faction}, strength ${enc.strength}/5, ${enc.ships} ship(s). Demand: ${enc.demand}. Negotiable: ${enc.negotiable}.`
    case 'civilization':
      return `Civilization: ${enc.name}, tech ${enc.techLevel}, disposition: ${enc.disposition}. Resource: ${enc.resource}.`
    case 'derelict':
      return `Derelict: ${enc.origin}, condition: ${enc.condition}. Hazard: ${enc.hazard}.`
    case 'anomaly':
      return `Anomaly: ${enc.phenomenon}. Risk: ${enc.risk}. Reward: ${enc.reward}.`
    case 'quiet':
      return `Quiet sector. FO reflection topic: ${enc.foReflection}.`
  }
}
