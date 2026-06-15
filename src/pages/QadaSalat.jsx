import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Plus, Trash2, Heart } from 'lucide-react'

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const PRAYER_ICONS = { Fajr: '🌙', Dhuhr: '☀️', Asr: '🌤️', Maghrib: '🌇', Isha: '🌃' }

const LS_KEY = 'tamkeen_qada_logs'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export default function QadaSalat() {
  const [logs,  setLogs]    = useState(load)
  const [adding, setAdding] = useState(false)
  const [form, setForm]     = useState({ prayer: 'Fajr', count: 1, note: '' })
  const [tab, setTab]       = useState('pending') // 'pending' | 'done'

  useEffect(() => save(logs), [logs])

  const addEntry = () => {
    if (!form.count || form.count < 1) return
    const entry = {
      id:       Date.now(),
      prayer:   form.prayer,
      count:    Number(form.count),
      note:     form.note,
      done:     0,
      added_at: new Date().toISOString(),
    }
    setLogs((l) => [entry, ...l])
    setForm({ prayer: 'Fajr', count: 1, note: '' })
    setAdding(false)
  }

  const markOne = (id) => {
    setLogs((l) => l.map((e) => e.id === id
      ? { ...e, done: Math.min(e.done + 1, e.count) }
      : e
    ))
  }

  const unmarkOne = (id) => {
    setLogs((l) => l.map((e) => e.id === id
      ? { ...e, done: Math.max(e.done - 1, 0) }
      : e
    ))
  }

  const remove = (id) => setLogs((l) => l.filter((e) => e.id !== id))

  const pending = logs.filter((e) => e.done < e.count)
  const done    = logs.filter((e) => e.done >= e.count)
  const display = tab === 'pending' ? pending : done

  const totalPending = pending.reduce((s, e) => s + (e.count - e.done), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Missed Salat — Qadā'</h2>
        <p className="text-sm text-gray-500">Track prayers to make up, gently</p>
      </div>

      {/* Rahma banner */}
      <div className="card bg-green-50 flex items-start gap-3">
        <Heart size={18} className="text-tamkeen-dark mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-tamkeen-dark">No guilt — just return</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            Allah's mercy is greater than our sins. Make up missed prayers with intention and consistency — one at a time, at your own pace. The important thing is to start.
          </p>
          <p className="arabic text-sm text-tamkeen-dark mt-1">إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ</p>
          <p className="text-[10px] text-gray-400">Verily, Allah is Oft-Forgiving, Most Merciful — Quran 2:173</p>
        </div>
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-red-400">{totalPending}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Remaining</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-tamkeen-dark">{logs.reduce((s,e) => s+e.done,0)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Made up</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-green-500">{done.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Completed</p>
          </div>
        </div>
      )}

      {/* Add entry */}
      {adding ? (
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-tamkeen-ink">Add Missed Salat</p>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Prayer</label>
            <div className="grid grid-cols-5 gap-1">
              {PRAYERS.map((p) => (
                <button key={p} onClick={() => setForm((f) => ({ ...f, prayer: p }))}
                  className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    form.prayer === p ? 'bg-tamkeen-dark text-white border-tamkeen-dark' : 'border-gray-200 text-gray-500'
                  }`}>
                  {PRAYER_ICONS[p]}<br />{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">How many to make up?</label>
            <input type="number" min="1" className="input" value={form.count}
              onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
            <input type="text" className="input" value={form.note} placeholder="e.g. From last Ramadan"
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>

          <div className="flex gap-2">
            <button onClick={addEntry} className="flex-1 btn-primary py-2.5 text-sm">Add Entry</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 border-2 border-dashed border-tamkeen-light rounded-2xl text-sm text-tamkeen-light font-medium flex items-center justify-center gap-2 active:scale-95">
          <Plus size={16} /> Add missed salat
        </button>
      )}

      {/* Tabs */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-2xl p-1">
          {[
            { id: 'pending', label: `Pending (${pending.length})` },
            { id: 'done',    label: `Made Up (${done.length})`    },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white text-tamkeen-dark shadow-sm' : 'text-gray-500'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {display.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          {tab === 'pending'
            ? <><p className="text-4xl mb-2">🤲</p><p className="text-sm">No pending salat — alhamdulillah!</p></>
            : <><p className="text-4xl mb-2">📋</p><p className="text-sm">No completed entries yet</p></>
          }
        </div>
      )}

      <div className="space-y-3">
        {display.map((entry) => {
          const remaining = entry.count - entry.done
          const pct = entry.count > 0 ? entry.done / entry.count : 0
          return (
            <div key={entry.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PRAYER_ICONS[entry.prayer]}</span>
                  <div>
                    <p className="font-semibold text-tamkeen-ink text-sm">{entry.prayer}</p>
                    {entry.note && <p className="text-[10px] text-gray-400">{entry.note}</p>}
                  </div>
                </div>
                <button onClick={() => remove(entry.id)} className="text-gray-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-tamkeen-light rounded-full transition-all"
                  style={{ width: `${pct * 100}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {entry.done} / {entry.count} made up
                  {remaining > 0 && ` · ${remaining} left`}
                </p>
                {remaining > 0 ? (
                  <div className="flex gap-2">
                    {entry.done > 0 && (
                      <button onClick={() => unmarkOne(entry.id)}
                        className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-lg">
                        −1
                      </button>
                    )}
                    <button onClick={() => markOne(entry.id)}
                      className="text-xs bg-tamkeen-dark text-white px-3 py-1 rounded-lg font-medium active:scale-95">
                      Made up one ✓
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Complete
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
