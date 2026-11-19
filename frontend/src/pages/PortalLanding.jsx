import { useState } from 'react'
import { useStore } from '../store'

export default function PortalLanding() {
  const { chooseRole, loginStaff } = useStore()
  const [showStaffLogin, setShowStaffLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleStaffSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setError('Please enter your staff email.')
    if (!pw) return setError('Please enter your password.')

    setSubmitting(true)
    try {
      await loginStaff(trimmedEmail, pw)
    } catch (err) {
      setError(err.message || 'Staff login failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-brand-bg dark:bg-brand-dark-bg">
      {/* Left Branding Panel */}
      <div className="bg-brand-mint dark:bg-brand-dark-mint p-8 sm:p-12 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-line dark:border-brand-dark-line">
        <div className="flex items-center gap-2 font-semibold text-lg text-brand-green dark:text-brand-dark-green select-none">
          <span className="w-5 h-5 rounded-tl-sm rounded-tr-md rounded-br-md rounded-bl-none bg-brand-teal inline-block" />
          <span>MessMetrics</span>
        </div>

        <div className="my-10 md:my-0 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-green dark:text-brand-dark-green leading-[1.15]">
            Track meals.<br />
            Understand demand.<br />
            Reduce waste.
          </h1>
          <p className="text-sm text-brand-muted dark:text-brand-dark-muted font-medium pt-2 max-w-md">
            Campus dining portal with live weekly menus, student feedback, and preparation demand forecasting.
          </p>
        </div>

        <div className="text-xs text-brand-muted dark:text-brand-dark-muted font-medium">
          <span>MessMetrics</span>
        </div>
      </div>

      {/* Right Content: Role Chooser OR Staff Login */}
      <div className="flex items-center justify-center p-6 sm:p-10 md:p-14">
        <div className="w-full max-w-md space-y-6">
          {!showStaffLogin ? (
            /* Role Selection Screen */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-ink dark:text-brand-dark-ink">
                  Welcome to MessMetrics
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-1">
                  Please select your role to proceed into the portal.
                </p>
              </div>

              {/* Student Option - NO LOGIN REQUIRED */}
              <div
                onClick={() => chooseRole('student')}
                className="group p-5 bg-white dark:bg-brand-dark-surface border-2 border-brand-line hover:border-brand-green dark:border-brand-dark-line dark:hover:border-brand-dark-green rounded-2xl shadow-subtle cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      🎓 Student &bull; Instant Access
                    </span>
                    <h3 className="text-lg font-bold text-brand-ink dark:text-brand-dark-ink pt-1 group-hover:text-brand-green transition-colors">
                      I'm a Student
                    </h3>
                    <p className="text-xs text-brand-muted dark:text-brand-dark-muted leading-relaxed">
                      No login needed. Directly browse today's menu, check the 7-day weekly schedule, and rate your meals.
                    </p>
                  </div>
                  <span className="text-2xl text-brand-muted group-hover:text-brand-green group-hover:translate-x-1 transition-all pt-2">
                    &rarr;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => chooseRole('student')}
                  className="mt-4 w-full py-2.5 rounded-xl bg-brand-green group-hover:bg-brand-green-hover text-white text-xs sm:text-sm font-semibold transition"
                >
                  View Menu as Student (No login) &rarr;
                </button>
              </div>

              {/* Staff / Admin Option - LOGIN REQUIRED */}
              <div
                onClick={() => setShowStaffLogin(true)}
                className="group p-5 bg-white dark:bg-brand-dark-surface border border-brand-line hover:border-slate-400 dark:border-brand-dark-line dark:hover:border-neutral-600 rounded-2xl shadow-subtle cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                      🛠️ Staff & Administration
                    </span>
                    <h3 className="text-lg font-bold text-brand-ink dark:text-brand-dark-ink pt-1">
                      I'm Staff / Admin
                    </h3>
                    <p className="text-xs text-brand-muted dark:text-brand-dark-muted leading-relaxed">
                      Requires login. Manage the weekly menu schedule, record attendance & waste data, and view deep analytics.
                    </p>
                  </div>
                  <span className="text-2xl text-brand-muted group-hover:translate-x-1 transition-transform pt-2">
                    &rarr;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowStaffLogin(true)
                  }}
                  className="mt-4 w-full py-2 rounded-xl border border-brand-line dark:border-brand-dark-line hover:bg-slate-50 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink text-xs font-semibold transition"
                >
                  Staff / Admin Sign In &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Staff Login Form */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setShowStaffLogin(false)}
                className="text-xs font-semibold text-brand-muted hover:text-brand-ink flex items-center gap-1 transition-colors"
              >
                &larr; Back to role selection
              </button>

              <div>
                <h2 className="text-2xl font-bold text-brand-ink dark:text-brand-dark-ink">
                  Staff / Admin Sign In
                </h2>
                <p className="text-xs text-brand-muted dark:text-brand-dark-muted mt-1">
                  Enter your mess administration credentials to manage meals and analytics.
                </p>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1.5"
                  >
                    Staff Email or ID
                  </label>
                  <input
                    id="staff-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@messmetrics.com"
                    autoComplete="username"
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-brand-line dark:border-brand-dark-line bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-brand-dark-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="staff-pw"
                    className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="staff-pw"
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-brand-line dark:border-brand-dark-line bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-brand-dark-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition"
                  />
                </div>

                {error && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-2.5 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

