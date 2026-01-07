import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './services/supabase'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Habit Tracker</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Habit Tracker</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Habit Tracker</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h2>
          <p className="text-gray-600">Your habit tracking dashboard</p>
        </div>
      </div>
    </div>
  )
}
