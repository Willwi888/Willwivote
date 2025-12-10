
import { User, Song } from '../types';
import { SONGS as DEFAULT_SONGS, MASTER_SONG_DATA } from '../constants';
import { supabase } from './supabaseClient';

const VOTE_STORAGE_KEY = 'beloved_2026_votes';
const SONG_METADATA_KEY = 'beloved_2026_song_metadata';
const GLOBAL_CONFIG_KEY = 'beloved_2026_global_config';
const USER_SESSION_KEY = 'beloved_2026_user_session';

export interface GlobalConfig {
  introAudioUrl: string;
  googleSheetUrl?: string;
}

// --- GLOBAL CONFIG ---
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
  try {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
};

// --- SESSION MANAGEMENT ---
export const saveUserSession = (user: User) => {
    try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } catch (e) {}
};

export const getUserSession = (): User | null => {
    try {
        const data = localStorage.getItem(USER_SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

export const clearUserSession = () => {
    localStorage.removeItem(USER_SESSION_KEY);
};

// --- YOUTUBE HELPER (ROBUST) ---
export const extractYouTubeId = (text: string): string | null => {
    if (!text) return null;
    // Enhanced Regex to capture:
    // - youtube.com/watch?v=ID
    // - youtu.be/ID
    // - youtube.com/embed/ID
    // - youtube.com/shorts/ID
    // - youtube.com/live/ID
    const urlMatch = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (urlMatch) return urlMatch[1];
    
    // Captures raw ID if user just pastes the 11 chars
    const rawMatch = text.trim().match(/^([a-zA-Z0-9_-]{11})$/);
    if (rawMatch) return rawMatch[1];
    
    return null;
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

// --- SONG MANAGEMENT ---

const mergeSongs = (metadata: Song[]): Song[] => {
    let merged = [...DEFAULT_SONGS];
    merged = merged.map(s => {
        const master = MASTER_SONG_DATA[s.id];
        return master ? { ...s, ...master } : s;
    });
    if (metadata && metadata.length > 0) {
        merged = merged.map(current => {
            const update = metadata.find(m => m.id === current.id);
            if (update) {
                return {
                    ...current,
                    title: update.title || current.title,
                    youtubeId: update.youtubeId || current.youtubeId,
                    customAudioUrl: update.customAudioUrl || current.customAudioUrl,
                    customImageUrl: update.customImageUrl || current.customImageUrl,
                    lyrics: update.lyrics || current.lyrics,
                    credits: update.credits || current.credits,
                };
            }
            return current;
        });
    }
    return merged;
};

export const getSongs = (): Song[] => {
  if (typeof window === 'undefined') return DEFAULT_SONGS;
  try {
      const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
      if (savedMetadata) {
        const parsed = JSON.parse(savedMetadata);
        return mergeSongs(parsed);
      }
  } catch (e) {}
  return mergeSongs([]);
};

export const fetchRemoteSongs = async (): Promise<Song[] | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error || !data) return null;
        
        const remoteSongs: Song[] = data.map((row: any) => ({
            id: Number(row.id),
            title: row.title,
            driveId: '', 
            youtubeId: row.youtube_id,
            customAudioUrl: row.custom_audio_url,
            customImageUrl: row.custom_image_url,
            lyrics: row.lyrics,
            credits: row.credits
        }));
        
        return mergeSongs(remoteSongs);
    } catch (e) {
        console.error("Fetch remote songs failed", e);
        return null;
    }
};

export const publishSongsToCloud = async (songs: Song[]) => {
    if (!supabase) throw new Error("Supabase not configured");
    const rows = songs.map(s => ({
        id: s.id,
        title: s.title,
        youtube_id: s.youtubeId || null,
        custom_audio_url: s.customAudioUrl || null,
        custom_image_url: s.customImageUrl || null,
        lyrics: s.lyrics || null,
        credits: s.credits || null,
        updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('songs').upsert(rows);
    if (error) throw error;
};

export const updateSong = (id: number, updates: Partial<Song>) => {
  const currentSongs = getSongs();
  let finalUpdates = { ...updates };
  
  // Auto-extract YouTube ID if user pastes link into customAudioUrl
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

export const updateSongsBulk = (lines: string[]) => {
  const currentSongs = getSongs();
  const cleanLines = lines.filter(l => l.trim().length > 0);
  
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

  const updatedSongs = currentSongs.map((s, index) => {
      if (index >= cleanLines.length) return s;
      const line = cleanLines[index].trim();
      let newTitle = s.title;
      let newYoutubeId = s.youtubeId;
      let newCustomAudioUrl = s.customAudioUrl;

      const ytId = extractYouTubeId(line);
      if (ytId) {
          newYoutubeId = ytId;
          newCustomAudioUrl = ''; // Clear audio URL if YouTube is found to avoid conflict
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
