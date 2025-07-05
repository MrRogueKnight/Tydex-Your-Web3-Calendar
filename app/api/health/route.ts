import { NextResponse } from 'next/server';
import { getEnvironmentStatus } from '@/lib/env-validator';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const envStatus = getEnvironmentStatus();
    
    // Test database connection
    let dbStatus = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      console.error('Database connection error:', error);
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: dbStatus,
      version: process.env.npm_package_version || 'unknown',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 