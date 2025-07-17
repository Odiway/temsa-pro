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
    const departmentId = searchParams.get('departmentId')
    const timeframe = searchParams.get('timeframe') || '30' // days

    // Build where clause based on user permissions
    const whereClause: any = {}
    
    if (departmentId) {
      whereClause.departments = {
        some: { id: departmentId }
      }
    }

    // Role-based filtering
    if (session.user.role === 'FIELD') {
      // Field workers can only see projects they participate in
      const userProjects = await prisma.projectParticipation.findMany({
        where: { userId: session.user.id },
        select: { projectId: true }
      })
      whereClause.id = { in: userProjects.map(p => p.projectId) }
    } else if (session.user.role === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departments = {
          some: { id: user.departmentId }
        }
      }
    }

    // Date filter
    const timeframeDate = new Date()
    timeframeDate.setDate(timeframeDate.getDate() - parseInt(timeframe))

    // Get project statistics
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      delayedProjects,
      projectsWithinBudget,
      avgCompletionRate,
      projectsByStatus,
      projectsByDepartment,
      recentProjects,
      projectProgress
    ] = await Promise.all([
      // Total projects
      prisma.project.count({ where: whereClause }),
      
      // Active projects
      prisma.project.count({
        where: { ...whereClause, status: 'ACTIVE' }
      }),
      
      // Completed projects
      prisma.project.count({
        where: { ...whereClause, status: 'COMPLETED' }
      }),
      
      // Delayed projects (active but past end date)
      prisma.project.count({
        where: {
          ...whereClause,
          status: 'ACTIVE',
          endDate: { lt: new Date() }
        }
      }),
      
      // Projects within budget (placeholder - would need budget tracking)
      prisma.project.count({
        where: { ...whereClause, status: 'ACTIVE' }
      }),
      
      // Calculate average completion rate based on tasks
      prisma.project.findMany({
        where: whereClause,
        select: {
          id: true,
          tasks: {
            select: {
              status: true
            }
          }
        }
      }).then(projects => {
        if (projects.length === 0) return 0
        
        const totalRate = projects.reduce((sum, project) => {
          const totalTasks = project.tasks.length
          if (totalTasks === 0) return sum
          
          const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length
          return sum + (completedTasks / totalTasks) * 100
        }, 0)
        
        return Math.round(totalRate / projects.length)
      }),
      
      // Projects by status
      prisma.project.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true }
      }),
      
      // Projects by department (only for admins) - using many-to-many relation
      session.user.role === 'ADMIN' ? await prisma.department.findMany({
        select: {
          id: true,
          name: true,
          projects: {
            where: whereClause,
            select: { id: true }
          }
        }
      }).then(departments => 
        departments.map(dept => ({
          departmentId: dept.id,
          departmentName: dept.name,
          count: dept.projects.length
        })).filter(item => item.count > 0)
      ) : [],
      
      // Recent projects
      prisma.project.findMany({
        where: {
          ...whereClause,
          createdAt: { gte: timeframeDate }
        },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          estimatedEndDate: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Project progress (tasks completion)
      prisma.project.findMany({
        where: { ...whereClause, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          tasks: {
            select: {
              status: true,
              estimatedHours: true
            }
          }
        },
        take: 20
      }).then(projects => 
        projects.map(project => {
          const totalTasks = project.tasks.length
          const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length
          const totalHours = project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
          const completedHours = project.tasks
            .filter(t => t.status === 'COMPLETED')
            .reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
          
          return {
            id: project.id,
            name: project.name,
            taskProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            hoursProgress: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0,
            totalTasks,
            completedTasks,
            totalHours,
            completedHours
          }
        })
      )
    ])

    // Calculate metrics
    const onTimeProjects = activeProjects - delayedProjects
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

    return NextResponse.json({
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects,
        onTimeProjects,
        projectsWithinBudget,
        avgCompletionRate,
        successRate
      },
      charts: {
        projectsByStatus: projectsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        projectsByDepartment: projectsByDepartment,
        projectProgress: projectProgress
      },
      recent: recentProjects,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching project statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
