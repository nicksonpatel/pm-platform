'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { inviteToWorkspace, getPendingInvites } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Users, Copy, CheckCircle, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useEffect } from 'react'

interface InviteModalProps {
  workspaceId: string
  workspaceName: string
}

export function InviteModal({ workspaceId, workspaceName }: InviteModalProps) {
  const { user } = useAuth()
  const { refreshData } = useApp()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])

  const loadPendingInvites = async () => {
    const invites = await getPendingInvites(workspaceId)
    setPendingInvites(invites)
  }

  useEffect(() => {
    if (open) {
      loadPendingInvites()
    }
  }, [open, workspaceId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setError('')
    setSuccess('')
    setIsLoading(true)
    
    try {
      const invite = await inviteToWorkspace(workspaceId, email, role, user.id)
      
      // Generate invite link
      const inviteLink = `${window.location.origin}/invite/${invite.token}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      
      setSuccess(`Invite sent! Link copied to clipboard.`)
      setEmail('')
      await loadPendingInvites()
    } catch (err: any) {
      setError(err.message || 'Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="gap-1">
          <Users className="w-4 h-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {workspaceName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label>Email address</Label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>Sending...</>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Invite
              </>
            )}
          </Button>
        </form>

        {pendingInvites.length > 0 && (
          <div className="border-t pt-4">
            <Label className="text-xs uppercase text-slate-500 mb-2 block">
              Pending Invites ({pendingInvites.length})
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-slate-500">
                      {invite.role} · {invite.token.slice(0, 8)}...
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
