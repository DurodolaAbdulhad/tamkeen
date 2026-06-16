import { useState, useEffect } from 'react'
import { Users, Eye, EyeOff, Heart, UserPlus, Copy, Check } from 'lucide-react'
import { supabase, updateProfile } from '../services/supabase'
import { useStore } from '../store/useStore'

export default function FamilyDashboard() {
  const { user, profile, setProfile } = useStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(profile?.share_streak || false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('users')
        .select('id, name, current_streak, longest_streak, share_streak, created_at')
        .eq('share_streak', true)
        .order('current_streak', { ascending: false })
        .limit(10)
      setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleSharing = async () => {
    if (!user) return
    setSaving(true)
    const newVal = !sharing
    await supabase.from('users').update({ share_streak: newVal }).eq('id', user.id)
    setSharing(newVal)
    setProfile({ ...profile, share_streak: newVal })
    // Reload members
    const { data } = await supabase.from('users').select('id, name, current_streak, longest_streak, share_streak, created_at').eq('share_streak', true).order('current_streak', { ascending: false }).limit(10)
    setMembers(data || [])
    setSaving(false)
  }

  const myEntry = members.find((m) => m.id === user?.id)
  const myRank  = myEntry ? members.indexOf(myEntry) + 1 : null

  const streakEmoji = (s) => {
    if (s >= 30) return '🏆'
    if (s >= 14) return '🔥'
    if (s >= 7)  return '⭐'
    if (s >= 1)  return '🌱'
    return '💤'
  }

  const [copied, setCopied] = useState(false)
  const APP_URL = 'https://tamkeen.durodola.africa'
  const waText  = encodeURIComponent(`Join me on Tamkeen — a free Islamic habit tracker 🤲\n\n1. Open the app: ${APP_URL}\n2. Tap "Create account" and sign up\n3. Come back to Family Dashboard and enable "Share my streak"\n\nWe'll encourage each other in sha Allah! 🌱`)

  const copyLink = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-tamkeen-dark" />
        <div>
          <h2 className="text-xl font-bold text-tamkeen-ink">Family Dashboard</h2>
          <p className="text-sm text-gray-500">Encourage each other — streaks only, no worship data · max 10 members</p>
        </div>
      </div>

      {/* Invite — simplified */}
      <div className="card border border-tamkeen-light/30 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={16} className="text-tamkeen-dark" />
          <p className="text-sm font-semibold text-tamkeen-ink">Add a family member — 2 steps</p>
        </div>

        <div className="flex gap-3">
          <div className="w-7 h-7 bg-tamkeen-dark text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-tamkeen-ink">Send them this link</p>
            <div className="flex items-center gap-2 mt-1.5">
              <code className="flex-1 text-[11px] bg-gray-100 text-tamkeen-dark rounded-lg px-2 py-1.5 font-mono truncate">{APP_URL}</code>
              <button onClick={copyLink}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-tamkeen-mint text-tamkeen-dark'}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-7 h-7 bg-tamkeen-dark text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-tamkeen-ink">Ask them to sign up, then enable streak sharing</p>
            <p className="text-[11px] text-gray-500 mt-0.5">They create an account → come here → tap "Share my streak" ON. Done!</p>
          </div>
        </div>

        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all">
          <span>💬</span> Share via WhatsApp
        </a>
      </div>

      {/* Privacy notice */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-1">🔒 Privacy first</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Only your streak count is shared — never your prayer details, goals, or any worship data.
          You control exactly what is visible. Worship is between you and Allah.
        </p>
      </div>

      {/* Share toggle */}
      <div className="card flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sharing ? 'bg-tamkeen-mint' : 'bg-gray-100'}`}>
          {sharing ? <Eye size={18} className="text-tamkeen-dark" /> : <EyeOff size={18} className="text-gray-400" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-tamkeen-ink">Share my streak</p>
          <p className="text-xs text-gray-400">{sharing ? 'Your streak is visible to family members' : 'Only you can see your streak'}</p>
        </div>
        <button
          onClick={toggleSharing}
          disabled={saving}
          className={`relative w-12 h-6 rounded-full transition-all ${sharing ? 'bg-tamkeen-dark' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${sharing ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* My rank */}
      {myRank && (
        <div className="card bg-tamkeen-dark text-white flex items-center gap-4">
          <div className="text-3xl font-bold text-tamkeen-mint">#{myRank}</div>
          <div>
            <p className="font-semibold">Your rank in the family</p>
            <p className="text-sm text-green-200">{myEntry?.current_streak || 0} day streak {streakEmoji(myEntry?.current_streak || 0)}</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Family Streaks</p>
        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin w-5 h-5 border-2 border-tamkeen-dark border-t-transparent rounded-full mx-auto" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Heart size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No one is sharing streaks yet.</p>
            <p className="text-xs mt-1">Be the first — enable "Share my streak" above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m, i) => {
              const isMe = m.id === user?.id
              return (
                <div key={m.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all ${isMe ? 'bg-tamkeen-mint' : 'bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isMe ? 'text-tamkeen-dark' : 'text-tamkeen-ink'}`}>
                      {m.name || 'Family member'} {isMe ? '(you)' : ''}
                    </p>
                    <p className="text-xs text-gray-400">Longest: {m.longest_streak || 0} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg">{streakEmoji(m.current_streak || 0)}</p>
                    <p className="text-xs font-bold text-tamkeen-ink">{m.current_streak || 0}d</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Encourage note */}
      <div className="card bg-green-50 text-center">
        <p className="arabic text-xl text-tamkeen-dark mb-2">تَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ</p>
        <p className="text-xs text-gray-500">"Cooperate in righteousness and piety" — Quran 5:2</p>
        <p className="text-xs text-gray-400 mt-1">Use this to encourage each other — not to compete</p>
      </div>

    </div>
  )
}
