// Aladhan API — Lagos, Umm al-Qura method (method=5)
// https://aladhan.com/prayer-times-api

const BASE = 'https://api.aladhan.com/v1'
const CITY    = 'Lagos'
const COUNTRY = 'Nigeria'
const METHOD  = 5  // Umm al-Qura

export const getPrayerTimesForDate = async (date) => {
  // date: 'DD-MM-YYYY'
  const url = `${BASE}/timingsByCity/${date}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.code !== 200) throw new Error('Prayer times fetch failed')
  return json.data.timings
  // Returns: { Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, Imsak, Midnight, Firstthird, Lastthird }
}

export const getTodayPrayerTimes = async () => {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  return getPrayerTimesForDate(`${dd}-${mm}-${yyyy}`)
}

export const getPrayerTimesForMonth = async (month, year) => {
  const url = `${BASE}/calendarByCity/${year}/${month}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.code !== 200) throw new Error('Monthly prayer times fetch failed')
  return json.data // array of daily objects
}

// Calculate last third of night (Tahajjud window)
// Between Isha and Fajr next day, last third starts at: Isha + (duration * 2/3)
export const getTahajjudTime = (ishaTime, fajrTime) => {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toHHMM = (mins) => {
    const h = Math.floor(mins / 60) % 24
    const m = mins % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }

  let ishaMin  = toMinutes(ishaTime)
  let fajrMin  = toMinutes(fajrTime)
  if (fajrMin < ishaMin) fajrMin += 24 * 60  // cross-midnight

  const duration   = fajrMin - ishaMin
  const lastThirdStart = ishaMin + Math.floor((duration * 2) / 3)
  return toHHMM(lastThirdStart)
}

// Format '05:30' to '5:30 AM'
export const formatPrayerTime = (time24) => {
  if (!time24) return '--:--'
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

export const PRAYER_NAMES = [
  { key: 'Fajr',    label: 'Fajr',    arabic: 'الفجر',   icon: '🌙' },
  { key: 'Dhuhr',   label: 'Dhuhr',   arabic: 'الظهر',   icon: '☀️' },
  { key: 'Asr',     label: 'Asr',     arabic: 'العصر',   icon: '🌤' },
  { key: 'Maghrib', label: 'Maghrib', arabic: 'المغرب',  icon: '🌅' },
  { key: 'Isha',    label: 'Isha',    arabic: 'العشاء',  icon: '🌃' },
]

export const SALAT_STATUS = {
  mosque: { label: 'At Mosque', color: 'bg-green-100 text-green-800', value: 'mosque' },
  home:   { label: 'At Home',   color: 'bg-blue-100 text-blue-800',   value: 'home'   },
  late:   { label: 'Late',      color: 'bg-yellow-100 text-yellow-800',value: 'late'   },
  missed: { label: 'Missed',    color: 'bg-red-100 text-red-700',     value: 'missed' },
  pending:{ label: 'Pending',   color: 'bg-gray-100 text-gray-500',   value: 'pending'},
}
