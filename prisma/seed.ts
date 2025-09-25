import { PrismaClient, ProjectRole, BucketType, OrgType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Nur in lokaler Entwicklung seeden
  if (process.env.SEED_DEMO !== 'true') {
    console.log('⏭️ Skipping demo seed in this environment')
    process.exit(0)
  }

  console.log('🌱 Starting database seed...')

  // Create default demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@easy-tasks.de' },
    update: {},
    create: {
      email: 'demo@easy-tasks.de',
      name: 'Demo Benutzer',
      password: '$2a$12$rT.bQzjW/w6ynBbhFnjnu.cErV51Jj8dV118miVFCJLJKTvp0/xeu', // "demo123"
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'easy tasks Demo',
      type: OrgType.COMPANY,
      createdById: demoUser.id,
    },
  })

  console.log('✅ Organization created:', defaultOrg.name)

  // Add demo user to organization
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: demoUser.id,
        organizationId: defaultOrg.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      organizationId: defaultOrg.id,
      role: 'ADMIN',
    },
  })

  console.log('✅ Demo user added to organization')

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

  // Add demo user to project as owner
  await prisma.projectUser.upsert({
    where: {
      userId_projectId: {
        userId: demoUser.id,
        projectId: defaultProject.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      projectId: defaultProject.id,
      role: ProjectRole.OWNER,
    },
  })

  console.log('✅ Demo user added to project')

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
      type: BucketType.CUSTOM,
      color: '#6b7280',
      order: 3,
    },
  ]

  for (const bucketData of defaultBuckets) {
    // Check if bucket already exists
    const existingBucket = await prisma.bucket.findFirst({
      where: {
        userId: demoUser.id,
        projectId: defaultProject.id,
        name: bucketData.name,
      },
    })

    if (!existingBucket) {
      await prisma.bucket.create({
        data: {
          ...bucketData,
          userId: demoUser.id,
          organizationId: defaultOrg.id,
          projectId: defaultProject.id,
        },
      })
    }
  }

  console.log('✅ Default buckets created')

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Willkommen bei easy-tasks!',
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
        userId: demoUser.id,
        projectId: defaultProject.id,
        organizationId: defaultOrg.id,
        bucketId: (await prisma.bucket.findFirst({
          where: {
            userId: demoUser.id,
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
