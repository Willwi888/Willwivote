
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

  // Safety Timeout for Loading State
  // If loading takes too long (e.g. 15s), we stop the spinner so the UI doesn't look broken.
  useEffect(() => {
    let loadTimeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
        loadTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn("Audio loading timed out - forcing state reset");
                setIsLoading(false);
                setError(true); 
            }
        }, 15000);
    }
    return () => clearTimeout(loadTimeout);
  }, [isLoading]);

  useEffect(() => {
    // Create the single global audio instance
    const audio = new Audio();
    
    // IMPORTANT: Do NOT set crossOrigin="anonymous" for Google Drive links.
    audio.removeAttribute('crossorigin');
    
    audio.preload = "none"; 
    // Important for iOS:
    // @ts-ignore
    audio.playsInline = true; 
    
    audioRef.current = audio;

    // Event Listeners
    const handleCanPlay = () => {
        setIsLoading(false);
        // Sometimes duration isn't available until now
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
        // Don't log error if it was just an empty src clear or intentional stop
        if (!audio.src || audio.src === window.location.href || audio.src === '') return;
        // Ignore AbortError (code 20) which happens on rapid song switching
        if (err && err.code === 20) return; 

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
  }, []);

  // New function to "unlock" audio on mobile
  // We play a silent buffer completely to ensure the audio context is active
  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;

      // If audio is already playing something real, don't interrupt
      if (!audio.paused && audio.currentTime > 0 && playingId) return;

      const SILENT_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQQAAAAAAA==';
      
      // We only play silent if we aren't currently playing a song
      if (!playingId) {
          audio.src = SILENT_AUDIO;
          audio.load();
          audio.play().catch(e => {
              console.debug("Silent unlock prevented (likely no user gesture yet)", e);
          });
      }
  };

  const playSong = async (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId !== id) {
        setError(false);
    }
    setCurrentTitle(title);

    // --- RESUME / PAUSE LOGIC ---
    if (playingId === id) {
      if (isPlaying) {
        audio.pause();
        // setIsPlaying(false) handled by event listener
        return;
      } 
      
      // User wants to RESUME
      setIsPlaying(true); 
      try {
          if (!audio.src || audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
             throw new Error("Audio element needs reload");
          }
          await audio.play();
      } catch (e) {
          console.warn("Resume failed, attempting to reload source...", e);
          // Fallback: Reload the source
          try {
              setIsLoading(true);
              audio.src = url;
              audio.preload = "auto";
              audio.load();
              const p = audio.play();
              if (p !== undefined) {
                  p.catch(err => {
                      console.error("Retry playback failed", err);
                      setIsPlaying(false);
                      setError(true);
                  });
              }
          } catch (retryErr) {
               console.error("Retry fatal error", retryErr);
          }
      }
      return;
    } 

    // --- NEW SONG LOGIC ---
    setIsLoading(true);
    setPlayingId(id);
    setIsPlaying(true);
    setError(false);
    
    // We do NOT use await here for audio.play().
    // Using await can cause the UI to "hang" if the promise never resolves (e.g. network stall).
    // We let the event listeners (playing, error) handle the UI state updates.
    try {
        audio.src = url;
        audio.preload = "auto"; 
        audio.load();
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // AbortError is normal when skipping songs quickly
                if (error.name === 'AbortError') {
                    console.debug("Playback aborted");
                } else {
                    console.error("Play request failed:", error);
                    setIsPlaying(false);
                    setError(true);
                    setIsLoading(false);
                }
            });
        }
    } catch (e) {
        console.error("Synchronous playback error", e);
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
