
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
  const [currentSrc, setCurrentSrc] = useState<string>(''); // Keep track of current URL
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');

  // --- STALL RECOVERY MONITOR ---
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    let lastTime = audioRef.current.currentTime;
    let stuckCount = 0;

    const checkInterval = setInterval(() => {
       const audio = audioRef.current;
       if (!audio) return;

       if (Math.abs(audio.currentTime - lastTime) < 0.1 && audio.readyState < 3) {
           stuckCount++;
           if (stuckCount > 6) { // 3 seconds stuck
               console.debug("Audio buffering slow...");
               stuckCount = 0;
           }
       } else {
           stuckCount = 0;
           lastTime = audio.currentTime;
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
                console.warn("Audio loading timed out.");
                setIsLoading(false);
            }
        }, 15000);
    }
    return () => clearTimeout(loadTimeout);
  }, [isLoading]);

  useEffect(() => {
    try {
        const audio = new Audio();
        // IMPORTANT: Set preload to NONE for mobile to avoid 403s on speculative loading
        audio.preload = "none";
        audioRef.current = audio;

        // Event Listeners
        const handleCanPlay = () => {
            setIsLoading(false);
            setError(false);
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
            setCurrentSrc('');
        };
        const handleError = (e: Event) => {
            const err = audio.error;
            // Ignore if src is empty or matches current location (reset state)
            if (!audio.src || audio.src === window.location.href || audio.src === '') return;
            if (err && err.code === 20) return; // Abort error

            console.warn(`Audio Playback Warning: ${err ? err.message : 'Unknown error'}`);
            setIsLoading(false);
            setError(true);
            setIsPlaying(false);
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(false);
        };
        
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
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
          audio.removeEventListener('playing', handlePlaying);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    } catch (e) {
        console.error("Critical Audio Initialization Error:", e);
    }
  }, []);

  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
          // Play a very short silent buffer to unlock the audio context on iOS/Android
          const SILENT_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQQAAAAAAA==';
          // Ensure we don't interrupt active playback if called redundantly
          if (!playingId) {
             audio.src = SILENT_AUDIO;
             audio.load();
             audio.play().catch(() => {});
          }
      }
  };

  const playSong = async (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!url) {
        console.error("PlaySong: Empty URL");
        return;
    }

    if (playingId !== id || error) {
        setCurrentTitle(title);
        loadAndPlay(id, url, audio);
        return;
    }

    if (playingId === id) {
        if (isPlaying) {
            audio.pause();
        } else {
            resume();
        }
    }
  };

  const loadAndPlay = (id: number | string, url: string, audio: HTMLAudioElement) => {
    setIsLoading(true);
    setPlayingId(id);
    setCurrentSrc(url);
    setIsPlaying(true);
    setError(false);

    try {
        audio.src = url;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                if (err.name === 'AbortError') return;
                
                // Gracefully handle not supported errors (e.g. invalid Drive links)
                if (err.name === 'NotSupportedError' || err.message.includes('supported source')) {
                    console.warn(`Audio playback failed for ${url}:`, err.message);
                    setError(true);
                    setIsPlaying(false);
                    setIsLoading(false);
                    return;
                }
                
                console.error("Play failed:", err);
                // Also treat as playback error
                setError(true);
                setIsPlaying(false);
                setIsLoading(false);
            });
        }
    } catch (e) {
        console.error("Sync load error:", e);
        setError(true);
        setIsLoading(false);
        setIsPlaying(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resume = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const isValidSource = audio.src && audio.src !== window.location.href && audio.src !== '';
    
    if (!isValidSource && currentSrc && playingId) {
        loadAndPlay(playingId, currentSrc, audio);
        return;
    }

    if (isValidSource) {
        try {
            await audio.play();
            setError(false);
        } catch (e) {
            console.error("Resume play failed:", e);
            if (currentSrc && playingId) {
                loadAndPlay(playingId, currentSrc, audio);
            } else {
                setError(true);
            }
        }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current && isFinite(time)) {
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
