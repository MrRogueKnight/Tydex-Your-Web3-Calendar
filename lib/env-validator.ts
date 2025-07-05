export function validateEnvironment() {
  const requiredVars = {
    // Server-side variables
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    
    // Client-side variables
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_FARCASTER_HEADER: process.env.NEXT_PUBLIC_FARCASTER_HEADER,
    NEXT_PUBLIC_FARCASTER_PAYLOAD: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
    NEXT_PUBLIC_FARCASTER_SIGNATURE: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
    console.warn('Some features may not work properly without these variables.');
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
}

export function getEnvironmentStatus() {
  const status = {
    database: !!process.env.DATABASE_URL,
    redis: !!(process.env.REDIS_URL && process.env.REDIS_TOKEN),
    farcaster: !!(process.env.NEXT_PUBLIC_FARCASTER_HEADER && 
                  process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD && 
                  process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE),
    neynar: !!process.env.NEYNAR_API_KEY,
    jwt: !!process.env.JWT_SECRET,
  };

  return status;
} 