import type { ShipEquipment, EquipmentSlot } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapons: 'Weapons',
  shields: 'Shields',
  engine: 'Engine',
  special: 'Special',
}

const SLOT_ORDER: EquipmentSlot[] = ['weapons', 'shields', 'engine', 'special']

export function EquipmentPanel({ equipment }: { equipment: ShipEquipment }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</h3>
      {SLOT_ORDER.map((slot) => {
        const item = equipment[slot]
        return (
          <div key={slot} className="flex items-start gap-2 text-sm">
            <span className="text-gray-600 w-16 shrink-0">{SLOT_LABELS[slot]}</span>
            {item ? (
              <div>
                <span style={{ color: RARITY_CONFIG[item.rarity].color }}>
                  {item.name}
                </span>
                <p className="text-xs text-gray-600">{item.effect}</p>
              </div>
            ) : (
              <span className="text-gray-700">standard issue</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
