import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDb() {
  console.log('🔄 Resetting database...')

  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `)

  const tableNames = tables.map(t => `"public"."${t.tablename}"`).join(', ')

  if (!tableNames) {
    console.log('⚠️ No tables found.')
    return
  }

  const truncateQuery = `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`
  await prisma.$executeRawUnsafe(truncateQuery)

  console.log('✅ All tables truncated. DB is now clean.')
}

resetDb()
  .catch((err) => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
