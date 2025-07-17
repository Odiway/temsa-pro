'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { t } from '@/lib/translations';

interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  priority: string;
  phases: TaskPhase[];
}

interface TaskPhase {
  id: string;
  name: string;
  estimatedTime: number;
  order: number;
}

interface DeadlineCalculation {
  totalHours: number;
  workingDays: number;
  suggestedStartDate: Date;
  suggestedEndDate: Date;
  bufferDays: number;
  criticalPath: string[];
}

interface Props {
  projectId?: string;
  onCalculated?: (calculation: DeadlineCalculation) => void;
}

export default function DeadlineCalculator({ projectId, onCalculated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(8);
  const [teamSize, setTeamSize] = useState(1);
  const [bufferPercentage, setBufferPercentage] = useState(20);
  const [startDate, setStartDate] = useState<string>('');
  const [calculation, setCalculation] = useState<DeadlineCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectTasks();
    }
  }, [isOpen, projectId]);

  const fetchProjectTasks = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadline = () => {
    if (!startDate) return;

    // Calculate total estimated hours
    const totalHours = tasks.reduce((total, task) => {
      const taskHours = task.phases.reduce((phaseTotal, phase) => 
        phaseTotal + (phase.estimatedTime || 0), 0);
      return total + (taskHours || task.estimatedTime || 0);
    }, 0);

    // Calculate working days needed
    const effectiveHoursPerDay = workingHoursPerDay * teamSize;
    const baseWorkingDays = Math.ceil(totalHours / effectiveHoursPerDay);
    
    // Add buffer time
    const bufferDays = Math.ceil(baseWorkingDays * (bufferPercentage / 100));
    const totalWorkingDays = baseWorkingDays + bufferDays;

    // Calculate dates (accounting for weekends)
    const start = new Date(startDate);
    const end = new Date(start);
    
    let daysAdded = 0;
    while (daysAdded < totalWorkingDays) {
      end.setDate(end.getDate() + 1);
      // Skip weekends
      if (end.getDay() !== 0 && end.getDay() !== 6) {
        daysAdded++;
      }
    }

    // Identify critical path (highest priority tasks)
    const criticalPath = tasks
      .filter(task => task.priority === 'CRITICAL' || task.priority === 'HIGH')
      .sort((a, b) => {
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - 
               priorityOrder[a.priority as keyof typeof priorityOrder];
      })
      .slice(0, 3)
      .map(task => task.title);

    const result: DeadlineCalculation = {
      totalHours,
      workingDays: totalWorkingDays,
      suggestedStartDate: start,
      suggestedEndDate: end,
      bufferDays,
      criticalPath
    };

    setCalculation(result);
    onCalculated?.(result);
  };

  const resetCalculation = () => {
    setCalculation(null);
    setStartDate('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          {t('projects.calculateDeadline')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('projects.deadlineCalculator')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hesaplama Parametreleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="workingHours">Günlük Çalışma Saati</Label>
                  <Input
                    id="workingHours"
                    type="number"
                    min="1"
                    max="24"
                    value={workingHoursPerDay}
                    onChange={(e) => setWorkingHoursPerDay(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamSize">Takım Büyüklüğü</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="buffer">Buffer Yüzdesi (%)</Label>
                  <Input
                    id="buffer"
                    type="number"
                    min="0"
                    max="100"
                    value={bufferPercentage}
                    onChange={(e) => setBufferPercentage(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateDeadline} disabled={!startDate || loading}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Hesapla
                </Button>
                <Button variant="outline" onClick={resetCalculation}>
                  Sıfırla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proje Görevleri</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Görevler yükleniyor...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Bu projede henüz görev bulunmuyor
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{task.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({task.phases.length} aşama)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {task.phases.reduce((total, phase) => total + (phase.estimatedTime || 0), 0) || task.estimatedTime || 0}h
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculation Results */}
          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Hesaplama Sonuçları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculation.totalHours}h
                    </div>
                    <div className="text-sm text-blue-600">Toplam Çalışma Saati</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {calculation.workingDays}
                    </div>
                    <div className="text-sm text-green-600">İş Günü</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Önerilen Tarihler</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Başlangıç:</span> {formatDate(calculation.suggestedStartDate)}
                    </div>
                    <div>
                      <span className="font-medium">Bitiş:</span> {formatDate(calculation.suggestedEndDate)}
                    </div>
                    <div className="text-muted-foreground">
                      (Buffer: {calculation.bufferDays} gün dahil)
                    </div>
                  </div>
                </div>

                {calculation.criticalPath.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-600">Kritik Yol</span>
                    </div>
                    <div className="text-sm space-y-1">
                      {calculation.criticalPath.map((task, index) => (
                        <div key={index}>• {task}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
