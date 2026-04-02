'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TaskCard } from './task-card'
import { Plus, MoreHorizontal } from 'lucide-react'
import { List, Task, TaskPriority } from '@/lib/types'

export function BoardView() {
  const { currentProject, lists, tasks, addTask } = useApp()
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskListId, setNewTaskListId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')

  if (!currentProject) return null

  const projectLists = lists.filter(l => l.project_id === currentProject.id)

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

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="flex gap-4 p-4 min-h-full">
          {projectLists.map(list => {
            const listTasks = tasks
              .filter(t => t.list_id === list.id)
              .sort((a, b) => a.position - b.position)

            return (
              <div key={list.id} className="w-72 flex-shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-[calc(100vh-180px)]">
                {/* List Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-700">{list.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">
                      {listTasks.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-slate-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <Separator />

                {/* Tasks */}
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {listTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </ScrollArea>

                {/* Add Task */}
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-slate-500 hover:text-slate-700"
                    onClick={() => openNewTask(list.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add task
                  </Button>
                </div>
              </div>
            )
          })}

          {/* Add List placeholder */}
          <div className="w-72 flex-shrink-0">
            <Button variant="outline" className="w-full h-12 border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add List
            </Button>
          </div>
        </div>
      </ScrollArea>

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
