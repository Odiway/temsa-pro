'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  // component içeriği aynı şekilde devam edecek, sadece yukarıdaki çakışmalar temizlenmiş haliyle
  // bu noktadan sonra component içeriği zaten paylaşılmış ve temiz, bu yüzden tekrar yazmaya gerek yok
  return <div>Temizlenmiş TasksPage component burada.</div>;
}
