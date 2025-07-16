'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useStatsSync } from '@/hooks/useRealTimeSync'
import { SyncStatus } from '@/components/SyncStatus'
import { useSyncNotifications } from '@/hooks/useSyncNotifications'
import { t } from '@/lib/translations'

interface DepartmentStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  overdueProjects: number
  teamMembers: number
}

export default function DepartmentDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DepartmentStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Use real-time sync for stats
  const { data: syncData, loading: syncLoading, error: syncError, forceRefresh, isConnected } = useStatsSync(
    (newStats) => {
      setStats(newStats);
    }
  );

  // Set up sync notifications
  useSyncNotifications({
    data: syncData,
    userId: session?.user?.id,
    departmentId: session?.user?.departmentId,
    onNotification: (notification) => {
      console.log('Department notification:', notification);
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/departments/me/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch department stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && !syncData) {
      fetchStats()
    }
  }, [status, syncData])

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  if (!session?.user) {
    return <div className="flex items-center justify-center h-96">Authentication required</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('departments.dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('auth.welcome')}, {session.user.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <SyncStatus 
            isConnected={isConnected}
            loading={syncLoading}
            error={syncError}
            lastUpdated={syncData?.lastUpdated}
            onRefresh={forceRefresh}
          />
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" />
              {t('common.viewCalendar')}
            </Button>
            <Button size="sm">
              <Users className="mr-2 h-4 w-4" />
              {t('teams.manage')}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeProjects || 0} active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {stats?.totalTasks || 0} total tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.teamMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overdueProjects || 0}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Task completed</p>
                  <p className="text-xs text-muted-foreground">Database optimization task completed</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">2 hours ago</div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">New team member added</p>
                  <p className="text-xs text-muted-foreground">John Doe joined the development team</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">1 day ago</div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Project deadline approaching</p>
                  <p className="text-xs text-muted-foreground">Mobile app project due in 3 days</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">2 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for department management
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Team Members
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Project Analytics
            </Button>
            <Button variant="outline" className="justify-start">
              <CalendarDays className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Task Management
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Projects</span>
                <Badge variant="default">{stats?.activeProjects || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed Projects</span>
                <Badge variant="secondary">{stats?.completedProjects || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overdue Projects</span>
                <Badge variant="destructive">{stats?.overdueProjects || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Department task completion overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Tasks</span>
                <span className="text-sm font-bold">{stats?.totalTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-green-600 font-bold">{stats?.completedTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-bold">
                  {stats?.totalTasks && stats?.completedTasks
                    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
