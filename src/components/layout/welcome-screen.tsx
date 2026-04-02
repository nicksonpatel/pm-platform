'use client'

import { useApp } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutGrid, FolderOpen, Plus, ArrowRight } from 'lucide-react'

export function WelcomeScreen() {
  const { currentWorkspace, workspaces, projects, setCurrentProject } = useApp()

  const wsProjects = projects.filter(p => p.workspace_id === currentWorkspace?.id)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-50">
      <div className="text-center mb-6 md:mb-8">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
          {currentWorkspace ? `Welcome to ${currentWorkspace.name}` : 'Select a Workspace'}
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-md px-4">
          Choose a project from the sidebar to get started, or create a new one.
        </p>
      </div>

      {currentWorkspace && wsProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl px-2">
          {wsProjects.slice(0, 6).map(project => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all p-4 touch-manipulation"
              onClick={() => setCurrentProject(project)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{project.icon}</span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
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
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-8 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No projects in this workspace yet.</p>
            <p className="text-sm text-slate-400">
              Tap the menu icon in the top left to add a project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
