export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

export const APP_NAME = 'Tydex - Your Web3 Calendar';
export const APP_DESCRIPTION = 'A decentralized calendar app for Web3 users';

export const EVENT_TYPES = {
  BIRTHDAY: 'BIRTHDAY',
  MEETING: 'MEETING',
  REMINDER: 'REMINDER',
  CUSTOM: 'CUSTOM'
} as const;

export const DEFAULT_EVENT_COLORS = {
  BIRTHDAY: '#FF6B6B',
  MEETING: '#4ECDC4',
  REMINDER: '#45B7D1',
  CUSTOM: '#96CEB4'
} as const;

export const API_ENDPOINTS = {
  EVENTS: '/api/events',
  USER_PROFILE: '/api/user/profile',
  FARCASTER_CONNECT: '/api/farcaster/connect',
  USER_EXPORT: '/api/user/export',
  USER_IMPORT: '/api/user/import'
} as const;