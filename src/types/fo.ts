export type FOArchetype = 'chen' | 'osei' | 'vasquez'

export type FOPriority = 'crew_safety' | 'mission' | 'discovery'
export type FOHumor = 'dry' | 'earnest' | 'sardonic' | 'none'
export type FamiliarityTier = 'professional' | 'working' | 'trust'

export interface FOPersonality {
  name: string
  rank: string
  fullName: string
  archetype: FOArchetype
  temperament: number        // 0 = cautious, 1 = bold
  formality: number          // 0 = formal, 1 = casual
  priority: FOPriority
  trustOfUnknown: number     // 0 = skeptical, 1 = trusting
  humor: FOHumor
  expertise: string
  blindSpot: string
  tagline: string            // their signature line
  description: string        // player-facing description
}

export interface CaptainProfile {
  riskAppetite: number       // 0-1
  diplomatic: number         // 0-1
  followsFOAdvice: number    // 0-1
  crewPriority: number       // 0-1
  curiosity: number          // 0-1
  decisionsTracked: number   // total decisions for weighted averaging
}

export interface FOCrossRunMemory {
  archetype: FOArchetype
  runsTogether: number
  captainArchetype: string | null  // derived from captain profile
  memorableMoments: string[]       // 3-5 key moments
  relationshipState: string        // grudging respect, warm, tense, mentor, friends
  runningObservations: string      // patterns noticed
}

export const FO_ARCHETYPES: Record<FOArchetype, FOPersonality> = {
  chen: {
    name: 'Chen',
    rank: 'Commander',
    fullName: 'Commander Reva Chen',
    archetype: 'chen',
    temperament: 0.3,
    formality: 0.5,
    priority: 'crew_safety',
    trustOfUnknown: 0.3,
    humor: 'dry',
    expertise: 'tactics',
    blindSpot: 'diplomacy',
    tagline: "I've buried enough crew for one career, Captain.",
    description: 'Veteran officer. Cautious, protective of the crew, dry humor. Excellent tactical instincts but tends to misjudge diplomatic situations.',
  },
  osei: {
    name: 'Osei',
    rank: 'Lieutenant',
    fullName: 'Lieutenant Kael Osei',
    archetype: 'osei',
    temperament: 0.8,
    formality: 0.7,
    priority: 'discovery',
    trustOfUnknown: 0.7,
    humor: 'earnest',
    expertise: 'xenology',
    blindSpot: 'threat_assessment',
    tagline: 'Captain, do you realize what we are looking at?',
    description: 'Science officer. Bold, curious, gets excited about first contact and anomalies. Tends to downplay danger in pursuit of discovery.',
  },
  vasquez: {
    name: 'Vasquez',
    rank: 'Ensign',
    fullName: 'Ensign Mira Vasquez',
    archetype: 'vasquez',
    temperament: 0.5,
    formality: 0.3,
    priority: 'mission',
    trustOfUnknown: 0.4,
    humor: 'sardonic',
    expertise: 'technology',
    blindSpot: 'reading_people',
    tagline: 'Three options. Two of them get us killed.',
    description: 'Tactical prodigy. Strategic, calculating, mission-focused. Excellent with ship systems but misreads alien intentions and treats everything like a chess problem.',
  },
}

export function createDefaultCaptainProfile(): CaptainProfile {
  return {
    riskAppetite: 0.5,
    diplomatic: 0.5,
    followsFOAdvice: 0.5,
    crewPriority: 0.5,
    curiosity: 0.5,
    decisionsTracked: 0,
  }
}

export function createDefaultFOMemory(archetype: FOArchetype): FOCrossRunMemory {
  return {
    archetype,
    runsTogether: 0,
    captainArchetype: null,
    memorableMoments: [],
    relationshipState: 'new',
    runningObservations: '',
  }
}

export function getFamiliarityTier(sectorNumber: number, _followsFOAdvice: number): FamiliarityTier {
  if (sectorNumber <= 3) return 'professional'
  if (sectorNumber <= 8) return 'working'
  return 'trust'
}
