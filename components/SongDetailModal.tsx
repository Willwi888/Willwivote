
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
  
  // Ref to scroll the lyrics container back to top on open
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          pause(); // Stop background music to focus on track
          if (lyricsContainerRef.current) lyricsContainerRef.current.scrollTop = 0;
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
  // ONLY show audio player if there is actually a URL or Drive ID to play.
  // This prevents the "fake player" appearance for songs without audio.
  const hasAudio = (song.customAudioUrl && song.customAudioUrl.trim() !== '') || (song.driveId && song.driveId.trim() !== '');

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] w-full h-full flex flex-col md:flex-row animate-fade-in font-sans">
      
      {/* ==========================================
          LEFT PANEL: VISUAL (FIXED, NON-SCROLLING) 
          ========================================== */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-full relative bg-black border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 overflow-hidden">
          
          {/* Back Button (Absolute Top Left) */}
          <div className="absolute top-8 left-8 z-50 mix-blend-difference">
             <button 
                  onClick={onClose}
                  className="group flex items-center gap-4 text-white/50 hover:text-white transition-all duration-500"
              >
                  <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.back}
                  </span>
              </button>
          </div>

          {/* Visual Content */}
          <div className="w-full h-full relative">
              {isYouTubeSource ? (
                  <>
                    <iframe 
                        key={song.id} 
                        className="w-full h-full object-cover scale-[1.01]" // Slight scale to prevent borders
                        src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=1&playsinline=1&rel=0&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&loop=1`}
                        title={song.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    {/* Cinematic Vignette Overlay - Important for atmosphere */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/20"></div>
                  </>
              ) : (
                  <>
                      <img src={defaultCover} className="w-full h-full object-cover opacity-80" alt="Cover" />
                      <div className="absolute inset-0 bg-black/40"></div>
                      
                      {/* Centered Player for Audio-Only Tracks - ONLY IF AUDIO EXISTS */}
                      {hasAudio && (
                          <div className="absolute inset-0 flex items-center justify-center p-12">
                                <AudioPlayer 
                                    id={song.id} 
                                    driveId={song.driveId} 
                                    src={song.customAudioUrl} 
                                    title={song.title} 
                                    variant="featured" 
                                    showControls={true} 
                                />
                          </div>
                      )}
                  </>
              )}
          </div>
      </div>

      {/* ==========================================
          RIGHT PANEL: TYPOGRAPHY (INDEPENDENT SCROLL) 
          ========================================== */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-full relative bg-[#0a0a0a] flex flex-col">
          
          {/* Scrollable Text Area */}
          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar relative"
          >
              <div className="min-h-full flex flex-col p-8 md:p-24">
                  
                  {/* Song Header */}
                  <div className="mb-20 space-y-6 animate-slide-up">
                      <div className="flex items-center gap-4">
                          <div className="h-[1px] w-8 bg-gold/50"></div>
                          <div className="text-[10px] text-gold uppercase tracking-[0.4em] font-medium">
                              No.{String(song.id).padStart(2,'0')}
                          </div>
                      </div>
                      
                      <h2 className="font-serif text-4xl md:text-6xl text-white italic leading-none tracking-tight opacity-90">
                          {song.title}
                      </h2>
                  </div>

                  {/* Lyrics - Editorial Layout */}
                  <div className="space-y-12 animate-slide-up flex-grow" style={{ animationDelay: '150ms' }}>
                       <div className="relative">
                           {/* Decorative vertical line */}
                           <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden md:block"></div>
                           
                           <p className="font-serif text-gray-400 text-sm md:text-[15px] leading-[2.8] tracking-[0.05em] whitespace-pre-wrap md:pl-10 mix-blend-plus-lighter">
                               {song.lyrics || "..."}
                           </p>
                       </div>
                       
                       {/* Credits - Subtle */}
                       <div className="pt-20 md:pl-10 space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-700">
                           <div className="w-8 h-[1px] bg-white/20 mb-4"></div>
                           <p className="font-mono text-gray-500 text-[9px] uppercase tracking-[0.2em] leading-relaxed whitespace-pre-wrap">
                               {song.credits || "MUSIC PRODUCTION BY WILLWI"}
                           </p>
                       </div>
                  </div>

                  {/* Bottom Spacer to ensure text clears the vote button */}
                  <div className="h-40"></div>
              </div>
          </div>

          {/* Sticky Bottom Vote Action - Minimalist */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-20 pb-0 z-20">
              <div className="border-t border-white/10 bg-[#050505]">
                  {voteStage === 'view' ? (
                      <button
                          onClick={handleVoteClick}
                          disabled={!isVoted && !canVote}
                          className={`
                              group w-full py-8 flex items-center justify-center gap-4 transition-all duration-500
                              ${isVoted ? 'text-gold' : canVote ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}
                          `}
                      >
                          {isVoted ? (
                              <>
                                  <span className="text-[10px] uppercase tracking-[0.4em] font-medium">{t.voted}</span>
                                  <CheckIcon className="w-4 h-4" />
                              </>
                          ) : (
                              <>
                                  <span className="text-[10px] uppercase tracking-[0.4em] font-medium group-hover:tracking-[0.5em] transition-all duration-500">
                                      {canVote ? t.voteForThis : "Selection Full"}
                                  </span>
                                  <HeartIcon className={`w-4 h-4 ${canVote ? '' : 'opacity-20'}`} />
                              </>
                          )}
                      </button>
                  ) : (
                      // Reason Input Mode
                      <div className="p-8 animate-slide-up bg-[#0a0a0a]">
                          <p className="font-serif text-xs italic text-gray-400 text-center mb-6">{t.tellUsWhy}</p>
                          <textarea 
                              autoFocus
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder={t.reasonPlaceholder}
                              className="w-full bg-transparent border-b border-white/20 py-2 text-center text-sm text-white focus:border-gold outline-none h-12 resize-none font-serif placeholder-gray-700 mb-6 transition-colors"
                          />
                          <div className="flex justify-center gap-12">
                              <button onClick={() => setVoteStage('view')} className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors">{t.cancel}</button>
                              <button onClick={handleConfirmVote} className="text-[9px] font-bold uppercase tracking-widest text-white hover:text-gold transition-colors">{t.confirmSelection}</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
