import { env } from "./env";

/**
 * Get the farcaster manifest for the Mini App
 * This generates the manifest that Farcaster expects for Mini App submission
 * @returns The farcaster Mini App manifest
 */
export async function getFarcasterManifest() {
  const appUrl = env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  return {
    frame: {
      name: "Tydex-Your-Web3-Calendar",
      version: "1",
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: "Launch Tydex",
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#4F46E5",
      webhookUrl: `${appUrl}/api/webhook`,
      subtitle: "Plan Share Sync Web3 Events",
      description: "Tydex is your decentralized calendar hub. Discover, create, and share Web3 events seamlessly integrated with Farcaster.",
      primaryCategory: "productivity",
      tags: [
        "calendar",
        "web3",
        "social",
        "trending",
        "mini"
      ],
      tagline: "Your Web3 Calendar",
      ogTitle: "Tydex – Your Web3 Calendar",
      ogDescription: "Create and discover Web3 events"
    },
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER || '',
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD || '',
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE || ''
    }
  };
}
