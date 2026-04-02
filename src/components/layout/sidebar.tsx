'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROJECT_COLORS, PROJECT_ICONS } from '@/lib/types'
import { LayoutGrid, Plus, FolderOpen, ChevronRight, Settings, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Sidebar() {
  const { 
    workspaces, projects, currentWorkspace, currentProject,
    setCurrentWorkspace, setCurrentProject, addWorkspace, addProject
  } = useApp()
  const [newWsOpen, setNewWsOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [wsName, setWsName] = useState('')
  const [wsDesc, setWsDesc] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0])
  const [projectIcon, setProjectIcon] = useState(PROJECT_ICONS[0])

  const filteredProjects = projects.filter(p => p.workspace_id === currentWorkspace?.id)

  const handleCreateWs = async () => {
    if (!wsName.trim()) return
    await addWorkspace(wsName, wsDesc)
    setWsName('')
    setWsDesc('')
    setNewWsOpen(false)
  }

  const handleCreateProject = async () => {
    if (!projectName.trim() || !currentWorkspace) return
    await addProject(currentWorkspace.id, projectName, projectDesc, projectColor, projectIcon)
    setProjectName('')
    setProjectDesc('')
    setProjectColor(PROJECT_COLORS[0])
    setProjectIcon(PROJECT_ICONS[0])
    setNewProjectOpen(false)
  }

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-lg">PM Platform</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-indigo-600 text-white text-sm">DU</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-slate-400 truncate">demo@example.com</p>
          </div>
        </div>
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Workspaces</span>
          <Dialog open={newWsOpen} onOpenChange={setNewWsOpen}>
            <DialogTrigger>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-slate-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={wsName} onChange={e => setWsName(e.target.value)} placeholder="My Workspace" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={wsDesc} onChange={e => setWsDesc(e.target.value)} placeholder="Optional description" />
                </div>
                <Button onClick={handleCreateWs} className="w-full">Create Workspace</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1">
          {workspaces.map(ws => (
            <div key={ws.id}>
              <button
                onClick={() => setCurrentWorkspace(ws)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentWorkspace?.id === ws.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {ws.name[0]}
                </div>
                <span className="flex-1 text-left truncate">{ws.name}</span>
              </button>

              {/* Projects under workspace */}
              {currentWorkspace?.id === ws.id && (
                <div className="ml-4 mt-1 space-y-1">
                  {filteredProjects.filter(p => p.workspace_id === ws.id).map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => setCurrentProject(proj)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentProject?.id === proj.id 
                          ? 'bg-slate-700 text-white' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" style={{ color: proj.color }} />
                      <span className="flex-1 text-left truncate">{proj.icon} {proj.name}</span>
                    </button>
                  ))}

                  <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                    <DialogTrigger>
                      <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Project</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project Name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="Optional description" />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <div className="flex flex-wrap gap-2">
                            {PROJECT_ICONS.map(icon => (
                              <button
                                key={icon}
                                onClick={() => setProjectIcon(icon)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                                  projectIcon === icon ? 'bg-slate-800 ring-2 ring-indigo-500' : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex flex-wrap gap-2">
                            {PROJECT_COLORS.map(color => (
                              <button
                                key={color}
                                onClick={() => setProjectColor(color)}
                                className={`w-8 h-8 rounded-full transition-all ${
                                  projectColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleCreateProject} className="w-full">Create Project</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  )
}
