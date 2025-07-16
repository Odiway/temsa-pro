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
    const userId = searchParams.get('userId')
    const departmentId = searchParams.get('departmentId')
    const timeframe = searchParams.get('timeframe') || '30' // days

    // Build where clause based on user permissions
    const whereClause: any = {}
    
    if (userId) whereClause.id = userId
    if (departmentId) whereClause.departmentId = departmentId

    // Role-based filtering
    if (session.user.role === 'FIELD') {
      // Field workers can only see their own stats
      whereClause.id = session.user.id
    } else if (session.user.role === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departmentId = user.departmentId
      }
    }

    // Date filter
    const timeframeDate = new Date()
    timeframeDate.setDate(timeframeDate.getDate() - parseInt(timeframe))

    // Get user performance statistics
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            estimatedHours: true,
            createdAt: true,
            updatedAt: true,
            endDate: true
          }
        },
        projectParticipations: {
          select: {
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    })

    // Calculate statistics for each user
    const userStats = users.map(user => {
      const allTasks = user.assignedTasks
      const recentTasks = allTasks.filter(task => 
        task.createdAt >= timeframeDate || task.updatedAt >= timeframeDate
      )

      // Task statistics
      const totalTasks = allTasks.length
      const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length
      const pendingTasks = allTasks.filter(t => t.status === 'PENDING').length
      const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length
      const overdueTasks = allTasks.filter(t => 
        t.endDate && t.endDate < new Date() && t.status !== 'COMPLETED'
      ).length

      // Priority distribution
      const highPriorityTasks = allTasks.filter(t => t.priority === 'HIGH').length
      const urgentTasks = allTasks.filter(t => t.priority === 'URGENT').length

      // Time tracking
      const totalEstimatedHours = allTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
      const completedHours = allTasks
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, task) => sum + (task.estimatedHours || 0), 0)

      // Performance metrics
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      const onTimeRate = totalTasks > 0 ? Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) : 100
      const workload = pendingTasks + inProgressTasks + overdueTasks

      // Recent activity
      const recentActivity = recentTasks.length
      const recentCompletions = recentTasks.filter(t => t.status === 'COMPLETED').length

      // Project involvement
      const activeProjects = user.projectParticipations.filter((p: any) => 
        p.project.status === 'ACTIVE'
      ).length

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        performance: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          overdueTasks,
          highPriorityTasks,
          urgentTasks,
          completionRate,
          onTimeRate,
          workload,
          totalEstimatedHours,
          completedHours,
          recentActivity,
          recentCompletions,
          activeProjects
        },
        taskDistribution: {
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks
        },
        priorityDistribution: {
          low: allTasks.filter(t => t.priority === 'LOW').length,
          medium: allTasks.filter(t => t.priority === 'MEDIUM').length,
          high: highPriorityTasks,
          urgent: urgentTasks
        }
      }
    })

    // Calculate team averages (if viewing multiple users)
    let teamAverages = null
    if (userStats.length > 1) {
      const totalUsers = userStats.length
      teamAverages = {
        avgCompletionRate: Math.round(
          userStats.reduce((sum, user) => sum + user.performance.completionRate, 0) / totalUsers
        ),
        avgOnTimeRate: Math.round(
          userStats.reduce((sum, user) => sum + user.performance.onTimeRate, 0) / totalUsers
        ),
        avgWorkload: Math.round(
          userStats.reduce((sum, user) => sum + user.performance.workload, 0) / totalUsers
        ),
        avgActiveProjects: Math.round(
          userStats.reduce((sum, user) => sum + user.performance.activeProjects, 0) / totalUsers
        ),
        totalTasks: userStats.reduce((sum, user) => sum + user.performance.totalTasks, 0),
        totalCompletedTasks: userStats.reduce((sum, user) => sum + user.performance.completedTasks, 0),
        totalEstimatedHours: userStats.reduce((sum, user) => sum + user.performance.totalEstimatedHours, 0)
      }
    }

    // Top performers
    const topPerformers = userStats
      .sort((a, b) => b.performance.completionRate - a.performance.completionRate)
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        name: user.name,
        completionRate: user.performance.completionRate,
        completedTasks: user.performance.completedTasks,
        onTimeRate: user.performance.onTimeRate
      }))

    return NextResponse.json({
      users: userStats,
      teamAverages,
      topPerformers,
      summary: {
        totalUsers: userStats.length,
        activeUsers: userStats.filter(u => u.performance.recentActivity > 0).length,
        highPerformers: userStats.filter(u => u.performance.completionRate >= 80).length,
        overloadedUsers: userStats.filter(u => u.performance.workload > 10).length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching user performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
