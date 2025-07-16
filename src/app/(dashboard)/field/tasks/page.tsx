'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckSquare, MessageSquare, Calendar, User, AlertCircle, Send, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from '@/lib/translations';
import toast from 'react-hot-toast';

const feedbackSchema = z.object({
  message: z.string().min(1, t('forms.required')),
  type: z.enum(['GENERAL', 'ISSUE', 'SUGGESTION', 'PROGRESS_UPDATE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project?: { name: string; department?: { name: string } };
  endDate?: string;
  createdAt: string;
  phases?: TaskPhase[];
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

export default function FieldTasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'GENERAL',
      priority: 'MEDIUM'
    }
  });

  const selectedType = watch('type');
  const selectedPriority = watch('priority');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMyTasks();
    }
  }, [status]);

  const fetchMyTasks = async () => {
    try {
      // Fetch tasks assigned to the current user
      const response = await fetch('/api/tasks?assignedToMe=true');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskPhases = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/phases`);
      if (response.ok) {
        const phases = await response.json();
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

  const handleUpdatePhaseStatus = async (taskId: string, phaseId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/phases`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId, status }),
      });

      if (response.ok) {
        await fetchTaskPhases(taskId);
        toast.success(t('tasks.phaseUpdated'));
      } else {
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error updating phase status:', error);
      toast.error(t('errors.generic'));
    }
  };

  const onSubmitFeedback = async (data: FeedbackFormData) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsFeedbackDialogOpen(false);
        setSelectedTask(null);
        reset();
        toast.success(t('feedback.feedbackSubmitted'));
      } else {
        toast.error(t('errors.generic'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('errors.generic'));
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
          <h1 className="text-3xl font-bold">{t('tasks.myTasks')}</h1>
          <p className="text-muted-foreground">{t('tasks.fieldDescription')}</p>
        </div>
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
                    onClick={() => {
                      setSelectedTask(task);
                      setIsFeedbackDialogOpen(true);
                    }}
                    title={t('feedback.sendFeedback')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchTaskPhases(task.id)}
                    title={t('tasks.taskPhases')}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                    {t(`taskStatus.${task.status}`)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {t(`taskPriority.${task.priority}`)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                )}

                <div className="text-sm">
                  <span className="font-medium">{t('tasks.project')}: </span>
                  <span>{task.project?.name}</span>
                  {task.project?.department && (
                    <span className="text-muted-foreground"> ({task.project.department.name})</span>
                  )}
                </div>

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

                {/* Task Phases */}
                {task.phases && task.phases.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">{t('tasks.taskPhases')}</h4>
                    <div className="space-y-2">
                      {task.phases.sort((a, b) => a.order - b.order).map((phase) => (
                        <div key={phase.id} className="border rounded p-2 bg-gray-50">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-medium">{phase.name}</p>
                              {phase.description && (
                                <p className="text-xs text-gray-600">{phase.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                phase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                phase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {t(`taskPhaseStatus.${phase.status}`)}
                              </span>
                              {phase.status !== 'COMPLETED' && (
                                <Select
                                  value={phase.status}
                                  onValueChange={(value) => handleUpdatePhaseStatus(task.id, phase.id, value)}
                                >
                                  <SelectTrigger className="h-6 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">{t('taskPhaseStatus.PENDING')}</SelectItem>
                                    <SelectItem value="IN_PROGRESS">{t('taskPhaseStatus.IN_PROGRESS')}</SelectItem>
                                    <SelectItem value="COMPLETED">{t('taskPhaseStatus.COMPLETED')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                          {phase.estimatedTime && (
                            <div className="text-xs text-gray-600">
                              {t('tasks.estimatedTime')}: {phase.estimatedTime}h
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {t('tasks.createdAt')}: {new Date(task.createdAt).toLocaleDateString()}
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
            <h3 className="text-lg font-medium mb-2">{t('tasks.noTasks')}</h3>
            <p className="text-muted-foreground mb-4">{t('tasks.noTasksAssigned')}</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('feedback.sendFeedback')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitFeedback)} className="space-y-4">
            <div>
              <Label htmlFor="message">{t('feedback.feedbackMessage')}</Label>
              <Input 
                id="message" 
                {...register('message')}
                placeholder={t('feedback.enterMessage')}
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">{t('feedback.feedbackType')}</Label>
                <Select 
                  value={selectedType} 
                  onValueChange={(value: any) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.pleaseSelect')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">{t('feedbackType.GENERAL')}</SelectItem>
                    <SelectItem value="ISSUE">{t('feedbackType.ISSUE')}</SelectItem>
                    <SelectItem value="SUGGESTION">{t('feedbackType.SUGGESTION')}</SelectItem>
                    <SelectItem value="PROGRESS_UPDATE">{t('feedbackType.PROGRESS_UPDATE')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">{t('feedback.feedbackPriority')}</Label>
                <Select 
                  value={selectedPriority} 
                  onValueChange={(value: any) => setValue('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('forms.pleaseSelect')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('feedbackPriority.LOW')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('feedbackPriority.MEDIUM')}</SelectItem>
                    <SelectItem value="HIGH">{t('feedbackPriority.HIGH')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                {t('feedback.sendFeedback')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
