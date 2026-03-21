import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const navigate = useNavigate()

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user)
  })
}, [])

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [darkMode])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">

    {/* Sidebar */}
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6 text-xl font-bold tracking-tight">⚡ SaaS Starter</div>
      <nav className="flex-1 px-4 space-y-1">
        {['home', 'profile', 'settings'].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`w-full text-left px-4 py-2.5 rounded-lg capitalize text-sm font-medium transition ${
              activePage === page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {page}
          </button>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </aside>

    {/* Main content */}
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Topbar */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold capitalize">{activePage}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activePage === 'home' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back 👋</h2>
            <p className="text-gray-500 dark:text-gray-400">You're logged in as {user?.email}</p>
          </div>
        )}
        {activePage === 'profile' && (
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Email</label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">User ID</label>
                <p className="text-sm font-mono text-gray-500">{user?.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Last Sign In</label>
                <p className="text-sm">{new Date(user?.last_sign_in_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        {activePage === 'settings' && (
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
)
}