import { useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const PAGE_TITLES = {
  '/':          'Tamkeen',
  '/wajibaat':  'Wajibaat',
  '/goals':     'Goals',
  '/adhkar':    'Adhkar',
  '/reports':   'Reports',
  '/settings':  'Settings',
  '/admin':     'Admin',
}

export default function Header() {
  const location = useLocation()
  const { hijriDate, currentStreak } = useStore()
  const title = PAGE_TITLES[location.pathname] || 'Tamkeen'
  const isHome = location.pathname === '/'

  return (
    <header className="bg-tamkeen-dark text-white px-4 pt-3 pb-3 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isHome && <span className="text-tamkeen-mint font-arabic text-lg">تمكين</span>}
            <h1 className={`font-bold ${isHome ? 'text-lg' : 'text-base'}`}>{title}</h1>
          </div>
          {hijriDate && (
            <p className="text-[11px] text-green-200 mt-0.5">
              {hijriDate.day} {hijriDate.month?.en} {hijriDate.year} AH
            </p>
          )}
        </div>

        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 bg-green-800/40 rounded-full px-3 py-1">
            <span className="streak-fire text-base">🔥</span>
            <span className="text-sm font-bold text-white">{currentStreak}</span>
            <span className="text-[10px] text-green-200">day streak</span>
          </div>
        )}
      </div>
    </header>
  )
}
