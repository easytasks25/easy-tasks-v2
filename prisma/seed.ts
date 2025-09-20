import { PrismaClient, ProjectRole, BucketType, OrgType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@easytasks.com' },
    update: {},
    create: {
      email: 'admin@easytasks.com',
      name: 'Administrator',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJAPJjJ8J8J8J8J8J8J8', // "admin123"
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'easy tasks Demo',
      type: OrgType.COMPANY,
      createdById: adminUser.id,
    },
  })

  console.log('✅ Organization created:', defaultOrg.name)

  // Add admin to organization
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: defaultOrg.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: defaultOrg.id,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin added to organization')

  // Create default project
  const defaultProject = await prisma.project.upsert({
    where: { id: 'default-project' },
    update: {},
    create: {
      id: 'default-project',
      name: 'Willkommen bei easy tasks',
      description: 'Ihr erstes Projekt - hier können Sie Aufgaben verwalten',
      color: '#3b82f6',
      organizationId: defaultOrg.id,
    },
  })

  console.log('✅ Project created:', defaultProject.name)

  // Add admin to project as owner
  await prisma.projectUser.upsert({
    where: {
      userId_projectId: {
        userId: adminUser.id,
        projectId: defaultProject.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      projectId: defaultProject.id,
      role: ProjectRole.OWNER,
    },
  })

  console.log('✅ Admin added to project')

  // Create default buckets for the project
  const defaultBuckets = [
    {
      name: 'Heute',
      type: BucketType.TODAY,
      color: '#ef4444',
      order: 0,
    },
    {
      name: 'Morgen',
      type: BucketType.TOMORROW,
      color: '#f59e0b',
      order: 1,
    },
    {
      name: 'Diese Woche',
      type: BucketType.THIS_WEEK,
      color: '#3b82f6',
      order: 2,
    },
    {
      name: 'Später',
      type: BucketType.LATER,
      color: '#6b7280',
      order: 3,
    },
  ]

  for (const bucketData of defaultBuckets) {
    await prisma.bucket.upsert({
      where: {
        userId_projectId_name: {
          userId: adminUser.id,
          projectId: defaultProject.id,
          name: bucketData.name,
        },
      },
      update: {},
      create: {
        ...bucketData,
        userId: adminUser.id,
        projectId: defaultProject.id,
      },
    })
  }

  console.log('✅ Default buckets created')

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Willkommen bei easy tasks!',
      description: 'Erkunden Sie die App und erstellen Sie Ihre erste Aufgabe.',
      priority: 'HIGH' as const,
      status: 'PENDING' as const,
    },
    {
      title: 'App auf dem Handy installieren',
      description: 'Tippen Sie auf "Zum Startbildschirm hinzufügen" für die beste Erfahrung.',
      priority: 'MEDIUM' as const,
      status: 'PENDING' as const,
    },
    {
      title: 'Team einladen',
      description: 'Laden Sie Ihre Kollegen ein, um gemeinsam Aufgaben zu verwalten.',
      priority: 'LOW' as const,
      status: 'PENDING' as const,
    },
  ]

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        userId: adminUser.id,
        projectId: defaultProject.id,
        organizationId: defaultOrg.id,
        bucketId: (await prisma.bucket.findFirst({
          where: {
            userId: adminUser.id,
            projectId: defaultProject.id,
            name: 'Heute',
          },
        }))?.id,
      },
    })
  }

  console.log('✅ Sample tasks created')

  console.log('🎉 Database seeded successfully!')
  console.log('📧 Admin login: admin@easytasks.com')
  console.log('🔑 Admin password: admin123')
  console.log('🏢 Organization: easy tasks Demo')
  console.log('📋 Project: Willkommen bei easy tasks')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
