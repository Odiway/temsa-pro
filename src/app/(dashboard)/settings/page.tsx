'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Bell, Clock, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  taskReminders: z.boolean(),
  weeklyReports: z.boolean(),
  timezone: z.string(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  defaultTaskCapacity: z.number().min(1).max(24),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface UserSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  weeklyReports: boolean;
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  defaultTaskCapacity: number;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      taskReminders: true,
      weeklyReports: false,
      timezone: 'UTC',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      defaultTaskCapacity: 8,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          reset(data);
        } else {
          // Use default values if no settings found
          const defaultSettings = {
            emailNotifications: true,
            taskReminders: true,
            weeklyReports: false,
            timezone: 'UTC',
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            defaultTaskCapacity: 8,
          };
          setSettings(defaultSettings);
          reset(defaultSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('Settings updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to update settings'));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error: Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and notifications</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={watchedValues.emailNotifications}
                  onCheckedChange={(checked: boolean) => setValue('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="taskReminders">Task Reminders</Label>
                  <p className="text-sm text-gray-600">Get reminders for upcoming tasks</p>
                </div>
                <Switch
                  id="taskReminders"
                  checked={watchedValues.taskReminders}
                  onCheckedChange={(checked: boolean) => setValue('taskReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-sm text-gray-600">Receive weekly performance reports</p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={watchedValues.weeklyReports}
                  onCheckedChange={(checked: boolean) => setValue('weeklyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Work Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select 
                  id="timezone"
                  {...register('timezone')}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                {errors.timezone && <p className="text-red-500 text-sm">{errors.timezone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workingHoursStart">Work Start Time</Label>
                  <Input 
                    id="workingHoursStart" 
                    type="time" 
                    {...register('workingHoursStart')} 
                  />
                  {errors.workingHoursStart && <p className="text-red-500 text-sm">{errors.workingHoursStart.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="workingHoursEnd">Work End Time</Label>
                  <Input 
                    id="workingHoursEnd" 
                    type="time" 
                    {...register('workingHoursEnd')} 
                  />
                  {errors.workingHoursEnd && <p className="text-red-500 text-sm">{errors.workingHoursEnd.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="defaultTaskCapacity">Default Daily Task Capacity (hours)</Label>
                <Input 
                  id="defaultTaskCapacity" 
                  type="number" 
                  min="1" 
                  max="24" 
                  {...register('defaultTaskCapacity', { valueAsNumber: true })} 
                />
                {errors.defaultTaskCapacity && <p className="text-red-500 text-sm">{errors.defaultTaskCapacity.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Application Version:</span>
                <span className="ml-2 text-gray-600">1.0.0</span>
              </div>
              <div>
                <span className="font-medium">User Role:</span>
                <span className="ml-2 text-gray-600 capitalize">
                  {session?.user.role?.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Login:</span>
                <span className="ml-2 text-gray-600">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
