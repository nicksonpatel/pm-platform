export interface Workspace {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  workspace_id: string
  name: string
  description: string | null
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  project_id: string
  name: string
  created_at: string
  updated_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'in review' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  list_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  assignee_id: string | null
  assignee_name: string | null
  assignee_avatar: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  content: string
  created_at: string
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': 'bg-slate-100 text-slate-700',
  'in_progress': 'bg-blue-100 text-blue-700',
  'in review': 'bg-yellow-100 text-yellow-700',
  'done': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'low': 'bg-slate-400 text-white',
  'medium': 'bg-blue-500 text-white',
  'high': 'bg-orange-500 text-white',
  'urgent': 'bg-red-600 text-white',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'in review': 'In Review',
  'done': 'Done',
  'cancelled': 'Cancelled',
}

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6b7280', '#1e293b'
]

export const PROJECT_ICONS = [
  '📁', '🚀', '💼', '🎯', '💡', '🔧', '📊', '🎨',
  '🏗️', '📱', '🌐', '🔒', '📝', '⭐', '🔥', '💰'
]
