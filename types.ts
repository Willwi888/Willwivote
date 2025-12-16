
export interface Song {
  id: number;
  title: string;
  driveId: string; // Keep for fallback or MP3s
  youtubeId?: string; // NEW: YouTube Video ID
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
  voteReasons?: { [songId: number]: string }; // Map song ID to reason string
}

export enum AppStep {
  // Artist Site Steps
  ARTIST_HOME = 'ARTIST_HOME',
  
  // Voting App Steps
  MEMBER_LOGIN = 'MEMBER_LOGIN', // NEW STEP
  INTRO = 'INTRO',
  AUTH = 'AUTH',
  VOTING = 'VOTING',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN',
}

export type Language = 'zh' | 'en' | 'jp';

export const MAX_VOTES = 10;

export interface SocialLink {
    platform: string;
    url: string;
    icon?: string; // Label for icon mapping
}