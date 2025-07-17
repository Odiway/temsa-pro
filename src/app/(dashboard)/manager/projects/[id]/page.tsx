'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  Calendar, 
  DollarSign,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Building2,
  Clock,
  Target,
  UserPlus,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkloadDisplay } from '@/components/WorkloadDisplay';
import { WorkloadIndicator } from '@/components/WorkloadIndicator';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  assigneeId: z.string().optional(),
  estimatedHours: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  creator: { name: string; email: string };
  departments: { id: string; name: string }[];
  tasks: Task[];
  participants: { id: string; userId: string; role: string; user: { name: string; email: string } }[];
  _count: { tasks: number; participants: number };
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  actualHours?: number;
  endDate?: string;
  assignee?: { id: string; name: string; email: string };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const taskStatusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [isWorkloadDialogOpen, setIsWorkloadDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('PARTICIPANT');
  const [selectedPriority, setSelectedPriority] = useState('LOW');
  const [selectedStatus, setSelectedStatus] = useState('TODO');
  const [selectedAssignee, setSelectedAssignee] = useState('unassigned');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchAvailableUsers();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Handle both direct array and paginated response
        const users = data.users || data;
        setAvailableUsers(Array.isArray(users) ? users : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]);
    }
  };

  const handleTaskSubmit = async (data: TaskFormData) => {
    try {
      if (!project) return;
      
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const submitData = {
        ...data,
        projectId,
        departmentId: project.departments[0]?.id, // Use first department of the project
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        endDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assigneeId: data.assigneeId === 'unassigned' ? undefined : data.assigneeId,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchProject();
        setIsTaskDialogOpen(false);
        setEditingTask(null);
        reset();
      } else {
        const errorData = await response.json();
        console.error('Error saving task:', errorData);
        alert('Error: ' + (errorData.error || 'Failed to save task'));
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error: Failed to save task');
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch('/api/projects/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: selectedUserId,
          role: selectedUserRole,
        }),
      });

      if (response.ok) {
        await fetchProject();
        setIsParticipantDialogOpen(false);
        setSelectedUserId('');
        setSelectedUserRole('PARTICIPANT');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedPriority(task.priority);
    setSelectedStatus(task.status);
    setSelectedAssignee(task.assignee?.id || 'unassigned');
    
    // Set form values
    setValue('title', task.title);
    setValue('description', task.description || '');
    setValue('priority', task.priority as any);
    setValue('status', task.status as any);
    setValue('assigneeId', task.assignee?.id || 'unassigned');
    setValue('estimatedHours', task.estimatedHours?.toString() || '');
    setValue('dueDate', task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '');
    
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchProject();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">Please sign in.</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found.</div>;
  }

  // Prepare chart data
  const tasksByStatus = project.tasks.reduce((acc: any[], task) => {
    const existing = acc.find(item => item.status === task.status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ status: task.status, count: 1 });
    }
    return acc;
  }, []);

  const tasksByPriority = project.tasks.reduce((acc: any[], task) => {
    const existing = acc.find(item => item.priority === task.priority);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ priority: task.priority, count: 1 });
    }
    return acc;
  }, []);

  const completionRate = project.tasks.length > 0 
    ? Math.round((project.tasks.filter(task => task.status === 'COMPLETED').length / project.tasks.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manager/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FolderOpen className="mr-3 h-8 w-8" />
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}>
                {project.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {completionRate}% Complete
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isWorkloadDialogOpen} onOpenChange={setIsWorkloadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Team Workload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Team Workload Overview</DialogTitle>
              </DialogHeader>
              <WorkloadDisplay 
                departmentId={project?.departments[0]?.id}
                showTeamSummary={true}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { 
                setEditingTask(null); 
                setSelectedPriority('LOW');
                setSelectedStatus('TODO');
                setSelectedAssignee('unassigned');
                reset(); 
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleTaskSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register('description')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={selectedPriority || 'LOW'} 
                      onValueChange={(value) => {
                        setSelectedPriority(value);
                        setValue('priority', value as any);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={selectedStatus || 'TODO'} 
                      onValueChange={(value) => {
                        setSelectedStatus(value);
                        setValue('status', value as any);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input type="number" id="estimatedHours" {...register('estimatedHours')} />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input type="date" id="dueDate" {...register('dueDate')} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assigneeId">Assignee</Label>
                  <Select 
                    value={selectedAssignee || 'unassigned'} 
                    onValueChange={(value) => {
                      setSelectedAssignee(value);
                      setValue('assigneeId', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {project.participants.map((participant) => (
                        <SelectItem key={participant.userId} value={participant.userId}>
                          {participant.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Team workload preview */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Team Availability:</p>
                    <div className="space-y-2">
                      {project.participants.map((participant) => (
                        <div key={participant.userId} className="flex items-center justify-between">
                          <span className="text-sm">{participant.user.name}</span>
                          <WorkloadIndicator userId={participant.userId} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTask ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Project Participant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.filter(user => 
                        !project.participants.some(p => p.userId === user.id)
                      ).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role in Project</Label>
                  <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="PARTICIPANT">Participant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsParticipantDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddParticipant} disabled={!selectedUserId}>
                    Add Participant
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.tasks}</div>
            <p className="text-xs text-muted-foreground">
              {project.tasks.filter(t => t.status === 'COMPLETED').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.participants}</div>
            <p className="text-xs text-muted-foreground">
              Active participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Project completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracking</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No tasks yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksByPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No tasks yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {project.tasks.length > 0 ? (
                <div className="space-y-4">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded-full ${taskStatusColors[task.status as keyof typeof taskStatusColors]}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          {task.priority}
                        </span>
                        {task.assignee && (
                          <span className="text-muted-foreground">
                            Assigned to: {task.assignee.name}
                          </span>
                        )}
                        {task.endDate && (
                          <span className="text-muted-foreground">
                            Due: {new Date(task.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">Start by creating the first task for this project.</p>
                  <Button onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Info & Participants */}
        <div className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Created by</Label>
                <p className="text-sm text-muted-foreground">{project.creator.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Departments</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.departments.map((dept) => (
                    <span key={dept.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Building2 className="w-3 h-3 mr-1" />
                      {dept.name}
                    </span>
                  ))}
                </div>
              </div>
              {project.estimatedStartDate && (
                <div>
                  <Label className="text-sm font-medium">Estimated Start</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.estimatedStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {project.estimatedEndDate && (
                <div>
                  <Label className="text-sm font-medium">Estimated End</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.estimatedEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {project.participants.length > 0 ? (
                <div className="space-y-3">
                  {project.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.user.name}</p>
                        <p className="text-xs text-muted-foreground">{participant.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No team members yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
