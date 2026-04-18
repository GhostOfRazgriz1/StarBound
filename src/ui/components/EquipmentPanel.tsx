import { memo } from 'react'
import type { ShipEquipment, EquipmentSlot } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'
import { t } from '../../i18n'

const CORE_SLOTS: Array<{ slot: EquipmentSlot; labelKey: 'equip.weapons' | 'equip.shields' | 'equip.engine' }> = [
  { slot: 'weapons', labelKey: 'equip.weapons' },
  { slot: 'shields', labelKey: 'equip.shields' },
  { slot: 'engine', labelKey: 'equip.engine' },
]

export const EquipmentPanel = memo(function EquipmentPanel({ equipment }: { equipment: ShipEquipment }) {
  const modules = [equipment.module_1, equipment.module_2, equipment.module_3].filter(Boolean)

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('equip.title')}</h3>

      {/* Core slots */}
      {CORE_SLOTS.map(({ slot, labelKey }) => {
        const item = equipment[slot]
        return (
          <div key={slot} className="flex items-start gap-2 text-sm">
            <span className="text-gray-600 w-16 shrink-0">{t(labelKey)}</span>
            {item ? (
              <div>
                <span style={{ color: RARITY_CONFIG[item.rarity].color }}>{item.name}</span>
                <p className="text-xs text-gray-600">{item.effect}</p>
              </div>
            ) : (
              <span className="text-gray-700">{t('equip.standardIssue')}</span>
            )}
          </div>
        )
      })}

      {/* Module queue */}
      <div className="flex items-start gap-2 text-sm pt-1 border-t border-gray-800/50">
        <span className="text-gray-600 w-16 shrink-0">{t('equip.modules' as Parameters<typeof t>[0])}</span>
        {modules.length > 0 ? (
          <div className="space-y-1">
            {modules.map((item, i) => (
              <div key={item!.id ?? i}>
                <span style={{ color: RARITY_CONFIG[item!.rarity].color }}>{item!.name}</span>
                <p className="text-xs text-gray-600">{item!.effect}</p>
              </div>
            ))}
            <p className="text-[10px] text-gray-700">{t('equip.moduleQueue' as Parameters<typeof t>[0], { count: modules.length })}</p>
          </div>
        ) : (
          <span className="text-gray-700">{t('equip.empty' as Parameters<typeof t>[0])}</span>
        )}
      </div>
    </div>
  )
})
