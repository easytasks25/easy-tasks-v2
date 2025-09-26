import { PrismaClient, BucketType, TaskPriority, TaskStatus, OrgType, OrganizationRole, ProjectRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo user...')

  // Demo-Benutzer erstellen
  const password = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@easy-tasks.de' },
    update: { password },
    create: { 
      email: 'demo@easy-tasks.de', 
      password, 
      name: 'Demo Benutzer' 
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Demo-Organisation erstellen
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org-1' },
    update: {},
    create: {
      id: 'demo-org-1',
      name: 'easy-tasks Demo',
      type: OrgType.company,
      createdById: demoUser.id,
    },
  })

  console.log('✅ Demo organization created:', demoOrg.name)

  // Demo-Benutzer zur Organisation hinzufügen
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      organizationId: demoOrg.id,
      role: OrganizationRole.ADMIN,
    },
  })

  console.log('✅ Demo user added to organization')

  // Demo-Projekt erstellen
  const demoProject = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'Willkommen bei easy-tasks',
      description: 'Ihr erstes Projekt - hier können Sie Aufgaben verwalten',
      color: '#3b82f6',
      organizationId: demoOrg.id,
    },
  })

  console.log('✅ Demo project created:', demoProject.name)

  // Demo-Benutzer zum Projekt hinzufügen
  await prisma.projectUser.upsert({
    where: {
      userId_projectId: {
        userId: demoUser.id,
        projectId: demoProject.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      projectId: demoProject.id,
      role: ProjectRole.OWNER,
    },
  })

  console.log('✅ Demo user added to project')

  // Demo-Buckets erstellen
  const demoBuckets = [
    { name: 'Heute', type: BucketType.TODAY, color: '#ef4444', order: 0 },
    { name: 'Morgen', type: BucketType.TOMORROW, color: '#f59e0b', order: 1 },
    { name: 'Diese Woche', type: BucketType.THIS_WEEK, color: '#3b82f6', order: 2 },
  ]

  for (const bucketData of demoBuckets) {
    await prisma.bucket.upsert({
      where: {
        userId_projectId_name: {
          userId: demoUser.id,
          projectId: demoProject.id,
          name: bucketData.name,
        },
      },
      update: {},
      create: {
        ...bucketData,
        userId: demoUser.id,
        organizationId: demoOrg.id,
        projectId: demoProject.id,
      },
    })
  }

  console.log('✅ Demo buckets created')

  // Demo-Task erstellen
  await prisma.task.create({
    data: {
      title: 'Willkommen bei easy-tasks!',
      description: 'Erkunden Sie die App und erstellen Sie Ihre erste Aufgabe.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      userId: demoUser.id,
      organizationId: demoOrg.id,
      projectId: demoProject.id,
      bucketId: (await prisma.bucket.findFirst({
        where: {
          userId: demoUser.id,
          projectId: demoProject.id,
          name: 'Heute',
        },
      }))?.id,
    },
  })

  console.log('✅ Demo task created')
  console.log('🎉 Demo seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
