import type { TraderItem } from '../../types/encounters'
import type { Equipment } from '../../types/equipment'
import type { Ship } from '../../types/game'
import { RARITY_CONFIG } from '../../types/equipment'
import { useGameStore } from '../../storage/game-store'

export function TradePanel() {
  const showTrade = useGameStore((s) => s.showTrade)
  const traderName = useGameStore((s) => s.traderName)
  const stock = useGameStore((s) => s.tradeStock)
  const run = useGameStore((s) => s.run)
  const closeTrade = useGameStore((s) => s.closeTrade)
  const buyItem = useGameStore((s) => s.buyItem)
  const sellFromCargo = useGameStore((s) => s.sellFromCargo)
  const equipFromCargo = useGameStore((s) => s.equipFromCargo)

  if (!showTrade || !run) return null

  const ship = run.ship
  const cargo = ship.cargo

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Trade — {traderName}</h2>
            <div className="flex gap-4 mt-1 text-xs font-mono">
              <span className="text-yellow-400">Credits: {ship.credits}</span>
              <span className="text-amber-500">Fuel: {ship.fuel}/{ship.maxFuel}</span>
              <span className="text-emerald-500">Supplies: {ship.supplies}/{ship.maxSupplies}</span>
            </div>
          </div>
          <button
            onClick={closeTrade}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-sm transition-colors"
          >
            Done
          </button>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-800">
          {/* Buy column */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Buy
            </h3>
            {stock.length === 0 ? (
              <p className="text-xs text-gray-600 italic">Nothing left in stock</p>
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
              Cargo ({cargo.length})
            </h3>
            {cargo.length === 0 ? (
              <p className="text-xs text-gray-600 italic">Nothing in cargo</p>
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
                 (item.type === 'supplies' && ship.supplies >= ship.maxSupplies)
  const disabled = !canAfford || isFull

  // Build description
  let typeLabel: string
  if (item.type === 'fuel') {
    typeLabel = `Fuel +${item.amount ?? 20}`
  } else if (item.type === 'supplies') {
    typeLabel = `Supplies +${item.amount ?? 20}`
  } else if (item.type === 'equipment') {
    typeLabel = 'Equipment'
  } else {
    typeLabel = 'Intel'
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
        {isFull ? 'Full' : !canAfford ? `Need ${item.price}cr` : `Buy — ${item.price}cr`}
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
          Replaces: {currentInSlot.name}
        </p>
      )}
      <div className="flex gap-1 pt-1">
        <button
          onClick={onEquip}
          className="px-2 py-0.5 text-[10px] rounded bg-blue-900/40 border border-blue-800/50 text-blue-400 hover:bg-blue-800/40 transition-colors"
        >
          Equip
        </button>
        <button
          onClick={onSell}
          className="px-2 py-0.5 text-[10px] rounded bg-green-900/40 border border-green-800/50 text-green-400 hover:bg-green-800/40 transition-colors"
        >
          Sell — {sellValue}cr
        </button>
      </div>
    </div>
  )
}
