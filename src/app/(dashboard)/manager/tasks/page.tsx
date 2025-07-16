'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
<<<<<<< HEAD
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, Plus, Edit, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  projectId: z.string().min(1, 'Project is required'),
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, Plus, Edit, Trash2, Calendar, User, AlertCircle, MessageSquare, Settings, ChevronDown, ChevronUp } from 'lucide-react';
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
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
=======
  phases?: TaskPhase[];
  feedbacks?: Feedback[];
}

interface TaskPhase {
  id: string;
  name: string;
  description?: string;
  status: string;
  order: number;
  estimatedTime?: number;
  actualTime?: number;
  startDate?: string;
  endDate?: string;
  assignedToId?: string;
  assignedTo?: { name: string };
}

interface Feedback {
  id: string;
  message: string;
  status: string;
  priority: string;
  type: string;
  submittedBy: { name: string; email: string };
  createdAt: string;
  reviewedAt?: string;
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
=======
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTaskForPhases, setSelectedTaskForPhases] = useState<string | null>(null);
  const [selectedTaskForFeedback, setSelectedTaskForFeedback] = useState<string | null>(null);
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  
  // Add controlled state for Select components
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [selectedPriority, setSelectedPriority] = useState<string>('MEDIUM');

<<<<<<< HEAD
=======
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

>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
      
<<<<<<< HEAD
=======
      // Ensure we have a valid departmentId
      let departmentId = editingTask?.departmentId || session?.user?.departmentId;
      
      // If we still don't have a departmentId, try to get the first available department
      if (!departmentId && projects.length > 0 && data.projectId) {
        const selectedProject = projects.find(p => p.id === data.projectId);
        departmentId = selectedProject?.department?.id;
      }
      
      if (!departmentId) {
        toast.error(t('errors.noDepartmentSelected'));
        return;
      }
      
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
      // Transform the data to match API expectations
      const apiData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        assigneeId: data.assignedToId, // Transform assignedToId to assigneeId for API
        endDate: data.endDate,
<<<<<<< HEAD
        // Use the existing departmentId if editing, or use IT department as default
        departmentId: editingTask?.departmentId || "af5ddff6-cf78-4b3b-8819-2b9bb3a4a979" // IT Department ID
