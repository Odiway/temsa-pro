import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phases = await prisma.taskPhase.findMany({
      where: {
        assignedToId: session.user.id,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({ phases })
  } catch (error) {
    console.error('Error fetching user phases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
