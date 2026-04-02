'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/store'
import { getWorkspaceMembers } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { User, Search, X } from 'lucide-react'
import { Task } from '@/lib/types'

interface Assignee {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface AssigneePickerProps {
  task: Task
  onAssign: (userId: string | null, userName: string | null) => void
}

export function AssigneePicker({ task, onAssign }: AssigneePickerProps) {
  const { currentWorkspace } = useApp()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<Assignee[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && currentWorkspace) {
      loadMembers()
    }
  }, [open, currentWorkspace])

  const loadMembers = async () => {
    if (!currentWorkspace) return
    setLoading(true)
    try {
      const workspaceMembers = await getWorkspaceMembers(currentWorkspace.id)
      setMembers(workspaceMembers as Assignee[])
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (member: Assignee | null) => {
    if (member) {
      onAssign(member.id, member.full_name || member.email)
    } else {
      onAssign(null, null)
    }
    setOpen(false)
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.slice(0, 2).toUpperCase()
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div>
      <Label className="text-xs text-slate-500 uppercase mb-2 block">Assignee</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            className="w-full justify-start h-10 text-sm font-normal"
          >
            {task.assignee_name ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                    {getInitials(task.assignee_name, task.assignee_id || '')}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee_name}</span>
              </div>
            ) : (
              <>
                <User className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-slate-400">Unassigned</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {/* Unassign option */}
            <button
              onClick={() => handleSelect(null)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-slate-200 text-slate-600">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-400">Unassigned</p>
              </div>
            </button>

            {loading && (
              <div className="px-3 py-4 text-center text-sm text-slate-400">
                Loading members...
              </div>
            )}

            {!loading && filteredMembers.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-slate-400">
                No members found
              </div>
            )}

            {filteredMembers.map(member => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors ${
                  task.assignee_id === member.id ? 'bg-indigo-50' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                    {getInitials(member.full_name, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.full_name || member.email}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
