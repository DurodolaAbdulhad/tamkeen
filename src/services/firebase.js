import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Safari iOS mobile browser has no Notification API — guard everywhere
const notifSupported = () => typeof window !== 'undefined' && 'Notification' in window
const notifPermission = () => notifSupported() ? Notification.permission : 'denied'

let app, messaging

try {
  app = initializeApp(firebaseConfig)
  messaging = getMessaging(app)
} catch (e) {
  console.warn('Firebase not configured — push notifications disabled')
}

export const requestNotificationPermission = async () => {
  if (!messaging) return null
  try {
    if (!notifSupported()) return null
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
    return token
  } catch (err) {
    console.error('FCM token error:', err)
    return null
  }
}

export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {}
  return onMessage(messaging, callback)
}

// ─── LOCAL NOTIFICATION (shown via Service Worker — appears on lock screen) ──
const swNotify = async (title, body, icon = '/icons/icon-192.png', tag) => {
  if (!('serviceWorker' in navigator) || notifPermission() !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    reg.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: tag || title,
      renotify: true,
      actions: [{ action: 'open', title: 'Open Tamkeen' }],
    })
  } catch (err) {
    // Fallback to basic Notification API
    if (notifSupported()) new Notification(title, { body, icon })
  }
}

// ─── PRAYER TIME NOTIFICATIONS ────────────────────────────────────────────────
const PRAYER_LABELS = {
  Fajr:    { icon: '🌅', pre: 'Fajr is in 10 minutes — time to rise for prayer.', body: 'Fajr time — الله أكبر' },
  Dhuhr:   { icon: '☀️', pre: 'Dhuhr is in 10 minutes — pause and prepare.', body: 'Dhuhr time — الله أكبر' },
  Asr:     { icon: '🌤️', pre: 'Asr is in 10 minutes — guard your prayer.', body: 'Asr time — الله أكبر' },
  Maghrib: { icon: '🌇', pre: 'Maghrib is in 10 minutes — the day is ending.', body: 'Maghrib time — الله أكبر' },
  Isha:    { icon: '🌙', pre: 'Isha is in 10 minutes — close the day with prayer.', body: 'Isha time — الله أكبر' },
}

const timeouts = {}

export const schedulePrayerNotifications = (prayerTimes, todayAyah, todayHadith) => {
  if (notifPermission() !== 'granted') return

  // Clear any previously scheduled prayer notifications
  Object.values(timeouts).forEach(clearTimeout)

  const now = new Date()
  const today = now.toDateString()

  Object.entries(PRAYER_LABELS).forEach(([name, info]) => {
    const timeStr = prayerTimes[name.toLowerCase()] || prayerTimes[name]
    if (!timeStr) return

    const [h, m] = timeStr.split(':').map(Number)
    const prayerDate = new Date(now)
    prayerDate.setHours(h, m, 0, 0)

    // 10-minute early warning
    const warnDate = new Date(prayerDate.getTime() - 10 * 60 * 1000)
    const warnMs  = warnDate.getTime() - now.getTime()
    if (warnMs > 0) {
      timeouts[`${name}_warn`] = setTimeout(() => {
        swNotify(`${info.icon} ${name} in 10 min`, info.pre, undefined, `prayer_warn_${name}`)
      }, warnMs)
    }

    // Exact prayer time notification
    const exactMs = prayerDate.getTime() - now.getTime()
    if (exactMs > 0) {
      timeouts[`${name}_exact`] = setTimeout(() => {
        swNotify(`${info.icon} ${name} — حي على الصلاة`, info.body, undefined, `prayer_${name}`)
      }, exactMs)
    }

    // At Fajr — show Quran ayah of the day on lock screen
    if (name === 'Fajr' && todayAyah && exactMs > 0) {
      timeouts['fajr_ayah'] = setTimeout(() => {
        const ayahText = todayAyah.english ? `"${todayAyah.english.substring(0, 120)}…"` : 'Open Tamkeen for your daily ayah.'
        swNotify('📖 Ayah of the Day', `${todayAyah.arabic ? todayAyah.arabic.substring(0, 80) + ' ﴾' : ''}\n${ayahText}`, undefined, 'daily_ayah')
      }, exactMs + 2 * 60 * 1000) // 2 minutes after Fajr
    }

    // At Asr — show Hadith of the day on lock screen
    if (name === 'Asr' && todayHadith && exactMs > 0) {
      timeouts['asr_hadith'] = setTimeout(() => {
        const hadithText = todayHadith.hadith ? `"${todayHadith.hadith.substring(0, 120)}…"` : 'Open Tamkeen for your daily hadith.'
        swNotify('📜 Hadith of the Day', `${hadithText}\n— ${todayHadith.source || ''}`, undefined, 'daily_hadith')
      }, exactMs + 2 * 60 * 1000) // 2 minutes after Asr
    }
  })

  // Evening Adhkar reminder — 15 min after Maghrib
  const maghribStr = prayerTimes['maghrib'] || prayerTimes['Maghrib']
  if (maghribStr) {
    const [h, m] = maghribStr.split(':').map(Number)
    const adhkarDate = new Date(now)
    adhkarDate.setHours(h, m + 15, 0, 0)
    const adhkarMs = adhkarDate.getTime() - now.getTime()
    if (adhkarMs > 0) {
      timeouts['adhkar_eve'] = setTimeout(() => {
        swNotify('📿 Evening Adhkar', 'Time for your evening dhikr — أذكار المساء. Open Tamkeen.', undefined, 'adhkar_evening')
      }, adhkarMs)
    }
  }

  // Tahajjud reminder (if stored in prayerTimes)
  if (prayerTimes.tahajjud) {
    const [h, m] = prayerTimes.tahajjud.split(':').map(Number)
    const tahajjudDate = new Date(now)
    tahajjudDate.setHours(h, m, 0, 0)
    if (tahajjudDate.getDate() !== now.getDate()) tahajjudDate.setDate(tahajjudDate.getDate() + 1)
    const ms = tahajjudDate.getTime() - now.getTime()
    if (ms > 0 && ms < 12 * 60 * 60 * 1000) {
      timeouts['tahajjud'] = setTimeout(() => {
        swNotify('🌙 Tahajjud Time', 'The last third of the night — the best time to call upon Allah.', undefined, 'tahajjud')
      }, ms)
    }
  }
}

// ─── FALLBACK when app is open in foreground ──────────────────────────────────
export const scheduleLocalNotification = (title, body, delayMs = 0) => {
  if (notifPermission() !== 'granted') return
  setTimeout(() => swNotify(title, body), delayMs)
}
