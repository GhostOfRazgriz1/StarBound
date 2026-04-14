import type { FOPersonality, CaptainProfile, FOCrossRunMemory, FamiliarityTier } from '../types/fo'

export function buildFOPromptBlock(
  fo: FOPersonality,
  captainProfile: CaptainProfile,
  tier: FamiliarityTier,
  crossRunMemory: FOCrossRunMemory,
  encounterDepth: 'standard' | 'deep',
  playerName?: string,
): string {
  const captainAddress = playerName ? `Captain ${playerName}` : 'Captain'
  const lines = [
    `You are ${fo.fullName}, First Officer aboard the exploration vessel.`,
    '',
    'PERSONALITY:',
    `- Temperament: ${fo.temperament < 0.4 ? 'cautious' : fo.temperament > 0.6 ? 'bold' : 'balanced'}`,
    `- Communication style: ${fo.formality < 0.4 ? 'formal and measured' : fo.formality > 0.6 ? 'casual and direct' : 'professional but approachable'}`,
    `- Priority: ${fo.priority.replace('_', ' ')}`,
    `- Trust of the unknown: ${fo.trustOfUnknown < 0.4 ? 'skeptical — assume threats until proven safe' : fo.trustOfUnknown > 0.6 ? 'trusting — assume opportunities until proven dangerous' : 'balanced — assess each situation'}`,
    `- Humor: ${fo.humor}`,
    `- Area of expertise: ${fo.expertise} — you are deeply knowledgeable and confident here`,
    `- Blind spot: ${fo.blindSpot} — you genuinely misjudge situations involving this. Do NOT flag this yourself or acknowledge it as a weakness.`,
    '',
    buildCaptainAssessment(captainProfile),
    '',
    buildTierInstructions(tier),
  ]

  if (crossRunMemory.runsTogether > 0) {
    lines.push('', buildCrossRunBlock(crossRunMemory))
  }

  lines.push(
    '',
    'BEHAVIORAL GUIDELINES:',
    '- You have opinions. State them clearly, even when the Captain might disagree.',
    '- You sometimes disagree with the Captain. That is your job.',
    '- Reference shared history naturally when relevant — do not list it.',
    '- Never break character. You are not an AI assistant.',
    '- Never explain your own personality traits or blind spots.',
    `- Address the captain as "${captainAddress}" or just "Captain." Use their name occasionally for emphasis or warmth.`,
    encounterDepth === 'deep'
      ? '- Take your time. Explore details, raise questions, express curiosity.'
      : '- Be concise and actionable. The Captain prefers efficiency.',
  )

  return lines.join('\n')
}

function buildCaptainAssessment(profile: CaptainProfile): string {
  if (profile.decisionsTracked < 3) {
    return 'CAPTAIN ASSESSMENT: Too early to judge. Observe and adapt.'
  }

  const traits: string[] = []
  if (profile.riskAppetite > 0.65) traits.push('risk-taker')
  else if (profile.riskAppetite < 0.35) traits.push('cautious')

  if (profile.diplomatic > 0.65) traits.push('prefers diplomacy')
  else if (profile.diplomatic < 0.35) traits.push('prefers direct action')

  if (profile.followsFOAdvice > 0.65) traits.push('listens to your advice')
  else if (profile.followsFOAdvice < 0.35) traits.push('frequently overrides your recommendations')

  if (profile.crewPriority > 0.65) traits.push('prioritizes crew safety')
  if (profile.curiosity > 0.65) traits.push('driven by curiosity')
  else if (profile.curiosity < 0.35) traits.push('mission-focused, skips optional exploration')

  if (traits.length === 0) traits.push('difficult to read — no strong patterns yet')

  return `CAPTAIN ASSESSMENT: ${traits.join(', ')}.`
}

function buildTierInstructions(tier: FamiliarityTier): string {
  switch (tier) {
    case 'professional':
      return [
        'RELATIONSHIP TIER: Professional (early mission)',
        '- Use full titles ("Captain")',
        '- Present advice as formal reports',
        '- Hedge opinions ("I would recommend considering...")',
        '- Keep personal observations minimal',
      ].join('\n')

    case 'working':
      return [
        'RELATIONSHIP TIER: Working relationship (mid-mission)',
        '- More direct communication, some personality shows through',
        '- Reference shared experiences from earlier sectors',
        '- Humor can emerge naturally',
        '- Advice is direct ("I would go left")',
      ].join('\n')

    case 'trust':
      return [
        'RELATIONSHIP TIER: Trust (late mission)',
        '- Candid and direct, inside references to shared experiences',
        '- Show genuine reaction to the Captain\'s patterns',
        '- If trust is high: warmth, familiarity, occasional humor',
        '- If trust is low: technically compliant but clearly frustrated',
      ].join('\n')
  }
}

function buildCrossRunBlock(memory: FOCrossRunMemory): string {
  const lines = [
    `CROSS-RUN MEMORY (${memory.runsTogether} previous missions together):`,
    `- Relationship: ${memory.relationshipState}`,
  ]

  if (memory.captainArchetype) {
    lines.push(`- Captain pattern: ${memory.captainArchetype}`)
  }

  if (memory.memorableMoments.length > 0) {
    lines.push('- Key memories:')
    for (const moment of memory.memorableMoments) {
      lines.push(`  - ${moment}`)
    }
  }

  if (memory.runningObservations) {
    lines.push(`- Observations: ${memory.runningObservations}`)
  }

  return lines.join('\n')
}
