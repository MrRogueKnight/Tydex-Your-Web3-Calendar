import { env } from "./env";

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  const appUrl = env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  return {
    name: "Tydex Calendar",
    description: "Your Web3 Calendar",
    icon: `${appUrl}/images/icon.png`,
    appUrl: appUrl,
    appId: "tydex-calendar",
    app: {
      name: "Tydex Calendar",
      description: "Your Web3 Calendar",
      icon: `${appUrl}/images/icon.png`,
      appUrl: appUrl,
      appId: "tydex-calendar",
    },
    frame: {
      frameUrl: `${appUrl}/dynamic-image-example/1`,
      frameButtonText: "Launch App",
      framePostUrl: `${appUrl}/api/webhook`,
      frameInputText: "Enter your message",
      frameImageUrl: `${appUrl}/images/feed.png`,
      frameImageAspectRatio: "1.91:1",
      frameImageWidth: 600,
      frameImageHeight: 315,
      frameImageAlt: "Tydex Calendar",
      frameImageOverlay: {
        header: env.NEXT_PUBLIC_FARCASTER_HEADER || '',
        payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD || '',
        signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE || '',
      },
    },
  };
}
