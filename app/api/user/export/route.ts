import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const exportDataSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { walletAddress } = exportDataSchema.parse(body);

    // Get user with all events
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        events: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create export data
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        farcasterFid: user.farcasterFid,
        farcasterUsername: user.farcasterUsername,
        farcasterBio: user.farcasterBio,
        farcasterFollowing: user.farcasterFollowing,
        farcasterFollowers: user.farcasterFollowers,
        ipfsBackupEnabled: user.ipfsBackupEnabled,
        autoSyncEnabled: user.autoSyncEnabled,
        createdAt: user.createdAt,
      },
      events: user.events.map(event => ({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        type: event.type,
        isPrivate: event.isPrivate,
        recurrence: event.recurrence,
        tags: event.tags,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
      stats: {
        totalEvents: user.events.length,
        eventTypes: user.events.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `tydex-export-${timestamp}.json`;

    // Return file as download
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in user export POST:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const { walletAddress: validAddress } = exportDataSchema.parse({ walletAddress });

    // Get user stats for export preview
    const user = await prisma.user.findUnique({
      where: { walletAddress: validAddress },
      select: {
        walletAddress: true,
        displayName: true,
        farcasterUsername: true,
        createdAt: true,
        events: {
          select: {
            type: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const stats = {
      totalEvents: user.events.length,
      eventTypes: user.events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    };

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        farcasterUsername: user.farcasterUsername,
        createdAt: user.createdAt,
      },
      stats,
    });
  } catch (error) {
    console.error('Error in user export GET:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}