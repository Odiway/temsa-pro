import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's department
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        department: true
      }
    })

    if (!user?.department) {
      return NextResponse.json({ error: 'User not assigned to a department' }, { status: 404 })
    }

    // Get department statistics
    const [teamMembers, activeTasks, completedTasks, totalProjects] = await Promise.all([
      prisma.user.count({
        where: { departmentId: user.department.id }
      }),
      prisma.task.count({
        where: { 
          project: {
            departments: {
              some: { id: user.department.id }
            }
          },
          status: { in: ['TODO', 'IN_PROGRESS'] }
        }
      }),
      prisma.task.count({
        where: { 
          project: {
            departments: {
              some: { id: user.department.id }
            }
          },
          status: 'COMPLETED'
        }
      }),
      prisma.project.count({
        where: {
          departments: {
            some: { id: user.department.id }
          }
        }
      })
    ])

    const pendingTasks = activeTasks

    const stats = {
      teamMembers,
      activeTasks,
      completedTasks,
      pendingTasks,
      totalProjects,
      department: {
        id: user.department.id,
        name: user.department.name,
        description: user.department.description
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching department stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
