import React, { useEffect, useState } from "react";

// Only import the SDK on the client
let sdk: any = null;
if (typeof window !== "undefined") {
  try {
    sdk = require("@farcaster/miniapp-sdk").sdk;
  } catch {}
}

interface MiniAppContainerProps {
  children: React.ReactNode;
}

export default function MiniAppContainer({ children }: MiniAppContainerProps) {
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      // Prefer SDK detection if available
      if (sdk && sdk.isInMiniApp) {
        const result = await sdk.isInMiniApp();
        if (!cancelled) setIsMiniApp(result);
      } else {
        // Fallback: check for ?miniApp=true in URL
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (url.searchParams.get("miniApp") === "true") {
            setIsMiniApp(true);
          }
        }
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (isMiniApp) {
    return (
      <div className="farcaster-miniapp-container">
        {children}
      </div>
    );
  }
  return <>{children}</>;
} 