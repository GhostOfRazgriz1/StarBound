import type { Equipment } from '../../types/equipment'
import type { Consumable } from '../../types/consumable'
import { RARITY_CONFIG } from '../../types/equipment'
import { CONSUMABLE_SELL_VALUES } from '../../types/consumable'
import { useGameStore } from '../../storage/game-store'
import { t } from '../../i18n'

const tt = (key: string, params?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], params)

const FUEL_PRICE = 3     // credits per unit
const SUPPLY_PRICE = 3
const SELL_MULTIPLIER = 0.6

const BUY_AMOUNTS = [10, 20, 30]

export function BlackMarketPanel() {
  const showBlackMarket = useGameStore((s) => s.showBlackMarket)
  const run = useGameStore((s) => s.run)
  const closeBlackMarket = useGameStore((s) => s.closeBlackMarket)
  const buyFuel = useGameStore((s) => s.blackMarketBuyFuel)
  const buySupplies = useGameStore((s) => s.blackMarketBuySupplies)
  const sellCargo = useGameStore((s) => s.blackMarketSellCargo)
  const sellConsumable = useGameStore((s) => s.blackMarketSellConsumable)

  if (!showBlackMarket || !run) return null

  const ship = run.ship
  const fuelFull = ship.fuel >= ship.maxFuel
  const suppliesFull = ship.supplies >= ship.maxSupplies

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-900/50 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-red-400">{tt('blackMarket.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{tt('blackMarket.subtitle')}</p>
            <div className="flex gap-4 mt-1 text-xs font-mono">
              <span className="text-yellow-400">{t('status.credits')}: {ship.credits}</span>
              <span className="text-amber-500">{t('status.fuel')}: {ship.fuel}/{ship.maxFuel}</span>
              <span className="text-emerald-500">{t('status.supplies')}: {ship.supplies}/{ship.maxSupplies}</span>
            </div>
          </div>
          <button
            onClick={closeBlackMarket}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-sm transition-colors"
          >
            {tt('blackMarket.leave')}
          </button>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-800">
          {/* Buy column */}
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-semibold text-red-400/70 uppercase tracking-wider">
              {tt('blackMarket.buy')}
            </h3>

            {/* Buy fuel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-500">{t('status.fuel')}</span>
                <span className="text-xs text-gray-500">{tt('blackMarket.pricePerUnit', { price: FUEL_PRICE })}</span>
              </div>
              <div className="flex gap-2">
                {BUY_AMOUNTS.map((amount) => {
                  const cost = amount * FUEL_PRICE
                  const canAfford = ship.credits >= cost
                  return (
                    <button
                      key={amount}
                      onClick={() => buyFuel(amount)}
                      disabled={!canAfford || fuelFull}
                      className="flex-1 px-2 py-2 text-xs rounded border border-red-900/40 bg-red-950/20 text-amber-400 hover:bg-red-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +{amount} / {cost}cr
                    </button>
                  )
                })}
              </div>
              {fuelFull && <p className="text-[10px] text-gray-600">{tt('blackMarket.tankFull')}</p>}
            </div>

            {/* Buy supplies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-500">{t('status.supplies')}</span>
                <span className="text-xs text-gray-500">{tt('blackMarket.pricePerUnit', { price: SUPPLY_PRICE })}</span>
              </div>
              <div className="flex gap-2">
                {BUY_AMOUNTS.map((amount) => {
                  const cost = amount * SUPPLY_PRICE
                  const canAfford = ship.credits >= cost
                  return (
                    <button
                      key={amount}
                      onClick={() => buySupplies(amount)}
                      disabled={!canAfford || suppliesFull}
                      className="flex-1 px-2 py-2 text-xs rounded border border-red-900/40 bg-red-950/20 text-emerald-400 hover:bg-red-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +{amount} / {cost}cr
                    </button>
                  )
                })}
              </div>
              {suppliesFull && <p className="text-[10px] text-gray-600">{tt('blackMarket.baysFull')}</p>}
            </div>
          </div>

          {/* Sell column */}
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-red-400/70 uppercase tracking-wider">
              {tt('blackMarket.sell')}
            </h3>
            <p className="text-[10px] text-gray-600">{tt('blackMarket.sellNote')}</p>

            {ship.cargo.length === 0 && (ship.consumables || []).length === 0 ? (
              <p className="text-xs text-gray-700 italic">{tt('blackMarket.nothingToSell')}</p>
            ) : (
              <div className="space-y-2">
                {ship.cargo.map((item) => (
                  <SellCargoCard key={item.id} item={item} onSell={() => sellCargo(item.id)} />
                ))}
                {(ship.consumables || []).map((item) => (
                  <SellConsumableCard key={item.id} item={item} onSell={() => sellConsumable(item.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SellCargoCard({ item, onSell }: { item: Equipment; onSell: () => void }) {
  const normalValue = RARITY_CONFIG[item.rarity]?.sellValue ?? 10
  const sellValue = Math.floor(normalValue * SELL_MULTIPLIER)

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded p-2 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: RARITY_CONFIG[item.rarity]?.color }}>
          {item.name}
        </span>
        <span className="text-xs text-gray-600">[{item.slot}]</span>
      </div>
      <p className="text-xs text-gray-500">{item.effect}</p>
      <button
        onClick={onSell}
        className="mt-1 px-2 py-0.5 text-[10px] rounded border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 transition-colors"
      >
        {tt('blackMarket.sellFor', { price: sellValue })}
      </button>
    </div>
  )
}

function SellConsumableCard({ item, onSell }: { item: Consumable; onSell: () => void }) {
  const normalValue = CONSUMABLE_SELL_VALUES[item.resolution]
  const sellValue = Math.floor(normalValue * SELL_MULTIPLIER)

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded p-2 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: item.resolution === 'instant' ? '#22d3ee' : '#fbbf24' }}>
          {item.name}
        </span>
        <span className="text-xs text-gray-600">[{item.type}]</span>
      </div>
      <p className="text-xs text-gray-500">{item.effect}</p>
      <button
        onClick={onSell}
        className="mt-1 px-2 py-0.5 text-[10px] rounded border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 transition-colors"
      >
        {tt('blackMarket.sellFor', { price: sellValue })}
      </button>
    </div>
  )
}
