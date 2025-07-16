'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from '@/lib/translations';
import { ROLES, getAvailableRoles, getRoleDisplayName } from '@/lib/roles';
import toast from 'react-hot-toast';

const userSchema = z.object({
  name: z.string().min(1, t('forms.required')),
  email: z.string().email(t('forms.invalidEmail')),
  password: z.string().min(6, t('forms.passwordTooShort')).optional(),
  role: z.enum([ROLES.MANAGER, ROLES.DEPARTMENT, ROLES.FIELD]),
  departmentId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
  department?: { name: string };
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: ROLES.FIELD,
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // The API returns {users: [...], pagination: {...}}
        setUsers(Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
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

  const onSubmit = async (data: UserFormData) => {
    try {
      // Validate password for new users
      if (!editingUser && !data.password) {
        toast.error(t('forms.passwordTooShort'));
        return;
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const submitData = {
        ...data,
        departmentId: data.departmentId === 'no-department' ? undefined : data.departmentId,
      };
      
      // Only include password in request for new users or if password was provided for existing users
      if (editingUser && !data.password) {
        delete submitData.password;
      }
      
      console.log('Submitting data:', submitData);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchUsers();
        setIsDialogOpen(false);
        setEditingUser(null);
        reset();
        toast.success(editingUser ? t('users.userUpdated') : t('users.userCreated'));
      } else {
        const errorData = await response.json();
        console.error('Error saving user:', errorData);
        toast.error(t('errors.generic') + ': ' + (errorData.error || t('errors.validationError')));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error: Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role as any);
    setValue('departmentId', user.departmentId || 'no-department');
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex items-center justify-center min-h-screen">Please sign in.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('users.title')}</h1>
          <p className="text-muted-foreground">{t('users.title')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(null); reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('users.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? t('users.editUser') : t('users.addUser')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('users.name')}</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">{t('users.email')}</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
              )}
              <div>
                <Label htmlFor="role">{t('users.role')}</Label>
                <Select onValueChange={(value: string) => setValue('role', value as any)} defaultValue={ROLES.FIELD}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('users.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>
              <div>
                <Label htmlFor="department">{t('users.department')} ({t('common.options')})</Label>
                <Select onValueChange={(value: string) => setValue('departmentId', value === 'no-department' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('users.selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-department">{t('departments.department')} Yok</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingUser ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {t('users.users')} ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('users.name')}</th>
                  <th className="text-left p-2">{t('users.email')}</th>
                  <th className="text-left p-2">{t('users.role')}</th>
                  <th className="text-left p-2">{t('users.department')}</th>
                  <th className="text-left p-2">{t('users.createdAt')}</th>
                  <th className="text-left p-2">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="p-2">{user.department?.name || t('departments.department') + ' Yok'}</td>
                    <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
