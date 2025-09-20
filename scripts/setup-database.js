#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initialisiere LW Tasks Datenbank...')

  try {
    // 1. Admin-Benutzer erstellen
    const adminPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@lwtasks.com' },
      update: {},
      create: {
        email: 'admin@lwtasks.com',
        name: 'Administrator',
        password: adminPassword,
      },
    })

    console.log('✅ Admin-Benutzer erstellt:', adminUser.email)
    console.log('🔑 Passwort: admin123')

    // 2. Standard-Organisation erstellen
    const defaultOrganization = await prisma.organization.upsert({
      where: { id: 'default-org' },
      update: {},
      create: {
        id: 'default-org',
        name: 'LW Tasks Demo',
        type: 'COMPANY',
        createdById: adminUser.id,
        settings: {
          timezone: 'Europe/Berlin',
          language: 'de',
          dateFormat: 'DD.MM.YYYY'
        }
      },
    })

    console.log('✅ Standard-Organisation erstellt:', defaultOrganization.name)

    // 3. Admin als Owner zur Organisation hinzufügen
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: adminUser.id,
          organizationId: defaultOrganization.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        organizationId: defaultOrganization.id,
        role: 'OWNER',
      },
    })

    console.log('✅ Admin zu Organisation hinzugefügt')

    // 4. Standard-Projekt erstellen
    const defaultProject = await prisma.project.upsert({
      where: { id: 'default-project' },
      update: {},
      create: {
        id: 'default-project',
        name: 'Standard-Projekt',
        description: 'Standard-Projekt für die Demo-Organisation',
        color: '#3b82f6',
        organizationId: defaultOrganization.id,
      },
    })

    console.log('✅ Standard-Projekt erstellt:', defaultProject.name)

    // 5. Standard-Buckets erstellen
    const defaultBuckets = [
      {
        name: 'Heute',
        type: 'TODAY',
        color: '#ef4444',
        order: 0,
      },
      {
        name: 'Morgen',
        type: 'TOMORROW',
        color: '#f59e0b',
        order: 1,
      },
      {
        name: 'Diese Woche',
        type: 'THIS_WEEK',
        color: '#3b82f6',
        order: 2,
      },
    ]

    for (const bucketData of defaultBuckets) {
      await prisma.bucket.upsert({
        where: {
          userId_organizationId_name: {
            userId: adminUser.id,
            organizationId: defaultOrganization.id,
            name: bucketData.name,
          },
        },
        update: {},
        create: {
          ...bucketData,
          userId: adminUser.id,
          organizationId: defaultOrganization.id,
          projectId: defaultProject.id,
        },
      })
    }

    console.log('✅ Standard-Buckets erstellt')

    // 6. Test-Aufgabe erstellen
    const testTask = await prisma.task.create({
      data: {
        title: 'Willkommen bei LW Tasks!',
        description: 'Dies ist eine Test-Aufgabe. Sie können sie bearbeiten oder löschen.',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Morgen
        category: 'Einführung',
        assignedTo: 'Administrator',
        notes: 'Herzlich willkommen in Ihrer neuen Aufgabenverwaltung!',
        userId: adminUser.id,
        organizationId: defaultOrganization.id,
        projectId: defaultProject.id,
        bucketId: (await prisma.bucket.findFirst({
          where: { name: 'Heute', userId: adminUser.id }
        }))?.id,
      },
    })

    console.log('✅ Test-Aufgabe erstellt:', testTask.title)

    console.log('\n🎉 Datenbank erfolgreich initialisiert!')
    console.log('\n📋 Login-Daten:')
    console.log('   E-Mail: admin@lwtasks.com')
    console.log('   Passwort: admin123')
    console.log('\n🏢 Organisation:')
    console.log('   Name: LW Tasks Demo')
    console.log('   Typ: Firma')
    console.log('\n🚀 Sie können jetzt mit der App starten!')

  } catch (error) {
    console.error('❌ Fehler bei der Datenbank-Initialisierung:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
