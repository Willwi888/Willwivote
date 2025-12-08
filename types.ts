
export interface Song {
  id: number;
  title: string;
  driveId: string; // Keep for fallback
  customAudioUrl?: string; // Allow admin to override
  customImageUrl?: string; // Allow admin to override
  lyrics?: string;
  credits?: string;
}

export interface User {
  name: string;
  email: string;
  timestamp: string;
  votes: number[]; // Array of Song IDs
}

export enum AppStep {
  INTRO = 'INTRO',
  AUTH = 'AUTH',
  VOTING = 'VOTING',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN',
}

export type Language = 'zh' | 'en' | 'jp';

export const MAX_VOTES = 10;
