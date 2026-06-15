// Firebase Cloud Messaging Service Worker
// This file MUST be at the root of your public folder

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey:            'AIzaSyAXrJ7-kd-tv_Gi6BmFQS5oVCoxfsOlhyM',
  authDomain:        'tamkeen-3a841.firebaseapp.com',
  projectId:         'tamkeen-3a841',
  storageBucket:     'tamkeen-3a841.firebasestorage.app',
  messagingSenderId: '381730892190',
  appId:             '1:381730892190:web:864085a7b69ff41f4ace8f',
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

// Handle background FCM messages — these appear on the lock screen
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'Tamkeen', {
    body:    body || 'A reminder from Tamkeen',
    icon:    icon || '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag:     payload.data?.tag || 'tamkeen',
    renotify: true,
    data:    payload.data,
    actions: [
      { action: 'open',    title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss'  },
    ],
  })
})

// Handle local scheduled notifications (from schedulePrayerNotifications)
self.addEventListener('push', (event) => {
  if (!event.data) return
  try {
    const data = event.data.json()
    if (data.notification) {
      event.waitUntil(
        self.registration.showNotification(data.notification.title || 'Tamkeen', {
          body:    data.notification.body,
          icon:    '/icons/icon-192.png',
          badge:   '/icons/icon-192.png',
          vibrate: [200, 100, 200],
          tag:     data.data?.tag || 'tamkeen',
          renotify: true,
        })
      )
    }
  } catch (_) {}
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url && 'focus' in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow('/')
      })
    )
  }
})
