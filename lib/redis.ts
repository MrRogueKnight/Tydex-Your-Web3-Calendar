import { createClient } from 'redis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | null | undefined;
};

// Only create Redis client if URL is provided
export const redis = globalForRedis.redis ?? (env.REDIS_URL ? createClient({
  url: env.REDIS_URL,
  password: env.REDIS_TOKEN,
}) : null);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
