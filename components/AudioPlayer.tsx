
import React from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon, VolumeIcon, RetryIcon } from './Icons';
import { useAudio } from './AudioContext';

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
  const getFinalSource = () => {
    if (src && src.trim() !== '') return getAudioUrl(src);
    if (driveId && driveId.trim() !== '') return getAudioUrl(driveId);
    return '';
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExternal) onToggleExternal();

    const url = getFinalSource();
    if (!url) {
        // SILENT FAIL - Do not alert "No audio URL found"
        // This ensures the presentation is not interrupted by popups.
        console.warn("AudioPlayer: No valid URL for track", id);
        return;
    }

    // playSong now handles toggle (play/pause), resume, and retry logic internally
    // safely because we always pass the valid URL.
    playSong(id, url, title);
  };

  // Format time helper
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
        className={`flex ${showControls ? 'flex-col gap-3 w-full' : 'items-center justify-center'}`}
    >
      {/* Play/Pause Button */}
      {!showControls && (
        <div className="flex items-center justify-center shrink-0">
          {variant === 'minimal' ? (
              <button
              onClick={handleToggle}
              className={`
                  group/btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 outline-none
                  ${isReallyPlaying ? 'text-white' : 'text-gray-500 hover:text-white'}
                  ${isError ? 'text-red-500' : ''}
              `}
              title={isError ? "Error - Click to retry" : title}
              >
              {isBuffering ? (
                  <SpinnerIcon className="w-4 h-4 text-gold" />
              ) : isReallyPlaying ? (
                  <div className="flex gap-1 h-3 items-center">
                      <span className="w-0.5 h-full bg-current animate-[pulse_1s_ease-in-out_infinite]"></span>
                      <span className="w-0.5 h-2/3 bg-current animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                      <span className="w-0.5 h-full bg-current animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                  </div>
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
                      ? 'bg-white text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] border-gold' 
                      : 'bg-black/40 text-white border-white/20 hover:bg-white hover:text-black hover:scale-110'
                  }
                  ${isError ? '!border-red-500 !text-red-500 !bg-red-900/20' : ''}
                  ${isBuffering ? 'cursor-wait border-gold/50' : ''}
              `}
              >
              {isBuffering ? (
                  <div className="flex flex-col items-center justify-center">
                      <SpinnerIcon className="w-8 h-8 text-gold mb-1" />
                      <span className="text-[8px] uppercase tracking-widest font-bold text-gold animate-pulse">Loading</span>
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

      {/* Expanded Controls (Waveform-style) - Only rendered if this is the active track or forced */}
      {showControls && (
          <div className="flex items-center gap-3 w-full bg-[#1e1e1e] rounded-md p-3 animate-fade-in border border-white/10 shadow-lg flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 {/* Play/Pause Mini Control */}
                 <button
                    onClick={handleToggle}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0
                        ${isError ? 'bg-red-900/50 text-red-500 hover:bg-red-900 hover:text-red-400' : 'bg-white/10 hover:bg-white text-white hover:text-black'}
                    `}
                 >
                     {isBuffering ? <SpinnerIcon className="w-3 h-3 text-gold" /> : isError ? <RetryIcon className="w-3 h-3" /> : isReallyPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 translate-x-0.5" />}
                 </button>

                {/* Progress Slider */}
                <span className="text-[9px] font-mono text-gold w-8 text-right tabular-nums">
                    {isCurrent ? formatTime(currentTime) : "0:00"}
                </span>
              </div>
              
              <div className="flex-1 relative h-6 flex items-center group/seek w-full order-3 sm:order-2 mt-2 sm:mt-0">
                  {isBuffering && (
                      <div className="absolute top-[-15px] left-0 w-full text-center text-[8px] text-gold tracking-widest uppercase animate-pulse font-bold">
                          Buffering...
                      </div>
                  )}
                  {isError && (
                      <div className="absolute top-[-15px] left-0 w-full text-center text-[8px] text-red-500 tracking-widest uppercase font-bold animate-pulse">
                          Connection Error
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
                      className="absolute w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold z-20 hover:h-2 transition-all disabled:opacity-50"
                  />
                  {/* Progress fill visual */}
                  <div 
                    className={`absolute h-1 rounded-l-lg pointer-events-none z-10 transition-all duration-100 ${isError ? 'bg-red-500' : 'bg-gold'}`}
                    style={{ width: `${isCurrent ? (currentTime / (duration || 1)) * 100 : 0}%` }} 
                  />
              </div>
              
              <div className="flex items-center gap-2 order-2 sm:order-3">
                  <span className="text-[9px] font-mono text-gray-500 w-8 tabular-nums">
                      {isCurrent ? formatTime(duration) : "0:00"}
                  </span>

                  {/* Volume Slider - ENHANCED VISIBILITY */}
                  <div className="flex items-center gap-2 group/vol pl-2 border-l border-white/10" onClick={(e) => e.stopPropagation()}>
                      <VolumeIcon className="w-4 h-4 text-gray-400 group-hover/vol:text-white transition-colors" />
                      <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-24 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gold"
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AudioPlayer;
