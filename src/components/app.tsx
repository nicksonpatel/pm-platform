'use client'

import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
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
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        {currentProject ? (
          <>
            <ProjectHeader />
            <div className="pb-20 md:pb-0">
              {view === 'board' && <BoardView />}
              {view === 'list' && <ListView />}
              {view === 'calendar' && <CalendarView />}
            </div>
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
