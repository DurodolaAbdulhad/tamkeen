import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppShell from './components/layout/AppShell'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Wajibaat from './pages/Wajibaat'
import Goals from './pages/Goals'
import GoalDetail from './pages/GoalDetail'
import Adhkar from './pages/Adhkar'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Donate from './pages/Donate'
import Tools from './pages/Tools'
import Tasbih from './pages/Tasbih'
import Qibla from './pages/Qibla'
import DuaLibrary from './pages/DuaLibrary'
import RamadanMode from './pages/RamadanMode'
import ZakatCalculator from './pages/ZakatCalculator'
import QuranReader from './pages/QuranReader'
import FamilyDashboard from './pages/FamilyDashboard'
import QadaSalat from './pages/QadaSalat'
import YearlyAnalytics from './pages/YearlyAnalytics'
import SleepTracker from './pages/SleepTracker'
import Ruqyah from './pages/Ruqyah'
import Qunoot from './pages/Qunoot'
import ResetPassword from './pages/ResetPassword'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null // loading
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={
        <PrivateRoute>
          <AppShell />
        </PrivateRoute>
      }>
        <Route index          element={<Dashboard />} />
        <Route path="wajibaat"  element={<Wajibaat />} />
        <Route path="goals"     element={<Goals />} />
        <Route path="goals/:id" element={<GoalDetail />} />
        <Route path="adhkar"    element={<Adhkar />} />
        <Route path="reports"   element={<Reports />} />
        <Route path="settings"  element={<Settings />} />
        <Route path="admin"     element={<Admin />} />
        <Route path="donate"    element={<Donate />} />
        <Route path="tools"     element={<Tools />} />
        <Route path="tasbih"    element={<Tasbih />} />
        <Route path="qibla"     element={<Qibla />} />
        <Route path="duas"      element={<DuaLibrary />} />
        <Route path="ramadan"   element={<RamadanMode />} />
        <Route path="zakat"     element={<ZakatCalculator />} />
        <Route path="quran"     element={<QuranReader />} />
        <Route path="family"    element={<FamilyDashboard />} />
        <Route path="qada"      element={<QadaSalat />} />
        <Route path="analytics" element={<YearlyAnalytics />} />
        <Route path="sleep"     element={<SleepTracker />} />
        <Route path="ruqyah"    element={<Ruqyah />} />
        <Route path="qunoot"    element={<Qunoot />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
