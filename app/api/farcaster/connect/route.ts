import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const connectFarcasterSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  farcasterData: z.object({
    fid: z.number().positive('Invalid FID'),
    username: z.string().min(1, 'Username is required'),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    followers: z.number().nonnegative().optional(),
    following: z.number().nonnegative().optional(),
  }),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { walletAddress, farcasterData } = connectFarcasterSchema.parse(body);

    // Check if Farcaster FID is already connected to another user
    const existingFarcasterUser = await prisma.user.findUnique({
      where: { farcasterFid: farcasterData.fid },
    });

    if (existingFarcasterUser && existingFarcasterUser.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: 'This Farcaster account is already connected to another wallet' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          farcasterFid: farcasterData.fid,
          farcasterUsername: farcasterData.username,
          farcasterBio: farcasterData.bio,
          farcasterFollowing: farcasterData.following || 0,
          farcasterFollowers: farcasterData.followers || 0,
          displayName: farcasterData.displayName || farcasterData.username,
          ipfsBackupEnabled: false,
          autoSyncEnabled: true,
        },
      });
    } else {
      // Update existing user with Farcaster data
      user = await prisma.user.update({
        where: { walletAddress },
        data: {
          farcasterFid: farcasterData.fid,
          farcasterUsername: farcasterData.username,
          farcasterBio: farcasterData.bio,
          farcasterFollowing: farcasterData.following || 0,
          farcasterFollowers: farcasterData.followers || 0,
          displayName: farcasterData.displayName || farcasterData.username,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in Farcaster connect POST:', error);
    
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

export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // Update user to remove Farcaster connection
    const user = await prisma.user.update({
      where: { walletAddress: validAddress },
      data: {
        farcasterFid: null,
        farcasterUsername: null,
        farcasterBio: null,
        farcasterFollowing: null,
        farcasterFollowers: null,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in Farcaster connect DELETE:', error);
    
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
    const fid = searchParams.get('fid');

    if (!walletAddress && !fid) {
      return NextResponse.json(
        { error: 'Either wallet address or FID is required' },
        { status: 400 }
      );
    }

    let user = null;

    if (walletAddress) {
      const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');
      const validAddress = addressSchema.parse(walletAddress);
      
      user = await prisma.user.findUnique({
        where: { walletAddress: validAddress },
        select: {
          farcasterFid: true,
          farcasterUsername: true,
          farcasterBio: true,
          farcasterFollowing: true,
          farcasterFollowers: true,
          displayName: true,
        },
      });
    } else if (fid) {
      const fidSchema = z.string().transform((val) => parseInt(val, 10));
      const validFid = fidSchema.parse(fid);
      
      user = await prisma.user.findUnique({
        where: { farcasterFid: validFid },
        select: {
          farcasterFid: true,
          farcasterUsername: true,
          farcasterBio: true,
          farcasterFollowing: true,
          farcasterFollowers: true,
          displayName: true,
          walletAddress: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in Farcaster connect GET:', error);
    
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