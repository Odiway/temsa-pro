import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phaseId = params.id

    // Verify the phase belongs to the user
    const phase = await prisma.taskPhase.findFirst({
      where: {
        id: phaseId,
        assignedToId: session.user.id,
        status: 'PENDING',
      },
    })

    if (!phase) {
      return NextResponse.json(
        { error: 'Phase not found or not accessible' },
        { status: 404 }
      )
    }

    // Update the phase to start it
    const updatedPhase = await prisma.taskPhase.update({
      where: { id: phaseId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    })

    return NextResponse.json(updatedPhase)
  } catch (error) {
    console.error('Error starting phase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
