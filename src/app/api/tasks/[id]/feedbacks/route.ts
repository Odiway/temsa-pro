import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;

    // Get task feedbacks
    const feedbacks = await prisma.feedback.findMany({
      where: {
        taskId: taskId
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching task feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const body = await request.json();

    const { message, type, priority } = body;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { createdBy: session.user.id },
          { assigneeId: session.user.id },
          { department: { headId: session.user.id } }
        ]
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        message,
        type: type || 'GENERAL',
        priority: priority || 'MEDIUM',
        taskId,
        submittedById: session.user.id,
        status: 'PENDING'
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating task feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const body = await request.json();
    const { feedbackId, status } = body;

    // Verify feedback exists and user has permission to review it
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        taskId: taskId,
        task: {
          OR: [
            { createdBy: session.user.id },
            { department: { headId: session.user.id } }
          ]
        }
      }
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found or access denied' }, { status: 404 });
    }

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'REVIEWED' || status === 'RESOLVED') {
        updateData.reviewedById = session.user.id;
        updateData.reviewedAt = new Date();
      }
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: updateData,
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
