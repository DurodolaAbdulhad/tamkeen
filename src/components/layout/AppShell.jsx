import { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Bell, X, Heart } from 'lucide-react'
import BottomNav from './BottomNav'
import Header from './Header'
import { useStore } from '../../store/useStore'
import { requestNotificationPermission } from '../../services/firebase'
import { updateFcmToken } from '../../services/supabase'

function todayKey() {
  return 'tamkeen_donate_prompt_' + new Date().toISOString().slice(0, 10)
}
function inDonateWindow() {
  const h = new Date().getHours()
  return (h >= 6 && h < 9) || (h >= 18 && h < 21)
}

export default function AppShell() {
  const { user, notificationsEnabled, setNotifications } = useStore()
  const [showPrompt,       setShowPrompt]       = useState(false)
  const [enabling,         setEnabling]         = useState(false)
  const [showDonatePrompt, setShowDonatePrompt] = useState(false)

  useEffect(() => {
    // Show notification prompt after 3 seconds on first login if not yet enabled
    if (!notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [notificationsEnabled])

  useEffect(() => {
    // Morning (6-9am) or Evening (6-9pm) donate prompt — once per day
    if (inDonateWindow() && !localStorage.getItem(todayKey())) {
      const timer = setTimeout(() => setShowDonatePrompt(true), 8000)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissDonate = () => {
    localStorage.setItem(todayKey(), '1')
    setShowDonatePrompt(false)
  }

  const handleEnable = async () => {
    setEnabling(true)
    const token = await requestNotificationPermission()
    if (token && user) {
      await updateFcmToken(user.id, token)
      setNotifications(true, token)
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotifications(true, null)
    }
    setEnabling(false)
    setShowPrompt(false)
  }

  return (
    <div className="h-full flex flex-col bg-tamkeen-cream">
      <Header />
      <main className="flex-1 overflow-y-auto pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-lg mx-auto px-4 py-4 page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />

      {/* Donate prompt — morning & evening */}
      {showDonatePrompt && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50 animate-fadeIn">
          <div className="bg-white border border-tamkeen-light/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-green-600 fill-green-200" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-tamkeen-ink mb-0.5">Support Tamkeen 💚</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                This app is free. If it helps you, consider a small sadaqah — from ₦1,000.
              </p>
              <p className="arabic text-xs text-tamkeen-dark mt-1">مَنْ تَصَدَّقَ بِصَدَقَةٍ مِنْ كَسْبٍ طَيِّبٍ</p>
              <div className="flex gap-2 mt-3">
                <Link to="/donate" onClick={dismissDonate}
                  className="flex-1 bg-tamkeen-dark text-white text-xs font-bold py-2 rounded-xl text-center active:scale-95 transition-transform">
                  Donate Now
                </Link>
                <button onClick={dismissDonate}
                  className="px-3 text-xs text-gray-400 py-2 rounded-xl border border-gray-200">
                  Later
                </button>
              </div>
            </div>
            <button onClick={dismissDonate} className="text-gray-300 mt-0.5">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Notification prompt banner */}
      {showPrompt && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50 animate-fadeIn">
          <div className="bg-tamkeen-dark text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-tamkeen-mint rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-tamkeen-dark" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-0.5">Enable Prayer Reminders</p>
              <p className="text-xs text-green-200 leading-relaxed">
                Get notified for all 5 prayers, Tahajjud, Quran & Hadith of the day — automatically.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleEnable}
                  disabled={enabling}
                  className="flex-1 bg-tamkeen-mint text-tamkeen-dark text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform"
                >
                  {enabling ? 'Enabling…' : '🔔 Enable Now'}
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="px-3 text-xs text-green-300 py-2 rounded-xl border border-white/10"
                >
                  Later
                </button>
              </div>
            </div>
            <button onClick={() => setShowPrompt(false)} className="text-green-400 mt-0.5">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
