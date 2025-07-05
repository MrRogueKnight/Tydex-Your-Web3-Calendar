import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    // Check environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    };

    // Test database connection
    let dbStatus = 'unknown';
    let userCount = 0;
    let eventCount = 0;
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      
      // Get counts
      userCount = await prisma.user.count();
      eventCount = await prisma.event.count();
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Database connection error:', dbError);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        userCount,
        eventCount,
      },
      prisma: {
        clientGenerated: true,
        outputPath: '../lib/generated/prisma',
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 