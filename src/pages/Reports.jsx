import { useEffect, useState, useRef } from 'react'
import { Download, Calendar } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getWajibaatRange } from '../services/supabase'
import { getWeekDates, getWeekStart } from '../utils/dateHelpers'
import { scoreWajibaatLog, getCompletionLabel } from '../utils/streaks'
import { subWeeks, format } from 'date-fns'
import ProgressRing from '../components/ui/ProgressRing'

const WeekBar = ({ day, pct }) => {
  const h = Math.round(pct * 48)
  const color = pct >= 0.85 ? '#1B4332' : pct >= 0.6 ? '#40916C' : pct >= 0.3 ? '#FCD34D' : '#FCA5A5'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 bg-gray-100 rounded-full flex flex-col justify-end" style={{ height: 48 }}>
        <div className="w-full rounded-full transition-all" style={{ height: h, backgroundColor: color, minHeight: pct > 0 ? 4 : 0 }} />
      </div>
      <span className="text-[10px] text-gray-500">{day}</span>
    </div>
  )
}

export default function Reports() {
  const { user, profile, currentStreak, longestStreak } = useStore()
  const [logs, setLogs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef(null)

  const weekDates = getWeekDates()
  const weekStart = getWeekStart()

  useEffect(() => {
    if (!user) return
    const end   = format(new Date(), 'yyyy-MM-dd')
    const start = format(subWeeks(new Date(), 4), 'yyyy-MM-dd')
    getWajibaatRange(user.id, start, end).then(({ data }) => {
      if (data) setLogs(data)
      setLoading(false)
    })
  }, [user])

  const logMap = {}
  logs.forEach(l => { logMap[l.date] = l })

  const weekData = weekDates.map(d => ({
    ...d,
    ...scoreWajibaatLog(logMap[d.date]),
  }))

  const weekPct  = weekData.reduce((s,d) => s + d.pct, 0) / 7
  const weekDone = weekData.reduce((s,d) => s + d.completed, 0)
  const weekTotal= weekData.reduce((s,d) => s + d.total, 0)
  const label    = getCompletionLabel(weekPct)

  // Last 4 weeks
  const last4 = Array.from({ length: 4 }, (_, i) => {
    const refDate = subWeeks(new Date(), i)
    const days    = getWeekDates(refDate)
    const scores  = days.map(d => scoreWajibaatLog(logMap[d.date]))
    const avgPct  = scores.reduce((s,sc) => s + sc.pct, 0) / 7
    return { week: format(days[0].date ? new Date(days[0].date) : refDate, 'MMM d'), pct: avgPct }
  }).reverse()

  const handleDownload = async () => {
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#FAFAF5' })
      const link = document.createElement('a')
      link.download = `tamkeen-report-${weekStart}.png`
      link.href     = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { console.error(e) }
    setExporting(false)
  }

  const handleDownloadPDF = async () => {
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF }                = await import('jspdf')
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#FAFAF5' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`tamkeen-report-${weekStart}.pdf`)
    } catch (e) { console.error(e) }
    setExporting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-tamkeen-ink">Weekly Report</h2>
        <div className="flex gap-2">
          <button onClick={handleDownload} disabled={exporting}
            className="flex items-center gap-1 btn-secondary py-2 px-3 text-xs">
            <Download size={14} /> PNG
          </button>
          <button onClick={handleDownloadPDF} disabled={exporting}
            className="flex items-center gap-1 btn-primary py-2 px-3 text-xs">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Printable report area */}
      <div ref={reportRef} className="space-y-4 bg-tamkeen-cream p-4 rounded-2xl">

        {/* Report header */}
        <div className="card bg-tamkeen-dark text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-tamkeen-mint rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 40 36" className="w-5 h-5 fill-tamkeen-dark">
                <path d="M20 0L40 36H27.5L20 19L12.5 36H0L20 0Z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Tamkeen — تمكين</p>
              <p className="text-green-300 text-xs">Weekly Report · {profile?.name}</p>
            </div>
          </div>
          <p className="text-green-200 text-xs">Week of {format(new Date(weekStart), 'MMMM d, yyyy')}</p>
        </div>

        {/* This week summary */}
        <div className="card flex items-center gap-4">
          <ProgressRing pct={weekPct} size={80} stroke={7} label={`${Math.round(weekPct*100)}%`} sublabel="this week" />
          <div>
            <p className={`font-bold ${label.color}`}>{label.emoji} {label.label}</p>
            <p className="text-sm text-gray-500">{weekDone} practices out of {weekTotal}</p>
            <div className="flex gap-3 mt-2">
              <div className="text-center">
                <p className="text-lg font-bold text-tamkeen-ink">🔥 {currentStreak}</p>
                <p className="text-[10px] text-gray-400">Current</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-tamkeen-ink">⭐ {longestStreak}</p>
                <p className="text-[10px] text-gray-400">Longest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Day-by-day bars */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">This Week — Daily Completion</p>
          <div className="flex justify-between items-end">
            {weekData.map((d) => <WeekBar key={d.date} day={d.dayShort} pct={d.pct} />)}
          </div>
        </div>

        {/* Wajibaat breakdown */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Wajibaat Detail This Week</p>
          <div className="space-y-2">
            {[
              { label: '🕌 Five Salat',       field: 'salat_all' },
              { label: '🌙 Fasting',          field: 'fasting'   },
              { label: '🌃 Tahajjud',         field: 'tahajjud'  },
              { label: '📿 Morning Adhkar',   field: 'adhkar_morning' },
              { label: '📿 Evening Adhkar',   field: 'adhkar_evening' },
              { label: '☀️ Salat Duha',       field: 'salat_duha'},
              { label: '📖 Quran (1 Juz)',    field: 'quran'     },
              { label: '🤲 Salat Tawbah',     field: 'tawbah'    },
              { label: '🤝 Sadaqah',          field: 'sadaqah'   },
            ].map(({ label, field }) => {
              const done = weekData.filter(d => {
                const log = logMap[d.date]
                if (!log) return false
                if (field === 'salat_all') return ['salat_fajr','salat_dhuhr','salat_asr','salat_maghrib','salat_isha'].every(f => log[f] && log[f] !== 'missed')
                if (field === 'quran') return (log.quran_pages||0) >= 20
                if (field === 'tawbah') return log.tawbah_before_subhi || log.tawbah_after_isha
                return !!log[field]
              }).length
              return (
                <div key={field} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-tamkeen-dark h-2 rounded-full" style={{ width: `${(done/7)*100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{done}/7</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4-week trend */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">4-Week Trend</p>
          <div className="flex justify-between items-end">
            {last4.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 bg-gray-100 rounded-lg flex flex-col justify-end" style={{ height: 60 }}>
                  <div className="w-full rounded-lg bg-tamkeen-mid transition-all"
                    style={{ height: Math.round(w.pct * 60), minHeight: w.pct > 0 ? 4 : 0 }} />
                </div>
                <span className="text-[10px] text-gray-500">{w.week}</span>
                <span className="text-[10px] font-bold text-tamkeen-dark">{Math.round(w.pct*100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400">
          Generated by Tamkeen · tamkeen.durodola.africa · بِسْمِ اللَّهِ
        </p>
      </div>
    </div>
  )
}
