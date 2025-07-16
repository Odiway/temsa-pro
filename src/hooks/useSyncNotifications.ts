import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { t } from '@/lib/translations';

interface NotificationData {
  type: 'project' | 'task' | 'user' | 'department';
  action: 'created' | 'updated' | 'deleted' | 'assigned';
  title: string;
  id: string;
  userId?: string;
  departmentId?: string;
}

interface UseSyncNotificationsProps {
  data: any;
  userId?: string;
  departmentId?: string;
  onNotification?: (notification: NotificationData) => void;
}

export function useSyncNotifications({ 
  data, 
  userId, 
  departmentId, 
  onNotification 
}: UseSyncNotificationsProps) {
  const previousDataRef = useRef<any>(null);

  useEffect(() => {
    if (!data || !previousDataRef.current) {
      previousDataRef.current = data;
      return;
    }

    const prevData = previousDataRef.current;
    const notifications: NotificationData[] = [];

    // Check for project changes
    if (data.projects && prevData.projects) {
      // New projects
      const newProjects = data.projects.filter((p: any) => 
        !prevData.projects.find((prev: any) => prev.id === p.id)
      );
      newProjects.forEach((project: any) => {
        if (isRelevantForUser(project, userId, departmentId)) {
          notifications.push({
            type: 'project',
            action: 'created',
            title: project.name,
            id: project.id,
            userId,
            departmentId
          });
        }
      });

      // Updated projects
      data.projects.forEach((project: any) => {
        const prevProject = prevData.projects.find((p: any) => p.id === project.id);
        if (prevProject && hasSignificantChange(project, prevProject) && 
            isRelevantForUser(project, userId, departmentId)) {
          notifications.push({
            type: 'project',
            action: 'updated',
            title: project.name,
            id: project.id,
            userId,
            departmentId
          });
        }
      });
    }

    // Check for task changes
    if (data.tasks && prevData.tasks) {
      // New tasks
      const newTasks = data.tasks.filter((t: any) => 
        !prevData.tasks.find((prev: any) => prev.id === t.id)
      );
      newTasks.forEach((task: any) => {
        if (isTaskRelevantForUser(task, userId, departmentId)) {
          notifications.push({
            type: 'task',
            action: 'created',
            title: task.title,
            id: task.id,
            userId,
            departmentId
          });
        }
      });

      // Task assignments
      data.tasks.forEach((task: any) => {
        const prevTask = prevData.tasks.find((t: any) => t.id === task.id);
        if (prevTask && task.assigneeId !== prevTask.assigneeId && task.assigneeId === userId) {
          notifications.push({
            type: 'task',
            action: 'assigned',
            title: task.title,
            id: task.id,
            userId,
            departmentId
          });
        }
      });

      // Task status changes
      data.tasks.forEach((task: any) => {
        const prevTask = prevData.tasks.find((t: any) => t.id === task.id);
        if (prevTask && task.status !== prevTask.status && 
            isTaskRelevantForUser(task, userId, departmentId)) {
          notifications.push({
            type: 'task',
            action: 'updated',
            title: task.title,
            id: task.id,
            userId,
            departmentId
          });
        }
      });
    }

    // Display notifications
    notifications.forEach(notification => {
      displayNotification(notification);
      onNotification?.(notification);
    });

    previousDataRef.current = data;
  }, [data, userId, departmentId, onNotification]);
}

function isRelevantForUser(item: any, userId?: string, departmentId?: string): boolean {
  // Check if the item is relevant for the current user
  if (item.departments) {
    return item.departments.some((dept: any) => dept.id === departmentId);
  }
  if (item.departmentId) {
    return item.departmentId === departmentId;
  }
  if (item.createdBy) {
    return item.createdBy === userId;
  }
  return true; // Show to all if no specific targeting
}

function isTaskRelevantForUser(task: any, userId?: string, departmentId?: string): boolean {
  if (task.assigneeId === userId) return true;
  if (task.departmentId === departmentId) return true;
  return false;
}

function hasSignificantChange(current: any, previous: any): boolean {
  const significantFields = ['status', 'assigneeId', 'priority', 'estimatedEndDate'];
  return significantFields.some(field => current[field] !== previous[field]);
}

function displayNotification(notification: NotificationData) {
  const messages = {
    project: {
      created: t('notifications.projectCreated'),
      updated: t('notifications.projectUpdated'),
      deleted: t('notifications.projectDeleted'),
      assigned: t('notifications.projectAssigned')
    },
    task: {
      created: t('notifications.taskCreated'),
      updated: t('notifications.taskUpdated'),
      deleted: t('notifications.taskDeleted'),
      assigned: t('notifications.taskAssigned')
    },
    user: {
      created: t('notifications.userCreated'),
      updated: t('notifications.userUpdated'),
      deleted: t('notifications.userDeleted'),
      assigned: t('notifications.userAssigned')
    },
    department: {
      created: t('notifications.departmentCreated'),
      updated: t('notifications.departmentUpdated'),
      deleted: t('notifications.departmentDeleted'),
      assigned: t('notifications.departmentAssigned')
    }
  };

  const message = `${messages[notification.type][notification.action]}: ${notification.title}`;
  
  const toastOptions = {
    duration: 4000,
    position: 'top-right' as const,
  };

  switch (notification.action) {
    case 'created':
      toast.success(message, toastOptions);
      break;
    case 'updated':
      toast(message, { ...toastOptions, icon: '🔄' });
      break;
    case 'assigned':
      toast(message, { ...toastOptions, icon: '📝' });
      break;
    case 'deleted':
      toast.error(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
}
