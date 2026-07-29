import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectDB = async (): Promise<void> => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Copy server/.env.example → server/.env and fill in your database URL.');
    process.exit(1);
  }
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');

    // Warn when database appears empty (seed not run yet)
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.warn('⚠️  Database is empty — demo accounts will not work.');
      console.warn('   Run: npm run seed   (from the project root)');
    } else {
      console.log(`✅ Database ready — ${userCount} users found`);
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('   Check that DATABASE_URL in server/.env points to a running PostgreSQL instance.');
    console.error('   For local dev: set provider = "sqlite" in server/prisma/schema.prisma and use DATABASE_URL=file:./campusnest.db');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};
