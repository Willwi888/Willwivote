
import React from 'react';
import { getAudioUrl, TRANSLATIONS } from '../constants';
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

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

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
  const finalAudioUrl = getAudioUrl(rawUrl);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // CASE 1: Error State - Emergency Hatch
    // If we already tried to play and it failed, clicking again should open the file externally
    if (isError) {
        window.open(finalAudioUrl, '_blank');
        return;
    }

    // CASE 2: It's a YouTube link (Most of your songs)
    if (isYouTube) {
        if (onToggleExternal) {
            onToggleExternal();
        } else {
            console.error("YouTube link detected but no modal handler provided. Cannot play on mobile.");
        }
        return; 
    }

    // CASE 3: It's a real Audio file (MP3/Drive)
    // We play it using the Audio engine.
    if (onToggleExternal) onToggleExternal(); // Still open modal if needed (for visuals)

    if (!finalAudioUrl) {
        console.warn("AudioPlayer: No valid URL for track", id);
        return;
    }

    playSong(id, finalAudioUrl, title);
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
                  ${isError ? '!border-red-500/50 !text-white !bg-red-500/20 shadow-none' : ''}
              `}
              title={isError ? "Open File Externally" : title}
              >
              {isBuffering ? (
                  <SpinnerIcon className="w-4 h-4" />
              ) : isReallyPlaying ? (
                  <PauseIcon className="w-4 h-4" />
              ) : isError ? (
                  <ExternalLinkIcon className="w-4 h-4" />
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
                  ${isError ? '!border-red-500/50 !text-white !bg-red-900/40 shadow-none' : ''}
                  ${isBuffering ? 'cursor-wait border-gold/50' : ''}
              `}
              >
              {isBuffering ? (
                  <div className="flex flex-col items-center justify-center">
                      <SpinnerIcon className="w-8 h-8 mb-1" />
                  </div>
              ) : isError ? (
                   <div className="flex flex-col items-center justify-center animate-fade-in">
                      <ExternalLinkIcon className="w-8 h-8 mb-1" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Open</span>
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
          <div className={`flex items-center gap-4 w-full bg-[#0a0a0a] rounded-lg p-4 animate-fade-in border transition-colors duration-500 ${isError ? 'border-red-900/30' : 'border-gold/20 shadow-[0_0_20px_rgba(197,160,89,0.05)]'}`}>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 {/* Play/Pause Mini Control */}
                 <button
                    onClick={handleToggle}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0
                        ${isError ? 'bg-red-900/20 text-white border border-red-500/30 animate-pulse' : 'bg-gold text-black hover:scale-105 shadow-[0_0_10px_rgba(197,160,89,0.3)]'}
                    `}
                 >
                     {isBuffering ? <SpinnerIcon className="w-4 h-4" /> : isError ? <ExternalLinkIcon className="w-4 h-4" /> : isReallyPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 translate-x-0.5" />}
                 </button>

                {/* Progress Time */}
                <span className={`text-[10px] font-serif tracking-widest w-10 text-right tabular-nums ${isError ? 'text-gray-500' : 'text-gold'}`}>
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
                      <div className="absolute -top-3 left-0 w-full text-center text-[8px] text-red-400 tracking-[0.1em] uppercase font-bold whitespace-nowrap overflow-visible">
                          Playback Failed. Click button to open file.
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
                    className={`absolute h-1 rounded-full pointer-events-none z-10 transition-all duration-100 ${isError ? 'bg-red-900/50' : 'bg-gold shadow-[0_0_10px_#C5A059]'}`}
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
