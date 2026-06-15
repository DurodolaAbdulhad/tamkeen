import { useState } from 'react'
import { Bell, LogOut, User, Shield, ChevronRight, Heart } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { signOut, updateProfile } from '../services/supabase'
import { requestNotificationPermission } from '../services/firebase'
import { updateFcmToken } from '../services/supabase'
import { useStore } from '../store/useStore'

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, clearUser, setNotifications, notificationsEnabled } = useStore()
  const [name, setName]       = useState(profile?.name || '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [enabling, setEnabling] = useState(false)

  const handleSaveName = async () => {
    if (!user) return
    setSaving(true)
    await updateProfile(user.id, { name })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNotifications = async () => {
    setEnabling(true)
    const token = await requestNotificationPermission()
    if (token && user) {
      await updateFcmToken(user.id, token)
      setNotifications(true, token)
    }
    setEnabling(false)
  }

  const handleLogout = async () => {
    await signOut()
    clearUser()
    navigate('/auth')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-tamkeen-ink">Settings</h2>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-tamkeen-dark" />
          <h3 className="font-semibold text-tamkeen-ink text-sm">Profile</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Your name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input className="input bg-gray-100 cursor-not-allowed" value={user?.email || ''} disabled />
          </div>
          <button onClick={handleSaveName} disabled={saving} className="btn-primary text-sm py-2 px-4">
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-tamkeen-dark" />
          <h3 className="font-semibold text-tamkeen-ink text-sm">Push Notifications</h3>
        </div>
        {notificationsEnabled ? (
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-lg">✅</span>
            <p className="text-sm font-medium">Notifications enabled</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">Enable push notifications to receive prayer time reminders, fasting alerts, Tahajjud alarms, and daily encouragement.</p>
            <button onClick={handleNotifications} disabled={enabling} className="btn-primary text-sm py-2">
              {enabling ? 'Requesting permission…' : '🔔 Enable Notifications'}
            </button>
          </>
        )}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-400 font-medium">You'll receive alerts for:</p>
          {['All 5 daily prayer times (10 min early)', 'Tahajjud (last ⅓ of night)', 'Duha window', 'Fasting days (Suhoor + Iftar)', 'Evening adhkar reminder', 'Daily AI encouragement'].map(item => (
            <p key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="text-green-500">•</span> {item}
            </p>
          ))}
        </div>
      </div>

      {/* Donate */}
      <Link to="/donate" className="card flex items-center gap-3">
        <Heart size={18} className="text-green-500 fill-green-200" />
        <div className="flex-1">
          <p className="font-medium text-sm text-tamkeen-ink">Support Tamkeen</p>
          <p className="text-xs text-gray-400">Donate from ₦1,000 — JazakAllahu Khayran</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </Link>

      {/* Admin link */}
      {profile?.is_admin && (
        <Link to="/admin" className="card flex items-center gap-3">
          <Shield size={18} className="text-tamkeen-dark" />
          <div className="flex-1">
            <p className="font-medium text-sm text-tamkeen-ink">Admin Panel</p>
            <p className="text-xs text-gray-400">Manage users & invite codes</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      )}

      {/* App info */}
      <div className="card bg-green-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-tamkeen-dark rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 40 36" className="w-4 h-4 fill-white">
              <path d="M20 0L40 36H27.5L20 19L12.5 36H0L20 0Z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-tamkeen-ink text-sm">Tamkeen — تمكين</p>
            <p className="text-[10px] text-gray-400">v1.0 · tamkeen.durodola.africa</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your private Islamic habit tracker and personal empowerment app. Built for family & friends. All data is private — only you see your progress.
        </p>
        <p className="arabic text-sm text-tamkeen-dark mt-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      </div>

      {/* Sign out */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 border border-red-100 rounded-xl">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  )
}
