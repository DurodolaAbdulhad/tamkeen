export default function ProgressRing({ pct = 0, size = 80, stroke = 6, label, sublabel }) {
  const r       = (size - stroke) / 2
  const circ    = 2 * Math.PI * r
  const offset  = circ - pct * circ
  const center  = size / 2

  const color = pct >= 1 ? '#1B4332' : pct >= 0.7 ? '#40916C' : pct >= 0.4 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
          <circle
            cx={center} cy={center} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {label && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-tamkeen-ink">{label}</span>
            {sublabel && <span className="text-[10px] text-gray-400">{sublabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
