import { useStore } from '../store'

const NAV = {
  student: [
    ['dash', "Today's menu"],
    ['weekly', 'Weekly menu'],
    ['ratings', 'Meal ratings'],
  ],
  staff: [
    ['dash', 'Dashboard'],
    ['weekly', 'Weekly menu'],
    ['edit', 'Edit menu'],
    ['data', 'Meal data'],
    ['an', 'Analytics'],
    ['profile', 'Profile'],
  ],
}

export default function Header() {
  const { role, view, user, go, logout, switchRole } = useStore()
  const isStudent = role === 'student'

  return (
    <header className="bg-white dark:bg-brand-dark-surface border-b border-brand-line dark:border-brand-dark-line sticky top-0 z-20 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left: Brand + Navigation */}
        <div className="flex items-center gap-4 flex-wrap">
          <div
            onClick={() => go('dash')}
            className="flex items-center gap-2 cursor-pointer font-semibold text-lg text-brand-green dark:text-brand-dark-green select-none"
          >
            <span className="w-4 h-4 rounded-tl-sm rounded-tr-md rounded-br-md rounded-bl-none bg-brand-teal inline-block" />
            <span>MessMetrics</span>
          </div>

          <nav className="flex items-center gap-1 flex-wrap">
            {NAV[role]?.map(([id, label]) => {
              const isActive = view === id
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    isActive
                      ? 'bg-brand-mint text-brand-green dark:bg-brand-dark-mint dark:text-brand-dark-green font-semibold'
                      : 'text-brand-muted hover:text-brand-ink dark:text-brand-dark-muted dark:hover:text-brand-dark-ink hover:bg-slate-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: User info & Actions */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          {isStudent ? (
            /* Student controls */
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Student
              </span>
              <button
                type="button"
                onClick={switchRole}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-line dark:border-brand-dark-line hover:bg-slate-100 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink transition"
              >
                Change Role
              </button>
            </div>
          ) : (
            /* Staff controls */
            <div className="flex items-center gap-2.5">
              <span className="text-brand-muted dark:text-brand-dark-muted font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {user}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-line dark:border-brand-dark-line hover:bg-slate-100 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink transition"
              >
                Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
