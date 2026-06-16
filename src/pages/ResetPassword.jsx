import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the reset link is opened
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-tamkeen-dark flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-tamkeen-mint rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 40 36" className="w-8 h-8 fill-tamkeen-dark">
            <path d="M20 0L40 36H27.5L20 19L12.5 36H0L20 0Z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Tamkeen</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        {!ready ? (
          <p className="text-center text-gray-500 text-sm">Verifying reset link…</p>
        ) : (
          <>
            <h2 className="text-lg font-bold text-tamkeen-ink mb-1">Set New Password</h2>
            <p className="text-sm text-gray-500 mb-4">Choose a strong password for your account.</p>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                className="input"
                placeholder="New password (min 8 chars)"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-green-400 text-xs mt-6 text-center">بسم الله الرحمن الرحيم</p>
    </div>
  )
}
