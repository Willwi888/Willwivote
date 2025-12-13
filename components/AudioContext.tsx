
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface AudioContextType {
  playingId: number | string | null;
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
  initializeAudio: () => void; 
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

  // 1. Initialize Audio Object ONCE
  useEffect(() => {
    const audio = new Audio();
    // CRITICAL FIX: Do NOT set crossOrigin to "anonymous" for Dropbox/Drive links.
    // Mobile Safari blocks redirects from these services if CORS is strictly requested but headers are missing.
    audio.removeAttribute('crossorigin'); 
    
    // CRITICAL FIX: Add playsinline to prevent iOS from forcing fullscreen video player
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    audio.preload = "none"; 
    audioRef.current = audio;

    // --- EVENT LISTENERS ---
    const handleEnded = () => {
        setIsPlaying(false);
        setPlayingId(null);
    };
    const handleTimeUpdate = () => {
        if (!isNaN(audio.currentTime)) setCurrentTime(audio.currentTime);
    };
    const handleError = (e: Event) => {
        const target = e.target as HTMLAudioElement;
        // Ignore empty src errors
        if (!target.src || target.src === window.location.href) return;
        
        console.error("Audio Error:", target.error, target.src);
        setIsLoading(false);
        setIsPlaying(false);
        setError(true);
    };
    const handleCanPlay = () => {
        // Only set loading to false if we are actually ready
        if (audio.readyState >= 3) {
            setIsLoading(false);
            setError(false);
        }
        if (audio.duration) setDuration(audio.duration);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setError(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    };

    // Attach
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata); // Added metadata handler
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
        // Cleanup
        audio.pause();
        audio.src = '';
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // 2. Mobile Unlock (Optional, for "Enter" button)
  const initializeAudio = () => {
      const audio = audioRef.current;
      if (audio) {
          // Subtle unlock for iOS
          audio.load();
      }
  };

  // 3. MAIN PLAY LOGIC - SYNCHRONOUS EXECUTION
  // This function assumes 'url' is a valid Audio URL (mp3/wav), NOT a YouTube link.
  const playSong = (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio) return;

    // If clicking the same song...
    if (playingId === id) {
        if (!audio.paused) {
            audio.pause();
        } else {
            const p = audio.play();
            if (p !== undefined) p.catch(e => console.error("Resume error", e));
        }
        return;
    }

    // New Song
    setPlayingId(id);
    setCurrentTitle(title);
    setIsLoading(true);
    setError(false);
    
    // Reset Playback
    audio.currentTime = 0;
    audio.src = url;
    audio.load();
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Success
                setError(false);
            })
            .catch(e => {
                console.error("Play start error:", e);
                // If AbortError (user clicked fast), ignore. Else set error.
                if (e.name !== 'AbortError') {
                    setIsLoading(false);
                    setError(true);
                }
            });
    }
  };

  const pause = () => audioRef.current?.pause();
  const resume = () => audioRef.current?.play();
  
  const seek = (time: number) => {
    if (audioRef.current) {
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
