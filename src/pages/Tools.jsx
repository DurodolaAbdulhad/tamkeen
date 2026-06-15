import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const TOOL_SECTIONS = [
  {
    title: 'Daily Worship',
    items: [
      { to: '/tasbih',  icon: '📿', label: 'Digital Tasbih',   desc: 'Tap counter with haptic feedback & presets' },
      { to: '/adhkar',  icon: '🤲', label: 'Adhkar',           desc: 'Morning & evening dhikr with audio' },
      { to: '/duas',    icon: '📖', label: 'Dua Library',      desc: '68 authentic duas across 14 topics' },
      { to: '/qibla',   icon: '🕋', label: 'Qibla Direction',  desc: 'Compass pointing to Makkah from Lagos' },
      { to: '/quran',   icon: '📕', label: 'Quran Reader',     desc: '114 surahs with English translation & bookmarks' },
      { to: '/qada',    icon: '🔄', label: 'Missed Salat',     desc: 'Track qadā\' prayers to make up' },
      { to: '/ruqyah',  icon: '🤲', label: 'Ruqyah',           desc: 'Islamic healing — Al-Fatiha, Ayat al-Kursi, Al-Falaq, An-Nas' },
      { to: '/qunoot',  icon: '🙌', label: "Du'a Qunoot",      desc: 'Witr supplication & Du\'a al-Nazilah' },
    ],
  },
  {
    title: 'Islamic Finance & Calendar',
    items: [
      { to: '/zakat',   icon: '💰', label: 'Zakat Calculator', desc: '2.5% of net wealth above nisab' },
      { to: '/ramadan', icon: '🌙', label: 'Ramadan Mode',     desc: 'Suhoor/Iftar countdown · 30-day challenge' },
    ],
  },
  {
    title: 'Personal Analytics',
    items: [
      { to: '/analytics', icon: '📊', label: 'Yearly Analytics',      desc: 'Heatmap calendar · best month · longest streak' },
      { to: '/sleep',     icon: '🌙', label: 'Islamic Sleep Tracker', desc: 'Sunnah sleep patterns · Tahajjud window' },
      { to: '/family',    icon: '👨‍👩‍👧', label: 'Family Dashboard',     desc: 'Share streaks with family · encourage each other' },
    ],
  },
  {
    title: 'Support Tamkeen',
    items: [
      { to: '/donate', icon: '💚', label: 'Donate', desc: 'Keep this app free — from ₦1,000' },
    ],
  },
]

export default function Tools() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Tools & Features</h2>
        <p className="text-sm text-gray-500">All features in one place</p>
      </div>

      {TOOL_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{section.title}</p>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 active:scale-95 transition-all hover:border-tamkeen-light">
                <div className="w-10 h-10 bg-tamkeen-mint rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-tamkeen-ink">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="card bg-green-50 text-center py-6">
        <p className="arabic text-2xl text-tamkeen-dark mb-2">وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ</p>
        <p className="text-xs text-gray-500">"My success is not but through Allah" — Quran 11:88</p>
      </div>
    </div>
  )
}
