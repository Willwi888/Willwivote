
import { User, Song } from '../types';
import { SONGS as DEFAULT_SONGS } from '../constants';
import { supabase } from './supabaseClient';

const VOTE_STORAGE_KEY = 'beloved_2026_votes';
const SONG_METADATA_KEY = 'beloved_2026_song_metadata';
const GLOBAL_CONFIG_KEY = 'beloved_2026_global_config';

// --- GLOBAL CONFIG (Intro Song & Google Sheet) ---
export interface GlobalConfig {
  introAudioUrl: string;
  googleSheetUrl?: string; // New field for GAS URL
}

export const getGlobalConfig = (): GlobalConfig => {
  if (typeof window === 'undefined') return { introAudioUrl: '' };
  try {
    const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
    return data ? JSON.parse(data) : { introAudioUrl: '' };
  } catch (e) {
    console.warn("LocalStorage access failed (possibly incognito mode)", e);
    return { introAudioUrl: '' };
  }
};

export const saveGlobalConfig = (config: GlobalConfig) => {
  try {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("LocalStorage save failed", e);
  }
};

// --- GOOGLE SHEET INTEGRATION ---
const submitToGoogleSheet = async (user: User, scriptUrl: string) => {
    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(user)
        });
        console.log("Sent to Google Sheet");
    } catch (e) {
        console.error("Google Sheet Sync Error:", e);
    }
};

// --- VOTING LOGIC ---

export const saveVote = async (user: User) => {
  const currentData = getLocalVotes();
  if (!currentData.find(u => u.email === user.email)) {
      const newData = [...currentData, user];
      try {
        localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {}
  }

  if (supabase) {
      try {
          await supabase.from('votes').insert([{ 
              user_name: user.name, 
              user_email: user.email, 
              vote_ids: user.votes,
              vote_reasons: user.voteReasons, 
              created_at: new Date().toISOString()
          }]);
      } catch (e) {
          console.error("Supabase Error", e);
      }
  }

  const config = getGlobalConfig();
  if (config.googleSheetUrl && config.googleSheetUrl.startsWith('https://script.google.com/')) {
      submitToGoogleSheet(user, config.googleSheetUrl);
  }
};

const getLocalVotes = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(VOTE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getVotes = async (): Promise<User[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
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
      if (tally[songId] !== undefined) tally[songId]++;
    });
  });
  return Object.entries(tally)
    .map(([id, count]) => ({ song: songs.find(s => s.id === parseInt(id)), count }))
    .sort((a, b) => b.count - a.count);
};

// --- SONG MANAGEMENT LOGIC ---

export const getSongs = (): Song[] => {
  if (typeof window === 'undefined') return DEFAULT_SONGS;
  try {
      const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
      if (savedMetadata) {
        const parsed = JSON.parse(savedMetadata);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return DEFAULT_SONGS.map(defaultSong => {
                const saved = parsed.find((p: Song) => p.id === defaultSong.id);
                return saved ? { ...defaultSong, ...saved } : defaultSong;
            });
        }
      }
  } catch (e) {}
  return DEFAULT_SONGS;
};

// ROBUST YOUTUBE EXTRACTION
// Supports standard, short, embed, and mobile URLs
export const extractYouTubeId = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};

export const updateSong = (id: number, updates: Partial<Song>) => {
  const currentSongs = getSongs();
  let finalUpdates = { ...updates };
  
  // Auto-extract ID if URL provided
  if (updates.customAudioUrl && !updates.youtubeId) {
      const extractedId = extractYouTubeId(updates.customAudioUrl);
      if (extractedId) finalUpdates.youtubeId = extractedId;
  }

  const updatedSongs = currentSongs.map(s => s.id === id ? { ...s, ...finalUpdates } : s);
  try {
    localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  } catch (e) {}
  return updatedSongs;
};

const cleanTitleText = (rawTitle: string): string => {
    return rawTitle
        .replace(/\(Uploaded by TunesToTube\)/gi, '')
        .replace(/TunesToTube/gi, '')
        .replace(/\.(mp3|wav|m4a)$/i, '')
        .replace(/[\(\[]Official Audio[\)\]]/gi, '')
        .replace(/[\(\[]Demo[\)\]]/gi, '')
        .replace(/^\d+\s*[-.|]\s*/, '')
        .trim();
};

export const updateSongsBulk = (lines: string[]) => {
  const currentSongs = getSongs();
  const cleanLines = lines.filter(l => l.trim().length > 0);

  const updatedSongs = currentSongs.map((s, index) => {
      if (index >= cleanLines.length) return s;
      const line = cleanLines[index].trim();
      let newTitle = s.title;
      let newYoutubeId = s.youtubeId;
      let newCustomAudioUrl = s.customAudioUrl;

      const ytId = extractYouTubeId(line);
      if (ytId) {
          newYoutubeId = ytId;
          newCustomAudioUrl = ''; 
          // Extract title logic
          const textWithoutUrl = line.replace(/https?:\/\/\S+/g, '').trim();
          const cleanRawTitle = textWithoutUrl.replace(/^[-|]\s+/, '').replace(/\s+[-|]$/, '').trim();
          if (cleanRawTitle.length > 1) newTitle = cleanTitleText(cleanRawTitle);
      } else if (line.startsWith('http')) {
          newCustomAudioUrl = line;
      } else {
          newTitle = cleanTitleText(line);
      }
      return { ...s, title: newTitle, youtubeId: newYoutubeId, customAudioUrl: newCustomAudioUrl };
  });

  try {
    localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  } catch(e) {}
  return updatedSongs;
};

export const restoreFromBackup = (songs: Song[]) => {
    try {
        localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(songs));
    } catch(e) {}
};

export const resetSongTitles = () => {
    localStorage.removeItem(SONG_METADATA_KEY);
    return DEFAULT_SONGS;
}
