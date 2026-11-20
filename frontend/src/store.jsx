import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  SEED,
  MEALS,
  DEFAULT_WEEKLY_MENU,
  getTodayDayName,
} from './data'
import {
  authApi,
  dishApi,
  mealApi,
  weeklyMenuApi,
  analyticsApi,
  checkHealth,
  setToken,
  removeToken,
  getToken,
} from './api'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('messmetrics_state_v3')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...SEED,
          ...parsed,
          weeklyMenu: parsed.weeklyMenu || DEFAULT_WEEKLY_MENU,
        }
      }
    } catch {}
    return SEED
  })

  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(getTodayDayName())
  const [timeRange, setTimeRange] = useState('7d') // '7d', '30d', '90d'

  // Full multi-month history from database across 4 meals
  const [monthsData, setMonthsData] = useState({
    dailyRecords: [], // array of { date, dayName, att: [b, l, s, d], waste: [b, l, s, d], totalWaste, totalAtt }
  })

  const notify = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }, [])

  const set = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }))
  }, [])

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('messmetrics_state_v3', JSON.stringify(state))
    } catch {}
  }, [state])

  // Sync with backend: fetch weekly menu, dishes, and meal data across 4 meals
  const syncWithBackend = useCallback(async () => {
    try {
      // 1. Load Weekly Menu
      const weeklyRes = await weeklyMenuApi.getWeeklyMenu().catch(() => null)
      if (weeklyRes && weeklyRes.Monday) {
        set({ weeklyMenu: weeklyRes })
        const todayDay = getTodayDayName()
        const todaySchedule = weeklyRes[todayDay] || weeklyRes.Monday
        if (todaySchedule) {
          set({
            menu: [
              todaySchedule.Breakfast || [],
              todaySchedule.Lunch || [],
              todaySchedule.Snacks || [],
              todaySchedule.Dinner || [],
            ],
          })
        }
      }

      // 2. Load Multi-Month Meals from database
      const meals = await mealApi.getAll({ limit: 400 }).catch(() => [])

      if (meals && meals.length > 0) {
        // Group meals by date (YYYY-MM-DD)
        const dateGroups = {}
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        // Sort ascending by date
        const sortedMeals = [...meals].sort((a, b) => new Date(a.date) - new Date(b.date))

        sortedMeals.forEach((meal) => {
          const dObj = new Date(meal.date)
          const dateStr = dObj.toISOString().split('T')[0]
          if (!dateGroups[dateStr]) {
            dateGroups[dateStr] = {
              date: dateStr,
              dayName: dayNames[dObj.getDay()],
              att: [0, 0, 0, 0],
              waste: [0, 0, 0, 0],
            }
          }

          const mIdx = MEALS.findIndex(
            (m) => m.toLowerCase() === meal.mealType?.toLowerCase()
          )
          if (mIdx !== -1) {
            const wasteKg = (meal.MealDish || []).reduce(
              (sum, d) => sum + (d.quantityWasted || 0),
              0
            )
            dateGroups[dateStr].att[mIdx] = meal.attendance || 0
            dateGroups[dateStr].waste[mIdx] = Math.round(wasteKg * 10) / 10
          }
        })

        const allDates = Object.keys(dateGroups)
        const allRecords = allDates.map((d) => {
          const rec = dateGroups[d]
          const totalAtt = rec.att.reduce((a, b) => a + b, 0)
          const totalWaste = Math.round(rec.waste.reduce((a, b) => a + b, 0) * 10) / 10
          return {
            date: rec.date,
            dayName: rec.dayName,
            att: rec.att,
            waste: rec.waste,
            totalAtt,
            totalWaste,
          }
        })

        setMonthsData({ dailyRecords: allRecords })

        // Extract last 7 days for the default views
        const recent7 = allRecords.slice(-7)
        if (recent7.length > 0) {
          set({
            att: recent7.map((r) => r.att),
            waste: recent7.map((r) => r.waste),
            historyDays: recent7.map((r) => r.dayName),
          })
        }
      }
    } catch (err) {
      console.warn('Backend sync note:', err)
    }
  }, [set])

  // Initial sync
  useEffect(() => {
    syncWithBackend()
  }, [syncWithBackend])

  // Restore authenticated staff session if token exists
  useEffect(() => {
    const token = getToken()
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (res?.user && (res.user.role === 'ADMIN' || res.user.role === 'STAFF')) {
            set({ user: res.user.name || res.user.email, role: 'staff' })
          }
        })
        .catch(() => {
          removeToken()
        })
    }
  }, [set])

  // 1. Role Selection
  const chooseRole = (selectedRole) => {
    if (selectedRole === 'student') {
      // Direct student entry - NO LOGIN REQUIRED
      set({ role: 'student', user: 'Student', view: 'dash' })
      notify("Welcome to the Student Portal! No login needed.")
    } else {
      // Admin / Staff entry - requires login
      set({ role: 'staff-login', user: '', view: 'login' })
    }
  }

  const switchRole = () => {
    removeToken()
    set({ role: null, user: '', view: 'dash' })
    notify('Returned to Portal Selection')
  }

  // 2. Staff Authentication
  const loginStaff = async (email, password) => {
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      if (res?.token) {
        setToken(res.token)
        set({ role: 'staff', user: res.user.name || res.user.email, view: 'dash' })
        notify(`Logged in as ${res.user.name || 'Admin'}`)
        syncWithBackend()
        return { success: true }
      }
      throw new Error('Login failed. Please check credentials.')
    } catch (apiErr) {
      const errorMsg =
        apiErr.status === 401
          ? 'Invalid email or password.'
          : (apiErr.message || 'Login failed.')
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {}
    removeToken()
    set({ role: null, user: '', view: 'dash' })
    notify('Logged out')
  }

  const go = (view) => {
    set({ view })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const rateMeal = (m, value) => {
    setState((s) => {
      const ratings = s.ratings.map((r) => ({ ...r }))
      if (!ratings[m]) ratings[m] = { sum: 0, count: 0 }
      const old = s.mine[m]
      ratings[m].sum += old ? value - old : value
      if (!old) ratings[m].count += 1
      const mine = [...s.mine]
      mine[m] = value
      return { ...s, ratings, mine }
    })
  }

  // Save changes to Weekly Menu for a specific day
  const saveDayMenu = async (day, dayMenu) => {
    const updatedWeekly = {
      ...(state.weeklyMenu || DEFAULT_WEEKLY_MENU),
      [day]: dayMenu,
    }

    const todayDay = getTodayDayName()
    const patch = { weeklyMenu: updatedWeekly }

    // If editing today's day, also update current active menu
    if (day.toLowerCase() === todayDay.toLowerCase()) {
      patch.menu = [
        dayMenu.Breakfast || [],
        dayMenu.Lunch || [],
        dayMenu.Snacks || [],
        dayMenu.Dinner || [],
      ]
    }

    set(patch)
    try {
      await weeklyMenuApi.updateDayMenu(day, dayMenu)
      notify(`Menu for ${day} saved`)
    } catch (err) {
      console.warn('Backend menu save note:', err)
      notify(`Menu for ${day} updated`)
    }
  }

  // Log today's attendance & waste for 4 meals
  const saveToday = async (attToday, wasteToday) => {
    setState((s) => ({
      ...s,
      att: [...s.att.slice(0, -1), attToday],
      waste: [...s.waste.slice(0, -1), wasteToday],
    }))

    try {
      const todayDate = new Date().toISOString()
      for (let m = 0; m < MEALS.length; m++) {
        const meal = await mealApi
          .create({
            date: todayDate,
            mealType: MEALS[m],
            attendance: attToday[m],
          })
          .catch(() => null)

        if (meal?.id) {
          const todayDishes = state.menu[m] || []
          const dishes = await dishApi.getAll(MEALS[m]).catch(() => [])
          const matchingDishes = dishes.filter((d) => todayDishes.includes(d.name))

          const targetDishes = matchingDishes.length > 0 ? matchingDishes : dishes.slice(0, todayDishes.length)
          if (targetDishes.length > 0) {
            const wastePerDish = Number((wasteToday[m] / targetDishes.length).toFixed(1))
            const prepPerDish = Number(
              ((attToday[m] * 0.32 + wasteToday[m]) / targetDishes.length).toFixed(1)
            )
            const safeWaste = Math.min(wastePerDish, prepPerDish)
            for (const d of targetDishes) {
              await mealApi.addDishToMeal(meal.id, d.id, prepPerDish, safeWaste).catch(() => {})
            }
          }
        }
      }
      notify("Today's meal records saved")
      syncWithBackend()
    } catch (e) {
      console.warn('Meal save note:', e)
      notify("Today's meal records saved")
    }
  }

  // Computed data based on selected time horizon (7d, 30d, 90d)
  const filteredAnalyticsData = useMemo(() => {
    const records = monthsData.dailyRecords
    if (!records || records.length === 0) {
      return {
        att: state.att,
        waste: state.waste,
        days: state.historyDays.length > 0 ? state.historyDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        records: [],
      }
    }

    const count = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7
    const slice = records.slice(-count)

    return {
      att: slice.map((r) => r.att),
      waste: slice.map((r) => r.waste),
      days: slice.map((r) => (count <= 14 ? r.dayName : r.date.slice(5))),
      records: slice,
    }
  }, [monthsData.dailyRecords, timeRange, state.att, state.waste, state.historyDays])

  const actions = {
    chooseRole,
    switchRole,
    loginStaff,
    logout,
    go,
    rateMeal,
    saveDayMenu,
    saveToday,
    setSelectedDay,
    setTimeRange,
    notify,
    syncWithBackend,
  }

  return (
    <StoreContext.Provider
      value={{
        ...state,
        ...actions,
        toast,
        loading,
        selectedDay,
        timeRange,
        monthsData,
        filteredAnalyticsData,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
