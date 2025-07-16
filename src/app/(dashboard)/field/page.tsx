'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTaskSync } from '@/hooks/useRealTimeSync'
import { SyncStatus } from '@/components/SyncStatus'
import { useSyncNotifications } from '@/hooks/useSyncNotifications'
import { t } from '@/lib/translations'

interface TaskPhase {
  id: string
  name: string
  description?: string
  status: string
  estimatedTime?: number
  actualTime?: number
  startDate?: string
  endDate?: string
  task: {
    id: string
    title: string
    priority: string
  }
}

export default function FieldPage() {
  const { data: session } = useSession()
  const [taskPhases, setTaskPhases] = useState<TaskPhase[]>([])
  const [loading, setLoading] = useState(true)

  // Use real-time sync for tasks
  const { data: syncData, loading: syncLoading, error: syncError, forceRefresh, isConnected } = useTaskSync(
    (tasks) => {
      // Filter tasks to show only assigned phases
      const userPhases = tasks
        .filter(task => task.assigneeId)
        .flatMap(task => task.phases || [])
        .filter(phase => phase.status !== 'COMPLETED');
      setTaskPhases(userPhases);
    }
  );

  // Set up sync notifications for field worker
  useSyncNotifications({
    data: syncData,
    userId: session?.user?.id,
    departmentId: session?.user?.departmentId,
    onNotification: (notification) => {
      console.log('Field worker notification:', notification);
    }
  });

  useEffect(() => {
    const fetchTaskPhases = async () => {
      try {
        const response = await fetch('/api/users/me/phases')
        if (response.ok) {
          const data = await response.json()
          setTaskPhases(data.phases || [])
        }
      } catch (error) {
        console.error('Error fetching task phases:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!syncData) {
      fetchTaskPhases()
    }
  }, [syncData])

  const handleStartPhase = async (phaseId: string) => {
    try {
      const response = await fetch(`/api/phases/${phaseId}/start`, {
        method: 'POST',
      })
      if (response.ok) {
        // Refresh the data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error starting phase:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || syncLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('tasks.myTasks')}</h1>
          <SyncStatus 
            isConnected={isConnected}
            loading={syncLoading}
            error={syncError}
            lastUpdated={syncData?.lastUpdated}
            onRefresh={forceRefresh}
          />
        </div>
        <div className="grid gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('tasks.myTasks')}</h1>
          <p className="text-gray-600">{t('tasks.fieldDescription')}</p>
        </div>
        <SyncStatus 
          isConnected={isConnected}
          loading={syncLoading}
          error={syncError}
          lastUpdated={syncData?.lastUpdated}
          onRefresh={forceRefresh}
        />
      </div>

      {taskPhases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any task phases assigned yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {taskPhases.map((phase) => (
            <Card key={phase.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{phase.name}</CardTitle>
                    <CardDescription>
                      Task: {phase.task.title}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        phase.task.priority
                      )}`}
                    >
                      {phase.task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        phase.status
                      )}`}
                    >
                      {phase.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phase.description && (
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {phase.estimatedTime && (
                      <div>
                        <span className="font-medium text-gray-500">Estimated Time:</span>
                        <span className="ml-1">{phase.estimatedTime} hours</span>
                      </div>
                    )}
                    {phase.actualTime && (
                      <div>
                        <span className="font-medium text-gray-500">Actual Time:</span>
                        <span className="ml-1">{phase.actualTime} hours</span>
                      </div>
                    )}
                    {phase.startDate && (
                      <div>
                        <span className="font-medium text-gray-500">Start Date:</span>
                        <span className="ml-1">
                          {new Date(phase.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {phase.endDate && (
                      <div>
                        <span className="font-medium text-gray-500">End Date:</span>
                        <span className="ml-1">
                          {new Date(phase.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {phase.status === 'PENDING' && (
                    <div className="pt-4">
                      <Button
                        onClick={() => handleStartPhase(phase.id)}
                        className="w-full sm:w-auto"
                      >
                        Start Phase
                      </Button>
                    </div>
                  )}
                  
                  {phase.status === 'IN_PROGRESS' && (
                    <div className="pt-4 space-y-2">
                      <div className="text-sm text-blue-600 font-medium">
                        Phase is currently in progress
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Update Progress
                        </Button>
                        <Button variant="outline" size="sm">
                          Complete Phase
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
