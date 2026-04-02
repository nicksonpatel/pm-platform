'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, X, Search } from 'lucide-react'
import { PRIORITY_LABELS, STATUS_LABELS, TaskPriority, TaskStatus } from '@/lib/types'

interface FilterState {
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  search: string
}

export function FilterBar() {
  const { tasks, lists, currentProject } = useApp()
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    search: '',
  })

  const projectLists = useMemo(() => {
    if (!currentProject) return []
    return lists.filter(l => l.project_id === currentProject.id)
  }, [lists, currentProject])

  const projectTasks = useMemo(() => {
    if (!currentProject) return []
    const projectListIds = new Set(projectLists.map(l => l.id))
    return tasks.filter(t => projectListIds.has(t.list_id))
  }, [tasks, projectLists, currentProject])

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search !== ''

  const clearFilters = () => {
    setFilters({ status: 'all', priority: 'all', search: '' })
  }

  const activeFilterCount = [
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.search !== '',
  ].filter(Boolean).length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="pl-9 h-8 w-40 md:w-48"
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

      {/* Active Filter Count */}
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="h-6 px-2 gap-1">
          {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          <button onClick={clearFilters} className="ml-1 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {activeFilterCount === 0 && (
        <span className="text-xs text-slate-400">
          {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

// Export a hook to get filtered tasks
export function useFilteredTasks() {
  const { tasks, lists, currentProject } = useApp()
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    search: '',
  })

  const projectLists = useMemo(() => {
    if (!currentProject) return []
    return lists.filter(l => l.project_id === currentProject.id)
  }, [lists, currentProject])

  const projectTasks = useMemo(() => {
    if (!currentProject) return []
    const projectListIds = new Set(projectLists.map(l => l.id))
    let filtered = tasks.filter(t => projectListIds.has(t.list_id))

    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [tasks, projectLists, filters])

  return { projectTasks, filters, setFilters }
}
