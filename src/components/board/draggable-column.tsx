'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Plus } from 'lucide-react'
import { DraggableTaskCard } from './draggable-task-card'
import { Task, List } from '@/lib/types'

interface DraggableColumnProps {
  list: List
  tasks: Task[]
  onAddTask: (listId: string) => void
}

export function DraggableColumn({ list, tasks, onAddTask }: DraggableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const taskIds = tasks.map(t => t.id)

  return (
    <div
      className={`w-[85vw] md:w-72 flex-shrink-0 bg-slate-100 rounded-xl flex flex-col snap-center transition-colors ${
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : ''
      }`}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-slate-700">{list.name}</h3>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 md:w-6 md:h-6 text-slate-500">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 max-h-[50vh] md:max-h-[calc(100vh-280px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className="p-2 space-y-2 min-h-[100px]"
          >
            {tasks.map(task => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>

      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-500 hover:text-slate-700 h-12 md:h-10 text-sm"
          onClick={() => onAddTask(list.id)}
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  )
}
