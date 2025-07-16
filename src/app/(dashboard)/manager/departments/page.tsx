'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Edit, Trash2, Users, Crown, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { t } from '@/lib/translations';
import toast from 'react-hot-toast';
import { normalizeRole } from '@/lib/roles';

const departmentSchema = z.object({
  name: z.string().min(1, t('forms.required')),
  description: z.string().optional(),
  headId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  head?: { id: string; name: string; email: string };
  _count?: { users: number; projects: number };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DepartmentsPage() {
  const { data: session, status } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users:', data); // Debug log
        // API returns {users: [...], pagination: {...}} format
        const usersList = data.users || data;
        setUsers(Array.isArray(usersList) ? usersList : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
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
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : '/api/departments';
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const submitData = {
        ...data,
        headId: data.headId === 'no-head' ? undefined : data.headId,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchDepartments();
        setIsDialogOpen(false);
        setEditingDepartment(null);
        reset();
        toast.success(editingDepartment ? t('departments.departmentUpdated') : t('departments.departmentCreated'));
      } else {
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(t('errors.generic'));
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    reset({
      name: department.name,
      description: department.description || '',
      headId: department.headId || 'no-head',
    });
    // Set the form value for controlled component
    setValue('headId', department.headId || 'no-head');
    setIsDialogOpen(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (confirm(t('departments.confirmDelete'))) {
      try {
        const response = await fetch(`/api/departments/${departmentId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchDepartments();
          toast.success(t('departments.departmentDeleted'));
        } else {
          toast.error(t('errors.generic'));
        }
      } catch (error) {
        console.error('Error deleting department:', error);
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
          <h1 className="text-3xl font-bold">{t('departments.title')}</h1>
          <p className="text-muted-foreground">{t('departments.description')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDepartment(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('departments.addDepartment')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDepartment ? t('departments.editDepartment') : t('departments.addDepartment')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('departments.name')}</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">{t('departments.departmentDescription')} ({t('forms.optional')})</Label>
                <Input id="description" {...register('description')} />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
              <div>
                <Label htmlFor="headId">{t('departments.head')} ({t('forms.optional')})</Label>
                <Select 
                  value={editingDepartment ? (editingDepartment.headId || 'no-head') : 'no-head'} 
                  onValueChange={(value) => setValue('headId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('departments.selectHead')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-head">{t('departments.noHeadAssigned')}</SelectItem>
                    {users
                      .filter((user) => {
                        const normalizedRole = normalizeRole(user.role);
                        return normalizedRole === 'MANAGER' || normalizedRole === 'DEPARTMENT';
                      })
                      .map((user) => {
                        const normalizedRole = normalizeRole(user.role);
                        console.log('Eligible head user:', user.name, 'original role:', user.role, 'normalized:', normalizedRole);
                        return (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingDepartment ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  {department.name}
                </div>
                <div className="flex space-x-1">
                  <Link href={`/manager/departments/${department.id}`}>
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
                    onClick={() => handleEdit(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(department.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {department.description && (
                  <p className="text-sm text-muted-foreground">{department.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Users className="mr-1 h-4 w-4" />
                    {department._count?.users || 0} {t('departments.members')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {department._count?.projects || 0} {t('departments.projects')}
                  </div>
                </div>

                {department.head && (
                  <div className="flex items-center text-sm">
                    <Crown className="mr-1 h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{t('departments.head')}: </span>
                    <span className="ml-1">{department.head.name}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {t('common.created')}: {new Date(department.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('departments.noDepartments')}</h3>
            <p className="text-muted-foreground mb-4">{t('departments.createFirstDepartment')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('departments.addDepartment')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
