import { useStore } from '../store'

export default function Profile() {
  const { user, role, logout } = useStore()

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
          Account details and session settings.
        </p>
      </div>

      <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle divide-y divide-brand-line dark:divide-brand-dark-line">
        <div className="py-2.5 flex items-center justify-between text-sm">
          <span className="text-brand-muted dark:text-brand-dark-muted">Email</span>
          <b className="text-brand-ink dark:text-brand-dark-ink font-semibold">{user}</b>
        </div>

        <div className="py-2.5 flex items-center justify-between text-sm">
          <span className="text-brand-muted dark:text-brand-dark-muted">Role</span>
          <b className="text-brand-ink dark:text-brand-dark-ink font-semibold capitalize">
            {role === 'staff' ? 'Staff / Administrator' : 'Student'}
          </b>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold transition shadow-xs"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
