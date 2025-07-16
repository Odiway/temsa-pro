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
    const includeProjectParticipants = searchParams.get('includeProjectParticipants') === 'true'

    // Build where clause based on user permissions and filters
    const whereClause: any = {}
    
    if (userId) {
      whereClause.id = userId
    }
    
    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    // Role-based filtering
    if (session.user.role === 'FIELD') {
      // Field workers can only see their own workload
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
    // Admins can see all users

    // Get current date for calculations
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Fetch users with their workload data
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        capacity: true,
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
            title: true,
            status: true,
            priority: true,
            estimatedHours: true,
            actualHours: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        },
        projectParticipations: includeProjectParticipants ? {
          select: {
            role: true,
            joinedAt: true,
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                estimatedStartDate: true,
                estimatedEndDate: true
              }
            }
          }
        } : false
      },
      orderBy: { name: 'asc' }
    })

    // Calculate workload for each user
    const userWorkloads = users.map(user => {
      const activeTasks = user.assignedTasks.filter(task => 
        task.status === 'PENDING' || task.status === 'IN_PROGRESS'
      )
      
      const completedTasks = user.assignedTasks.filter(task => 
        task.status === 'COMPLETED'
      )

      // Current workload calculation
      const currentWorkloadHours = activeTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      )

      // Upcoming workload (tasks starting within next week)
      const upcomingTasks = activeTasks.filter(task => 
        task.startDate && 
        new Date(task.startDate) <= nextWeek &&
        new Date(task.startDate) > now
      )
      const upcomingWorkloadHours = upcomingTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      )

      // Overdue tasks
      const overdueTasks = activeTasks.filter(task => 
        task.endDate && new Date(task.endDate) < now
      )

      // Tasks by priority
      const urgentTasks = activeTasks.filter(task => task.priority === 'URGENT')
      const highPriorityTasks = activeTasks.filter(task => task.priority === 'HIGH')

      // Calculate utilization rate
      const utilizationRate = user.capacity > 0 ? 
        Math.round((currentWorkloadHours / user.capacity) * 100) : 0

      // Available capacity
      const availableHours = Math.max(0, user.capacity - currentWorkloadHours)

      // Determine workload status
      let workloadStatus = 'available'
      let statusColor = 'green'
      
      if (utilizationRate >= 100) {
        workloadStatus = 'overloaded'
        statusColor = 'red'
      } else if (utilizationRate >= 90) {
        workloadStatus = 'critical'
        statusColor = 'orange'
      } else if (utilizationRate >= 70) {
        workloadStatus = 'busy'
        statusColor = 'yellow'
      } else if (utilizationRate >= 40) {
        workloadStatus = 'moderate'
        statusColor = 'blue'
      }

      // Performance metrics
      const totalTasksCompleted = completedTasks.length
      const avgTaskCompletionTime = completedTasks.length > 0 ? 
        completedTasks.reduce((sum, task) => {
          if (task.createdAt && task.actualHours) {
            return sum + (task.actualHours / (task.estimatedHours || 1))
          }
          return sum + 1
        }, 0) / completedTasks.length : 1

      // Project involvement
      const activeProjects = includeProjectParticipants ? 
        (user.projectParticipations as any[])?.filter(p => p.project.status === 'ACTIVE') || [] : []

      // Recent activity indicator
      const recentlyActive = user.assignedTasks.some(task => 
        task.createdAt && new Date(task.createdAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      )

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        workload: {
          capacity: user.capacity,
          currentHours: currentWorkloadHours,
          upcomingHours: upcomingWorkloadHours,
          availableHours: availableHours,
          utilizationRate: utilizationRate,
          status: workloadStatus,
          statusColor: statusColor
        },
        tasks: {
          total: user.assignedTasks.length,
          active: activeTasks.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          urgent: urgentTasks.length,
          highPriority: highPriorityTasks.length,
          pending: activeTasks.filter(t => t.status === 'PENDING').length,
          inProgress: activeTasks.filter(t => t.status === 'IN_PROGRESS').length
        },
        projects: {
          total: activeProjects.length,
          asManager: activeProjects.filter((p: any) => p.role === 'MANAGER').length,
          asParticipant: activeProjects.filter((p: any) => p.role === 'PARTICIPANT').length
        },
        performance: {
          completedTasks: totalTasksCompleted,
          avgEfficiency: Math.round((2 - avgTaskCompletionTime) * 100), // Efficiency score
          recentlyActive: recentlyActive,
          onTimeRate: completedTasks.length > 0 ? 
            Math.round((completedTasks.filter(t => 
              !t.endDate || new Date(t.endDate) >= now
            ).length / completedTasks.length) * 100) : 100
        },
        upcomingDeadlines: activeTasks
          .filter(task => task.endDate)
          .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
          .slice(0, 3)
          .map(task => ({
            id: task.id,
            title: task.title,
            endDate: task.endDate,
            priority: task.priority,
            project: task.project?.name || 'No Project',
            daysLeft: Math.ceil((new Date(task.endDate!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          }))
      }
    })

    // Calculate team summary if viewing multiple users
    let teamSummary = null
    if (userWorkloads.length > 1) {
      const totalCapacity = userWorkloads.reduce((sum, u) => sum + u.workload.capacity, 0)
      const totalAssigned = userWorkloads.reduce((sum, u) => sum + u.workload.currentHours, 0)
      
      teamSummary = {
        totalUsers: userWorkloads.length,
        totalCapacity: totalCapacity,
        totalAssigned: totalAssigned,
        totalAvailable: totalCapacity - totalAssigned,
        avgUtilization: Math.round((totalAssigned / totalCapacity) * 100),
        statusDistribution: {
          available: userWorkloads.filter(u => u.workload.status === 'available').length,
          moderate: userWorkloads.filter(u => u.workload.status === 'moderate').length,
          busy: userWorkloads.filter(u => u.workload.status === 'busy').length,
          critical: userWorkloads.filter(u => u.workload.status === 'critical').length,
          overloaded: userWorkloads.filter(u => u.workload.status === 'overloaded').length
        }
      }
    }

    return NextResponse.json({
      users: userWorkloads,
      teamSummary,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching user workload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
