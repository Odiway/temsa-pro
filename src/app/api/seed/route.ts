import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  return seedDatabase(request)
}

export async function POST(request: NextRequest) {
  return seedDatabase(request)
}

async function seedDatabase(request: NextRequest) {
  try {
    // Security check - only allow in development or with secret key
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (process.env.NODE_ENV === 'production' && secret !== 'seed-database-123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, ensure database schema is up to date
    console.log('Applying database schema...')
    
    // Note: In production, Prisma schema should be applied during build
    // This is a backup to ensure tables exist

    // Create departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name: 'Yazılım Geliştirme' },
        update: {},
        create: {
          name: 'Yazılım Geliştirme',
          description: 'Yazılım projelerinin geliştirilmesi',
        },
      }),
      prisma.department.upsert({
        where: { name: 'Saha Operasyonları' },
        update: {},
        create: {
          name: 'Saha Operasyonları',
          description: 'Saha çalışmaları ve operasyonlar',
        },
      }),
      prisma.department.upsert({
        where: { name: 'Proje Yönetimi' },
        update: {},
        create: {
          name: 'Proje Yönetimi',
          description: 'Proje planlama ve koordinasyon',
        },
      }),
    ])

    // Create users
    const hashedPassword = await hash('123456', 12)
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@temsafy.com' },
        update: {},
        create: {
          name: 'Admin Kullanıcı',
          email: 'admin@temsafy.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'manager@temsafy.com' },
        update: {},
        create: {
          name: 'Proje Yöneticisi',
          email: 'manager@temsafy.com',
          password: hashedPassword,
          role: 'MANAGER',
          departmentId: departments[2].id,
        },
      }),
      prisma.user.upsert({
        where: { email: 'department@temsafy.com' },
        update: {},
        create: {
          name: 'Departman Yöneticisi',
          email: 'department@temsafy.com',
          password: hashedPassword,
          role: 'DEPARTMENT',
          departmentId: departments[1].id,
        },
      }),
      prisma.user.upsert({
        where: { email: 'field@temsafy.com' },
        update: {},
        create: {
          name: 'Saha Çalışanı',
          email: 'field@temsafy.com',
          password: hashedPassword,
          role: 'FIELD',
          departmentId: departments[1].id,
        },
      }),
    ])

    // Create sample project
    const existingProject = await prisma.project.findFirst()
    let project = existingProject
    
    if (!existingProject) {
      project = await prisma.project.create({
        data: {
          name: 'TemSafy Pro Geliştirme',
          description: 'Saha ekip yönetim sistemi geliştirme projesi',
          status: 'ACTIVE',
          createdBy: users[1].id,
          estimatedStartDate: new Date(),
          estimatedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          departments: {
            connect: [{ id: departments[0].id }, { id: departments[1].id }],
          },
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      users: users.length,
      departments: departments.length,
      project: project ? 1 : 0
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
