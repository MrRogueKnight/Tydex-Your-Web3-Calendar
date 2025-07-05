'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Link2, Users, UserCheck, ExternalLink, Unlink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FarcasterConnectProps } from '@/lib/types';

export function FarcasterConnect({ user, onUserUpdate }: FarcasterConnectProps): JSX.Element {
  const { address } = useAccount();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [fidInput, setFidInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isConnected = Boolean(user?.farcasterFid);

  const handleConnect = async (): Promise<void> => {
    if (!address || !fidInput.trim()) {
      setError('Please enter a valid Farcaster ID');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const fid = parseInt(fidInput.trim(), 10);
      if (isNaN(fid) || fid <= 0) {
        setError('Please enter a valid numeric Farcaster ID');
        return;
      }

      // In a real implementation, you would fetch Farcaster data from an API
      // For now, we'll simulate connecting with mock data
      const mockFarcasterData = {
        fid,
        username: `user${fid}`,
        displayName: `Farcaster User ${fid}`,
        bio: 'Web3 enthusiast and calendar power user 📅',
        followers: Math.floor(Math.random() * 1000) + 100,
        following: Math.floor(Math.random() * 500) + 50,
      };

      const response = await fetch('/api/farcaster/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          farcasterData: mockFarcasterData,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
        setFidInput('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect Farcaster account');
      }
    } catch (error) {
      console.error('Error connecting Farcaster:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    if (!address) return;

    setIsDisconnecting(true);
    setError('');

    try {
      const response = await fetch(`/api/farcaster/connect?walletAddress=${address}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disconnect Farcaster account');
      }
    } catch (error) {
      console.error('Error disconnecting Farcaster:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isConnected) {
    return (
      <div className="space-y-6">
        {/* Connected Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span>{'Farcaster Connected'}</span>
            </CardTitle>
            <CardDescription>
              {'Your Farcaster profile is linked to this calendar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.farcasterUsername}`} 
                />
                <AvatarFallback>
                  <Users className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold">
                    {user?.displayName || user?.farcasterUsername}
                  </h3>
                  <Badge variant="secondary">
                    {'FID: ' + user?.farcasterFid}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {'@' + user?.farcasterUsername}
                </p>
                
                {user?.farcasterBio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {user.farcasterBio}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{`${formatNumber(user?.farcasterFollowers)} followers`}</span>
                  </span>
                  <span>{`${formatNumber(user?.farcasterFollowing)} following`}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {'✓ Verified'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {'Connected to your wallet'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Unlink className="w-4 h-4 mr-2" />
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Features */}
        <Card>
          <CardHeader>
            <CardTitle>{'Social Features'}</CardTitle>
            <CardDescription>
              {'Enhanced features available with Farcaster connection'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="font-medium">{'Event Notifications'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {'Get notified about upcoming events via Farcaster'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-2xl">📤</span>
                <div>
                  <h4 className="font-medium">{'Share Events'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {'Share your public events with your Farcaster network'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-2xl">🌐</span>
                <div>
                  <h4 className="font-medium">{'Social Calendar'}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {'See events from your Farcaster connections'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connect Farcaster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            <span>{'Connect Farcaster'}</span>
          </CardTitle>
          <CardDescription>
            {'Link your Farcaster account to unlock social features'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fid">{'Farcaster ID (FID)'}</Label>
            <Input
              id="fid"
              type="number"
              placeholder="Enter your Farcaster ID..."
              value={fidInput}
              onChange={(e) => setFidInput(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-gray-500">
              {'Find your FID at '}
              <a 
                href="https://warpcast.com/~/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline inline-flex items-center"
              >
                {'warpcast.com/~/settings'}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleConnect}
            disabled={isConnecting || !fidInput.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Link2 className="w-4 h-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Farcaster'}
          </Button>
        </CardContent>
      </Card>

      {/* Benefits of Connecting */}
      <Card>
        <CardHeader>
          <CardTitle>{'Why Connect Farcaster?'}</CardTitle>
          <CardDescription>
            {'Unlock these features by connecting your Farcaster account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                {'🎯'}
              </span>
              <div>
                <h4 className="font-medium">{'Enhanced Identity'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {'Show your Farcaster profile and build your Web3 reputation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                {'🔔'}
              </span>
              <div>
                <h4 className="font-medium">{'Smart Notifications'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {'Get reminders and updates through your preferred channels'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                {'🌐'}
              </span>
              <div>
                <h4 className="font-medium">{'Social Calendar'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {'Connect with friends and see community events'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                {'🏆'}
              </span>
              <div>
                <h4 className="font-medium">{'Exclusive Achievements'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {'Unlock special badges and achievements for social interactions'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Farcaster */}
      <Card>
        <CardHeader>
          <CardTitle>{'About Farcaster'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {'Farcaster is a decentralized social protocol that lets you own your social identity and data. By connecting your Farcaster account, you bring your existing Web3 social graph into Tydex.'}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://farcaster.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              {'Learn More About Farcaster'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}