
import { User, Song } from '../types';
import { SONGS as DEFAULT_SONGS } from '../constants';

const VOTE_STORAGE_KEY = 'beloved_2026_votes';
const SONG_METADATA_KEY = 'beloved_2026_song_metadata';
const GLOBAL_CONFIG_KEY = 'beloved_2026_global_config';

// --- GLOBAL CONFIG (Intro Song) ---
export interface GlobalConfig {
  introAudioUrl: string;
}

export const getGlobalConfig = (): GlobalConfig => {
  if (typeof window === 'undefined') return { introAudioUrl: '' };
  try {
    const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
    return data ? JSON.parse(data) : { introAudioUrl: '' };
  } catch (e) {
    return { introAudioUrl: '' };
  }
};

export const saveGlobalConfig = (config: GlobalConfig) => {
  localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
};


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
  
  // Try to get custom data from local storage
  const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
  if (savedMetadata) {
    try {
      const parsed = JSON.parse(savedMetadata);
      // Merge default config with saved data
      return DEFAULT_SONGS.map(defaultSong => {
        const saved = parsed.find((p: Song) => p.id === defaultSong.id);
        if (saved) {
             return { 
                 ...defaultSong, 
                 title: saved.title || defaultSong.title,
                 customAudioUrl: saved.customAudioUrl,
                 customImageUrl: saved.customImageUrl,
                 lyrics: saved.lyrics,
                 credits: saved.credits
             };
        }
        return defaultSong;
      });
    } catch (e) {
      console.error("Failed to parse song metadata", e);
      return DEFAULT_SONGS;
    }
  }
  return DEFAULT_SONGS;
};

export const updateSong = (id: number, updates: Partial<Song>) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map(s => 
    s.id === id ? { ...s, ...updates } : s
  );
  localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  return updatedSongs;
};

export const updateAllSongTitles = (titles: string[]) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map((s, index) => {
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
