import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic counts
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalDepartments,
      departmentsWithProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.task.count({ 
        where: { 
          status: { not: 'COMPLETED' },
          endDate: { lt: new Date() } 
        } 
      }),
      prisma.department.count(),
      prisma.department.count({
        where: {
          projects: { some: {} }
        }
      }),
    ])

    // Get data for charts
    const [usersByRole, projectsByStatus, tasksByPriority] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        _count: { _all: true },
      }),
    ])

    const dashboardData = {
      users: {
        total: totalUsers,
        active: totalUsers, // For now, assuming all users are active
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count._all
        }))
      },
      departments: {
        total: totalDepartments,
        withProjects: departmentsWithProjects,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        byStatus: projectsByStatus.map(item => ({
          status: item.status,
          count: item._count._all
        }))
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        byPriority: tasksByPriority.map(item => ({
          priority: item.priority,
          count: item._count._all
        }))
      },
      recentActivity: [] // We'll implement this later if needed
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
