import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = (email, password, metadata) =>
  supabase.auth.signUp({ email, password, options: { data: metadata } })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// Invite codes
export const validateInviteCode = async (code) => {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_used', false)
    .single()
  return { data, error }
}

export const markInviteUsed = async (code, userId) => {
  return supabase
    .from('invite_codes')
    .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
    .eq('code', code.toUpperCase())
}

// Wajibaat
export const getTodayLog = async (userId, date) => {
  const { data, error } = await supabase
    .from('wajibaat_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  return { data, error }
}

export const upsertWajibaatLog = async (userId, date, updates) => {
  const { data, error } = await supabase
    .from('wajibaat_logs')
    .upsert({ user_id: userId, date, ...updates }, { onConflict: 'user_id,date' })
    .select()
    .single()
  return { data, error }
}

export const getWajibaatRange = async (userId, startDate, endDate) => {
  return supabase
    .from('wajibaat_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
}

// Goals
export const getGoals = async (userId) => {
  return supabase
    .from('goals')
    .select('*, key_results(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export const createGoal = async (goal) => {
  return supabase.from('goals').insert(goal).select().single()
}

export const updateGoal = async (goalId, updates) => {
  return supabase.from('goals').update(updates).eq('id', goalId).select().single()
}

export const deleteGoal = async (goalId) => {
  return supabase.from('goals').delete().eq('id', goalId)
}

export const upsertKeyResult = async (kr) => {
  return supabase.from('key_results').upsert(kr).select().single()
}

export const updateKeyResult = async (krId, updates) => {
  return supabase.from('key_results').update(updates).eq('id', krId).select().single()
}

// Weekly reports
export const saveWeeklyReport = async (report) => {
  return supabase.from('weekly_reports').upsert(report, { onConflict: 'user_id,week_start' }).select().single()
}

export const getWeeklyReports = async (userId, limit = 12) => {
  return supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(limit)
}

// User profile
export const updateFcmToken = async (userId, token) => {
  return supabase.from('users').update({ fcm_token: token }).eq('id', userId)
}

export const getProfile = async (userId) => {
  return supabase.from('users').select('*').eq('id', userId).single()
}

export const updateProfile = async (userId, updates) => {
  return supabase.from('users').update(updates).eq('id', userId).select().single()
}

// Admin: invite codes
export const createInviteCode = async (createdBy) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return supabase.from('invite_codes').insert({ code, created_by: createdBy, is_used: false }).select().single()
}

export const getAllInviteCodes = async () => {
  return supabase
    .from('invite_codes')
    .select('*, users!used_by(name, email)')
    .order('created_at', { ascending: false })
}
