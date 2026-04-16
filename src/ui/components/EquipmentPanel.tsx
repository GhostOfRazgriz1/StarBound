import { memo } from 'react'
import type { ShipEquipment, EquipmentSlot } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'
import { t } from '../../i18n'

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapons: 'equip.weapons',
  shields: 'equip.shields',
  engine: 'equip.engine',
  module_1: 'Module 1',
  module_2: 'Module 2',
  module_3: 'Module 3',
}

const SLOT_ORDER: EquipmentSlot[] = ['weapons', 'shields', 'engine', 'module_1', 'module_2', 'module_3']

export const EquipmentPanel = memo(function EquipmentPanel({ equipment }: { equipment: ShipEquipment }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('equip.title')}</h3>
      {SLOT_ORDER.map((slot) => {
        const item = equipment[slot]
        const label = SLOT_LABELS[slot]
        const displayLabel = label.startsWith('equip.') ? t(label as 'equip.weapons' | 'equip.shields' | 'equip.engine') : label
        return (
          <div key={slot} className="flex items-start gap-2 text-sm">
            <span className="text-gray-600 w-16 shrink-0">{displayLabel}</span>
            {item ? (
              <div>
                <span style={{ color: RARITY_CONFIG[item.rarity].color }}>
                  {item.name}
                </span>
                <p className="text-xs text-gray-600">{item.effect}</p>
              </div>
            ) : (
              <span className="text-gray-700">{slot.startsWith('module') ? 'empty' : t('equip.standardIssue')}</span>
            )}
          </div>
        )
      })}
    </div>
  )
})
