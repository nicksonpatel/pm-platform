'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Workspace, Project, List, Task, Comment } from './types'
import { supabase, isDemoMode } from './supabase'
import { mockWorkspaces, mockProjects, mockLists, mockTasks, mockComments, DEMO_USER } from './mock-data'

interface AppState {
  workspaces: Workspace[]
  projects: Project[]
  lists: List[]
  tasks: Task[]
  comments: Comment[]
  currentWorkspace: Workspace | null
  currentProject: Project | null
  currentList: List | null
  isLoading: boolean
  view: 'list' | 'board' | 'calendar'
}

interface AppContextType extends AppState {
  setCurrentWorkspace: (w: Workspace | null) => void
  setCurrentProject: (p: Project | null) => void
  setCurrentList: (l: List | null) => void
  setView: (v: 'list' | 'board' | 'calendar') => void
  addWorkspace: (name: string, description: string) => Promise<void>
  addProject: (workspaceId: string, name: string, description: string, color: string, icon: string) => Promise<void>
  addList: (projectId: string, name: string) => Promise<void>
  addTask: (listId: string, title: string, description?: string, priority?: Task['priority']) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newListId: string, newPosition: number) => Promise<void>
  addComment: (taskId: string, content: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    workspaces: mockWorkspaces,
    projects: mockProjects,
    lists: mockLists,
    tasks: mockTasks,
    comments: mockComments,
    currentWorkspace: mockWorkspaces[0] || null,
    currentProject: null,
    currentList: null,
    isLoading: false,
    view: 'board',
  })

  const refreshData = useCallback(async () => {
    if (isDemoMode || !supabase) return
    
    setState(s => ({ ...s, isLoading: true }))
    try {
      const [workspaces, projects, lists, tasks, comments] = await Promise.all([
        supabase.from('workspaces').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('lists').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('comments').select('*'),
      ])

      setState(s => ({
        ...s,
        workspaces: workspaces.data || [],
        projects: projects.data || [],
        lists: lists.data || [],
        tasks: tasks.data || [],
        comments: comments.data || [],
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error refreshing data:', error)
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const setCurrentWorkspace = useCallback((w: Workspace | null) => {
    setState(s => ({ ...s, currentWorkspace: w, currentProject: null, currentList: null }))
  }, [])

  const setCurrentProject = useCallback((p: Project | null) => {
    setState(s => ({ ...s, currentProject: p, currentList: null }))
  }, [])

  const setCurrentList = useCallback((l: List | null) => {
    setState(s => ({ ...s, currentList: l }))
  }, [])

  const setView = useCallback((v: 'list' | 'board' | 'calendar') => {
    setState(s => ({ ...s, view: v }))
  }, [])

  const addWorkspace = useCallback(async (name: string, description: string) => {
    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, workspaces: [...s.workspaces, newWorkspace] }))
      return
    }

    await supabase.from('workspaces').insert(newWorkspace)
    setState(s => ({ ...s, workspaces: [...s.workspaces, newWorkspace] }))
  }, [])

  const addProject = useCallback(async (workspaceId: string, name: string, description: string, color: string, icon: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      name,
      description,
      color,
      icon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, projects: [...s.projects, newProject] }))
      return
    }

    await supabase.from('projects').insert(newProject)
    setState(s => ({ ...s, projects: [...s.projects, newProject] }))
  }, [])

  const addList = useCallback(async (projectId: string, name: string) => {
    const newList: List = {
      id: crypto.randomUUID(),
      project_id: projectId,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, lists: [...s.lists, newList] }))
      return
    }

    await supabase.from('lists').insert(newList)
    setState(s => ({ ...s, lists: [...s.lists, newList] }))
  }, [])

  const addTask = useCallback(async (listId: string, title: string, description = '', priority: Task['priority'] = 'medium') => {
    const listTasks = state.tasks.filter(t => t.list_id === listId)
    const newTask: Task = {
      id: crypto.randomUUID(),
      list_id: listId,
      title,
      description,
      status: 'todo',
      priority,
      due_date: null,
      assignee_id: null,
      assignee_name: null,
      assignee_avatar: null,
      position: listTasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Always update local state first (optimistic update)
    setState(s => ({ ...s, tasks: [...s.tasks, newTask] }))

    if (isDemoMode || !supabase) {
      return
    }

    // Try to persist to Supabase
    const { error } = await supabase.from('tasks').insert(newTask)
    if (error) {
      console.error('Failed to save task to Supabase:', error.message)
      // Rollback local state on error
      setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== newTask.id) }))
    }
  }, [state.tasks])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (isDemoMode || !supabase) {
      setState(s => ({
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)
      }))
      return
    }

    await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId)
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)
    }))
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== taskId), comments: s.comments.filter(c => c.task_id !== taskId) }))
      return
    }

    await supabase.from('tasks').delete().eq('id', taskId)
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== taskId), comments: s.comments.filter(c => c.task_id !== taskId) }))
  }, [])

  const moveTask = useCallback(async (taskId: string, newListId: string, newPosition: number) => {
    if (isDemoMode || !supabase) {
      setState(s => ({
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, list_id: newListId, position: newPosition } : t)
      }))
      return
    }

    await supabase.from('tasks').update({ list_id: newListId, position: newPosition }).eq('id', taskId)
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, list_id: newListId, position: newPosition } : t)
    }))
  }, [])

  const addComment = useCallback(async (taskId: string, content: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: DEMO_USER.id,
      user_name: DEMO_USER.name,
      user_avatar: null,
      content,
      created_at: new Date().toISOString(),
    }

    if (isDemoMode || !supabase) {
      setState(s => ({ ...s, comments: [...s.comments, newComment] }))
      return
    }

    await supabase.from('comments').insert(newComment)
    setState(s => ({ ...s, comments: [...s.comments, newComment] }))
  }, [])

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentWorkspace,
      setCurrentProject,
      setCurrentList,
      setView,
      addWorkspace,
      addProject,
      addList,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addComment,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
