import { app } from './app.js';
import { connectDatabase, pool } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`API listening on http://localhost:${env.PORT}`);
    });

    server.on('error', async (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${env.PORT} is already in use. Stop the existing server or choose another PORT in .env.`);
      } else {
        console.error('HTTP server failed:', error);
      }

      await pool.end();
      process.exit(1);
    });

    const stop = () => {
      server.close(() => pool.end().finally(() => process.exit(0)));
    };

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  } catch (error) {
    console.error('Database connection failed:', error);
    await pool.end();
    process.exit(1);
  }
}

void startServer();
