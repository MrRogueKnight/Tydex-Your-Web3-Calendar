import { getFarcasterManifest } from "@/lib/warpcast";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const manifest = await getFarcasterManifest();
    
    // Test if images are accessible
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const imageTests = [
      `${appUrl}/images/icon.png`,
      `${appUrl}/images/feed.png`,
      `${appUrl}/images/splash.png`
    ];

    const imageStatus = await Promise.all(
      imageTests.map(async (url) => {
        try {
          const response = await fetch(url);
          return {
            url,
            status: response.status,
            accessible: response.ok
          };
        } catch (error) {
          return {
            url,
            status: 'error',
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return NextResponse.json({
      manifest,
      imageTests: imageStatus,
      appUrl
    });
  } catch (error) {
    console.error("Error testing manifest:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 