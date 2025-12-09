
import { User, Song } from '../types';
import { SONGS as DEFAULT_SONGS } from '../constants';
import { supabase } from './supabaseClient';

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


// --- VOTING LOGIC (HYBRID: SUPABASE + LOCAL) ---

export const saveVote = async (user: User) => {
  // 1. Always save to LocalStorage (for UI state)
  const currentData = getLocalVotes();
  if (!currentData.find(u => u.email === user.email)) {
      const newData = [...currentData, user];
      localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(newData));
  }

  // 2. If Supabase is connected, save to Cloud Database
  if (supabase) {
      try {
          const { error } = await supabase
              .from('votes')
              .insert([
                  { 
                      user_name: user.name, 
                      user_email: user.email, 
                      vote_ids: user.votes,
                      vote_reasons: user.voteReasons, 
                      created_at: new Date().toISOString()
                  }
              ]);
          
          if (error) {
              console.error("Supabase Vote Error:", error.message);
          }
      } catch (e) {
          console.error("Supabase Connection Error", e);
      }
  }
};

const getLocalVotes = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(VOTE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getVotes = async (): Promise<User[]> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (!error && data) {
            return data.map((row: any) => ({
                name: row.user_name,
                email: row.user_email,
                timestamp: row.created_at,
                votes: row.vote_ids || [],
                voteReasons: row.vote_reasons || {}
            }));
        }
    }
    return getLocalVotes();
};

export const getLeaderboard = (songs: Song[], votes: User[]) => {
  const tally: Record<number, number> = {};
  songs.forEach(s => tally[s.id] = 0);
  votes.forEach(user => {
    user.votes.forEach(songId => {
      if (tally[songId] !== undefined) {
        tally[songId]++;
      }
    });
  });
  return Object.entries(tally)
    .map(([id, count]) => ({
      song: songs.find(s => s.id === parseInt(id)),
      count
    }))
    .sort((a, b) => b.count - a.count);
};

// --- SONG MANAGEMENT LOGIC ---

export const getSongs = (): Song[] => {
  if (typeof window === 'undefined') return DEFAULT_SONGS;
  
  const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
  if (savedMetadata) {
    try {
      const parsed = JSON.parse(savedMetadata);
      if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = DEFAULT_SONGS.map(defaultSong => {
            const saved = parsed.find((p: Song) => p.id === defaultSong.id);
            if (saved) {
                return { 
                    ...defaultSong, 
                    title: saved.title || defaultSong.title,
                    customAudioUrl: saved.customAudioUrl,
                    youtubeId: saved.youtubeId, // Retrieve YouTube ID
                    customImageUrl: saved.customImageUrl,
                    lyrics: saved.lyrics,
                    credits: saved.credits
                };
            }
            return defaultSong;
          });
          return merged;
      }
    } catch (e) {
      console.error("Failed to parse song metadata", e);
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

// Helper to extract YouTube ID from various link formats
const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const updateSongsBulk = (lines: string[]) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map((s, index) => {
      if (index < lines.length && lines[index].trim() !== "") {
          const line = lines[index].trim();
          
          // Format: Title | Link
          if (line.includes('|')) {
              const [title, url] = line.split('|').map(p => p.trim());
              const ytId = extractYouTubeId(url);
              
              if (ytId) {
                  // Found YouTube Link -> Set ID, Clear Custom Audio (to prioritize YT)
                  return { ...s, title: title || s.title, youtubeId: ytId, customAudioUrl: '' };
              } else {
                  // Regular Audio Link
                  return { ...s, title: title || s.title, customAudioUrl: url || s.customAudioUrl };
              }
          } 
          // Format: Just Link
          else if (line.startsWith('http')) {
              const ytId = extractYouTubeId(line);
              if (ytId) return { ...s, youtubeId: ytId, customAudioUrl: '' };
              return { ...s, customAudioUrl: line };
          }
          // Format: Just Title
          else {
              return { ...s, title: line };
          }
      }
      return s;
  });
  localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  return updatedSongs;
};

export const restoreFromBackup = (songs: Song[]) => {
    localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(songs));
};

export const resetSongTitles = () => {
    localStorage.removeItem(SONG_METADATA_KEY);
    return DEFAULT_SONGS;
}
