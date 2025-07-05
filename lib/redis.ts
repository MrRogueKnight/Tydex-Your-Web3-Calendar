import { Redis } from "@upstash/redis";
import { env } from "./env";

let redis: Redis | null = null;

try {
  if (env.REDIS_URL && env.REDIS_TOKEN) {
    redis = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });
  } else {
    console.warn(
      "REDIS_URL or REDIS_TOKEN environment variable is not defined, please add to enable background notifications and webhooks.",
    );
  }
} catch (error) {
  console.warn("Failed to initialize Redis client:", error);
}

export { redis };
