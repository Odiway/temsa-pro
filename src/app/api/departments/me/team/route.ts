import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's department
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { department: true }
    })

    if (!user?.departmentId) {
      return NextResponse.json({ error: 'User not assigned to a department' }, { status: 400 })
    }

    // Get all team members in the same department
    const teamMembers = await prisma.user.findMany({
      where: {
        departmentId: user.departmentId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get department name for formatting
    const department = await prisma.department.findUnique({
      where: { id: user.departmentId },
      select: { name: true }
    })

    // Transform the data to match the expected interface
    const formattedTeamMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.name || 'Unknown',
      email: member.email,
      role: member.role,
      department: department?.name || 'Unknown',
      isActive: true // For now, assume all users are active
    }))

    return NextResponse.json(formattedTeamMembers)
  } catch (error) {
    console.error('Error fetching department team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department team' },
      { status: 500 }
    )
  }
}
