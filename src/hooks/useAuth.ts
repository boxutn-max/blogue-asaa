import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('admin_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    // Mock authentication - in real app, use Supabase
    if (email === 'admin@asa.ma' && password === 'admin123') {
      const mockUser = {
        id: '1',
        email: 'admin@asa.ma',
        name: 'Admin User',
        role: 'admin'
      }
      setUser(mockUser)
      localStorage.setItem('admin_user', JSON.stringify(mockUser))
      setLoading(false)
      return { data: mockUser, error: null }
    } else {
      setLoading(false)
      return { data: null, error: { message: 'Invalid credentials' } }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('admin_user')
    return { error: null }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}