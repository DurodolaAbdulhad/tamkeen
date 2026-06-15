import { format, subDays, parseISO } from 'date-fns'

// Minimum completion to count as a "done" day (60%)
const MIN_COMPLETION = 0.6

export const scoreWajibaatLog = (log) => {
  if (!log) return { score: 0, total: 8, completed: 0, pct: 0, missedItems: [] }

  const checks = [
    { key: 'salat_all_done', label: 'Five Salat',        done: isSalatDone(log) },
    { key: 'fasting',        label: 'Fasting',           done: log.fasting === true },
    { key: 'tahajjud',       label: 'Tahajjud',          done: log.tahajjud === true },
    { key: 'adhkar_morning', label: 'Morning Adhkar',    done: log.adhkar_morning === true },
    { key: 'adhkar_evening', label: 'Evening Adhkar',    done: log.adhkar_evening === true },
    { key: 'salat_duha',     label: 'Salat Duha',        done: log.salat_duha === true },
    { key: 'quran_juz',      label: 'Quran (1 Juz)',     done: (log.quran_pages || 0) >= 20 },
    { key: 'tawbah',         label: 'Salat Tawbah',      done: log.tawbah_before_subhi === true || log.tawbah_after_isha === true },
    { key: 'sadaqah',        label: 'Sadaqah',           done: log.sadaqah === true },
  ]

  // Fasting is optional (not every day), exclude if no fast day
  const applicable = checks.filter((c) => !(c.key === 'fasting' && !log.is_fast_day))
  const completed  = applicable.filter((c) => c.done).length
  const total      = applicable.length
  const pct        = total > 0 ? completed / total : 0
  const missedItems = applicable.filter((c) => !c.done).map((c) => c.label)

  return { score: completed, total, completed, pct, missedItems }
}

export const isSalatDone = (log) => {
  if (!log) return false
  const prayers = ['salat_fajr', 'salat_dhuhr', 'salat_asr', 'salat_maghrib', 'salat_isha']
  return prayers.every((p) => log[p] && log[p] !== 'missed' && log[p] !== 'pending')
}

export const calculateStreak = (logs) => {
  if (!logs || logs.length === 0) return { current: 0, longest: 0 }

  const logMap = {}
  logs.forEach((l) => { logMap[l.date] = l })

  let current = 0
  let longest = 0
  let streak  = 0

  // Walk backwards from today
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date    = format(subDays(today, i), 'yyyy-MM-dd')
    const log     = logMap[date]
    const { pct } = scoreWajibaatLog(log)

    if (pct >= MIN_COMPLETION) {
      streak++
      if (i < streak) current = streak
      longest = Math.max(longest, streak)
    } else {
      if (i === 0) break // today incomplete — current streak ends
      streak = 0
    }
  }

  return { current, longest }
}

export const getWeekSummary = (logs) => {
  return logs.map((log) => {
    const { pct, completed, total, missedItems } = scoreWajibaatLog(log)
    return { date: log.date, pct, completed, total, missedItems }
  })
}

export const getCompletionLabel = (pct) => {
  if (pct >= 1.0)  return { label: 'Perfect',    color: 'text-green-600',  emoji: '⭐' }
  if (pct >= 0.85) return { label: 'Excellent',  color: 'text-green-500',  emoji: '🌿' }
  if (pct >= 0.7)  return { label: 'Good',        color: 'text-blue-600',   emoji: '✅' }
  if (pct >= 0.5)  return { label: 'Half Done',   color: 'text-yellow-600', emoji: '🌤' }
  return                  { label: 'Keep Going',  color: 'text-red-500',    emoji: '💪' }
}
