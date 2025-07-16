'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FolderOpen, Plus, Edit, Trash2, Calendar, DollarSign, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { t } from '@/lib/translations';
import toast from 'react-hot-toast';

const projectSchema = z.object({
  name: z.string().min(1, t('forms.required')),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  departmentIds: z.array(z.string()).min(1, t('forms.required')),
  estimatedStartDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  departments: { id: string; name: string }[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  creator?: { name: string; email: string };
  _count?: { tasks: number; participants: number };
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    fetchProjects();
    fetchDepartments();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const submitData = {
        name: data.name,
        description: data.description,
        status: data.status,
        estimatedStartDate: data.estimatedStartDate,
        estimatedEndDate: data.estimatedEndDate,
        departmentIds: data.departmentIds,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchProjects();
        setIsDialogOpen(false);
        setEditingProject(null);
        reset();
        toast.success(editingProject ? t('projects.projectUpdated') : t('projects.projectCreated'));
      } else {
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(t('errors.generic'));
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description || '',
      status: project.status as any,
      departmentIds: project.departments?.map(d => d.id) || [],
      estimatedStartDate: project.estimatedStartDate ? project.estimatedStartDate.split('T')[0] : '',
      estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.split('T')[0] : '',
    });
    
    // Set form values for controlled components
    setValue('status', project.status as any);
    setValue('departmentIds', project.departments?.map(d => d.id) || []);
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (confirm(t('projects.confirmDelete'))) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchProjects();
          toast.success(t('projects.projectDeleted'));
        } else {
          toast.error(t('errors.generic'));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error(t('errors.generic'));
      }
    }
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
          <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
          <p className="text-muted-foreground">{t('projects.description')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProject(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('projects.addProject')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? t('projects.editProject') : t('projects.addProject')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('projects.name')}</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="departments">{t('projects.departments')}</Label>
                  <Select 
                    value={editingProject ? (editingProject.departments?.[0]?.id || '') : ''} 
                    onValueChange={(value: string) => setValue('departmentIds', [value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('users.selectDepartment')} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentIds && <p className="text-red-500 text-sm">{errors.departmentIds.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">{t('projects.projectDescription')}</Label>
                <Input id="description" {...register('description')} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="status">{t('projects.status')}</Label>
                  <Select 
                    value={editingProject ? editingProject.status : ''} 
                    onValueChange={(value: string) => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('forms.pleaseSelect')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{t('projectStatus.DRAFT')}</SelectItem>
                      <SelectItem value="PLANNING">{t('projectStatus.PLANNING')}</SelectItem>
                      <SelectItem value="ACTIVE">{t('projectStatus.ACTIVE')}</SelectItem>
                      <SelectItem value="COMPLETED">{t('projectStatus.COMPLETED')}</SelectItem>
                      <SelectItem value="CANCELLED">{t('projectStatus.CANCELLED')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedStartDate">{t('projects.estimatedStartDate')}</Label>
                  <Input id="estimatedStartDate" type="date" {...register('estimatedStartDate')} />
                </div>
                <div>
                  <Label htmlFor="estimatedEndDate">{t('projects.estimatedEndDate')}</Label>
                  <Input id="estimatedEndDate" type="date" {...register('estimatedEndDate')} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingProject ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  <span className="truncate">{project.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Link href={`/manager/projects/${project.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                    {t(`projectStatus.${project.status}`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {project._count?.tasks || 0} {t('projects.tasks')}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}

                <div className="text-sm">
                  <span className="font-medium">{t('projects.departments')}: </span>
                  <span>{project.departments?.map(d => d.name).join(', ') || t('common.none')}</span>
                </div>

                {project.estimatedStartDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>
                      {new Date(project.estimatedStartDate).toLocaleDateString()}
                      {project.estimatedEndDate && ` - ${new Date(project.estimatedEndDate).toLocaleDateString()}`}
                    </span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {t('common.created')}: {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('projects.noProjects')}</h3>
            <p className="text-muted-foreground mb-4">{t('projects.createFirstProject')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('projects.addProject')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
