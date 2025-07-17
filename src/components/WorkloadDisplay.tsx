'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';

interface WorkloadUser {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: { id: string; name: string } | null;
  };
  workload: {
    capacity: number;
    currentHours: number;
    upcomingHours: number;
    availableHours: number;
    utilizationRate: number;
    status: string;
    statusColor: string;
  };
  tasks: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    urgent: number;
    highPriority: number;
    pending: number;
    inProgress: number;
  };
  projects: {
    total: number;
    asManager: number;
    asParticipant: number;
  };
  performance: {
    completedTasks: number;
    avgEfficiency: number;
    recentlyActive: boolean;
    onTimeRate: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    endDate: string;
    priority: string;
    project: string;
    daysLeft: number;
  }>;
}

interface WorkloadDisplayProps {
  userId?: string;
  departmentId?: string;
  compact?: boolean;
  showTeamSummary?: boolean;
  onUserSelect?: (user: WorkloadUser) => void;
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-blue-100 text-blue-800 border-blue-200',
  busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-orange-100 text-orange-800 border-orange-200',
  overloaded: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  available: CheckCircle,
  moderate: Clock,
  busy: AlertCircle,
  critical: AlertCircle,
  overloaded: AlertCircle,
};

export function WorkloadDisplay({ 
  userId, 
  departmentId, 
  compact = false, 
  showTeamSummary = false,
  onUserSelect 
}: WorkloadDisplayProps) {
  const [workloadData, setWorkloadData] = useState<{
    users: WorkloadUser[];
    teamSummary?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<WorkloadUser | null>(null);

  useEffect(() => {
    fetchWorkloadData();
  }, [userId, departmentId]);

  const fetchWorkloadData = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (departmentId) params.append('departmentId', departmentId);
      params.append('includeProjectParticipants', 'true');

      const response = await fetch(`/api/users/workload?${params}`);
      if (response.ok) {
        const data = await response.json();
        setWorkloadData(data);
      }
    } catch (error) {
      console.error('Error fetching workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: WorkloadUser) => {
    setSelectedUser(user);
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workloadData || workloadData.users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No user workload data available</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {workloadData.users.map((userWorkload) => {
          const StatusIcon = statusIcons[userWorkload.workload.status as keyof typeof statusIcons];
          return (
            <div
              key={userWorkload.user.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleUserClick(userWorkload)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{userWorkload.user.name}</p>
                  <p className="text-xs text-gray-500">{userWorkload.user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={statusColors[userWorkload.workload.status as keyof typeof statusColors]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {userWorkload.workload.utilizationRate}%
                </Badge>
                <span className="text-xs text-gray-500">
                  {userWorkload.workload.availableHours}h free
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTeamSummary && workloadData.teamSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Workload Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{workloadData.teamSummary.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{workloadData.teamSummary.avgUtilization}%</div>
                <div className="text-sm text-gray-500">Avg Utilization</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{workloadData.teamSummary.statusDistribution.available}</div>
                <div className="text-sm text-gray-500">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{workloadData.teamSummary.statusDistribution.busy}</div>
                <div className="text-sm text-gray-500">Busy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{workloadData.teamSummary.statusDistribution.overloaded}</div>
                <div className="text-sm text-gray-500">Overloaded</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workloadData.users.map((userWorkload) => {
          const StatusIcon = statusIcons[userWorkload.workload.status as keyof typeof statusIcons];
          return (
            <Card key={userWorkload.user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{userWorkload.user.name}</CardTitle>
                      <p className="text-xs text-gray-500">{userWorkload.user.role}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[userWorkload.workload.status as keyof typeof statusColors]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {userWorkload.workload.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Utilization Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Utilization</span>
                    <span className="font-medium">{userWorkload.workload.utilizationRate}%</span>
                  </div>
                  <Progress 
                    value={userWorkload.workload.utilizationRate} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{userWorkload.workload.currentHours}h assigned</span>
                    <span>{userWorkload.workload.availableHours}h free</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{userWorkload.tasks.active} active tasks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span>{userWorkload.projects.total} projects</span>
                  </div>
                  {userWorkload.tasks.overdue > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{userWorkload.tasks.overdue} overdue</span>
                    </div>
                  )}
                  {userWorkload.tasks.urgent > 0 && (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span>{userWorkload.tasks.urgent} urgent</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedUser(userWorkload)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{userWorkload.user.name} - Workload Details</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Detailed Workload Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Current Workload</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Capacity:</span>
                                <span className="font-medium">{userWorkload.workload.capacity}h/week</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Assigned:</span>
                                <span className="font-medium">{userWorkload.workload.currentHours}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Available:</span>
                                <span className="font-medium text-green-600">{userWorkload.workload.availableHours}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Utilization:</span>
                                <span className="font-medium">{userWorkload.workload.utilizationRate}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Completed Tasks:</span>
                                <span className="font-medium">{userWorkload.performance.completedTasks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>On-time Rate:</span>
                                <span className="font-medium">{userWorkload.performance.onTimeRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Efficiency:</span>
                                <span className="font-medium">{userWorkload.performance.avgEfficiency}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Recently Active:</span>
                                <span className={`font-medium ${userWorkload.performance.recentlyActive ? 'text-green-600' : 'text-gray-500'}`}>
                                  {userWorkload.performance.recentlyActive ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Upcoming Deadlines */}
                      {userWorkload.upcomingDeadlines.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Upcoming Deadlines
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {userWorkload.upcomingDeadlines.map((deadline) => (
                                <div key={deadline.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-sm">{deadline.title}</p>
                                    <p className="text-xs text-gray-500">{deadline.project}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline" className={
                                      deadline.daysLeft <= 1 ? 'border-red-500 text-red-700' :
                                      deadline.daysLeft <= 3 ? 'border-orange-500 text-orange-700' :
                                      'border-blue-500 text-blue-700'
                                    }>
                                      {deadline.daysLeft}d left
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
