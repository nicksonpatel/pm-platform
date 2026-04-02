'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { acceptInvite } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, LayoutGrid } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const { user, isLoading: authLoading } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      // Redirect to auth page with invite token stored
      sessionStorage.setItem('invite_token', token)
      router.push('/auth')
      return
    }

    handleAccept()
  }, [user, authLoading, token])

  const handleAccept = async () => {
    try {
      const workspace = await acceptInvite(token, user!.id)
      setWorkspaceName(workspace?.name || 'Workspace')
      setStatus('success')
      setTimeout(() => router.push('/'), 2000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Failed to accept invite')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Accepting Invite...'}
            {status === 'success' && 'You\'re In!'}
            {status === 'error' && 'Invite Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Joining workspace...'}
            {status === 'success' && `You've joined ${workspaceName}!`}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === 'loading' && <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}
          {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
          {status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
        </CardContent>
      </Card>
    </div>
  )
}
