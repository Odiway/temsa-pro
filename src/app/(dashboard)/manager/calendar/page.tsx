'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Layers, AlertTriangle } from 'lucide-react';
import { t } from '@/lib/translations';

interface TaskPhase {
  id: string;
  name: string;
  status: string;
  estimatedTime: number;
  actualTime?: number;
  startDate?: string;
  endDate?: string;
  assignedTo?: { name: string; id: string };
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedTo?: { name: string; id: string };
  project?: { name: string; id: string };
  phases?: TaskPhase[];
}

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const phaseStatusColors = {
  PENDING: 'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

const taskStatusColors = {
  PENDING: 'border-l-gray-400',
  IN_PROGRESS: 'border-l-blue-500',
  COMPLETED: 'border-l-green-500',
  CANCELLED: 'border-l-red-400',
};

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        // Tasks now include phases by default from the API
        setTasks(Array.isArray(data) ? data.filter(task => task.dueDate) : []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate && task.dueDate.split('T')[0] === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-2 cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-blue-100' : ''} hover:bg-gray-50`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task, index) => (
              <div
                key={task.id}
                className={`text-xs p-1 rounded-l border-l-4 bg-white shadow-sm ${
                  taskStatusColors[task.status as keyof typeof taskStatusColors]
                }`}
                title={`${task.title} - ${task.project?.name}\n${task.phases?.length || 0} aşama`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium">{task.title}</span>
                  {task.phases && task.phases.length > 0 && (
                    <span className="flex items-center gap-1 ml-1">
                      <Layers className="h-3 w-3" />
                      <span>{task.phases.length}</span>
                    </span>
                  )}
                </div>
                {task.phases && task.phases.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {task.phases.slice(0, 3).map((phase, phaseIndex) => (
                      <div
                        key={phase.id}
                        className={`w-2 h-2 rounded-full ${
                          phaseStatusColors[phase.status as keyof typeof phaseStatusColors]
                        }`}
                        title={`${phase.name}: ${phase.status}`}
                      />
                    ))}
                    {task.phases.length > 3 && (
                      <span className="text-xs text-gray-500">+{task.phases.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">{t('auth.unauthorized')}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">{t('calendar.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : 'Select a Date'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task) => (
                      <div key={task.id} className={`border-l-4 rounded-r bg-white shadow-sm p-3 space-y-2 ${
                        taskStatusColors[task.status as keyof typeof taskStatusColors]
                      }`}>
                        <div className="font-medium">{task.title}</div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              priorityColors[task.priority as keyof typeof priorityColors]
                            }`}></span>
                            {task.priority}
                          </div>
                          
                          {task.phases && task.phases.length > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Layers className="w-3 h-3 mr-1" />
                              {task.phases.length} {t('tasks.phases')}
                            </div>
                          )}
                        </div>

                        {task.project && (
                          <div className="text-sm text-gray-600">
                            Project: {task.project.name}
                          </div>
                        )}

                        {task.assignedTo && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-3 h-3 mr-1" />
                            {task.assignedTo.name}
                          </div>
                        )}

                        {/* Task Phases */}
                        {task.phases && task.phases.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Aşamalar:</div>
                            <div className="space-y-1">
                              {task.phases.map((phase) => (
                                <div key={phase.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      phaseStatusColors[phase.status as keyof typeof phaseStatusColors]
                                    }`}></div>
                                    <span className="truncate">{phase.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-500">
                                    {phase.estimatedTime && (
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {phase.estimatedTime}h
                                      </span>
                                    )}
                                    {phase.assignedTo && (
                                      <span className="flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        {phase.assignedTo.name.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Phase Progress */}
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>İlerleme</span>
                                <span>
                                  {task.phases.filter(p => p.status === 'COMPLETED').length} / {task.phases.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${(task.phases.filter(p => p.status === 'COMPLETED').length / task.phases.length) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className={`text-xs px-2 py-1 rounded w-fit ${
                          task.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="mx-auto h-8 w-8 mb-2" />
                    <p>No tasks scheduled for this date</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="mx-auto h-8 w-8 mb-2" />
                  <p>Click on a date to view tasks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Priority Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(priorityColors).map(([priority, color]) => (
                  <div key={priority} className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded mr-2 ${color}`}></div>
                    {priority}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
