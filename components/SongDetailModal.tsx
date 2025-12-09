
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
          pause(); // Stop background music
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
      return () => {
          document.body.style.overflow = '';
      };
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

  let finalYoutubeId = song.youtubeId;
  if (!finalYoutubeId && song.customAudioUrl) {
      finalYoutubeId = extractYouTubeId(song.customAudioUrl);
  }
  
  const isYouTubeSource = !!finalYoutubeId;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col w-full h-full safe-area-bottom animate-fade-in">
      
      {/* HEADER: Minimalist */}
      <div className="absolute top-0 left-0 w-full p-6 z-[120] flex justify-between items-start pointer-events-none">
          <div className="text-[10px] text-white/40 font-serif tracking-widest uppercase pointer-events-auto">
              Selection No.{String(song.id).padStart(2,'0')}
          </div>
          <button 
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent border border-white/10 text-white hover:border-white hover:bg-white hover:text-black transition-all duration-500 pointer-events-auto backdrop-blur-md"
          >
              <ArrowLeftIcon className="w-5 h-5" />
          </button>
      </div>

      {/* MAIN SCROLL AREA */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto w-full bg-black no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
          {/* VISUAL AREA (Full Height on Mobile, Split on Desktop) */}
          <div className="min-h-screen flex flex-col md:flex-row">
              
              {/* LEFT / TOP: MEDIA PLAYER */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-[#050505] flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative group">
                  {isYouTubeSource ? (
                      <div className="w-full h-full relative">
                           {/* ERROR 153 FIX: Simplified URL params, removed 'origin' */}
                           <iframe 
                              key={song.id} 
                              className="w-full h-full object-cover"
                              src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1&playsinline=1&rel=0&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1`}
                              title={song.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                          ></iframe>
                          {/* Aesthetic overlay to prevent harsh YouTube interface, fades out on hover */}
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                      </div>
                  ) : (
                      <div className="relative w-full h-full">
                          <img src={defaultCover} className="w-full h-full object-cover opacity-40 grayscale" alt="Cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full max-w-sm px-8">
                                    <AudioPlayer 
                                        id={song.id} 
                                        driveId={song.driveId} 
                                        src={song.customAudioUrl} 
                                        title={song.title} 
                                        variant="featured" 
                                        showControls={true} 
                                    />
                                </div>
                          </div>
                      </div>
                  )}
              </div>

              {/* RIGHT / BOTTOM: INFO & ACTIONS */}
              <div className="w-full md:w-1/2 min-h-[50vh] md:h-screen flex flex-col justify-center bg-black p-8 md:p-20 space-y-12">
                  
                  <div className="space-y-4 animate-slide-up">
                      <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight italic">
                          {song.title}
                      </h2>
                      <div className="h-[1px] w-12 bg-gold"></div>
                  </div>

                  {/* LYRICS & CREDITS */}
                  <div className="space-y-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                       <div className="space-y-4">
                           <span className="text-[9px] text-gold uppercase tracking-[0.3em] block">{t.lyrics}</span>
                           <p className="font-serif text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                               {song.lyrics || "Instrumental / Lyrics Unavailable"}
                           </p>
                       </div>
                       
                       <div className="space-y-4">
                           <span className="text-[9px] text-gold uppercase tracking-[0.3em] block">{t.credits}</span>
                           <p className="font-sans text-gray-600 text-[10px] uppercase tracking-widest leading-relaxed whitespace-pre-wrap">
                               {song.credits || "WILLWI MUSIC PRODUCTION"}
                           </p>
                       </div>
                  </div>

                  {/* VOTE INTERACTION */}
                  <div className="pt-8 border-t border-white/5 animate-slide-up" style={{ animationDelay: '200ms' }}>
                      {voteStage === 'view' ? (
                          <button
                              onClick={handleVoteClick}
                              disabled={!isVoted && !canVote}
                              className={`
                                  w-full py-6 uppercase tracking-[0.3em] text-[10px] font-medium transition-all duration-500 border
                                  ${isVoted 
                                      ? 'border-gold text-gold bg-gold/5' 
                                      : canVote 
                                          ? 'border-white/20 text-white hover:bg-white hover:text-black hover:border-white'
                                          : 'border-white/5 text-gray-700 cursor-not-allowed'
                                  }
                              `}
                          >
                              <div className="flex items-center justify-center gap-4">
                                  {isVoted ? (
                                      <><span>{t.voted}</span> <CheckIcon className="w-4 h-4" /></>
                                  ) : (
                                      <><span>{t.voteForThis}</span> <HeartIcon className={`w-4 h-4 ${canVote?'':'opacity-20'}`} /></>
                                  )}
                              </div>
                          </button>
                      ) : (
                          <div className="space-y-6">
                              <p className="font-serif text-lg italic text-white text-center">{t.tellUsWhy}</p>
                              <textarea 
                                  autoFocus
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  placeholder={t.reasonPlaceholder}
                                  className="w-full bg-transparent border-b border-white/20 p-4 text-center text-sm text-white focus:border-gold outline-none h-24 resize-none font-serif placeholder-gray-700"
                              />
                              <div className="flex gap-4">
                                  <button onClick={() => setVoteStage('view')} className="flex-1 py-4 text-[9px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{t.cancel}</button>
                                  <button onClick={handleConfirmVote} className="flex-1 py-4 bg-white text-black text-[9px] uppercase tracking-widest hover:bg-gold transition-colors">{t.confirmSelection}</button>
                              </div>
                          </div>
                      )}
                      
                      {isVoted && savedReason && voteStage === 'view' && (
                          <p className="mt-6 text-center text-[11px] text-gray-500 font-serif italic">
                              "{savedReason}"
                          </p>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
