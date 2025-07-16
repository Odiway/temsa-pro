'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, Plus, Edit, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from '@/lib/translations';
import toast from 'react-hot-toast';
import { useTaskSync } from '@/hooks/useRealTimeSync';
import { SyncStatus } from '@/components/SyncStatus';
import { useSyncNotifications } from '@/hooks/useSyncNotifications';

const taskSchema = z.object({
  title: z.string().min(1, t('forms.required')),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  projectId: z.string().min(1, t('forms.required')),
  assignedToId: z.string().optional(),
  endDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
  project?: { name: string; department?: { name: string } };
  assignedToId?: string;
  assignedTo?: { name: string };
  endDate?: string;
  departmentId: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  department?: { id: string; name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Add controlled state for Select components
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [selectedPriority, setSelectedPriority] = useState<string>('MEDIUM');

  // Use real-time sync for tasks
  const { data: syncData, loading: syncLoading, error: syncError, forceRefresh, isConnected } = useTaskSync(
    (newTasks) => {
      setTasks(newTasks);
    }
  );

  // Set up sync notifications for manager
  useSyncNotifications({
    data: syncData,
    userId: session?.user?.id,
    departmentId: session?.user?.departmentId,
    onNotification: (notification) => {
      console.log('Manager task notification:', notification);
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'PENDING',
      priority: 'MEDIUM'
    }
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
      fetchProjects();
      fetchUsers();
    }
  }, [status]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const response = await fetch('/api/projects');
      console.log('Projects response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data:', data);
        setProjects(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Users response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Users data:', data);
        // API returns {users: [...], pagination: {...}} format
        const usersList = data.users || data;
        setUsers(Array.isArray(usersList) ? usersList : []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      // Transform the data to match API expectations
      const apiData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        assigneeId: data.assignedToId, // Transform assignedToId to assigneeId for API
        endDate: data.endDate,
        // Use the existing departmentId if editing, or use IT department as default
        departmentId: editingTask?.departmentId || "af5ddff6-cf78-4b3b-8819-2b9bb3a4a979" // IT Department ID
      };
      
      console.log('Submitting data:', apiData);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        console.log('Task saved successfully');
        await fetchTasks();
        setIsDialogOpen(false);
        setEditingTask(null);
        reset();
        // Reset controlled state
        setSelectedProject('');
        setSelectedUser('');
        setSelectedStatus('PENDING');
        setSelectedPriority('MEDIUM');
        toast.success(editingTask ? t('tasks.taskUpdated') : t('tasks.taskCreated'));
      } else {
        const errorData = await response.text();
        console.error('Failed to save task:', response.status, errorData);
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(t('errors.generic'));
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setSelectedProject(task.projectId);
    setSelectedUser(task.assignedToId || '');
    setSelectedStatus(task.status);
    setSelectedPriority(task.priority);
    
    reset({
      title: task.title,
      description: task.description || '',
      status: task.status as any,
      priority: task.priority as any,
      projectId: task.projectId,
      assignedToId: task.assignedToId || '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm(t('tasks.confirmDelete'))) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchTasks();
          toast.success(t('tasks.taskDeleted'));
        } else {
          toast.error(t('errors.generic'));
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(t('errors.generic'));
      }
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date() && new Date(endDate).toDateString() !== new Date().toDateString();
  };

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
          <h1 className="text-3xl font-bold">{t('tasks.title')}</h1>
          <p className="text-muted-foreground">{t('projects.description')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <SyncStatus 
            isConnected={isConnected}
            loading={syncLoading}
            error={syncError}
            lastUpdated={syncData?.lastUpdated}
            onRefresh={forceRefresh}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { 
                setEditingTask(null);
                setSelectedProject('');
                setSelectedUser('');
                setSelectedStatus('PENDING');
                setSelectedPriority('MEDIUM');
                reset({
                  title: '',
                  description: '',
                  projectId: '',
                  assignedToId: '',
                  status: 'PENDING',
                  priority: 'MEDIUM',
                  endDate: ''
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('tasks.addTask')}
              </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <Label htmlFor="project">Project</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value);
                      setValue('projectId', e.target.value);
                    }}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} {project.department?.name ? `(${project.department.name})` : ''}
                      </option>
                    ))}
                  </select>
                  {projects.length === 0 && <p className="text-sm text-gray-500">No projects available</p>}
                  {errors.projectId && <p className="text-red-500 text-sm">{errors.projectId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedUser}
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      setValue('assignedToId', e.target.value);
                    }}
                  >
                    <option value="">Select user</option>
                    <option value="d9d95263-5faa-49b6-9379-e06f94c610d9">Admin User (admin@temsafy.com)</option>
                    <option value="17f9666e-df8d-48e6-9ed8-9b0f1f41911c">John Manager (manager@temsafy.com)</option>
                    <option value="9dea7b86-faa8-4314-8350-9245b94c1ea6">Alice Field (alice@temsafy.com)</option>
                    <option value="bebb313e-c8cb-436c-af30-68668c2c3dde">Bob Worker (bob@temsafy.com)</option>
                    <option value="8cce5f2b-fb0b-4afa-b74b-a981a1430ec5">Sarah Department Head (sarah@temsafy.com)</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && <p className="text-sm text-gray-500">Loading users... ({users.length} users loaded)</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setValue('status', e.target.value as any);
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPriority}
                    onChange={(e) => {
                      setSelectedPriority(e.target.value);
                      setValue('priority', e.target.value as any);
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
                </div>
                <div>
                  <Label htmlFor="endDate">Due Date</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5" />
                  <span className="truncate">{task.title}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                )}

                <div className="text-sm">
                  <span className="font-medium">Project: </span>
                  <span>{task.project?.name}</span>
                  {task.project?.department && (
                    <span className="text-muted-foreground"> ({task.project.department.name})</span>
                  )}
                </div>

                {task.assignedTo && (
                  <div className="flex items-center text-sm">
                    <User className="mr-1 h-4 w-4" />
                    <span>{task.assignedTo.name}</span>
                  </div>
                )}

                {task.endDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span className={isOverdue(task.endDate) && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}>
                      {new Date(task.endDate).toLocaleDateString()}
                    </span>
                    {isOverdue(task.endDate) && task.status !== 'COMPLETED' && (
                      <AlertCircle className="ml-1 h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first task.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
