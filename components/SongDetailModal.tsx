
import React, { useState, useEffect } from 'react';
import { Song, Language } from '../types';
import { TRANSLATIONS, getYouTubeThumbnail } from '../constants';
import AudioPlayer from './AudioPlayer';
import { useAudio } from './AudioContext';
import { CheckIcon, HeartIcon } from './Icons';

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
  const { pause } = useAudio(); // Access global audio control

  useEffect(() => {
      if (isOpen) {
          setVoteStage('view');
          setReason(savedReason || '');
          // CRITICAL: Pause any background music (Intro) when opening the modal
          pause();
      }
  }, [isOpen, savedReason, pause]);

  if (!isOpen || !song) return null;

  const t = TRANSLATIONS[lang];

  const handleVoteClick = () => {
      if (isVoted) {
          // Unvote directly
          onVote(song.id);
      } else {
          // Go to reason stage
          setVoteStage('reason');
      }
  };

  const handleConfirmVote = () => {
      onVote(song.id, reason);
      setVoteStage('view');
  };

  // Determine if we are in YouTube Mode (Preferred)
  const isYouTube = !!song.youtubeId;
  
  // Smart Image Logic
  const displayImage = song.customImageUrl 
      ? song.customImageUrl 
      : (isYouTube ? getYouTubeThumbnail(song.youtubeId!) : defaultCover);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-xl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose}
      />

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-[#000] md:border border-white/10 md:rounded-lg overflow-hidden flex flex-col shadow-2xl animate-fade-in">
         
         {/* --- CONTENT AREA (SCROLLABLE) --- */}
         <div className="flex-1 overflow-y-auto relative no-scrollbar bg-black">
            
            {/* Header Media Area (Theater Mode) */}
            <div className={`relative w-full aspect-video bg-black flex items-center justify-center group sticky top-0 z-20 shadow-2xl border-b border-white/5`}>
                {isYouTube ? (
                    <div className="w-full h-full relative">
                        <iframe 
                            className="w-full h-full relative z-10"
                            src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&controls=1&fs=1&enablejsapi=1&origin=${window.location.origin}`}
                            title={song.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <>
                        {/* Fallback for Audio-Only tracks if any */}
                        <img 
                            src={displayImage} 
                            alt={song.title} 
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                            <div onClick={(e) => { e.stopPropagation(); }}>
                                <AudioPlayer 
                                    id={song.id}
                                    driveId={song.driveId}
                                    src={song.customAudioUrl}
                                    title={song.title}
                                    variant="featured"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-all backdrop-blur-sm border border-white/10"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="px-8 pb-40 pt-10">
                 {/* Title Section */}
                 <div className="mb-10 text-center">
                    <p className="text-[10px] text-gold font-mono uppercase tracking-[0.2em] mb-3 opacity-80">Track {String(song.id).padStart(2,'0')}</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-white italic leading-tight tracking-wide mb-4">{song.title}</h2>
                    {isYouTube && (
                        <div className="flex items-center justify-center gap-3">
                            <span className="px-2 py-0.5 border border-red-900/50 bg-red-900/10 rounded text-[9px] text-red-500 uppercase tracking-widest">Studio Live</span>
                            <a 
                                href={`https://youtu.be/${song.youtubeId}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] text-gray-500 hover:text-white uppercase tracking-wider underline underline-offset-4 decoration-gray-700 transition-colors"
                            >
                                {t.watchOnYoutube}
                            </a>
                        </div>
                    )}
                 </div>

                {/* Lyrics Section */}
                {song.lyrics && (
                    <div className="mb-10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[1px] bg-white/20"></div>
                        <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-6 text-center pt-8">{t.lyrics}</h3>
                        <p className="font-serif text-gray-300 text-sm leading-loose whitespace-pre-wrap opacity-90 text-center">
                            {song.lyrics}
                        </p>
                    </div>
                )}

                {/* Credits Section */}
                {song.credits && (
                    <div className="mb-8 relative">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[1px] bg-white/20"></div>
                        <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-6 text-center pt-8">{t.credits}</h3>
                        <p className="font-sans text-gray-500 text-[10px] leading-relaxed whitespace-pre-wrap text-center max-w-sm mx-auto uppercase tracking-wide">
                            {song.credits}
                        </p>
                    </div>
                )}
            </div>
         </div>

         {/* --- BOTTOM ACTION BAR (FIXED) --- */}
         <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-10 pb-8 px-6 z-30 pointer-events-none">
             <div className="pointer-events-auto bg-[#111] border border-white/10 rounded-lg p-5 shadow-2xl backdrop-blur-xl">
                 
                 {/* MODE 1: Viewing / Voting Button */}
                 {voteStage === 'view' && (
                    <div className="flex flex-col gap-4">
                         {/* Playback Controls (Only show scrubbing bar for MP3s) */}
                         {!isYouTube && (
                            <div className="w-full">
                                <AudioPlayer 
                                    id={song.id}
                                    driveId={song.driveId}
                                    src={song.customAudioUrl}
                                    title={song.title}
                                    showControls={true} 
                                />
                            </div>
                         )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleVoteClick}
                                disabled={!isVoted && !canVote}
                                className={`
                                    flex-1 py-4 uppercase tracking-[0.2em] text-[10px] font-bold rounded-[2px] transition-all duration-300 flex items-center justify-center gap-3
                                    ${isVoted 
                                        ? 'bg-transparent border border-gold text-gold hover:bg-gold hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                                        : canVote 
                                            ? 'bg-white text-black hover:bg-gold hover:text-black hover:scale-[1.02]'
                                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isVoted ? (
                                    <>
                                        <CheckIcon className="w-4 h-4" />
                                        {t.voted}
                                    </>
                                ) : (
                                    <>
                                        <HeartIcon className={`w-4 h-4 ${canVote ? 'fill-current' : ''}`} />
                                        {t.voteForThis}
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Show saved reason if voted */}
                        {isVoted && savedReason && (
                            <div className="text-center pt-2">
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider mr-2">Reason:</span>
                                <span className="text-[10px] text-gold italic font-serif">"{savedReason}"</span>
                            </div>
                        )}
                    </div>
                 )}

                 {/* MODE 2: Reason Input */}
                 {voteStage === 'reason' && (
                     <div className="animate-slide-up">
                         <h3 className="text-center text-white font-serif italic text-lg mb-4">{t.tellUsWhy}</h3>
                         <textarea 
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t.reasonPlaceholder}
                            className="w-full bg-[#050505] border border-white/20 rounded-[2px] p-3 text-sm text-white placeholder-gray-600 focus:border-gold focus:outline-none h-20 mb-4 resize-none"
                         />
                         <div className="flex gap-3">
                             <button 
                                onClick={() => setVoteStage('view')}
                                className="flex-1 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white border border-transparent hover:border-white/20 rounded-[2px]"
                             >
                                 {t.cancel}
                             </button>
                             <button 
                                onClick={handleConfirmVote}
                                className="flex-[2] py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold rounded-[2px]"
                             >
                                 {t.confirmSelection}
                             </button>
                         </div>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};
