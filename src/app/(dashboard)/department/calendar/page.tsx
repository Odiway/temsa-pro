'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'meeting' | 'deadline' | 'event'
  attendees?: number
  location?: string
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup Meeting',
    date: '2024-01-15',
    time: '09:00',
    type: 'meeting',
    attendees: 8,
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Alpha Deadline',
    date: '2024-01-18',
    time: '17:00',
    type: 'deadline'
  },
  {
    id: '3',
    title: 'Client Presentation',
    date: '2024-01-20',
    time: '14:00',
    type: 'meeting',
    attendees: 5,
    location: 'Virtual'
  },
  {
    id: '4',
    title: 'Department Quarterly Review',
    date: '2024-01-25',
    time: '10:00',
    type: 'event',
    attendees: 15,
    location: 'Main Auditorium'
  }
]

export default function DepartmentCalendarPage() {
  const { data: session, status } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const getEventsForDate = (dateString: string) => {
    return mockEvents.filter(event => event.date === dateString)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'deadline':
        return 'bg-red-100 text-red-800'
      case 'event':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const upcomingEvents = mockEvents.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Calendar</h1>
          <p className="text-muted-foreground">
            Manage meetings, deadlines, and events for your department
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(currentDate)}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
                  const dateString = date.toISOString().split('T')[0]
                  const hasEvents = getEventsForDate(dateString).length > 0
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = dateString === new Date().toISOString().split('T')[0]
                  
                  return (
                    <div
                      key={i}
                      className={`
                        p-2 text-sm cursor-pointer rounded-lg transition-colors
                        ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${isToday ? 'bg-blue-100 text-blue-900 font-bold' : ''}
                        ${selectedDate === dateString ? 'bg-blue-200' : ''}
                        ${hasEvents ? 'bg-green-50' : ''}
                        hover:bg-gray-100
                      `}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <div>{date.getDate()}</div>
                      {hasEvents && (
                        <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 5 scheduled items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.type === 'meeting' ? 'bg-blue-500' :
                      event.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{event.attendees} attendees</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>Events for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          {event.attendees && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees} attendees</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled for this date.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
