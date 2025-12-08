
import React from 'react';
import { Song, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import AudioPlayer from './AudioPlayer';

interface SongDetailModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onVote: (id: number) => void;
  isVoted: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  canVote: boolean;
  defaultCover: string;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({ 
  song, 
  isOpen, 
  onClose, 
  lang, 
  onVote, 
  isVoted,
  isPlaying,
  onTogglePlay,
  canVote,
  defaultCover
}) => {
  if (!isOpen || !song) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-sm overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-fade-in">
         {/* Header Image Area */}
         <div className="relative aspect-square sm:aspect-video w-full">
            <img 
                src={song.customImageUrl || defaultCover} 
                alt={song.title} 
                className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}>
                     <AudioPlayer 
                        driveId={song.driveId}
                        src={song.customAudioUrl}
                        isPlaying={isPlaying}
                        onToggle={() => {}} // Handled by wrapper
                        title={song.title}
                        variant="featured"
                     />
                </div>
            </div>

            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-8 space-y-8 relative no-scrollbar">
            <div>
                <h2 className="font-serif text-3xl text-white italic mb-2">{song.title}</h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Track {String(song.id).padStart(2,'0')}</p>
            </div>

            {/* Lyrics Section */}
            {song.lyrics && (
                <div>
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">{t.lyrics}</h3>
                    <p className="font-serif text-gray-300 text-sm leading-loose whitespace-pre-wrap opacity-90">
                        {song.lyrics}
                    </p>
                </div>
            )}

            {/* Credits Section */}
            {song.credits && (
                <div>
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">{t.credits}</h3>
                    <p className="font-sans text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
                        {song.credits}
                    </p>
                </div>
            )}
            
            {/* Fallback if no details */}
            {!song.lyrics && !song.credits && (
                <div className="text-center py-8 text-gray-600 italic font-serif opacity-50">
                    ~ Instrumental / No Text ~
                </div>
            )}
         </div>

         {/* Action Footer */}
         <div className="p-6 border-t border-white/5 bg-[#161616] flex items-center justify-between gap-4">
             <button
                onClick={() => onVote(song.id)}
                disabled={!isVoted && !canVote}
                className={`
                    flex-1 py-4 uppercase tracking-[0.2em] text-xs font-bold rounded-sm transition-all duration-300
                    ${isVoted 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : canVote 
                            ? 'bg-transparent border border-white/30 text-white hover:border-white hover:bg-white/5'
                            : 'bg-transparent border border-white/10 text-gray-600 cursor-not-allowed'
                    }
                `}
             >
                 {isVoted ? 'Selected' : 'Select'}
             </button>
         </div>
      </div>
    </div>
  );
};
