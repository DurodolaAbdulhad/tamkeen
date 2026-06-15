import { useState, useMemo } from 'react'
import { Info, RefreshCw } from 'lucide-react'

const NISAB_GOLD_GRAMS   = 85
const NISAB_SILVER_GRAMS = 595
const ZAKAT_RATE         = 0.025

const FIELDS = [
  { key: 'cash',        label: 'Cash & Bank Savings',      icon: '💵', unit: '₦', hint: 'All money in bank accounts + cash at hand' },
  { key: 'gold_grams',  label: 'Gold (grams)',              icon: '🥇', unit: 'g', hint: 'Weight of gold you own (jewellery excluded if personal use in most opinions)' },
  { key: 'silver_grams',label: 'Silver (grams)',            icon: '🥈', unit: 'g', hint: 'Weight of silver you own' },
  { key: 'stocks',      label: 'Stocks & Investments',     icon: '📈', unit: '₦', hint: 'Market value of shares, mutual funds, crypto' },
  { key: 'receivables', label: 'Money Owed to You',        icon: '📋', unit: '₦', hint: 'Loans given out that you expect to receive back' },
  { key: 'business',    label: 'Business Stock/Inventory', icon: '🏪', unit: '₦', hint: 'Value of goods you intend to sell' },
  { key: 'rental',      label: 'Rental Income Savings',    icon: '🏠', unit: '₦', hint: 'Accumulated rental income not yet spent' },
]

const DEDUCTIONS = [
  { key: 'debts',    label: 'Debts you owe (immediate)',  icon: '📉', hint: 'Only debts due within the year reduce your nisab' },
  { key: 'expenses', label: 'Living expenses (1 month)',  icon: '🧾', hint: 'Basic monthly expenses may be deducted per some scholars' },
]

async function fetchLivePrices() {
  const [goldRes, fxRes] = await Promise.all([
    fetch('https://api.metals.live/v1/spot/gold'),
    fetch('https://api.exchangerate-api.com/v4/latest/USD'),
  ])

  if (!goldRes.ok || !fxRes.ok) throw new Error('API error')

  const goldData = await goldRes.json()  // e.g. [{ gold: 2350.50 }]
  const fxData   = await fxRes.json()   // { rates: { NGN: 1600 } }

  // metals.live returns array or object — handle both
  const goldUSD = Array.isArray(goldData) ? (goldData[0]?.gold || goldData.gold) : goldData.gold
  const usdNGN  = fxData?.rates?.NGN || fxData?.conversion_rates?.NGN

  if (!goldUSD || !usdNGN) throw new Error('Missing price data')

  // 1 troy oz = 31.1035 grams
  const goldNGN   = (goldUSD   / 31.1035) * usdNGN
  // Estimate silver ~1/80 of gold (rough ratio, can be refined)
  const silverUSD = goldUSD / 80
  const silverNGN = (silverUSD / 31.1035) * usdNGN

  return {
    goldNGN:   Math.round(goldNGN),
    silverNGN: Math.round(silverNGN),
    goldUSD:   Math.round(goldUSD * 100) / 100,
    usdNGN:    Math.round(usdNGN),
    fetchedAt:  new Date().toLocaleTimeString(),
  }
}

