# Vercel Deployment Guide for Tydex Web3 Calendar

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need a PostgreSQL database (recommended: Vercel Postgres or Neon)

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

### Option B: Neon Database
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Step 2: Set Up Redis (Optional but Recommended)
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the connection URL and token

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

### Required Environment Variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Neynar API (for Farcaster integration)
NEYNAR_API_KEY="your-neynar-api-key"

# Redis (for notifications)
REDIS_URL="redis://username:password@host:port"
REDIS_TOKEN="your-redis-token"

# Public URLs
NEXT_PUBLIC_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_ENV="production"

# Farcaster Frame Configuration
NEXT_PUBLIC_FARCASTER_HEADER="your-farcaster-header"
NEXT_PUBLIC_FARCASTER_PAYLOAD="your-farcaster-payload"
NEXT_PUBLIC_FARCASTER_SIGNATURE="your-farcaster-signature"
```

## Step 5: Database Migration

After deployment, you need to run database migrations:

1. Go to your Vercel project dashboard
2. Go to Functions tab
3. Create a new function or use the Vercel CLI:

```bash
vercel env pull .env.local
npx prisma db push
```

## Step 6: Verify Deployment

1. Check your deployment logs in Vercel dashboard
2. Visit your deployed URL
3. Test the application functionality

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all environment variables are set
   - Ensure Prisma client is generated during build
   - Verify database connection string

2. **Database Connection Issues**:
   - Check DATABASE_URL format
   - Ensure database is accessible from Vercel
   - Verify SSL settings if required

3. **Environment Variable Issues**:
   - Make sure all required variables are set
   - Check for typos in variable names
   - Ensure proper formatting (no extra spaces)

4. **Prisma Issues**:
   - Run `npx prisma generate` locally to test
   - Check Prisma schema syntax
   - Verify database schema matches Prisma schema

### Debug Commands:

```bash
# Test build locally
npm run build

# Test Prisma generation
npx prisma generate

# Test database connection
npx prisma db push

# Check environment variables
npx vercel env ls
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review this guide
3. Check the project's GitHub issues
4. Contact support with specific error messages 