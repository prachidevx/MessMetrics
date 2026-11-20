import { useState } from 'react'
import { MEALS, TIMES, WEEKDAYS, getTodayDayName } from '../data'
import { useStore } from '../store'

export default function WeeklyMenu() {
  const { weeklyMenu, role, go, selectedDay, setSelectedDay } = useStore()
  const todayDay = getTodayDayName()
  const [viewMode, setViewMode] = useState('day') // 'day' or 'table'

  const currentDayMenu = weeklyMenu[selectedDay] || weeklyMenu.Monday || {
    Breakfast: [],
    Lunch: [],
    Snacks: [],
    Dinner: [],
  }

  return (
    <div className="space-y-6">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
            Weekly meal schedule
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
            Full 7-day schedule across 4 daily meals. Today is{' '}
            <span className="font-semibold text-brand-green dark:text-brand-dark-green">
              {todayDay}
            </span>
            .
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'day'
                ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink'
            }`}
          >
            Day View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink'
            }`}
          >
            Full Week Table
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        <>
          {/* Day of Week Selector Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDay.toLowerCase() === day.toLowerCase()
              const isToday = todayDay.toLowerCase() === day.toLowerCase()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-brand-green text-white border-brand-green shadow-xs'
                      : 'bg-white dark:bg-brand-dark-surface border-brand-line dark:border-brand-dark-line text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink hover:border-slate-300'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold tracking-wider ${
                        isSelected
                          ? 'bg-brand-mint text-brand-green'
                          : 'bg-brand-mint dark:bg-brand-dark-mint text-brand-green dark:text-brand-dark-green'
                      }`}
                    >
                      Today
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 4 Meal Cards for Selected Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEALS.map((mealType, m) => {
              const items = currentDayMenu[mealType] || []

              return (
                <div
                  key={mealType}
                  className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-brand-line dark:border-brand-dark-line">
                      <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                        {mealType}
                      </h2>
                      <span className="text-[11px] text-brand-muted dark:text-brand-dark-muted font-medium bg-slate-50 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-neutral-700">
                        {TIMES[m]}
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-brand-line dark:divide-brand-dark-line">
                      {items.length === 0 ? (
                        <div className="py-4 text-xs text-brand-muted text-center italic">
                          No items registered
                        </div>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item}
                            className="py-2.5 text-sm text-brand-ink dark:text-brand-dark-ink flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {role === 'staff' && (
                    <button
                      type="button"
                      onClick={() => go('edit')}
                      className="mt-4 pt-3 border-t border-brand-line dark:border-brand-dark-line text-xs font-semibold text-brand-green hover:underline text-left"
                    >
                      Edit {selectedDay}'s Menu &rarr;
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Full Week Matrix Table */
        <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-brand-line dark:border-brand-dark-line bg-slate-50/50 dark:bg-neutral-800/40 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-brand-ink dark:text-brand-dark-ink">
              Campus Weekly Menu Master
            </h2>
            <span className="text-xs text-brand-muted dark:text-brand-dark-muted">
              4 Meals Daily: Breakfast, Lunch, Snacks, Dinner
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-line dark:border-brand-dark-line text-xs font-semibold text-brand-muted dark:text-brand-dark-muted bg-slate-50/80 dark:bg-neutral-800/60">
                  <th className="py-3 px-4 w-28">Day</th>
                  <th className="py-3 px-3">Breakfast ({TIMES[0]})</th>
                  <th className="py-3 px-3">Lunch ({TIMES[1]})</th>
                  <th className="py-3 px-3">Snacks ({TIMES[2]})</th>
                  <th className="py-3 px-3">Dinner ({TIMES[3]})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line dark:divide-brand-dark-line text-xs sm:text-sm">
                {WEEKDAYS.map((day) => {
                  const dMenu = weeklyMenu[day] || {}
                  const isToday = todayDay.toLowerCase() === day.toLowerCase()

                  return (
                    <tr
                      key={day}
                      className={isToday ? 'bg-brand-mint/30 dark:bg-brand-dark-mint/30 font-medium' : 'hover:bg-slate-50/50 dark:hover:bg-neutral-800/30'}
                    >
                      <td className="py-3 px-4 font-semibold text-brand-ink dark:text-brand-dark-ink align-top">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isToday && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-brand-green text-white rounded-full font-bold uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top text-brand-muted dark:text-brand-dark-muted">
                        {(dMenu.Breakfast || []).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-3 align-top text-brand-muted dark:text-brand-dark-muted">
                        {(dMenu.Lunch || []).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-3 align-top text-brand-muted dark:text-brand-dark-muted font-medium text-brand-ink dark:text-brand-dark-ink">
                        {(dMenu.Snacks || []).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-3 align-top text-brand-muted dark:text-brand-dark-muted">
                        {(dMenu.Dinner || []).join(', ') || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
