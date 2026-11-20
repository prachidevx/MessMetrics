import { MEALS, TIMES } from '../data'
import { useStore } from '../store'
import Stars from './Stars'

export default function MealCard({ m, rateable }) {
  const { menu, mine, rateMeal, notify } = useStore()

  const handleRate = (val) => {
    rateMeal(m, val)
    notify(`${MEALS[m]} rated ${val} of 5`)
  }

  const items = menu[m] || []
  const userRating = mine[m]

  return (
    <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-neutral-600">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
            {MEALS[m]}
          </h2>
          <span className="text-xs text-brand-muted dark:text-brand-dark-muted font-medium bg-slate-50 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-neutral-700">
            {TIMES[m]}
          </span>
        </div>

        <div className="mt-3.5 divide-y divide-brand-line dark:divide-brand-dark-line">
          {items.map((item) => (
            <div
              key={item}
              className="py-2 text-sm text-brand-ink dark:text-brand-dark-ink flex items-center justify-between"
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {rateable && (
        <div className="mt-4 pt-3.5 border-t border-brand-line dark:border-brand-dark-line">
          <Stars value={userRating} onRate={handleRate} label={MEALS[m]} />
          <div className="text-xs text-brand-muted dark:text-brand-dark-muted mt-2 font-medium">
            {userRating ? (
              <span className="text-brand-green dark:text-brand-dark-green font-semibold">
                Your rating: {userRating} of 5
              </span>
            ) : (
              'Tap a star to rate'
            )}
          </div>
        </div>
      )}
    </div>
  )
}
