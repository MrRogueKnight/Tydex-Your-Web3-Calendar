#!/bin/bash

echo "🧹 Cleaning up node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Clean install completed!" 