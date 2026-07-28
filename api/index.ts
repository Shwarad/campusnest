/**
 * Vercel Serverless Function entry point.
 *
 * Vercel looks for files under the repo-root `api/` directory.
 * Every request to /api/* is routed here by vercel.json rewrites.
 *
 * The Express app is stateless — Prisma manages its own connection pool,
 * so no explicit connectDB() call is needed for serverless (PrismaClient
 * lazily connects on first query).
 */
import '../server/src/config/database'; // ensure prisma singleton is initialised
import app from '../server/src/app';

export default app;