=======
        departmentId: departmentId
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
      } else {
        const errorData = await response.text();
        console.error('Failed to save task:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
=======
        toast.success(editingTask ? t('tasks.taskUpdated') : t('tasks.taskCreated'));
      } else {
        const errorData = await response.text();
        console.error('Failed to save task:', response.status, errorData);
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(t('errors.generic'));
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
    if (confirm('Are you sure you want to delete this task?')) {
=======
    if (confirm(t('tasks.confirmDelete'))) {
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchTasks();
<<<<<<< HEAD
        }
      } catch (error) {
        console.error('Error deleting task:', error);
=======
          toast.success(t('tasks.taskDeleted'));
        } else {
          toast.error(t('errors.generic'));
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(t('errors.generic'));
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
      }
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date() && new Date(endDate).toDateString() !== new Date().toDateString();
  };

<<<<<<< HEAD
  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">Please sign in.</div>;
=======
  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const fetchTaskPhases = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/phases`);
      if (response.ok) {
        const phases = await response.json();
        // Update the task with phases
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, phases } : task
          )
        );
      }
    } catch (error) {
      console.error('Error fetching task phases:', error);
    }
  };

  const fetchTaskFeedbacks = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/feedbacks`);
      if (response.ok) {
        const feedbacks = await response.json();
        // Update the task with feedbacks
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, feedbacks } : task
          )
        );
      }
    } catch (error) {
      console.error('Error fetching task feedbacks:', error);
    }
  };

  const handleViewPhases = async (taskId: string) => {
    if (!expandedTasks.has(taskId)) {
      await fetchTaskPhases(taskId);
    }
    setSelectedTaskForPhases(taskId);
    toggleTaskExpansion(taskId);
  };

  const handleViewFeedbacks = async (taskId: string) => {
    if (!expandedTasks.has(taskId)) {
      await fetchTaskFeedbacks(taskId);
    }
    setSelectedTaskForFeedback(taskId);
    toggleTaskExpansion(taskId);
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">{t('auth.unauthorized')}</div>;
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
<<<<<<< HEAD
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage tasks and track progress</p>
        </div>
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
              Add Task
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
=======
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
                <DialogTitle>{editingTask ? t('tasks.editTask') : t('tasks.addTask')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('tasks.taskTitle')}</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description">{t('tasks.description')}</Label>
                  <Input id="description" {...register('description')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project">{t('tasks.project')}</Label>
                    <Select 
                      value={selectedProject} 
                      onValueChange={(value: string) => {
                        setSelectedProject(value);
                        setValue('projectId', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.pleaseSelect')} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.projectId && <p className="text-red-500 text-sm">{errors.projectId.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="assignedTo">{t('tasks.assignedTo')}</Label>
                    <Select 
                      value={selectedUser} 
                      onValueChange={(value: string) => {
                        setSelectedUser(value);
                        setValue('assignedToId', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.pleaseSelect')} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">{t('tasks.status')}</Label>
                    <Select 
                      value={selectedStatus} 
                      onValueChange={(value: string) => {
                        setSelectedStatus(value);
                        setValue('status', value as any);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.pleaseSelect')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">{t('taskStatus.PENDING')}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t('taskStatus.IN_PROGRESS')}</SelectItem>
                        <SelectItem value="COMPLETED">{t('taskStatus.COMPLETED')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">{t('tasks.priority')}</Label>
                    <Select 
                      value={selectedPriority} 
                      onValueChange={(value: string) => {
                        setSelectedPriority(value);
                        setValue('priority', value as any);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.pleaseSelect')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">{t('taskPriority.LOW')}</SelectItem>
                        <SelectItem value="MEDIUM">{t('taskPriority.MEDIUM')}</SelectItem>
                        <SelectItem value="HIGH">{t('taskPriority.HIGH')}</SelectItem>
                        <SelectItem value="CRITICAL">{t('taskPriority.CRITICAL')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate">{t('tasks.dueDate')}</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">
                    {editingTask ? t('common.update') : t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
=======
                    onClick={() => handleViewPhases(task.id)}
                    title={t('tasks.taskPhases')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewFeedbacks(task.id)}
                    title={t('tasks.feedbacks')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
=======
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleTaskExpansion(task.id)}
                  >
                    {expandedTasks.has(task.id) ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
<<<<<<< HEAD
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
=======
                  {t('tasks.createdAt')}: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            
            {/* Expanded content for phases and feedbacks */}
            {expandedTasks.has(task.id) && (
              <CardContent className="pt-0 border-t">
                {selectedTaskForPhases === task.id && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('tasks.taskPhases')}
                    </h4>
                    {task.phases && task.phases.length > 0 ? (
                      <div className="space-y-2">
                        {task.phases.sort((a, b) => a.order - b.order).map((phase) => (
                          <div key={phase.id} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium">{phase.name}</h5>
                                {phase.description && (
                                  <p className="text-sm text-gray-600">{phase.description}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                phase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                phase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {t(`taskPhaseStatus.${phase.status}`)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                              {phase.estimatedTime && (
                                <div>{t('tasks.estimatedTime')}: {phase.estimatedTime}h</div>
                              )}
                              {phase.actualTime && (
                                <div>{t('tasks.actualTime')}: {phase.actualTime}h</div>
                              )}
                              {phase.assignedTo && (
                                <div>{t('tasks.assignedTo')}: {phase.assignedTo.name}</div>
                              )}
                              {phase.endDate && (
                                <div>{t('tasks.dueDate')}: {new Date(phase.endDate).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('tasks.noPhases')}</p>
                    )}
                  </div>
                )}
                
                {selectedTaskForFeedback === task.id && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('tasks.feedbacks')}
                    </h4>
                    {task.feedbacks && task.feedbacks.length > 0 ? (
                      <div className="space-y-3">
                        {task.feedbacks.map((feedback) => (
                          <div key={feedback.id} className="border rounded p-3 bg-blue-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{feedback.submittedBy.name}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  feedback.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  feedback.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {t(`feedbackPriority.${feedback.priority}`)}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  feedback.status === 'REVIEWED' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {t(`feedbackStatus.${feedback.status}`)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm mb-2">{feedback.message}</p>
                            <div className="text-xs text-gray-600">
                              {t('feedback.type')}: {t(`feedbackType.${feedback.type}`)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('tasks.noFeedbacks')}</p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
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
