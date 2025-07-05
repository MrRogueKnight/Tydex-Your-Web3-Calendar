# Deployment Guide for Tydex - Your Web3 Calendar

## Quick Fix for Current Build Issues

If you're experiencing build failures, follow these steps:

### 1. Clean Install Dependencies

**On Windows:**
```bash
scripts/clean-install.bat
```

**On Mac/Linux:**
```bash
chmod +x scripts/clean-install.sh
./scripts/clean-install.sh
```

### 2. Manual Clean Install
```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install

# Generate Prisma client
npx prisma generate
```

## Environment Variables Setup

### Required for Build (Optional but Recommended)
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Neynar API
NEYNAR_API_KEY="your-neynar-api-key"

# Redis (Optional)
REDIS_URL="redis://username:password@host:port"
REDIS_TOKEN="your-redis-token"

# Public URLs
NEXT_PUBLIC_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_ENV="production"

# Farcaster Frame Configuration (Optional)
NEXT_PUBLIC_FARCASTER_HEADER="your-farcaster-header"
NEXT_PUBLIC_FARCASTER_PAYLOAD="your-farcaster-payload"
NEXT_PUBLIC_FARCASTER_SIGNATURE="your-farcaster-signature"
```

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable from the list above
4. Make sure to set the environment to "Production"

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In your Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`
4. Run migrations: `npx prisma db push`

### Option 2: External Database
- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Railway](https://railway.app) - Easy database hosting

## Redis Setup (Optional)

For notifications and caching:
1. Create account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy connection details to environment variables

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix build issues and update dependencies"
git push origin main
```

### 2. Deploy on Vercel
- Connect your GitHub repository to Vercel
- Set environment variables
- Deploy

### 3. Verify Deployment
- Check build logs for any errors
- Test the health endpoint: `https://your-app.vercel.app/api/health`
- Verify database connection

## Troubleshooting

### Common Build Errors

#### 1. TypeScript Errors
- **Error**: Redis client type conflicts
- **Solution**: Fixed in `lib/redis.ts` - updated type definitions

#### 2. Dependency Conflicts
- **Error**: React version conflicts, Farcaster SDK version issues
- **Solution**: Updated `package.json` with compatible versions

#### 3. Environment Variable Issues
- **Error**: Missing required environment variables
- **Solution**: All environment variables are now optional during build

#### 4. Prisma Generation Issues
- **Error**: Prisma client not generated
- **Solution**: Added `prisma generate` to build script

### Debug Commands

```bash
# Test build locally
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Test Prisma generation
npx prisma generate

# Test database connection
npx prisma db push

# Check environment variables
npx vercel env ls
```

### Health Check Endpoint

After deployment, test the health endpoint:
```
https://your-app.vercel.app/api/health
```

This will show:
- Environment variable status
- Database connection status
- Application version

## Performance Optimization

### 1. Enable Caching
- Set up Redis for session storage
- Configure CDN for static assets

### 2. Database Optimization
- Use connection pooling
- Enable query optimization
- Set up proper indexes

### 3. Build Optimization
- Enable Next.js build caching
- Use Vercel's edge functions where appropriate

## Monitoring

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics

### 2. Error Tracking
- Set up error monitoring (Sentry, LogRocket)
- Monitor API endpoint health

### 3. Database Monitoring
- Monitor database performance
- Set up alerts for connection issues

## Security Checklist

- [ ] JWT_SECRET is set and secure
- [ ] Database connection uses SSL
- [ ] Environment variables are properly configured
- [ ] API endpoints have proper validation
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented

## Support

If you continue to experience issues:

1. Check the build logs in Vercel dashboard
2. Test the health endpoint
3. Verify all environment variables are set
4. Check database connectivity
5. Review the troubleshooting section above

For additional help, refer to the main README.md file. 