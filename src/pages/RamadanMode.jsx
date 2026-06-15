import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { CheckCircle, Circle, Moon, ChevronRight } from 'lucide-react'

const LS_KEY = 'tamkeen_ramadan_challenge'

const CHALLENGE_ITEMS = [
  'Complete all 5 daily prayers',
  'Read 1 juz of Quran',
  'Do morning adhkar',
  'Do evening adhkar',
  'Give sadaqah',
  'Pray Tarawih',
  'Make dua at iftar',
  'Read/listen to a hadith',
  'Avoid bad speech & arguments',
  'Help someone today',
]

function pad(n) { return String(n).padStart(2, '0') }

function countdown(targetDate) {
  const diff = targetDate - Date.now()
  if (diff <= 0) return { h: 0, m: 0, s: 0, passed: true }
  return {
    s: Math.floor(diff / 1000) % 60,
    m: Math.floor(diff / 60000) % 60,
    h: Math.floor(diff / 3600000) % 24,
    passed: false,
  }
}

function nextPrayerDate(timeStr) {
  if (!timeStr) return null
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  if (d <= now) d.setDate(d.getDate() + 1)
  return d
}

// Calculate approximate days until next Ramadan from current Hijri date
function daysUntilRamadan(hijriDate) {
  if (!hijriDate) return null
  const month = Number(hijriDate?.month?.number || 0)
  const day   = Number(hijriDate?.day || 0)
  if (month === 0) return null

  // Lunar month ≈ 29.53 days
  const LUNAR_MONTH = 29.53
  let monthsUntil
  if (month < 9) {
    monthsUntil = (9 - month) - (day / LUNAR_MONTH)
  } else if (month === 9) {
    return 0 // it's Ramadan right now
  } else {
    monthsUntil = (12 - month) + 9 - (day / LUNAR_MONTH)
  }
  return Math.round(monthsUntil * LUNAR_MONTH)
}

function loadChallenge() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {} } catch { return {} } }
function saveChallenge(d) { localStorage.setItem(LS_KEY, JSON.stringify(d)) }

