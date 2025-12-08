import React, { useEffect, useRef, useState } from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';

interface AudioPlayerProps {
  driveId?: string;
  src?: string; // Allow direct source
  isPlaying: boolean;
  onToggle: () => void;
  title: string;
  variant?: 'minimal' | 'featured'; // Style variants
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  driveId, 
  src,
  isPlaying, 
  onToggle, 
  title,
  variant = 'minimal' 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine the source URL
  const audioSrc = src || (driveId ? getAudioUrl(driveId) : '');

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setHasError(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        setIsLoading(true);
        playPromise
          .then(() => setIsLoading(false))
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsLoading(false);
            setHasError(true);
          });
      }
    } else {
      audioRef.current.pause();
      setIsLoading(false);
    }
  }, [isPlaying]);

  return (
    <div 
        className="flex items-center" 
        onContextMenu={(e) => e.preventDefault()}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={onToggle}
        preload="none"
        controlsList="nodownload"
        onError={() => {
            setIsLoading(false);
            setHasError(true);
        }}
      />
      
      {variant === 'minimal' ? (
        <button
          onClick={(e) => {
              e.stopPropagation();
              onToggle();
          }}
          aria-label={isPlaying ? `暫停試聽 ${title}` : `試聽 ${title}`}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 outline-none
            ${isPlaying 
              ? 'bg-primary text-black scale-110 shadow-lg shadow-white/20' 
              : 'bg-surfaceHighlight text-white hover:bg-accent'
            }
            ${hasError ? '!bg-red-900/50 !text-red-300 cursor-not-allowed' : ''}
          `}
          disabled={hasError}
        >
          {isLoading ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : isPlaying ? (
            <PauseIcon className="w-3 h-3" />
          ) : (
            <PlayIcon className="w-3 h-3 translate-x-0.5" />
          )}
        </button>
      ) : (
        // Featured Variant (Larger, more elegant)
        <button
          onClick={(e) => {
              e.stopPropagation();
              onToggle();
          }}
          className={`
            flex items-center gap-4 px-6 py-3 rounded-full border transition-all duration-500 group
            ${isPlaying 
                ? 'bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-white/20 text-white hover:border-white/50 hover:bg-white/5'
            }
          `}
        >
           <div className={`
             flex items-center justify-center w-6 h-6 rounded-full border transition-colors
             ${isPlaying ? 'border-black/20' : 'border-white/20 group-hover:border-white'}
           `}>
              {isLoading ? (
                <SpinnerIcon className="w-3 h-3" />
              ) : isPlaying ? (
                <PauseIcon className="w-3 h-3" />
              ) : (
                <PlayIcon className="w-3 h-3 translate-x-0.5" />
              )}
           </div>
           <span className="text-xs uppercase tracking-[0.2em] font-medium">
             {isPlaying ? 'Now Playing' : 'Listen Message'}
           </span>
        </button>
      )}
    </div>
  );
};

export default AudioPlayer;