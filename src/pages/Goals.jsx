import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Target } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getGoals, createGoal, deleteGoal } from '../services/supabase'
import { generateGoalMilestones } from '../services/aiService'

export const GOAL_CATEGORIES = [
  { id: 'hereafter',    label: 'Hereafter',          icon: '🕌', color: 'bg-green-50  border-green-200' },
  { id: 'financial',    label: 'Financial',           icon: '💰', color: 'bg-amber-50  border-amber-200' },
  { id: 'family',       label: 'Family',              icon: '👨‍👩‍👧', color: 'bg-pink-50   border-pink-200'  },
  { id: 'health',       label: 'Health',              icon: '💪', color: 'bg-blue-50   border-blue-200'  },
  { id: 'personal_dev', label: 'Personal Development',icon: '🧠', color: 'bg-purple-50 border-purple-200'},
]

const STATUS_STYLES = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  abandoned:   'bg-red-100 text-red-600',
}

export default function Goals() {
  const { user, goals, setGoals, addGoal } = useStore()
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [filter, setFilter]       = useState('all')
  const [saving, setSaving]       = useState(false)

  const PRIORITIES = [
    { id: 'high',   label: '🔴 High',   color: 'bg-red-50 border-red-300 text-red-700' },
    { id: 'medium', label: '🟡 Medium', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
    { id: 'low',    label: '🟢 Low',    color: 'bg-green-50 border-green-300 text-green-700' },
  ]

  const [form, setForm] = useState({
    category: 'hereafter', goal_title: '', objective: '',
    timeline_start: '', timeline_end: '', status: 'not_started',
    priority: 'medium', success_metric: '', motivation: '',
    obstacle: '', weekly_hours: '', accountability: '',
  })

  useEffect(() => {
    if (!user) return
    getGoals(user.id).then(({ data }) => {
      if (data) setGoals(data)
      setLoading(false)
    })
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    // Encode SMART extras into objective (no schema change needed)
    let enriched = form.objective
    const extras = [
      form.success_metric && `📊 Measure: ${form.success_metric}`,
      form.motivation     && `💡 Why: ${form.motivation}`,
      form.obstacle       && `⚠️ Obstacle: ${form.obstacle}`,
      form.weekly_hours   && `⏱️ Commitment: ${form.weekly_hours}h/week`,
      form.accountability && `👥 Accountability: ${form.accountability}`,
    ].filter(Boolean)
    if (extras.length) enriched += '\n\n' + extras.join('\n')

    let milestones = null
    try {
      milestones = await generateGoalMilestones({ ...form, user_id: user.id })
    } catch { /* AI unavailable */ }

    const { data } = await createGoal({
      user_id: user.id,
      category: form.category,
      goal_title: form.goal_title,
      objective: enriched,
      timeline_start: form.timeline_start,
      timeline_end: form.timeline_end,
      status: 'not_started',
      ai_milestones: milestones,
    })

    if (data) addGoal({ ...data, _priority: form.priority })
    setForm({ category: 'hereafter', goal_title: '', objective: '', timeline_start: '', timeline_end: '', status: 'not_started', priority: 'medium', success_metric: '', motivation: '', obstacle: '', weekly_hours: '', accountability: '' })
    setShowForm(false)
    setSaving(false)
  }

  const filtered = filter === 'all' ? goals : goals.filter(g => g.category === filter)
  const cat = (id) => GOAL_CATEGORIES.find(c => c.id === id)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">My Goals</h2>
          <p className="text-sm text-gray-400">SMART · OKR Framework</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
        {[{ id: 'all', label: 'All', icon: '📋' }, ...GOAL_CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              filter === c.id
                ? 'bg-tamkeen-dark text-white border-tamkeen-dark'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading goals…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No goals yet</p>
          <p className="text-gray-300 text-sm mt-1">Tap "New Goal" to start building your vision</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => {
            const c = cat(goal.category)
            const krs = goal.key_results || []
            const doneKrs = krs.filter(kr => kr.status === 'completed').length
            return (
              <Link key={goal.id} to={`/goals/${goal.id}`} className={`card block border ${c?.color} active:scale-[0.99] transition-transform`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{c?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-tamkeen-ink text-sm leading-snug">{goal.goal_title}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[goal.status]}`}>
                          {goal.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{goal.objective?.split('\n\n')[0]}</p>
                    {krs.length > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-tamkeen-mid h-1.5 rounded-full transition-all"
                            style={{ width: `${(doneKrs / krs.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{doneKrs}/{krs.length} key results</p>
                      </div>
                    )}
                    {goal.timeline_end && (
                      <p className="text-[10px] text-gray-400 mt-1">📅 Due: {goal.timeline_end}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* New Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-5 pb-8 max-h-[90dvh] overflow-y-auto">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="font-bold text-tamkeen-ink text-lg mb-4">New Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4">

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_CATEGORIES.map((c) => (
                    <button type="button" key={c.id}
                      onClick={() => setForm(f => ({ ...f, category: c.id }))}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-sm transition-all ${
                        form.category === c.id ? 'border-tamkeen-dark bg-tamkeen-mint' : 'border-gray-200'
                      }`}
                    >
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* S — Specific */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  <span className="bg-tamkeen-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">S</span>
                  Goal Title — be specific
                </label>
                <input className="input" placeholder="e.g. Memorize Surah Al-Baqarah" value={form.goal_title}
                  onChange={(e) => setForm(f => ({ ...f, goal_title: e.target.value }))} required />
              </div>

              {/* M — Measurable */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  <span className="bg-tamkeen-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">M</span>
                  Success Metric — how will you measure it?
                </label>
                <input className="input" placeholder="e.g. Can recite all 286 ayahs from memory" value={form.success_metric}
                  onChange={(e) => setForm(f => ({ ...f, success_metric: e.target.value }))} required />
              </div>

              {/* A — Achievable */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  <span className="bg-tamkeen-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">A</span>
                  Priority &amp; commitment
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRIORITIES.map(p => (
                    <button type="button" key={p.id}
                      onClick={() => setForm(f => ({ ...f, priority: p.id }))}
                      className={`py-1.5 rounded-xl border text-xs font-medium transition-all ${form.priority === p.id ? p.color : 'border-gray-200 text-gray-400'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <input className="input" placeholder="Weekly commitment — e.g. 5 hours/week" value={form.weekly_hours}
                  onChange={(e) => setForm(f => ({ ...f, weekly_hours: e.target.value }))} />
              </div>

              {/* R — Relevant */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  <span className="bg-tamkeen-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">R</span>
                  Why does this matter to you?
                </label>
                <textarea className="input resize-none" rows={2} placeholder="e.g. Strengthen my connection with the Quran before Ramadan"
                  value={form.motivation} onChange={(e) => setForm(f => ({ ...f, motivation: e.target.value }))} required />
              </div>

              {/* T — Time-bound */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  <span className="bg-tamkeen-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">T</span>
                  Timeline
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="input text-sm" placeholder="Start" value={form.timeline_start}
                    onChange={(e) => setForm(f => ({ ...f, timeline_start: e.target.value }))} />
                  <input type="date" className="input text-sm" placeholder="Target date" value={form.timeline_end}
                    onChange={(e) => setForm(f => ({ ...f, timeline_end: e.target.value }))} required />
                </div>
              </div>

              {/* OKR extras */}
              <div className="border-t pt-3 space-y-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">OKR Details</p>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Objective — what does full success look like?</label>
                  <textarea className="input resize-none" rows={2} placeholder="e.g. Complete memorization of all 286 ayahs with correct tajweed"
                    value={form.objective} onChange={(e) => setForm(f => ({ ...f, objective: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Biggest obstacle</label>
                  <input className="input" placeholder="e.g. Finding consistent time in evenings"
                    value={form.obstacle} onChange={(e) => setForm(f => ({ ...f, obstacle: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Accountability partner</label>
                  <input className="input" placeholder="e.g. Abu Ibrahim — check in every Friday"
                    value={form.accountability} onChange={(e) => setForm(f => ({ ...f, accountability: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving + AI milestones…' : 'Create Goal ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
