const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;

let redisClient = null;

try {
  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        console.warn(
          "Redis connection failed. Continuing without Redis caching.",
        );
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on("error", (err) => {
    console.warn("Redis Client Warning:", err.message);
  });
} catch (e) {
  console.warn("Could not initialize Redis client:", e.message);
}

module.exports = redisClient;
