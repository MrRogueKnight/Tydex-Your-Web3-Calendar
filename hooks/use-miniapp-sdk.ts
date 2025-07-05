import { useEffect, useState } from 'react';

// Dynamic import to avoid SSR issues
let sdk: any = null;

const loadSDK = async () => {
  if (typeof window !== 'undefined' && !sdk) {
    try {
      const { sdk: miniappSDK } = await import('@farcaster/miniapp-sdk');
      sdk = miniappSDK;
    } catch (error) {
      console.warn('Failed to load MiniApp SDK:', error);
    }
  }
  return sdk;
};

export const useMiniAppSDK = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        const miniappSDK = await loadSDK();
        
        if (miniappSDK) {
          // Call ready() to hide the splash screen
          await miniappSDK.actions.ready();
          setIsReady(true);
          console.log('MiniApp SDK initialized and ready');
        } else {
          console.warn('MiniApp SDK not available');
          setIsReady(true); // Still mark as ready to avoid infinite loading
        }
      } catch (err) {
        console.error('Error initializing MiniApp SDK:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsReady(true); // Mark as ready even on error to avoid infinite loading
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  return {
    isReady,
    isLoading,
    error,
    sdk
  };
}; 