
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig, extractYouTubeId } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, getYouTubeThumbnail } from './constants';
import AudioPlayer from './components/AudioPlayer';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SearchIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
const DEFAULT_FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb"; 
// Changed to a reliable Unsplash Music Image to prevent "Empty" look if Drive fails
const ARTIST_IMAGE_URL = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop";

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
    const { playingId, isPlaying, playSong, pause, resume, initializeAudio } = useAudio();
    const [ytPlayer, setYtPlayer] = useState<any>(null);
    const [isYtPlaying, setIsYtPlaying] = useState(false);
    
    // Check if Intro is a YouTube Link
    const introYoutubeId = extractYouTubeId(introAudioId);
    
    // Audio Context State (for MP3s)
    const isAudioPlaying = playingId === 'intro' && isPlaying;

    const handleToggleIntro = () => {
        if (introYoutubeId) {
            // Handle YouTube Playback
            if (isYtPlaying) {
                // Pause
                const iframe = document.getElementById('intro-yt-iframe') as HTMLIFrameElement;
                iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                setIsYtPlaying(false);
            } else {
                // Play
                const iframe = document.getElementById('intro-yt-iframe') as HTMLIFrameElement;
                iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                setIsYtPlaying(true);
            }
        } else {
            // Handle MP3 Playback
            if (isAudioPlaying) {
                pause();
            } else if (playingId === 'intro' && !isPlaying) {
                resume();
            } else {
                import('./constants').then(m => {
                     const url = m.getAudioUrl(introAudioId);
                     playSong('intro', url, "Intro");
                });
            }
        }
    };

    const onEnterClick = () => {
        // Stop YouTube if playing
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
                 // YouTube Background Mode
                 <div className={`absolute inset-0 transition-opacity duration-1000 ${isYtPlaying ? 'opacity-40' : 'opacity-20'} z-10 bg-black`}>
                    {/* Render invisible but functional YT iframe for audio */}
                     <iframe 
                        id="intro-yt-iframe"
                        className="w-full h-full object-cover pointer-events-none scale-150"
                        src={`https://www.youtube.com/embed/${introYoutubeId}?enablejsapi=1&autoplay=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${introYoutubeId}&playsinline=1&origin=${window.location.origin}`}
                        allow="autoplay; encrypted-media"
                        title="Intro Music"
                    />
                 </div>
            ) : (
                // Standard Image Background
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

            {/* Central Play Button */}
            <button 
                onClick={handleToggleIntro}
                className={`
                    group w-20 h-20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm mb-12 transition-all duration-500 active:scale-90
                    ${(isAudioPlaying || isYtPlaying) ? 'bg-white text-black scale-110 border-white' : 'bg-black/20 text-white hover:bg-white/10 hover:scale-105'}
                `}
            >
                {(isAudioPlaying || isYtPlaying) ? (
                    <div className="flex gap-1 h-6 items-center">
                         <span className="w-1 h-full bg-black animate-[pulse_1s_ease-in-out_infinite]"></span>
                         <span className="w-1 h-2/3 bg-black animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                         <span className="w-1 h-full bg-black animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                    </div>
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
    toggleVote: (id: number) => void;
    handleSubmitVotes: () => void;
    handleBack: () => void;
    setDetailSongId: (id: number) => void;
}> = ({ t, songs, selectedIds, MAX_VOTES, voteReasons, toggleVote, handleSubmitVotes, handleBack, setDetailSongId }) => {
    const progress = (selectedIds.length / MAX_VOTES) * 100;
    const { playingId } = useAudio();
    
    // Safety check: Ensure songs exist. If empty, show a loading/error state.
    if (!songs || songs.length === 0) {
        return (
             <div className="min-h-screen flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <p>Loading Library...</p>
                    <p className="text-[10px] mt-2">If this persists, please contact admin.</p>
                </div>
             </div>
        );
    }

    return (
      <div className="min-h-screen pb-32 relative w-full bg-[#050505]">
           <div className="fixed top-0 left-0 w-full z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
               <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                   <button onClick={handleBack} className="text-gray-500 hover:text-white p-2 active:scale-90">
                       <ArrowLeftIcon className="w-5 h-5" />
                   </button>
                   <div className="text-center">
                       <h2 className="text-xs font-bold text-white uppercase tracking-widest">{t.selection}</h2>
                       <p className="text-[9px] text-gold">{selectedIds.length} / {MAX_VOTES}</p>
                   </div>
                   <div className="w-5" />
               </div>
               <div className="absolute bottom-0 left-0 h-[1px] bg-gold transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
           </div>

           <div className="pt-24 px-4 max-w-6xl mx-auto">
               <div className="text-center mb-10 px-4">
                   <h3 className="font-serif text-2xl text-white italic mb-2">The Collection</h3>
                   <p className="text-gray-400 text-xs leading-relaxed font-sans">{t.votingRule}</p>
               </div>

               {/* GRID LAYOUT: 2 cols on mobile, 3 on tablet, 4 on desktop */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                   {songs.map((song, index) => {
                       const isSelected = selectedIds.includes(song.id);
                       const isPlaying = playingId === song.id;
                       const isYouTube = !!song.youtubeId;
                       
                       // Determine thumbnail. Use high-res Unsplash if no YouTube ID, to prevent "Empty" look.
                       const thumbnail = isYouTube 
                          ? getYouTubeThumbnail(song.youtubeId!) 
                          : (song.customImageUrl || ARTIST_IMAGE_URL);
                       
                       return (
                           <FadeIn key={song.id} delay={index * 30} className="w-full">
                               <div 
                                  onClick={() => setDetailSongId(song.id)}
                                  className={`
                                      relative group aspect-[3/4] md:aspect-square rounded-sm overflow-hidden cursor-pointer transition-all duration-300 border
                                      ${isSelected ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/5 hover:border-white/30'}
                                  `}
                               >
                                   {/* BACKGROUND IMAGE */}
                                   <div className="absolute inset-0 bg-gray-900">
                                       <img 
                                            src={thumbnail} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSelected ? 'opacity-40' : 'opacity-80 group-hover:opacity-60'}`} 
                                            alt={song.title}
                                            onError={(e) => {
                                                // Fallback if image fails
                                                (e.target as HTMLImageElement).src = ARTIST_IMAGE_URL;
                                            }}
                                       />
                                   </div>

                                   {/* GRADIENT OVERLAY */}
                                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                                   {/* CONTENT */}
                                   <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                       
                                       {/* TOP BADGES */}
                                       <div className="absolute top-3 left-3 flex gap-2">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-sm ${isSelected ? 'bg-gold text-black font-bold' : 'bg-white/10 text-white'}`}>
                                                #{String(index + 1).padStart(2, '0')}
                                            </span>
                                       </div>
                                       
                                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                           {isYouTube ? (
                                                <div className="bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
                                                    YouTube
                                                </div>
                                           ) : (
                                                <div className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-md">
                                                    Audio
                                                </div>
                                           )}
                                       </div>

                                       {/* CENTER PLAY BUTTON (Appears on Hover) */}
                                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                                            </div>
                                       </div>

                                       {/* BOTTOM INFO */}
                                       <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className={`font-serif text-lg leading-tight mb-2 line-clamp-2 ${isSelected ? 'text-gold italic' : 'text-white'}`}>
                                                {song.title}
                                            </h3>
                                            
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[9px] text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                                                    {isYouTube ? 'Watch Video' : 'Listen Track'}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleVote(song.id); }}
                                                    disabled={!isSelected && selectedIds.length >= MAX_VOTES}
                                                    className={`
                                                        w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90
                                                        ${isSelected 
                                                            ? 'bg-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                                                            : 'bg-white/10 text-white hover:bg-white hover:text-black'
                                                        }
                                                    `}
                                                >
                                                    {isSelected ? <CheckIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           </FadeIn>
                       );
                   })}
               </div>
           </div>

           <div className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-white/10 p-4 z-40 backdrop-blur-xl">
               <div className="max-w-[500px] mx-auto flex items-center justify-between gap-4">
                   <div className="text-xs text-gray-500">
                       {selectedIds.length < MAX_VOTES 
                           ? t.selectMore 
                           : <span className="text-gold font-bold">{t.mySelection}</span>
                       }
                   </div>
                   <button 
                       onClick={handleSubmitVotes}
                       disabled={selectedIds.length !== MAX_VOTES}
                       className={`
                           px-8 py-3 uppercase tracking-widest text-xs font-bold rounded-sm transition-all active:scale-95
                           ${selectedIds.length === MAX_VOTES 
                               ? 'bg-white text-black hover:bg-gold' 
                               : 'bg-white/10 text-gray-500 cursor-not-allowed'
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
                <div className="bg-[#111] border border-white/10 p-6 rounded-sm shadow-2xl mb-8 max-w-xs mx-auto relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
                    <div className="absolute -right-6 -top-6 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>

                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Beloved 2026</span>
                        <span className="text-[9px] text-gray-500 font-mono">VOTER CARD</span>
                    </div>

                    <div className="text-left space-y-3 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-gray-500 uppercase">Holder</span>
                            <span className="font-serif text-white italic text-lg">{user.name}</span>
                        </div>
                        <div className="flex justify-between items-end">
                             <span className="text-[10px] text-gray-500 uppercase">ID</span>
                             <span className="font-mono text-gray-400 text-xs">NO.{String(Math.floor(Math.random() * 9000) + 1000)}</span>
                        </div>
                    </div>

                    <div className="bg-[#050505] p-3 rounded-sm border border-white/5">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-2 text-center">Top Selections</p>
                        <ul className="space-y-2">
                            {topPicks.map((song, i) => (
                                <li key={song.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gold font-mono w-4">0{i+1}</span>
                                    <span className="text-gray-300 truncate">{song.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                        <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center text-white/50">
                             <CheckIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <h2 className="font-serif text-3xl text-white mb-2 italic">{t.thankYou}</h2>
                <p className="text-gray-400 text-xs tracking-widest uppercase max-w-xs mx-auto leading-relaxed mb-8">
                    {t.thankYouDesc}
                </p>

                <div className="flex gap-6 justify-center mb-12">
                    {SOCIAL_LINKS.map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1 active:scale-95">
                            {link.name}
                        </a>
                    ))}
                </div>
            </FadeIn>
            <div className="absolute bottom-12">
                <button onClick={() => setStep(AppStep.INTRO)} className="text-[10px] text-gray-700 hover:text-gray-500 uppercase tracking-widest active:scale-90 p-4">
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

  const { pause, playingId } = useAudio();

  useEffect(() => {
    // Robust data loading: Ensure we have songs.
    const loadedSongs = getSongs();
    if (loadedSongs && loadedSongs.length > 0) {
        setSongs(loadedSongs);
    } else {
        // Fallback should technically be handled by storage.ts, but safety first
        import('./constants').then(m => setSongs(m.SONGS));
    }

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
                toggleVote={toggleVote}
                handleSubmitVotes={handleSubmitVotes}
                handleBack={handleBack}
                setDetailSongId={setDetailSongId}
            />
        )}

        {step === AppStep.SUCCESS && (
            <SuccessView t={t} setStep={setStep} user={user} songs={songs} />
        )}

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
