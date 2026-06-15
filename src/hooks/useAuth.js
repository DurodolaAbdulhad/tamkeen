import { useEffect } from 'react'
import { supabase, getProfile } from '../services/supabase'
import { useStore } from '../store/useStore'

export const useAuth = () => {
  const { user, profile, setUser, setProfile, clearUser } = useStore()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        clearUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await getProfile(userId)
    if (data) setProfile(data)
  }

  return { user, profile, isAdmin: profile?.is_admin === true }
}
