'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, signIn, signUp, signOut, getCurrentUser } from './auth'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, Workspace } from './types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  workspaces: (Workspace & { role: string })[]
  isLoading: boolean
  isDemoMode: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshWorkspaces: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [workspaces, setWorkspaces] = useState<(Workspace & { role: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isDemoMode = !supabase

  const refreshProfile = async () => {
    if (!supabase || !user) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  const refreshWorkspaces = async () => {
    if (!supabase || !user) return
    const { data } = await supabase
      .from('workspace_members')
      .select('role, workspaces(*)')
      .eq('user_id', user.id)
    setWorkspaces((data?.map(d => ({ ...d.workspaces, role: d.role })) || []) as unknown as (Workspace & { role: string })[])
  }

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshProfile()
        refreshWorkspaces()
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await refreshProfile()
        await refreshWorkspaces()
      } else {
        setProfile(null)
        setWorkspaces([])
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    await signIn(email, password)
  }

  const register = async (email: string, password: string, name: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    await signUp(email, password, name)
  }

  const logout = async () => {
    if (!supabase) throw new Error('Supabase not configured')
    await signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      workspaces,
      isLoading,
      isDemoMode,
      login,
      register,
      logout,
      refreshProfile,
      refreshWorkspaces,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
