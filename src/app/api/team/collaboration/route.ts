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

    // Build where clauses based on user role and filters
    let whereClause: any = {}
    
    if (projectId) {
      whereClause.projectParticipations = {
        some: { projectId: projectId }
      }
    }
    
    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    // Role-based filtering
    if (session.user.role === 'FIELD') {
      // Field workers can only see team members from projects they participate in
      const userProjects = await prisma.projectParticipation.findMany({
        where: { userId: session.user.id },
        select: { projectId: true }
      })
      
      if (userProjects.length > 0) {
        whereClause.OR = [
          { id: session.user.id }, // Include themselves
          {
            projectParticipations: {
              some: { projectId: { in: userProjects.map(p => p.projectId) } }
            }
          }
        ]
      } else {
        whereClause.id = session.user.id
      }
    } else if (session.user.role === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departmentId = user.departmentId
      }
    }
    // Admins can see all team members

    // Get team members with their current workload and availability
    const teamMembers = await prisma.user.findMany({
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
            status: true,
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
        },
        projectParticipations: {
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Calculate team statistics and availability
    const teamStats = teamMembers.map(member => {
      const activeTasks = member.assignedTasks
      const activeProjects = member.projectParticipations.filter(p => p.project.status === 'ACTIVE')
      
      // Calculate workload
      const totalHours = activeTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
      const availableHours = member.capacity - totalHours
      const utilizationRate = member.capacity > 0 ? Math.round((totalHours / member.capacity) * 100) : 0
      
      // Check for overdue tasks
      const overdueTasks = activeTasks.filter(task => 
        task.endDate && task.endDate < new Date()
      )
      
      // Categorize by priority
      const urgentTasks = activeTasks.filter(task => task.priority === 'URGENT')
      const highPriorityTasks = activeTasks.filter(task => task.priority === 'HIGH')
      
      // Determine availability status
      let availabilityStatus = 'available'
      if (utilizationRate >= 100) availabilityStatus = 'overloaded'
      else if (utilizationRate >= 80) availabilityStatus = 'busy'
      else if (utilizationRate >= 50) availabilityStatus = 'moderate'
      
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        workload: {
          capacity: member.capacity,
          assignedHours: totalHours,
          availableHours: Math.max(0, availableHours),
          utilizationRate: utilizationRate,
          status: availabilityStatus
        },
        tasks: {
          total: activeTasks.length,
          urgent: urgentTasks.length,
          highPriority: highPriorityTasks.length,
          overdue: overdueTasks.length,
          pending: activeTasks.filter(t => t.status === 'PENDING').length,
          inProgress: activeTasks.filter(t => t.status === 'IN_PROGRESS').length
        },
        projects: {
          total: activeProjects.length,
          asManager: activeProjects.filter(p => p.role === 'MANAGER').length,
          asParticipant: activeProjects.filter(p => p.role === 'PARTICIPANT').length,
          active: activeProjects.map(p => ({
            id: p.project.id,
            name: p.project.name,
            role: p.role
          }))
        },
        recentTasks: activeTasks
          .sort((a, b) => new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime())
          .slice(0, 5)
          .map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            endDate: task.endDate,
            project: task.project?.name || 'No Project'
          }))
      }
    })

    // Calculate team-wide statistics
    const teamSummary = {
      totalMembers: teamStats.length,
      availableMembers: teamStats.filter(m => m.workload.status === 'available').length,
      busyMembers: teamStats.filter(m => m.workload.status === 'busy' || m.workload.status === 'moderate').length,
      overloadedMembers: teamStats.filter(m => m.workload.status === 'overloaded').length,
      avgUtilization: teamStats.length > 0 ? 
        Math.round(teamStats.reduce((sum, m) => sum + m.workload.utilizationRate, 0) / teamStats.length) : 0,
      totalCapacity: teamStats.reduce((sum, m) => sum + m.workload.capacity, 0),
      totalAssignedHours: teamStats.reduce((sum, m) => sum + m.workload.assignedHours, 0),
      totalAvailableHours: teamStats.reduce((sum, m) => sum + m.workload.availableHours, 0),
      activeTasks: teamStats.reduce((sum, m) => sum + m.tasks.total, 0),
      urgentTasks: teamStats.reduce((sum, m) => sum + m.tasks.urgent, 0),
      overdueTasks: teamStats.reduce((sum, m) => sum + m.tasks.overdue, 0)
    }

    // Find best available members for task assignment
    const availableForAssignment = teamStats
      .filter(member => member.workload.availableHours > 0)
      .sort((a, b) => {
        // Sort by availability (more available hours first), then by utilization (less utilized first)
        if (a.workload.availableHours !== b.workload.availableHours) {
          return b.workload.availableHours - a.workload.availableHours
        }
        return a.workload.utilizationRate - b.workload.utilizationRate
      })
      .slice(0, 10)
      .map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        department: member.department?.name || 'No Department',
        availableHours: member.workload.availableHours,
        utilizationRate: member.workload.utilizationRate,
        currentTasks: member.tasks.total,
        skills: [] // This could be expanded to include skills/competencies
      }))

    // Get departments summary (if user can see multiple departments)
    let departmentsSummary: any[] = []
    if (session.user.role === 'ADMIN') {
      const departments = await prisma.department.findMany({
        select: {
          id: true,
          name: true,
          users: {
            select: {
              id: true,
              capacity: true,
              assignedTasks: {
                where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
                select: { estimatedHours: true }
              }
            }
          }
        }
      })

      departmentsSummary = departments.map(dept => {
        const members = dept.users
        const totalCapacity = members.reduce((sum, u) => sum + u.capacity, 0)
        const totalAssigned = members.reduce((sum, u) => 
          sum + u.assignedTasks.reduce((taskSum, t) => taskSum + (t.estimatedHours || 0), 0), 0
        )
        const utilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0

        return {
          id: dept.id,
          name: dept.name,
          memberCount: members.length,
          totalCapacity,
          totalAssigned,
          availableCapacity: Math.max(0, totalCapacity - totalAssigned),
          utilization
        }
      })
    }

    return NextResponse.json({
      teamMembers: teamStats,
      summary: teamSummary,
      availableForAssignment,
      departments: departmentsSummary,
      filters: {
        projectId,
        departmentId
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching team collaboration data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
