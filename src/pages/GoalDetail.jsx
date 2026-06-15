import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { updateGoal, deleteGoal, upsertKeyResult, updateKeyResult } from '../services/supabase'
import { GOAL_CATEGORIES } from './Goals'

const STATUS_OPTIONS = ['not_started','in_progress','completed','abandoned']

export default function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goals, updateGoal: updateStore, removeGoal } = useStore()
  const goal = goals.find(g => g.id === id)

  const [editing, setEditing]     = useState(false)
  const [newKR, setNewKR]         = useState({ description:'', target_value:'', unit:'', due_date:'' })
  const [showKRForm, setShowKRForm] = useState(false)
  const [krs, setKrs]             = useState(goal?.key_results || [])

  const cat = GOAL_CATEGORIES.find(c => c.id === goal?.category)

  if (!goal) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Goal not found</p>
      <button onClick={() => navigate('/goals')} className="btn-ghost mt-4">← Back to Goals</button>
    </div>
  )

  const milestones = goal.ai_milestones || []

  const handleStatusChange = async (status) => {
    await updateGoal(goal.id, { status })
    updateStore(goal.id, { status })
  }

  const handleAddKR = async (e) => {
    e.preventDefault()
    const { data } = await upsertKeyResult({ ...newKR, goal_id: goal.id, status: 'not_started', current_value: 0 })
    if (data) {
      const updated = [...krs, data]
      setKrs(updated)
      updateStore(goal.id, { key_results: updated })
    }
    setNewKR({ description:'', target_value:'', unit:'', due_date:'' })
    setShowKRForm(false)
  }

  const toggleKR = async (kr) => {
    const newStatus = kr.status === 'completed' ? 'in_progress' : 'completed'
    await updateKeyResult(kr.id, { status: newStatus })
    const updated = krs.map(k => k.id === kr.id ? { ...k, status: newStatus } : k)
    setKrs(updated)
    updateStore(goal.id, { key_results: updated })
  }

  const handleDelete = async () => {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    await deleteGoal(goal.id)
    removeGoal(goal.id)
    navigate('/goals')
  }

  const doneKrs = krs.filter(k => k.status === 'completed').length
  const krPct   = krs.length > 0 ? doneKrs / krs.length : 0

  return (
    <div className="space-y-4 pb-4">
      {/* Back button */}
      <button onClick={() => navigate('/goals')} className="flex items-center gap-1 text-tamkeen-dark text-sm font-medium">
        <ArrowLeft size={16} /> Goals
      </button>

      {/* Goal header */}
      <div className={`card border ${cat?.color}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{cat?.icon}</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-400 uppercase">{cat?.label}</p>
            <h2 className="font-bold text-tamkeen-ink text-lg leading-snug mt-0.5">{goal.goal_title}</h2>
            <p className="text-sm text-gray-600 mt-1">{goal.objective}</p>
            {goal.timeline_end && <p className="text-xs text-gray-400 mt-2">📅 Target: {goal.timeline_end}</p>}
          </div>
        </div>
        {/* Status selector */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => handleStatusChange(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                goal.status === s ? 'bg-tamkeen-dark text-white border-tamkeen-dark' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >{s.replace('_',' ')}</button>
          ))}
        </div>
      </div>

      {/* Key Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-tamkeen-ink text-sm">Key Results</h3>
            <p className="text-xs text-gray-400">{doneKrs}/{krs.length} completed</p>
          </div>
          <button onClick={() => setShowKRForm(true)} className="flex items-center gap-1 text-tamkeen-light text-xs font-medium">
            <Plus size={14} /> Add KR
          </button>
        </div>

        {/* KR Progress bar */}
        {krs.length > 0 && (
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div className="bg-tamkeen-dark h-2 rounded-full transition-all" style={{ width: `${krPct * 100}%` }} />
          </div>
        )}

        {krs.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No key results yet — add measurable outcomes below</p>
        )}

        <div className="space-y-2">
          {krs.map((kr) => (
            <div key={kr.id} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50">
              <button onClick={() => toggleKR(kr)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  kr.status === 'completed' ? 'bg-tamkeen-dark border-tamkeen-dark text-white' : 'border-gray-300'
                }`}
              >
                {kr.status === 'completed' && <Check size={10} strokeWidth={3} />}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${kr.status === 'completed' ? 'line-through text-gray-400' : 'text-tamkeen-ink'}`}>
                  {kr.description}
                </p>
                {kr.target_value && <p className="text-xs text-gray-400 mt-0.5">Target: {kr.target_value} {kr.unit}</p>}
                {kr.due_date && <p className="text-xs text-gray-400">Due: {kr.due_date}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Add KR form */}
        {showKRForm && (
          <form onSubmit={handleAddKR} className="mt-3 space-y-2 border-t pt-3">
            <input className="input text-sm" placeholder="Key result description" value={newKR.description}
              onChange={(e) => setNewKR(k => ({ ...k, description: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder="Target (e.g. 100)" value={newKR.target_value}
                onChange={(e) => setNewKR(k => ({ ...k, target_value: e.target.value }))} />
              <input className="input text-sm" placeholder="Unit (%, pages, ₦)" value={newKR.unit}
                onChange={(e) => setNewKR(k => ({ ...k, unit: e.target.value }))} />
            </div>
            <input type="date" className="input text-sm" value={newKR.due_date}
              onChange={(e) => setNewKR(k => ({ ...k, due_date: e.target.value }))} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowKRForm(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button type="submit" className="btn-primary flex-1 text-sm py-2">Add</button>
            </div>
          </form>
        )}
      </div>

      {/* AI Milestones */}
      {milestones.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-tamkeen-ink text-sm mb-3 flex items-center gap-1.5">
            <span>✨</span> AI-Suggested Milestones
          </h3>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-xl bg-green-50">
                <div className="w-5 h-5 bg-tamkeen-dark text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i+1}
                </div>
                <div>
                  <p className="text-sm text-tamkeen-ink">{m.milestone}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Week {m.week} · {m.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="card border border-red-100">
        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 text-sm font-medium">
          <Trash2 size={14} /> Delete this goal
        </button>
      </div>
    </div>
  )
}
