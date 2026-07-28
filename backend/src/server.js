const dotenv = require('dotenv');
dotenv.config();

const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

// Enable cluster mode when in production or when explicitly configured
const isClusterMode = process.env.NODE_ENV === 'production' || process.env.CLUSTER_MODE === 'true';

if (isClusterMode && cluster.isPrimary) {
  console.log(`[Cluster Primary] Master process ${process.pid} is running. Forking ${numCPUs} worker processes...`);

  // Fork worker processes
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Cluster Primary] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Forking replacement worker...`);
    cluster.fork();
  });
} else {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server (PID ${process.pid}) running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    } catch (error) {
      console.error(`[Worker ${process.pid}] Failed to start server:`, error);
      process.exit(1);
    }
  };

  startServer();
}
