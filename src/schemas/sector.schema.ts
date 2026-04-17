import { z } from 'zod'
import { encounterSchema } from './encounter.schema'

const ENCOUNTER_TYPE_ALIASES: Record<string, string> = {
  civilization: 'civilization', civ: 'civilization', culture: 'civilization', alien: 'civilization', contact: 'civilization',
  derelict: 'derelict', wreck: 'derelict', wreckage: 'derelict', abandoned: 'derelict', ruins: 'derelict',
  anomaly: 'anomaly', phenomenon: 'anomaly', distortion: 'anomaly', strange: 'anomaly',
  pirate: 'pirate', pirates: 'pirate', raider: 'pirate', raiders: 'pirate', hostile: 'pirate', combat: 'pirate',
  trader: 'trader', merchant: 'trader', trade: 'trader', shop: 'trader', vendor: 'trader',
  quiet: 'quiet', empty: 'quiet', calm: 'quiet', nothing: 'quiet', peaceful: 'quiet',
}

const encounterTypeSchema = z.string().transform((val) => {
  const normalized = ENCOUNTER_TYPE_ALIASES[val.toLowerCase()]
  return (normalized ?? 'quiet') as 'civilization' | 'derelict' | 'anomaly' | 'pirate' | 'trader' | 'quiet'
})

function clampedNumber(min: number, max: number) {
  return z.number().transform((val) => Math.max(min, Math.min(max, Math.round(val))))
}

export const sectorPreviewSchema = z.object({
  name: z.string(),
  description: z.string(),
  riskLevel: clampedNumber(1, 5),
  interestLevel: clampedNumber(1, 5),
  distance: z.any().transform((val) => {
    if (typeof val === 'number') return Math.max(1, Math.min(3, Math.round(val)))
    return 1 // default to close
  }),
  encounterType: encounterTypeSchema,
}).passthrough()

export const sectorPreviewsSchema = z.object({
  sectors: z.array(sectorPreviewSchema).transform((arr) => {
    // Ensure at least 2, at most 4 (beacon can add an extra option)
    if (arr.length < 2) return [...arr, ...arr].slice(0, 2)
    return arr.slice(0, 4)
  }),
}).passthrough()

export const sectorGenerationSchema = z.object({
  name: z.string(),
  encounter: encounterSchema,
}).passthrough()

export const sectorWithNarrationSchema = z.object({
  name: z.string(),
  encounter: encounterSchema,
  narration: z.string(),
  foComment: z.string(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().default(''),
    type: z.string().default('special'),
  }).passthrough()),
}).passthrough()
