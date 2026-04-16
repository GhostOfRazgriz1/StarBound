import type { RunState } from '../types/game'
import type { EncounterType } from '../types/encounters'
import { getArcInjection } from './arc-injection'

export function buildSectorPreviewPrompt(runState: RunState): string {
  const arc = getArcInjection(runState.storyArc.stage)

  return [
    'Generate 2-3 sector preview options for the player to choose from.',
    '',
    `The player is at sector ${runState.currentSectorNumber} of ${runState.totalSectors}.`,
    `Story arc stage: ${runState.storyArc.stage} — ${arc.description}`,
    '',
    'Each sector should have:',
    '- name: a location name (star system, nebula, station, etc.)',
    '- description: 1-2 sentence sensor readout (what the player sees before choosing)',
    '- riskLevel: 1-5',
    '- interestLevel: 1-5',
    '- encounterType: one of "civilization", "derelict", "anomaly", "pirate", "trader", "quiet"',
    '',
    'Guidelines:',
    '- Offer variety — different encounter types across the options',
    '- At least one option should be relatively safe, one more risky',
    '- Risk and interest should generally correlate (higher risk = higher reward)',
    arc.instruction,
    '',
    'Respond with JSON: { "sectors": [ { name, description, riskLevel, interestLevel, encounterType }, ... ] }',
  ].join('\n')
}

export function buildSectorGenerationPrompt(
  encounterType: EncounterType,
  sectorName: string,
  runState: RunState,
): string {
  const arc = getArcInjection(runState.storyArc.stage)
  const encounterInstructions = getEncounterInstructions(encounterType)

  // Collect what's been generated so far to avoid repetition
  const previousEncounters = runState.sectorMap
    .map((s) => `Sector ${s.sectorNumber} (${s.type}): ${s.summary}`)
    .join('\n')

  const lines = [
    `Generate a full sector encounter for: "${sectorName}"`,
    `Encounter type: ${encounterType}`,
    '',
    `Story arc context: ${arc.description}`,
    arc.instruction,
    '',
    'Generate the encounter data as JSON:',
    '{ "name": "sector name", "encounter": { ... } }',
    '',
    encounterInstructions,
  ]

  if (previousEncounters) {
    lines.push(
      '',
      'PREVIOUSLY VISITED SECTORS (do NOT repeat similar themes, species, or concepts):',
      previousEncounters,
      '',
      'Generate something DIFFERENT from everything above.',
    )
  }

  return lines.join('\n')
}

