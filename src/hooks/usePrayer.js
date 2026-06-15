import { useEffect } from 'react'
import { getTodayPrayerTimes, getTahajjudTime } from '../services/prayerTimes'
import { getTodayHijri } from '../services/hijriCalendar'
import { useStore } from '../store/useStore'
import { todayStr } from '../utils/dateHelpers'

export const usePrayer = () => {
  const { prayerTimes, prayerTimesDate, setPrayerTimes, hijriDate, setHijriDate } = useStore()

  useEffect(() => {
    const today = todayStr()

    // Only fetch if not cached for today
    if (prayerTimesDate !== today) {
      getTodayPrayerTimes()
        .then((times) => {
          const tahajjud = getTahajjudTime(times.Isha, times.Fajr)
          setPrayerTimes({ ...times, Tahajjud: tahajjud }, today)
        })
        .catch(console.error)
    }

    if (!hijriDate) {
      getTodayHijri()
        .then(setHijriDate)
        .catch(console.error)
    }
  }, [])

  return { prayerTimes, hijriDate }
}
