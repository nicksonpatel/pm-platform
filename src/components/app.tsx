'use client'

import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { ProjectHeader } from '@/components/layout/project-header'
import { WelcomeScreen } from '@/components/layout/welcome-screen'
import { BoardView } from '@/components/board/board-view'
import { ListView } from '@/components/board/list-view'
import { CalendarView } from '@/components/board/calendar-view'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { currentProject, view } = useApp()
  const { isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-screen bg-slate-100 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentProject ? (
          <>
            <ProjectHeader />
            {view === 'board' && <BoardView />}
            {view === 'list' && <ListView />}
            {view === 'calendar' && <CalendarView />}
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  )
}

export default function App() {
  return <AppContent />
}
