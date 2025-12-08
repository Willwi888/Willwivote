import React, { useEffect, useRef, useState } from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon, VolumeIcon } from './Icons';

interface AudioPlayerProps {
  driveId?: string;
  src?: string; // Allow direct source
  isPlaying: boolean;
  onToggle: () => void;
  title: string;
  variant?: 'minimal' | 'featured'; 
  showControls?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  driveId, 
  src,
  isPlaying, 
  onToggle, 
  title,
  variant = 'minimal',
  showControls = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Helper function to process URLs for best playback
  const getPlayableUrl = (inputSrc?: string, inputDriveId?: string) => {
    if (inputSrc) {
        // Smart handling for Dropbox links to ensure streaming instead of download page
        if (inputSrc.includes('dropbox.com')) {
            return inputSrc.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        }
        return inputSrc;
    }
    if (inputDriveId) return getAudioUrl(inputDriveId);
    return '';
  };

  const audioSrc = getPlayableUrl(src, driveId);

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
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
        audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
        audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
        className={`flex ${showControls ? 'flex-col gap-3 w-full' : 'items-center justify-center'}`}
        onContextMenu={(e) => { e.preventDefault(); return false; }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={onToggle}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="none" 
        controlsList="nodownload noplaybackrate"
        {...{ referrerPolicy: "no-referrer" } as any}
        onError={() => { setIsLoading(false); setHasError(true); }}
      />
      
      {/* Play/Pause Button */}
      <div className="flex items-center justify-center shrink-0">
        {variant === 'minimal' ? (
            <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
            className={`
                group/btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 outline-none
                ${isPlaying ? 'text-white' : 'text-gray-500 hover:text-white'}
                ${hasError ? 'text-red-500' : ''}
            `}
            title={hasError ? "Unable to play source" : title}
            >
            {isLoading ? (
                <SpinnerIcon className="w-4 h-4" />
            ) : isPlaying ? (
                <div className="flex gap-1 h-3 items-center">
                    <span className="w-0.5 h-full bg-current animate-[pulse_1s_ease-in-out_infinite]"></span>
                    <span className="w-0.5 h-2/3 bg-current animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                    <span className="w-0.5 h-full bg-current animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                </div>
            ) : hasError ? (
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            ) : (
                <PlayIcon className="w-4 h-4 translate-x-0.5" />
            )}
            </button>
        ) : (
            // Featured Variant (Large Button)
            <button
            onClick={(e) => {
                e.stopPropagation();
                if (hasError && audioSrc) {
                    window.open(audioSrc, '_blank');
                } else {
                    onToggle();
                }
            }}
            className={`
                w-16 h-16 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-500
                ${isPlaying 
                    ? 'bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                    : 'bg-black/30 border-white/30 text-white hover:bg-white hover:text-black hover:scale-110'
                }
                ${hasError ? '!border-red-500 !text-red-500 hover:!bg-transparent hover:!text-red-500 hover:!scale-100' : ''}
            `}
            >
            {isLoading ? (
                    <SpinnerIcon className="w-6 h-6" />
            ) : isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
            ) : hasError ? (
                    <span className="text-[10px] font-bold uppercase">Open</span>
            ) : (
                    <PlayIcon className="w-6 h-6 translate-x-1" />
            )}
            </button>
        )}
      </div>

      {/* Expanded Controls */}
      {showControls && (
          <div className="flex items-center gap-3 w-full bg-white/5 rounded-md p-2 animate-fade-in border border-white/5">
              {/* Progress Slider */}
              <span className="text-[9px] font-mono text-gray-400 w-7 text-right">{formatTime(currentTime)}</span>
              <input 
                  type="range" 
                  min="0" 
                  max={duration || 0} 
                  value={currentTime}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
              />
              <span className="text-[9px] font-mono text-gray-400 w-7">{formatTime(duration)}</span>

              {/* Separator */}
              <div className="w-px h-3 bg-white/10 mx-1"></div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol" onClick={(e) => e.stopPropagation()}>
                  <VolumeIcon className="w-3 h-3 text-gray-500 group-hover/vol:text-white transition-colors" />
                  <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default AudioPlayer;