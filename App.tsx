
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
    <div className="flex gap-6 z-50">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 ${lang === l ? 'text-gold border-b border-gold/50' : 'text-gray-600 hover:text-gray-300'} active:scale-95`}
            >
                {l}
            </button>
        ))}
    </div>
);

const Footer: React.FC<{ t: any; onAdmin: () => void }> = ({ t, onAdmin }) => (
    <footer className="w-full py-8 text-center space-y-3 z-40">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] opacity-50">{t.copyright}</p>
        <button 
            onClick={onAdmin}
            className="text-[9px] text-gray-700 hover:text-gold transition-colors uppercase tracking-widest opacity-30 hover:opacity-100 p-2"
        >
            {t.managerLogin}
        </button>
    </footer>
);

// --- NEW COMPONENT: FINAL SUBMISSION MODAL (The Warm Inquiry) ---
const FinalSubmissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (finalMessage: string) => void;
    selectedSongs: Song[];
    t: any;
}> = ({ isOpen, onClose, onSubmit, selectedSongs, t }) => {
    const [message, setMessage] = useState('');
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-md glass-panel rounded-sm p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in flex flex-col max-h-[90vh] border-white/5">
                <div className="text-center mb-8">
                    <p className="text-[9px] text-gold uppercase tracking-[0.4em] mb-3">{t.finalInquirySubtitle}</p>
                    <h2 className="font-serif text-2xl md:text-3xl text-white italic drop-shadow-lg">{t.finalInquiryTitle}</h2>
                </div>

                {/* List of chosen songs */}
                <div className="bg-black/40 p-6 rounded-sm border border-white/5 mb-8 overflow-y-auto flex-1 min-h-[120px] shadow-inner">
                    <h4 className="text-[9px] text-gray-500 uppercase tracking-widest mb-4 text-center border-b border-white/5 pb-2">{t.reviewSelection}</h4>
                    <ul className="space-y-3">
                        {selectedSongs.map((song, i) => (
                            <li key={song.id} className="flex justify-between items-center text-xs group">
                                <span className="text-gold/50 font-mono w-6 group-hover:text-gold transition-colors">{(i+1).toString().padStart(2,'0')}</span>
                                <span className="text-gray-400 font-serif italic truncate group-hover:text-gray-200 transition-colors">{song.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-8">
                    <div className="text-[12px] text-gray-300 leading-relaxed text-center mb-6 font-serif whitespace-pre-wrap tracking-wide">
                        {t.finalInquiryPrompt}
                    </div>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.finalInquiryPlaceholder}
                        className="w-full bg-black/50 border border-white/10 rounded-sm p-4 text-sm text-white placeholder-gray-600 focus:border-gold/50 focus:bg-black/80 focus:outline-none h-32 resize-none transition-all"
                    />
                </div>

                <button 
                    onClick={() => onSubmit(message)}
                    className="w-full py-4 bg-gold/90 hover:bg-gold text-black text-[10px] font-bold uppercase tracking-[0.25em] transition-all rounded-sm shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] active:scale-95"
                >
                    {t.submitFinal}
                </button>
                
                <button 
                    onClick={onClose}
                    className="mt-6 text-[9px] text-gray-600 hover:text-white uppercase tracking-widest text-center transition-colors"
                >
                    {t.cancel}
                </button>
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
    const { playingId, isPlaying, playSong, pause, initializeAudio } = useAudio();
    const [isYtPlaying, setIsYtPlaying] = useState(false);
    
    // Check if Intro is a YouTube Link
    const introYoutubeId = extractYouTubeId(introAudioId);
    
    // Audio Context State (for MP3s)
    const isAudioPlaying = playingId === 'intro' && isPlaying;
    
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
    }, [setBgImage]);

    return (
      <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden">
        {/* ATMOSPHERIC GLOW BACKGROUND */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-gold/5 rounded-full blur-[120px] opacity-40 animate-breathe pointer-events-none z-0"></div>

        {/* HIDDEN YOUTUBE IFRAME (Background Audio) */}
        {introYoutubeId ? (
                <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                    <iframe 
                    id="intro-yt-iframe"
                    src={`https://www.youtube.com/embed/${introYoutubeId}?enablejsapi=1&autoplay=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${introYoutubeId}&playsinline=1&origin=${window.location.origin}`}
                    allow="autoplay; encrypted-media"
                    title="Intro Music"
                />
                </div>
        ) : null}

        {/* --- HEADER --- */}
        <header className="w-full flex justify-end p-8 md:p-12 relative z-50">
            <LangSwitcher lang={lang} setLang={setLang} />
        </header>
        
        {/* --- MAIN CONTENT (Flex Grow ensures it pushes Footer down) --- */}
        <main className="flex-1 flex flex-col items-center justify-center w-full px-8 py-10 relative z-30">
            <FadeIn delay={200} className="flex flex-col items-center max-w-6xl w-full">
                
                {/* --- HERO IMAGE (LARGE) --- */}
                {/* Container */}
                <div className="relative w-64 h-64 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] mb-12 md:mb-16 group transition-all duration-[1.5s]">
                    {/* 1. Halo Glow (Back) */}
                    <div className={`absolute inset-0 bg-gold/20 rounded-sm blur-[40px] md:blur-[80px] transition-opacity duration-1000 ${(isAudioPlaying || isYtPlaying) ? 'opacity-80' : 'opacity-30'}`}></div>
                    
                    {/* 2. Image Wrapper */}
                    <div className={`
                        relative w-full h-full overflow-hidden rounded-sm shadow-2xl transition-transform duration-[20s] ease-in-out border border-white/5
                        ${isAudioPlaying || isYtPlaying ? 'scale-[1.02] shadow-[0_0_60px_rgba(212,175,55,0.2)]' : 'scale-100'}
                    `}>
                        <img 
                            src={ARTIST_IMAGE_URL} 
                            alt="Artist Portrait" 
                            className="w-full h-full object-cover"
                        />
                        {/* Glass Overlay on Image - Subtle */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40"></div>
                    </div>

                    {/* 3. Shimmer Border Overlay */}
                    <div className="absolute -inset-[1px] rounded-sm bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none"></div>
                </div>

                {/* TYPOGRAPHY */}
                <div className="mb-12 md:mb-16 space-y-6 md:space-y-8 relative text-center">
                    <span className="block text-[10px] md:text-sm uppercase tracking-[0.8em] text-gold/80 font-sans">{t.subtitle}</span>
                    <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-wide italic drop-shadow-2xl opacity-95 py-2">Beloved</h1>
                </div>

                {/* MANIFESTO TEXT */}
                <div className="mb-16 md:mb-20 w-full max-w-lg md:max-w-2xl mx-auto relative">
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent -mt-16"></div>
                    
                    <p className="text-gray-300 font-serif text-sm md:text-lg leading-[2.8] md:leading-[3] whitespace-pre-wrap tracking-wider text-center drop-shadow-lg mix-blend-screen opacity-90">
                        {t.homeBody}
                    </p>
                    
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-0 w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent -mb-16"></div>
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
                    {/* Play Button - Minimal & Gold */}
                    <button 
                        onClick={handleToggleIntro}
                        className={`
                            flex items-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-500
                            ${(isAudioPlaying || isYtPlaying) ? 'text-gold opacity-100 scale-105' : 'text-gray-500 opacity-60 hover:opacity-100 hover:text-white'}
                        `}
                    >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${(isAudioPlaying || isYtPlaying) ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] bg-gold/5' : 'border-gray-700'}`}>
                            {(isAudioPlaying || isYtPlaying) ? <PauseIcon className="w-3 h-3 md:w-4 md:h-4" /> : <PlayIcon className="w-3 h-3 md:w-4 md:h-4 translate-x-0.5" />}
                        </div>
                        <span>{(isAudioPlaying || isYtPlaying) ? 'Pause Music' : 'Play Music'}</span>
                    </button>

                    {/* ENTER BUTTON - GLASSMORPHISM */}
                    <button 
                        onClick={onEnterClick}
                        className="group relative px-16 md:px-24 py-5 md:py-6 glass-button overflow-hidden rounded-[2px]"
                    >
                        <div className="absolute inset-0 bg-shimmer-gradient animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 font-serif text-sm md:text-base tracking-[0.4em] uppercase text-gray-100 group-hover:text-white transition-colors">{t.enter}</span>
                    </button>
                </div>
            </FadeIn>
        </main>

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
    <div className="flex flex-col min-h-screen relative w-full overflow-y-auto no-scrollbar">
       <div className="fixed top-8 left-8 z-50">
           <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors p-3 active:scale-90 bg-black/20 backdrop-blur-md rounded-full border border-white/5 hover:border-gold/30">
               <ArrowLeftIcon className="w-5 h-5" />
           </button>
       </div>
       
       <div className="fixed top-8 right-8 z-50">
           <LangSwitcher lang={lang} setLang={setLang} />
       </div>
       
       {/* Central Container for Reading Width */}
       <div className="flex-1 flex flex-col pt-32 pb-20 px-8 z-20 max-w-lg mx-auto w-full">
           <FadeIn>
               {/* ABOUT SECTION */}
               <div className="mb-16 text-center">
                    <div className="space-y-8">
                        <h3 className="font-serif text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 italic drop-shadow-lg">{t.aboutTitle}</h3>
                        <p className="text-sm md:text-base text-gray-400 font-serif leading-[2.4] whitespace-pre-wrap tracking-wide mix-blend-screen">
                            {t.aboutBody}
                        </p>
                    </div>
                    
                    <div className="w-full flex justify-center py-12">
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="font-serif text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 italic drop-shadow-lg">{t.howToTitle}</h3>
                        <p className="text-sm md:text-base text-gray-400 font-serif leading-[2.4] whitespace-pre-wrap tracking-wide mix-blend-screen">
                            {t.howToBody}
                        </p>
                    </div>
               </div>

               {/* FORM - FROSTED GLASS */}
               <div className="glass-panel p-10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-4 w-full relative overflow-hidden">
                   {/* Subtle Glow inside form */}
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-[50px] pointer-events-none"></div>

                   <div className="text-center mb-10">
                       <p className="text-[9px] uppercase tracking-[0.4em] text-gold/80">Identity</p>
                   </div>
                   <form onSubmit={handleLogin} className="space-y-10 relative z-10">
                       <div className="space-y-2 text-center group">
                           <label className="text-[8px] uppercase text-gray-600 tracking-[0.3em] block group-focus-within:text-gold transition-colors">{t.name}</label>
                           <input 
                               required
                               type="text" 
                               value={user.name}
                               onChange={e => setUser({...user, name: e.target.value})}
                               className="w-full bg-transparent border-b border-gray-800 py-3 text-center text-lg text-white placeholder-gray-800 focus:border-gold/50 outline-none transition-all font-serif rounded-none tracking-wide"
                               placeholder="Your Name"
                           />
                       </div>
                       <div className="space-y-2 text-center group">
                           <label className="text-[8px] uppercase text-gray-600 tracking-[0.3em] block group-focus-within:text-gold transition-colors">{t.email}</label>
                           <input 
                               required
                               type="email" 
                               value={user.email}
                               onChange={e => setUser({...user, email: e.target.value})}
                               className="w-full bg-transparent border-b border-gray-800 py-3 text-center text-lg text-white placeholder-gray-800 focus:border-gold/50 outline-none transition-all font-serif rounded-none tracking-wide"
                               placeholder="email@address.com"
                           />
                       </div>
                       <button 
                           type="submit" 
                           disabled={!user.name || !user.email}
                           className="w-full mt-6 bg-white text-black py-4 uppercase tracking-[0.3em] text-[9px] font-bold hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg rounded-[2px]"
                       >
                           {t.start}
                       </button>
                   </form>
               </div>
           </FadeIn>
       </div>
    </div>
);

