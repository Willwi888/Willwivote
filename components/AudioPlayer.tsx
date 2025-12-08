import React, { useEffect, useRef, useState } from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';

interface AudioPlayerProps {
  driveId?: string;
  src?: string; 
  isPlaying: boolean;
  onToggle: () => void;
  title: string;
  variant?: 'minimal' | 'featured'; 
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

  const audioSrc = src || (driveId ? getAudioUrl(driveId) : '');

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setHasError(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        setIsLoading(true);
        playPromise
          .then(() => {})
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsLoading(false);
            if (error.name !== 'AbortError') setHasError(true);
          });
      }
    } else {
      audioRef.current.pause();
      setIsLoading(false);
    }
  }, [isPlaying]);

  const handleCanPlay = () => isPlaying && setIsLoading(false);
  const handleWaiting = () => isPlaying && setIsLoading(true);
  const handlePlaying = () => setIsLoading(false);

  return (
    <div 
        className="flex items-center" 
        onContextMenu={(e) => { e.preventDefault(); return false; }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={onToggle}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        preload="none" 
        controlsList="nodownload noplaybackrate"
        {...{ referrerPolicy: "no-referrer" } as any}
        onError={() => { setIsLoading(false); setHasError(true); }}
      />
      
      {variant === 'minimal' ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
          className={`
            group/btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 outline-none
            ${isPlaying 
              ? 'text-white' 
              : 'text-gray-500 hover:text-white'
            }
            ${hasError ? 'text-red-500' : ''}
          `}
          disabled={hasError}
        >
          {isLoading ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : isPlaying ? (
            // Minimal Pause Icon (Vertical Bars)
            <div className="flex gap-1 h-3 items-center">
                <span className="w-0.5 h-full bg-current animate-[pulse_1s_ease-in-out_infinite]"></span>
                <span className="w-0.5 h-2/3 bg-current animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                <span className="w-0.5 h-full bg-current animate-[pulse_0.8s_ease-in-out_infinite]"></span>
            </div>
          ) : (
             <PlayIcon className="w-4 h-4 translate-x-0.5" />
          )}
        </button>
      ) : (
        // Featured Variant is handled by parent CSS mostly, this provides internal logic hooks if needed
        null 
      )}
    </div>
  );
};

export default AudioPlayer;