
import React from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon, VolumeIcon, RetryIcon } from './Icons';
import { useAudio } from './AudioContext';
import { extractYouTubeId } from '../services/storage';

interface AudioPlayerProps {
  id: number | string; // Unique ID for this track
  driveId?: string;
  src?: string; 
  title: string;
  variant?: 'minimal' | 'featured'; 
  showControls?: boolean;
  onToggleExternal?: () => void; // Optional callback when toggled
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  id,
  driveId, 
  src,
  title,
  variant = 'minimal',
  showControls = false,
  onToggleExternal
}) => {
  const { 
    playingId, 
    isPlaying, 
    isLoading, 
    error, 
    currentTime, 
    duration, 
    volume, 
    playSong, 
    seek, 
    setVolume 
  } = useAudio();

  const isCurrent = playingId === id;
  const isReallyPlaying = isCurrent && isPlaying;
  const isBuffering = isCurrent && isLoading;
  const isError = isCurrent && error;

  // Determine final Source URL
  const rawUrl = src || driveId || '';
  
  // Check if this is actually a YouTube link masquerading as audio
  const youtubeId = extractYouTubeId(rawUrl);
  const isYouTube = !!youtubeId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CASE 1: It's a YouTube link (Most of your songs)
    // NUCLEAR FIX: Absolutely NO AudioContext logic here.
    // Just execute the modal callback callback.
    if (isYouTube) {
        if (onToggleExternal) {
            onToggleExternal();
        } else {
            console.error("YouTube link detected but no modal handler provided. Cannot play on mobile.");
        }
        return; 
    }

    // CASE 2: It's a real Audio file (MP3/Drive)
    // We play it using the Audio engine.
    if (onToggleExternal) onToggleExternal(); // Still open modal if needed (for visuals)

    const url = getAudioUrl(rawUrl);
    if (!url) {
        console.warn("AudioPlayer: No valid URL for track", id);
        return;
    }

    playSong(id, url, title);
  };

  // Format time helper
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // If it's YouTube, we just show a "View" button state
  if (isYouTube && !showControls) {
       return (
        <div className="flex items-center justify-center shrink-0">
             <button
              onClick={handleToggle}
              className={`
                  group/btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 outline-none
                  border border-gold/30 text-gold hover:bg-gold hover:text-black
              `}
              title="Watch Video"
              >
               <PlayIcon className="w-4 h-4 translate-x-0.5" />
             </button>
        </div>
       );
  }

  return (
    <div 
        className={`flex ${showControls ? 'flex-col gap-4 w-full' : 'items-center justify-center'}`}
    >
      {/* Play/Pause Button (Audio Only) */}
      {!showControls && (
        <div className="flex items-center justify-center shrink-0">
          {variant === 'minimal' ? (
              <button
              onClick={handleToggle}
              className={`
                  group/btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 outline-none
                  ${isReallyPlaying ? 'bg-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.5)]' : 'border border-gold/30 text-gold hover:bg-gold hover:text-black'}
                  ${isError ? '!border-red-500 !text-red-500 !bg-transparent shadow-[0_0_15px_rgba(220,38,38,0.3)]' : ''}
              `}
              title={isError ? "Playback Error - Click to Retry" : title}
              >
              {isBuffering ? (
                  <SpinnerIcon className="w-4 h-4" />
              ) : isReallyPlaying ? (
                  <PauseIcon className="w-4 h-4" />
              ) : isError ? (
                  <RetryIcon className="w-4 h-4" />
              ) : (
                  <PlayIcon className="w-4 h-4 translate-x-0.5" />
              )}
              </button>
          ) : (
              // Featured Variant (Large Button)
              <button
              onClick={handleToggle}
              className={`
                  w-20 h-20 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 relative overflow-hidden
                  ${isReallyPlaying 
                      ? 'bg-gold text-black shadow-[0_0_50px_rgba(197,160,89,0.4)] border-gold scale-105' 
                      : 'bg-black/40 text-white border-white/20 hover:border-gold hover:text-gold hover:scale-105'
                  }
                  ${isError ? '!border-red-500 !text-red-500 !bg-red-900/10 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : ''}
                  ${isBuffering ? 'cursor-wait border-gold/50' : ''}
              `}
              >
              {isBuffering ? (
                  <div className="flex flex-col items-center justify-center">
                      <SpinnerIcon className="w-8 h-8 mb-1" />
                  </div>
              ) : isError ? (
                   <div className="flex flex-col items-center justify-center animate-fade-in">
                      <RetryIcon className="w-8 h-8 mb-1" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Retry</span>
                  </div>
              ) : isReallyPlaying ? (
                      <PauseIcon className="w-8 h-8" />
              ) : (
                      <PlayIcon className="w-8 h-8 translate-x-1" />
              )}
              </button>
          )}
        </div>
      )}

      {/* Expanded Controls (Audio Only) */}
      {showControls && (
          <div className={`flex items-center gap-4 w-full bg-[#0a0a0a] rounded-lg p-4 animate-fade-in border transition-colors duration-500 ${isError ? 'border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-gold/20 shadow-[0_0_20px_rgba(197,160,89,0.05)]'}`}>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 {/* Play/Pause Mini Control */}
                 <button
                    onClick={handleToggle}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0
                        ${isError ? 'bg-red-900/20 text-red-500 border border-red-500/50' : 'bg-gold text-black hover:scale-105 shadow-[0_0_10px_rgba(197,160,89,0.3)]'}
                    `}
                 >
                     {isBuffering ? <SpinnerIcon className="w-4 h-4" /> : isError ? <RetryIcon className="w-4 h-4" /> : isReallyPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 translate-x-0.5" />}
                 </button>

                {/* Progress Time */}
                <span className={`text-[10px] font-serif tracking-widest w-10 text-right tabular-nums ${isError ? 'text-red-400' : 'text-gold'}`}>
                    {isCurrent ? formatTime(currentTime) : "0:00"}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 relative h-8 flex items-center group/seek w-full">
                  {isBuffering && (
                      <div className="absolute -top-3 left-0 w-full text-center text-[8px] text-gold tracking-[0.2em] uppercase animate-pulse font-bold">
                          Buffering...
                      </div>
                  )}
                  {isError && (
                      <div className="absolute -top-3 left-0 w-full text-center text-[8px] text-red-500 tracking-[0.2em] uppercase font-bold animate-pulse">
                          Unable to Play
                      </div>
                  )}
                  
                  <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={isCurrent ? currentTime : 0}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => isCurrent && seek(parseFloat(e.target.value))}
                      disabled={!isCurrent}
                      className="absolute w-full h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-gold z-20 hover:h-1.5 transition-all disabled:opacity-30"
                  />
                  {/* Progress Glow */}
                  <div 
                    className={`absolute h-1 rounded-full pointer-events-none z-10 transition-all duration-100 ${isError ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-gold shadow-[0_0_10px_#C5A059]'}`}
                    style={{ width: `${isCurrent ? (currentTime / (duration || 1)) * 100 : 0}%` }} 
                  />
              </div>
              
              <div className="flex items-center gap-3">
                  <span className="text-[10px] font-serif tracking-widest text-gray-500 w-10 tabular-nums">
                      {isCurrent ? formatTime(duration) : "0:00"}
                  </span>

                  {/* Volume */}
                  <div className="hidden sm:flex items-center gap-2 group/vol pl-4 border-l border-white/10" onClick={(e) => e.stopPropagation()}>
                      <VolumeIcon className="w-4 h-4 text-gray-400 group-hover/vol:text-white transition-colors" />
                      <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-white hover:accent-gold"
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AudioPlayer;
