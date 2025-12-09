
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig, extractYouTubeId } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, getYouTubeThumbnail } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
const DEFAULT_FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb"; 
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

// --- COMMON COMPONENTS ---

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
    <div className="absolute top-6 right-6 z-50 flex gap-4">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] uppercase tracking-widest transition-colors ${lang === l ? 'text-white border-b border-white' : 'text-gray-400 hover:text-gray-200'} active:scale-95`}
            >
                {l}
            </button>
        ))}
    </div>
);

const Footer: React.FC<{ t: any; onAdmin: () => void }> = ({ t, onAdmin }) => (
    <footer className="absolute bottom-4 left-0 w-full py-4 text-center space-y-2 z-40">
        <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] opacity-80">{t.copyright}</p>
        <button 
            onClick={onAdmin}
            className="text-[9px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest opacity-50 hover:opacity-100 active:scale-95 p-2"
        >
            {t.managerLogin}
        </button>
    </footer>
);

const VoteReasonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    songTitle: string;
    t: any;
}> = ({ isOpen, onClose, onConfirm, songTitle, t }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-sm p-6 shadow-2xl animate-slide-up">
                <h3 className="text-white font-serif text-xl italic mb-2 text-center">{t.tellUsWhy}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-6">
                    {songTitle}
                </p>
                
                <textarea 
                    autoFocus
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.reasonPlaceholder}
                    className="w-full bg-[#050505] border border-white/20 rounded-sm p-3 text-sm text-white placeholder-gray-600 focus:border-gold focus:outline-none h-32 mb-6 resize-none"
                />
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white border border-transparent hover:border-white/20 rounded-sm"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={() => onConfirm(reason)}
                        className="flex-[2] py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold rounded-sm"
                    >
                        {t.confirmSelection}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- VIEWS ---

const IntroView: React.FC<{ 
    t: any; 
    introAudioId: string; 
    handleStart: () => void;
    lang: Language;
    setLang: (l: Language) => void;
    onAdmin: () => void;
}> = ({ t, introAudioId, handleStart, lang, setLang, onAdmin }) => {
    const { setBgImage } = useContext(BackgroundContext);
    const { playingId, isPlaying, playSong, pause, initializeAudio, error } = useAudio();
    const [isYtPlaying, setIsYtPlaying] = useState(false);
    
    // Check if Intro is a YouTube Link
    const introYoutubeId = extractYouTubeId(introAudioId);
    
    // Audio Context State (for MP3s)
    const isAudioPlaying = playingId === 'intro' && isPlaying;
    const isAudioError = playingId === 'intro' && error;

    const handleToggleIntro = async () => {
        if (introYoutubeId) {
            if (isYtPlaying) {
                const iframe = document.getElementById('intro-yt-iframe') as HTMLIFrameElement;
                iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                setIsYtPlaying(false);
            } else {
                const iframe = document.getElementById('intro-yt-iframe') as HTMLIFrameElement;
                iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                setIsYtPlaying(true);
            }
        } else {
            const m = await import('./constants');
            const url = m.getAudioUrl(introAudioId);
            playSong('intro', url, "Intro");
        }
    };

    const onEnterClick = () => {
        if (isYtPlaying && introYoutubeId) {
            const iframe = document.getElementById('intro-yt-iframe') as HTMLIFrameElement;
            iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            setIsYtPlaying(false);
        }
        initializeAudio();
        handleStart();
    };

    useEffect(() => {
      setBgImage(null);
      return () => setBgImage(null);
    }, [setBgImage]);

    return (
      <div className="relative flex flex-col min-h-screen w-full overflow-hidden items-center justify-center text-center">
        {/* FULL SCREEN BACKGROUND */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {introYoutubeId ? (
                 <div className={`absolute inset-0 transition-opacity duration-1000 ${isYtPlaying ? 'opacity-40' : 'opacity-20'} z-10 bg-black`}>
                     <iframe 
                        id="intro-yt-iframe"
                        className="w-full h-full object-cover pointer-events-none scale-150"
                        src={`https://www.youtube.com/embed/${introYoutubeId}?enablejsapi=1&autoplay=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${introYoutubeId}&playsinline=1&origin=${window.location.origin}`}
                        allow="autoplay; encrypted-media"
                        title="Intro Music"
                    />
                 </div>
            ) : (
                <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isAudioPlaying ? 'opacity-20' : 'opacity-40'} z-10`}>
                     <img 
                        src={ARTIST_IMAGE_URL} 
                        alt="Beloved Cover" 
                        className={`w-full h-full object-cover transition-transform duration-[20s] ease-in-out ${isAudioPlaying ? 'scale-110' : 'scale-100'}`}
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-20"></div>
        </div>

        <LangSwitcher lang={lang} setLang={setLang} />
        
        <FadeIn delay={200} className="relative z-30 flex flex-col items-center justify-center max-w-md px-6 w-full">
            <div className="mb-10 space-y-6">
                <span className="block text-[10px] uppercase tracking-[0.6em] text-gray-300 font-sans opacity-90">{t.subtitle}</span>
                <h1 className="font-serif text-6xl md:text-8xl text-white tracking-wider italic drop-shadow-2xl">Beloved</h1>
                <div className="h-px w-16 bg-white/40 mx-auto"></div>
                <h2 className="font-serif text-2xl text-gray-100 tracking-[0.2em] font-light drop-shadow-md">{t.title}</h2>
            </div>

            <button 
                onClick={handleToggleIntro}
                className={`
                    group w-20 h-20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm mb-12 transition-all duration-500 active:scale-90
                    ${(isAudioPlaying || isYtPlaying) ? 'bg-white text-black scale-110 border-white' : 'bg-black/20 text-white hover:bg-white/10 hover:scale-105'}
                    ${isAudioError ? 'border-red-500 bg-red-900/20' : ''}
                `}
            >
                {(isAudioPlaying || isYtPlaying) ? (
                    <div className="flex gap-1 h-6 items-center">
                         <span className="w-1 h-full bg-black animate-[pulse_1s_ease-in-out_infinite]"></span>
                         <span className="w-1 h-2/3 bg-black animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                         <span className="w-1 h-full bg-black animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                    </div>
                ) : isAudioError ? (
                    <span className="text-[8px] uppercase font-bold text-red-500">Retry</span>
                ) : (
                    <PlayIcon className="w-8 h-8 ml-1 opacity-90 group-hover:opacity-100" />
                )}
            </button>

            <button 
                onClick={onEnterClick}
                className="group relative px-14 py-4 bg-white/90 hover:bg-white text-black font-serif text-lg tracking-[0.3em] uppercase overflow-hidden transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 w-full md:w-auto"
            >
                <span className="relative z-10">{t.enter}</span>
            </button>
        </FadeIn>

        <Footer t={t} onAdmin={onAdmin} />
      </div>
    );
};

const AuthView: React.FC<{ 
    t: any; 
    user: User; 
    setUser: (u: User) => void; 
    handleLogin: (e: React.FormEvent) => void; 
    handleBack: () => void;
    lang: Language;
    setLang: (l: Language) => void;
}> = ({ t, user, setUser, handleLogin, handleBack, lang, setLang }) => (
    <div className="flex flex-col min-h-screen p-8 pt-24 relative max-w-[500px] mx-auto">
       <div className="absolute top-8 left-8 z-30">
           <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors p-2 active:scale-90">
               <ArrowLeftIcon />
           </button>
       </div>
       <LangSwitcher lang={lang} setLang={setLang} />
       <FadeIn className="flex-1 flex flex-col justify-center w-full z-20">
           <div className="text-center mb-10">
               <h2 className="font-serif text-3xl text-white mb-2 italic">Identify</h2>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.giftMessage}</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-1">
                   <label className="text-[10px] uppercase text-gray-600 tracking-widest ml-1">{t.name}</label>
                   <input 
                       required
                       type="text" 
                       value={user.name}
                       onChange={e => setUser({...user, name: e.target.value})}
                       className="w-full bg-transparent border-b border-gray-700 py-3 text-lg text-white placeholder-gray-800 focus:border-white outline-none transition-colors font-serif rounded-none"
                       placeholder="Name"
                   />
               </div>
               <div className="space-y-1">
                   <label className="text-[10px] uppercase text-gray-600 tracking-widest ml-1">{t.email}</label>
                   <input 
                       required
                       type="email" 
                       value={user.email}
                       onChange={e => setUser({...user, email: e.target.value})}
                       className="w-full bg-transparent border-b border-gray-700 py-3 text-lg text-white placeholder-gray-800 focus:border-white outline-none transition-colors font-serif rounded-none"
                       placeholder="email@address.com"
                   />
               </div>
               <button 
                   type="submit" 
                   disabled={!user.name || !user.email}
                   className="w-full mt-8 bg-white text-black py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
               >
                   {t.start}
               </button>
           </form>
       </FadeIn>
    </div>
);

const VotingView: React.FC<{ 
    t: any;
    songs: Song[];
    selectedIds: number[];
    MAX_VOTES: number;
    voteReasons: { [id: number]: string };
    onVoteRequest: (id: number) => void;
    handleSubmitVotes: () => void;
    handleBack: () => void;
    setDetailSongId: (id: number) => void;
}> = ({ t, songs, selectedIds, MAX_VOTES, voteReasons, onVoteRequest, handleSubmitVotes, handleBack, setDetailSongId }) => {
    const progress = (selectedIds.length / MAX_VOTES) * 100;
    
    return (
      <div className="min-h-screen pb-32 relative max-w-[500px] mx-auto">
           <div className="fixed top-0 left-0 w-full z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shadow-2xl">
               <div className="max-w-[500px] mx-auto px-6 py-5 flex items-center justify-between">
                   <button onClick={handleBack} className="text-gray-500 hover:text-white p-2 active:scale-90 transition-colors">
                       <ArrowLeftIcon className="w-5 h-5" />
                   </button>
                   <div className="text-center">
                       <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1">{t.selection}</h2>
                       <p className="text-[9px] text-gold font-mono">{selectedIds.length} <span className="text-gray-600">/</span> {MAX_VOTES}</p>
                   </div>
                   <div className="w-9" /> {/* Spacer */}
               </div>
               <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-700 ease-out opacity-70" style={{ width: `${progress}%`, left: `${(100-progress)/2}%` }}></div>
           </div>

           <div className="pt-28 px-0 space-y-1">
               <div className="text-center mb-10 px-8">
                   <p className="text-gray-500 text-[10px] leading-loose font-serif italic tracking-wide">{t.votingRule}</p>
               </div>

               {songs.map((song, index) => {
                   const isSelected = selectedIds.includes(song.id);
                   const isYouTube = !!song.youtubeId;
                   // Logic: Prefer Custom -> YouTube -> Default. 
                   // NOTE: If using YouTube, we show the thumbnail.
                   const thumbnail = song.customImageUrl || (isYouTube ? getYouTubeThumbnail(song.youtubeId!) : ARTIST_IMAGE_URL);
                   
                   return (
                       <FadeIn key={song.id} delay={index * 30} className="w-full">
                           <div 
                              onClick={() => setDetailSongId(song.id)}
                              className={`
                                  relative group px-6 py-4 cursor-pointer transition-all duration-500 flex items-center gap-5
                                  ${isSelected ? 'bg-white/5' : 'hover:bg-white/5'}
                              `}
                           >
                               {/* Track Number */}
                               <span className={`font-mono text-[10px] w-6 text-right transition-colors ${isSelected ? 'text-gold' : 'text-gray-700 group-hover:text-gray-500'}`}>
                                   {String(index + 1).padStart(2, '0')}
                               </span>

                               {/* Thumbnail (Cinema Style) */}
                               <div className="relative w-16 h-10 shrink-0 bg-black overflow-hidden border border-white/10 group-hover:border-white/30 transition-all rounded-[2px] shadow-lg">
                                   <img src={thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt={song.title} />
                                   {/* Play Icon Overlay */}
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-[1px] flex items-center justify-center border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
                                            <PlayIcon className="w-3 h-3 translate-x-0.5" />
                                       </div>
                                   </div>
                               </div>

                               {/* Text Info */}
                               <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className={`font-serif text-sm tracking-wide truncate transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {song.title}
                                    </h3>
                                    {isSelected && voteReasons[song.id] ? (
                                        <p className="text-[9px] text-gold italic mt-1 truncate opacity-80">"{voteReasons[song.id]}"</p>
                                    ) : (
                                        <p className="text-[8px] text-gray-700 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                                            {isYouTube ? 'Studio Live' : 'Audio Only'}
                                        </p>
                                    )}
                               </div>

                               {/* Status Icon */}
                               <div className="flex items-center pl-2">
                                   {isSelected ? (
                                       <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gold/10 text-gold animate-[pulse-slow_3s_infinite]">
                                           <CheckIcon className="w-4 h-4" />
                                       </div>
                                   ) : (
                                       <div className="w-8 h-8 flex items-center justify-center rounded-full text-gray-800 group-hover:text-gray-600 transition-colors">
                                            <HeartIcon className="w-4 h-4" />
                                       </div>
                                   )}
                               </div>
                               
                               {/* Bottom separator line */}
                               <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                           </div>
                       </FadeIn>
                   );
               })}
           </div>

           <div className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-white/10 p-5 z-40 backdrop-blur-xl">
               <div className="max-w-[500px] mx-auto flex items-center justify-between gap-6">
                   <div className="text-[10px] text-gray-500 font-serif italic">
                       {selectedIds.length < MAX_VOTES 
                           ? t.selectMore 
                           : <span className="text-gold not-italic font-sans tracking-widest font-bold">{t.mySelection}</span>
                       }
                   </div>
                   <button 
                       onClick={handleSubmitVotes}
                       disabled={selectedIds.length !== MAX_VOTES}
                       className={`
                           px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-bold rounded-[2px] transition-all duration-500 active:scale-95
                           ${selectedIds.length === MAX_VOTES 
                               ? 'bg-white text-black hover:bg-gold shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                               : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                           }
                       `}
                   >
                       {t.confirm}
                   </button>
               </div>
           </div>
      </div>
    );
};

