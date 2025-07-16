import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const departmentId = searchParams.get('departmentId')
    const userId = searchParams.get('userId')

    // Build where clause based on filters and user permissions
    const whereClause: any = {}
    
    if (projectId) whereClause.projectId = projectId
    if (departmentId) whereClause.departmentId = departmentId
    if (userId) whereClause.assigneeId = userId

    // Role-based filtering
    if (session.user.role === 'FIELD') {
      whereClause.assigneeId = session.user.id
    } else if (session.user.role === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departmentId = user.departmentId
      }
    }

    // Get task statistics
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      highPriorityTasks,
      urgentTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByUser
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({ where: whereClause }),
      
      // Tasks by status
      prisma.task.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.task.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      
      // Overdue tasks
      prisma.task.count({
        where: {
          ...whereClause,
          endDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      
      // Priority tasks
      prisma.task.count({ where: { ...whereClause, priority: 'HIGH' } }),
      prisma.task.count({ where: { ...whereClause, priority: 'URGENT' } }),
      
      // Tasks grouped by status
      prisma.task.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true }
      }),
      
      // Tasks grouped by priority
      prisma.task.groupBy({
        by: ['priority'],
        where: whereClause,
        _count: { id: true }
      }),
      
      // Tasks by assignee (only for managers and admins)
      session.user.role === 'FIELD' ? [] : prisma.task.groupBy({
        by: ['assigneeId'],
        where: { ...whereClause, assigneeId: { not: null } },
        _count: { id: true },
        _avg: { estimatedHours: true },
        _sum: { estimatedHours: true }
      })
    ])

    // Get user names for task assignments (if not field worker)
    let userNames: { [key: string]: string } = {}
    if (session.user.role !== 'FIELD' && tasksByUser.length > 0) {
      const users = await prisma.user.findMany({
        where: {
          id: { in: tasksByUser.map(t => t.assigneeId).filter(Boolean) as string[] }
        },
        select: { id: true, name: true }
      })
      userNames = users.reduce((acc, user) => ({ ...acc, [user.id]: user.name }), {})
    }

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate productivity metrics
    const activeTasksCount = pendingTasks + inProgressTasks
    const workload = activeTasksCount + overdueTasks

    return NextResponse.json({
      summary: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        highPriorityTasks,
        urgentTasks,
        completionRate,
        workload
      },
      charts: {
        tasksByStatus: tasksByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        tasksByPriority: tasksByPriority.map(item => ({
          priority: item.priority,
          count: item._count.id
        })),
        tasksByUser: tasksByUser.map(item => ({
          userId: item.assigneeId,
          userName: item.assigneeId ? userNames[item.assigneeId as string] || 'Unknown' : 'Unassigned',
          count: item._count.id,
          averageHours: Math.round((item._avg.estimatedHours || 0) * 100) / 100,
          totalHours: item._sum.estimatedHours || 0
        }))
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching task statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
