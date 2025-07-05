import type { User, Event, CreateEventData, UpdateEventData, ApiResponse } from './types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // User methods
  async getOrCreateUser(walletAddress: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting/creating user:', error);
      return null;
    }
  }

  async updateUser(userData: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Event methods
  async getEvents(walletAddress: string): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get events: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async createEvent(eventData: CreateEventData, walletAddress: string): Promise<Event | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  async updateEvent(eventData: UpdateEventData): Promise<Event | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Farcaster methods
  async connectFarcaster(walletAddress: string, farcasterData: any): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/farcaster/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, farcasterData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect Farcaster: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting Farcaster:', error);
      return null;
    }
  }

  // Export/Import methods
  async exportUserData(walletAddress: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importUserData(walletAddress: string, data: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, data }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();

// Helper functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

export const parseDateTime = (dateStr: string, timeStr?: string): Date => {
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
};

export const isValidWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getEventTypeColor = (type: string): string => {
  switch (type) {
    case 'BIRTHDAY':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    case 'MEETING':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'REMINDER':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'CUSTOM':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getEventTypeIcon = (type: string): string => {
  switch (type) {
    case 'BIRTHDAY':
      return '🎂';
    case 'MEETING':
      return '📅';
    case 'REMINDER':
      return '⏰';
    case 'CUSTOM':
      return '📝';
    default:
      return '📅';
  }
};

// Random name generator for new users
export const generateRandomName = (): string => {
  const adjectives = [
    'Cosmic', 'Digital', 'Quantum', 'Stellar', 'Crypto', 'Neon', 'Phantom', 'Mystic',
    'Lunar', 'Solar', 'Galactic', 'Atomic', 'Electric', 'Magnetic', 'Kinetic', 'Dynamic',
    'Ethereal', 'Celestial', 'Infinite', 'Radiant', 'Brilliant', 'Luminous', 'Sparkling', 'Glowing',
    'Swift', 'Bold', 'Fierce', 'Brave', 'Noble', 'Wise', 'Clever', 'Skilled'
  ];
  
  const nouns = [
    'Walker', 'Rider', 'Hunter', 'Seeker', 'Wanderer', 'Explorer', 'Guardian', 'Keeper',
    'Builder', 'Maker', 'Creator', 'Dreamer', 'Thinker', 'Solver', 'Innovator', 'Pioneer',
    'Voyager', 'Traveler', 'Navigator', 'Pathfinder', 'Trailblazer', 'Adventurer', 'Explorer',
    'Sage', 'Oracle', 'Mystic', 'Wizard', 'Mage', 'Enchanter', 'Sorcerer', 'Alchemist',
    'Phoenix', 'Dragon', 'Tiger', 'Wolf', 'Eagle', 'Falcon', 'Raven', 'Hawk'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective} ${randomNoun}`;
};