const SuccessView: React.FC<{ 
    t: any; 
    setStep: (s: AppStep) => void; 
    user: User;
    songs: Song[];
}> = ({ t, setStep, user, songs }) => {
    // Get top 3 songs voted by user for the card
    const topPicks = user.votes.slice(0, 3).map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center max-w-[500px] mx-auto">
            <FadeIn>
                {/* --- MUSIC CARD VISUAL --- */}
                <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl mb-10 max-w-xs mx-auto relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gold"></div>
                    <div className="absolute -right-10 -top-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Beloved</span>
                        <span className="text-[8px] text-gray-600 font-mono tracking-widest">2026</span>
                    </div>

                    <div className="text-left space-y-4 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Voter</span>
                            <span className="font-serif text-white italic text-lg">{user.name}</span>
                        </div>
                        <div className="flex justify-between items-end">
                             <span className="text-[9px] text-gray-600 uppercase tracking-wider">Ref</span>
                             <span className="font-mono text-gray-500 text-[10px]">#{String(Math.floor(Math.random() * 90000) + 10000)}</span>
                        </div>
                    </div>

                    <div className="bg-[#050505] p-4 rounded-[2px] border border-white/5 relative">
                        <div className="absolute -left-[1px] top-4 bottom-4 w-[2px] bg-gold/50"></div>
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-3 text-center">Top Selections</p>
                        <ul className="space-y-3">
                            {topPicks.map((song, i) => (
                                <li key={song.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gold font-mono w-4 opacity-70">0{i+1}</span>
                                    <span className="text-gray-300 truncate font-serif italic tracking-wide">{song.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
                         <span className="text-[8px] text-gray-700 uppercase tracking-[0.4em]">Official Selection</span>
                    </div>
                </div>

                <h2 className="font-serif text-3xl text-white mb-3 italic">{t.thankYou}</h2>
                <p className="text-gray-500 text-[10px] tracking-widest uppercase max-w-xs mx-auto leading-relaxed mb-10 opacity-70">
                    {t.thankYouDesc}
                </p>

                <div className="flex gap-8 justify-center mb-16">
                    {SOCIAL_LINKS.map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1 active:scale-95">
                            {link.name}
                        </a>
                    ))}
                </div>
            </FadeIn>
            <div className="absolute bottom-12">
                <button onClick={() => setStep(AppStep.INTRO)} className="text-[9px] text-gray-800 hover:text-gray-500 uppercase tracking-[0.2em] active:scale-90 p-4 transition-colors">
                    {t.close}
                </button>
            </div>
        </div>
    );
}

// --- MAIN APP WRAPPER ---
// We define the content separately to use the Hook, then wrap it in Provider

const AppContent = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [], voteReasons: {} });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voteReasons, setVoteReasons] = useState<{ [id: number]: string }>({});
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [introAudioId, setIntroAudioId] = useState(DEFAULT_FEATURED_AUDIO_ID);
  const [detailSongId, setDetailSongId] = useState<number | null>(null);
  
  // Modal state for voting reason prompt
  const [pendingVoteId, setPendingVoteId] = useState<number | null>(null);

  const { pause, playingId } = useAudio();

  useEffect(() => {
    setSongs(getSongs());
    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) setIntroAudioId(globalConfig.introAudioUrl);
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleStart = () => {
      // ONLY pause if we were explicitly playing the intro song via AUDIO API.
      // YouTube pauses itself via the onEnterClick logic
      if (playingId === 'intro') {
        pause(); 
      }
      setStep(AppStep.AUTH);
  };
  
  const handleBack = () => {
      if (step === AppStep.AUTH) setStep(AppStep.INTRO);
      if (step === AppStep.VOTING) setStep(AppStep.AUTH);
      if (step === AppStep.SUCCESS) setStep(AppStep.INTRO);
      if (step === AppStep.ADMIN) setStep(AppStep.INTRO);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.email) setStep(AppStep.VOTING);
  };

  const toggleVote = (id: number, reason?: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
      const newReasons = { ...voteReasons };
      delete newReasons[id];
      setVoteReasons(newReasons);
    } else {
      if (selectedIds.length < MAX_VOTES) {
        setSelectedIds(prev => [...prev, id]);
        if (reason) setVoteReasons(prev => ({ ...prev, [id]: reason }));
      }
    }
  };

  // Handler for voting from the list view
  const handleVoteRequest = (id: number) => {
      if (selectedIds.includes(id)) {
          toggleVote(id);
      } else {
          if (selectedIds.length < MAX_VOTES) {
             setPendingVoteId(id);
          }
      }
  };

  const confirmPendingVote = (reason: string) => {
      if (pendingVoteId !== null) {
          toggleVote(pendingVoteId, reason);
          setPendingVoteId(null);
      }
  };

  const handleSubmitVotes = () => {
    if (selectedIds.length === MAX_VOTES) {
      const completeUser: User = {
        ...user,
        timestamp: new Date().toISOString(),
        votes: selectedIds,
        voteReasons: voteReasons
      };
      saveVote(completeUser);
      setStep(AppStep.SUCCESS);
    }
  };

  const t = TRANSLATIONS[lang];
  const currentSong = detailSongId ? songs.find(s => s.id === detailSongId) : null;
  const pendingSong = pendingVoteId ? songs.find(s => s.id === pendingVoteId) : null;

  if (step === AppStep.ADMIN) return <AdminView onBack={handleBack} />;

  return (
    <Layout className="bg-[#050505]">
        {step === AppStep.INTRO && (
            <IntroView 
                t={t} 
                introAudioId={introAudioId} 
                handleStart={handleStart}
                lang={lang}
                setLang={setLang}
                onAdmin={() => setStep(AppStep.ADMIN)}
            />
        )}

        {step === AppStep.AUTH && (
            <AuthView 
                t={t} 
                user={user} 
                setUser={setUser} 
                handleLogin={handleLogin} 
                handleBack={handleBack} 
                lang={lang}
                setLang={setLang}
            />
        )}

        {step === AppStep.VOTING && (
            <VotingView 
                t={t}
                songs={songs}
                selectedIds={selectedIds}
                MAX_VOTES={MAX_VOTES}
                voteReasons={voteReasons}
                onVoteRequest={handleVoteRequest}
                handleSubmitVotes={handleSubmitVotes}
                handleBack={handleBack}
                setDetailSongId={setDetailSongId}
            />
        )}

        {step === AppStep.SUCCESS && (
            <SuccessView t={t} setStep={setStep} user={user} songs={songs} />
        )}

        {/* Global Reason Modal for List View Voting */}
        <VoteReasonModal 
            isOpen={!!pendingVoteId}
            onClose={() => setPendingVoteId(null)}
            onConfirm={confirmPendingVote}
            songTitle={pendingSong?.title || ''}
            t={t}
        />

        <SongDetailModal 
            isOpen={!!detailSongId}
            onClose={() => setDetailSongId(null)}
            song={currentSong || null}
            lang={lang}
            isVoted={currentSong ? selectedIds.includes(currentSong.id) : false}
            canVote={selectedIds.length < MAX_VOTES}
            onVote={toggleVote}
            defaultCover={ARTIST_IMAGE_URL}
            savedReason={currentSong && voteReasons[currentSong.id] ? voteReasons[currentSong.id] : ''}
        />
    </Layout>
  );
};

export default function App() {
    return (
        <AudioProvider>
            <AppContent />
        </AudioProvider>
    );
}
