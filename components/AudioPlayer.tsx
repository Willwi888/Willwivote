
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
    if (inputSrc && inputSrc.trim() !== '') {
        let url = inputSrc.trim();
        // Smart handling for Dropbox links to ensure streaming instead of download page
        if (url.includes('dropbox.com')) {
             // Convert www.dropbox.com to dl.dropboxusercontent.com for direct streaming
             url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        }
        return url;
    }
    if (inputDriveId && inputDriveId.trim() !== '') return getAudioUrl(inputDriveId);
    return '';
  };

  const audioSrc = getPlayableUrl(src, driveId);

  useEffect(() => {
    // Reset state when source changes
    setIsLoading(false);
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      setHasError(false);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        setIsLoading(true);
        playPromise
          .then(() => {
             // Playback started successfully
             setIsLoading(false);
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsLoading(false);
            if (error.name !== 'AbortError') {
                 // Only show error if it wasn't a manual pause/stop
                 setHasError(true);
            }
          });
      }
    } else {
      audio.pause();
      setIsLoading(false);
    }

    return () => {
        // Cleanup: ensure pause is called if component unmounts while playing
        audio.pause();
    };
  }, [isPlaying, audioSrc]);

  const handleCanPlay = () => {
      if (isPlaying) setIsLoading(false);
  };
  
  const handleWaiting = () => {
      if (isPlaying && !audioRef.current?.paused) setIsLoading(true);
  };
  
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
      {!showControls && (
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
              // Featured Variant (Large Button for Modal Image Overlay)
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
                  w-20 h-20 flex items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition-all duration-500
                  ${isPlaying 
                      ? 'bg-white text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] border-gold' 
                      : 'bg-black/40 text-white hover:bg-white hover:text-black hover:scale-110'
                  }
                  ${hasError ? '!border-red-500 !text-red-500 hover:!bg-transparent hover:!text-red-500 hover:!scale-100' : ''}
              `}
              >
              {isLoading ? (
                      <SpinnerIcon className="w-8 h-8" />
              ) : isPlaying ? (
                      <PauseIcon className="w-8 h-8" />
              ) : hasError ? (
                      <span className="text-[10px] font-bold uppercase">Error</span>
              ) : (
                      <PlayIcon className="w-8 h-8 translate-x-1" />
              )}
              </button>
          )}
        </div>
      )}

      {/* Expanded Controls (Waveform-style) */}
      {showControls && (
          <div className="flex items-center gap-3 w-full bg-[#1e1e1e] rounded-md p-3 animate-fade-in border border-white/10 shadow-lg">
              {/* Play/Pause Mini Control inside bar */}
               <button
                  onClick={(e) => { e.stopPropagation(); onToggle(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all shrink-0"
               >
                   {isLoading ? <SpinnerIcon className="w-3 h-3" /> : isPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 translate-x-0.5" />}
               </button>

              {/* Progress Slider */}
              <span className="text-[9px] font-mono text-gold w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="flex-1 relative h-6 flex items-center group/seek">
                  {/* Loading Status Text Overlay */}
                  {isLoading && (
                      <div className="absolute top-[-15px] left-0 w-full text-center text-[8px] text-gray-500 tracking-widest uppercase animate-pulse">
                          Buffering...
                      </div>
                  )}
                  
                  <input 
                      type="range" 
                      min="0" 
                      max={duration || 0} 
                      value={currentTime}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSeek}
                      className="absolute w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold z-20 hover:h-2 transition-all"
                  />
                  {/* Progress fill visual */}
                  <div 
                    className="absolute h-1 bg-gold rounded-l-lg pointer-events-none z-10 transition-all duration-100" 
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} 
                  />
              </div>
              <span className="text-[9px] font-mono text-gray-500 w-8 tabular-nums">{formatTime(duration)}</span>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol pl-2 border-l border-white/10" onClick={(e) => e.stopPropagation()}>
                  <VolumeIcon className="w-3 h-3 text-gray-500 group-hover/vol:text-white transition-colors" />
                  <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gold"
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default AudioPlayer;