export default function ZakatCalculator() {
  const [goldPrice,   setGoldPrice]   = useState(110000)
  const [silverPrice, setSilverPrice] = useState(1500)
  const [assets,      setAssets]      = useState({})
  const [deduc,       setDeduc]       = useState({})
  const [showInfo,    setShowInfo]    = useState(false)
  const [fetching,    setFetching]    = useState(false)
  const [fetchStatus, setFetchStatus] = useState(null) // { ok, msg, at }

  const set = (key, val, type = 'assets') => {
    const num = parseFloat(val) || 0
    if (type === 'assets') setAssets((a) => ({ ...a, [key]: num }))
    else setDeduc((d) => ({ ...d, [key]: num }))
  }

  const handleFetchPrices = async () => {
    setFetching(true)
    setFetchStatus(null)
    try {
      const prices = await fetchLivePrices()
      setGoldPrice(prices.goldNGN)
      setSilverPrice(prices.silverNGN)
      setFetchStatus({
        ok: true,
        msg: `Gold: ₦${prices.goldNGN.toLocaleString()}/g · Silver: ₦${prices.silverNGN.toLocaleString()}/g · Rate: $1 = ₦${prices.usdNGN.toLocaleString()}`,
        at: prices.fetchedAt,
      })
    } catch {
      setFetchStatus({ ok: false, msg: 'Could not fetch live prices. Enter manually below.' })
    } finally {
      setFetching(false)
    }
  }

  const calc = useMemo(() => {
    const goldValue    = (assets.gold_grams   || 0) * goldPrice
    const silverValue  = (assets.silver_grams || 0) * silverPrice
    const totalAssets  =
      (assets.cash        || 0) + goldValue + silverValue +
      (assets.stocks      || 0) + (assets.receivables || 0) +
      (assets.business    || 0) + (assets.rental || 0)
    const totalDeduc   = (deduc.debts || 0) + (deduc.expenses || 0)
    const netWealth    = Math.max(0, totalAssets - totalDeduc)
    const nisabGold    = NISAB_GOLD_GRAMS   * goldPrice
    const nisabSilver  = NISAB_SILVER_GRAMS * silverPrice
    const nisab        = Math.min(nisabGold, nisabSilver)
    const zakatDue     = netWealth >= nisab ? netWealth * ZAKAT_RATE : 0
    return { totalAssets, totalDeduc, netWealth, nisab, nisabGold, nisabSilver, zakatDue, goldValue, silverValue, aboveNisab: netWealth >= nisab }
  }, [assets, deduc, goldPrice, silverPrice])

  const fmt = (n) => '₦' + Math.round(n).toLocaleString()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">Zakat Calculator</h2>
          <p className="text-sm text-gray-500">2.5% of net wealth above Nisab</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-xl bg-gray-100">
          <Info size={18} className="text-gray-500" />
        </button>
      </div>

      {showInfo && (
        <div className="card bg-green-50">
          <p className="text-xs font-semibold text-tamkeen-dark mb-2">About Zakat</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Zakat is due on wealth held for a full lunar year (Hawl)</p>
            <p>• Nisab = minimum threshold: 85g gold or 595g silver (use the lower)</p>
            <p>• Rate = 2.5% of net zakatable wealth</p>
            <p>• Consult a scholar for complex situations (business, crypto, pension)</p>
          </div>
        </div>
      )}

      {/* Live Prices Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gold & Silver Prices (Nisab)</p>
          <button
            onClick={handleFetchPrices}
            disabled={fetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-tamkeen-dark text-white active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
            {fetching ? 'Fetching…' : 'Fetch live prices'}
          </button>
        </div>

        {fetchStatus && (
          <div className={`mb-3 p-2 rounded-xl text-xs ${fetchStatus.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {fetchStatus.ok && <span className="font-semibold">Updated {fetchStatus.at} · </span>}
            {fetchStatus.msg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Gold price (₦/gram)</label>
            <input type="number" className="input text-sm" value={goldPrice}
              onChange={(e) => setGoldPrice(Number(e.target.value))} placeholder="110000" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Silver price (₦/gram)</label>
            <input type="number" className="input text-sm" value={silverPrice}
              onChange={(e) => setSilverPrice(Number(e.target.value))} placeholder="1500" />
          </div>
        </div>

        <div className="mt-2 text-[10px] text-gray-400 space-y-0.5">
          <p>Nisab (gold) = 85g × ₦{goldPrice.toLocaleString()}/g = {fmt(NISAB_GOLD_GRAMS * goldPrice)}</p>
          <p>Nisab (silver) = 595g × ₦{silverPrice.toLocaleString()}/g = {fmt(NISAB_SILVER_GRAMS * silverPrice)} — using lower</p>
        </div>
      </div>

      {/* Assets */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Assets</p>
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{f.icon}</span>
                <label className="text-sm font-medium text-tamkeen-ink">{f.label}</label>
              </div>
              <p className="text-[10px] text-gray-400 mb-1 ml-5">{f.hint}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{f.unit}</span>
                <input type="number" min="0" className="input text-sm pl-7"
                  value={assets[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder="0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deductions */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Deductions</p>
        <div className="space-y-3">
          {DEDUCTIONS.map((f) => (
            <div key={f.key}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{f.icon}</span>
                <label className="text-sm font-medium text-tamkeen-ink">{f.label}</label>
              </div>
              <p className="text-[10px] text-gray-400 mb-1 ml-5">{f.hint}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₦</span>
                <input type="number" min="0" className="input text-sm pl-7"
                  value={deduc[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value, 'deductions')}
                  placeholder="0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className={`card border-2 ${calc.aboveNisab ? 'border-tamkeen-light bg-green-50' : 'border-gray-200'}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Zakat Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total assets</span>
            <span className="font-semibold text-tamkeen-ink">{fmt(calc.totalAssets)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deductions</span>
            <span className="font-semibold text-red-500">− {fmt(calc.totalDeduc)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
            <span className="font-medium text-tamkeen-ink">Net wealth</span>
            <span className="font-bold text-tamkeen-ink">{fmt(calc.netWealth)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nisab threshold</span>
            <span className="font-semibold text-gray-600">{fmt(calc.nisab)}</span>
          </div>
        </div>

        <div className={`mt-4 rounded-xl p-4 text-center ${calc.aboveNisab ? 'bg-tamkeen-dark text-white' : 'bg-gray-100'}`}>
          {calc.aboveNisab ? (
            <>
              <p className="text-xs text-green-200 mb-1">ZAKAT DUE THIS YEAR</p>
              <p className="text-3xl font-bold">{fmt(calc.zakatDue)}</p>
              <p className="text-xs text-green-200 mt-1">= 2.5% × {fmt(calc.netWealth)}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-500">Below Nisab threshold</p>
              <p className="text-xs text-gray-400 mt-1">No Zakat due — you need {fmt(calc.nisab - calc.netWealth)} more to reach Nisab</p>
            </>
          )}
        </div>

        {calc.aboveNisab && (
          <div className="mt-3 text-center">
            <p className="arabic text-lg text-tamkeen-dark">وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ</p>
            <p className="text-xs text-gray-400 mt-1">"In their wealth is a right for the one who asks and the deprived" — Quran 51:19</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center pb-2">
        This calculator is a guide. Consult a qualified Islamic scholar for your specific situation. — تمكين
      </p>
    </div>
  )
}
