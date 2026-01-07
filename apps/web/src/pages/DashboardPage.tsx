import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { Check, Plus, Trash2, LogOut } from 'lucide-react'

interface Habit {
  id: string
  name: string
  description: string
  completed_today: boolean
  streak: number
  created_at: string
}

export default function DashboardPage({ user }: { user: User }) {
  const navigate = useNavigate()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [user.id])

  const loadHabits = async () => {
    try {
      setLoading(true)
      // For demo, we'll use localStorage instead of database
      const storedHabits = localStorage.getItem(`habits_${user.id}`)
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits))
      }
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveHabits = (newHabits: Habit[]) => {
    localStorage.setItem(`habits_${user.id}`, JSON.stringify(newHabits))
    setHabits(newHabits)
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      description: newHabitDescription,
      completed_today: false,
      streak: 0,
      created_at: new Date().toISOString(),
    }

    saveHabits([...habits, newHabit])
    setNewHabitName('')
    setNewHabitDescription('')
    setShowForm(false)
  }

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id
        ? {
            ...habit,
            completed_today: !habit.completed_today,
            streak: !habit.completed_today ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          }
        : habit
    )
    saveHabits(updatedHabits)
  }

  const deleteHabit = (id: string) => {
    saveHabits(habits.filter((h) => h.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Habit Tracker</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Habits</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{habits.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Completed Today</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {habits.filter((h) => h.completed_today).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Best Streak</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">
              {Math.max(0, ...habits.map((h) => h.streak))}
            </p>
          </div>
        </div>

        {/* Add Habit Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add New Habit
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="e.g., 30 minutes of exercise"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addHabit}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Habit
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setNewHabitName('')
                    setNewHabitDescription('')
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="text-center text-gray-600">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No habits yet. Add one to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{habit.streak}</p>
                  </div>
                  <div className="w-px bg-gray-200 mx-3 h-12"></div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <p className={`text-sm font-medium ${habit.completed_today ? 'text-green-600' : 'text-gray-600'}`}>
                      {habit.completed_today ? 'Done' : 'Pending'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    habit.completed_today
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Check size={18} />
                  {habit.completed_today ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
