'use client'

import { useApp } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutGrid, FolderOpen, Plus, ArrowRight } from 'lucide-react'

export function WelcomeScreen() {
  const { currentWorkspace, workspaces, projects, setCurrentProject } = useApp()

  const wsProjects = projects.filter(p => p.workspace_id === currentWorkspace?.id)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {currentWorkspace ? `Welcome to ${currentWorkspace.name}` : 'Select a Workspace'}
        </h1>
        <p className="text-slate-500 max-w-md">
          Choose a project from the sidebar to get started, or create a new one.
        </p>
      </div>

      {currentWorkspace && wsProjects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 max-w-4xl w-full">
          {wsProjects.slice(0, 6).map(project => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all"
              onClick={() => setCurrentProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{project.icon}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="text-xs mt-1 line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentWorkspace && wsProjects.length === 0 && (
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No projects in this workspace yet.</p>
            <p className="text-sm text-slate-400">
              Click the "Add Project" button in the sidebar to create one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
