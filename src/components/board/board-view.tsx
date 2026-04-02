'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Plus, Search, X } from 'lucide-react'
import { DraggableColumn } from './draggable-column'
import { DraggableTaskCard } from './draggable-task-card'
import { Task, TaskPriority, TaskStatus, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/types'

interface FilterState {
  search: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
}

export function BoardView() {
  const { currentProject, lists, tasks, addTask, updateTask } = useApp()
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskListId, setNewTaskListId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const getTasksForList = (listId: string) => {
    return filteredTasks
      .filter(t => t.list_id === listId)
      .sort((a, b) => a.position - b.position)
  }

  const openNewTask = (listId: string) => {
    setNewTaskListId(listId)
    setNewTaskOpen(true)
  }

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !newTaskListId) return
    await addTask(newTaskListId, taskTitle, taskDesc, taskPriority)
    setTaskTitle('')
    setTaskDesc('')
    setTaskPriority('medium')
    setNewTaskOpen(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find(t => t.id === taskId)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dragging over a list (column)
    const overList = projectLists.find(l => l.id === overId)
    if (overList) {
      // Moving directly to a new list - update the task's list_id
      const activeTask = tasks.find(t => t.id === activeId)
      if (activeTask && activeTask.list_id !== overId) {
        updateTask(activeId, { list_id: overId })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Check if dropped on a list
    const overList = projectLists.find(l => l.id === overId)
    if (overList) {
      // Task was dropped on a list - it's already updated in handleDragOver
      // Update position to be at the end
      const tasksInTargetList = getTasksForList(overId).filter(t => t.id !== activeId)
      await updateTask(activeId, { position: tasksInTargetList.length })
      return
    }

    // Check if dropped on another task
    const overTask = tasks.find(t => t.id === overId)
    if (overTask && activeTask) {
      const targetListId = overTask.list_id
      const tasksInList = getTasksForList(targetListId)

      const oldIndex = tasksInList.findIndex(t => t.id === activeId)
      const newIndex = tasksInList.findIndex(t => t.id === overId)

      if (oldIndex !== newIndex) {
        // Reorder tasks
        const newTasks = [...tasksInList]
        newTasks.splice(oldIndex, 1)
        newTasks.splice(newIndex, 0, activeTask)

        // Update positions
        for (let i = 0; i < newTasks.length; i++) {
          await updateTask(newTasks[i].id, {
            list_id: targetListId,
            position: i
          })
        }
      } else if (activeTask.list_id !== targetListId) {
        // Same task order but different list
        await updateTask(activeId, { list_id: targetListId })
      }
    }
  }

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', priority: 'all' })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.priority !== 'all'

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border-b flex-wrap">
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

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="h-full">
            <div className="flex gap-3 p-3 md:p-4 min-h-full">
              <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0">
                {projectLists.map(list => (
                  <DraggableColumn
                    key={list.id}
                    list={list}
                    tasks={getTasksForList(list.id)}
                    onAddTask={openNewTask}
                  />
                ))}

                <div className="w-[85vw] md:w-72 flex-shrink-0 snap-center">
                  <Button variant="outline" className="w-full h-12 md:h-10 border-dashed">
                    <Plus className="w-4 h-4 mr-2" />
                    Add List
                  </Button>
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DragOverlay>
            {activeTask && (
              <div className="w-64">
                <DraggableTaskCard task={activeTask} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
                placeholder="Optional description"
                className="min-h-[100px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={taskPriority} onValueChange={v => setTaskPriority(v as TaskPriority)}>
                <SelectTrigger className="h-12 text-base">
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
            <Button onClick={handleCreateTask} className="w-full h-12 text-base font-medium">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
