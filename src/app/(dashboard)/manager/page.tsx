'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { WorkloadSummaryWidget } from '@/components/WorkloadSummaryWidget';
import { t } from '@/lib/translations';
import { useManagerSync } from '@/hooks/useRealTimeSync';
import { SyncStatus } from '@/components/SyncStatus';
import { useSyncNotifications } from '@/hooks/useSyncNotifications';

interface DashboardData {
  users: {
    total: number;
    active: number;
    byRole: { role: string; count: number; }[];
  };
  departments: {
    total: number;
    withProjects: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    byStatus: { status: string; count: number; }[];
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: { priority: string; count: number; }[];
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Use real-time sync for manager dashboard
  const { data: syncData, loading: syncLoading, error: syncError, forceRefresh, isConnected } = useManagerSync(
    (newData) => {
      if (newData.stats) {
        // Update the dashboard data structure from sync data
        setData({
          users: {
            total: newData.stats?.totalUsers || 0,
            active: newData.stats?.activeUsers || 0,
            byRole: []
          },
          departments: {
            total: newData.departments?.length || 0,
            withProjects: 0
          },
          projects: {
            total: newData.stats?.totalProjects || 0,
            active: newData.stats?.activeProjects || 0,
            completed: newData.stats?.completedProjects || 0,
            byStatus: []
          },
          tasks: {
            total: newData.stats?.totalTasks || 0,
            completed: newData.stats?.completedTasks || 0,
            pending: newData.stats?.pendingTasks || 0,
            overdue: newData.stats?.overdueTasks || 0,
            byPriority: []
          },
          recentActivity: []
        });
      }
    }
  );

  // Set up sync notifications for manager
  useSyncNotifications({
    data: syncData,
    userId: session?.user?.id,
    departmentId: session?.user?.departmentId,
    onNotification: (notification) => {
      console.log('Manager dashboard notification:', notification);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const analyticsData = await response.json();
          setData(analyticsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && !syncData) {
      fetchData();
    }
  }, [status, syncData]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('auth.unauthorized')}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('dashboard.failedToLoad')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.managerTitle')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {session?.user?.name || session?.user?.email}</p>
        </div>
        <SyncStatus 
          isConnected={isConnected}
          loading={syncLoading}
          error={syncError}
          lastUpdated={syncData?.lastUpdated}
          onRefresh={forceRefresh}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.users?.active || 0} {t('dashboard.activeUsers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.departments')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.departments?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.departments?.withProjects || 0} {t('dashboard.withActiveProjects')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projects.title')}</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.projects?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.projects?.active || 0} {t('dashboard.active')}, {data.projects?.completed || 0} {t('dashboard.completed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('tasks.title')}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasks?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.tasks?.pending || 0} {t('dashboard.pending')}, {data.tasks?.overdue || 0} {t('dashboard.overdue')}
            </p>
          </CardContent>
        </Card>
      </div>
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasks?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.tasks?.pending || 0} {t('dashboard.pending')}, {data.tasks?.overdue || 0} {t('dashboard.overdue')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workload Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Workload Overview
            </span>
            <Link href="/manager/workload">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkloadSummaryWidget />
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {data.users?.byRole && Array.isArray(data.users.byRole) && data.users.byRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.users.byRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="role"
                  >
                    {data.users.byRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {data.tasks?.byPriority && Array.isArray(data.tasks.byPriority) && data.tasks.byPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.tasks.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No task data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/manager/users">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/manager/departments">
              <Button variant="outline" className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Departments
              </Button>
            </Link>
            <Link href="/manager/projects">
              <Button variant="outline" className="w-full">
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects
              </Button>
            </Link>
            <Link href="/manager/tasks">
              <Button variant="outline" className="w-full">
                <CheckSquare className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity && Array.isArray(data.recentActivity) && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No recent activity</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