function getEncounterInstructions(type: EncounterType): string {
  switch (type) {
    case 'civilization':
      return [
        'Civilization encounter schema:',
        '{ type: "civilization", name: string, techLevel: 1-5, disposition: "hostile"|"wary"|"neutral"|"friendly"|"desperate",',
        '  cultureHook: string (what makes them unique), resource: string (what they can trade),',
        '  secret: string (hidden info connected to the larger story), tradeWilling: boolean }',
        '',
        'CIVILIZATION DESIGN RULES:',
        '- Each civilization must feel genuinely alien — not "humans but blue" or "humanoids who glow."',
        '- The cultureHook is the MOST IMPORTANT field. It should be specific and surprising.',
        '',
        'VARY across these dimensions (pick a DIFFERENT combination each time):',
        '',
        'Biology: crystalline, gaseous, fungal network, silicon-based, hive organism, energy beings,',
        '  living metal, symbiotic pairs, microscopic swarm intelligence, plant-based sessile,',
        '  exist in multiple dimensions, liquid-state, parasitic collective, non-corporeal,',
        '  geological (living rock/mineral), cryogenic, electromagnetic, acoustic (exist as sound)',
        '',
        'Society: monarchy, anarchic collective, AI-governed, elder council, dream-consensus,',
        '  memory-sharing gestalt, caste by function, nomadic fleet, religious theocracy,',
        '  merchant republic, warrior meritocracy, artistic commune, silence-worshippers,',
        '  cyclic (culture resets every N generations), post-scarcity, feudal, democratic AI',
        '',
        'Communication: chemical signals, color patterns, gravitational pulses, mathematical proofs,',
        '  shared hallucination, physical sculpture, time-delayed messages, emotional radiation,',
        '  magnetic field modulation, vibration through substrate, light-based sign language,',
        '  silence (communicate by what they withhold), dance/movement, gift-exchange',
        '',
        'Quirk (pick one): they have no concept of lying | they experience time non-linearly |',
        '  they consider individuals temporary | they worship entropy | they are terrified of silence |',
        '  they trade memories as currency | they cannot perceive our ship directly |',
        '  they believe they are the universe dreaming | every member is a copy of the original |',
        '  they have already predicted this encounter | they are at war with themselves |',
        '  they consider music a weapon | death is a social event they celebrate',
        '',
        'DO NOT use: bioluminescent, humanoid, telepathic (unless it\'s the ONLY unusual thing about them),',
        '  "ancient and wise," crystalline caves (unless the SPECIES is crystalline), tribal/primitive tropes.',
        'The secret should connect to the story arc or other sectors.',
      ].join('\n')

    case 'derelict':
      return [
        'Derelict encounter schema:',
        '{ type: "derelict", origin: string, age: string, condition: string,',
        '  hazard: string, loot: { name, slot, rarity, origin, effect, flavor } | null,',
        '  clue: string (connects to story arc) }',
        '',
        'slot must be one of: "weapons", "shields", "engine", "special"',
        'rarity must be one of: "common", "uncommon", "rare", "legendary"',
        '',
        'DERELICT VARIETY — pick a different origin each time:',
        'Origin types: military warship, science vessel, colony ship, prison transport,',
        '  alien megastructure, automated factory, luxury yacht, medical quarantine ship,',
        '  time-displaced vessel from the future/past, interdimensional intruder,',
        '  AI-piloted drone carrier, generation ship, diplomatic courier, pirate flagship,',
        '  living ship (biological), mining platform, observatory station',
        '',
        'The derelict must tell a story — what happened to the crew?',
        'Optionally include consumableLoot: { name, type, effect, magnitude?, uses? } alongside or instead of equipment loot.',
        'Hazards should be specific (not just "radiation"): escaped specimens, rogue AI,',
        '  temporal loops, hull breach with micro-debris, automated defense systems still active,',
        '  psychoactive atmosphere, gravitational anomalies within the hull.',
      ].join('\n')

    case 'anomaly':
      return [
        'Anomaly encounter schema:',
        '{ type: "anomaly", phenomenon: string, visual: string,',
        '  risk: string, reward: string, scientificInterest: 1-5 }',
        '',
        'ANOMALY VARIETY — go beyond "weird energy field":',
        'Types: temporal distortion, spatial fold, dark matter concentration, living nebula,',
        '  gravity lens, quantum echo (copies of the ship appearing), rogue wormhole,',
        '  stellar nursery with accelerated star formation, dimensional bleed-through,',
        '  void pocket (area where physics stops), singing pulsar, memory field (relives past events),',
        '  crystallized time, inverse entropy zone (things un-decay), sentient mathematics',
        '',
        'The visual should be evocative and specific — not just "glowing."',
        'The risk and reward should create a real dilemma.',
        'Anomalies may yield consumable items as rewards — include them in the narration if appropriate.',
      ].join('\n')

    case 'pirate':
      return [
        'Pirate encounter schema:',
        '{ type: "pirate", faction: string, strength: 1-5, ships: number,',
        '  demand: string, motivation: string, negotiable: boolean, connectedToArc: boolean }',
        '',
        'Pirates should have clear motivations — they are not random evil.',
        'If connected to the arc, tie them to the main antagonist.',
      ].join('\n')

    case 'trader':
      return [
        'Trader encounter schema:',
        '{ type: "trader", name: string,',
        '  stock: [{ name, type, price, effect, amount?, equipment? }],',
        '  personality: string, rumor: string }',
        '',
        'Stock item types and required fields:',
        '- type "fuel": amount (number, 10-40, how much fuel it restores), price, effect (flavor description)',
        '- type "supplies": amount (number, 10-40, how much it restores), price, effect (flavor description)',
        '- type "equipment": equipment object required: { name, slot, rarity, origin, effect, flavor }',
        '  slot must be: "weapons"|"shields"|"engine"|"module_1"|"module_2"|"module_3"',
        '  rarity must be: "common"|"uncommon"|"rare"|"legendary"',
        '- type "info": price, effect (the actual intel the player receives — make it specific and useful)',
        '- type "consumable": consumable object required: { name, type, effect, magnitude?, uses? }',
        '  type must be: "repair"|"fuel"|"shield"|"decoy"|"probe"|"beacon"|"data"|"device"|"diplomatic"',
        '  Instant types (repair/fuel/shield/decoy) MUST include magnitude (amount restored).',
        '  Triggered types (probe/beacon/data/device/diplomatic) have unpredictable effects.',
        '',
        'Include 4-6 items. Always include at least one fuel, one supplies, and one consumable.',
        'The rumor should hint at the story arc — something the trader mentions casually.',
        'Prices should feel fair: fuel/supplies 15-40cr, equipment 30-100cr, info 10-30cr, consumables 15-50cr.',
      ].join('\n')

    case 'quiet':
      return [
        'Quiet sector schema:',
        '{ type: "quiet", foReflection: string }',
        '',
        'This is a character development moment. The FO reflects on recent events.',
        'The foReflection is a topic or question the FO wants to discuss with the Captain.',
      ].join('\n')
  }
}
