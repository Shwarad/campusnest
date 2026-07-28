/**
 * index.ts — Local development server.
 * Imports the Express app and calls listen().
 * NOT used on Vercel (which imports app.ts via api/index.ts).
 */
import { connectDB } from './config/database';
import app from './app';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CampusNest server running on http://localhost:${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API:         http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);
