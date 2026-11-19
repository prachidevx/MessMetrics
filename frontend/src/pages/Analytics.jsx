import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { MEALS, CAPACITY, sum, computeStats } from '../data'
import { useStore } from '../store'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
)

const TICK = '#888780'
const scales = {
  x: { ticks: { color: TICK, font: { family: 'Figtree', size: 11 } }, grid: { display: false } },
  y: {
    beginAtZero: true,
    ticks: { color: TICK, font: { family: 'Figtree', size: 11 } },
    grid: { color: 'rgba(136, 135, 128, 0.15)' },
  },
}
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

const Metric = ({ label, value, sub }) => (
  <div className="bg-brand-mint dark:bg-brand-dark-mint border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl p-4 sm:p-5">
    <span className="text-xs font-medium text-brand-muted dark:text-brand-dark-muted block">
      {label}
    </span>
    <b className="text-2xl sm:text-3xl font-bold text-brand-green dark:text-brand-dark-green block mt-1">
      {value}
    </b>
    {sub && (
      <span className="text-[11px] text-brand-muted dark:text-brand-dark-muted mt-0.5 block">
        {sub}
      </span>
    )}
  </div>
)

export default function Analytics() {
  const { ratings, filteredAnalyticsData, timeRange, setTimeRange } = useStore()

  const { att, waste, days } = filteredAnalyticsData

  const s = useMemo(
    () => computeStats({ att, waste, ratings }),
    [att, waste, ratings]
  )

  const totalAtt = sum(s.attByMeal)
  const totalWaste = Math.round(sum(s.wasteByMeal))
  const totalDays = att.length

  const rangeLabel =
    timeRange === '90d'
      ? 'Past 90 Days (~3 Months)'
      : timeRange === '30d'
      ? 'Past 30 Days (~1 Month)'
      : 'Past 7 Days'

  return (
    <div className="space-y-6">
      {/* Header & Time Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-dark-ink">
            Campus Analytics
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted dark:text-brand-dark-muted mt-0.5">
            Attendance and food waste patterns across meal sessions for {rangeLabel}.
          </p>
        </div>

        {/* Time Horizon Pill Selector */}
        <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '7d'
                ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '30d'
                ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            30 Days (1 Mo)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '90d'
                ? 'bg-white dark:bg-neutral-700 text-brand-ink dark:text-brand-dark-ink shadow-xs'
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            90 Days (3 Mo)
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Metric
              label="Total Student Attendance"
              value={totalAtt.toLocaleString()}
              sub={`Over ${totalDays} days`}
            />
            <Metric
              label="Total Food Wasted"
              value={`${totalWaste.toLocaleString()} kg`}
              sub={`Avg ${(totalWaste / totalDays).toFixed(1)} kg / day`}
            />
            <Metric
              label="Highest Rated Meal"
              value={MEALS[s.best]}
              sub={`${s.avgs[s.best]?.toFixed(1)} / 5 stars avg`}
            />
            <Metric
              label="Most Skipped Meal"
              value={MEALS[s.mostSkipped]}
              sub={`${s.skipPct[s.mostSkipped]}% avg student absence`}
            />
          </div>

          {/* 2x3 Chart & Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance by Meal */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink mb-1">
                Attendance by meal slot
              </h2>
              <p className="text-xs text-brand-muted dark:text-brand-dark-muted mb-4">
                Total attendance recorded ({rangeLabel})
              </p>
              <div className="h-56 relative">
                <Bar
                  options={{ ...baseOptions, scales }}
                  data={{
                    labels: MEALS,
                    datasets: [
                      {
                        data: s.attByMeal,
                        backgroundColor: '#1D9E75',
                        borderRadius: 6,
                        maxBarThickness: 36,
                      },
                    ],
                  }}
                />
              </div>
            </div>

            {/* Food Waste by Meal */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink mb-1">
                Food waste by meal (kg)
              </h2>
              <p className="text-xs text-brand-muted dark:text-brand-dark-muted mb-4">
                Cumulative food waste logged ({rangeLabel})
              </p>
              <div className="h-56 relative">
                <Bar
                  options={{ ...baseOptions, scales }}
                  data={{
                    labels: MEALS,
                    datasets: [
                      {
                        data: s.wasteByMeal,
                        backgroundColor: '#BA7517',
                        borderRadius: 6,
                        maxBarThickness: 36,
                      },
                    ],
                  }}
                />
              </div>
            </div>

            {/* Meal Preference Doughnut */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink mb-1">
                Student satisfaction breakdown
              </h2>
              <p className="text-xs text-brand-muted dark:text-brand-dark-muted mb-4">
                Average star rating distribution across meal slots
              </p>
              <div className="h-56 relative">
                <Doughnut
                  options={{
                    ...baseOptions,
                    cutout: '62%',
                    plugins: {
                      legend: {
                        display: true,
                        position: 'right',
                        labels: { color: TICK, boxWidth: 10, font: { family: 'Figtree', size: 12 } },
                      },
                    },
                  }}
                  data={{
                    labels: MEALS.map((n, m) => `${n} (${s.avgs[m].toFixed(1)})`),
                    datasets: [
                      {
                        data: s.avgs,
                        backgroundColor: ['#9FE1CB', '#0F6E56', '#F59E0B', '#1D9E75'],
                        borderWidth: 2,
                        borderColor: 'transparent',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            {/* Food Waste Trend Line Chart */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle">
              <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink mb-1">
                Daily waste trend (kg)
              </h2>
              <p className="text-xs text-brand-muted dark:text-brand-dark-muted mb-4">
                Recorded food waste ({rangeLabel})
              </p>
              <div className="h-56 relative">
                <Line
                  options={{
                    ...baseOptions,
                    scales: {
                      ...scales,
                      x: {
                        ...scales.x,
                        ticks: {
                          ...scales.x.ticks,
                          maxTicksLimit: timeRange === '90d' ? 10 : timeRange === '30d' ? 8 : 7,
                        },
                      },
                    },
                  }}
                  data={{
                    labels: days,
                    datasets: [
                      {
                        data: s.dailyWaste,
                        borderColor: '#1D9E75',
                        backgroundColor: 'rgba(29, 158, 117, 0.12)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: timeRange === '90d' ? 1 : timeRange === '30d' ? 2 : 4,
                        pointBackgroundColor: '#1D9E75',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            {/* Least Preferred Meals Ranking */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle space-y-3">
              <div>
                <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                  Meal satisfaction rating
                </h2>
                <p className="text-xs text-brand-muted dark:text-brand-dark-muted">
                  Ranked from lowest average student rating first
                </p>
              </div>
              <div className="divide-y divide-brand-line dark:divide-brand-dark-line">
                {s.byRatingAsc.map((m) => (
                  <div key={m} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-ink dark:text-brand-dark-ink">
                      {MEALS[m]}
                    </span>
                    <div className="text-right">
                      <b className="text-brand-green dark:text-brand-dark-green">
                        {s.avgs[m].toFixed(1)} / 5
                      </b>
                      <span className="text-xs text-brand-muted dark:text-brand-dark-muted ml-1.5">
                        ({ratings[m]?.count || 0} ratings)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Skip Rate */}
            <div className="bg-white dark:bg-brand-dark-surface border border-brand-line dark:border-brand-dark-line rounded-xl p-5 shadow-subtle space-y-3">
              <div>
                <h2 className="text-base font-semibold text-brand-ink dark:text-brand-dark-ink">
                  Student absence rate
                </h2>
                <p className="text-xs text-brand-muted dark:text-brand-dark-muted">
                  Estimated percentage of students who skipped out of capacity {CAPACITY} ({rangeLabel})
                </p>
              </div>
              <div className="space-y-3 pt-1">
                {s.bySkipDesc.map((m) => (
                  <div key={m} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-brand-ink dark:text-brand-dark-ink">
                        {MEALS[m]}
                      </span>
                      <b className="text-brand-ink dark:text-brand-dark-ink">
                        {s.skipPct[m]}% skipped
                      </b>
                    </div>
                    <div className="w-full h-2 bg-brand-mint dark:bg-brand-dark-mint rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-teal rounded-full transition-all duration-500"
                        style={{ width: `${s.skipPct[m]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  )
}
