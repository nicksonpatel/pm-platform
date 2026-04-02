'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Task, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS, TaskStatus, TaskPriority } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { MoreHorizontal, Calendar as CalendarIcon, MessageSquare, User, Flag, Trash2 } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, addComment, comments } = useApp()
  const [detailOpen, setDetailOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)

  const taskComments = comments.filter(c => c.task_id === task.id)
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTask(task.id, { status })
  }

  const handlePriorityChange = async (priority: TaskPriority) => {
    await updateTask(task.id, { priority })
  }

  const handleDueDateChange = async (date: Date | null) => {
    await updateTask(task.id, { due_date: date?.toISOString().split('T')[0] || null })
  }

  const handleTitleSave = async () => {
    if (title.trim()) {
      await updateTask(task.id, { title: title.trim() })
    }
    setEditingTitle(false)
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    await addComment(task.id, comment)
    setComment('')
  }

  const formatDueDate = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'MMM d')
  }

  return (
    <>
      <Card 
        className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => setDetailOpen(true)}
      >
        {/* Priority + Status */}
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <Button variant="ghost" size="icon" className="w-5 h-5 -mr-1 -mt-1" onClick={e => e.stopPropagation()}>
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">{task.title}</h4>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
              <CalendarIcon className="w-3 h-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {taskComments.length > 0 && (
            <span className="text-xs flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-3 h-3" />
              {taskComments.length}
            </span>
          )}
          {task.assignee_name && (
            <Avatar className="w-5 h-5 -ml-1">
              <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                {task.assignee_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {editingTitle ? (
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                    autoFocus
                    className="text-lg font-semibold"
                  />
                ) : (
                  <DialogTitle 
                    className="text-lg font-semibold cursor-pointer hover:text-indigo-600"
                    onClick={() => setEditingTitle(true)}
                  >
                    {task.title}
                  </DialogTitle>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Left - Main Content */}
            <div className="col-span-3 space-y-4">
              {/* Description */}
              <div>
                <Label className="text-xs text-slate-500 uppercase">Description</Label>
                <Textarea 
                  className="mt-1 min-h-[100px]"
                  placeholder="Add a description..."
                  defaultValue={task.description || ''}
                  onBlur={e => updateTask(task.id, { description: e.target.value })}
                />
              </div>

              {/* Comments */}
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Comments</Label>
                <div className="space-y-3">
                  {taskComments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-slate-200 text-slate-700">
                          {c.user_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.user_name}</span>
                          <span className="text-xs text-slate-400">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-indigo-600 text-white">DU</AvatarFallback>
                  </Avatar>
                  <Input 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Right - Sidebar */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-1 block">Status</Label>
                <Select value={task.status} onValueChange={v => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-1 block">Priority</Label>
                <Select value={task.priority} onValueChange={v => handlePriorityChange(v as TaskPriority)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-1 block">Due Date</Label>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {task.due_date ? formatDueDate(task.due_date) : 'No date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      required
                      selected={task.due_date ? new Date(task.due_date) : undefined}
                      onSelect={handleDueDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-1 block">Assignee</Label>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  {task.assignee_name || 'Unassigned'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
