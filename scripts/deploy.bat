@echo off
echo 🚀 Starting deployment process...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Vercel. Please login first:
    vercel login
    exit /b 1
)

echo ✅ Vercel CLI ready

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Build the project
echo 🏗️ Building project...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
    exit /b 1
)

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 📝 Don't forget to:
echo    1. Set up environment variables in Vercel dashboard
echo    2. Run database migrations: npx prisma db push
echo    3. Test your application 