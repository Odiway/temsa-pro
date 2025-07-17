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

    // Only managers and admins can access workload alerts
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER' && session.user.role !== 'DEPARTMENT_HEAD') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const severity = searchParams.get('severity') // 'all', 'critical', 'overloaded'

    // Build where clause based on user permissions
    const whereClause: any = {}
    
    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    // Department heads can only see their department
    if (session.user.role === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departmentId = user.departmentId
      }
    }

    // Get users with their workload data
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        capacity: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTasks: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] }
          },
          select: {
            id: true,
            title: true,
            priority: true,
            estimatedHours: true,
            endDate: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Calculate alerts for each user
    const alerts: any[] = []
    const now = new Date()

    users.forEach(user => {
      const activeTasks = user.assignedTasks
      const currentWorkloadHours = activeTasks.reduce((sum, task) => 
        sum + (task.estimatedHours || 0), 0
      )
      const utilizationRate = user.capacity > 0 ? 
        Math.round((currentWorkloadHours / user.capacity) * 100) : 0

      // Overdue tasks
      const overdueTasks = activeTasks.filter(task => 
        task.endDate && new Date(task.endDate) < now
      )

      // Urgent tasks
      const urgentTasks = activeTasks.filter(task => 
        task.priority === 'URGENT'
      )

      // High workload alert (90%+ utilization)
      if (utilizationRate >= 90) {
        alerts.push({
          id: `workload-${user.id}`,
          type: 'workload',
          severity: utilizationRate >= 100 ? 'critical' : 'warning',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department?.name || 'No Department'
          },
          title: utilizationRate >= 100 ? 'User Overloaded' : 'High Workload Alert',
          message: `${user.name} is at ${utilizationRate}% capacity (${currentWorkloadHours}h/${user.capacity}h)`,
          details: {
            utilizationRate,
            currentHours: currentWorkloadHours,
            capacity: user.capacity,
            activeTasks: activeTasks.length,
            urgentTasks: urgentTasks.length,
            overdueTasks: overdueTasks.length
          },
          actionRequired: utilizationRate >= 100,
          recommendations: [
            utilizationRate >= 100 ? 'Redistribute tasks immediately' : 'Monitor closely',
            'Consider adjusting deadlines',
            'Review task priorities'
          ],
          createdAt: new Date().toISOString()
        })
      }

      // Overdue tasks alert
      if (overdueTasks.length > 0) {
        alerts.push({
          id: `overdue-${user.id}`,
          type: 'overdue',
          severity: overdueTasks.length >= 3 ? 'critical' : 'warning',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department?.name || 'No Department'
          },
          title: 'Overdue Tasks Alert',
          message: `${user.name} has ${overdueTasks.length} overdue task(s)`,
          details: {
            overdueTasks: overdueTasks.map(task => ({
              id: task.id,
              title: task.title,
              daysOverdue: Math.ceil((now.getTime() - new Date(task.endDate!).getTime()) / (24 * 60 * 60 * 1000)),
              project: task.project?.name || 'No Project'
            }))
          },
          actionRequired: overdueTasks.length >= 2,
          recommendations: [
            'Review task priorities with user',
            'Consider extending deadlines',
            'Provide additional support'
          ],
          createdAt: new Date().toISOString()
        })
      }

      // Multiple urgent tasks alert
      if (urgentTasks.length >= 2) {
        alerts.push({
          id: `urgent-${user.id}`,
          type: 'urgent',
          severity: urgentTasks.length >= 4 ? 'critical' : 'warning',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department?.name || 'No Department'
          },
          title: 'Multiple Urgent Tasks',
          message: `${user.name} has ${urgentTasks.length} urgent tasks assigned`,
          details: {
            urgentTasks: urgentTasks.map(task => ({
              id: task.id,
              title: task.title,
              project: task.project?.name || 'No Project',
              estimatedHours: task.estimatedHours || 0
            }))
          },
          actionRequired: urgentTasks.length >= 3,
          recommendations: [
            'Review task urgency levels',
            'Consider redistributing some urgent tasks',
            'Prioritize with user'
          ],
          createdAt: new Date().toISOString()
        })
      }
    })

    // Filter by severity if specified
    let filteredAlerts = alerts
    if (severity && severity !== 'all') {
      if (severity === 'critical') {
        filteredAlerts = alerts.filter(alert => alert.severity === 'critical')
      } else if (severity === 'overloaded') {
        filteredAlerts = alerts.filter(alert => alert.type === 'workload' && alert.details.utilizationRate >= 100)
      }
    }

    // Sort by severity and creation time
    filteredAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1
      if (a.severity !== 'critical' && b.severity === 'critical') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Calculate summary statistics
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      actionRequired: alerts.filter(a => a.actionRequired).length,
      byType: {
        workload: alerts.filter(a => a.type === 'workload').length,
        overdue: alerts.filter(a => a.type === 'overdue').length,
        urgent: alerts.filter(a => a.type === 'urgent').length
      },
      affectedUsers: Array.from(new Set(alerts.map(a => a.user.id))).length
    }

    return NextResponse.json({
      alerts: filteredAlerts,
      summary,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching workload alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
