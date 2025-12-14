
import React, { useState, useEffect, useRef } from 'react';
import { Song, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import AudioPlayer from './AudioPlayer';
import { useAudio } from './AudioContext';
import { CheckIcon, HeartIcon, ArrowLeftIcon, XIcon, PlayIcon, ExternalLinkIcon } from './Icons';
import { extractYouTubeId } from '../services/storage';
import { getAudioUrl } from '../constants';

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
  onNext?: () => void;
  onPrev?: () => void;
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
  savedReason,
  onNext,
  onPrev
}) => {
  const [voteStage, setVoteStage] = useState<'view' | 'reason'>('view');
  const [reason, setReason] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const { pause } = useAudio(); 
  
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          setShowFeedback(false);
          pause(); 
          if (lyricsContainerRef.current) lyricsContainerRef.current.scrollTop = 0;
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
      return () => {
          document.body.style.overflow = '';
      };
  }, [isOpen, savedReason, song]);

  useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft' && onPrev) onPrev();
          if (e.key === 'ArrowRight' && onNext) onNext();
          if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

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
      setShowFeedback(true);
      
      // Show feedback for 2 seconds before returning to view mode
      setTimeout(() => {
          setShowFeedback(false);
          setVoteStage('view');
      }, 2000);
  };

  let finalYoutubeId = song.youtubeId;
  // Fallback extraction if ID missing but URL exists
  if (!finalYoutubeId && song.customAudioUrl) {
      finalYoutubeId = extractYouTubeId(song.customAudioUrl);
  }
  
  const isYouTubeSource = !!finalYoutubeId;
  
  // Detect if the link is a Folder (Dropbox or Drive)
  const rawUrl = song.customAudioUrl || '';
  const isFolderLink = rawUrl.includes('/folders/') || rawUrl.includes('/drive/folders/') || rawUrl.includes('/fo/') || rawUrl.includes('/sh/');
  const finalAudioUrl = getAudioUrl(rawUrl);

  const hasAudioSource = Boolean(
      !isYouTubeSource && 
      !isFolderLink &&
      ((song.customAudioUrl && song.customAudioUrl.trim() !== '') || 
      (song.driveId && song.driveId.trim() !== ''))
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] w-full h-full flex flex-col md:flex-row animate-fade-in font-serif">
      
      {/* CLOSE BUTTON - Responsive Positioning (Top Right) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[120]">
           <button 
                onClick={onClose}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 text-white pl-3 pr-4 py-2 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
            >
                <XIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                    {t.close || "CLOSE"}
                </span>
            </button>
      </div>

      {/* Left Panel: Visual/Media */}
      <div className="w-full md:w-1/2 h-[45vh] md:h-full relative bg-black flex-shrink-0 group overflow-hidden">
          
          <div className="w-full h-full relative bg-black flex flex-col justify-center">
              {isYouTubeSource ? (
                  <>
                    <div className="relative w-full h-full bg-black">
                        <iframe 
                            key={song.id} 
                            className="w-full h-full object-contain" 
                            src={`https://www.youtube.com/embed/${finalYoutubeId}?autoplay=0&playsinline=1&rel=0&controls=1&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`}
                            title={song.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                        ></iframe>
                        {/* Fallback Overlay Button for Mobile Compatibility */}
                        <div className="absolute bottom-4 right-4 z-20 md:hidden">
                             <a 
                                href={`https://www.youtube.com/watch?v=${finalYoutubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-red-700 transition-colors"
                             >
                                 <PlayIcon className="w-3 h-3 fill-current" /> App 播放
                             </a>
                        </div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none border-r border-white/5 hidden md:block"></div>
                  </>
              ) : (
                  <>
                      {/* --- BREATHING IMAGE CONTAINER --- */}
                      <div className="absolute inset-0 overflow-hidden">
                         <div className="w-full h-full relative animate-pulse-slow">
                             {/* Overlay to darken slightly for better text contrast/mood */}
                             <div className="absolute inset-0 bg-black/30 z-10"></div>
                             
                             {/* The Image with Halo */}
                             <img 
                                src={defaultCover} 
                                className="w-full h-full object-cover opacity-80 scale-105" 
                                alt="Cover" 
                             />
                             
                             {/* Breathing Gold Border/Glow Effect */}
                             <div className="absolute inset-0 border-[0px] border-gold/0 animate-breathe-gold z-10 box-border pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
                         </div>
                      </div>

                      {/* --- CONTENT OVERLAY --- */}
                      
                      {isFolderLink ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center p-12 gap-6 z-20 text-center animate-fade-in">
                                <p className="text-gold text-xs uppercase tracking-widest mb-2 font-bold bg-black/50 px-4 py-2 rounded border border-gold/30">
                                    📁 Folder Link Detected
                                </p>
                                <a 
                                    href={song.customAudioUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-gold text-black px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center gap-3"
                                >
                                    <PlayIcon className="w-4 h-4" /> Open External Folder
                                </a>
                                <p className="text-gray-400 text-[10px] max-w-xs leading-loose bg-black/60 p-4 rounded">
                                    This link points to a <strong>folder</strong>, not a song file.<br/>
                                    Please open it to find the music.
                                </p>
                           </div>
                      ) : hasAudioSource ? (
                          // --- UPDATED PLAYER POSITIONING: justify-end + padding ---
                          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-24 px-6 md:px-12 z-20">
                                <div className="w-full max-w-md bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                    <AudioPlayer 
                                        id={song.id} 
                                        driveId={song.driveId} 
                                        src={song.customAudioUrl} 
                                        title={song.title} 
                                        variant="featured" 
                                        showControls={true} 
                                    />
                                    
                                    {/* --- STABILITY FALLBACK BUTTON --- */}
                                    <div className="mt-4 flex justify-center">
                                        <a 
                                            href={finalAudioUrl}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest transition-colors py-2 border-b border-transparent hover:border-gold/50"
                                            title="Click if audio is stuck or buffering too long"
                                        >
                                            <ExternalLinkIcon className="w-3 h-3" />
                                            {t.openInApp || "無法播放？開啟原檔"}
                                        </a>
                                    </div>
                                </div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                              <p className="text-gray-500 text-xs tracking-widest uppercase">No Audio Source</p>
                          </div>
                      )}
                  </>
              )}
          </div>
      </div>

      {/* Right Panel: Content (Lyrics & Credits) */}
      <div className="w-full md:w-1/2 h-[55vh] md:h-full relative bg-[#050505] flex flex-col border-l border-white/5">
          
          <div 
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar relative"
          >
              <div className="min-h-full flex flex-col p-8 md:p-20">
                  
                  {/* Header */}
                  <div className="mb-12 space-y-6 animate-slide-up pt-12 md:pt-0">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                         <div className="flex items-center gap-3">
                            {/* MOBILE BACK BUTTON: Added to solve "Missing Return Button" issue on mobile */}
                            <button 
                                onClick={onClose}
                                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>

                            <span className="text-gold text-lg">✦</span>
                            <div className="text-xs text-gold/80 uppercase tracking-[0.3em] font-sans font-bold">
                                Track {String(song.id).padStart(2,'0')}
                            </div>
                         </div>
                         <div className="flex gap-4">
                            {onPrev && (
                                <button onClick={onPrev} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full" title="Previous">
                                    <ArrowLeftIcon className="w-4 h-4" />
                                </button>
                            )}
                            {onNext && (
                                <button onClick={onNext} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full" title="Next">
                                    <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                                </button>
                            )}
                         </div>
                      </div>
                      
                      <h2 className="font-serif text-3xl md:text-6xl text-white tracking-wide leading-tight text-metallic">
                          {song.title}
                      </h2>
                  </div>

                  {/* Lyrics & Credits Area */}
                  <div className="space-y-12 animate-slide-up flex-grow" style={{ animationDelay: '150ms' }}>
                       
                       {/* LYRICS */}
                       <div className="relative pl-4 md:pl-8 border-l border-white/10">
                           <h4 className="text-[10px] text-gold uppercase tracking-[0.3em] mb-6 font-bold">Lyrics</h4>
                           <p className="font-serif text-gray-300 text-sm md:text-base leading-[2.5] tracking-[0.05em] whitespace-pre-wrap">
                               {song.lyrics || "Lyrics unavailable..."}
                           </p>
                       </div>
                       
                       {/* CREDITS & ACKNOWLEDGMENTS - NOW VISUALLY DISTINCT */}
                       <div className="relative pl-4 md:pl-8 border-l border-gold/30 bg-white/[0.02] p-6 rounded-r mt-8">
                           <h4 className="text-[10px] text-gold uppercase tracking-[0.3em] mb-4 font-bold">Credits & Acknowledgments</h4>
                           <p className="font-sans text-gray-400 text-xs uppercase tracking-[0.1em] leading-loose whitespace-pre-wrap">
                               {song.credits || "PRODUCED BY WILLWI"}
                           </p>
                       </div>
                  </div>

                  <div className="h-32"></div>
              </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 w-full z-20">
              <div className="bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-6 md:p-8 min-h-[140px] flex flex-col justify-center transition-all duration-300">
                  {voteStage === 'view' ? (
                      <button
                          onClick={handleVoteClick}
                          disabled={!isVoted && !canVote}
                          className={`
                              group w-full py-4 flex items-center justify-center gap-4 transition-all duration-500 border
                              ${isVoted 
                                  ? 'bg-gold border-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]' 
                                  : canVote 
                                    ? 'border-white/20 text-gray-300 hover:border-gold hover:text-gold hover:bg-white/5' 
                                    : 'border-white/5 text-gray-700 cursor-not-allowed'}
                          `}
                      >
                          {isVoted ? (
                              <>
                                  <span className="text-xl font-sans uppercase tracking-[0.2em] font-bold">VOTED</span>
                                  <CheckIcon className="w-5 h-5" />
                              </>
                          ) : (
                              <>
                                  <span className="text-xl font-sans uppercase tracking-[0.4em] font-bold group-hover:tracking-[0.5em] transition-all duration-500">
                                      {canVote ? "VOTE" : "SELECTION FULL"}
                                  </span>
                              </>
                          )}
                      </button>
                  ) : showFeedback ? (
                      // --- VISUAL FEEDBACK ANIMATION ---
                      <div className="animate-slide-up w-full flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mb-3 text-gold shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                              <CheckIcon className="w-6 h-6" />
                          </div>
                          <p className="text-white text-sm uppercase tracking-[0.2em] font-bold mb-1">
                              Vote Recorded
                          </p>
                          <p className="text-gold/60 text-[10px] tracking-widest uppercase font-serif italic">
                              {reason ? "Message Saved" : "Selection Confirmed"}
                          </p>
                      </div>
                  ) : (
                      <div className="animate-slide-up">
                          <p className="font-serif text-xs italic text-gray-400 text-center mb-4">{t.tellUsWhy}</p>
                          <input 
                              autoFocus
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder={t.reasonPlaceholder}
                              className="w-full bg-transparent border-b border-white/20 py-2 text-center text-sm text-white focus:border-gold outline-none h-10 font-serif placeholder-gray-700 mb-6 transition-colors"
                          />
                          <div className="flex justify-center gap-8">
                              <button onClick={() => setVoteStage('view')} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{t.cancel}</button>
                              <button onClick={handleConfirmVote} className="text-[10px] font-bold uppercase tracking-widest text-gold hover:text-white transition-colors">{t.confirmSelection}</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
