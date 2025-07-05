import { createClient } from 'redis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const redis = globalForRedis.redis ?? createClient({
  url: env.REDIS_URL,
  password: env.REDIS_TOKEN,
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
