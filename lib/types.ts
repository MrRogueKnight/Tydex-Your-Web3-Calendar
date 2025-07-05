export interface User {
  id: string;
  walletAddress: string;
  displayName?: string;
  farcasterFid?: number;
  farcasterUsername?: string;
  farcasterBio?: string;
  farcasterFollowing?: number;
  farcasterFollowers?: number;
  ipfsBackupEnabled: boolean;
  autoSyncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  type: EventType;
  isPrivate: boolean;
  recurrence?: string;
  tags: string[];
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  BIRTHDAY = 'BIRTHDAY',
  MEETING = 'MEETING',
  REMINDER = 'REMINDER',
  CUSTOM = 'CUSTOM'
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: Date;
  time?: string;
  type: EventType;
  isPrivate: boolean;
  recurrence?: string;
  tags: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CalendarViewProps {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventEdit: (event: Event) => void;
  isLoading: boolean;
}

// ✅ UPDATED: GoogleCalendarViewProps with all required props
export interface GoogleCalendarViewProps {
  events: Event[];
  selectedDate: Date;
  currentDate: Date;
  viewMode: CalendarViewMode;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: Event) => void;
  onEventCreate: () => void;
  isLoading: boolean;
}

// ✅ UPDATED: EventModalProps with onDelete and selectedDate
export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  event: Event | null;
  selectedDate: Date;
}

export interface UserProfileProps {
  user: User | null;
  events: Event[];
  onUserUpdate?: (user: User) => void;
}

export interface FarcasterConnectProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

export interface EventListProps {
  events: Event[];
  onEventEdit: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserStats {
  totalEvents: number;
  eventsThisMonth: number;
  streakDays: number;
  favoriteEventType: EventType | null;
  upcomingEvents: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  isPrivate: boolean;
}

export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  farcaster: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}