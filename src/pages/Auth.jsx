import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, validateInviteCode, markInviteUsed } from '../services/supabase'

const STEPS = { INVITE: 'invite', REGISTER: 'register', LOGIN: 'login', FORGOT: 'forgot' }

export default function Auth() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(STEPS.LOGIN)
  const [code, setCode]       = useState('')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [validCode, setValidCode] = useState(null)

  const handleInvite = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await validateInviteCode(code.trim())
    if (error || !data) {
      setError('Invalid or already used invite code.')
    } else {
      setValidCode(data)
      setStep(STEPS.REGISTER)
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    })

    if (error) { setError(error.message); setLoading(false); return }

    const userId = data.user?.id
    if (userId) {
      // Create profile row
      await supabase.from('users').insert({
        id: userId, name: name.trim(), email: email.trim(),
        invite_code: validCode?.code, is_admin: false,
      })
      await markInviteUsed(validCode?.code, userId)
    }
    navigate('/')
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message || 'Failed to send email. Please try again.'); return }
    setSuccess('Check your email — a password reset link has been sent.')
  }

  return (
    <div className="min-h-dvh bg-tamkeen-dark flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-tamkeen-mint rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 40 36" className="w-8 h-8 fill-tamkeen-dark">
            <path d="M20 0L40 36H27.5L20 19L12.5 36H0L20 0Z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Tamkeen</h1>
        <p className="text-tamkeen-mint font-arabic text-xl mt-1">تمكين</p>
        <p className="text-green-300 text-sm mt-1">Your daily empowerment companion</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">

        {step === STEPS.INVITE && (
          <>
            <h2 className="text-lg font-bold text-tamkeen-ink mb-1">Enter Invite Code</h2>
            <p className="text-sm text-gray-500 mb-4">This is a private app for family & friends. You need an invite code to join.</p>
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                className="input uppercase tracking-widest font-mono text-center text-lg"
                placeholder="XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Checking…' : 'Continue →'}
              </button>
            </form>
            <button onClick={() => setStep(STEPS.LOGIN)} className="w-full text-center text-sm text-tamkeen-light mt-4">
              Already have an account? Sign in
            </button>
          </>
        )}

        {step === STEPS.REGISTER && (
          <>
            <h2 className="text-lg font-bold text-tamkeen-ink mb-1">Create Account</h2>
            <p className="text-sm text-gray-500 mb-4">Code accepted ✓ — set up your account below.</p>
            <form onSubmit={handleRegister} className="space-y-3">
              <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className="input" placeholder="Password (min 8 chars)" type="password" minLength={8} value={password} onChange={(e) => setPass(e.target.value)} required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {step === STEPS.LOGIN && (
          <>
            <h2 className="text-lg font-bold text-tamkeen-ink mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-4">Sign in to your account.</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPass(e.target.value)} required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <button onClick={() => { setError(''); setSuccess(''); setStep(STEPS.FORGOT) }} className="w-full text-center text-sm text-tamkeen-light mt-3">
              Forgot password?
            </button>
            <button onClick={() => { setError(''); setStep(STEPS.INVITE) }} className="w-full text-center text-sm text-tamkeen-light mt-2">
              Need to register? Enter invite code
            </button>
          </>
        )}

        {step === STEPS.FORGOT && (
          <>
            <h2 className="text-lg font-bold text-tamkeen-ink mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <button onClick={() => { setError(''); setSuccess(''); setStep(STEPS.LOGIN) }} className="w-full text-center text-sm text-tamkeen-light mt-4">
              ← Back to Sign In
            </button>
          </>
        )}
      </div>

      <p className="text-green-400 text-xs mt-6 text-center">
        بسم الله الرحمن الرحيم
      </p>
    </div>
  )
}
