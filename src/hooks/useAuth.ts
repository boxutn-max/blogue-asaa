import { useState, useEffect } from 'react'
import { authAPI } from '@/lib/api'
import type { Profile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user, profile } = await authAPI.getCurrentUser()
      setAuthState({
        user,
        profile,
        loading: false
      })
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { profile } = await authAPI.getCurrentUser()
          setAuthState({
            user: session.user,
            profile,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await authAPI.signIn(email, password)
    
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { data: null, error }
    }

    // Get profile
    const { profile } = await authAPI.getCurrentUser()
    setAuthState({
      user: data.user,
      profile,
      loading: false
    })

    return { data, error: null }
  }

  const signOut = async () => {
    const { error } = await authAPI.signOut()
    
    if (!error) {
      setAuthState({
        user: null,
        profile: null,
        loading: false
      })
    }
    
    return { error }
  }

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    signIn,
    signOut,
  }
}