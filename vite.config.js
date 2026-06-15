import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Tamkeen — تمكين',
        short_name: 'Tamkeen',
        description: 'Islamic habit tracker & personal empowerment',
        theme_color: '#1B4332',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'prayer-times-cache', expiration: { maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'quran-cache', expiration: { maxAgeSeconds: 604800 } }
          },
          {
            urlPattern: /^https:\/\/ahadith\.co\.uk\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'hadith-cache', expiration: { maxAgeSeconds: 86400 } }
          }
        ]
      }
    })
  ]
})
