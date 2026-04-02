'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Task, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS, TaskStatus, TaskPriority } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { Calendar as CalendarIcon, Plus, MoreHorizontal, Search, X } from 'lucide-react'
import { TaskCard } from './task-card'

export function ListView() {
  const { currentProject, lists, tasks, addTask } = useApp()
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as TaskStatus | 'all',
    priority: 'all' as TaskPriority | 'all',
  })

  if (!currentProject) return null

  const projectLists = lists.filter(l => l.project_id === currentProject.id)

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Filter by project lists
    const projectListIds = new Set(projectLists.map(l => l.id))
    filtered = filtered.filter(t => projectListIds.has(t.list_id))

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      )
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority)
    }

    return filtered
  }, [tasks, projectLists, filters])

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !selectedListId) return
    await addTask(selectedListId, taskTitle, taskDesc, taskPriority)
    setTaskTitle('')
    setTaskDesc('')
    setTaskPriority('medium')
    setNewTaskOpen(false)
  }

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', priority: 'all' })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.priority !== 'all'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pl-9 h-8"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={v => setFilters(f => ({ ...f, status: v as TaskStatus | 'all' }))}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={v => setFilters(f => ({ ...f, priority: v as TaskPriority | 'all' }))}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-slate-500">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}

        {/* Task Count */}
        <span className="ml-auto text-xs text-slate-400">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-64">Task</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-28">Priority</TableHead>
                <TableHead className="w-28">Due Date</TableHead>
                <TableHead className="w-32">Assignee</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[task.status]}>
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs`}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isPast(new Date(task.due_date)) && task.status !== 'done'
                          ? 'text-red-600 font-medium'
                          : 'text-slate-600'
                      }`}>
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.assignee_name ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                            {task.assignee_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{task.assignee_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-slate-500">
                      {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
                    </p>
                    {!hasActiveFilters && (
                      <Button variant="link" onClick={() => setNewTaskOpen(true)}>
                        Create your first task
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label>List</Label>
              <Select value={selectedListId} onValueChange={(v) => setSelectedListId(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {projectLists.map(list => (
                    <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={taskPriority} onValueChange={v => setTaskPriority(v as TaskPriority)}>
                <SelectTrigger>
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
            <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
