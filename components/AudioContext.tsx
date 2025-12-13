
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

// The shape of our Audio Context
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

  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [currentTitle, setCurrentTitle] = useState('');

  // Setup Audio Object
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none"; 
    // Security: Anonymous cross-origin
    audio.crossOrigin = "anonymous"; 
    
    audioRef.current = audio;

    const handleEnded = () => {
        setIsPlaying(false);
        setPlayingId(null);
    };

    const handleTimeUpdate = () => {
        if (!isNaN(audio.currentTime)) setCurrentTime(audio.currentTime);
    };

    const handleError = (e: Event) => {
        const target = e.target as HTMLAudioElement;
        // Don't report error if it's just the initial state or empty
        if (!target.src || target.src === window.location.href) return;
        
        console.error("Audio Playback Error Occurred:");
        console.error("- Error Code:", target.error?.code);
        console.error("- Error Message:", target.error?.message);
        
        setIsLoading(false);
        setIsPlaying(false);
        // Only set error if we were actually trying to play
        if (playingId) setError(true);
    };

    const handleCanPlay = () => {
        setIsLoading(false);
        setError(false);
        if (audio.duration) setDuration(audio.duration);
    };
    
    // Bind
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    // Sync state with actual audio events
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('playing', () => setIsLoading(false));

    return () => {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [playingId]);

  // MOBILE UNLOCK FUNCTION
  // Must be called inside a click event handler (e.g. "Enter Studio")
  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      // We play a silent buffer or just play/pause to unlock the AudioContext
      if (audio.paused && !playingId) {
          audio.load(); // Force load
      }
  };

  const playSong = async (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    // Toggle logic
    if (playingId === id) {
        if (isPlaying) {
            audio.pause();
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.error("Resume failed", e));
            }
        }
        return;
    }

    // New song setup
    setPlayingId(id);
    setCurrentTitle(title);
    setCurrentSrc(url);
    setIsLoading(true);
    setError(false);

    // CRITICAL FOR MOBILE:
    // We must set src and call play() synchronously within the event handler (or as close as possible).
    // The previous async fetch() caused iOS to lose the "user gesture" token.
    audio.src = url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Playback started successfully
                setIsLoading(false);
            })
            .catch(e => {
                console.error("Play failed:", e);
                setIsLoading(false);
                if (e.name !== 'AbortError') {
                    setError(true);
                }
            });
    }
  };

  const pause = () => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
  };

  const resume = () => {
      if (audioRef.current) audioRef.current.play();
  };

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
