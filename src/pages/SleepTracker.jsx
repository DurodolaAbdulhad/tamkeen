import { useState, useEffect, useMemo } from 'react'
import { Moon, Sun, AlarmClock, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const LS_KEY = 'tamkeen_sleep_logs'
function loadLogs() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {} } catch { return {} } }
function saveLogs(d) { localStorage.setItem(LS_KEY, JSON.stringify(d)) }

function toMins(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function fromMins(m) {
  const h = Math.floor(((m % 1440) + 1440) % 1440 / 60)
  const min = ((m % 1440) + 1440) % 1440 % 60
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`
}
function fmt12(t24) {
  if (!t24) return '--'
  const [h, m] = t24.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`
}

function sleepScore(bedtime, wakeTime, fajrTime, tahajjudTime, wokeForTahajjud) {
  if (!bedtime || !wakeTime || !fajrTime) return null
  let score = 0, notes = []

  const bed  = toMins(bedtime)
  const wake = toMins(wakeTime)
  const fajr = toMins(fajrTime)
  const tahajjud = tahajjudTime ? toMins(tahajjudTime) : null

  // Slept before midnight (Sunnah)
  if (bed < 1440 && bed > toMins('20:00')) { score += 20; notes.push('Slept before midnight ✓') }
  else { notes.push('Try to sleep before midnight (Sunnah)') }

  // Woke before or at Fajr
  let wakeMins = wake; if (wakeMins < bed) wakeMins += 1440
  const fajrAdj = fajr < bed ? fajr + 1440 : fajr
  if (wakeMins <= fajrAdj + 10) { score += 30; notes.push('Woke for Fajr on time ✓') }
  else { notes.push('Try waking before Fajr') }

  // Duration check (7–9 hours is sunnah range, not too much)
  const durMins = wakeMins - bed
  if (durMins >= 360 && durMins <= 480) { score += 20; notes.push('Sleep duration good (6–8h) ✓') }
  else if (durMins < 360) { notes.push('You may be undersleeping') }
  else { notes.push('Reduce sleep to 6–8 hours (sunnah moderation)') }

  // Tahajjud
  if (wokeForTahajjud) { score += 30; notes.push('Tahajjud observed ✓ — الله أكبر') }
  else if (tahajjud) { notes.push(`Tahajjud window was ${fmt12(tahajjudTime)} — try to wake then`) }

  return { score: Math.min(100, score), notes }
}

export default function SleepTracker() {
  const { prayerTimes } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  const [logs, setLogs] = useState(loadLogs)

  const todayLog = logs[today] || {}
  const [bedtime,  setBedtime]  = useState(todayLog.bedtime  || '22:00')
  const [wakeTime, setWakeTime] = useState(todayLog.wakeTime || '05:00')
  const [wokeForTahajjud, setWoke] = useState(todayLog.wokeForTahajjud || false)
  const [saved, setSaved] = useState(false)

  const fajrTime     = prayerTimes?.Fajr    || null
  const ishaTime     = prayerTimes?.Isha    || null
  const tahajjudTime = useMemo(() => {
    if (!fajrTime || !ishaTime) return null
    const isha = toMins(ishaTime)
    let fajr   = toMins(fajrTime)
    if (fajr < isha) fajr += 1440
    const dur = fajr - isha
    return fromMins(isha + Math.floor(dur * 2 / 3))
  }, [fajrTime, ishaTime])

  const result = sleepScore(bedtime, wakeTime, fajrTime, tahajjudTime, wokeForTahajjud)

  const handleSave = () => {
    const updated = { ...logs, [today]: { bedtime, wakeTime, wokeForTahajjud, savedAt: new Date().toISOString() } }
    setLogs(updated)
    saveLogs(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Recent history (last 7 days)
  const history = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      return { date: key, label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en', { weekday: 'short' }), log: logs[key] }
    })
  }, [logs])

  const scoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-400'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Islamic Sleep Tracker</h2>
        <p className="text-sm text-gray-500">Align your sleep with sunnah patterns</p>
      </div>

      {/* Today's log */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Tonight / This morning</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Moon size={12} /> Bedtime
            </label>
            <input type="time" className="input text-sm" value={bedtime}
              onChange={(e) => { setBedtime(e.target.value); setSaved(false) }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Sun size={12} /> Wake time
            </label>
            <input type="time" className="input text-sm" value={wakeTime}
              onChange={(e) => { setWakeTime(e.target.value); setSaved(false) }} />
          </div>
        </div>

        {tahajjudTime && (
          <div className="bg-tamkeen-dark text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlarmClock size={16} className="text-tamkeen-mint" />
              <div>
                <p className="text-xs text-green-200">Tahajjud window opens</p>
                <p className="font-bold">{fmt12(tahajjudTime)}</p>
              </div>
            </div>
            <button
              onClick={() => { setWoke((w) => !w); setSaved(false) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                wokeForTahajjud ? 'bg-tamkeen-mint text-tamkeen-dark' : 'bg-white/10 text-white'
              }`}
            >
              {wokeForTahajjud ? '✓ I woke up' : 'Did you wake?'}
            </button>
          </div>
        )}

        <button onClick={handleSave} className={`w-full btn-primary py-2.5 text-sm ${saved ? 'bg-green-500' : ''}`}>
          {saved ? '✓ Saved!' : 'Save Sleep Log'}
        </button>
      </div>

      {/* Score */}
      {result && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-tamkeen-ink">Sleep Health Score</p>
            <p className={`text-2xl font-bold ${scoreColor(result.score)}`}>{result.score}/100</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${result.score >= 80 ? 'bg-green-500' : result.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${result.score}%` }} />
          </div>
          <div className="space-y-1.5">
            {result.notes.map((n, i) => (
              <p key={i} className={`text-xs flex items-start gap-1.5 ${n.includes('✓') ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mt-0.5">{n.includes('✓') ? '✓' : '·'}</span> {n}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 7-day history */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Last 7 days</p>
        <div className="space-y-2">
          {history.map(({ date, label, log }) => (
            <div key={date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <p className="text-xs font-medium text-gray-600 w-20">{label}</p>
              {log ? (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🌙 {fmt12(log.bedtime)}</span>
                  <span>☀️ {fmt12(log.wakeTime)}</span>
                  {log.wokeForTahajjud && <span className="text-green-500 font-medium">Tahajjud ✓</span>}
                </div>
              ) : (
                <p className="text-xs text-gray-300">Not logged</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sunnah guide */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-2">Sunnah Sleep Guide</p>
        <div className="space-y-1.5 text-xs text-gray-600">
          <p>🌙 Sleep early — after Isha, not after midnight</p>
          <p>🤲 Read Ayat al-Kursi + Al-Ikhlas/Falaq/Nas before sleeping</p>
          <p>🛏️ Sleep on your right side (as-Sunnah)</p>
          <p>⏰ Wake for Tahajjud in the last ⅓ of night</p>
          <p>🌅 Rise before Fajr — greet the day with prayer</p>
          <p>😴 Qaylulah (midday nap ~20 min) is a Sunnah for energy</p>
        </div>
      </div>
    </div>
  )
}
