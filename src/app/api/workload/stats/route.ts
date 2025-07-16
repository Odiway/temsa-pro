import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all users with their workload
    const users = await prisma.user.findMany({
      include: {
        assignedTasks: {
          where: {
            status: {
              in: ['TODO', 'IN_PROGRESS']
            }
          }
        }
      }
    });

    // Calculate workload statistics
    let totalUsers = users.length;
    let overloadedUsers = 0;
    let busyUsers = 0;
    let availableUsers = 0;
    let totalWorkloadPercentage = 0;
    let totalActiveTasks = 0;

    users.forEach(user => {
      const totalHours = user.assignedTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      );
      const workloadPercentage = Math.min((totalHours / 40) * 100, 200); // 40 hours = 100%
      
      totalWorkloadPercentage += workloadPercentage;
      totalActiveTasks += user.assignedTasks.length;

      if (workloadPercentage > 90) {
        overloadedUsers++;
      } else if (workloadPercentage > 70) {
        busyUsers++;
      } else {
        availableUsers++;
      }
    });

    const averageWorkload = totalUsers > 0 ? Math.round(totalWorkloadPercentage / totalUsers) : 0;

    return NextResponse.json({
      totalUsers,
      overloadedUsers,
      busyUsers,
      availableUsers,
      averageWorkload,
      totalActiveTasks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching workload stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
