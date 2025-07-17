import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Getting seeded data IDs...')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true
    }
  })

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true
    }
  })

  console.log('\n=== USERS ===')
  users.forEach(user => {
    console.log(`ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log('---')
  })

  console.log('\n=== DEPARTMENTS ===')
  departments.forEach(dept => {
    console.log(`ID: ${dept.id}`)
    console.log(`Name: ${dept.name}`)
    console.log('---')
  })

  console.log('\n=== PROJECTS ===')
  projects.forEach(project => {
    console.log(`ID: ${project.id}`)
    console.log(`Name: ${project.name}`)
    console.log('---')
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
