'use client'

import { useEffect, useCallback } from 'react'
import { supabase, isDemoMode } from './supabase'
import { useApp } from './store'

export function useRealtime() {
  const { refreshData } = useApp()

  useEffect(() => {
    if (isDemoMode || !supabase) return

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Tasks changed:', payload)
          refreshData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('Comments changed:', payload)
          refreshData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists'
        },
        (payload) => {
          console.log('Lists changed:', payload)
          refreshData()
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(tasksChannel)
    }
  }, [refreshData])
}
