
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

  useEffect(() => {
    // Create the single global audio instance
    const audio = new Audio();
    audio.preload = "none"; 
    // Important for iOS:
    // @ts-ignore
    audio.playsInline = true; 
    audio.crossOrigin = "anonymous";
    
    audioRef.current = audio;

    // Event Listeners
    const handleCanPlay = () => {
        setIsLoading(false);
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
        // Don't log error if it was just an empty src clear
        if (!audio.src || audio.src === window.location.href) return;

        const details = err ? `Code: ${err.code}, Message: ${err.message}` : "Unknown Error";
        console.warn(`Audio Playback Error [${audio.src}]: ${details}`);
        
        setIsLoading(false);
        setError(true);
        setIsPlaying(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

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
  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;

      // If audio is already playing, we don't need to do anything
      if (!audio.paused && audio.currentTime > 0) return;

      // Play a silent buffer to unlock the audio engine on iOS/Android
      // This is a 0.1s silent WAV file base64 encoded
      const originalSrc = audio.src;
      const SILENT_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQQAAAAAAA==';
      
      // We only switch to silent if we aren't currently playing something real
      if (!playingId) {
          audio.src = SILENT_AUDIO;
          audio.load();
          const playPromise = audio.play();
          if (playPromise) {
              playPromise.then(() => {
                  // Immediately pause after unlocking
                  audio.pause();
                  // Don't reset src immediately, let it sit there until playSong is called
              }).catch(e => {
                  console.debug("Silent unlock prevented", e);
              });
          }
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
        setIsPlaying(false);
        return;
      } 
      
      // User wants to RESUME
      setIsPlaying(true); // Optimistic UI update
      try {
          // Check if the element is actually ready. If src was cleared or errored, throw to trigger fallback.
          if (!audio.src || audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
             throw new Error("Audio element needs reload");
          }
          await audio.play();
      } catch (e) {
          console.warn("Resume failed, attempting to reload source...", e);
          // Fallback: Reload the source completely
          try {
              setIsLoading(true);
              audio.src = url;
              audio.load();
              await audio.play();
              setError(false);
          } catch (retryErr: any) {
              if (retryErr.name !== 'AbortError') {
                 console.error("Retry playback failed", retryErr);
                 setIsPlaying(false);
                 setError(true);
              }
          } finally {
              setIsLoading(false);
          }
      }
      return;
    } 

    // --- NEW SONG LOGIC ---
    setIsLoading(true);
    setPlayingId(id);
    setIsPlaying(true);
    setError(false);
    
    try {
        audio.src = url;
        audio.load();
        await audio.play();
    } catch (e: any) {
        // AbortError is expected if user switches songs quickly
        if (e.name === 'AbortError') {
            console.log("Playback aborted by user action");
        } else {
            console.error("Playback failed", e);
            setIsPlaying(false);
            setError(true);
        }
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
        setIsPlaying(true);
    } catch (e) {
        console.error("Resume failed", e);
        setIsPlaying(false);
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
