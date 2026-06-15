import { useState, useEffect, useRef } from 'react'
import { Navigation } from 'lucide-react'

// Makkah coordinates
const MAKKAH = { lat: 21.4225, lng: 39.8262 }
// Lagos coordinates (static — app is Lagos-only)
const LAGOS  = { lat: 6.5244,  lng: 3.3792  }

function toRad(deg) { return deg * (Math.PI / 180) }
function toDeg(rad) { return rad * (180 / Math.PI) }

// Calculate compass bearing from Lagos to Makkah
function calcBearing(from, to) {
  const φ1 = toRad(from.lat), φ2 = toRad(to.lat)
  const Δλ = toRad(to.lng - from.lng)
  const y   = Math.sin(Δλ) * Math.cos(φ2)
  const x   = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

const QIBLA_BEARING = Math.round(calcBearing(LAGOS, MAKKAH)) // ~63° NE from Lagos

export default function Qibla() {
  const [heading, setHeading]   = useState(null) // device compass heading
  const [error, setError]       = useState(null)
  const [permission, setPerm]   = useState('prompt') // 'prompt' | 'granted' | 'denied'
  const [aligned, setAligned]   = useState(false)
  const lastVibrateRef = useRef(0)

  // Angle of Qibla needle relative to screen top
  const needleAngle = heading !== null ? (QIBLA_BEARING - heading + 360) % 360 : QIBLA_BEARING

  useEffect(() => {
    if (heading === null) return
    const diff = Math.abs(((needleAngle + 180) % 360) - 180)
    const isAligned = diff < 5
    if (isAligned && !aligned) {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
    }
    setAligned(isAligned)
  }, [needleAngle, heading, aligned])

  const requestCompass = async () => {
    // iOS 13+ requires permission for DeviceOrientationEvent
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission()
        if (res === 'granted') {
          setPerm('granted')
          startListening()
        } else {
          setPerm('denied')
          setError('Compass permission denied. You can still use the static bearing below.')
        }
      } catch (e) {
        setError('Could not access compass. ' + e.message)
      }
    } else {
      // Android / desktop — no permission API needed
      setPerm('granted')
      startListening()
    }
  }

  const startListening = () => {
    const handler = (e) => {
      // webkitCompassHeading is iOS; alpha (inverted) is Android
      if (e.webkitCompassHeading != null) {
        setHeading(e.webkitCompassHeading)
      } else if (e.alpha != null) {
        setHeading((360 - e.alpha) % 360)
      }
    }
    window.addEventListener('deviceorientationabsolute', handler, true)
    window.addEventListener('deviceorientation', handler, true)
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true)
      window.removeEventListener('deviceorientation', handler, true)
    }
  }

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setError('This device does not support compass. Use the static bearing below.')
      return
    }
    // Auto-start on Android (no permission needed)
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      setPerm('granted')
      return startListening()
    }
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-tamkeen-ink">Qibla Direction</h2>
        <p className="text-sm text-gray-500">Pointing toward the Kaaba in Makkah</p>
      </div>

      {/* Compass */}
      <div className="card flex flex-col items-center py-8">
        <div className="relative" style={{ width: 240, height: 240 }}>
          {/* Outer ring */}
          <svg className="absolute inset-0" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="110" fill="none" stroke="#e5e7eb" strokeWidth="2" />
            <circle cx="120" cy="120" r="108" fill="#f9fafb" />
            {/* Cardinal marks */}
            {[
              { angle: 0,   label: 'N' },
              { angle: 90,  label: 'E' },
              { angle: 180, label: 'S' },
              { angle: 270, label: 'W' },
            ].map(({ angle, label }) => {
              const rad = toRad(angle - 90)
              const lx = 120 + Math.cos(rad) * 90
              const ly = 120 + Math.sin(rad) * 90
              return (
                <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                  fill={label === 'N' ? '#1B4332' : '#9ca3af'} fontSize="14" fontWeight="bold">
                  {label}
                </text>
              )
            })}
            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i * 10) - 90
              const r1 = 100, r2 = i % 9 === 0 ? 88 : 94
              const x1 = 120 + Math.cos(toRad(a)) * r1
              const y1 = 120 + Math.sin(toRad(a)) * r1
              const x2 = 120 + Math.cos(toRad(a)) * r2
              const y2 = 120 + Math.sin(toRad(a)) * r2
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth={i % 9 === 0 ? 2 : 1} />
            })}
          </svg>

          {/* Rotating needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${needleAngle}deg)`, transitionDuration: '0.3s' }}
          >
            <svg viewBox="0 0 60 200" style={{ width: 30, height: 100, marginTop: -50 }}>
              {/* Kaaba icon at tip */}
              <polygon points="30,0 40,80 20,80" fill={aligned ? '#22c55e' : '#1B4332'} />
              <polygon points="30,200 40,120 20,120" fill="#e5e7eb" />
            </svg>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-6 h-6 rounded-full ${aligned ? 'bg-green-500' : 'bg-tamkeen-dark'} shadow flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Aligned indicator */}
        {aligned && (
          <div className="mt-4 bg-green-50 text-green-700 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
            🕋 Facing Qibla!
          </div>
        )}

        {/* Status */}
        {!aligned && heading !== null && (
          <p className="mt-4 text-sm text-gray-500">
            Rotate until the green needle points up
          </p>
        )}

        {permission === 'prompt' && (
          <button onClick={requestCompass} className="mt-4 btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
            <Navigation size={16} /> Enable Compass
          </button>
        )}

        {permission === 'denied' && (
          <p className="mt-4 text-xs text-red-400 text-center max-w-xs">
            Compass access denied. Use the bearing below to find Qibla manually.
          </p>
        )}
      </div>

      {/* Static bearing info */}
      <div className="card">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Static Bearing (Lagos → Makkah)</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-tamkeen-ink">{QIBLA_BEARING}°</p>
            <p className="text-xs text-gray-400">Bearing</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-tamkeen-ink">NE</p>
            <p className="text-xs text-gray-400">Direction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-tamkeen-ink">3,840</p>
            <p className="text-xs text-gray-400">km away</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          From Lagos (6.52°N, 3.38°E) to Makkah (21.42°N, 39.83°E)
        </p>
      </div>

      {/* Tip */}
      <div className="card bg-green-50">
        <p className="text-xs font-semibold text-tamkeen-dark mb-1">How to use</p>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Tap "Enable Compass" and hold your phone flat</li>
          <li>Slowly rotate until the dark needle points straight up</li>
          <li>Your phone is now facing the Qibla</li>
          <li>Face that direction for prayer — الله أكبر</li>
        </ol>
        <p className="text-[10px] text-gray-400 mt-2">Works offline — no internet needed after first load</p>
      </div>

      {error && (
        <div className="card bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}
    </div>
  )
}
