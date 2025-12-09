
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

  // 1. Force Stop Background Audio & Reset Scroll
  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          
          // CRITICAL: Force pause immediately to release audio focus for YouTube
          pause(); 
          
          if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
          }
      }
  }, [isOpen, savedReason, song]);

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

  // 2. ROBUST ID EXTRACTION (Fail-safe)
  // Even if storage failed, we try to extract right here.
  let finalYoutubeId = song.youtubeId;
  if (!finalYoutubeId && song.customAudioUrl) {
      // Direct regex check in component to be absolutely sure
      const match = song.customAudioUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*).*/);
      if (match && match[1]) {
          finalYoutubeId = match[1];
      } else {
          // Fallback to shared helper
          finalYoutubeId = extractYouTubeId(song.customAudioUrl);
      }
  }
  
  const isYouTubeSource = !!finalYoutubeId;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] animate-fade-in">
      
      {/* TOP BAR (Close Button) */}
      <div className="flex-none flex justify-between items-center p-4 z-50 bg-[#050505] border-b border-white/5">
          <div className="text-[10px] text-gray-500 font-mono tracking-widest">
              SELECTION #{String(song.id).padStart(2,'0')}
          </div>
          <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:scale-90 transition-all hover:bg-white hover:text-black border border-white/10"
          >
              <ArrowLeftIcon className="w-5 h-5" />
          </button>
      </div>

      {/* SCROLLABLE CONTENT - STANDARD FLOW (No Sticky) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32">
          
          {/* MEDIA PLAYER SECTION */}
          <div className="w-full bg-black relative">
              {isYouTubeSource ? (
                  // YOUTUBE MODE
                  // aspect-video enforces 16:9 so no black bars
                  <div className="w-full aspect-video relative bg-black shadow-2xl">
                      <iframe 
                          key={song.id} 
                          className="absolute inset-0 w-full h-full z-10"
                          // autoplay=0 on mobile is safer. Let the user click play to guarantee audio context works.
                          src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&origin=${origin}`}
                          title={song.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                          allowFullScreen
                      ></iframe>
                  </div>
              ) : (
                  // AUDIO MODE
                  <div className="w-full aspect-square md:aspect-video relative">
                      <img src={defaultCover} className="w-full h-full object-cover object-top opacity-80" alt="Album Cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                      
                      {/* Audio Player Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-6 pb-12 flex justify-center">
                            <div className="glass-panel p-4 rounded-md shadow-lg border-gold/20 bg-[#111]/80 backdrop-blur-xl w-full max-w-md">
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

          {/* SONG INFO */}
          <div className="px-6 py-8 max-w-xl mx-auto text-center space-y-12">
              <div className="animate-slide-up">
                  <h2 className="font-serif text-3xl md:text-4xl italic leading-tight text-white drop-shadow-lg">
                      {song.title}
                  </h2>
              </div>

              {/* LYRICS */}
              <div className="animate-slide-up space-y-6" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="h-px w-6 bg-white"></div>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-light">{t.lyrics}</span>
                      <div className="h-px w-6 bg-white"></div>
                  </div>
                  
                  <div className="select-none font-serif text-gray-300 text-sm md:text-base leading-[2.2] whitespace-pre-wrap tracking-wide opacity-90">
                      {song.lyrics || <span className="text-gray-600 italic font-light">~ 純音樂 / 歌詞整理中 ~</span>}
                  </div>
              </div>

              {/* CREDITS */}
              <div className="animate-slide-up pb-12" style={{ animationDelay: '200ms' }}>
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

      {/* ACTION BAR (Fixed Bottom) */}
      <div className="flex-none w-full bg-[#111] border-t border-white/10 p-5 safe-area-bottom z-50">
          <div className="max-w-md mx-auto">
              {voteStage === 'view' ? (
                  <div className="flex flex-col gap-3">
                      <button
                          onClick={handleVoteClick}
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
  );
};
