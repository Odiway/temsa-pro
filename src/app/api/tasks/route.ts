import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

<<<<<<< HEAD
export async function GET() {
=======
export async function GET(request: NextRequest) {
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const tasks = await prisma.task.findMany({
=======
    const { searchParams } = new URL(request.url)
    const assignedToMe = searchParams.get('assignedToMe') === 'true'

    // Build where clause based on query parameters
    const whereClause: any = {}
    
    if (assignedToMe) {
      whereClause.assigneeId = session.user.id
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        phases: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, status, priority, startDate, endDate, departmentId, projectId, assigneeId, estimatedHours } = await request.json()

<<<<<<< HEAD
=======
    // Validate required fields
    if (!title || !departmentId) {
      return NextResponse.json({ error: 'Title and department are required' }, { status: 400 })
    }

>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        departmentId,
        projectId: projectId || null,
        assigneeId: assigneeId || null,
        estimatedHours: estimatedHours || null,
        createdBy: session.user.id
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
