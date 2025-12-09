
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

// The shape of our Audio Context
interface AudioContextType {
  playingId: number | string | null; // Can be a Song ID (number) or 'intro' (string)
  isLoading: boolean;
  isPlaying: boolean;
  error: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  playSong: (id: number | string, url: string, title?: string) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  initializeAudio: () => void; // New method for mobile unlocking
  currentTitle: string;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // State
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');

  // --- STALL RECOVERY MONITOR ---
  // This effect watches the audio. If it's supposed to be playing but time isn't moving
  // for too long (e.g. stalled on network), it tries to nudge it.
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    let lastTime = audioRef.current.currentTime;
    let stuckCount = 0;

    const checkInterval = setInterval(() => {
       const audio = audioRef.current;
       if (!audio) return;

       // If we are supposed to be playing, but we are buffering (readyState < 3)
       // or simply not moving forward.
       if (Math.abs(audio.currentTime - lastTime) < 0.1) {
           stuckCount++;
           // If stuck for 2 seconds (4 checks)
           if (stuckCount > 4) {
               console.debug("Audio appears stuck, attempting nudge...");
               // Nudge strategy 1: Pause and Play
               if (audio.paused === false) {
                   audio.pause();
                   setTimeout(() => audio.play().catch(e => console.warn("Nudge failed", e)), 100);
               }
               stuckCount = 0; // Reset
           }
       } else {
           stuckCount = 0;
           lastTime = audio.currentTime;
           setIsLoading(false); // We are moving, so we aren't loading
       }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isPlaying]);

  // Safety Timeout for Loading State
  useEffect(() => {
    let loadTimeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
        loadTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn("Audio loading timed out - forcing state reset");
                setIsLoading(false);
                // Do not set error true immediately, let the user try again
            }
        }, 15000);
    }
    return () => clearTimeout(loadTimeout);
  }, [isLoading]);

  useEffect(() => {
    // Create the single global audio instance
    const audio = new Audio();
    
    // IMPORTANT: No crossOrigin for max compatibility with Dropbox/Drive
    audio.removeAttribute('crossorigin');
    
    audio.preload = "auto"; 
    // Important for iOS:
    // @ts-ignore
    audio.playsInline = true; 
    
    audioRef.current = audio;

    // Event Listeners
    const handleCanPlay = () => {
        setIsLoading(false);
        if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setError(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
        setIsPlaying(false);
        setPlayingId(null);
    };
    const handleError = (e: Event) => {
        const err = audio.error;
        // Ignore empty src errors or aborts
        if (!audio.src || audio.src === window.location.href || audio.src === '') return;
        if (err && err.code === 20) return; // Abort error is normal

        const details = err ? `Code: ${err.code}, Message: ${err.message}` : "Unknown Error";
        console.warn(`Audio Playback Error [${audio.src}]: ${details}`);
        
        setIsLoading(false);
        setError(true);
        setIsPlaying(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setError(false);
    };
    
    // "stalled" event happens when data stops coming
    const handleStalled = () => {
        if (isPlaying) setIsLoading(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.paused && audio.currentTime > 0 && playingId) return;

      const SILENT_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQQAAAAAAA==';
      
      if (!playingId) {
          audio.src = SILENT_AUDIO;
          audio.load();
          audio.play().catch(e => console.debug("Silent unlock prevented", e));
      }
  };

  const playSong = async (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset error state if switching songs
    if (playingId !== id) setError(false);
    
    setCurrentTitle(title);

    // --- RESUME LOGIC ---
    if (playingId === id) {
      if (isPlaying) {
        audio.pause();
        return;
      } else {
        setIsPlaying(true);
        if (audio.src && audio.src !== window.location.href) {
            audio.play().catch(e => {
                console.warn("Resume failed, reloading...", e);
                loadAndPlay(id, url, audio);
            });
        } else {
            loadAndPlay(id, url, audio);
        }
        return;
      }
    } 

    // --- NEW SONG LOGIC ---
    loadAndPlay(id, url, audio);
  };

  // Helper function to handle the "Hard Reset" and Load sequence
  const loadAndPlay = (id: number | string, url: string, audio: HTMLAudioElement) => {
    setIsLoading(true);
    setPlayingId(id);
    setIsPlaying(true);
    setError(false);

    try {
        // 1. HARD STOP & RESET
        audio.pause();
        audio.currentTime = 0;

        // 2. SET SOURCE
        audio.src = url;
        audio.preload = "auto";
        
        // 3. LOAD & PLAY
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name === 'AbortError') {
                    // Ignore aborts
                } else {
                    console.error("Play request failed:", error);
                    setIsPlaying(false);
                    setError(true);
                    setIsLoading(false);
                }
            });
        }
    } catch (e) {
        console.error("Sync playback error", e);
        setIsPlaying(false);
        setError(true);
        setIsLoading(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resume = async () => {
    if (!audioRef.current) return;
    try {
        await audioRef.current.play();
    } catch (e) {
        console.error("Resume failed", e);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
        if (!isFinite(time)) return;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const setVolume = (vol: number) => {
      if (audioRef.current) {
          audioRef.current.volume = vol;
          setVolumeState(vol);
      }
  };

  return (
    <AudioContext.Provider value={{
      playingId,
      isLoading,
      isPlaying,
      error,
      duration,
      currentTime,
      volume,
      playSong,
      pause,
      resume,
      seek,
      setVolume,
      initializeAudio,
      currentTitle
    }}>
      {children}
    </AudioContext.Provider>
  );
};
