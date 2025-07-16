import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDepartment } from '@/lib/roles'

export const dynamic = 'force-dynamic'

// Cache control for real-time data
const CACHE_DURATION = 30; // seconds

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build where clauses based on user role
    let projectWhere: any = {}
    let taskWhere: any = {}
    let userWhere: any = {}

    if (session.user.role === 'FIELD') {
      // Field workers see only their tasks and projects they participate in
      taskWhere.assigneeId = session.user.id
      
      const userProjects = await prisma.projectParticipation.findMany({
        where: { userId: session.user.id },
        select: { projectId: true }
      })
      projectWhere.id = { in: userProjects.map(p => p.projectId) }
      userWhere.id = session.user.id
    } else if (isDepartment(session.user.role)) {
      // Department heads see their department's data
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      
      if (user?.departmentId) {
        taskWhere.departmentId = user.departmentId
        projectWhere.departments = { some: { id: user.departmentId } }
        userWhere.departmentId = user.departmentId
      }
    }
    // Admins see everything (no additional filters)

    // Get current date for time-based queries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    // Fetch dashboard data in parallel
    const [
      // Project statistics
      totalProjects,
      activeProjects,
      completedProjects,
      urgentProjects,
      
      // Task statistics
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      todaysTasks,
      
      // User statistics
      totalUsers,
      activeUsers,
      
      // Recent activity
      recentTasks,
      recentProjects,
      recentNotifications,
      
      // Workload data
      departmentWorkload,
      userWorkload
    ] = await Promise.all([
      // Projects
      prisma.project.count({ where: projectWhere }),
      prisma.project.count({ where: { ...projectWhere, status: 'ACTIVE' } }),
      prisma.project.count({ where: { ...projectWhere, status: 'COMPLETED' } }),
      prisma.project.count({
        where: {
          ...projectWhere,
          status: 'ACTIVE',
          tasks: { some: { priority: 'URGENT' } }
        }
      }),
      
      // Tasks
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'PENDING' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          endDate: { lt: now },
          status: { notIn: ['COMPLETED'] }
        }
      }),
      prisma.task.count({
        where: {
          ...taskWhere,
          OR: [
            { startDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } },
            { endDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } }
          ]
        }
      }),
      
      // Users
      prisma.user.count({ where: userWhere }),
      prisma.user.count({
        where: {
          ...userWhere,
          assignedTasks: { some: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }
        }
      }),
      
      // Recent activity
      prisma.task.findMany({
        where: {
          ...taskWhere,
          updatedAt: { gte: weekStart }
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          updatedAt: true,
          assignee: { select: { name: true } },
          project: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      
      prisma.project.findMany({
        where: {
          ...projectWhere,
          createdAt: { gte: weekStart }
        },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          creator: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent notifications for the user
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: weekStart }
        },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Department workload (if admin or department head)
      session.user.role !== 'FIELD' ? prisma.department.findMany({
        where: isDepartment(session.user.role) ? { id: userWhere.departmentId } : {},
        select: {
          id: true,
          name: true,
          users: {
            select: {
              assignedTasks: {
                where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
                select: { estimatedHours: true }
              }
            }
          }
        }
      }).then(departments =>
        departments.map(dept => ({
          id: dept.id,
          name: dept.name,
          activeUsers: dept.users.filter(u => u.assignedTasks.length > 0).length,
          totalUsers: dept.users.length,
          workloadHours: dept.users.reduce((sum, user) =>
            sum + user.assignedTasks.reduce((taskSum, task) => 
              taskSum + (task.estimatedHours || 0), 0
            ), 0
          )
        }))
      ) : [],
      
      // Top users by workload (if not field worker)
      session.user.role !== 'FIELD' ? prisma.user.findMany({
        where: {
          ...userWhere,
          assignedTasks: { some: {} }
        },
        select: {
          id: true,
          name: true,
          assignedTasks: {
            where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
            select: {
              estimatedHours: true,
              priority: true
            }
          }
        },
        take: 10
      }).then(users =>
        users.map(user => ({
          id: user.id,
          name: user.name,
          activeTasks: user.assignedTasks.length,
          workloadHours: user.assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
          urgentTasks: user.assignedTasks.filter(t => t.priority === 'URGENT').length,
          highPriorityTasks: user.assignedTasks.filter(t => t.priority === 'HIGH').length
        }))
        .sort((a, b) => b.workloadHours - a.workloadHours)
        .slice(0, 5)
      ) : []
    ])

    // Calculate performance metrics
    const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const teamUtilization = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    // Identify critical items
    const criticalItems = {
      overdueTasks: overdueTasks,
      urgentProjects: urgentProjects,
      heavilyLoadedUsers: userWorkload.filter((u: any) => u.workloadHours > 40).length,
      unassignedTasks: await prisma.task.count({
        where: { ...taskWhere, assigneeId: null }
      })
    }

    // Fetch detailed data for sync
    const detailedProjects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        departments: true,
        _count: { select: { tasks: true } },
        creator: { select: { id: true, name: true, email: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    const detailedTasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        phases: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    });

    const departmentData = await prisma.department.findMany({
      where: session.user.role === 'FIELD' ? { id: session.user.departmentId } : {},
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { users: true, projects: true } }
      }
    });

    const lastModified = new Date().toUTCString();
    
    const responseData = {
      summary: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          completionRate: projectCompletionRate
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          today: todaysTasks,
          completionRate: taskCompletionRate
        },
        team: {
          total: totalUsers,
          active: activeUsers,
          utilization: teamUtilization
        }
      },
      critical: criticalItems,
      workload: {
        departments: departmentWorkload,
        topUsers: userWorkload
      },
      recent: {
        tasks: recentTasks,
        projects: recentProjects,
        notifications: recentNotifications
      },
      // Detailed data for sync
      projects: detailedProjects,
      tasks: detailedTasks,
      departments: departmentData,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        totalUsers,
        activeUsers
      },
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Set cache headers for efficient sync
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
      'Last-Modified': lastModified,
      'ETag': `"${Buffer.from(JSON.stringify(responseData)).toString('base64').slice(0, 32)}"`
    });

    return new NextResponse(JSON.stringify(responseData), { headers });
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
