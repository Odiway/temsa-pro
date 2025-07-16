import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  // Create departments
  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      description: 'Manages IT infrastructure and software development'
    }
  })

  const hrDept = await prisma.department.create({
    data: {
      name: 'Human Resources',
      description: 'Handles recruitment, employee relations, and training'
    }
  })

  const operationsDept = await prisma.department.create({
    data: {
      name: 'Operations',
      description: 'Oversees daily operations and field activities'
    }
  })

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@temsafy.com',
      password: hashedPassword,
      role: 'ADMIN',
      capacity: 8
    }
  })

  const managerUser = await prisma.user.create({
    data: {
      name: 'John Manager',
      email: 'manager@temsafy.com',
      password: hashedPassword,
      role: 'MANAGER',
      departmentId: itDept.id,
      capacity: 8
    }
  })

  const fieldUser1 = await prisma.user.create({
    data: {
      name: 'Alice Field',
      email: 'alice@temsafy.com',
      password: hashedPassword,
      role: 'FIELD',
      departmentId: operationsDept.id,
      capacity: 8
    }
  })

  const fieldUser2 = await prisma.user.create({
    data: {
      name: 'Bob Worker',
      email: 'bob@temsafy.com',
      password: hashedPassword,
      role: 'FIELD',
      departmentId: operationsDept.id,
      capacity: 8
    }
  })

  const deptHead = await prisma.user.create({
    data: {
      name: 'Sarah Department Head',
      email: 'sarah@temsafy.com',
      password: hashedPassword,
      role: 'DEPARTMENT',
      departmentId: hrDept.id,
      capacity: 8
    }
  })

  // Update department heads
  await prisma.department.update({
    where: { id: itDept.id },
    data: { headId: managerUser.id }
  })

  await prisma.department.update({
    where: { id: hrDept.id },
    data: { headId: deptHead.id }
  })

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Develop a new mobile application for field workers',
      status: 'ACTIVE',
      estimatedStartDate: new Date('2025-01-01'),
      estimatedEndDate: new Date('2025-06-30'),
      createdBy: managerUser.id,
      departments: {
        connect: [{ id: itDept.id }, { id: operationsDept.id }]
      }
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Office Renovation',
      description: 'Renovate the main office building',
      status: 'PLANNING',
      estimatedStartDate: new Date('2025-03-01'),
      estimatedEndDate: new Date('2025-08-31'),
      createdBy: managerUser.id,
      departments: {
        connect: [{ id: operationsDept.id }]
      }
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Employee Training Program',
      description: 'Comprehensive training program for new employees',
      status: 'ACTIVE',
      estimatedStartDate: new Date('2025-02-01'),
      estimatedEndDate: new Date('2025-12-31'),
      createdBy: deptHead.id,
      departments: {
        connect: [{ id: hrDept.id }]
      }
    }
  })

  // Create tasks
  await prisma.task.create({
    data: {
      title: 'Design UI Mockups',
      description: 'Create user interface mockups for the mobile app',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      endDate: new Date('2025-07-30'),
      estimatedHours: 16,
      projectId: project1.id,
      createdBy: managerUser.id,
      assigneeId: fieldUser1.id,
      departmentId: itDept.id
    }
  })

  await prisma.task.create({
    data: {
      title: 'Backend API Development',
      description: 'Develop REST API endpoints for the mobile application',
      status: 'PENDING',
      priority: 'HIGH',
      endDate: new Date('2025-08-15'),
      estimatedHours: 32,
      projectId: project1.id,
      createdBy: managerUser.id,
      assigneeId: fieldUser2.id,
      departmentId: itDept.id
    }
  })

  await prisma.task.create({
    data: {
      title: 'Site Survey',
      description: 'Survey the office space for renovation planning',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      endDate: new Date('2025-07-20'),
      estimatedHours: 8,
      projectId: project2.id,
      createdBy: managerUser.id,
      assigneeId: fieldUser1.id,
      departmentId: operationsDept.id
    }
  })

  await prisma.task.create({
    data: {
      title: 'Training Material Preparation',
      description: 'Prepare comprehensive training materials',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      endDate: new Date('2025-08-01'),
      estimatedHours: 24,
      projectId: project3.id,
      createdBy: deptHead.id,
      assigneeId: fieldUser2.id,
      departmentId: hrDept.id
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created:')
  console.log('- 3 departments')
  console.log('- 5 users (admin, manager, department head, 2 field workers)')
  console.log('- 3 projects')
  console.log('- 4 tasks')
  console.log('')
  console.log('Test accounts:')
  console.log('Admin: admin@temsafy.com / password123')
  console.log('Manager: manager@temsafy.com / password123')
  console.log('Department Head: sarah@temsafy.com / password123')
  console.log('Field Worker 1: alice@temsafy.com / password123')
  console.log('Field Worker 2: bob@temsafy.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
