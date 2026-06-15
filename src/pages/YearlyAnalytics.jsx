import { useState, useEffect, useMemo } from 'react'
import { Download, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../services/supabase'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getColor(pct) {
  if (pct === null) return '#f3f4f6'
  if (pct === 0) return '#f3f4f6'
  if (pct < 0.25) return '#bbf7d0'
  if (pct < 0.5)  return '#4ade80'
  if (pct < 0.75) return '#16a34a'
  return '#1B4332'
}

function scoreLog(log) {
  if (!log) return null
  const prayers = ['salat_fajr','salat_dhuhr','salat_asr','salat_maghrib','salat_isha']
  const prayerScore = prayers.filter((p) => ['mosque','home','late'].includes(log[p])).length / 5
  const otherItems  = [log.adhkar_morning, log.adhkar_evening, log.tahajjud, log.quran_pages > 0, log.tawbah_before_subhi, log.tawbah_after_isha].filter(Boolean).length
  const otherScore  = otherItems / 6
  return (prayerScore * 0.6 + otherScore * 0.4)
}

export default function YearlyAnalytics() {
  const { user } = useStore()
  const [logs, setLogs]       = useState({}) // { 'YYYY-MM-DD': log }
  const [loading, setLoading] = useState(true)
  const [year, setYear]       = useState(new Date().getFullYear())

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const from = `${year}-01-01`, to = `${year}-12-31`
      const { data } = await supabase
        .from('wajibaat_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', from)
        .lte('date', to)
      if (data) {
        const map = {}
        data.forEach((d) => { map[d.date] = d })
        setLogs(map)
      }
      setLoading(false)
    }
    load()
  }, [user, year])

  // Build a full year grid
  const grid = useMemo(() => {
    const weeks = []
    const start = new Date(`${year}-01-01`)
    // Pad to start of week (Sunday)
    const firstDay = start.getDay()
    let cur = new Date(start)
    cur.setDate(cur.getDate() - firstDay)

    const end = new Date(`${year}-12-31`)
    while (cur <= end || cur.getDay() !== 0) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const key  = cur.toISOString().slice(0, 10)
        const inYear = cur.getFullYear() === year
        week.push({ key, inYear, pct: inYear ? scoreLog(logs[key]) : null, month: cur.getMonth(), date: cur.getDate() })
        cur.setDate(cur.getDate() + 1)
      }
      weeks.push(week)
      if (cur > end && cur.getDay() === 0) break
    }
    return weeks
  }, [year, logs])

  // Stats
  const stats = useMemo(() => {
    const days = Object.values(logs).filter(Boolean)
    if (!days.length) return null

    const scores = days.map((d) => ({ date: d.date, pct: scoreLog(d) })).filter((d) => d.pct !== null)
    const activeDays = scores.filter((s) => s.pct > 0).length
    const avgScore   = scores.length ? scores.reduce((a, s) => a + s.pct, 0) / scores.length : 0
    const perfectDays= scores.filter((s) => s.pct >= 0.9).length

    // Best month
    const byMonth = {}
    scores.forEach((s) => {
      const m = new Date(s.date).getMonth()
      if (!byMonth[m]) byMonth[m] = []
      byMonth[m].push(s.pct)
    })
    let bestMonth = 0, bestMonthAvg = 0
    Object.entries(byMonth).forEach(([m, arr]) => {
      const avg = arr.reduce((a, v) => a + v, 0) / arr.length
      if (avg > bestMonthAvg) { bestMonthAvg = avg; bestMonth = Number(m) }
    })

    // Longest streak
    const sorted = Object.keys(logs).sort()
    let maxStreak = 0, cur = 0, prev = null
    sorted.forEach((d) => {
      const pct = scoreLog(logs[d])
      if (pct && pct >= 0.6) {
        if (prev) {
          const diff = (new Date(d) - new Date(prev)) / 86400000
          cur = diff === 1 ? cur + 1 : 1
        } else cur = 1
        maxStreak = Math.max(maxStreak, cur)
        prev = d
      } else { cur = 0; prev = null }
    })

    return { activeDays, avgScore: Math.round(avgScore * 100), perfectDays, bestMonth, bestMonthAvg: Math.round(bestMonthAvg * 100), longestStreak: maxStreak }
  }, [logs])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">Yearly Analytics</h2>
          <p className="text-sm text-gray-500">Your practice heatmap</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">‹</button>
          <span className="text-sm font-bold text-tamkeen-ink">{year}</span>
          <button onClick={() => setYear((y) => Math.min(y + 1, new Date().getFullYear()))} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">›</button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-tamkeen-ink">{stats.activeDays}</p>
            <p className="text-[10px] text-gray-400">Active days</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-tamkeen-ink">{stats.avgScore}%</p>
            <p className="text-[10px] text-gray-400">Average score</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-green-500">{stats.longestStreak}</p>
            <p className="text-[10px] text-gray-400">Longest streak 🔥</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-tamkeen-dark">{stats.perfectDays}</p>
            <p className="text-[10px] text-gray-400">Perfect days (90%+)</p>
          </div>
          {stats.bestMonth >= 0 && (
            <div className="card col-span-2 flex items-center gap-3">
              <TrendingUp size={20} className="text-tamkeen-dark" />
              <div>
                <p className="text-sm font-bold text-tamkeen-ink">Best month: {MONTHS[stats.bestMonth]}</p>
                <p className="text-xs text-gray-400">{stats.bestMonthAvg}% average score</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Heatmap */}
      <div className="card overflow-x-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Practice Heatmap — {year}</p>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-tamkeen-dark border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs">Loading your data…</p>
          </div>
        ) : (
          <>
            {/* Month labels */}
            <div className="flex gap-0 mb-1 pl-5">
              {MONTHS.map((m, i) => {
                const weekIdx = grid.findIndex((week) => week.some((day) => day.month === i && day.inYear && day.date <= 7))
                return (
                  <div key={m} className="text-[9px] text-gray-400"
                    style={{ marginLeft: weekIdx > 0 && i === 0 ? 0 : undefined, minWidth: '28px' }}>
                    {m}
                  </div>
                )
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="w-3 h-3 flex items-center justify-center text-[8px] text-gray-300">{i%2===1?d:''}</div>
                ))}
              </div>
              {/* Weeks */}
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day) => (
                    <div key={day.key} title={`${day.key}: ${day.pct !== null ? Math.round(day.pct*100)+'%' : 'no data'}`}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: day.inYear ? getColor(day.pct) : 'transparent' }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-gray-400">Less</span>
              {[null, 0.1, 0.4, 0.65, 0.9].map((v, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(v) }} />
              ))}
              <span className="text-[9px] text-gray-400">More</span>
            </div>
          </>
        )}
      </div>

      {/* Month breakdown */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Monthly breakdown</p>
        <div className="space-y-2">
          {MONTHS.map((m, idx) => {
            const monthLogs = Object.entries(logs)
              .filter(([d]) => new Date(d).getMonth() === idx && new Date(d).getFullYear() === year)
              .map(([, log]) => scoreLog(log))
              .filter((s) => s !== null)
            if (!monthLogs.length) return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xs text-gray-300 w-8">{m}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />
                <span className="text-xs text-gray-300">—</span>
              </div>
            )
            const avg = monthLogs.reduce((a,v) => a+v, 0) / monthLogs.length
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{m}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${avg*100}%`, backgroundColor: getColor(avg) }} />
                </div>
                <span className="text-xs font-medium text-tamkeen-ink w-10 text-right">{Math.round(avg*100)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {!stats && !loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-sm">No data yet for {year}. Start tracking your wajibaat daily.</p>
        </div>
      )}
    </div>
  )
}
