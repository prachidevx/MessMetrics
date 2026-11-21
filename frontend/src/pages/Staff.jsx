import { useState, useEffect } from 'react'
import { MEALS, CAPACITY, WEEKDAYS, getTodayDayName, sum } from '../data'
import { useStore } from '../store'

export function StaffDashboard() {
  const { menu, att, waste, go } = useStore()
  const today = att.length - 1
  const todayDay = getTodayDayName()
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
            Mess operations dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
            {todayFormatted} &bull; 4 daily meal sessions &bull; Active schedule: <span className="font-semibold text-brand-green">{todayDay}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => go('weekly')}
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-lg bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line hover:border-slate-300 text-brand-ink dark:text-brand-dark-ink shadow-xs transition"
        >
          📅 Weekly Menu Master &rarr;
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Menu Card */}
        <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                Today's Menu ({todayDay})
              </h2>
              <span className="text-xs text-brand-green font-medium">Active</span>
            </div>
            <div className="divide-y divide-brand-line dark:divide-brand-dark-line">
              {MEALS.map((name, m) => (
                <div key={name} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-brand-ink dark:text-brand-dark-ink">{name}</span>
                  <span className="text-xs text-brand-muted dark:text-brand-dark-muted font-medium">
                    {menu[m]?.length || 0} dishes
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => go('edit')}
            className="mt-4 w-full py-2 text-xs font-semibold border border-brand-line dark:border-brand-dark-line rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink transition"
          >
            Edit Menu &rarr;
          </button>
        </div>

        {/* Today's Counts (Attendance & Waste combined) */}
        <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                Today's Meal Records
              </h2>
              <span className="text-xs text-brand-muted">Attendance &bull; Waste</span>
            </div>
            <div className="divide-y divide-brand-line dark:divide-brand-dark-line">
              {MEALS.map((name, m) => (
                <div key={name} className="py-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-ink dark:text-brand-dark-ink">{name}</span>
                  <div className="flex items-center gap-6 text-xs sm:text-sm">
                    <span className="text-brand-muted">
                      Attended: <b className="text-brand-green font-semibold">{att[today]?.[m] ?? 0}</b>
                    </span>
                    <span className="text-brand-muted">
                      Waste: <b className="text-amber-600 dark:text-amber-400 font-semibold">{waste[today]?.[m] ?? 0} kg</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => go('data')}
            className="mt-4 w-full py-2 text-xs font-semibold border border-brand-line dark:border-brand-dark-line rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 text-brand-ink dark:text-brand-dark-ink transition"
          >
            Update Attendance & Waste &rarr;
          </button>
        </div>
      </div>

      {/* Analytics Shortcut */}
      <div>
        <button
          type="button"
          onClick={() => go('an')}
          className="w-full bg-brand-green hover:bg-brand-green-hover text-white p-5 rounded-xl shadow-subtle flex items-center justify-between transition-all group text-left"
        >
          <div>
            <div className="text-base font-bold">Campus Analytics</div>
            <div className="text-xs text-white/80 mt-1">
              View meal attendance trends, ratings, and daily wastage patterns across the semester
            </div>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform ml-2">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  )
}

export function MenuUpdate() {
  const { weeklyMenu, saveDayMenu, notify } = useStore()
  const todayDay = getTodayDayName()
  const [activeDay, setActiveDay] = useState(todayDay)

  const dayMenu = weeklyMenu[activeDay] || {
    Breakfast: [],
    Lunch: [],
    Snacks: [],
    Dinner: [],
  }

  const [text, setText] = useState([
    (dayMenu.Breakfast || []).join('\n'),
    (dayMenu.Lunch || []).join('\n'),
    (dayMenu.Snacks || []).join('\n'),
    (dayMenu.Dinner || []).join('\n'),
  ])
  const [saving, setSaving] = useState(false)

  const selectDay = (day) => {
    setActiveDay(day)
    const dMenu = weeklyMenu[day] || { Breakfast: [], Lunch: [], Snacks: [], Dinner: [] }
    setText([
      (dMenu.Breakfast || []).join('\n'),
      (dMenu.Lunch || []).join('\n'),
      (dMenu.Snacks || []).join('\n'),
      (dMenu.Dinner || []).join('\n'),
    ])
  }

  const handleSave = async () => {
    const parsed = text.map((t) =>
      t
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
    )

    const emptyIndex = parsed.findIndex((items) => items.length === 0)
    if (emptyIndex !== -1) {
      return notify(`Please add at least one dish item for ${MEALS[emptyIndex]}`)
    }

    setSaving(true)
    try {
      await saveDayMenu(activeDay, {
        Breakfast: parsed[0],
        Lunch: parsed[1],
        Snacks: parsed[2],
        Dinner: parsed[3],
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
          Weekly menu editor
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
          Select a day to update the menu for Breakfast, Lunch, Snacks, and Dinner.
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {WEEKDAYS.map((day) => {
          const isActive = activeDay === day
          const isToday = day.toLowerCase() === todayDay.toLowerCase()

          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-brand-green text-white border-brand-green shadow-xs'
                  : 'bg-white dark:bg-brand-dark-surface border-brand-line dark:border-brand-dark-line text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="text-[9px] px-1.5 py-0.2 bg-brand-mint text-brand-green rounded-full font-bold uppercase">
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Textareas for Breakfast, Lunch, Snacks, Dinner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEALS.map((name, m) => (
          <div
            key={name}
            className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                {name}
              </h2>
              <span className="text-xs text-brand-muted">1 dish per line</span>
            </div>
            <textarea
              rows={8}
              aria-label={`${activeDay} ${name} menu items`}
              value={text[m]}
              onChange={(e) =>
                setText(text.map((t, i) => (i === m ? e.target.value : t)))
              }
              placeholder="e.g. Samosa&#10;Mint Chutney&#10;Masala Chai"
              className="w-full text-sm p-3 rounded-lg border border-brand-line dark:border-brand-dark-line bg-brand-bg dark:bg-brand-dark-bg text-brand-ink dark:text-brand-dark-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition font-sans"
            />
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold transition shadow-xs disabled:opacity-60"
        >
          {saving ? 'Saving...' : `Save ${activeDay}'s Menu`}
        </button>
      </div>
    </div>
  )
}

export function MealData() {
  const { att, waste, saveToday, notify, monthsData } = useStore()
  const today = att.length - 1
  const [a, setA] = useState(() => (att[today] || [0, 0, 0, 0]).map(String))
  const [w, setW] = useState(() => (waste[today] || [0, 0, 0, 0]).map(String))
  const [saving, setSaving] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('7') // '7', '30', '90'

  useEffect(() => {
    if (att[today] && !saving) setA(att[today].map(String))
    if (waste[today] && !saving) setW(waste[today].map(String))
  }, [att, waste, today])

  const handleEdit = (arr, setArr, m, val) => {
    setArr(arr.map((x, i) => (i === m ? val : x)))
  }

  const handleSave = async () => {
    const na = a.map(Number)
    const nw = w.map(Number)
    const invalidIdx = MEALS.findIndex(
      (_, m) =>
        !(na[m] >= 0 && nw[m] >= 0) ||
        na[m] > CAPACITY ||
        a[m] === '' ||
        w[m] === ''
    )

    if (invalidIdx !== -1) {
      return notify(
        `Please check the entries for ${MEALS[invalidIdx]} (max attendance is ${CAPACITY})`
      )
    }

    setSaving(true)
    try {
      await saveToday(na.map(Math.round), nw)
    } finally {
      setSaving(false)
    }
  }

  // Multi-month history records from backend
  const allRecords = monthsData.dailyRecords || []
  const displayRecords = allRecords.length > 0 ? allRecords.slice(-Number(historyFilter)).reverse() : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
          Meal data & attendance logging
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
          Log today's student attendance and food waste for each meal session.
        </p>
      </div>

      {/* 4 Meal Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEALS.map((name, m) => (
          <div
            key={name}
            className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle space-y-3"
          >
            <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink border-b border-brand-line dark:border-brand-dark-line pb-2">
              {name}
            </h2>

            <div>
              <label
                htmlFor={`att-${m}`}
                className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1"
              >
                Students attended (0 - {CAPACITY})
              </label>
              <input
                id={`att-${m}`}
                type="number"
                min="0"
                max={CAPACITY}
                value={a[m] ?? ''}
                onChange={(e) => handleEdit(a, setA, m, e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-brand-line dark:border-brand-dark-line bg-brand-bg dark:bg-brand-dark-bg text-brand-ink dark:text-brand-dark-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition"
              />
            </div>

            <div>
              <label
                htmlFor={`waste-${m}`}
                className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1"
              >
                Food wasted (kg)
              </label>
              <input
                id={`waste-${m}`}
                type="number"
                min="0"
                step="0.5"
                value={w[m] ?? ''}
                onChange={(e) => handleEdit(w, setW, m, e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-brand-line dark:border-brand-dark-line bg-brand-bg dark:bg-brand-dark-bg text-brand-ink dark:text-brand-dark-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold transition shadow-xs disabled:opacity-60"
      >
        {saving ? 'Saving...' : "Save Today's Data"}
      </button>

      {/* Historical Logs Table */}
      <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
              Meal & Waste History
            </h2>
            <p className="text-xs text-brand-muted dark:text-brand-dark-muted">
              Recent daily attendance and recorded wastage.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setHistoryFilter('7')}
              className={`px-3 py-1 rounded-lg transition-all ${
                historyFilter === '7'
                  ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              Past 7 Days
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('30')}
              className={`px-3 py-1 rounded-lg transition-all ${
                historyFilter === '30'
                  ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              Past 30 Days (1 Mo)
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('90')}
              className={`px-3 py-1 rounded-lg transition-all ${
                historyFilter === '90'
                  ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              Past 90 Days (3 Mo)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-brand-dark-surface z-10">
              <tr className="border-b border-brand-line dark:border-brand-dark-line text-xs font-semibold text-brand-muted dark:text-brand-dark-muted">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Breakfast (Att/Wst)</th>
                <th className="py-2.5 px-3">Lunch (Att/Wst)</th>
                <th className="py-2.5 px-3">Snacks (Att/Wst)</th>
                <th className="py-2.5 px-3">Dinner (Att/Wst)</th>
                <th className="py-2.5 px-3 text-right">Daily Waste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line dark:divide-brand-dark-line text-xs sm:text-sm">
              {displayRecords.map((r, i) => (
                <tr
                  key={r.date}
                  className={i === 0 ? 'bg-brand-mint/30 dark:bg-brand-dark-mint/30 font-medium' : 'hover:bg-slate-50/50'}
                >
                  <td className="py-2.5 px-3 font-semibold text-brand-ink dark:text-brand-dark-ink whitespace-nowrap">
                    {r.date} {i === 0 && '(Latest)'}
                  </td>
                  <td className="py-2.5 px-3 text-brand-muted dark:text-brand-dark-muted">
                    {r.dayName}
                  </td>
                  <td className="py-2.5 px-3">
                    {r.att[0]} <span className="text-brand-muted text-xs">/ {r.waste[0]}kg</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {r.att[1]} <span className="text-brand-muted text-xs">/ {r.waste[1]}kg</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {r.att[2]} <span className="text-brand-muted text-xs">/ {r.waste[2]}kg</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {r.att[3]} <span className="text-brand-muted text-xs">/ {r.waste[3]}kg</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {r.totalWaste} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
