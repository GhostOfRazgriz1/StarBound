import type { TraderItem } from '../../types/encounters'
import type { Equipment } from '../../types/equipment'
import type { Ship } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'
import type { Consumable } from '../../types/consumable'
import { CONSUMABLE_SELL_VALUES, MAX_CONSUMABLES } from '../../types/consumable'
import { useGameStore } from '../../storage/game-store'
import { t } from '../../i18n'

export function TradePanel() {
  const showTrade = useGameStore((s) => s.showTrade)
  const traderName = useGameStore((s) => s.traderName)
  const stock = useGameStore((s) => s.tradeStock)
  const run = useGameStore((s) => s.run)
  const closeTrade = useGameStore((s) => s.closeTrade)
  const buyItem = useGameStore((s) => s.buyItem)
  const sellFromCargo = useGameStore((s) => s.sellFromCargo)
  const equipFromCargo = useGameStore((s) => s.equipFromCargo)
  const sellConsumable = useGameStore((s) => s.sellConsumable)

  if (!showTrade || !run) return null

  const ship = run.ship
  const cargo = ship.cargo

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">{t('trade.title')} — {traderName}</h2>
            <div className="flex gap-4 mt-1 text-xs font-mono">
              <span className="text-yellow-400">{t('status.credits')}: {ship.credits}</span>
              <span className="text-amber-500">{t('status.fuel')}: {ship.fuel}/{ship.maxFuel}</span>
              <span className="text-emerald-500">{t('status.supplies')}: {ship.supplies}/{ship.maxSupplies}</span>
            </div>
          </div>
          <button
            onClick={closeTrade}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-sm transition-colors"
          >
            {t('trade.done')}
          </button>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-800">
          {/* Buy column */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('trade.buy')}
            </h3>
            {stock.length === 0 ? (
              <p className="text-xs text-gray-600 italic">{t('trade.nothingInStock')}</p>
            ) : (
              <div className="space-y-2">
                {stock.map((item, i) => (
                  <BuyItemCard
                    key={i}
                    item={item}
                    ship={ship}
                    onBuy={() => buyItem(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sell / Cargo column */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('cargo.title')} ({cargo.length})
            </h3>
            {cargo.length === 0 && (ship.consumables || []).length === 0 ? (
              <p className="text-xs text-gray-600 italic">{t('trade.nothingInCargo')}</p>
            ) : (
              <div className="space-y-2">
                {cargo.map((item) => (
                  <CargoItemCard
                    key={item.id}
                    item={item}
                    equipment={ship.equipment}
                    onSell={() => sellFromCargo(item.id)}
                    onEquip={() => equipFromCargo(item.id)}
                  />
                ))}
                {(ship.consumables || []).map((item) => (
                  <ConsumableSellCard
                    key={item.id}
                    item={item}
                    onSell={() => sellConsumable(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BuyItemCard({ item, ship, onBuy }: { item: TraderItem; ship: Ship; onBuy: () => void }) {
  const canAfford = ship.credits >= item.price
  const isFull = (item.type === 'fuel' && ship.fuel >= ship.maxFuel) ||
                 (item.type === 'supplies' && ship.supplies >= ship.maxSupplies) ||
                 (item.type === 'consumable' && (ship.consumables || []).length >= MAX_CONSUMABLES)
  const disabled = !canAfford || isFull

  // Build description
  let typeLabel: string
  if (item.type === 'fuel') {
    typeLabel = `${t('status.fuel')} +${item.amount ?? 20}`
  } else if (item.type === 'supplies') {
    typeLabel = `${t('status.supplies')} +${item.amount ?? 20}`
  } else if (item.type === 'equipment') {
    typeLabel = t('trade.equipment')
  } else if (item.type === 'consumable') {
    typeLabel = 'Consumable'
  } else {
    typeLabel = t('trade.intel')
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-700/50 rounded p-3 space-y-1 ${isFull ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-200">{item.name}</span>
        <span className="text-xs text-gray-500 shrink-0">{typeLabel}</span>
      </div>
      <p className="text-xs text-gray-500">{item.effect}</p>
      {item.equipment && (
        <p className="text-xs" style={{ color: RARITY_CONFIG[item.equipment.rarity]?.color ?? '#9ca3af' }}>
          {RARITY_CONFIG[item.equipment.rarity]?.label} [{item.equipment.slot}] — {item.equipment.effect}
        </p>
      )}
      <button
        onClick={onBuy}
        disabled={disabled}
        className="mt-1 px-2 py-1 text-xs rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-blue-900/40 border-blue-800/50 text-blue-400 hover:bg-blue-800/40"
      >
        {isFull ? t('trade.full') : !canAfford ? t('trade.needCredits', { amount: item.price }) : t('trade.buyFor', { price: item.price })}
      </button>
    </div>
  )
}

function CargoItemCard({
  item,
  equipment,
  onSell,
  onEquip,
}: {
  item: Equipment
  equipment: Ship['equipment']
  onSell: () => void
  onEquip: () => void
}) {
  const sellValue = RARITY_CONFIG[item.rarity]?.sellValue ?? 10
  const currentInSlot = equipment[item.slot]

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded p-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: RARITY_CONFIG[item.rarity]?.color ?? '#9ca3af' }}>
          {item.name}
        </span>
        <span className="text-xs text-gray-600">[{item.slot}]</span>
      </div>
      <p className="text-xs text-gray-500">{item.effect}</p>
      {currentInSlot && (
        <p className="text-[10px] text-gray-600">
          {t('cargo.replaces', { name: currentInSlot.name })}
        </p>
      )}
      <div className="flex gap-1 pt-1">
        <button
          onClick={onEquip}
          className="px-2 py-0.5 text-[10px] rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors"
        >
          {t('cargo.equip')}
        </button>
        <button
          onClick={onSell}
          className="px-2 py-0.5 text-[10px] rounded bg-green-900/40 border border-green-800/50 text-green-400 hover:bg-green-800/40 transition-colors"
        >
          {t('trade.sellFor', { price: sellValue })}
        </button>
      </div>
    </div>
  )
}

function ConsumableSellCard({ item, onSell }: { item: Consumable; onSell: () => void }) {
  const sellValue = CONSUMABLE_SELL_VALUES[item.resolution]
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded p-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: item.resolution === 'instant' ? '#22d3ee' : '#fbbf24' }}>
          {item.name}
        </span>
        <span className="text-xs text-gray-600">[{item.type}]</span>
      </div>
      <p className="text-xs text-gray-500">{item.effect}</p>
      <button
        onClick={onSell}
        className="mt-1 px-2 py-0.5 text-[10px] rounded bg-green-900/40 border border-green-800/50 text-green-400 hover:bg-green-800/40 transition-colors"
      >
        {t('trade.sellFor', { price: sellValue })}
      </button>
    </div>
  )
}
