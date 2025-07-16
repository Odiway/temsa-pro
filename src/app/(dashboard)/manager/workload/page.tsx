'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { WorkloadDisplay } from '@/components/WorkloadDisplay';
import { WorkloadStatsWidget } from '@/components/WorkloadStatsWidget';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
}

export default function WorkloadManagementPage() {
  const { data: session, status } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRebalanceDialogOpen, setIsRebalanceDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWorkload = () => {
    toast('Export functionality will be implemented in the next iteration', {
      icon: 'ℹ️',
    });
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">Please sign in.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Team Workload Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor team capacity, availability, and assign tasks efficiently
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportWorkload}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDepartment('all');
                  setSearchQuery('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <WorkloadStatsWidget />

      {/* Workload Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Workload Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Available (0-50%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Moderate (50-70%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Busy (70-90%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Critical (90-100%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Overloaded (100%+)</span>
              </div>
            </div>
          </div>

          <WorkloadDisplay 
            departmentId={selectedDepartment === 'all' ? undefined : selectedDepartment}
            showTeamSummary={true}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={isRebalanceDialogOpen} onOpenChange={setIsRebalanceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Rebalance Team</p>
                    <p className="text-sm text-muted-foreground">Redistribute overloaded tasks</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Team Rebalancing</DialogTitle>
                </DialogHeader>
                <RebalanceTeamContent />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">View Schedules</p>
                    <p className="text-sm text-muted-foreground">Check team calendars</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Team Schedules</DialogTitle>
                </DialogHeader>
                <TeamScheduleContent />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center justify-center p-6 h-auto">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Performance Report</p>
                    <p className="text-sm text-muted-foreground">Generate detailed metrics</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Performance Report</DialogTitle>
                </DialogHeader>
                <PerformanceReportContent />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Team Rebalancing
function RebalanceTeamContent() {
  const [overloadedUsers, setOverloadedUsers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRebalanceData();
  }, []);

  const fetchRebalanceData = async () => {
    try {
      // Fetch overloaded users
      const workloadResponse = await fetch('/api/workload/alerts');
      if (workloadResponse.ok) {
        const workloadData = await workloadResponse.json();
        setOverloadedUsers(workloadData.overloadedUsers || []);
      }

      // Fetch available users
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAvailableUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching rebalance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRebalance = async () => {
    try {
      const response = await fetch('/api/workload/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Team rebalancing completed successfully!');
        fetchRebalanceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to rebalance team');
      }
    } catch (error) {
      console.error('Error rebalancing team:', error);
      toast.error('Error: Failed to rebalance team');
    }
  };

  if (loading) return <LoadingSpinner text="Loading rebalance data..." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Overloaded Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overloadedUsers.length > 0 ? (
              <div className="space-y-3">
                {overloadedUsers.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant="destructive">{user.workloadPercentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.activeTasks} active tasks
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No overloaded team members</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Available Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableUsers.filter(user => user.workloadPercentage < 70).length > 0 ? (
              <div className="space-y-3">
                {availableUsers
                  .filter(user => user.workloadPercentage < 70)
                  .slice(0, 5)
                  .map((user) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{user.name}</span>
                        <Badge variant="secondary">{user.workloadPercentage || 0}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available capacity: {100 - (user.workloadPercentage || 0)}%
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No available team members</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
        <Button onClick={handleRebalance}>
          <Users className="mr-2 h-4 w-4" />
          Auto Rebalance
        </Button>
      </div>
    </div>
  );
}

// Component for Team Schedule
function TeamScheduleContent() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/users/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading schedules..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Team Calendar Overview</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            This Week
          </Button>
          <Button variant="outline" size="sm">
            This Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <Card key={schedule.userId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{schedule.userName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Status:</span>
                    <Badge variant={schedule.status === 'Available' ? 'default' : 'secondary'}>
                      {schedule.status || 'Available'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Tasks:</span>
                    <span className="text-sm font-medium">{schedule.activeTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Deadline:</span>
                    <span className="text-sm">
                      {schedule.nextDeadline 
                        ? new Date(schedule.nextDeadline).toLocaleDateString()
                        : 'No upcoming deadlines'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Schedule Data</h3>
            <p className="text-muted-foreground">Schedule data will appear here as it becomes available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for Performance Report
function PerformanceReportContent() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('weekly');

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/users/performance?period=${reportType}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Generate CSV export
    const csvContent = generateCSVReport(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (data: any) => {
    if (!data || !data.users) return '';
    
    const headers = ['Name,Email,Tasks Completed,Average Completion Time,Efficiency Score'];
    const rows = data.users.map((user: any) => 
      `${user.name},${user.email},${user.tasksCompleted || 0},${user.avgCompletionTime || 'N/A'},${user.efficiencyScore || 'N/A'}`
    );
    
    return [headers, ...rows].join('\n');
  };

  if (loading) return <LoadingSpinner text="Loading performance data..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <div className="flex space-x-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {reportData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalTasksCompleted || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.averageEfficiency || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">On-Time Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.onTimeDelivery || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.users && reportData.users.length > 0 ? (
                <div className="space-y-3">
                  {reportData.users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Tasks: {user.tasksCompleted || 0}</p>
                        <p className="text-sm">Score: {user.efficiencyScore || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No performance data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Report Data</h3>
          <p className="text-muted-foreground">Performance data will appear here as it becomes available.</p>
        </div>
      )}
    </div>
  );
}
