import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const importDataSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  data: z.string().min(1, 'Import data is required'),
  overwrite: z.boolean().default(false),
});

const exportedDataSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  user: z.object({
    walletAddress: z.string(),
    displayName: z.string().optional(),
    farcasterFid: z.number().optional(),
    farcasterUsername: z.string().optional(),
    farcasterBio: z.string().optional(),
    farcasterFollowing: z.number().optional(),
    farcasterFollowers: z.number().optional(),
    ipfsBackupEnabled: z.boolean(),
    autoSyncEnabled: z.boolean(),
  }),
  events: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    time: z.string().optional(),
    type: z.enum(['BIRTHDAY', 'MEETING', 'REMINDER', 'CUSTOM']),
    isPrivate: z.boolean(),
    recurrence: z.string().optional(),
    tags: z.array(z.string()),
  })),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { walletAddress, data, overwrite } = importDataSchema.parse(body);

    // Parse imported data
    let parsedData: any;
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    // Validate imported data structure
    const validatedData = exportedDataSchema.parse(parsedData);

    // Check if the wallet addresses match
    if (validatedData.user.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address mismatch. You can only import your own data.' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user with imported data
      user = await prisma.user.create({
        data: {
          walletAddress,
          displayName: validatedData.user.displayName,
          farcasterFid: validatedData.user.farcasterFid,
          farcasterUsername: validatedData.user.farcasterUsername,
          farcasterBio: validatedData.user.farcasterBio,
          farcasterFollowing: validatedData.user.farcasterFollowing,
          farcasterFollowers: validatedData.user.farcasterFollowers,
          ipfsBackupEnabled: validatedData.user.ipfsBackupEnabled,
          autoSyncEnabled: validatedData.user.autoSyncEnabled,
        },
      });
    } else if (overwrite) {
      // Update existing user
      user = await prisma.user.update({
        where: { walletAddress },
        data: {
          displayName: validatedData.user.displayName,
          farcasterFid: validatedData.user.farcasterFid,
          farcasterUsername: validatedData.user.farcasterUsername,
          farcasterBio: validatedData.user.farcasterBio,
          farcasterFollowing: validatedData.user.farcasterFollowing,
          farcasterFollowers: validatedData.user.farcasterFollowers,
          ipfsBackupEnabled: validatedData.user.ipfsBackupEnabled,
          autoSyncEnabled: validatedData.user.autoSyncEnabled,
        },
      });

      // If overwrite is true, delete existing events
      await prisma.event.deleteMany({
        where: { userId: user.id },
      });
    }

    // Import events
    const importedEvents = [];
    for (const eventData of validatedData.events) {
      try {
        const event = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            date: new Date(eventData.date),
            time: eventData.time,
            type: eventData.type,
            isPrivate: eventData.isPrivate,
            recurrence: eventData.recurrence,
            tags: eventData.tags,
            userId: user.id,
          },
        });
        importedEvents.push(event);
      } catch (error) {
        console.error('Error importing event:', eventData.title, error);
        // Continue with other events even if one fails
      }
    }

    return NextResponse.json({
      message: 'Data imported successfully',
      imported: {
        user: user,
        eventsCount: importedEvents.length,
        totalEventsInImport: validatedData.events.length,
      },
    });
  } catch (error) {
    console.error('Error in user import POST:', error);
    
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

    // Validate wallet address
    const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');
    const validAddress = addressSchema.parse(walletAddress);

    // Get current user data for import comparison
    const user = await prisma.user.findUnique({
      where: { walletAddress: validAddress },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found. Import will create a new account.' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      currentData: {
        user: {
          walletAddress: user.walletAddress,
          displayName: user.displayName,
          farcasterUsername: user.farcasterUsername,
          eventsCount: user.events.length,
        },
        recentEvents: user.events,
      },
    });
  } catch (error) {
    console.error('Error in user import GET:', error);
    
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