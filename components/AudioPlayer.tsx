
import React from 'react';
import { getAudioUrl } from '../constants';
import { PlayIcon, PauseIcon, SpinnerIcon, VolumeIcon } from './Icons';
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
    pause, 
    resume, 
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

    if (isCurrent) {
        if (isPlaying) pause();
        else resume();
    } else {
        const url = getFinalSource();
        if (url) playSong(id, url, title);
        else alert("No audio URL found for this track.");
    }
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
              title={isError ? "Error loading audio" : title}
              >
              {isBuffering ? (
                  <SpinnerIcon className="w-4 h-4" />
              ) : isReallyPlaying ? (
                  <div className="flex gap-1 h-3 items-center">
                      <span className="w-0.5 h-full bg-current animate-[pulse_1s_ease-in-out_infinite]"></span>
                      <span className="w-0.5 h-2/3 bg-current animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                      <span className="w-0.5 h-full bg-current animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                  </div>
              ) : isError ? (
                  <div className="w-2 h-2 rounded-full bg-red-500/50">!</div>
              ) : (
                  <PlayIcon className="w-4 h-4 translate-x-0.5" />
              )}
              </button>
          ) : (
              // Featured Variant (Large Button)
              <button
              onClick={handleToggle}
              className={`
                  w-20 h-20 flex items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition-all duration-500
                  ${isReallyPlaying 
                      ? 'bg-white text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] border-gold' 
                      : 'bg-black/40 text-white hover:bg-white hover:text-black hover:scale-110'
                  }
                  ${isError ? '!border-red-500 !text-red-500' : ''}
              `}
              >
              {isBuffering ? (
                      <SpinnerIcon className="w-8 h-8" />
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
          <div className="flex items-center gap-3 w-full bg-[#1e1e1e] rounded-md p-3 animate-fade-in border border-white/10 shadow-lg">
              {/* Play/Pause Mini Control */}
               <button
                  onClick={handleToggle}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all shrink-0"
               >
                   {isBuffering ? <SpinnerIcon className="w-3 h-3" /> : isReallyPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 translate-x-0.5" />}
               </button>

              {/* Progress Slider */}
              <span className="text-[9px] font-mono text-gold w-8 text-right tabular-nums">
                  {isCurrent ? formatTime(currentTime) : "0:00"}
              </span>
              
              <div className="flex-1 relative h-6 flex items-center group/seek">
                  {isBuffering && (
                      <div className="absolute top-[-15px] left-0 w-full text-center text-[8px] text-gray-500 tracking-widest uppercase animate-pulse">
                          Buffering...
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
                    className="absolute h-1 bg-gold rounded-l-lg pointer-events-none z-10 transition-all duration-100" 
                    style={{ width: `${isCurrent ? (currentTime / (duration || 1)) * 100 : 0}%` }} 
                  />
              </div>
              
              <span className="text-[9px] font-mono text-gray-500 w-8 tabular-nums">
                  {isCurrent ? formatTime(duration) : "0:00"}
              </span>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol pl-2 border-l border-white/10" onClick={(e) => e.stopPropagation()}>
                  <VolumeIcon className="w-3 h-3 text-gray-500 group-hover/vol:text-white transition-colors" />
                  <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gold"
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default AudioPlayer;
