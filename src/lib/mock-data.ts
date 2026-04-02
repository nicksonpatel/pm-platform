import { Workspace, Project, List, Task, Comment } from './types'

export const mockWorkspaces: Workspace[] = [
  { id: '1', name: 'Personal', description: 'Personal projects', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Work', description: 'Work projects', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockProjects: Project[] = [
  { id: '1', workspace_id: '1', name: 'Website Redesign', description: 'Redesign company website', color: '#6366f1', icon: '🌐', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', workspace_id: '1', name: 'Mobile App', description: 'iOS/Android app', color: '#ec4899', icon: '📱', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', workspace_id: '1', name: 'Marketing', description: 'Marketing campaigns', color: '#22c55e', icon: '📊', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', workspace_id: '2', name: 'Q1 Goals', description: 'Q1 2024 objectives', color: '#f97316', icon: '🎯', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockLists: List[] = [
  { id: '1', project_id: '1', name: 'Backlog', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', project_id: '1', name: 'In Progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', project_id: '1', name: 'Review', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', project_id: '1', name: 'Done', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', project_id: '2', name: 'Backlog', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', project_id: '2', name: 'In Progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', project_id: '2', name: 'Done', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockTasks: Task[] = [
  { id: '1', list_id: '1', title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups', status: 'done', priority: 'high', due_date: '2026-04-05', assignee_id: '1', assignee_name: 'Alex', assignee_avatar: null, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', list_id: '1', title: 'Setup Next.js project', description: 'Initialize with TypeScript and Tailwind', status: 'done', priority: 'medium', due_date: '2026-04-03', assignee_id: '2', assignee_name: 'Sam', assignee_avatar: null, position: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', list_id: '2', title: 'Implement navigation', description: 'Header, footer, and sidebar navigation', status: 'in_progress', priority: 'high', due_date: '2026-04-08', assignee_id: '1', assignee_name: 'Alex', assignee_avatar: null, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', list_id: '2', title: 'Create landing page sections', description: 'Hero, features, pricing, testimonials', status: 'in_progress', priority: 'high', due_date: '2026-04-10', assignee_id: '2', assignee_name: 'Sam', assignee_avatar: null, position: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', list_id: '3', title: 'Review color palette', description: 'Check accessibility and brand alignment', status: 'in review', priority: 'medium', due_date: '2026-04-06', assignee_id: '1', assignee_name: 'Alex', assignee_avatar: null, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', list_id: '1', title: 'Setup analytics', description: 'Google Analytics 4 integration', status: 'todo', priority: 'low', due_date: '2026-04-15', assignee_id: null, assignee_name: null, assignee_avatar: null, position: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', list_id: '5', title: 'Design app icon', description: 'iOS and Android app icons', status: 'todo', priority: 'medium', due_date: '2026-04-12', assignee_id: '1', assignee_name: 'Alex', assignee_avatar: null, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', list_id: '6', title: 'Setup React Native project', description: 'Initialize with Expo', status: 'in_progress', priority: 'high', due_date: '2026-04-07', assignee_id: '2', assignee_name: 'Sam', assignee_avatar: null, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockComments: Comment[] = [
  { id: '1', task_id: '3', user_id: '2', user_name: 'Sam', user_avatar: null, content: 'Started working on this. Will have a PR ready by tomorrow.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', task_id: '3', user_id: '1', user_name: 'Alex', user_avatar: null, content: 'Great! Make sure to include the mobile responsive breakpoints.', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: '3', task_id: '5', user_id: '1', user_name: 'Alex', user_avatar: null, content: 'The blue shades need to be adjusted for WCAG AA compliance.', created_at: new Date(Date.now() - 7200000).toISOString() },
]

// Demo user
export const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@example.com',
}
