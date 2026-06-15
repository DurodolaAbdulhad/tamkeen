import { useState } from 'react'
import { useWajibaat } from '../hooks/useWajibaat'
import { usePrayer } from '../hooks/usePrayer'
import { useStore } from '../store/useStore'
import { formatPrayerTime, PRAYER_NAMES, SALAT_STATUS } from '../services/prayerTimes'
import { getFastingType, FAST_TYPE_LABELS } from '../services/hijriCalendar'
import { isMondayOrThursday } from '../utils/dateHelpers'
import { scoreWajibaatLog } from '../utils/streaks'
import CheckCircle from '../components/ui/CheckCircle'
import ProgressRing from '../components/ui/ProgressRing'

const SalatStatusPicker = ({ value, onChange }) => (
  <div className="flex gap-1.5 mt-2">
    {Object.values(SALAT_STATUS).filter(s => s.value !== 'pending').map((s) => (
      <button
        key={s.value}
        onClick={() => onChange(s.value)}
        className={`text-[10px] font-medium px-2 py-1 rounded-full border transition-all ${
          value === s.value
            ? s.color + ' border-transparent ring-1 ring-tamkeen-dark'
            : 'bg-white text-gray-500 border-gray-200'
        }`}
      >
        {s.label}
      </button>
    ))}
  </div>
)

export default function Wajibaat() {
  const { todayLog, update, updateSalat, loading } = useWajibaat()
  const { prayerTimes, hijriDate } = usePrayer()
  const { currentStreak } = useStore()
  const [expandedSalat, setExpandedSalat] = useState(null)

  const { pct, completed, total } = scoreWajibaatLog(todayLog)

  const fastType   = getFastingType(new Date(), hijriDate)
  const fastLabel  = fastType ? FAST_TYPE_LABELS[fastType] : null
  const isFastDay  = fastType !== null

  const tog = (field) => update(field, !todayLog?.[field])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 card bg-tamkeen-dark text-white">
        <ProgressRing pct={pct} size={64} stroke={6} label={`${completed}/${total}`} />
        <div>
          <p className="font-bold text-lg">Daily Wajibaat</p>
          <p className="text-green-300 text-sm">{Math.round(pct*100)}% complete today</p>
          {currentStreak > 0 && <p className="text-green-200 text-xs mt-0.5">🔥 {currentStreak} day streak</p>}
        </div>
      </div>

      {/* 1. Five Daily Salat */}
      <div className="card space-y-3">
        <h3 className="font-bold text-tamkeen-ink flex items-center gap-2">
          <span>🕌</span> Five Daily Salat
        </h3>
        {PRAYER_NAMES.map((p) => {
          const field = `salat_${p.key.toLowerCase()}`
          const status = todayLog?.[field] || 'pending'
          const isExpanded = expandedSalat === p.key
          return (
            <div key={p.key} className="border-b last:border-0 pb-3 last:pb-0">
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setExpandedSalat(isExpanded ? null : p.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm text-tamkeen-ink">{p.label}</p>
                    <p className="font-arabic text-xs text-gray-400">{p.arabic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prayerTimes?.[p.key] && (
                    <span className="text-xs text-gray-400">{formatPrayerTime(prayerTimes[p.key])}</span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SALAT_STATUS[status]?.color || 'bg-gray-100 text-gray-500'}`}>
                    {SALAT_STATUS[status]?.label || 'Pending'}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <SalatStatusPicker
                  value={status}
                  onChange={(val) => { updateSalat(p.key, val); setExpandedSalat(null) }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* 2. Fasting */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Fasting Today</h3>
              {isFastDay
                ? <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${fastLabel?.color}`}>{fastLabel?.icon} {fastLabel?.label}</span>
                : <p className="text-xs text-gray-400">No recommended fast today</p>}
            </div>
          </div>
          <CheckCircle done={!!todayLog?.fasting} onClick={() => tog('fasting')} />
        </div>
      </div>

      {/* 3. Tahajjud */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌃</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Tahajjud</h3>
              {prayerTimes?.Tahajjud
                ? <p className="text-xs text-gray-400">From {formatPrayerTime(prayerTimes.Tahajjud)} (last ⅓ of night)</p>
                : <p className="text-xs text-gray-400">Last third of the night</p>}
            </div>
          </div>
          <CheckCircle done={!!todayLog?.tahajjud} onClick={() => tog('tahajjud')} />
        </div>
      </div>

      {/* 4. Morning Adhkar */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Morning Adhkar</h3>
              <p className="text-xs text-gray-400">After Fajr · أذكار الصباح</p>
            </div>
          </div>
          <CheckCircle done={!!todayLog?.adhkar_morning} onClick={() => tog('adhkar_morning')} />
        </div>
      </div>

      {/* Evening Adhkar */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌆</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Evening Adhkar</h3>
              <p className="text-xs text-gray-400">After Asr · أذكار المساء</p>
            </div>
          </div>
          <CheckCircle done={!!todayLog?.adhkar_evening} onClick={() => tog('adhkar_evening')} />
        </div>
      </div>

      {/* 5. Salat Duha */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Salat Duha</h3>
              <p className="text-xs text-gray-400">After sunrise, before Dhuhr · صلاة الضحى</p>
            </div>
          </div>
          <CheckCircle done={!!todayLog?.salat_duha} onClick={() => tog('salat_duha')} />
        </div>
      </div>

      {/* 6. Quran */}
      <div className="card">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">📖</span>
          <div className="flex-1">
            <h3 className="font-bold text-tamkeen-ink text-sm">One Juz of Quran</h3>
            <p className="text-xs text-gray-400">Daily target: ~20 pages</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Pages read today</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="30"
                className="input w-20 text-center"
                value={todayLog?.quran_pages || ''}
                onChange={(e) => update('quran_pages', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <span className="text-xs text-gray-400">/ 20 pages</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Juz number</label>
            <select
              className="input text-sm"
              value={todayLog?.quran_juz || ''}
              onChange={(e) => update('quran_juz', parseInt(e.target.value))}
            >
              <option value="">Select Juz</option>
              {Array.from({length:30},(_,i)=><option key={i+1} value={i+1}>Juz {i+1}</option>)}
            </select>
          </div>
        </div>
        {(todayLog?.quran_pages || 0) >= 20 && (
          <p className="text-xs text-green-600 font-medium mt-2">✅ Juz complete today!</p>
        )}
      </div>

      {/* 7. Salat Tawbah */}
      <div className="card space-y-3">
        <h3 className="font-bold text-tamkeen-ink flex items-center gap-2">
          <span>🤲</span> Salat Tawbah
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-tamkeen-ink">Before Fajr</p>
            <p className="text-xs text-gray-400">After tahajjud / before subhi</p>
          </div>
          <CheckCircle done={!!todayLog?.tawbah_before_subhi} onClick={() => tog('tawbah_before_subhi')} />
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-sm font-medium text-tamkeen-ink">After Isha</p>
            <p className="text-xs text-gray-400">Before sleep</p>
          </div>
          <CheckCircle done={!!todayLog?.tawbah_after_isha} onClick={() => tog('tawbah_after_isha')} />
        </div>
      </div>

      {/* 8. Sadaqah */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <div>
              <h3 className="font-bold text-tamkeen-ink text-sm">Sadaqah</h3>
              <p className="text-xs text-gray-400">Give charity today · الصدقة</p>
            </div>
          </div>
          <CheckCircle done={!!todayLog?.sadaqah} onClick={() => tog('sadaqah')} />
        </div>
      </div>

      <div className="h-2" />
    </div>
  )
}
