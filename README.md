# Tydex - Your Web3 Calendar

A decentralized calendar application for Web3 users, built with Next.js and Farcaster integration.

## Features

- 📅 **Event Management**: Create, edit, and manage calendar events
- 🔗 **Farcaster Integration**: Connect your Farcaster account
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔐 **Web3 Authentication**: Secure wallet-based authentication
- 📱 **Mobile Optimized**: Works great on all devices
- 🔔 **Notifications**: Real-time notifications via Farcaster
- 📊 **Data Export/Import**: Backup and restore your calendar data

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [PostgreSQL](https://postgresql.org) - Database
- [Redis](https://redis.io) - Caching and notifications
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Farcaster](https://farcaster.xyz) - Social integration
- [Viem](https://viem.sh) - Ethereum library
- [Wagmi](https://wagmi.sh) - React hooks for Ethereum

- [Farcaster Mini Apps](https://miniapps.xyz)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js](https://nextjs.org/docs)
- [Neynar](https://neynar.com)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance (optional but recommended)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd Tydex-Your-Web3-Calendar
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file with the following variables:

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
NEXT_PUBLIC_URL="http://localhost:3000"
NEXT_PUBLIC_APP_ENV="development"

# Farcaster Frame Configuration
NEXT_PUBLIC_FARCASTER_HEADER="your-farcaster-header"
NEXT_PUBLIC_FARCASTER_PAYLOAD="your-farcaster-payload"
NEXT_PUBLIC_FARCASTER_SIGNATURE="your-farcaster-signature"
```

4. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Open your browser**:
Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Quick Deploy to Vercel

1. **Push your code to GitHub**

2. **Deploy using Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy!

3. **Or use the deployment script**:
```bash
# On Windows
scripts/deploy.bat

# On Mac/Linux
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Environment Variables for Production

Set these in your Vercel project dashboard:

```env
# Database (use Vercel Postgres or Neon)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Neynar API
NEYNAR_API_KEY="your-neynar-api-key"

# Redis (use Upstash)
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

### Database Setup

1. **Create a PostgreSQL database**:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended)
   - [Neon](https://neon.tech)
   - [Supabase](https://supabase.com)

2. **Run migrations**:
```bash
npx prisma db push
```

### Redis Setup (Optional)

For notifications and caching:
1. Create a Redis instance at [Upstash](https://upstash.com)
2. Add the connection details to your environment variables

## Troubleshooting

### Common Deployment Issues

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

### Debug Commands

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

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Template Features

### Frame Configuration

- `.well-known/farcaster.json` endpoint configured for Frame metadata and account association
- Frame metadata automatically added to page headers in `layout.tsx`

### Background Notifications

- Redis-backed notification system using Upstash
- Ready-to-use notification endpoints in `api/notify` and `api/webhook`
- Notification client utilities in `lib/notification-client.ts`

### MiniApp Provider

The app is wrapped with `MiniAppProvider` in `providers.tsx`, configured with:

- Access to Mini App context
- Sets up Wagmi Connectors
- Sets up Mini App SDK listeners
- Applies Safe Area Insets

### Dynamic Preview Images

- `dynamic-image-example/[id]/page.tsx` show how to create a Mini App URL resolving to a custom preview image
- `api/og/example/[id]/route.ts` shows how to generate a custom preview image

## Learn More

- [Farcaster Mini Apps](https://miniapps.xyz)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Neynar](https://neynar.com)
