import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Target, Grid3X3, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         icon: Home,     label: 'Home'    },
  { to: '/wajibaat', icon: BookOpen, label: 'Wajibaat'},
  { to: '/goals',    icon: Target,   label: 'Goals'   },
  { to: '/tools',    icon: Grid3X3,  label: 'Tools'   },
  { to: '/settings', icon: Settings, label: 'Settings'},
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg bottom-nav z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 pt-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-150
               ${isActive ? 'text-tamkeen-dark' : 'text-gray-400'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-tamkeen-mint' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-tamkeen-dark' : 'text-gray-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
