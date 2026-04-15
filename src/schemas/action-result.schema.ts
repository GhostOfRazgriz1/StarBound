import { z } from 'zod'
import { equipmentLootSchema } from './encounter.schema'

/** Coerce non-arrays to empty arrays before validation */
function coerceArray<T extends z.ZodTypeAny>(schema: T) {
  return z.any().transform((val) => {
    if (Array.isArray(val)) return val
    return []
  }).pipe(z.array(schema))
}

/** Parse equipment array — individually resilient, drops items that fail */
const coerceEquipmentGained = z.any().transform((val) => {
  if (!Array.isArray(val)) return []
  const results: z.infer<typeof equipmentLootSchema>[] = []
  for (const item of val) {
    if (!item || typeof item !== 'object') continue
    try {
      results.push(equipmentLootSchema.parse(item))
    } catch {
      // Drop items that fail validation rather than losing the entire array
    }
  }
  return results
})

const CONSUMABLE_TYPE_ALIASES: Record<string, string> = {
  repair: 'repair', 'repair kit': 'repair', 'repair_kit': 'repair', hull: 'repair',
  fuel: 'fuel', 'fuel cell': 'fuel', 'fuel_cell': 'fuel', energy: 'fuel',
  shield: 'shield', 'shield boost': 'shield', 'shield_booster': 'shield',
  decoy: 'decoy', 'decoy drone': 'decoy', 'decoy_drone': 'decoy',
  probe: 'probe', scanner: 'probe', sensor: 'probe',
  beacon: 'beacon', signal: 'beacon', distress: 'beacon',
  data: 'data', 'data chip': 'data', 'data_chip': 'data', chip: 'data', intel: 'data',
  device: 'device', unknown: 'device', artifact: 'device',
  diplomatic: 'diplomatic', 'diplomatic cache': 'diplomatic', cache: 'diplomatic',
}

export const consumableLootSchema = z.object({
  name: z.string(),
  type: z.string().transform((val) => CONSUMABLE_TYPE_ALIASES[val.toLowerCase()] ?? 'device'),
  effect: z.string().default('unknown effect'),
  magnitude: z.number().optional(),
  uses: z.number().default(1),
}).passthrough()

/** Parse consumable array — individually resilient, drops items that fail */
const coerceConsumablesGained = z.any().transform((val) => {
  if (!Array.isArray(val)) return []
  const results: z.infer<typeof consumableLootSchema>[] = []
  for (const item of val) {
    if (!item || typeof item !== 'object') continue
    try {
      results.push(consumableLootSchema.parse(item))
    } catch { /* drop invalid items */ }
  }
  return results
})

/** Accept string or boolean and coerce to boolean */
const coerceBool = z.any().transform((val) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1'
  return false
})

const actionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().default(''),
  type: z.string().default('special'),
}).passthrough()

export const stateChangesSchema = z.any().transform((val) => {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return {}
  return val
}).pipe(z.object({
  hull: z.number().optional(),
  fuel: z.number().optional(),
  supplies: z.number().optional(),
  credits: z.number().optional(),
  morale: z.number().optional(),
  equipmentGained: coerceEquipmentGained.optional(),
  equipmentLost: coerceArray(z.string()).optional(),
  consumablesGained: coerceConsumablesGained.optional(),
  consumablesLost: coerceArray(z.string()).optional(),
}).passthrough())

export const actionResultSchema = z.object({
  narration: z.string(),
  foComment: z.string(),
  stateChanges: stateChangesSchema,
  newActions: coerceArray(actionSchema),
  encounterContinues: coerceBool,
  combatTriggered: coerceBool,
}).passthrough()

export const combatResultSchema = z.object({
  outcome: z.string().transform((val) => {
    const lower = val.toLowerCase().replace(/\s+/g, '_')
    const valid = ['victory', 'defeat', 'partial_success', 'negotiated', 'fled']
    if (valid.includes(lower)) return lower
    if (lower.includes('win') || lower.includes('success') || lower.includes('won')) return 'victory'
    if (lower.includes('lose') || lower.includes('lost') || lower.includes('destroy')) return 'defeat'
    if (lower.includes('flee') || lower.includes('escape') || lower.includes('retreat')) return 'fled'
    if (lower.includes('negot') || lower.includes('deal') || lower.includes('truce')) return 'negotiated'
    return 'partial_success'
  }) as z.ZodType<'victory' | 'defeat' | 'partial_success' | 'negotiated' | 'fled'>,
  narration: z.string(),
  foComment: z.string(),
  stateChanges: stateChangesSchema,
  enemyStateChange: z.string().default(''),
  newActions: coerceArray(actionSchema),
  combatContinues: coerceBool,
}).passthrough()

export const narrationResultSchema = z.object({
  narration: z.string(),
  foComment: z.string(),
  actions: coerceArray(actionSchema),
}).passthrough()

export const compressionResultSchema = z.object({
  summary: z.string(),
  arcUpdate: z.any().transform((val) => {
    if (!val || typeof val !== 'object') return undefined
    return {
      stageAdvance: Boolean(val.stageAdvance),
      motivationRevealed: val.motivationRevealed ?? null,
      targetRevealed: val.targetRevealed ?? null,
      antagonistUpdate: val.antagonistUpdate ?? undefined,
    }
  }).optional(),
}).passthrough()
