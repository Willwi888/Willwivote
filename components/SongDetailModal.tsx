
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
          // CRITICAL: Pause any background music (Intro or MP3s) when opening the modal
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

  // Determine if we are in YouTube Mode
  const isYouTube = !!song.youtubeId;
  
  // Smart Image Logic: Use Custom -> YouTube Thumbnail -> Default Cover
  const displayImage = song.customImageUrl 
      ? song.customImageUrl 
      : (isYouTube ? getYouTubeThumbnail(song.youtubeId!) : defaultCover);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-sm overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-fade-in">
         
         {/* --- CONTENT AREA (SCROLLABLE) --- */}
         <div className="flex-1 overflow-y-auto relative no-scrollbar bg-[#0a0a0a]">
            
            {/* Header Media Area (Video or Image) */}
            <div className={`relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group`}>
                {isYouTube ? (
                    <div className="w-full h-full relative">
                        {/* Background blur for loading state */}
                        <div 
                           className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110 pointer-events-none"
                           style={{ backgroundImage: `url(${displayImage})` }}
                        ></div>

                        <iframe 
                            className="w-full h-full relative z-10"
                            // UPDATED PARAMETERS FOR SOUND
                            // mute=0: Try to unmute
                            // autoplay=1: Try to autoplay
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
                        <img 
                            src={displayImage} 
                            alt={song.title} 
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
                        
                        {/* Main Player Overlay (Only for MP3s) */}
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
                    className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-all backdrop-blur-sm border border-white/10"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="px-8 pb-32 pt-6">
                 {/* Title Section */}
                 <div className="mb-8 text-center">
                    <p className="text-[10px] text-gold font-mono uppercase tracking-widest mb-2">Track {String(song.id).padStart(2,'0')}</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-white italic leading-tight">{song.title}</h2>
                    {isYouTube && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Official Audio</p>
                        </div>
                    )}
                 </div>

                {/* Lyrics Section */}
                {song.lyrics && (
                    <div className="mb-8 border-t border-white/5 pt-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">{t.lyrics}</h3>
                        <p className="font-serif text-gray-300 text-sm leading-loose whitespace-pre-wrap opacity-90 text-center">
                            {song.lyrics}
                        </p>
                    </div>
                )}

                {/* Credits Section */}
                {song.credits && (
                    <div className="mb-8 border-t border-white/5 pt-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">{t.credits}</h3>
                        <p className="font-sans text-gray-400 text-xs leading-relaxed whitespace-pre-wrap text-center max-w-sm mx-auto">
                            {song.credits}
                        </p>
                    </div>
                )}
            </div>
         </div>

         {/* --- BOTTOM ACTION BAR (FIXED) --- */}
         <div className="absolute bottom-0 left-0 w-full bg-[#111] border-t border-white/10 p-6 z-30">
             
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
                                flex-1 py-4 uppercase tracking-[0.2em] text-xs font-bold rounded-sm transition-all duration-300 flex items-center justify-center gap-2
                                ${isVoted 
                                    ? 'bg-transparent border border-gold text-gold hover:bg-gold hover:text-black' 
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
                        <p className="text-center text-[10px] text-gray-500 italic">"{savedReason}"</p>
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
                        className="w-full bg-[#050505] border border-white/20 rounded-sm p-3 text-sm text-white placeholder-gray-600 focus:border-gold focus:outline-none h-24 mb-4 resize-none"
                     />
                     <div className="flex gap-3">
                         <button 
                            onClick={() => setVoteStage('view')}
                            className="flex-1 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white border border-transparent hover:border-white/20 rounded-sm"
                         >
                             {t.cancel}
                         </button>
                         <button 
                            onClick={handleConfirmVote}
                            className="flex-[2] py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold rounded-sm"
                         >
                             {t.confirmSelection}
                         </button>
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};
