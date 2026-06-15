import { Check } from 'lucide-react'

export default function CheckCircle({ done, onClick, size = 'md', disabled = false }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-7 h-7', lg: 'w-9 h-9' }
  const iconSizes = { sm: 14, md: 16, lg: 20 }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizes[size]} rounded-full border-2 flex items-center justify-center
        transition-all duration-200 flex-shrink-0
        ${done
          ? 'bg-tamkeen-dark border-tamkeen-dark text-white'
          : 'border-gray-200 bg-white hover:border-tamkeen-light active:scale-90'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {done && <Check size={iconSizes[size]} strokeWidth={3} />}
    </button>
  )
}