const VotingView: React.FC<{ 
    t: any;
    songs: Song[];
    selectedIds: number[];
    MAX_VOTES: number;
    voteReasons: { [id: number]: string };
    onRequestSubmit: () => void;
    handleBack: () => void;
    setDetailSongId: (id: number) => void;
}> = ({ t, songs, selectedIds, MAX_VOTES, voteReasons, onRequestSubmit, handleBack, setDetailSongId }) => {
    const progress = (selectedIds.length / MAX_VOTES) * 100;
    
    return (
      <div className="min-h-screen pb-32 relative w-full">
           {/* Top Bar with Frosted Glass */}
           <div className="fixed top-0 left-0 w-full z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shadow-2xl">
               <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                   <button onClick={handleBack} className="text-gray-500 hover:text-white p-2 active:scale-90 transition-colors">
                       <ArrowLeftIcon className="w-5 h-5" />
                   </button>
                   <div className="text-center">
                       <h2 className="text-[10px] md:text-xs font-bold text-gray-200 uppercase tracking-[0.2em] mb-1">{t.selection}</h2>
                       <p className="text-[9px] md:text-[10px] text-gold font-mono">{selectedIds.length} <span className="text-gray-700">/</span> {MAX_VOTES}</p>
                   </div>
                   <div className="w-9" />
               </div>
               <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-700 ease-out opacity-60" style={{ width: `${progress}%`, left: `${(100-progress)/2}%` }}></div>
           </div>

           <div className="pt-28 px-0 space-y-1 max-w-2xl mx-auto">
               <div className="text-center mb-10 px-8">
                   <p className="text-gray-400 text-[10px] md:text-xs leading-loose font-serif italic tracking-wide mix-blend-screen">{t.votingRule}</p>
               </div>

               {songs.map((song, index) => {
                   const isSelected = selectedIds.includes(song.id);
                   const isYouTube = !!song.youtubeId;
                   const thumbnail = song.customImageUrl || (isYouTube ? getYouTubeThumbnail(song.youtubeId!) : ARTIST_IMAGE_URL);
                   
                   return (
                       <FadeIn key={song.id} delay={index * 30} className="w-full">
                           <div 
                              onClick={() => setDetailSongId(song.id)}
                              className={`
                                  relative group px-6 py-5 cursor-pointer transition-all duration-500 flex items-center gap-6 md:gap-8
                                  ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.02]'}
                              `}
                           >
                               {/* Track Number */}
                               <span className={`font-mono text-[10px] md:text-xs w-6 text-right transition-colors ${isSelected ? 'text-gold' : 'text-gray-700 group-hover:text-gray-500'}`}>
                                   {String(index + 1).padStart(2, '0')}
                               </span>

                               {/* Thumbnail (Full Color) */}
                               <div className="relative w-24 h-14 md:w-32 md:h-20 shrink-0 bg-black overflow-hidden border border-white/10 group-hover:border-gold/30 transition-all rounded-[2px] shadow-lg">
                                   <img src={thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" alt={song.title} />
                                   
                                   {/* Play Icon Overlay */}
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                                            <PlayIcon className="w-3 h-3 translate-x-0.5" />
                                       </div>
                                   </div>
                               </div>

                               {/* Text Info */}
                               <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className={`font-serif text-sm md:text-lg tracking-wide truncate transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {song.title}
                                    </h3>
                                    {isSelected && voteReasons[song.id] ? (
                                        <p className="text-[9px] md:text-[10px] text-gold italic mt-2 truncate opacity-80 font-serif">"{voteReasons[song.id]}"</p>
                                    ) : (
                                        <p className="text-[8px] md:text-[9px] text-gray-700 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-50 transition-opacity duration-500">
                                            Click to Listen
                                        </p>
                                    )}
                               </div>

                               {/* Status Icon */}
                               <div className="flex items-center pl-2">
                                   {isSelected ? (
                                       <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gold/5 border border-gold/20 text-gold animate-[pulse-slow_4s_infinite] shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                                           <CheckIcon className="w-3 h-3 md:w-4 md:h-4" />
                                       </div>
                                   ) : (
                                       <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-gray-800 group-hover:text-gray-500 transition-colors">
                                            <HeartIcon className="w-4 h-4 md:w-5 md:h-5" />
                                       </div>
                                   )}
                               </div>
                               
                               {/* Bottom separator line (Gradient) */}
                               <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                           </div>
                       </FadeIn>
                   );
               })}
           </div>

           <div className="fixed bottom-0 left-0 w-full bg-[#050505]/90 border-t border-white/5 p-5 z-40 backdrop-blur-xl">
               <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
                   <div className="text-[10px] md:text-xs text-gray-500 font-serif italic">
                       {selectedIds.length < MAX_VOTES 
                           ? t.selectMore 
                           : <span className="text-gold not-italic font-sans tracking-widest font-bold drop-shadow-md">{t.mySelection}</span>
                       }
                   </div>
                   <button 
                       onClick={onRequestSubmit}
                       disabled={selectedIds.length !== MAX_VOTES}
                       className={`
                           px-8 py-3 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold rounded-[2px] transition-all duration-500 active:scale-95
                           ${selectedIds.length === MAX_VOTES 
                               ? 'bg-white text-black hover:bg-gold shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
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
        <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center w-full">
            <FadeIn className="max-w-lg mx-auto w-full">
                {/* --- MUSIC CARD VISUAL (Enhanced) --- */}
                <div className="glass-panel p-8 md:p-12 rounded-sm shadow-2xl mb-12 max-w-sm mx-auto relative overflow-hidden group border border-white/10">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/10 rounded-full blur-[60px]"></div>

                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Beloved</span>
                        <span className="text-[8px] text-gray-600 font-mono tracking-widest">2026</span>
                    </div>

                    <div className="text-left space-y-5 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider">Voter</span>
                            <span className="font-serif text-white italic text-lg tracking-wide">{user.name}</span>
                        </div>
                        <div className="flex justify-between items-end">
                             <span className="text-[9px] text-gray-500 uppercase tracking-wider">Ref</span>
                             <span className="font-mono text-gray-600 text-[10px]">#{String(Math.floor(Math.random() * 90000) + 10000)}</span>
                        </div>
                    </div>

                    <div className="bg-black/30 p-6 rounded-[2px] border border-white/5 relative">
                        <div className="absolute -left-[1px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent"></div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-4 text-center">Top Selections</p>
                        <ul className="space-y-4">
                            {topPicks.map((song, i) => (
                                <li key={song.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gold font-mono w-4 opacity-70">0{i+1}</span>
                                    <span className="text-gray-300 truncate font-serif italic tracking-wide">{song.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                         <span className="text-[8px] text-gray-600 uppercase tracking-[0.4em] opacity-80">Official Selection</span>
                    </div>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6 italic drop-shadow-md">{t.thankYou}</h2>
                <p className="text-gray-400 text-[10px] md:text-xs tracking-widest font-serif leading-[2.5] mb-12 whitespace-pre-wrap max-w-md mx-auto">
                    {t.thankYouDesc}
                </p>

                <div className="flex gap-10 justify-center mb-16">
                    {SOCIAL_LINKS.map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="text-[9px] md:text-[10px] text-gray-600 hover:text-gold uppercase tracking-widest border-b border-transparent hover:border-gold/50 transition-all pb-1 active:scale-95">
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

const AppContent = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [], voteReasons: {} });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voteReasons, setVoteReasons] = useState<{ [id: number]: string }>({});
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [introAudioId, setIntroAudioId] = useState(DEFAULT_FEATURED_AUDIO_ID);
  const [detailSongId, setDetailSongId] = useState<number | null>(null);
  
  // New state for the final modal
  const [showFinalModal, setShowFinalModal] = useState(false);

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

  const handleRequestSubmit = () => {
      if (selectedIds.length === MAX_VOTES) {
          setShowFinalModal(true);
      }
  };

  const handleFinalSubmit = (finalMessage: string) => {
      const finalReasons = { ...voteReasons };
      if (finalMessage.trim()) {
          finalReasons[0] = finalMessage; 
      }

      const completeUser: User = {
        ...user,
        timestamp: new Date().toISOString(),
        votes: selectedIds,
        voteReasons: finalReasons
      };
      saveVote(completeUser);
      setShowFinalModal(false);
      setStep(AppStep.SUCCESS);
  };

  const t = TRANSLATIONS[lang];
  const currentSong = detailSongId ? songs.find(s => s.id === detailSongId) : null;
  const selectedSongsObj = selectedIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];

  if (step === AppStep.ADMIN) return <AdminView onBack={handleBack} />;

  return (
    <Layout className="bg-[#030303]">
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
                onRequestSubmit={handleRequestSubmit}
                handleBack={handleBack}
                setDetailSongId={setDetailSongId}
            />
        )}

        {step === AppStep.SUCCESS && (
            <SuccessView t={t} setStep={setStep} user={user} songs={songs} />
        )}

        {/* CINEMA MODE MODAL (For Listening/Voting) */}
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

        {/* FINAL WARM INQUIRY MODAL */}
        <FinalSubmissionModal 
            isOpen={showFinalModal}
            onClose={() => setShowFinalModal(false)}
            onSubmit={handleFinalSubmit}
            selectedSongs={selectedSongsObj}
            t={t}
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
