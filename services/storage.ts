import { User, Song } from '../types';

const STORAGE_KEY = 'beloved_2026_votes';

export const saveVote = (user: User) => {
  const currentData = getVotes();
  const newData = [...currentData, user];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

export const getVotes = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getLeaderboard = (songs: Song[]) => {
  const votes = getVotes();
  const tally: Record<number, number> = {};

  // Initialize
  songs.forEach(s => tally[s.id] = 0);

  // Count
  votes.forEach(user => {
    user.votes.forEach(songId => {
      if (tally[songId] !== undefined) {
        tally[songId]++;
      }
    });
  });

  // Sort
  return Object.entries(tally)
    .map(([id, count]) => ({
      song: songs.find(s => s.id === parseInt(id)),
      count
    }))
    .sort((a, b) => b.count - a.count);
};
