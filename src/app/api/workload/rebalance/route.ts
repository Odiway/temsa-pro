import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
          },
          include: {
            project: true
          }
        }
      }
    });

    // Calculate workload for each user
    const usersWithWorkload = users.map(user => {
      const totalHours = user.assignedTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      );
      const workloadPercentage = Math.min((totalHours / 40) * 100, 200); // 40 hours = 100%
      
      return {
        ...user,
        totalHours,
        workloadPercentage,
        activeTasks: user.assignedTasks.length
      };
    });

    // Find overloaded users (>90% workload)
    const overloadedUsers = usersWithWorkload.filter(user => user.workloadPercentage > 90);
    
    // Find available users (<70% workload)
    const availableUsers = usersWithWorkload.filter(user => user.workloadPercentage < 70);

    if (overloadedUsers.length === 0) {
      return NextResponse.json({ 
        message: 'No overloaded users found',
        rebalanced: false 
      });
    }

    if (availableUsers.length === 0) {
      return NextResponse.json({ 
        message: 'No available users to redistribute tasks to',
        rebalanced: false 
      });
    }

    // Rebalancing logic: Move tasks from overloaded to available users
    let tasksRebalanced = 0;
    
    for (const overloadedUser of overloadedUsers) {
      // Get tasks that can be reassigned (TODO status, not urgent)
      const reassignableTasks = await prisma.task.findMany({
        where: {
          assigneeId: overloadedUser.id,
          status: 'TODO',
          priority: {
            not: 'URGENT'
          }
        },
        orderBy: {
          estimatedHours: 'desc' // Start with larger tasks
        },
        take: 3 // Limit to 3 tasks per user to avoid over-reassignment
      });

      for (const task of reassignableTasks) {
        // Find the most available user
        const targetUser = availableUsers.reduce((prev, current) => 
          prev.workloadPercentage < current.workloadPercentage ? prev : current
        );

        if (targetUser.workloadPercentage + ((task.estimatedHours || 0) / 40 * 100) < 80) {
          // Reassign the task
          await prisma.task.update({
            where: { id: task.id },
            data: { assigneeId: targetUser.id }
          });

          // Update target user's workload
          targetUser.workloadPercentage += (task.estimatedHours || 0) / 40 * 100;
          tasksRebalanced++;

          // Note: Task reassigned from ${overloadedUser.name} to ${targetUser.name} via auto-rebalancing
        }
      }
    }

    return NextResponse.json({
      message: `Successfully rebalanced ${tasksRebalanced} tasks`,
      rebalanced: true,
      tasksRebalanced,
      overloadedUsers: overloadedUsers.length,
      availableUsers: availableUsers.length
    });

  } catch (error) {
    console.error('Error rebalancing workload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
