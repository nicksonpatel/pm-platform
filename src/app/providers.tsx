'use client'

import { AuthProvider } from '@/lib/auth-context'
import { AppProvider } from '@/lib/store'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          {children}
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  )
}
