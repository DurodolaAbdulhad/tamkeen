import { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCcw, Check } from 'lucide-react'

const PRESETS = [
  { label: 'SubhanAllah',   arabic: 'سُبْحَانَ اللَّهِ',       target: 33, color: 'bg-tamkeen-dark',  emoji: '✨' },
  { label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ',       target: 33, color: 'bg-tamkeen-mid',   emoji: '🌿' },
  { label: 'Allahu Akbar',  arabic: 'اللَّهُ أَكْبَرُ',         target: 34, color: 'bg-tamkeen-light', emoji: '🌟' },
  { label: 'Astaghfirullah',arabic: 'أَسْتَغْفِرُ اللَّهَ',     target: 100,color: 'bg-indigo-700',   emoji: '🤲' },
  { label: 'La ilaha illAllah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100, color: 'bg-emerald-700', emoji: '☝️' },
  { label: 'Custom',        arabic: 'مخصص',                    target: 0,  color: 'bg-gray-700',      emoji: '⚙️' },
]

function vibrate(ms = 20) {
  if ('vibrate' in navigator) navigator.vibrate(ms)
}

// Short click using Web Audio API
let audioCtx = null
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain); gain.connect(audioCtx.destination)
    osc.type = 'sine'; osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08)
    osc.start(); osc.stop(audioCtx.currentTime + 0.08)
  } catch (_) {}
}

export default function Tasbih() {
  const [presetIdx, setPresetIdx] = useState(0)
  const [count, setCount]         = useState(0)
  const [session, setSession]     = useState(0)
  const [customTarget, setCustomTarget] = useState(33)
  const [customLabel, setCustomLabel]   = useState('My Dhikr')
  const [soundOn, setSoundOn]     = useState(true)
  const [celebrating, setCelebrating] = useState(false)
  const pressRef = useRef(null)

  const preset  = PRESETS[presetIdx]
  const isCustom = preset.label === 'Custom'
  const target   = isCustom ? customTarget : preset.target
  const done     = target > 0 && count >= target
  const pct      = target > 0 ? Math.min(count / target, 1) : 0

  const handleTap = useCallback(() => {
    if (done) return
    vibrate(25)
    if (soundOn) playClick()
    setCount((c) => {
      const next = c + 1
      if (target > 0 && next >= target) {
        vibrate([100, 50, 100])
        setCelebrating(true)
        setTimeout(() => setCelebrating(false), 1500)
      }
      return next
    })
    setSession((s) => s + 1)
  }, [done, soundOn, target])

  const reset = () => { setCount(0); vibrate(50) }

  // Progress ring params
  const R = 80, C = 2 * Math.PI * R
  const dash = pct * C

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-tamkeen-ink">Digital Tasbih</h2>
        <button
          onClick={() => setSoundOn((s) => !s)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${soundOn ? 'bg-tamkeen-mint text-tamkeen-dark border-tamkeen-light' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
        >
          {soundOn ? '🔊 Sound on' : '🔇 Muted'}
        </button>
      </div>

      {/* Preset selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setPresetIdx(i); setCount(0) }}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              presetIdx === i ? 'border-tamkeen-dark bg-tamkeen-mint text-tamkeen-dark' : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <div>{p.emoji} {p.label}</div>
            {p.target > 0 && <div className="text-gray-400 font-normal">{p.target}×</div>}
          </button>
        ))}
      </div>

      {/* Custom settings */}
      {isCustom && (
        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Label</label>
            <input className="input text-sm" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Dhikr name" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Target (0 = no limit)</label>
            <input className="input text-sm" type="number" min="0" value={customTarget} onChange={(e) => setCustomTarget(Number(e.target.value))} />
          </div>
        </div>
      )}

      {/* Main tap area */}
      <div className="flex flex-col items-center py-6">
        {/* SVG progress ring + button */}
        <div className="relative" style={{ width: 220, height: 220 }}>
          <svg className="absolute inset-0" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="100" cy="100" r={R} fill="none"
              stroke={done ? '#22c55e' : '#2D6A4F'}
              strokeWidth="8"
              strokeDasharray={`${dash} ${C}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dasharray 0.15s ease' }}
            />
          </svg>

          <button
            onPointerDown={handleTap}
            className={`absolute inset-3 rounded-full flex flex-col items-center justify-center
              transition-all active:scale-95 shadow-lg
              ${done ? 'bg-green-500 text-white' : 'bg-tamkeen-dark text-white'}
              ${celebrating ? 'scale-105 bg-green-500' : ''}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {done ? (
              <>
                <Check size={36} />
                <span className="text-sm font-bold mt-1">Complete!</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-bold">{count}</span>
                {target > 0 && <span className="text-sm text-green-200">/ {target}</span>}
              </>
            )}
          </button>
        </div>

        {/* Dhikr name */}
        <p className="arabic text-2xl text-tamkeen-dark mt-4">{isCustom ? customLabel : preset.arabic}</p>
        <p className="text-sm text-gray-500 mt-1">{isCustom ? customLabel : preset.label}</p>
      </div>

      {/* Session stats + reset */}
      <div className="card flex items-center justify-between">
        <div className="text-center">
          <p className="text-2xl font-bold text-tamkeen-ink">{session}</p>
          <p className="text-xs text-gray-400">Session total</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCount(0); setSession(0) }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw size={14} /> Full reset
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-tamkeen-dark text-white text-sm font-medium flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw size={14} /> Reset count
          </button>
        </div>
      </div>

      {/* Post-Salah sequence hint */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-2">Post-Salah sequence</p>
        <div className="space-y-1">
          {[
            { t: 'SubhanAllah × 33', d: 'Glory be to Allah' },
            { t: 'Alhamdulillah × 33', d: 'All praise to Allah' },
            { t: 'Allahu Akbar × 34', d: 'Allah is the Greatest' },
          ].map((item) => (
            <div key={item.t} className="flex items-center justify-between">
              <p className="text-xs font-medium text-tamkeen-ink">{item.t}</p>
              <p className="text-[10px] text-gray-400">{item.d}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">— Sahih Muslim 597</p>
      </div>
    </div>
  )
}
