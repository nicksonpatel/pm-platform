'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PROJECT_COLORS, PROJECT_ICONS } from '@/lib/types'
import {
  LayoutGrid,
  Plus,
  FolderOpen,
  Settings,
  LogOut,
  User,
  LogIn,
  Loader2,
  Menu,
  Home,
  ListTodo,
  Calendar,
  Users,
  ChevronLeft,
  X
} from 'lucide-react'

export function MobileNav() {
  const { user, profile, logout, isLoading: authLoading, isDemoMode } = useAuth()
  const {
    workspaces,
    projects,
    currentWorkspace,
    currentProject,
    setCurrentWorkspace,
    setCurrentProject,
    addWorkspace,
    addProject
  } = useApp()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0])
  const [projectIcon, setProjectIcon] = useState(PROJECT_ICONS[0])

  const filteredProjects = projects.filter(p => p.workspace_id === currentWorkspace?.id)

  const handleCreateProject = async () => {
    if (!projectName.trim() || !currentWorkspace) return
    await addProject(currentWorkspace.id, projectName, projectDesc, projectColor, projectIcon)
    setProjectName('')
    setProjectDesc('')
    setNewProjectOpen(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-indigo-500" />
                      <span className="font-bold text-lg">PM Platform</span>
                    </div>
                  </div>
                </div>

                {/* User */}
                <div className="p-4 border-b">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {profile?.full_name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile?.full_name || user.email}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleLogout} className="w-8 h-8">
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Link href="/auth" onClick={() => setSidebarOpen(false)}>
                      <Button className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Workspaces & Projects */}
                <div className="flex-1 overflow-y-auto p-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase px-3 mb-2">Workspaces</p>
                  {workspaces.map(ws => (
                    <div key={ws.id}>
                      <button
                        onClick={() => {
                          setCurrentWorkspace(ws)
                          setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          currentWorkspace?.id === ws.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                          {ws.name[0]}
                        </div>
                        <span className="flex-1 text-left font-medium">{ws.name}</span>
                      </button>

                      {currentWorkspace?.id === ws.id && (
                        <div className="ml-4 space-y-1">
                          {filteredProjects.map(proj => (
                            <button
                              key={proj.id}
                              onClick={() => {
                                setCurrentProject(proj)
                                setSidebarOpen(false)
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentProject?.id === proj.id
                                  ? 'bg-slate-200'
                                  : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              <span style={{ color: proj.color }}>{proj.icon}</span>
                              <span className="flex-1 text-left truncate">{proj.name}</span>
                            </button>
                          ))}
                          {user && (
                            <button
                              onClick={() => setNewProjectOpen(true)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Plus className="w-4 h-4" />
                              Add Project
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {currentProject ? (
              <>
                <span className="text-xl">{currentProject.icon}</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {currentProject.name}
                </span>
              </>
            ) : (
              <span className="font-bold text-slate-800">PM Platform</span>
            )}
          </div>
        </div>

        {user && currentWorkspace && (
          <Link href="/auth">
            <Button size="sm" variant="outline" className="gap-1">
              <Users className="w-4 h-4" />
              Invite
            </Button>
          </Link>
        )}
      </div>

      {/* Bottom Tab Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-40">
        <div className="flex items-center justify-around h-full">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 w-16 h-full">
            <Home className="w-5 h-5 text-slate-500" />
            <span className="text-[10px] text-slate-500">Home</span>
          </Link>

          {currentProject && (
            <>
              <button className="flex flex-col items-center justify-center gap-1 w-16 h-full">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
                <span className="text-[10px] text-indigo-600 font-medium">Board</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-1 w-16 h-full">
                <ListTodo className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] text-slate-500">List</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-1 w-16 h-full">
                <Calendar className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] text-slate-500">Calendar</span>
              </button>
            </>
          )}

          <button className="flex flex-col items-center justify-center gap-1 w-16 h-full">
            <User className="w-5 h-5 text-slate-500" />
            <span className="text-[10px] text-slate-500">Profile</span>
          </button>
        </div>
      </div>

      {/* New Project Sheet */}
      <Sheet open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <SheetContent className="w-full">
          <div className="flex flex-col gap-4 mt-8">
            <h2 className="text-lg font-semibold">Create Project</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="Project Name"
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setProjectIcon(icon)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
                        projectIcon === icon ? 'bg-slate-800 ring-2 ring-indigo-500' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setProjectColor(color)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        projectColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateProject} className="w-full">
                Create Project
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
