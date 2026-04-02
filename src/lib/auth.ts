import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

export const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Auth helpers
export async function signUp(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })
  
  if (error) throw error
  
  // Create workspace for new user
  if (data.user) {
    await createPersonalWorkspace(data.user.id, fullName)
  }
  
  return data
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Workspace helpers
export async function createPersonalWorkspace(userId: string, userName: string) {
  if (!supabase) return null
  
  // Create workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: 'Personal', description: 'My personal workspace' })
    .select()
    .single()
  
  if (wsError) throw wsError
  
  // Add user as owner
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: 'owner'
  })
  
  // Create default lists for a sample project
  const { data: project } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspace.id,
      name: 'My First Project',
      description: 'Welcome to your new project!',
      color: '#6366f1',
      icon: '📁'
    })
    .select()
    .single()
  
  if (project) {
    const lists = ['Backlog', 'In Progress', 'Review', 'Done']
    for (const name of lists) {
      await supabase.from('lists').insert({ project_id: project.id, name })
    }
  }
  
  return workspace
}

export async function getUserWorkspaces(userId: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      role,
      workspaces (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data?.map(d => ({ ...d.workspaces, role: d.role })) || []
}

export async function inviteToWorkspace(workspaceId: string, email: string, role: string, invitedBy: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const token = crypto.randomUUID()
  
  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      invited_by: invitedBy,
      token
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function acceptInvite(token: string, userId: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  // Get invite
  const { data: invite, error: inviteError } = await supabase
    .from('workspace_invites')
    .select('*, workspaces(name)')
    .eq('token', token)
    .single()
  
  if (inviteError || !invite) throw new Error('Invalid invite')
  if (invite.accepted) throw new Error('Invite already accepted')
  if (new Date(invite.expires_at) < new Date()) throw new Error('Invite expired')
  
  // Add user to workspace
  await supabase.from('workspace_members').insert({
    workspace_id: invite.workspace_id,
    user_id: userId,
    role: invite.role
  })
  
  // Mark invite as accepted
  await supabase.from('workspace_invites').update({ accepted: true }).eq('id', invite.id)
  
  return invite.workspaces
}

export async function getWorkspaceMembers(workspaceId: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      role,
      user_profiles (id, email, full_name, avatar_url)
    `)
    .eq('workspace_id', workspaceId)
  
  if (error) throw error
  return (data?.map(d => ({
    ...(d.user_profiles as any),
    role: d.role,
    user_id: (d.user_profiles as any).id
  })) || []) as any[]
}

export async function getPendingInvites(workspaceId: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('accepted', false)
  
  if (error) throw error
  return data || []
}
