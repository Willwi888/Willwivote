
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
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
        setIsPlaying(false);
        setPlayingId(null);
    };

    const handleTimeUpdate = () => {
        if (!isNaN(audio.currentTime)) setCurrentTime(audio.currentTime);
    };

    const handleError = () => {
        if (!audio.src || audio.src === window.location.href) return;
        console.error("Audio Error:", audio.error);
        setIsLoading(false);
        setIsPlaying(false);
        setError(true);
    };

    const handleCanPlay = () => {
        setIsLoading(false);
        if (audio.duration) setDuration(audio.duration);
    };
    
    // Bind
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));

    return () => {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // MOBILE UNLOCK FUNCTION
  // Must be called inside a click event handler (e.g. "Enter Studio")
  const initializeAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      // We play a silent buffer or just play/pause to unlock the AudioContext
      if (audio.paused && !playingId) {
          audio.play().then(() => {
              audio.pause();
          }).catch(e => {
              console.log("Audio unlock attempted (silent fail expected if no interaction)", e);
          });
      }
  };

  const playSong = async (id: number | string, url: string, title: string = '') => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    // If same song, toggle
    if (playingId === id) {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error("Resume failed", e));
        }
        return;
    }

    // New song
    setPlayingId(id);
    setCurrentTitle(title);
    setCurrentSrc(url);
    setIsLoading(true);
    setError(false);

    try {
        audio.src = url;
        audio.load();
        await audio.play();
    } catch (e) {
        console.error("Play failed", e);
        setIsLoading(false);
        setError(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
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
