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
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'all', 'projects', 'tasks', 'users', 'departments'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const searchQuery = query.trim()

    // Build where clauses based on user role
    let projectWhere: any = {}
    let taskWhere: any = {}
    let userWhere: any = {}

    if (session.user.role === 'FIELD') {
      // Field workers can only search their tasks and projects they participate in
      taskWhere.assigneeId = session.user.id
      
      const userProjects = await prisma.projectParticipation.findMany({
        where: { userId: session.user.id },
        select: { projectId: true }
      })
      projectWhere.id = { in: userProjects.map(p => p.projectId) }
      userWhere.id = session.user.id
    } else if (session.user.role === 'DEPARTMENT_HEAD') {
      // Department heads can search within their department
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
    // Admins can search everything (no additional filters)

    // Prepare search results object
    let results: any = {
      query: searchQuery,
      total: 0,
      projects: [],
      tasks: [],
      users: [],
      departments: []
    }

    // Search projects
    if (type === 'all' || type === 'projects') {
      const projects = await prisma.project.findMany({
        where: {
          ...projectWhere,
          OR: [
            { name: { contains: searchQuery.toLowerCase() } },
            { description: { contains: searchQuery.toLowerCase() } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          estimatedStartDate: true,
          estimatedEndDate: true,
          creator: { select: { name: true } },
          departments: { select: { name: true } },
          _count: { select: { tasks: true, participants: true } }
        },
        take: type === 'projects' ? limit : Math.floor(limit / 4),
        orderBy: { updatedAt: 'desc' }
      })

      results.projects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        estimatedStartDate: project.estimatedStartDate,
        estimatedEndDate: project.estimatedEndDate,
        creator: project.creator.name,
        departments: project.departments.map(d => d.name).join(', '),
        tasksCount: project._count.tasks,
        participantsCount: project._count.participants,
        type: 'project'
      }))
    }

    // Search tasks
    if (type === 'all' || type === 'tasks') {
      const tasks = await prisma.task.findMany({
        where: {
          ...taskWhere,
          OR: [
            { title: { contains: searchQuery.toLowerCase() } },
            { description: { contains: searchQuery.toLowerCase() } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          startDate: true,
          endDate: true,
          estimatedHours: true,
          assignee: { select: { name: true } },
          project: { select: { name: true } },
          department: { select: { name: true } },
          creator: { select: { name: true } }
        },
        take: type === 'tasks' ? limit : Math.floor(limit / 4),
        orderBy: { updatedAt: 'desc' }
      })

      results.tasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        estimatedHours: task.estimatedHours,
        assignee: task.assignee?.name || 'Unassigned',
        project: task.project?.name || 'No Project',
        department: task.department.name,
        creator: task.creator.name,
        type: 'task'
      }))
    }

    // Search users (only for managers and admins)
    if ((type === 'all' || type === 'users') && session.user.role !== 'FIELD') {
      const users = await prisma.user.findMany({
        where: {
          ...userWhere,
          OR: [
            { name: { contains: searchQuery.toLowerCase() } },
            { email: { contains: searchQuery.toLowerCase() } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          capacity: true,
          department: { select: { name: true } },
          _count: { 
            select: { 
              assignedTasks: true,
              projectParticipations: true
            } 
          }
        },
        take: type === 'users' ? limit : Math.floor(limit / 4),
        orderBy: { name: 'asc' }
      })

      results.users = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        capacity: user.capacity,
        department: user.department?.name || 'No Department',
        tasksCount: user._count.assignedTasks,
        projectsCount: user._count.projectParticipations,
        type: 'user'
      }))
    }

    // Search departments (only for admins)
    if ((type === 'all' || type === 'departments') && session.user.role === 'ADMIN') {
      const departments = await prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery.toLowerCase() } },
            { description: { contains: searchQuery.toLowerCase() } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { 
            select: { 
              users: true,
              projects: true,
              tasks: true
            } 
          }
        },
        take: type === 'departments' ? limit : Math.floor(limit / 4),
        orderBy: { name: 'asc' }
      })

      results.departments = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        usersCount: dept._count?.users || 0,
        projectsCount: dept._count?.projects || 0,
        tasksCount: dept._count?.tasks || 0,
        type: 'department'
      }))
    }

    // Calculate total results
    results.total = results.projects.length + results.tasks.length + 
                   results.users.length + results.departments.length

    // If searching for all, combine and sort by relevance/recency
    if (type === 'all') {
      const allResults = [
        ...results.projects,
        ...results.tasks,
        ...results.users,
        ...results.departments
      ]

      // Simple relevance scoring based on exact matches and position
      const scoredResults = allResults.map(item => {
        let score = 0
        const titleField = item.name || item.title || ''
        const descField = item.description || ''
        
        // Exact match bonus
        if (titleField.toLowerCase() === searchQuery.toLowerCase()) score += 100
        if (titleField.toLowerCase().includes(searchQuery.toLowerCase())) score += 50
        if (descField.toLowerCase().includes(searchQuery.toLowerCase())) score += 25
        
        // Position bonus (earlier matches score higher)
        const titleIndex = titleField.toLowerCase().indexOf(searchQuery.toLowerCase())
        if (titleIndex === 0) score += 25
        else if (titleIndex > 0) score += 10
        
        return { ...item, relevanceScore: score }
      })

      // Sort by relevance, then by type priority, then by recency
      const sortedResults = scoredResults.sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        
        // Type priority: tasks > projects > users > departments
        const typePriority = { task: 4, project: 3, user: 2, department: 1 }
        const aPriority = typePriority[a.type as keyof typeof typePriority] || 0
        const bPriority = typePriority[b.type as keyof typeof typePriority] || 0
        
        return bPriority - aPriority
      })

      results.combined = sortedResults.slice(0, limit)
    }

    return NextResponse.json({
      ...results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
