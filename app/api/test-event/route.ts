import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('Test event creation - received body:', body);
    
    const { walletAddress, title, date } = body;
    
    if (!walletAddress || !title || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, title, date' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    console.log('User lookup result:', user);

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          walletAddress,
          displayName: `User ${walletAddress.slice(0, 6)}...`,
          ipfsBackupEnabled: false,
          autoSyncEnabled: true,
        },
      });
      console.log('Created new user:', user);
    }

    // Create test event
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        type: 'CUSTOM',
        isPrivate: false,
        tags: [],
        userId: user.id,
      },
      include: {
        user: {
          select: {
            displayName: true,
            walletAddress: true,
          },
        },
      },
    });

    console.log('Created test event:', event);

    return NextResponse.json({
      success: true,
      event,
      message: 'Test event created successfully'
    });
  } catch (error) {
    console.error('Error in test event creation:', error);
    return NextResponse.json(
      { 
        error: 'Test event creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      userCount,
      eventCount,
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        error: 'Database connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 