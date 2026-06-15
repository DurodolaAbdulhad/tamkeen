import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Copy, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { createInviteCode, getAllInviteCodes } from '../services/supabase'

export default function Admin() {
  const { user, profile } = useStore()
  const navigate           = useNavigate()
  const [codes, setCodes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!profile?.is_admin) { navigate('/'); return }
    getAllInviteCodes().then(({ data }) => {
      if (data) setCodes(data)
      setLoading(false)
    })
  }, [profile])

  const handleGenerate = async () => {
    setGenerating(true)
    const { data } = await createInviteCode(user.id)
    if (data) setCodes(c => [data, ...c])
    setGenerating(false)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(`Join Tamkeen with invite code: ${code}\ntamkeen.durodola.africa`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const usedCodes   = codes.filter(c => c.is_used)
  const unusedCodes = codes.filter(c => !c.is_used)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">Admin Panel</h2>
          <p className="text-sm text-gray-400">{codes.length} total invite codes · {usedCodes.length} used</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus size={15} /> {generating ? 'Generating…' : 'New Code'}
        </button>
      </div>

      {/* Active (unused) codes */}
      <div className="card">
        <h3 className="font-semibold text-sm text-tamkeen-ink mb-3">Available Codes ({unusedCodes.length})</h3>
        {unusedCodes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No unused codes — generate one above</p>
        ) : (
          <div className="space-y-2">
            {unusedCodes.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                <div>
                  <p className="font-mono font-bold text-lg text-tamkeen-dark tracking-widest">{c.code}</p>
                  <p className="text-[10px] text-gray-400">Created {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => copyCode(c.code)}
                  className="flex items-center gap-1.5 bg-tamkeen-dark text-white text-xs font-medium px-3 py-2 rounded-lg">
                  {copied === c.code ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Used codes / members */}
      {usedCodes.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm text-tamkeen-ink mb-3">Members ({usedCodes.length})</h3>
          <div className="space-y-2">
            {usedCodes.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-tamkeen-ink">
                    {c.users?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400">{c.users?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">{c.code}</p>
                  <p className="text-[10px] text-gray-400">{c.used_at ? new Date(c.used_at).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card bg-amber-50 border border-amber-100">
        <p className="text-xs text-amber-700 font-medium">Share invite codes privately via WhatsApp or direct message. The app URL is: <span className="font-mono">tamkeen.durodola.africa</span></p>
      </div>
    </div>
  )
}
