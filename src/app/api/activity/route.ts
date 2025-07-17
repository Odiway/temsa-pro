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
    const limit = parseInt(searchParams.get('limit') || '50')
    const projectId = searchParams.get('projectId')
    const departmentId = searchParams.get('departmentId')

    // Build activity feed from recent changes
    const activities: any[] = []

    // Recent tasks
    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId
    if (departmentId) whereClause.departmentId = departmentId
    
    // If regular user, only show their department's activities
    if (session.user.role === 'FIELD') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { departmentId: true }
      })
      if (user?.departmentId) {
        whereClause.departmentId = user.departmentId
      }
    }

    const recentTasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        project: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.floor(limit / 3)
    })

    recentTasks.forEach(task => {
      activities.push({
        id: task.id,
        type: 'task',
        action: 'updated',
        title: `Task "${task.title}" was updated`,
        description: `Status: ${task.status}, Priority: ${task.priority}`,
        user: task.creator,
        assignee: task.assignee,
        project: task.project?.name,
        department: task.department.name,
        timestamp: task.updatedAt,
        relatedId: task.id,
        relatedType: 'TASK'
      })
    })

    // Recent projects
    const recentProjects = await prisma.project.findMany({
      include: {
        creator: { select: { name: true, email: true } },
        departments: { select: { name: true } },
        _count: { select: { tasks: true, participants: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.floor(limit / 3)
    })

    recentProjects.forEach(project => {
      activities.push({
        id: project.id,
        type: 'project',
        action: 'updated',
        title: `Project "${project.name}" was updated`,
        description: `${project._count.tasks} tasks, ${project._count.participants} participants`,
        user: project.creator,
        departments: project.departments.map(d => d.name),
        timestamp: project.updatedAt,
        relatedId: project.id,
        relatedType: 'PROJECT'
      })
    })

    // Recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3)
    })

    recentNotifications.forEach(notification => {
      activities.push({
        id: notification.id,
        type: 'notification',
        action: 'received',
        title: notification.title,
        description: notification.message,
        timestamp: notification.createdAt,
        relatedId: notification.relatedId,
        relatedType: notification.relatedType,
        isRead: notification.isRead
      })
    })

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      activities: activities.slice(0, limit),
      total: activities.length
    })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
