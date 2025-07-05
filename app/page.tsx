'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { GoogleCalendarView } from '@/components/GoogleCalendarView';
import { WalletConnection } from '@/components/WalletConnection';
import { EventModal } from '@/components/EventModal';
import { SupportModal } from '@/components/SupportModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMiniAppSDK } from '@/hooks/use-miniapp-sdk';
import { MiniAppStatus } from '@/components/MiniAppStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Plus, 
  Search, 
  Settings, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Sun,
  Moon,
  Sparkles,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Palette,
  Filter,
  X,
  Home,
  Clock,
  Star
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { format, addMonths, subMonths, isToday } from 'date-fns';
import type { Event, User as UserType } from '@/lib/types';

type ViewMode = 'month' | 'week' | 'day';

// Enhanced debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Loading skeleton component
const CalendarSkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
    <div className="h-16 bg-muted border-b border-border"></div>
    <div className="flex">
      <div className="w-64 h-screen bg-muted border-r border-border"></div>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-6 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
        <X className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  </div>
);

export default function GoogleCalendarClone(): JSX.Element {
  const { address, isConnected } = useAccount();
  const { theme, setTheme } = useTheme();
  const { isReady: isMiniAppReady, isLoading: isMiniAppLoading, error: miniAppError } = useMiniAppSDK();
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && !sidebarCollapsed) {
        const sidebar = document.querySelector('.google-calendar-sidebar');
        const target = event.target as Element;
        
        if (sidebar && !sidebar.contains(target) && !target.closest('.sidebar-toggle')) {
          setSidebarCollapsed(true);
        }
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, sidebarCollapsed]);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    const searchTerm = debouncedSearchQuery.toLowerCase();
    return events.filter(event => {
      if (!event) return false;
      
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      const tags = Array.isArray(event.tags) ? event.tags : [];
      
      return title.includes(searchTerm) ||
             description.includes(searchTerm) ||
             tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm));
    });
  }, [events, debouncedSearchQuery]);

  // Update search results when filtered events change
  useEffect(() => {
    setShowSearchResults(debouncedSearchQuery.trim().length > 0);
  }, [debouncedSearchQuery, filteredEvents]);

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced load user data function
  const loadUserData = useCallback(async (): Promise<void> => {
    if (!address || !isConnected) {
      console.log('Cannot load user data: wallet not connected', { address, isConnected });
      return;
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(address)) {
      console.error('Invalid wallet address format:', address);
      toast.error('Invalid wallet address format');
      return;
    }
    
    try {
      setIsLoadingUser(true);
      setError(null);
      
      const url = `/api/user/profile?walletAddress=${encodeURIComponent(address)}`;
      console.log('Loading user data from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      console.log('User API Response:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't exist, create new user
          console.log('User not found, creating new user...');
          
          const createResponse = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          
          console.log('Create user response:', createResponse.status, createResponse.statusText);
          
          if (!createResponse.ok) {
            const createError = await createResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Create user error:', createError);
            throw new Error(createError.error || `Failed to create user: ${createResponse.status}`);
          }
          
          const newUser = await createResponse.json();
          console.log('New user created:', newUser);
          setUser(newUser);
          toast.success(`Welcome ${newUser.displayName}! 🎉`);
          return;
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Load user error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load user data`);
      }
      
      const userData = await response.json();
      console.log('User data loaded:', userData);
      setUser(userData);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
      setError(errorMessage);
      toast.error('Failed to load user profile. Please try again.');
    } finally {
      setIsLoadingUser(false);
    }
  }, [address, isConnected]);

  // Enhanced load events function
  const loadEvents = useCallback(async (): Promise<void> => {
    if (!address || !isConnected) {
      console.log('Cannot load events: wallet not connected', { address, isConnected });
      return;
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(address)) {
      console.error('Invalid wallet address format for events:', address);
      return;
    }
    
    try {
      setIsLoadingEvents(true);
      setError(null);
      
      const url = `/api/events?walletAddress=${encodeURIComponent(address)}`;
      console.log('Loading events from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      console.log('Events API Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Load events error:', errorData);
        
        if (response.status === 404) {
          // User not found - this is ok for new users
          console.log('Events not found (404) - setting empty array');
          setEvents([]);
          return;
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load events`);
      }
      
      const eventsData = await response.json();
      console.log('Loaded events:', eventsData);
      
      // Ensure we have valid events array
      const validEvents = Array.isArray(eventsData) 
        ? eventsData.filter(event => event && event.id && event.title)
        : [];
        
      setEvents(validEvents);
      
    } catch (error) {
      console.error('Error loading events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      setEvents([]);
      toast.error('Failed to load events. Please refresh the page.');
    } finally {
      setIsLoadingEvents(false);
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Load user data and events when wallet connects
  useEffect(() => {
    if (isConnected && address && mounted) {
      console.log('Wallet connected - Loading user data and events', { address, isConnected });
      loadUserData();
      loadEvents();
    } else if (!isConnected) {
      // Reset state when disconnected
      console.log('Wallet disconnected - Resetting state');
      setUser(null);
      setEvents([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isConnected, address, mounted, loadUserData, loadEvents]);

  // Debugging helper
  useEffect(() => {
    console.log('App State Debug:', {
      isConnected,
      address,
      user: user?.displayName,
      eventsCount: events.length,
      isLoading,
      error,
      mounted
    });
  }, [isConnected, address, user, events.length, isLoading, error, mounted]);

  // Event handlers with enhanced error handling
  const handleEventCreate = useCallback((): void => {
    try {
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }
      setSelectedEvent(null);
      setIsEventModalOpen(true);
    } catch (error) {
      console.error('Error opening event modal:', error);
      toast.error('Failed to open event creation modal');
    }
  }, [isConnected, address]);

  const handleEventEdit = useCallback((event: Event): void => {
    try {
      if (!event || !event.id) {
        toast.error('Invalid event data');
        return;
      }
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    } catch (error) {
      console.error('Error opening event edit modal:', error);
      toast.error('Failed to open event editor');
    }
  }, []);

  // Enhanced handleEventSave function that matches your API schema exactly
  const handleEventSave = useCallback(async (eventData: Partial<Event>): Promise<void> => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setError(null);
      
      const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events';
      const method = selectedEvent ? 'PUT' : 'POST';
      
      // ✅ Format data to match your API schema exactly
      const apiData = {
        walletAddress: address,
        title: eventData.title?.trim() || '',
        description: eventData.description?.trim() || '',
        date: eventData.date instanceof Date ? eventData.date.toISOString() : String(eventData.date),
        time: eventData.time || '',
        type: eventData.type || 'CUSTOM',
        isPrivate: Boolean(eventData.isPrivate),
        recurrence: eventData.recurrence || '',
        tags: Array.isArray(eventData.tags) ? eventData.tags : [],
      };

      // Validate required fields
      if (!apiData.title) {
        toast.error('Event title is required');
        return;
      }

      if (!apiData.date) {
        toast.error('Event date is required');
        return;
      }
      
      console.log('Sending event data:', apiData);
      
      let response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData),
      });

      console.log('Event save response:', response.status, response.statusText);

      // If user not found, auto-create user and retry event creation
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        
        if (response.status === 404 && errorData.error === 'User not found') {
          // Try to create the user, then retry event creation
          console.log('User not found, creating user and retrying event creation...');
          const createUserRes = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          if (!createUserRes.ok) {
            const createUserErr = await createUserRes.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(createUserErr.error || 'Failed to auto-create user');
          }
          // Retry event creation
          response = await fetch(url, {
            method,
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(apiData),
          });
          if (!response.ok) {
            const retryError = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(retryError.error || `HTTP ${response.status}: Failed to save event after user creation`);
          }
        } else if (response.status === 400 && errorData.details) {
          // Handle Zod validation errors
          const validationErrors = errorData.details.map((err: any) => err.message).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to save event`);
        }
      }
      
      const savedEvent = await response.json();
      console.log('Event saved successfully:', savedEvent);
      
      await loadEvents();
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      toast.success(selectedEvent ? 'Event updated successfully!' : 'Event created successfully!');
      
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [address, isConnected, selectedEvent, loadEvents]);

  const handleEventDelete = useCallback(async (eventId: string): Promise<void> => {
    if (!eventId) {
      toast.error('Event ID is required');
      return;
    }
    
    try {
      setError(null);
      
      console.log('Deleting event:', eventId);
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      console.log('Delete event response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to delete event: ${response.status}`);
      }
      
      await loadEvents();
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [loadEvents]);

  // Navigation handlers
  const toggleTheme = useCallback((): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const navigateDate = useCallback((direction: 'prev' | 'next'): void => {
    setCurrentDate(prev => {
      if (viewMode === 'month') {
        return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      } else if (viewMode === 'week') {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
        return newDate;
      } else if (viewMode === 'day') {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + (direction === 'prev' ? -1 : 1));
        return newDate;
      }
      return prev;
    });
  }, [viewMode]);

  const goToToday = useCallback((): void => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const handleSearch = useCallback((query: string): void => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback((): void => {
    setSearchQuery('');
    setShowSearchResults(false);
  }, []);

  const handleSettingsAction = useCallback((action: string): void => {
    switch (action) {
      case 'profile':
        toast.info('Profile settings coming soon!');
        break;
      case 'notifications':
        toast.info('Notification settings coming soon!');
        break;
      case 'help':
        window.open('https://github.com/MrRogueKnight', '_blank');
        break;
      case 'theme':
        toggleTheme();
        break;
      case 'logout':
        toast.info('Disconnect your wallet to log out');
        break;
      default:
        break;
    }
  }, [toggleTheme]);

  const toggleSidebar = useCallback((): void => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Error boundary
  if (error && !isConnected) {
    return <ErrorState error={error} onRetry={() => setError(null)} />;
  }

  // MiniApp SDK error
  if (miniAppError) {
    console.warn('MiniApp SDK error:', miniAppError);
    // Continue with the app even if MiniApp SDK fails
  }

  // MiniApp SDK loading state
  if (isMiniAppLoading) {
    return <CalendarSkeleton />;
  }

  // Loading state
  if (isLoading && isConnected) {
    return <CalendarSkeleton />;
  }

  // Wallet not connected - Welcome screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
        {/* Enhanced Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex items-center mr-6">
              <Calendar className="w-8 h-8 text-blue-600 mr-3 animate-pulse" />
              <h1 className="text-xl text-gray-700 dark:text-gray-200 font-normal">
                Tydex Calendar
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600" />
                )
              ) : (
                <div className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSupportModal(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Heart className="w-4 h-4 mr-2 animate-pulse" />
              Support
            </Button>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Calendar className="w-24 h-24 text-blue-600 dark:text-blue-400" />
                  <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Welcome to Tydex
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Your Web3-powered calendar for the decentralized future. Connect your wallet to start organizing your life on-chain.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Smart Calendar
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Month, week, and day views with Google Calendar-style interface
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Web3 Native
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Wallet authentication with OnchainKit and Base integration
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Your Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Complete data ownership and privacy with decentralized storage
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Connect your Web3 wallet to access your personal calendar and start organizing your life on-chain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <WalletConnection />
                <p className="text-sm text-blue-200">
                  Compatible with MetaMask, Coinbase Wallet, and more
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                Built with ❤️ by{' '}
                <a 
                  href="https://github.com/MrRogueKnight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  @MrRogueKnight
                </a>
                {' '}for the Web3 community
              </p>
            </div>
          </div>
        </main>

        {/* Support Modal */}
        <SupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      </div>
    );
  }

  // Main Calendar Interface (Connected State)
  return (
    <div className="google-calendar-container">
      {/* Header */}
      <header className="google-calendar-header">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="sidebar-toggle mr-4 hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center mr-8">
            <Calendar className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-xl font-normal text-foreground">Tydex Calendar</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container relative flex-1 max-w-2xl mx-8">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input pr-10"
          />
          
          {searchQuery ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Search className="search-icon absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="search-results">
              {filteredEvents.length > 0 ? (
                filteredEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="search-result-item"
                    onClick={() => {
                      handleEventEdit(event);
                      clearSearch();
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.date), 'MMM d, yyyy')}
                      {event.time && ` at ${event.time}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-result-item text-muted-foreground">
                  No events found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSupportModal(true)}
            className="rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Heart className="w-5 h-5 animate-pulse" />
          </Button>

          <Button
            onClick={handleEventCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSettingsAction('profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettingsAction('notifications')}>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettingsAction('theme')}>
                {mounted ? (
                  theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )
                ) : (
                  <div className="w-4 h-4 mr-2" />
                )}
                Toggle Theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSettingsAction('help')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <WalletConnection />
        </div>
      </header>

      {/* Main Content */}
      <div className="google-calendar-main">
        {/* Sidebar */}
        <aside className={`google-calendar-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {!sidebarCollapsed && (
            <div className="p-4 space-y-6">
              {/* Create Button */}
              <Button
                onClick={handleEventCreate}
                className="create-event-btn w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>

              {/* Mini Calendar */}
              <div className="mini-calendar">
                <div className="mini-calendar-header">
                  <h3 className="mini-calendar-title">
                    {format(currentDate, 'MMMM yyyy')}
                  </h3>
                  <div className="mini-calendar-nav">
                    <button
                      onClick={() => navigateDate('prev')}
                      className="mini-calendar-nav-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateDate('next')}
                      className="mini-calendar-nav-btn"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mini-calendar-weekdays">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="mini-calendar-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="mini-calendar-grid">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div
                      key={i}
                      className={`mini-calendar-cell ${
                        i === 15 ? 'today' : ''
                      }`}
                      onClick={() => setSelectedDate(new Date())}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    My Calendars
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span>{user.displayName || 'My Calendar'}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {events.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Events</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-medium">
                      {events.filter(event => {
                        const eventDate = new Date(event.date);
                        const now = new Date();
                        return eventDate.getMonth() === now.getMonth() &&
                               eventDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Calendar Content */}
        <div className="google-calendar-content">
          {/* Toolbar */}
          <div className="google-calendar-toolbar">
            <div className="flex items-center space-x-4">
              <Button
                onClick={goToToday}
                variant="outline"
                className="font-medium"
              >
                Today
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <h2 className="text-xl font-medium">
                {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 
                                  viewMode === 'week' ? "'Week of' MMM d, yyyy" : 
                                  'EEEE, MMMM d, yyyy')}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="google-calendar-view">
            <GoogleCalendarView
              events={events}
              selectedDate={selectedDate}
              currentDate={currentDate}
              viewMode={viewMode}
              onDateSelect={setSelectedDate}
              onEventSelect={handleEventEdit}
              onEventCreate={handleEventCreate}
              isLoading={isLoadingEvents}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        event={selectedEvent}
        selectedDate={selectedDate}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Loading Overlay */}
      {(isLoadingEvents || isLoadingUser) && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm font-medium">
                {isLoadingUser ? 'Loading profile...' : 'Loading events...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <button
          onClick={handleEventCreate}
          className="fab fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center z-40"
          aria-label="Create new event"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="mobile-view-toggle fixed bottom-4 left-4 z-40">
          <div className="flex bg-background border border-border rounded-lg shadow-lg p-1">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
                  ${viewMode === mode 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MiniApp Status (Development Only) */}
      <MiniAppStatus />
    </div>
  );
}