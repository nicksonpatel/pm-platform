'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { List, LayoutGrid, Calendar, Plus, Filter, MoreHorizontal } from 'lucide-react'

export function ProjectHeader() {
  const { currentProject, currentWorkspace, view, setView, addList } = useApp()
  const [newListOpen, setNewListOpen] = useState(false)
  const [listName, setListName] = useState('')

  if (!currentProject) return null

  const handleCreateList = async () => {
    if (!listName.trim()) return
    await addList(currentProject.id, listName)
    setListName('')
    setNewListOpen(false)
  }

  return (
    <div className="h-14 bg-white flex items-center justify-between px-3 md:px-4 border-b sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl md:text-2xl">{currentProject.icon}</span>
        <div className="min-w-0">
          <h1 className="font-semibold text-slate-900 truncate text-sm md:text-base">
            {currentProject.name}
          </h1>
          <p className="text-xs text-slate-500 hidden md:block">{currentWorkspace?.name}</p>
        </div>
        <Badge
          className="ml-1 md:ml-2 text-xs hidden md:flex"
          style={{ backgroundColor: currentProject.color + '20', color: currentProject.color }}
        >
          Active
        </Badge>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* View Switcher - Larger on mobile */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 md:h-7 px-2 md:px-2 ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4" />
            <span className="ml-1 md:hidden text-xs">List</span>
          </Button>
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 md:h-7 px-2 md:px-2 ${view === 'board' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('board')}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="ml-1 md:hidden text-xs">Board</span>
          </Button>
          <Button
            variant={view === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 md:h-7 px-2 md:px-2 ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4" />
            <span className="ml-1 md:hidden text-xs">Cal</span>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="w-10 h-10 md:w-8 md:h-8">
          <Filter className="w-4 h-4" />
        </Button>

        <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
          <DialogTrigger>
            <Button size="sm" className="h-8 md:h-8 gap-1 text-xs md:text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add List</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>List Name</Label>
                <Input
                  value={listName}
                  onChange={e => setListName(e.target.value)}
                  placeholder="e.g., In Progress, Review, Done"
                  className="h-12 text-base"
                />
              </div>
              <Button onClick={handleCreateList} className="w-full h-12 text-base">
                Create List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
