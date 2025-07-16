import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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

  if (!project) return

  // Create sample task
  const task = await prisma.task.create({
    data: {
      title: 'Kullanıcı arayüzü tasarımı',
      description: 'Ana dashboard ve kullanıcı arayüzlerinin tasarlanması',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      departmentId: departments[0].id,
      projectId: project.id,
      createdBy: users[1].id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  })

  // Create task phases
  await Promise.all([
    prisma.taskPhase.create({
      data: {
        name: 'Tasarım Araştırması',
        description: 'Kullanıcı deneyimi araştırması ve analizi',
        estimatedTime: 8,
        status: 'COMPLETED',
        order: 1,
        taskId: task.id,
        assignedToId: users[3].id,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        actualTime: 8,
      },
    }),
    prisma.taskPhase.create({
      data: {
        name: 'Mockup Oluşturma',
        description: 'Figma ile arayüz tasarımı oluşturma',
        estimatedTime: 16,
        status: 'IN_PROGRESS',
        order: 2,
        taskId: task.id,
        assignedToId: users[3].id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startedAt: new Date(),
      },
    }),
  ])

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Yeni Görev Atandı',
        message: 'Size yeni bir görev aşaması atandı: Tasarım Araştırması',
        type: 'TASK_ASSIGNED',
        userId: users[3].id,
        relatedId: task.id,
        relatedType: 'TASK',
      },
    }),
    prisma.notification.create({
      data: {
        title: 'Proje Başladı',
        message: 'TemSafy Pro Geliştirme projesi başladı',
        type: 'PROJECT_STARTED',
        userId: users[1].id,
        relatedId: project.id,
        relatedType: 'PROJECT',
      },
    }),
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
