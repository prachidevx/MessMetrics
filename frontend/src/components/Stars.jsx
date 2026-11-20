import { useState } from 'react'

export default function Stars({ value, onRate, label }) {
  const [hover, setHover] = useState(0)

  return (
    <div
      className="flex items-center gap-1.5 mt-3 select-none"
      role="group"
      aria-label={`Rate ${label}`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = i <= (hover || value)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRate(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            className={`text-2xl leading-none transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded ${
              isFilled ? 'text-brand-star' : 'text-slate-300 dark:text-neutral-700'
            }`}
          >
            &#9733;
          </button>
        )
      })}
    </div>
  )
}
