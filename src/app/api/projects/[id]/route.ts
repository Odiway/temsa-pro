import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            name: true,
<<<<<<< HEAD
            email: true
          }
=======
            email: true,
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        departments: {
          select: {
            id: true,
<<<<<<< HEAD
            name: true
          }
=======
            name: true,
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
<<<<<<< HEAD
                email: true
              }
            }
          }
=======
                email: true,
              },
            },
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        tasks: {
          include: {
            department: {
              select: {
<<<<<<< HEAD
                name: true
              }
            },
            creator: {
              select: {
                name: true
              }
=======
                name: true,
              },
            },
            creator: {
              select: {
                name: true,
              },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
            },
            assignee: {
              select: {
                id: true,
                name: true,
<<<<<<< HEAD
                email: true
              }
            }
          }
=======
                email: true,
              },
            },
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        _count: {
          select: {
            tasks: true,
<<<<<<< HEAD
            participants: true
          }
        }
      }
=======
            participants: true,
          },
        },
      },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
<<<<<<< HEAD
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
=======
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const { name, description, status, estimatedStartDate, estimatedEndDate, departmentIds } = await request.json()
=======
    const {
      name,
      description,
      status,
      estimatedStartDate,
      estimatedEndDate,
      departmentIds,
    } = await request.json()
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        status,
        estimatedStartDate: new Date(estimatedStartDate),
        estimatedEndDate: new Date(estimatedEndDate),
        departments: {
          set: [], // Clear existing connections
<<<<<<< HEAD
          connect: departmentIds.map((id: string) => ({ id }))
        }
=======
          connect: departmentIds.map((id: string) => ({ id })),
        },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
      },
      include: {
        creator: {
          select: {
            name: true,
<<<<<<< HEAD
            email: true
          }
=======
            email: true,
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        departments: {
          select: {
            id: true,
<<<<<<< HEAD
            name: true
          }
=======
            name: true,
          },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
        },
        _count: {
          select: {
            tasks: true,
<<<<<<< HEAD
            participants: true
          }
        }
      }
=======
            participants: true,
          },
        },
      },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
<<<<<<< HEAD
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
=======
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.project.delete({
<<<<<<< HEAD
      where: { id: params.id }
=======
      where: { id: params.id },
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
<<<<<<< HEAD
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
=======
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 12ff4bcd455b79a2c6f0d558782253458712f425
  }
}
