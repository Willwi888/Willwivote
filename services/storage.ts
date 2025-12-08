import { User, Song } from '../types';
import { SONGS as DEFAULT_SONGS } from '../constants';

const VOTE_STORAGE_KEY = 'beloved_2026_votes';
const SONG_METADATA_KEY = 'beloved_2026_song_metadata';

// --- VOTING LOGIC ---

export const saveVote = (user: User) => {
  const currentData = getVotes();
  // Simple deduplication check based on email could be added here
  const newData = [...currentData, user];
  localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(newData));
};

export const getVotes = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(VOTE_STORAGE_KEY);
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

// --- SONG MANAGEMENT LOGIC (CMS Simulation) ---

export const getSongs = (): Song[] => {
  if (typeof window === 'undefined') return DEFAULT_SONGS;
  
  // Try to get custom titles from local storage
  const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
  if (savedMetadata) {
    try {
      const parsed = JSON.parse(savedMetadata);
      // Merge default config (Drive IDs) with saved titles
      return DEFAULT_SONGS.map(defaultSong => {
        const saved = parsed.find((p: Song) => p.id === defaultSong.id);
        return saved ? { ...defaultSong, title: saved.title } : defaultSong;
      });
    } catch (e) {
      console.error("Failed to parse song metadata", e);
      return DEFAULT_SONGS;
    }
  }
  return DEFAULT_SONGS;
};

export const updateSongTitle = (id: number, newTitle: string) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map(s => 
    s.id === id ? { ...s, title: newTitle } : s
  );
  localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  return updatedSongs; // Return for state update
};

export const updateAllSongTitles = (titles: string[]) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map((s, index) => {
      // If we have a title for this index, use it, otherwise keep existing
      if (index < titles.length && titles[index].trim() !== "") {
          return { ...s, title: titles[index].trim() };
      }
      return s;
  });
  localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  return updatedSongs;
};

export const resetSongTitles = () => {
    localStorage.removeItem(SONG_METADATA_KEY);
    return DEFAULT_SONGS;
}