import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateRandomName } from '@/lib/api';

const createUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

const updateUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  displayName: z.string().optional(),
  farcasterFid: z.number().optional(),
  farcasterUsername: z.string().optional(),
  farcasterBio: z.string().optional(),
  farcasterFollowing: z.number().optional(),
  farcasterFollowers: z.number().optional(),
  ipfsBackupEnabled: z.boolean().optional(),
  autoSyncEnabled: z.boolean().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { walletAddress } = createUserSchema.parse(body);

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          displayName: generateRandomName(),
          ipfsBackupEnabled: false,
          autoSyncEnabled: true,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user profile POST:', error);
    
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

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    const { walletAddress, ...updateData } = validatedData;

    const user = await prisma.user.update({
      where: { walletAddress },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user profile PUT:', error);
    
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

    const { walletAddress: validAddress } = createUserSchema.parse({ walletAddress });

    const user = await prisma.user.findUnique({
      where: { walletAddress: validAddress },
      include: {
        events: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user profile GET:', error);
    
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