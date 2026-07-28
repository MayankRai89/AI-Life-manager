const redisClient = require("../config/cache.config");

// In-Memory Fallback Cache (Sub-ms performance for high concurrency)
const memoryCache = new Map();
const memoryExpiry = new Map();

/**
 * Get item from cache (Redis -> Memory Fallback)
 */
async function getCache(key) {
  try {
    if (redisClient && redisClient.status === "ready") {
      const val = await redisClient.get(key);
      if (val) return JSON.parse(val);
    }
  } catch (err) {
    // Redis unavailable, use memory fallback
  }

  // Memory Fallback check
  if (memoryCache.has(key)) {
    const expireTime = memoryExpiry.get(key);
    if (expireTime && Date.now() > expireTime) {
      memoryCache.delete(key);
      memoryExpiry.delete(key);
      return null;
    }
    return memoryCache.get(key);
  }

  return null;
}

/**
 * Set item in cache with TTL in seconds (default 1 hour = 3600s)
 */
async function setCache(key, value, ttlSeconds = 3600) {
  const jsonStr = JSON.stringify(value);

  // Set Memory Fallback
  memoryCache.set(key, value);
  memoryExpiry.set(key, Date.now() + ttlSeconds * 1000);

  try {
    if (redisClient && redisClient.status === "ready") {
      await redisClient.set(key, jsonStr, "EX", ttlSeconds);
    }
  } catch (err) {
    // Redis write warning ignored
  }
}

/**
 * Delete cache key
 */
async function delCache(key) {
  memoryCache.delete(key);
  memoryExpiry.delete(key);
  try {
    if (redisClient && redisClient.status === "ready") {
      await redisClient.del(key);
    }
  } catch (err) {
    // Ignore
  }
}

module.exports = {
  getCache,
  setCache,
  delCache,
};