// ─── COUNTDOWN SCREEN shown when NOT in Ramadan ───────────────────────────────
function RamadanCountdownScreen({ hijriDate, onPreview }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const days = daysUntilRamadan(hijriDate)
  const currentMonth = hijriDate?.month?.en || 'Unknown'
  const currentYear  = hijriDate?.year  || ''

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card bg-gradient-to-br from-tamkeen-dark to-tamkeen-mid text-white text-center py-8">
        <div className="text-6xl mb-3">🌙</div>
        <p className="text-xs text-green-200 font-semibold uppercase tracking-widest mb-2">Ramadan is coming</p>
        <h2 className="text-2xl font-bold mb-1">Ramadan 1448</h2>
        <p className="text-sm text-green-200">Expected around February – March 2027</p>
        {days !== null && (
          <div className="mt-4 bg-white/10 rounded-2xl px-6 py-4 inline-block">
            <p className="text-4xl font-bold text-tamkeen-mint">{days}</p>
            <p className="text-sm text-green-200 mt-0.5">days away (approximate)</p>
          </div>
        )}
      </div>

      {/* Current Hijri date */}
      <div className="card">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Current Islamic Date</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-tamkeen-mint rounded-xl flex items-center justify-center">
            <Moon size={18} className="text-tamkeen-dark" />
          </div>
          <div>
            <p className="text-base font-bold text-tamkeen-ink">
              {hijriDate?.day || '—'} {currentMonth} {currentYear} AH
            </p>
            <p className="text-xs text-gray-400">
              Month {hijriDate?.month?.number || '—'} of 12 · Ramadan is month 9
            </p>
          </div>
        </div>
      </div>

      {/* Prepare */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-3">Prepare for Ramadan now</p>
        <div className="space-y-2">
          {[
            'Fast Mondays & Thursdays (Sunnah fasting)',
            'Read 1 page of Quran daily',
            'Establish night prayer before Ramadan',
            'Give optional Sadaqah to build the habit',
            'Make a list of duas you want answered',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key duas for Ramadan prep */}
      <div className="card bg-indigo-50">
        <p className="text-xs font-semibold text-indigo-800 mb-3">Duas to memorise now</p>
        <div className="space-y-3">
          {[
            { label: 'Iftar dua', arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', trans: 'O Allah, for You I fasted and upon Your provision I break my fast.' },
            { label: 'Laylat al-Qadr', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', trans: 'O Allah, You are Forgiving and love forgiveness, so forgive me.' },
          ].map((d) => (
            <div key={d.label}>
              <p className="text-[10px] font-semibold text-indigo-600 mb-1">{d.label}</p>
              <p className="arabic text-base text-tamkeen-ink mb-1">{d.arabic}</p>
              <p className="text-xs text-gray-500 italic">{d.trans}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview mode toggle */}
      <button onClick={onPreview}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-2xl text-sm text-gray-500">
        <span>Open Ramadan dashboard in preview mode</span>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── FULL RAMADAN DASHBOARD ───────────────────────────────────────────────────
function RamadanDashboard({ prayerTimes, hijriDate, isPreview }) {
  const [tick,      setTick]      = useState(0)
  const [challenge, setChallenge] = useState(loadChallenge)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const fajrDate    = nextPrayerDate(prayerTimes?.Fajr)
  const maghribDate = nextPrayerDate(prayerTimes?.Maghrib)
  const suhoorCd    = fajrDate    ? countdown(fajrDate.getTime())    : null
  const iftarCd     = maghribDate ? countdown(maghribDate.getTime()) : null

  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const fajrMins    = prayerTimes?.Fajr    ? prayerTimes.Fajr.split(':').map(Number).reduce((h,m) => h*60+m)    : 0
  const maghribMins = prayerTimes?.Maghrib ? prayerTimes.Maghrib.split(':').map(Number).reduce((h,m) => h*60+m) : 0
  const isFasting   = nowMins >= fajrMins && nowMins < maghribMins

  const today      = now.toISOString().slice(0, 10)
  const todayCheck = challenge[today] || {}
  const doneToday  = CHALLENGE_ITEMS.filter((i) => todayCheck[i]).length

  const hijriDay     = Number(hijriDate?.day || 0)
  const isLastTen    = hijriDate?.month?.number === 9 && hijriDay >= 21
  const isOddNight   = isLastTen && hijriDay % 2 !== 0

  const toggleItem = (item) => {
    const updated = { ...challenge, [today]: { ...todayCheck, [item]: !todayCheck[item] } }
    setChallenge(updated)
    saveChallenge(updated)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card bg-gradient-to-br from-tamkeen-dark to-tamkeen-mid text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            {isPreview && <p className="text-[10px] text-amber-300 font-semibold mb-0.5">PREVIEW MODE</p>}
            <p className="text-xs text-green-200 font-semibold uppercase tracking-wide">Ramadan Mode</p>
            <h2 className="text-xl font-bold">
              {hijriDate?.month?.number === 9 ? `Day ${hijriDay} of Ramadan` : 'Ramadan 1448 Preview'}
            </h2>
          </div>
          <div className="text-4xl">🌙</div>
        </div>
        {isLastTen && (
          <div className="mt-2 bg-yellow-400/20 rounded-xl px-3 py-2">
            <p className="text-yellow-200 text-xs font-semibold">
              ✨ Last 10 Nights — {isOddNight ? 'Tonight could be Laylat al-Qadr!' : 'Keep going — next odd night approaches'}
            </p>
          </div>
        )}
      </div>

      {/* Suhoor / Iftar countdowns */}
      {prayerTimes && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`card text-center ${!isFasting ? 'bg-indigo-50' : 'bg-gray-50 opacity-60'}`}>
            <p className="text-xs font-semibold text-indigo-600 mb-1">🌙 Suhoor ends</p>
            {suhoorCd && !suhoorCd.passed ? (
              <p className="text-2xl font-bold text-tamkeen-ink font-mono">
                {pad(suhoorCd.h)}:{pad(suhoorCd.m)}:{pad(suhoorCd.s)}
              </p>
            ) : (
              <p className="text-lg font-bold text-gray-400">Passed</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Fajr {prayerTimes.Fajr}</p>
          </div>
          <div className={`card text-center ${isFasting ? 'bg-amber-50' : 'bg-gray-50 opacity-60'}`}>
            <p className="text-xs font-semibold text-amber-600 mb-1">☀️ Iftar in</p>
            {iftarCd && !iftarCd.passed ? (
              <p className="text-2xl font-bold text-tamkeen-ink font-mono">
                {pad(iftarCd.h)}:{pad(iftarCd.m)}:{pad(iftarCd.s)}
              </p>
            ) : (
              <p className="text-lg font-bold text-green-500">Time to break fast!</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Maghrib {prayerTimes.Maghrib}</p>
          </div>
        </div>
      )}

      {/* Iftar dua */}
      {iftarCd && iftarCd.passed && (
        <div className="card bg-green-50">
          <p className="arabic text-xl text-tamkeen-dark mb-2 text-center">
            اللَّهُمَّ لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ
          </p>
          <p className="text-xs text-gray-500 text-center">
            "O Allah, for You I fasted, and upon Your provision I break my fast." — Iftar dua
          </p>
        </div>
      )}

      {/* Daily Challenge */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-tamkeen-ink">30-Day Ramadan Challenge</p>
          <span className="text-xs font-bold text-tamkeen-dark bg-tamkeen-mint px-2 py-0.5 rounded-full">
            {doneToday}/{CHALLENGE_ITEMS.length}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-tamkeen-light rounded-full transition-all"
            style={{ width: `${(doneToday / CHALLENGE_ITEMS.length) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {CHALLENGE_ITEMS.map((item) => (
            <button key={item} onClick={() => toggleItem(item)}
              className="w-full flex items-center gap-3 py-2.5 px-1 rounded-xl active:scale-95 transition-all text-left">
              {todayCheck[item]
                ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                : <Circle size={18} className="text-gray-300 flex-shrink-0" />
              }
              <span className={`text-sm ${todayCheck[item] ? 'text-gray-400 line-through' : 'text-tamkeen-ink'}`}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Key duas */}
      <div className="card bg-indigo-50">
        <p className="text-xs font-semibold text-indigo-800 mb-3">Key Ramadan Duas</p>
        <div className="space-y-3">
          {[
            { label: 'Sighting the Moon', arabic: 'اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ', trans: 'Allah is the Greatest. O Allah, let this moon appear with peace and faith upon us.' },
            { label: 'Iftar dua', arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', trans: 'O Allah, for You I fasted and upon Your provision I break my fast.' },
            { label: 'Laylat al-Qadr dua', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', trans: 'O Allah, You are Forgiving and love forgiveness, so forgive me.' },
          ].map((d) => (
            <div key={d.label}>
              <p className="text-[10px] font-semibold text-indigo-600 mb-1">{d.label}</p>
              <p className="arabic text-base text-tamkeen-ink mb-1">{d.arabic}</p>
              <p className="text-xs text-gray-500 italic">{d.trans}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress calendar */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ramadan Progress</p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1
            const dateKey = (() => {
              const d = new Date()
              d.setDate(d.getDate() - (hijriDay - day))
              return d.toISOString().slice(0, 10)
            })()
            const log  = challenge[dateKey] || {}
            const done = CHALLENGE_ITEMS.filter((item) => log[item]).length
            const pct  = done / CHALLENGE_ITEMS.length
            return (
              <div key={day} title={`Day ${day}`}
                className={`aspect-square rounded flex items-center justify-center text-[9px] font-bold ${
                  pct >= 0.8 ? 'bg-tamkeen-dark text-white' :
                  pct >= 0.5 ? 'bg-tamkeen-mint text-tamkeen-dark' :
                  pct > 0    ? 'bg-green-100 text-green-700' :
                  day === hijriDay ? 'bg-gray-200 text-gray-600 ring-2 ring-tamkeen-dark' :
                  'bg-gray-100 text-gray-400'
                }`}>
                {day}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {[
            { color: 'bg-tamkeen-dark', label: 'Full (80%+)' },
            { color: 'bg-tamkeen-mint', label: 'Good (50%+)' },
            { color: 'bg-green-100',    label: 'Started'     },
            { color: 'bg-gray-100',     label: 'Upcoming'    },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${l.color}`} />
              <span className="text-[10px] text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE — gate on Hijri month ─────────────────────────────────────────
export default function RamadanMode() {
  const { prayerTimes, hijriDate } = useStore()
  const [previewMode, setPreviewMode] = useState(false)

  const isRamadan = hijriDate?.month?.number === 9

  if (isRamadan || previewMode) {
    return (
      <div className="space-y-4">
        <RamadanDashboard
          prayerTimes={prayerTimes}
          hijriDate={hijriDate}
          isPreview={!isRamadan && previewMode}
        />
        {!isRamadan && previewMode && (
          <button onClick={() => setPreviewMode(false)}
            className="w-full py-2.5 text-sm text-gray-400 border border-gray-200 rounded-2xl">
            ← Back to countdown
          </button>
        )}
      </div>
    )
  }

  return <RamadanCountdownScreen hijriDate={hijriDate} onPreview={() => setPreviewMode(true)} />
}
