interface ArcStageInfo {
  description: string
  instruction: string
}

export function getArcInjection(stage: number): ArcStageInfo {
  switch (stage) {
    case 1:
      return {
        description: 'Early mission — hints and foreshadowing only',
        instruction: '- Subtly hint at a larger threat: nervous traders, damaged ships, uneasy civilizations. Do NOT reveal the antagonist directly.',
      }
    case 2:
      return {
        description: 'Rising tension — direct evidence of the antagonist',
        instruction: '- Include clear evidence of antagonist activity: raided outposts, refugee stories, intercepted transmissions. The FO should start connecting dots across sectors.',
      }
    case 3:
      return {
        description: 'Confrontation — first direct encounter with the antagonist',
        instruction: '- The antagonist should be directly present or their agents should confront the player. Reveal their motivation. Make them complex, not cartoonishly evil.',
      }
    case 4:
      return {
        description: 'Escalation — the stakes are clear, the climax approaches',
        instruction: '- Tension should be high. The antagonist\'s goal is almost within reach. The player must make difficult choices. Prior decisions should have consequences here.',
      }
    case 5:
      return {
        description: 'Climax — final confrontation',
        instruction: '- This is the final encounter. Everything the player has done should matter. The antagonist\'s plan reaches its culmination. Multiple resolution paths should be available.',
      }
    default:
      return {
        description: 'Standard exploration',
        instruction: '',
      }
  }
}
