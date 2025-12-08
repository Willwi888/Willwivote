
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
  const [retryCount, setRetryCount] = useState(0);

  // --- SMART URL PROCESSING ---
  const processUrl = (rawUrl: string) => {
      if (!rawUrl) return '';
      let url = rawUrl.trim();

      // DROPBOX OPTIMIZATION (Robust Regex)
      // Converts www.dropbox.com or dropbox.com to dl.dropboxusercontent.com
      // Also removes query parameters like ?dl=0 to ensure direct stream
      if (url.match(/dropbox\.com/)) {
          url = url.replace(/https?:\/\/(www\.)?dropbox\.com/, 'https://dl.dropboxusercontent.com');
          // Remove query params to ensure raw file access
          url = url.split('?')[0]; 
      }
      
      return url;
  };

  // Determine final Source
  const getFinalSource = () => {
    if (src && src.trim() !== '') {
        return processUrl(src);
    }
    if (driveId && driveId.trim() !== '') {
        const resolved = getAudioUrl(driveId);
        return processUrl(resolved);
    }
    return '';
  };

  const audioSrc = getFinalSource();

  useEffect(() => {
    // Reset state when source changes
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      setHasError(false);
      // Ensure we attempt to load if it's not ready
      if (audio.readyState === 0) {
          audio.load();
      }
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        setIsLoading(true);
        playPromise
          .then(() => {
             // Playback started successfully
             setIsLoading(false);
          })
          .catch((error) => {
            // Only log serious errors, ignore AbortError (pause/interrupt)
            if (error instanceof Error && error.name !== 'AbortError') {
                 console.warn("Playback interrupted:", error.message);
                 setHasError(true);
                 setIsLoading(false);
            }
          });
      }
    } else {
      audio.pause();
      setIsLoading(false);
    }
  }, [isPlaying, audioSrc]);

  const handleCanPlay = () => {
      if (isPlaying) setIsLoading(false);
  };
  
  const handleWaiting = () => {
      // Only show loading if we are supposed to be playing
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

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const target = e.currentTarget;
    const err = target.error;
    console.warn("Audio tag warning:", err ? `Code ${err.code}: ${err.message}` : "Unknown");
    
    // Auto-retry logic for network/format errors (Code 2 or 4)
    if (retryCount < 1 && audioSrc && isPlaying) {
        console.log("Attempting auto-retry...");
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                audioRef.current.play().catch(() => {});
            }
        }, 800);
    } else {
        setIsLoading(false); 
        setHasError(true); 
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
        key={audioSrc} // Force remount on source change to clear internal buffers
        ref={audioRef}
        src={audioSrc}
        onEnded={onToggle}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        // CRITICAL FIX: Only preload if playing or controls are shown. 
        // Prevents browser from choking on 40 simultaneous connections.
        preload={isPlaying || showControls ? "auto" : "none"}
        playsInline 
        {...{ "webkit-playsinline": "true" } as any}
        controlsList="nodownload noplaybackrate"
      />
      
      {/* Play/Pause Button */}
      {!showControls && (
        <div className="flex items-center justify-center shrink-0">
          {variant === 'minimal' ? (
              <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`
                  group/btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 outline-none
                  ${isPlaying ? 'text-white' : 'text-gray-500 hover:text-white'}
                  ${hasError ? 'text-red-500' : ''}
              `}
              title={hasError ? "Playback Error (Tap to retry)" : title}
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
                  <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></div>
              ) : (
                  <PlayIcon className="w-4 h-4 translate-x-0.5" />
              )}
              </button>
          ) : (
              // Featured Variant (Large Button for Modal Image Overlay)
              <button
              onClick={(e) => {
                  e.stopPropagation();
                  // If error, try opening link directly as fallback
                  if (hasError && audioSrc) {
                      if (confirm("Playback failed. Open audio in new tab?")) {
                          window.open(audioSrc, '_blank');
                      }
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
