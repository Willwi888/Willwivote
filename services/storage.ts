
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
  // NEW: Homepage Featured Song Config
  homepageSongTitle?: string;
  homepageSongUrl?: string;
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
    if (!text || typeof text !== 'string') return null;
    
    // 1. Direct 11 char ID check
    const rawMatch = text.trim().match(/^([a-zA-Z0-9_-]{11})$/);
    if (rawMatch) return rawMatch[1];

    // 2. Comprehensive URL regex
    // Covers:
    // - youtube.com/watch?v=
    // - m.youtube.com/watch?v=
    // - music.youtube.com/watch?v=
    // - youtu.be/
    // - youtube.com/shorts/
    // - youtube.com/embed/
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|live\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = text.match(regExp);
    
    if (match && match[1].length === 11) {
        return match[1];
    }
    
    // 3. Fallback for dirty URLs
    if (text.includes('youtube') || text.includes('youtu.be')) {
        const vParam = text.split('v=')[1];
        if (vParam) {
            const id = vParam.split('&')[0].split('#')[0];
            if (id && id.length === 11) return id;
        }
    }

    return null;
};

// --- VOTING LOGIC ---
export const saveVote = async (user: User) => {
  const currentData = getLocalVotes();
  // Prevent duplicate local save
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
          console.error("Supabase Error (Vote might be saved locally only)", e);
      }
  }
};

// NEW: Auto-Sync Function (For recovering votes when DB was down)
export const syncOfflineVotes = async () => {
    if (!supabase) return;

    // Try to sync the current user's session if they voted
    const session = getUserSession();
    if (session && session.votes.length > 0) {
        try {
            // Check if this vote already exists
             const { data: existing } = await supabase
                .from('votes')
                .select('id')
                .eq('user_email', session.email)
                .limit(1);
            
            if (!existing || existing.length === 0) {
                 await supabase.from('votes').insert([{ 
                    user_name: session.name, 
                    user_email: session.email, 
                    vote_ids: session.votes, 
                    vote_reasons: session.voteReasons,
                    created_at: session.timestamp || new Date().toISOString()
                }]);
                console.log("Synced offline vote for", session.email);
            }
        } catch (e) {
            // Silently fail if table still missing
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
    // Filter out ID 0 from defaults if it exists
    merged = merged.filter(s => s.id !== 0);
    
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

// Fetch Remote Songs now returns { songs, config }
export const fetchRemoteSongs = async (): Promise<{ songs: Song[], config?: Partial<GlobalConfig> } | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error || !data) return null;
        
        // Check for Config Row (ID 0)
        const configRow = data.find((r: any) => Number(r.id) === 0);
        let remoteConfig: Partial<GlobalConfig> | undefined = undefined;
        
        if (configRow) {
            remoteConfig = {
                homepageSongTitle: configRow.title,
                homepageSongUrl: configRow.youtube_id || configRow.custom_audio_url,
                introAudioUrl: configRow.custom_image_url 
            };
        }

        // Standard Songs
        const remoteSongs: Song[] = data
            .filter((r: any) => Number(r.id) !== 0)
            .map((row: any) => ({
                id: Number(row.id),
                title: row.title,
                driveId: '', 
                youtubeId: row.youtube_id,
                customAudioUrl: row.custom_audio_url,
                customImageUrl: row.custom_image_url,
                lyrics: row.lyrics,
                credits: row.credits
            }));
            
        // Merge with local overrides to ensure we have 40 slots if DB has fewer
        const merged = mergeSongs(remoteSongs);
        return { songs: merged, config: remoteConfig };
    } catch (e) {
        return null;
    }
};

export const publishSongsToCloud = async (songs: Song[], config: GlobalConfig) => {
    if (!supabase) return;
    
    // 1. Prepare Songs Data
    const songsData = songs.map(s => ({
        id: s.id,
        title: s.title,
        youtube_id: s.youtubeId || null,
        custom_audio_url: s.customAudioUrl || null,
        custom_image_url: s.customImageUrl || null,
        lyrics: s.lyrics || null,
        credits: s.credits || null,
        updated_at: new Date().toISOString()
    }));

    // 2. Prepare Config Data (Stored as ID 0)
    const configData = {
        id: 0,
        title: config.homepageSongTitle || 'Homepage Featured',
        youtube_id: config.homepageSongUrl || null, // Storing URL in youtube_id column for convenience
        custom_image_url: config.introAudioUrl || null,
        updated_at: new Date().toISOString()
    };

    // 3. Upsert All
    const { error } = await supabase.from('songs').upsert([configData, ...songsData]);
    if (error) throw error;
};

// INTELLIGENT UPDATE: EXTRACT YOUTUBE ID AUTOMATICALLY
export const updateSong = (id: number, updates: Partial<Song>) => {
    const current = getSongs();
    
    // Check if we are updating the audio URL
    if (updates.customAudioUrl) {
        const yId = extractYouTubeId(updates.customAudioUrl);
        if (yId) {
            updates.youtubeId = yId; // Force the YouTube ID to update
        } else {
            // If user explicitly clears it or changes to non-youtube, we might want to clear youtubeId
            // But let's be safe: if input doesn't look like YouTube, we assume it's a file.
            // However, to fix the "Stuck on default" bug, we must ensure new data takes precedence.
            if (updates.customAudioUrl === '') {
                 updates.youtubeId = '';
            }
        }
    }

    const updated = current.map(s => s.id === id ? { ...s, ...updates } : s);
    saveLocalMetadata(updated);
    return updated;
};

export const updateSongsBulk = (lines: string[]) => {
    const current = getSongs();
    const updated = current.map((s, i) => {
        if (i < lines.length) {
            const line = lines[i].trim();
            const yId = extractYouTubeId(line);
            if (yId) return { ...s, youtubeId: yId, customAudioUrl: '' }; // Prefer ID
            if (line.startsWith('http')) return { ...s, customAudioUrl: line, youtubeId: '' };
        }
        return s;
    });
    saveLocalMetadata(updated);
    return updated;
};

const saveLocalMetadata = (songs: Song[]) => {
    // Only save what's different from master/default to save space, or just save all fields that are editable
    const metadata = songs.map(s => ({
        id: s.id,
        title: s.title,
        youtubeId: s.youtubeId,
        customAudioUrl: s.customAudioUrl,
        customImageUrl: s.customImageUrl,
        lyrics: s.lyrics,
        credits: s.credits
    }));
    localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(metadata));
};

export const restoreFromBackup = (songs: Song[]) => {
    saveLocalMetadata(songs);
};
