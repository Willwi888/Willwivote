
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
    
    // Skip extraction if it's explicitly a Dropbox folder or file link
    if (text.includes('dropbox.com')) return null;

    const rawMatch = text.trim().match(/^([a-zA-Z0-9_-]{11})$/);
    if (rawMatch) return rawMatch[1];

    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|live\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = text.match(regExp);
    
    if (match && match[1].length === 11) {
        return match[1];
    }
    
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

export const syncOfflineVotes = async () => {
    if (!supabase) return;
    const session = getUserSession();
    if (session && session.votes.length > 0) {
        try {
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
            }
        } catch (e) {}
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

export const fetchRemoteSongs = async (): Promise<{ songs: Song[], config?: Partial<GlobalConfig> } | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error || !data) return null;
        
        const configRow = data.find((r: any) => Number(r.id) === 0);
        let remoteConfig: Partial<GlobalConfig> | undefined = undefined;
        
        if (configRow) {
            remoteConfig = {
                homepageSongTitle: configRow.title,
                homepageSongUrl: configRow.youtube_id || configRow.custom_audio_url,
                introAudioUrl: configRow.custom_image_url 
            };
        }

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
            
        const merged = mergeSongs(remoteSongs);
        return { songs: merged, config: remoteConfig };
    } catch (e) {
        return null;
    }
};

export const publishSongsToCloud = async (songs: Song[], config: GlobalConfig) => {
    if (!supabase) return;
    
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

    const configData = {
        id: 0,
        title: config.homepageSongTitle || 'Homepage Featured',
        youtube_id: config.homepageSongUrl || null,
        custom_image_url: config.introAudioUrl || null,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('songs').upsert([configData, ...songsData]);
    if (error) throw error;
};

// --- FIX: INTELLIGENT UPDATE & FORCE CLEANUP ---
export const updateSong = (id: number, updates: Partial<Song>) => {
    const current = getSongs();
    
    // Check if we are updating the audio URL
    if (updates.customAudioUrl !== undefined) {
        const url = updates.customAudioUrl.trim();
        const yId = extractYouTubeId(url);
        
        if (yId) {
            // Case A: It IS a YouTube link
            updates.youtubeId = yId; 
            updates.customAudioUrl = ''; // Clear custom URL so logic prefers YouTube ID
        } else {
            // Case B: It is NOT a YouTube link (e.g. Dropbox, MP3, or empty)
            // CRITICAL FIX: We must EXPLICITLY clear the youtubeId so the old video doesn't persist
            updates.youtubeId = ''; 
            
            // Auto-convert Dropbox File links (not folders) for better playback
            if (url.includes('dropbox.com') && !url.includes('/fo/') && !url.includes('dl=1')) {
                // Replace dl=0 with dl=1
                updates.customAudioUrl = url.replace('dl=0', 'dl=1');
                if (!updates.customAudioUrl.includes('dl=1')) {
                     // Handle cases without dl=0, append it
                     updates.customAudioUrl = updates.customAudioUrl + (updates.customAudioUrl.includes('?') ? '&dl=1' : '?dl=1');
                }
            } else {
                updates.customAudioUrl = url;
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
            if (yId) {
                return { ...s, youtubeId: yId, customAudioUrl: '' }; 
            }
            if (line.startsWith('http')) {
                // Explicitly clear youtubeId
                return { ...s, customAudioUrl: line, youtubeId: '' };
            }
        }
        return s;
    });
    saveLocalMetadata(updated);
    return updated;
};

const saveLocalMetadata = (songs: Song[]) => {
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
