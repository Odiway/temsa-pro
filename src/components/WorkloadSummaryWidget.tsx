'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface WorkloadSummary {
  totalUsers: number;
  avgUtilization: number;
  statusDistribution: {
    available: number;
    moderate: number;
    busy: number;
    critical: number;
    overloaded: number;
  };
}

export function WorkloadSummaryWidget() {
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkloadSummary();
  }, []);

  const fetchWorkloadSummary = async () => {
    try {
      const response = await fetch('/api/users/workload');
      if (response.ok) {
        const data = await response.json();
        if (data.teamSummary) {
          setWorkloadSummary(data.teamSummary);
        }
      }
    } catch (error) {
      console.error('Error fetching workload summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workloadSummary) {
    return (
      <div className="text-center p-6 text-gray-500">
        <Users className="h-8 w-8 mx-auto mb-2" />
        <p>No workload data available</p>
      </div>
    );
  }

  const statusItems = [
    { 
      key: 'available', 
      label: 'Available', 
      count: workloadSummary.statusDistribution.available, 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle 
    },
    { 
      key: 'moderate', 
      label: 'Moderate', 
      count: workloadSummary.statusDistribution.moderate, 
      color: 'bg-blue-100 text-blue-800',
      icon: Clock 
    },
    { 
      key: 'busy', 
      label: 'Busy', 
      count: workloadSummary.statusDistribution.busy, 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock 
    },
    { 
      key: 'critical', 
      label: 'Critical', 
      count: workloadSummary.statusDistribution.critical, 
      color: 'bg-orange-100 text-orange-800',
      icon: AlertCircle 
    },
    { 
      key: 'overloaded', 
      label: 'Overloaded', 
      count: workloadSummary.statusDistribution.overloaded, 
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle 
    }
  ];

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{workloadSummary.totalUsers}</div>
          <div className="text-sm text-gray-500">Total Team Members</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">{workloadSummary.avgUtilization}%</div>
          <div className="text-sm text-gray-500">Average Utilization</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {workloadSummary.statusDistribution.available}
          </div>
          <div className="text-sm text-gray-500">Available for Tasks</div>
        </div>
      </div>

      {/* Utilization Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Team Utilization</span>
          <span className="font-medium">{workloadSummary.avgUtilization}%</span>
        </div>
        <Progress value={workloadSummary.avgUtilization} className="h-3" />
      </div>

      {/* Status Distribution */}
      <div>
        <div className="text-sm font-medium mb-3">Workload Distribution</div>
        <div className="grid grid-cols-5 gap-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="text-center">
                <Badge className={`${item.color} w-full justify-center mb-1`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {item.count}
                </Badge>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert if needed */}
      {workloadSummary.statusDistribution.overloaded > 0 && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div className="text-sm">
            <span className="font-medium text-red-800">
              {workloadSummary.statusDistribution.overloaded} team member(s) overloaded
            </span>
            <span className="text-red-600 ml-1">- Consider redistributing tasks</span>
          </div>
        </div>
      )}
    </div>
  );
}
