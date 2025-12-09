
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

  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          pause(); // CRITICAL: Stop the intro music so the user can listen to the track
          
          // Reset scroll to top
          if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
          }
      }
  }, [isOpen, savedReason, pause, song]);

  // If not open, do not render ANYTHING to the DOM (Performance & Audio Safety)
  if (!isOpen || !song) return null;

  const t = TRANSLATIONS[lang];

  const handleVoteClick = () => {
      if (isVoted) {
          onVote(song.id); // Toggle off (Unvote)
      } else {
          setVoteStage('reason'); // Start vote flow
      }
  };

  const handleConfirmVote = () => {
      onVote(song.id, reason);
      setVoteStage('view');
  };

  // Check if we have a YouTube source for the player
  let finalYoutubeId = song.youtubeId;
  // If no explicit ID, try to extract from Custom URL (backward compatibility)
  if (!finalYoutubeId && song.customAudioUrl) {
      finalYoutubeId = extractYouTubeId(song.customAudioUrl);
  }
  
  // Prioritize YouTube if ID exists
  const isYouTubeSource = !!finalYoutubeId;

  // VISIBILITY LOGIC:
  // If it's YouTube, we MUST show the iframe, otherwise iOS pauses it.
  // We cannot hide it behind an image.
  // If it's NOT YouTube (Drive/MP3), we show the Album Cover (Artist Image).
  
  // Ensure origin is valid (client-side only)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-fade-in overflow-hidden">
      
      {/* TOP NAVIGATION (Floating) */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             {/* Left empty or for future use */}
          </div>
          <button 
              onClick={onClose}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md active:scale-90 transition-all hover:bg-white hover:text-black border border-white/10"
          >
              <ArrowLeftIcon className="w-5 h-5" />
          </button>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          
          {/* 1. MEDIA PLAYER AREA (Pinned Top Visual) */}
          <div className="w-full aspect-square md:aspect-video bg-black relative shadow-2xl shrink-0 sticky top-0 z-10 overflow-hidden">
              {isYouTubeSource ? (
                  // YOUTUBE MODE: Must be Iframe
                  <iframe 
                      key={song.id} 
                      className="w-full h-full absolute inset-0 z-20"
                      src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&color=white&iv_load_policy=3&origin=${origin}`}
                      title={song.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      loading="eager"
                  ></iframe>
              ) : (
                  // AUDIO MODE: Static Cover Image
                  <div className="relative w-full h-full">
                      <img src={defaultCover} className="w-full h-full object-cover object-top opacity-90" alt="Album Cover" />
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
                  </div>
              )}
          </div>

          {/* 2. AUDIO CONTROLS - FLOATING OVERLAP (Only for Non-YouTube) */}
          {!isYouTubeSource && (
              <div className="relative z-20 -mt-10 px-6 mb-6">
                     <div className="glass-panel p-4 rounded-md shadow-lg border-gold/20 flex items-center justify-center bg-[#111]/80 backdrop-blur-xl">
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
          )}

          {/* 3. SONG INFO, LYRICS & CREDITS */}
          <div className={`px-6 py-6 pb-48 max-w-xl mx-auto text-center relative z-20 bg-[#050505] min-h-[50vh] ${isYouTubeSource ? 'mt-4' : ''}`}>
              
              {/* Title Section */}
              <div className="mb-12 animate-slide-up">
                  <p className="text-[10px] text-gold font-mono uppercase tracking-[0.2em] mb-3 opacity-80">
                      Selection #{String(song.id).padStart(2,'0')}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl italic leading-tight mb-4 text-white drop-shadow-lg">
                      {song.title}
                  </h2>
              </div>

              {/* LYRICS SECTION */}
              <div className="mb-16 animate-slide-up space-y-8" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="h-px w-6 bg-white"></div>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-light">{t.lyrics}</span>
                      <div className="h-px w-6 bg-white"></div>
                  </div>
                  
                  <div className="select-none font-serif text-gray-300 text-sm md:text-base leading-[2.2] whitespace-pre-wrap tracking-wide border-l-2 border-gold/20 pl-6 md:pl-0 md:border-l-0 md:text-center opacity-90 pb-8">
                      {song.lyrics || <p className="text-gray-600 italic font-light">~ 純音樂 / 歌詞整理中 ~</p>}
                  </div>
              </div>

              {/* CREDITS SECTION */}
              <div className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                   <div className="flex items-center justify-center gap-4 mb-6 opacity-40">
                      <div className="h-px w-6 bg-white"></div>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-light">{t.credits}</span>
                      <div className="h-px w-6 bg-white"></div>
                  </div>
                  <div className="select-none font-sans text-gray-500 text-[10px] md:text-xs leading-relaxed whitespace-pre-wrap uppercase tracking-widest">
                      {song.credits || "Production: Willwi Music\nConcept: Beloved 2026"}
                  </div>
              </div>
          </div>
      </div>

      {/* 4. ACTION BAR (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 w-full z-40">
          {/* Gradient to fade out content behind the bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505] to-transparent pointer-events-none h-32 -top-32"></div>
          
          <div className="bg-[#111]/90 border-t border-white/10 p-5 backdrop-blur-xl relative z-50 safe-area-bottom">
              <div className="max-w-md mx-auto">
                  {voteStage === 'view' ? (
                      <div className="flex flex-col gap-3">
                          <button
                              onClick={handleVoteClick}
                              // Enable button if Voted OR (Not Voted AND Can Vote)
                              disabled={!isVoted && !canVote}
                              className={`
                                  w-full py-4 uppercase tracking-[0.2em] text-[10px] font-bold rounded-[2px] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
                                  ${isVoted 
                                      ? 'bg-transparent border border-gold text-gold hover:bg-gold hover:text-black' 
                                      : canVote 
                                          ? 'bg-white text-black hover:bg-gold hover:text-black hover:scale-[1.01]'
                                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                  }
                              `}
                          >
                              {isVoted ? <><CheckIcon className="w-4 h-4" /> {t.voted}</> : <><HeartIcon className={`w-4 h-4 ${canVote?'fill-current':''}`} /> {t.voteForThis}</>}
                          </button>
                          
                          {isVoted && savedReason && (
                              <p className="text-center text-[9px] text-gray-500 truncate px-4 animate-fade-in">
                                  <span className="uppercase tracking-widest mr-2 opacity-50">Note</span> 
                                  <span className="text-gold italic font-serif">"{savedReason}"</span>
                              </p>
                          )}
                      </div>
                  ) : (
                      <div className="animate-slide-up">
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-white font-serif italic text-lg">{t.tellUsWhy}</h3>
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest">Optional</span>
                          </div>
                          <textarea 
                              autoFocus
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder={t.reasonPlaceholder}
                              className="w-full bg-[#050505] border border-white/20 rounded-[2px] p-3 text-sm text-white placeholder-gray-600 focus:border-gold focus:outline-none h-20 mb-3 resize-none font-serif"
                          />
                          <div className="flex gap-3">
                              <button onClick={() => setVoteStage('view')} className="flex-1 py-3 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white border border-transparent hover:border-white/20 rounded-[2px]">{t.cancel}</button>
                              <button onClick={handleConfirmVote} className="flex-[2] py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold rounded-[2px] shadow-lg">{t.confirmSelection}</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
