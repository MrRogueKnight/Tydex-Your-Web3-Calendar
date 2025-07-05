'use client';

import { useState, useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { User, Calendar, Trophy, TrendingUp, Download, Upload, Settings, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { truncateAddress, getEventTypeIcon, apiClient } from '@/lib/api';
import type { UserProfileProps, Event, UserStats, ActivityData } from '@/lib/types';

export function UserProfile({ user, events, onUserUpdate }: UserProfileProps): JSX.Element {
  const [showExportImport, setShowExportImport] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Calculate user statistics
  const userStats: UserStats = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const eventsThisMonth = events.filter(event => 
      new Date(event.date) >= startOfCurrentMonth
    ).length;

    // Calculate streak (consecutive days with events)
    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (streakDays < 365) { // Max 365 days check
      const hasEventOnDate = events.some(event => 
        isSameDay(new Date(event.date), currentDate)
      );
      
      if (hasEventOnDate) {
        streakDays++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    // Find most common event type
    const eventTypeCounts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteEventType = Object.keys(eventTypeCounts).length > 0 
      ? Object.keys(eventTypeCounts).reduce((a, b) => 
          eventTypeCounts[a] > eventTypeCounts[b] ? a : b
        ) as any
      : null;

    const upcomingEvents = events.filter(event => 
      new Date(event.date) > now
    ).length;

    return {
      totalEvents: events.length,
      eventsThisMonth,
      streakDays,
      favoriteEventType,
      upcomingEvents,
    };
  }, [events]);

  // Calculate activity data for heatmap
  const activityData: ActivityData[] = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    return daysInYear.map(date => {
      const eventsOnDate = events.filter(event => 
        isSameDay(new Date(event.date), date)
      ).length;

      return {
        date: format(date, 'yyyy-MM-dd'),
        count: eventsOnDate,
      };
    });
  }, [events]);

  // Generate achievements based on user activity
  const achievements = useMemo(() => {
    const achievements = [];

    if (userStats.totalEvents >= 1) {
      achievements.push({
        title: 'First Event',
        description: 'Created your first event',
        icon: '🌟',
        earned: true,
      });
    }

    if (userStats.totalEvents >= 10) {
      achievements.push({
        title: 'Event Creator',
        description: 'Created 10 events',
        icon: '📅',
        earned: true,
      });
    }

    if (userStats.totalEvents >= 50) {
      achievements.push({
        title: 'Calendar Master',
        description: 'Created 50 events',
        icon: '🏆',
        earned: true,
      });
    }

    if (userStats.streakDays >= 7) {
      achievements.push({
        title: 'Week Warrior',
        description: '7-day event streak',
        icon: '🔥',
        earned: true,
      });
    }

    if (userStats.streakDays >= 30) {
      achievements.push({
        title: 'Monthly Master',
        description: '30-day event streak',
        icon: '💎',
        earned: true,
      });
    }

    if (user?.farcasterUsername) {
      achievements.push({
        title: 'Social Butterfly',
        description: 'Connected Farcaster account',
        icon: '🦋',
        earned: true,
      });
    }

    // Add some future achievements
    if (userStats.totalEvents < 100) {
      achievements.push({
        title: 'Century Club',
        description: 'Create 100 events',
        icon: '💯',
        earned: false,
      });
    }

    if (userStats.streakDays < 100) {
      achievements.push({
        title: 'Streak Legend',
        description: '100-day event streak',
        icon: '👑',
        earned: false,
      });
    }

    return achievements;
  }, [userStats, user]);

  const handleEditName = (): void => {
    setEditedName(user?.displayName || user?.farcasterUsername || '');
    setIsEditingName(true);
  };

  const handleSaveName = async (): Promise<void> => {
    if (!editedName.trim() || !user?.walletAddress) return;

    setIsUpdating(true);
    try {
      const updatedUser = await apiClient.updateUser({
        walletAddress: user.walletAddress,
        displayName: editedName.trim(),
      });

      if (updatedUser && onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setIsEditingName(false);
      setEditedName('');
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleExportData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: user?.walletAddress }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tydex-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getActivityIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count >= 3) return 'bg-green-500 dark:bg-green-600';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.walletAddress}`} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter your name"
                      className="text-xl font-bold"
                      disabled={isUpdating}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={isUpdating || !editedName.trim()}
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl">
                      {user?.displayName || user?.farcasterUsername || 'Anonymous User'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditName}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <CardDescription className="space-y-1">
                <div>{'Wallet: ' + truncateAddress(user?.walletAddress || '')}</div>
                {user?.farcasterUsername && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {'@' + user.farcasterUsername}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {`${user.farcasterFollowers || 0} followers`}
                    </span>
                  </div>
                )}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowExportImport(!showExportImport)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {showExportImport && (
          <CardContent className="pt-0">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                {'Export Data'}
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                {'Import Data'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{userStats.totalEvents}</div>
                <div className="text-xs text-gray-500">{'Total Events'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{userStats.eventsThisMonth}</div>
                <div className="text-xs text-gray-500">{'This Month'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <div>
                <div className="text-2xl font-bold">{userStats.streakDays}</div>
                <div className="text-xs text-gray-500">{'Day Streak'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {userStats.favoriteEventType && (
                <span className="text-lg">{getEventTypeIcon(userStats.favoriteEventType)}</span>
              )}
              <div>
                <div className="text-sm font-bold">
                  {userStats.favoriteEventType || 'None'}
                </div>
                <div className="text-xs text-gray-500">{'Favorite Type'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{'Activity This Year'}</span>
          </CardTitle>
          <CardDescription>
            {'Your event creation activity over the past year'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-52 gap-1 mb-4">
            {activityData.map((day, index) => (
              <div
                key={day.date}
                className={`
                  w-2 h-2 rounded-sm ${getActivityIntensity(day.count)}
                  hover:scale-110 transition-transform cursor-pointer
                `}
                title={`${day.date}: ${day.count} event${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{'Less'}</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-800" />
              <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-2 h-2 rounded-sm bg-green-300 dark:bg-green-800" />
              <div className="w-2 h-2 rounded-sm bg-green-500 dark:bg-green-600" />
            </div>
            <span>{'More'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>{'Achievements'}</span>
          </CardTitle>
          <CardDescription>
            {`${achievements.filter(a => a.earned).length} of ${achievements.length} unlocked`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border transition-all
                  ${achievement.earned 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className={`
                      font-semibold
                      ${achievement.earned ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'}
                    `}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {'Unlocked'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Achievement */}
      {userStats.totalEvents < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>{'Next Goal: Century Club'}</CardTitle>
            <CardDescription>
              {`Create ${100 - userStats.totalEvents} more events to unlock this achievement`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(userStats.totalEvents / 100) * 100} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{`${userStats.totalEvents} events`}</span>
              <span>{'100 events'}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}