// Hijri calendar utilities using Aladhan API

const BASE = 'https://api.aladhan.com/v1'

export const toHijri = async (gregorianDate) => {
  // gregorianDate: 'DD-MM-YYYY'
  const res  = await fetch(`${BASE}/gToH/${gregorianDate}`)
  const json = await res.json()
  return json.data?.hijri
}

export const toGregorian = async (hijriDate) => {
  // hijriDate: 'DD-MM-YYYY' (hijri)
  const res  = await fetch(`${BASE}/hToG/${hijriDate}`)
  const json = await res.json()
  return json.data?.gregorian
}

export const getTodayHijri = async () => {
  const today = new Date()
  const dd    = String(today.getDate()).padStart(2, '0')
  const mm    = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy  = today.getFullYear()
  return toHijri(`${dd}-${mm}-${yyyy}`)
}

// Returns true if today's Hijri day is one of the "white days" (13, 14, 15)
export const isWhiteDay = (hijriDay) => [13, 14, 15].includes(Number(hijriDay))

// Returns true if Hijri month is Muharram (1)
export const isMuharram = (hijriMonth) => Number(hijriMonth) === 1

// Returns true if Hijri month is Dhul Hijjah (12) and day 1-9
export const isDhulHijjahFastDay = (hijriMonth, hijriDay) =>
  Number(hijriMonth) === 12 && Number(hijriDay) >= 1 && Number(hijriDay) <= 9

// Returns true if Hijri month is Ramadan (9)
export const isRamadan = (hijriMonth) => Number(hijriMonth) === 9

// Returns true if Hijri month is Shawwal (10) — user tracks 6 days manually
export const isShawwal = (hijriMonth) => Number(hijriMonth) === 10

// Fasting type for a given date
export const getFastingType = (gregorianDate, hijriData) => {
  if (!hijriData) return null
  const dow        = new Date(gregorianDate).getDay() // 0=Sun, 1=Mon, 4=Thu
  const hDay       = Number(hijriData.day)
  const hMonth     = Number(hijriData.month?.number)

  if (isRamadan(hMonth))                          return 'ramadan'
  if (isDhulHijjahFastDay(hMonth, hDay))          return 'dhul-hijjah'
  if (isMuharram(hMonth))                         return 'muharram'
  if (isWhiteDay(hDay))                           return 'white-days'
  if (isShawwal(hMonth))                          return 'shawwal'
  if (dow === 1)                                  return 'monday'
  if (dow === 4)                                  return 'thursday'
  return null
}

export const FAST_TYPE_LABELS = {
  'ramadan':     { label: 'Ramadan',       color: 'bg-purple-100 text-purple-800', icon: '🌙' },
  'dhul-hijjah': { label: 'Dhul Hijjah',  color: 'bg-amber-100 text-amber-800',   icon: '🕋' },
  'muharram':    { label: 'Muharram',      color: 'bg-blue-100 text-blue-800',     icon: '🌊' },
  'white-days':  { label: 'White Days',    color: 'bg-gray-100 text-gray-700',     icon: '🌕' },
  'shawwal':     { label: 'Shawwal 6',     color: 'bg-green-100 text-green-800',   icon: '⭐' },
  'monday':      { label: 'Monday Fast',   color: 'bg-teal-100 text-teal-800',     icon: '🗓' },
  'thursday':    { label: 'Thursday Fast', color: 'bg-teal-100 text-teal-800',     icon: '🗓' },
}

export const HIJRI_MONTHS = [
  'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
  'Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban',
  'Ramadan','Shawwal','Dhul Qadah','Dhul Hijjah'
]
