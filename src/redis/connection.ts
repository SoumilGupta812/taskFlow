
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,

  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export default redis;
