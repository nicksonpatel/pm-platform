'use client'

import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { List, LayoutGrid, Calendar, Plus, Filter, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useApp as useAppState } from '@/lib/store'

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
    <div className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{currentProject.icon}</span>
        <div>
          <h1 className="font-semibold text-gray-900">{currentProject.name}</h1>
          <p className="text-xs text-gray-500">{currentWorkspace?.name}</p>
        </div>
        <Badge 
          className="ml-2" 
          style={{ backgroundColor: currentProject.color + '20', color: currentProject.color }}
        >
          Active
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${view === 'board' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('board')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <Filter className="w-4 h-4" />
          Filter
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>

        <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
          <DialogTrigger>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="w-4 h-4" />
              Add List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
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
                />
              </div>
              <Button onClick={handleCreateList} className="w-full">Create List</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
