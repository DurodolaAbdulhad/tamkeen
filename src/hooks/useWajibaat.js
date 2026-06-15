import { useState, useEffect, useCallback } from 'react'
import { getTodayLog, upsertWajibaatLog, getWajibaatRange } from '../services/supabase'
import { useStore } from '../store/useStore'
import { todayStr } from '../utils/dateHelpers'
import { calculateStreak } from '../utils/streaks'
import { format, subDays } from 'date-fns'

export const useWajibaat = () => {
  const { user, todayLog, setTodayLog, setStreak } = useStore()
  const [loading, setLoading] = useState(false)

  const loadTodayLog = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getTodayLog(user.id, todayStr())
    setTodayLog(data || { date: todayStr() })
    setLoading(false)
  }, [user])

  const update = useCallback(async (field, value) => {
    if (!user) return
    const date = todayStr()
    const updates = { [field]: value }
    const { data } = await upsertWajibaatLog(user.id, date, updates)
    if (data) setTodayLog(data)
  }, [user])

  const updateSalat = useCallback(async (prayer, status) => {
    const field = `salat_${prayer.toLowerCase()}`
    await update(field, status)
  }, [update])

  const loadStreak = useCallback(async () => {
    if (!user) return
    const end   = todayStr()
    const start = format(subDays(new Date(), 90), 'yyyy-MM-dd')
    const { data } = await getWajibaatRange(user.id, start, end)
    if (data) {
      const { current, longest } = calculateStreak(data)
      setStreak(current, longest)
    }
  }, [user])

  useEffect(() => {
    loadTodayLog()
    loadStreak()
  }, [loadTodayLog, loadStreak])

  return { todayLog, loading, update, updateSalat, refresh: loadTodayLog }
}
