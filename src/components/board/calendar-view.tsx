'use client'

import { useApp } from '@/lib/store'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/types'
import { format, isSameDay } from 'date-fns'
import { useState } from 'react'

export function CalendarView() {
  const { currentProject, lists, tasks } = useApp()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  if (!currentProject) return null

  const projectLists = lists.filter(l => l.project_id === currentProject.id)
  const projectTasks = tasks.filter(t => projectLists.some(l => l.id === t.list_id))
  const tasksWithDue = projectTasks.filter(t => t.due_date)

  const tasksOnDate = selectedDate
    ? tasksWithDue.filter(t => isSameDay(new Date(t.due_date!), selectedDate))
    : []

  return (
    <div className="flex-1 overflow-auto p-3 md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar - Full width on mobile */}
        <div className="md:col-span-2">
          <Card className="md:sticky md:top-4">
            <CardContent className="p-3 md:p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Tasks for selected date */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-base">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksOnDate.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No tasks due on this date</p>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {tasksOnDate.map(task => (
                    <div key={task.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                        <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs shrink-0`}>
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {lists.find(l => l.id === task.list_id)?.name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
