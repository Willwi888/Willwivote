export interface Song {
  id: number;
  title: string;
  driveId: string;
  duration?: string;
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
  ADMIN = 'ADMIN', // New step for backend view
}

export const MAX_VOTES = 10;