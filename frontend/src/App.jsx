import { useStore } from './store'
import PortalLanding from './pages/PortalLanding'
import Header from './components/Header'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import WeeklyMenu from './pages/WeeklyMenu'
import { StudentDashboard, TodaysMenu, MealRatings } from './pages/Student'
import { StaffDashboard, MenuUpdate, MealData } from './pages/Staff'

export default function App() {
  const { role, view, toast } = useStore()

  // If no role chosen or in staff login screen, show Portal Landing
  if (!role || role === 'staff-login') {
    return <PortalLanding />
  }

  const pages = {
    student: {
      dash: <StudentDashboard />,
      weekly: <WeeklyMenu />,
      menu: <TodaysMenu />,
      ratings: <MealRatings />,
    },
    staff: {
      dash: <StaffDashboard />,
      weekly: <WeeklyMenu />,
      edit: <MenuUpdate />,
      data: <MealData />,
      an: <Analytics />,
      profile: <Profile />,
    },
  }

  const currentView = pages[role]?.[view] || pages[role]?.dash

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-dark-bg text-brand-ink dark:text-brand-dark-ink flex flex-col font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-16">
        {currentView}
      </main>

      {/* Sleek Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-brand-green text-white text-xs sm:text-sm font-medium shadow-lg shadow-emerald-950/20 flex items-center gap-2 animate-bounce transition-all duration-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
