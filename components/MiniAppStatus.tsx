import { useMiniAppSDK } from '@/hooks/use-miniapp-sdk';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function MiniAppStatus() {
  const { isReady, isLoading, error } = useMiniAppSDK();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <h3 className="text-sm font-medium mb-2">MiniApp SDK Status</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            ) : isReady ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs">
              {isLoading ? 'Initializing...' : isReady ? 'Ready' : 'Failed'}
            </span>
          </div>
          {error && (
            <Badge variant="destructive" className="text-xs">
              {error}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
} 