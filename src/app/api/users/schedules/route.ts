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

    // Get all users with their current tasks and schedules
    const users = await prisma.user.findMany({
      include: {
        assignedTasks: {
          where: {
            status: {
              in: ['TODO', 'IN_PROGRESS']
            }
          },
          include: {
            project: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Build schedule data for each user
    const schedules = users.map(user => {
      const activeTasks = user.assignedTasks.length;
      const nextTask = user.assignedTasks[0];
      const totalHours = user.assignedTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      );
      const workloadPercentage = Math.min((totalHours / 40) * 100, 200); // 40 hours = 100%

      // Determine status based on workload
      let status = 'Available';
      if (workloadPercentage > 90) {
        status = 'Overloaded';
      } else if (workloadPercentage > 70) {
        status = 'Busy';
      } else if (workloadPercentage > 50) {
        status = 'Moderate Load';
      }

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status,
        activeTasks,
        workloadPercentage: Math.round(workloadPercentage),
        nextDeadline: nextTask?.endDate,
        nextTaskTitle: nextTask?.title,
        nextProjectName: nextTask?.project?.name,
        totalEstimatedHours: totalHours,
        upcomingTasks: user.assignedTasks.slice(0, 3).map(task => ({
          id: task.id,
          title: task.title,
          dueDate: task.endDate,
          priority: task.priority,
          projectName: task.project?.name
        }))
      };
    });

    // Sort by workload percentage (highest first) to prioritize attention
    schedules.sort((a, b) => b.workloadPercentage - a.workloadPercentage);

    return NextResponse.json({
      schedules,
      summary: {
        totalUsers: users.length,
        overloadedUsers: schedules.filter(s => s.workloadPercentage > 90).length,
        busyUsers: schedules.filter(s => s.workloadPercentage > 70 && s.workloadPercentage <= 90).length,
        availableUsers: schedules.filter(s => s.workloadPercentage <= 50).length
      }
    });

  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
