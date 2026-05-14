import { NavLink, Outlet } from 'react-router-dom'
import { useInterviewPrep } from '../context/InterviewPrepContext'

export function Layout() {
  const { data, setDarkMode } = useInterviewPrep()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold tracking-tight text-teal-950 dark:text-teal-50">
              Interview Prep
            </span>
            <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/story"
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
                }
              >
                Story
              </NavLink>
              <NavLink
                to="/coding"
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
                }
              >
                Coding
              </NavLink>
              <NavLink
                to="/system-design"
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
                }
              >
                System design
              </NavLink>
              <NavLink
                to="/career"
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
                }
              >
                Career
              </NavLink>
            </nav>
          </div>
          <button
            type="button"
            className="app-btn-secondary self-start sm:self-auto"
            onClick={() => setDarkMode(!data.darkMode)}
          >
            {data.darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
