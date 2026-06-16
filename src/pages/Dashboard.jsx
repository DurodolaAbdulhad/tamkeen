import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles, Heart } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useWajibaat } from '../hooks/useWajibaat'
import { usePrayer } from '../hooks/usePrayer'
import { scoreWajibaatLog, getCompletionLabel } from '../utils/streaks'
import { todayDisp } from '../utils/dateHelpers'
import { getRandomAyah } from '../services/quranAPI'
import { getFallbackHadith } from '../services/hadithAPI'
import { getDailyEncouragement } from '../services/aiService'
import { schedulePrayerNotifications } from '../services/firebase'
import ProgressRing from '../components/ui/ProgressRing'
import { formatPrayerTime, PRAYER_NAMES } from '../services/prayerTimes'

export default function Dashboard() {
  const { profile, currentStreak, longestStreak, dailyAyah, dailyHadith, aiMessage, dailyContentDate, setDailyContent } = useStore()
  const { todayLog } = useWajibaat()
  const { prayerTimes } = usePrayer()
  const [nextPrayer, setNextPrayer] = useState(null)

  const { pct, completed, total, missedItems } = scoreWajibaatLog(todayLog)
  const label = getCompletionLabel(pct)

  // Load daily content once per day
  useEffect(() => {
    const today = new Date().toDateString()
    if (dailyContentDate === today) return

    Promise.all([getRandomAyah(), Promise.resolve(getFallbackHadith())]).then(([ayah, hadith]) => {
      getDailyEncouragement({ completed, total, streak: currentStreak, missedItems }, profile?.name)
        .then((msg) => setDailyContent(hadith, ayah, msg, today))
        .catch(() => setDailyContent(hadith, ayah, null, today))
    })
  }, [])

  // Schedule prayer notifications when prayer times + daily content are available
  useEffect(() => {
    if (!prayerTimes || !('Notification' in window) || Notification.permission !== 'granted') return
    schedulePrayerNotifications(prayerTimes, dailyAyah, dailyHadith)
  }, [prayerTimes, dailyAyah, dailyHadith])

  // Find next prayer
  useEffect(() => {
    if (!prayerTimes) return
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()

    for (const p of PRAYER_NAMES) {
      const t = prayerTimes[p.key]
      if (!t) continue
      const [h, m] = t.split(':').map(Number)
      if (h * 60 + m > nowMins) {
        setNextPrayer({ ...p, time: t })
        break
      }
    }
  }, [prayerTimes])

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <p className="text-gray-500 text-sm">{todayDisp()}</p>
        <h2 className="text-xl font-bold text-tamkeen-ink">
          As-salamu alaykum{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 🌿
        </h2>
      </div>

      {/* Today's progress ring */}
      <div className="card flex items-center gap-4">
        <ProgressRing
          pct={pct}
          size={80}
          stroke={7}
          label={`${Math.round(pct * 100)}%`}
          sublabel="today"
        />
        <div className="flex-1">
          <p className={`font-semibold ${label.color}`}>{label.emoji} {label.label}</p>
          <p className="text-sm text-gray-500 mt-0.5">{completed} of {total} practices complete</p>
          {missedItems.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Remaining: {missedItems.slice(0,3).join(' · ')}{missedItems.length > 3 ? '…' : ''}</p>
          )}
          <Link to="/wajibaat" className="inline-flex items-center gap-1 text-tamkeen-dark text-sm font-medium mt-2">
            Update tracker <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-tamkeen-ink">{currentStreak}</div>
          <div className="text-xs text-gray-400">Current streak</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-2xl font-bold text-tamkeen-ink">{longestStreak}</div>
          <div className="text-xs text-gray-400">Longest streak</div>
        </div>
      </div>

      {/* Next prayer */}
      {nextPrayer && prayerTimes && (
        <div className="card bg-tamkeen-dark text-white">
          <p className="text-xs text-green-300 font-medium mb-1">NEXT PRAYER</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nextPrayer.icon}</span>
              <div>
                <p className="font-bold text-lg">{nextPrayer.label}</p>
                <p className="text-tamkeen-mint font-arabic text-sm">{nextPrayer.arabic}</p>
              </div>
            </div>
            <p className="text-2xl font-bold">{formatPrayerTime(nextPrayer.time)}</p>
          </div>
        </div>
      )}

      {/* Prayer times strip */}
      {prayerTimes && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Today's Prayer Times — Lagos</p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {PRAYER_NAMES.map((p) => (
              <div key={p.key} className="flex flex-col items-center">
                <span className="text-base">{p.icon}</span>
                <span className="text-[10px] font-medium text-gray-600">{p.label}</span>
                <span className="text-[11px] text-tamkeen-dark font-bold mt-0.5">
                  {formatPrayerTime(prayerTimes[p.key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI message */}
      {aiMessage && (
        <div className="card border-l-4 border-tamkeen-light">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-tamkeen-light mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{aiMessage}</p>
          </div>
        </div>
      )}

      {/* Daily Hadith */}
      {dailyHadith && (
        <div className="card bg-green-50">
          <p className="text-xs font-semibold text-tamkeen-dark mb-2 uppercase tracking-wide">Hadith of the Day</p>
          {dailyHadith.arabic && (
            <p className="arabic text-lg text-tamkeen-dark mb-3">{dailyHadith.arabic}</p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed italic">"{dailyHadith.hadith}"</p>
          <p className="text-xs text-gray-400 mt-2">
            — {dailyHadith.narrator} · {dailyHadith.source}
          </p>
        </div>
      )}

      {/* Daily Ayah */}
      {dailyAyah && (
        <div className="card">
          <p className="text-xs font-semibold text-tamkeen-dark mb-2 uppercase tracking-wide">Ayah of the Day</p>
          {dailyAyah.arabic && (
            <p className="arabic text-xl text-tamkeen-ink mb-3">{dailyAyah.arabic}</p>
          )}
          <p className="text-sm text-gray-600 leading-relaxed italic">"{dailyAyah.english}"</p>
          <p className="text-xs text-gray-400 mt-2">{dailyAyah.reference}</p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Link to="/goals" className="card flex items-center gap-2 active:scale-95 transition-transform">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-sm font-semibold text-tamkeen-ink">My Goals</p>
            <p className="text-xs text-gray-400">SMART · OKR</p>
          </div>
          <ChevronRight size={14} className="ml-auto text-gray-300" />
        </Link>
        <Link to="/reports" className="card flex items-center gap-2 active:scale-95 transition-transform">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-sm font-semibold text-tamkeen-ink">Reports</p>
            <p className="text-xs text-gray-400">Weekly PDF</p>
          </div>
          <ChevronRight size={14} className="ml-auto text-gray-300" />
        </Link>
      </div>

      {/* Donate banner */}
      <Link to="/donate" className="card bg-green-50 flex items-center gap-3 active:scale-95 transition-transform border border-green-100">
        <Heart size={20} className="text-green-500 fill-green-200 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-tamkeen-ink">Support Tamkeen</p>
          <p className="text-xs text-gray-500">Donate from ₦1,000 — keep it free for everyone</p>
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </Link>
    </div>
  )
}
