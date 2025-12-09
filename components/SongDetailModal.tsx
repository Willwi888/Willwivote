
import React, { useState, useEffect, useRef } from 'react';
import { Song, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import AudioPlayer from './AudioPlayer';
import { useAudio } from './AudioContext';
import { CheckIcon, HeartIcon, ArrowLeftIcon } from './Icons';
import { extractYouTubeId } from '../services/storage';

interface SongDetailModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onVote: (id: number, reason?: string) => void;
  isVoted: boolean;
  canVote: boolean;
  defaultCover: string;
  savedReason: string;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({ 
  song, 
  isOpen, 
  onClose, 
  lang, 
  onVote, 
  isVoted,
  canVote,
  defaultCover,
  savedReason
}) => {
  const [voteStage, setVoteStage] = useState<'view' | 'reason'>('view');
  const [reason, setReason] = useState('');
  const { pause } = useAudio(); 
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- AUDIO MUTEX & STATE RESET ---
  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          
          // CRITICAL: Stop HTML5 Audio immediately to allow iOS to focus on the iframe
          pause(); 
          
          // Reset scroll manually on open
          if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
          }
          
          // Body lock to prevent background scrolling on iOS
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
      return () => {
          document.body.style.overflow = '';
      };
  }, [isOpen, savedReason, song]);

  // If not open, do not render to ensure YouTube audio stops completley
  if (!isOpen || !song) return null;

  const t = TRANSLATIONS[lang];

  const handleVoteClick = () => {
      if (isVoted) {
          onVote(song.id); 
      } else {
          setVoteStage('reason'); 
      }
  };

  const handleConfirmVote = () => {
      onVote(song.id, reason);
      setVoteStage('view');
  };

  // ROBUST ID EXTRACTION
  let finalYoutubeId = song.youtubeId;
  if (!finalYoutubeId && song.customAudioUrl) {
      finalYoutubeId = extractYouTubeId(song.customAudioUrl);
  }
  
  const isYouTubeSource = !!finalYoutubeId;
  // Ensure origin is valid (client-side only)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    // ROOT OVERLAY: Fixed z-100, covers entire screen, handles scrolling internally
    // This is the most stable layout for iOS Safari
    <div className="fixed inset-0 z-[100] bg-[#000000] flex flex-col w-full h-full safe-area-bottom">
      
      {/* 1. HEADER (Fixed at top of Flex container) */}
      <div className="flex-none h-16 px-4 flex items-center justify-between bg-black/80 backdrop-blur-md z-[110] border-b border-white/10">
          <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              Track #{String(song.id).padStart(2,'0')}
          </div>
          <button 
              onClick={onClose}
              // Uses standard onClick. iOS handles this well on button elements.
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-90 transition-transform"
          >
              <ArrowLeftIcon className="w-5 h-5" />
          </button>
      </div>

      {/* 2. SCROLLABLE BODY (Flex Grow) */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-[#050505] pb-32"
        style={{ WebkitOverflowScrolling: 'touch' }} // iOS Momentum Scrolling
      >
          
          {/* MEDIA PLAYER CONTAINER */}
          <div className="w-full bg-black relative">
              {isYouTubeSource ? (
                  // YOUTUBE MODE
                  <div className="w-full aspect-video bg-black relative z-10">
                      <iframe 
                          // KEY IS CRITICAL: Forces React to re-mount iframe on song change
                          // ensuring the player is fresh and not stuck in a previous state.
                          key={song.id} 
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&origin=${origin}`}
                          title={song.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="eager"
                      ></iframe>
                  </div>
              ) : (
                  // AUDIO MODE
                  <div className="w-full aspect-square md:aspect-video relative">
                      <img src={defaultCover} className="w-full h-full object-cover object-top opacity-60" alt="Album Cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                      
                      {/* Audio Player */}
                      <div className="absolute bottom-0 left-0 w-full p-6 pb-8 flex justify-center z-20">
                            <div className="w-full max-w-md bg-[#111]/90 backdrop-blur-xl p-4 rounded-lg border border-white/10 shadow-2xl">
                                <AudioPlayer 
                                    id={song.id} 
                                    driveId={song.driveId} 
                                    src={song.customAudioUrl} 
                                    title={song.title} 
                                    variant="minimal" 
                                    showControls={true} 
                                />
                            </div>
                      </div>
                  </div>
              )}
          </div>

          {/* CONTENT INFO */}
          <div className="px-6 py-8 max-w-xl mx-auto text-center space-y-10">
              <div className="animate-slide-up">
                  <h2 className="font-serif text-2xl md:text-3xl italic leading-tight text-white/90">
                      {song.title}
                  </h2>
              </div>

              {/* LYRICS */}
              <div className="animate-slide-up space-y-4" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-center gap-4 opacity-30">
                      <div className="h-px w-8 bg-white"></div>
                      <span className="text-[10px] uppercase tracking-[0.3em]">{t.lyrics}</span>
                      <div className="h-px w-8 bg-white"></div>
                  </div>
                  
                  <div className="select-none font-serif text-gray-400 text-sm leading-[2.0] whitespace-pre-wrap">
                      {song.lyrics || <span className="text-gray-600 italic">~ No Lyrics Available ~</span>}
                  </div>
              </div>

              {/* CREDITS */}
              <div className="animate-slide-up pb-12" style={{ animationDelay: '200ms' }}>
                   <div className="flex items-center justify-center gap-4 mb-4 opacity-30">
                      <div className="h-px w-8 bg-white"></div>
                      <span className="text-[10px] uppercase tracking-[0.3em]">{t.credits}</span>
                      <div className="h-px w-8 bg-white"></div>
                  </div>
                  <div className="select-none font-sans text-gray-500 text-[10px] leading-relaxed whitespace-pre-wrap uppercase tracking-wider">
                      {song.credits || "Willwi Music Production"}
                  </div>
              </div>
          </div>
      </div>

      {/* 3. ACTION BAR (Fixed Bottom of Flex Container) */}
      <div className="flex-none bg-[#0a0a0a] border-t border-white/10 p-4 z-[120] safe-area-padding-bottom">
          <div className="max-w-md mx-auto w-full">
              {voteStage === 'view' ? (
                  <div className="flex flex-col gap-3">
                      <button
                          onClick={handleVoteClick}
                          disabled={!isVoted && !canVote}
                          className={`
                              w-full py-4 uppercase tracking-[0.2em] text-[11px] font-bold rounded-[2px] transition-all flex items-center justify-center gap-3
                              ${isVoted 
                                  ? 'bg-transparent border border-gold text-gold' 
                                  : canVote 
                                      ? 'bg-white text-black active:bg-gray-200'
                                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                              }
                          `}
                      >
                          {isVoted ? <><CheckIcon className="w-4 h-4" /> {t.voted}</> : <><HeartIcon className={`w-4 h-4 ${canVote?'fill-current':''}`} /> {t.voteForThis}</>}
                      </button>
                      
                      {isVoted && savedReason && (
                          <p className="text-center text-[10px] text-gold italic font-serif truncate">
                              "{savedReason}"
                          </p>
                      )}
                  </div>
              ) : (
                  <div className="animate-slide-up w-full">
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="text-white font-serif italic text-base">{t.tellUsWhy}</h3>
                          <span className="text-[9px] text-gray-600 uppercase">Optional</span>
                      </div>
                      <textarea 
                          autoFocus
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder={t.reasonPlaceholder}
                          className="w-full bg-[#111] border border-white/20 rounded-[2px] p-3 text-sm text-white focus:border-gold outline-none h-20 mb-3 resize-none font-serif block"
                      />
                      <div className="flex gap-3">
                          <button onClick={() => setVoteStage('view')} className="flex-1 py-3 text-[10px] uppercase tracking-widest text-gray-400 border border-white/10 rounded-[2px]">{t.cancel}</button>
                          <button onClick={handleConfirmVote} className="flex-[2] py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-[2px]">{t.confirmSelection}</button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
