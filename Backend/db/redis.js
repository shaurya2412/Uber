const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 1) {
        return false; // Stop retrying if Redis is not locally active
      }
      return 200;
    }
  }
});

redisClient.on("error", (err) => console.warn("Redis Notice:", err.message));
redisClient.on("connect", () => console.log("Connected to Redis"));

redisClient.connect().catch((err) => console.warn("Redis initial connect notice:", err.message));

module.exports = redisClient;
