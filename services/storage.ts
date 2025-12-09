
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
        // We use mode: 'no-cors' because Google Apps Script doesn't standardly return CORS headers 
        // for simple Web Apps. The data WILL reach the sheet, but the browser sees an "opaque" response.
        // To ensure data integrity, we send Content-Type text/plain so no preflight OPTION is needed.
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

// --- VOTING LOGIC (HYBRID: SUPABASE + LOCAL + GOOGLE SHEET) ---

export const saveVote = async (user: User) => {
  // 1. Always save to LocalStorage (for UI state)
  const currentData = getLocalVotes();
  if (!currentData.find(u => u.email === user.email)) {
      const newData = [...currentData, user];
      try {
        localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {
        console.warn("LocalStorage save vote failed", e);
      }
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

  // 3. NEW: If Google Sheet URL is configured, send data there
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
  
  try {
      const savedMetadata = localStorage.getItem(SONG_METADATA_KEY);
      if (savedMetadata) {
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
      }
  } catch (e) {
      console.error("Failed to parse song metadata", e);
  }
  return DEFAULT_SONGS;
};

export const updateSong = (id: number, updates: Partial<Song>) => {
  const currentSongs = getSongs();
  const updatedSongs = currentSongs.map(s => 
    s.id === id ? { ...s, ...updates } : s
  );
  try {
    localStorage.setItem(SONG_METADATA_KEY, JSON.stringify(updatedSongs));
  } catch (e) {
    alert("Storage full or disabled.");
  }
  return updatedSongs;
};

// Robust YouTube ID extractor that works anywhere in a string
export const extractYouTubeId = (text: string): string | null => {
    if (!text) return null;
    // Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    // ID is usually 11 chars (alphanumeric + - _)
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = text.match(regExp);
    return match ? match[1] : null;
};

// Helper to clean up titles from batch uploaders (TunesToTube, etc)
const cleanTitleText = (rawTitle: string): string => {
    let clean = rawTitle;
    
    // 1. Remove "TunesToTube" artifacts
    clean = clean.replace(/\(Uploaded by TunesToTube\)/gi, '');
    clean = clean.replace(/TunesToTube/gi, '');
    
    // 2. Remove File Extensions
    clean = clean.replace(/\.mp3$/i, '').replace(/\.wav$/i, '').replace(/\.m4a$/i, '');
    
    // 3. Remove common suffixes
    clean = clean.replace(/\(Official Audio\)/gi, '');
    clean = clean.replace(/\[Official Audio\]/gi, '');
    clean = clean.replace(/\(Demo\)/gi, '');
    
    // 4. Remove leading numbering (e.g. "01. Song" or "1 - Song" or "1| Song")
    clean = clean.replace(/^\d+\s*[-.|]\s*/, '');
    
    return clean.trim();
};

export const updateSongsBulk = (lines: string[]) => {
  const currentSongs = getSongs();
  
  // Clean lines: remove empty lines
  const cleanLines = lines.filter(l => l.trim().length > 0);

  const updatedSongs = currentSongs.map((s, index) => {
      // If we have no more lines, return original song
      if (index >= cleanLines.length) return s;

      const line = cleanLines[index].trim();
      let newTitle = s.title;
      let newYoutubeId = s.youtubeId;
      let newCustomAudioUrl = s.customAudioUrl;

      // 1. Try to extract YouTube ID from the line
      const ytId = extractYouTubeId(line);
      
      if (ytId) {
          newYoutubeId = ytId;
          newCustomAudioUrl = ''; // Clear audio URL to prefer YouTube
          
          // 2. Extract Title if mixed (e.g., "My Song https://youtu.be/...")
          // Remove the URL part to see if there is a title left
          const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
          let textWithoutUrl = line.replace(urlRegex, '').trim();

          // Cleanup leftovers like () or [] if the URL was inside them
          textWithoutUrl = textWithoutUrl.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').trim();
          
          // Remove common "separators" people might type (e.g. "Song - ", "Song | ")
          const cleanRawTitle = textWithoutUrl.replace(/^[-|]\s+/, '').replace(/\s+[-|]$/, '').trim();

          if (cleanRawTitle.length > 1) {
              newTitle = cleanTitleText(cleanRawTitle);
          }
      } else if (line.startsWith('http')) {
          // It's a non-YouTube URL
          newCustomAudioUrl = line;
      } else {
          // It's just a title
          newTitle = cleanTitleText(line);
      }

      return {
          ...s,
          title: newTitle,
          youtubeId: newYoutubeId,
          customAudioUrl: newCustomAudioUrl
      };
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
