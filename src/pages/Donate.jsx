import { useState, useEffect } from 'react'
import { Heart, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'

const PRESETS = [1000, 2500, 5000, 10000]
const FREQUENCIES = [
  { id: 'one-time', label: 'One-time', desc: 'Single donation' },
  { id: 'weekly',   label: 'Weekly',   desc: 'Every week' },
  { id: 'monthly',  label: 'Monthly',  desc: 'Every month' },
  { id: 'yearly',   label: 'Yearly',   desc: 'Every year' },
]

const PAYSTACK_KEY    = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY    || ''
const FLUTTERWAVE_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || ''

function loadScript(src, checkFn) {
  return new Promise((resolve, reject) => {
    if (checkFn()) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function Donate() {
  const { user, profile } = useStore()
  const [amount,  setAmount]  = useState(1000)
  const [custom,  setCustom]  = useState('')
  const [freq,    setFreq]    = useState('one-time')
  const [gateway, setGateway] = useState(() => PAYSTACK_KEY ? 'paystack' : FLUTTERWAVE_KEY ? 'flutterwave' : 'paystack')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const finalAmount = custom ? Number(custom) : amount
  const isValid     = finalAmount >= 1000

  const hasPaystack    = !!PAYSTACK_KEY
  const hasFlutterwave = !!FLUTTERWAVE_KEY

  // ── Paystack ──────────────────────────────────────────────────────────────
  const payWithPaystack = async () => {
    try {
      await loadScript('https://js.paystack.co/v1/inline.js', () => !!window.PaystackPop)
    } catch {
      alert('Could not load Paystack. Check your internet connection.')
      setLoading(false)
      return
    }
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_KEY,
      email:    user?.email || 'donor@tamkeen.app',
      amount:   finalAmount * 100,
      currency: 'NGN',
      ref:      `tamkeen_ps_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Donor',     variable_name: 'name',      value: profile?.name || 'Anonymous' },
          { display_name: 'Frequency', variable_name: 'frequency', value: freq },
          { display_name: 'App',       variable_name: 'app',       value: 'Tamkeen' },
        ],
      },
      onSuccess: () => { setSuccess(true); setLoading(false) },
      onCancel:  () => setLoading(false),
    })
    handler.openIframe()
  }

  // ── Flutterwave ───────────────────────────────────────────────────────────
  const payWithFlutterwave = async () => {
    try {
      await loadScript('https://checkout.flutterwave.com/v3.js', () => !!window.FlutterwaveCheckout)
    } catch {
      alert('Could not load Flutterwave. Check your internet connection.')
      setLoading(false)
      return
    }
    window.FlutterwaveCheckout({
      public_key: FLUTTERWAVE_KEY,
      tx_ref:     `tamkeen_fw_${Date.now()}`,
      amount:     finalAmount,
      currency:   'NGN',
      customer: {
        email:     user?.email || 'donor@tamkeen.app',
        name:      profile?.name || 'Tamkeen Donor',
      },
      customizations: {
        title:       'Support Tamkeen',
        description: `${freq} donation — JazakAllahu Khayran`,
        logo:        'https://tamkeen.durodola.africa/icons/icon-192.png',
      },
      callback:  () => { setSuccess(true); setLoading(false) },
      onclose:   () => setLoading(false),
    })
  }

  const handleDonate = async () => {
    if (!isValid) return
    setLoading(true)
    if (gateway === 'paystack')    await payWithPaystack()
    if (gateway === 'flutterwave') await payWithFlutterwave()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-tamkeen-ink mb-2">JazakAllahu Khayran</h2>
        <p className="text-gray-500 mb-1">جزاك الله خيراً</p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-xs">
          Your donation of <strong>₦{finalAmount.toLocaleString()}</strong> has been received.
          May Allah bless your wealth and accept it as Sadaqah.
        </p>
        <p className="arabic text-lg text-tamkeen-dark mt-4">
          مَن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً
        </p>
        <p className="text-xs text-gray-400 mt-2 max-w-xs italic">
          "Who will lend Allah a beautiful loan so He may multiply it many times over?" — Quran 2:245
        </p>
        <button onClick={() => { setSuccess(false); setAmount(1000); setCustom('') }}
          className="mt-6 btn-primary px-8 py-3">
          Donate Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Heart size={26} className="text-green-600 fill-green-200" />
        </div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Support Tamkeen</h2>
        <p className="text-sm text-gray-500 mt-1">Help keep this free for family & friends</p>
        <p className="arabic text-base text-tamkeen-dark mt-2">وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ</p>
        <p className="text-xs text-gray-400">"Whatever you spend in His way, He will replace it" — Quran 34:39</p>
      </div>

      {/* Payment gateway selector */}
      <div className="card">
        <p className="text-sm font-semibold text-tamkeen-ink mb-3">Pay with</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id:       'paystack',
              label:    'Paystack',
              badge:    hasPaystack ? null : '7 days',
              icon:     '💳',
              sub:      'Cards · Bank · USSD',
              ready:    hasPaystack,
            },
            {
              id:       'flutterwave',
              label:    'Flutterwave',
              badge:    hasFlutterwave ? null : 'Setup needed',
              icon:     '🌊',
              sub:      'Cards · Mobile Money · Transfer',
              ready:    hasFlutterwave,
            },
          ].map((g) => (
            <button key={g.id} onClick={() => setGateway(g.id)}
              className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                gateway === g.id
                  ? 'bg-tamkeen-dark text-white border-tamkeen-dark'
                  : 'bg-white text-tamkeen-ink border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{g.icon}</span>
                {g.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    gateway === g.id ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'
                  }`}>{g.badge}</span>
                )}
              </div>
              <p className="text-sm font-semibold">{g.label}</p>
              <p className={`text-[10px] mt-0.5 ${gateway === g.id ? 'text-green-200' : 'text-gray-400'}`}>{g.sub}</p>
            </button>
          ))}
        </div>

        {gateway === 'paystack' && !hasPaystack && (
          <div className="mt-3 p-2 bg-amber-50 rounded-xl text-xs text-amber-700">
            Add <code className="bg-amber-100 px-1 rounded">VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx</code> to your .env file.
            Paystack approval takes ~7 days. Get your key at paystack.com → Settings → API Keys.
          </div>
        )}
        {gateway === 'flutterwave' && !hasFlutterwave && (
          <div className="mt-3 p-2 bg-amber-50 rounded-xl text-xs text-amber-700">
            Add <code className="bg-amber-100 px-1 rounded">VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxx</code> to your .env.
            Flutterwave activates in ~1 day. Register at flutterwave.com → Dashboard → API Keys.
            <span className="font-semibold ml-1">Tip: Works for USD, GHS, KES, UGX and mobile money across Africa.</span>
          </div>
        )}
      </div>

      {/* Amount presets */}
      <div className="card">
        <p className="text-sm font-semibold text-tamkeen-ink mb-3">Choose amount</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => { setAmount(p); setCustom('') }}
              className={`py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                !custom && amount === p
                  ? 'bg-tamkeen-dark text-white border-tamkeen-dark'
                  : 'bg-white text-tamkeen-ink border-gray-200 hover:border-tamkeen-light'
              }`}>
              ₦{p >= 1000 ? `${p / 1000}K` : p}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
          <input type="number" min="1000" placeholder="Custom amount (min ₦1,000)" value={custom}
            onChange={(e) => setCustom(e.target.value)} className="input pl-8 w-full" />
        </div>
        {custom && Number(custom) < 1000 && (
          <p className="text-xs text-red-400 mt-1">Minimum donation is ₦1,000</p>
        )}
      </div>

      {/* Frequency */}
      <div className="card">
        <p className="text-sm font-semibold text-tamkeen-ink mb-3">How often?</p>
        <div className="grid grid-cols-2 gap-2">
          {FREQUENCIES.map((f) => (
            <button key={f.id} onClick={() => setFreq(f.id)}
              className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                freq === f.id
                  ? 'bg-tamkeen-dark text-white border-tamkeen-dark'
                  : 'bg-white text-tamkeen-ink border-gray-200'
              }`}>
              <p className="text-sm font-semibold">{f.label}</p>
              <p className={`text-xs mt-0.5 ${freq === f.id ? 'text-green-200' : 'text-gray-400'}`}>{f.desc}</p>
            </button>
          ))}
        </div>
        {freq !== 'one-time' && (
          <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg">
            💡 After completing this payment, set a calendar reminder for your next{' '}
            {freq} donation of ₦{(custom ? Number(custom) : amount).toLocaleString()}.
          </p>
        )}
      </div>

      {/* Summary */}
      {isValid && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">You're donating</p>
              <p className="text-2xl font-bold text-tamkeen-dark">₦{finalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 capitalize">{freq}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Covers roughly:</p>
              {finalAmount >= 10000 && <p className="text-xs text-green-600 font-medium">~1 month hosting</p>}
              {finalAmount >= 5000 && finalAmount < 10000 && <p className="text-xs text-green-600 font-medium">~2 weeks hosting</p>}
              {finalAmount >= 2500 && finalAmount < 5000 && <p className="text-xs text-green-600 font-medium">~1 week hosting</p>}
              {finalAmount >= 1000 && finalAmount < 2500 && <p className="text-xs text-green-600 font-medium">~2 days hosting</p>}
            </div>
          </div>
        </div>
      )}

      {/* Donate button */}
      <button onClick={handleDonate} disabled={!isValid || loading}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
          isValid ? 'bg-tamkeen-dark text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}>
        <Heart size={18} className={isValid ? 'fill-tamkeen-mint text-tamkeen-mint' : 'text-gray-400'} />
        {loading ? 'Opening payment…' : `Donate ₦${isValid ? finalAmount.toLocaleString() : '—'} via ${gateway === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
      </button>

      {/* Trust indicators */}
      <div className="text-center space-y-1 pb-4">
        <p className="text-xs text-gray-400">
          {gateway === 'paystack'
            ? '🔒 Secured by Paystack · Cards · Bank Transfer · USSD'
            : '🔒 Secured by Flutterwave · Cards · Mobile Money · Bank Transfer'}
        </p>
        <p className="text-xs text-gray-300 mt-2">All donations go toward server costs for this app. JazakAllahu Khayran.</p>
      </div>
    </div>
  )
}
