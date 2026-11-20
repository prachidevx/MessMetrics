import { MEALS, avgRating, getTodayDayName } from '../data'
import { useStore } from '../store'
import MealCard from '../components/MealCard'

const Grid = ({ rateable }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
    {MEALS.map((_, m) => (
      <MealCard key={m} m={m} rateable={rateable} />
    ))}
  </div>
)

export function StudentDashboard() {
  const { go } = useStore()
  const todayDay = getTodayDayName()
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
            Today's dining menu & feedback
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
            {todayFormatted} &bull; 4 daily meal sessions ({todayDay}). Rate each meal after eating!
          </p>
        </div>

        <button
          type="button"
          onClick={() => go('weekly')}
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand-mint text-brand-green dark:bg-brand-dark-mint dark:text-brand-dark-green hover:brightness-95 transition"
        >
          View Full Weekly Menu &rarr;
        </button>
      </div>

      <Grid rateable />
    </div>
  )
}

export function TodaysMenu() {
  const { go } = useStore()
  const todayDay = getTodayDayName()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
            Today's menu and meal timings ({todayDay})
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
            Serving Breakfast, Lunch, Snacks, and Dinner across campus dining halls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => go('weekly')}
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-brand-line dark:border-brand-dark-line hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
        >
          See 7-Day Schedule &rarr;
        </button>
      </div>

      <Grid />
    </div>
  )
}

export function MealRatings() {
  const { mine, ratings, go } = useStore()

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
          Meal ratings & satisfaction
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-1">
          Your personal ratings alongside overall campus ratings across all 4 daily meals.
        </p>
      </div>

      <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle divide-y divide-brand-line dark:divide-brand-dark-line">
        {MEALS.map((name, m) => {
          const avg = avgRating(ratings, m)
          const studentRating = mine[m]

          return (
            <div key={name} className="py-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-brand-ink dark:text-brand-dark-ink">
                {name}
              </span>
              <div className="text-xs sm:text-sm space-x-3 text-brand-muted dark:text-brand-dark-muted">
                <span>
                  You:{' '}
                  <b className="text-brand-ink dark:text-brand-dark-ink">
                    {studentRating ? `${studentRating} / 5` : 'Not rated'}
                  </b>
                </span>
                <span>&bull;</span>
                <span>
                  Campus:{' '}
                  <b className="text-brand-green dark:text-brand-dark-green">
                    {avg.toFixed(1)} / 5
                  </b>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => go('dash')}
        className="px-4 py-2 text-xs sm:text-sm font-medium border border-brand-line dark:border-brand-dark-line rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink transition"
      >
        Rate today's meals &rarr;
      </button>
    </div>
  )
}
