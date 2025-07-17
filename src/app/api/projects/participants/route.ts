import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, userId, role } = await request.json()

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if user is already a participant
    const existingParticipation = await prisma.projectParticipation.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'User is already a participant in this project' },
        { status: 400 }
      )
    }

    const participation = await prisma.projectParticipation.create({
      data: {
        projectId,
        userId,
        role: role || 'PARTICIPANT'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(participation, { status: 201 })
  } catch (error) {
    console.error('Error adding project participant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      )
    }

    await prisma.projectParticipation.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    })

    return NextResponse.json({ message: 'Participant removed successfully' })
  } catch (error) {
    console.error('Error removing project participant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
