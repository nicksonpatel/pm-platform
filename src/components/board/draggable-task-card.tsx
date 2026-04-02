'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '@/lib/store'
import { Task, PRIORITY_COLORS, PRIORITY_LABELS, PRIORITY_LABELS as labels } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { MoreHorizontal, Calendar as CalendarIcon, MessageSquare, User, Trash2 } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { TaskStatus, TaskPriority } from '@/lib/types'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function DraggableTaskCard({ task, isDragging }: TaskCardProps) {
  const { updateTask, deleteTask, addComment, comments } = useApp()
  const [detailOpen, setDetailOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

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
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="touch-manipulation"
      >
        <Card
          className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white min-h-[80px] ${
            isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
          } ${isSortableDragging ? 'opacity-50' : ''}`}
          onClick={() => setDetailOpen(true)}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge className={`text-xs px-2 py-0.5 ${PRIORITY_COLORS[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">{task.title}</h4>

          <div className="flex items-center gap-2 flex-wrap">
            {task.due_date && (
              <span className={`text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-100 ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                <CalendarIcon className="w-3 h-3" />
                {formatDueDate(task.due_date)}
              </span>
            )}
            {taskComments.length > 0 && (
              <span className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600">
                <MessageSquare className="w-3 h-3" />
                {taskComments.length}
              </span>
            )}
            {task.assignee_name && (
              <Avatar className="w-6 h-6 -ml-1">
                <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                  {task.assignee_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {editingTitle ? (
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                    autoFocus
                    className="text-lg font-semibold h-10"
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
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="w-10 h-10">
                <Trash2 className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div className="md:col-span-3 space-y-4">
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Description</Label>
                <Textarea
                  className="min-h-[100px] text-base"
                  placeholder="Add a description..."
                  defaultValue={task.description || ''}
                  onBlur={e => updateTask(task.id, { description: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">
                  Comments ({taskComments.length})
                </Label>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {taskComments.map(c => (
                    <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-slate-50">
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
                    <AvatarFallback className="text-xs bg-indigo-600 text-white">ME</AvatarFallback>
                  </Avatar>
                  <Input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 h-10 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Status</Label>
                <Select value={task.status} onValueChange={v => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Priority</Label>
                <Select value={task.priority} onValueChange={v => handlePriorityChange(v as TaskPriority)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Due Date</Label>
                <Popover>
                  <PopoverTrigger className="w-full">
                    <Button variant="outline" className="w-full justify-start text-left h-10 text-sm font-normal">
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

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Assignee</Label>
                <Button variant="outline" className="w-full justify-start h-10 text-sm">
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
