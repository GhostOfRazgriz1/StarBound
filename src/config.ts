import type { Scenario, ScenarioId } from './types/game'

export const TOTAL_SECTORS = 12

export const RETREAT_COSTS = {
  fuel: 10,
  morale: 10,
} as const

export const TRAVEL_COSTS = {
  fuelPerDistance: 8,      // fuel cost per distance unit
  suppliesPerDistance: 3,  // crew sustenance per distance unit
} as const

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  deep_space_survey: {
    id: 'deep_space_survey',
    name: 'Deep Space Survey',
    description: 'Chart the uncharted. A standard exploration mission into unknown space — but the frontier is rarely quiet.',
    arcTemplate: {
      stage: 1,
      antagonist: 'The Burn Collective',
      motivation: null,
      target: null,
    },
    encounterWeights: {
      civilization: 20,
      derelict: 20,
      anomaly: 25,
      pirate: 15,
      trader: 10,
      quiet: 10,
    },
    provisioningBudget: 400,
  },
  distress_signal: {
    id: 'distress_signal',
    name: 'Distress Signal',
    description: 'A frontier colony has gone silent. Race through hostile space to find out why — before whatever silenced them finds you.',
    arcTemplate: {
      stage: 1,
      antagonist: 'Unknown Threat',
      motivation: null,
      target: null,
    },
    encounterWeights: {
      civilization: 10,
      derelict: 25,
      anomaly: 15,
      pirate: 25,
      trader: 10,
      quiet: 15,
    },
    provisioningBudget: 350,
  },
  first_contact: {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Signals of intelligent origin detected beyond the rim. Make contact — carefully. Not everyone out here wants to be found.',
    arcTemplate: {
      stage: 1,
      antagonist: 'Rival Expedition',
      motivation: null,
      target: null,
    },
    encounterWeights: {
      civilization: 35,
      derelict: 10,
      anomaly: 20,
      pirate: 10,
      trader: 15,
      quiet: 10,
    },
    provisioningBudget: 450,
  },
  border_patrol: {
    id: 'border_patrol',
    name: 'Border Patrol',
    description: 'The outer colonies are under siege. Patrol the border, protect the settlements, and find out who is behind the raids.',
    arcTemplate: {
      stage: 1,
      antagonist: 'Raider Clans',
      motivation: null,
      target: null,
    },
    encounterWeights: {
      civilization: 15,
      derelict: 15,
      anomaly: 10,
      pirate: 30,
      trader: 15,
      quiet: 15,
    },
    provisioningBudget: 500,
  },
}

export const DEFAULT_ENCOUNTER_DEPTH = 'standard' as const

export const AVAILABLE_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1'],
  anthropic: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'],
  google: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  openrouter: ['google/gemini-2.5-flash', 'anthropic/claude-sonnet-4', 'meta-llama/llama-4-maverick', 'deepseek/deepseek-chat-v3'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  qwen: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
}
