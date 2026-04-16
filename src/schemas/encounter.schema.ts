import { z } from 'zod'
import { consumableLootSchema } from './action-result.schema'

// --- Helpers for LLM output normalization ---

const SLOT_ALIASES: Record<string, string> = {
  weapons: 'weapons', weapon: 'weapons', guns: 'weapons', armament: 'weapons',
  shields: 'shields', shield: 'shields', defense: 'shields', armor: 'shields',
  engine: 'engine', engines: 'engine', propulsion: 'engine', drive: 'engine',
  special: 'module_1', utility: 'module_1', misc: 'module_1', module: 'module_1',
  module_1: 'module_1', module_2: 'module_2', module_3: 'module_3',
}

const RARITY_ALIASES: Record<string, string> = {
  common: 'common', normal: 'common', basic: 'common',
  uncommon: 'uncommon', unusual: 'uncommon', fine: 'uncommon',
  rare: 'rare', epic: 'rare',
  legendary: 'legendary', mythic: 'legendary', unique: 'legendary',
}

const DISPOSITION_ALIASES: Record<string, string> = {
  hostile: 'hostile', aggressive: 'hostile', angry: 'hostile', violent: 'hostile',
  wary: 'wary', cautious: 'wary', suspicious: 'wary', guarded: 'wary',
  neutral: 'neutral', indifferent: 'neutral',
  friendly: 'friendly', welcoming: 'friendly', open: 'friendly', warm: 'friendly',
  desperate: 'desperate', pleading: 'desperate', panicked: 'desperate',
}

/** Coerce a string to an enum via alias map, with a fallback */
function coerceEnum<T extends string>(aliases: Record<string, string>, fallback: T) {
  return z.string().transform((val) => (aliases[val.toLowerCase()] ?? fallback) as T)
}

/** Accept number and clamp to range */
function clampedNumber(min: number, max: number) {
  return z.number().transform((val) => Math.max(min, Math.min(max, Math.round(val))))
}

/** Accept string, number, or boolean and coerce to boolean */
const coerceBool = z.any().transform((val) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1'
  return false
})

/** Accept string or missing and provide fallback */
function coerceString(fallback = '') {
  return z.any().transform((val) => (typeof val === 'string' && val.length > 0) ? val : fallback)
}

// --- Equipment schema (used in derelicts, traders, action results) ---

export const equipmentLootSchema = z.object({
  name: z.string(),
  slot: coerceEnum(SLOT_ALIASES, 'special'),
  rarity: coerceEnum(RARITY_ALIASES, 'common'),
  origin: coerceString('unknown'),
  effect: coerceString('no special effect'),
  flavor: coerceString(''),
}).passthrough()

// --- Encounter schemas ---

export const civilizationSchema = z.object({
  type: z.literal('civilization'),
  name: z.string(),
  techLevel: clampedNumber(1, 5),
  disposition: coerceEnum(DISPOSITION_ALIASES, 'neutral'),
  cultureHook: coerceString('a unique culture'),
  resource: coerceString('basic trade goods'),
  secret: coerceString('nothing immediately apparent'),
  tradeWilling: coerceBool,
}).passthrough()

export const derelictSchema = z.object({
  type: z.literal('derelict'),
  origin: coerceString('unknown'),
  age: coerceString('indeterminate'),
  condition: coerceString('deteriorating'),
  hazard: coerceString('structural instability'),
  loot: z.any().transform((val) => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return null
    try { return equipmentLootSchema.parse(val) } catch { return null }
  }),
  consumableLoot: z.any().transform((val) => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return null
    try { return consumableLootSchema.parse(val) } catch { return null }
  }).optional(),
  clue: coerceString('no clear connection'),
}).passthrough()

export const anomalySchema = z.object({
  type: z.literal('anomaly'),
  phenomenon: coerceString('unknown anomaly'),
  visual: coerceString('unusual sensor readings'),
  risk: coerceString('unknown risk'),
  reward: coerceString('scientific data'),
  scientificInterest: clampedNumber(1, 5),
}).passthrough()

export const pirateSchema = z.object({
  type: z.literal('pirate'),
  faction: coerceString('unknown raiders'),
  strength: clampedNumber(1, 5),
  ships: z.number().transform((val) => Math.max(1, Math.round(val))),
  demand: coerceString('your cargo'),
  motivation: coerceString('profit'),
  negotiable: coerceBool,
  connectedToArc: coerceBool,
}).passthrough()

export const traderItemSchema = z.object({
  name: z.string(),
  type: z.string().transform((val) => {
    const lower = val.toLowerCase()
    if (['equipment', 'weapon', 'shield', 'armor', 'gear'].includes(lower)) return 'equipment'
    if (['fuel', 'energy', 'power'].includes(lower)) return 'fuel'
    if (['supplies', 'food', 'medical', 'supply'].includes(lower)) return 'supplies'
    if (['consumable', 'item', 'usable', 'single-use', 'one-time'].includes(lower)) return 'consumable'
    return 'info'
  }) as z.ZodType<'equipment' | 'fuel' | 'supplies' | 'info' | 'consumable'>,
  price: z.any().transform((val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') { const n = parseFloat(val); if (!isNaN(n)) return n }
    return 20 // default price
  }),
  effect: coerceString('standard'),
  amount: z.any().transform((val) => {
    if (typeof val === 'number' && val > 0) return Math.round(val)
    // Try to extract a number from effect text (e.g. "Restores 30 fuel")
    return undefined
  }).optional(),
  equipment: z.any().transform((val) => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return undefined
    try { return equipmentLootSchema.parse(val) } catch { return undefined }
  }).optional(),
  consumable: z.any().transform((val) => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return undefined
    try { return consumableLootSchema.parse(val) } catch { return undefined }
  }).optional(),
}).transform((item) => {
  // Infer amount for fuel/supplies if not provided
  if ((item.type === 'fuel' || item.type === 'supplies') && !item.amount) {
    // Try to parse from effect string
    const match = item.effect.match(/(\d+)/)
    if (match) {
      item.amount = Math.min(parseInt(match[1], 10), 100)
    } else {
      // Default based on price: roughly 1 unit per 1.5 credits
      item.amount = Math.max(10, Math.round(item.price / 1.5))
    }
  }
  return item
})

export const traderSchema = z.object({
  type: z.literal('trader'),
  name: z.string(),
  stock: z.array(traderItemSchema),
  personality: coerceString('reserved'),
  rumor: coerceString('nothing noteworthy'),
}).passthrough()

export const quietSchema = z.object({
  type: z.literal('quiet'),
  foReflection: coerceString('reflecting on recent events'),
}).passthrough()

export const encounterSchema = z.discriminatedUnion('type', [
  civilizationSchema,
  derelictSchema,
  anomalySchema,
  pirateSchema,
  traderSchema,
  quietSchema,
])
