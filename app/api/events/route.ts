import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const getEventsSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

const createEventSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  time: z.string().optional(),
  type: z.enum(['BIRTHDAY', 'MEETING', 'REMINDER', 'CUSTOM']).default('CUSTOM'),
  isPrivate: z.boolean().default(false),
  recurrence: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Check if this is a request to get events (has only walletAddress)
    if (Object.keys(body).length === 1 && 'walletAddress' in body) {
      const { walletAddress } = getEventsSchema.parse(body);
      
      // Get user first
      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get events for the user
      const events = await prisma.event.findMany({
        where: { userId: user.id },
        orderBy: { date: 'asc' },
        include: {
          user: {
            select: {
              displayName: true,
              walletAddress: true,
            },
          },
        },
      });

      return NextResponse.json(events);
    }
    
    // Otherwise, create a new event
    const validatedData = createEventSchema.parse(body);
    const { walletAddress, ...eventData } = validatedData;

    // Get user first
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        ...eventData,
        date: new Date(eventData.date),
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

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error in events POST:', error);
    
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const { walletAddress: validAddress } = getEventsSchema.parse({ walletAddress });

    // Get user first
    const user = await prisma.user.findUnique({
      where: { walletAddress: validAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build where clause for date filtering
    const whereClause: any = { userId: user.id };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      include: {
        user: {
          select: {
            displayName: true,
            walletAddress: true,
          },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in events GET:', error);
    
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