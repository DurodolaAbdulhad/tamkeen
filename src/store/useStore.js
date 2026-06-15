import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearUser: () => set({ user: null, profile: null }),

      // Today's wajibaat log
      todayLog: null,
      setTodayLog: (log) => set({ todayLog: log }),
      updateTodayLog: (updates) => set((s) => ({ todayLog: { ...s.todayLog, ...updates } })),

      // Prayer times (cached for today)
      prayerTimes: null,
      prayerTimesDate: null,
      setPrayerTimes: (times, date) => set({ prayerTimes: times, prayerTimesDate: date }),

      // Hijri date (cached for today)
      hijriDate: null,
      setHijriDate: (hd) => set({ hijriDate: hd }),

      // Goals
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((s) => ({ goals: [goal, ...s.goals] })),
      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      // Streak
      currentStreak: 0,
      longestStreak: 0,
      setStreak: (current, longest) => set({ currentStreak: current, longestStreak: longest }),

      // Daily AI content
      dailyHadith: null,
      dailyAyah: null,
      aiMessage: null,
      dailyContentDate: null,
      setDailyContent: (hadith, ayah, aiMsg, date) =>
        set({ dailyHadith: hadith, dailyAyah: ayah, aiMessage: aiMsg, dailyContentDate: date }),

      // UI state
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Notification permission
      notificationsEnabled: false,
      fcmToken: null,
      setNotifications: (enabled, token) => set({ notificationsEnabled: enabled, fcmToken: token }),
    }),
    {
      name: 'tamkeen-store',
      partialize: (s) => ({
        user:                s.user,
        profile:             s.profile,
        currentStreak:       s.currentStreak,
        longestStreak:       s.longestStreak,
        notificationsEnabled:s.notificationsEnabled,
        fcmToken:            s.fcmToken,
        prayerTimes:         s.prayerTimes,
        prayerTimesDate:     s.prayerTimesDate,
        hijriDate:           s.hijriDate,
      }),
    }
  )
)
