'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface WorkloadIndicatorProps {
  userId: string;
  compact?: boolean;
}

interface UserWorkload {
  workload: {
    utilizationRate: number;
    status: string;
    availableHours: number;
  };
}

const statusConfig = {
  available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  moderate: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  busy: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  critical: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  overloaded: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export function WorkloadIndicator({ userId, compact = true }: WorkloadIndicatorProps) {
  const [workload, setWorkload] = useState<UserWorkload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserWorkload();
  }, [userId]);

  const fetchUserWorkload = async () => {
    try {
      const response = await fetch(`/api/users/workload?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setWorkload(data.users[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user workload:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>;
  }

  if (!workload) {
    return <Badge variant="outline" className="text-xs">Unknown</Badge>;
  }

  const config = statusConfig[workload.workload.status as keyof typeof statusConfig] || statusConfig.available;
  const Icon = config.icon;

  if (compact) {
    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {workload.workload.utilizationRate}%
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {workload.workload.status}
      </Badge>
      <span className="text-sm text-gray-600">
        {workload.workload.utilizationRate}% ({workload.workload.availableHours}h free)
      </span>
    </div>
  );
}
