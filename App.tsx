
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { getSongs, getGlobalConfig, saveUserSession, getUserSession, fetchRemoteSongs } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, ARTIST_DATA } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';
import AudioPlayer from './components/AudioPlayer';

// --- CONFIGURATION ---

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void; className?: string }> = ({ lang, setLang, className }) => (
    <div className={`flex gap-6 z-50 ${className}`}>
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[9px] uppercase tracking-[0.25em] transition-all duration-500 font-sans ${lang === l ? 'text-gold font-bold scale-110' : 'text-gray-500 hover:text-white'}`}
            >
                {l}
            </button>
        ))}
    </div>
);

// --- ARTIST OFFICIAL SITE VIEWS ---

const SocialButton: React.FC<{ platform: string; url: string }> = ({ platform, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 opacity-60 hover:opacity-100 transition-all duration-300">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white group-hover:text-gold transition-colors">{platform}</span>
        <span className="text-gold text-[10px] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">↗</span>
    </a>
);

const ArtistHomeView: React.FC<{ 
    t: any; 
    lang: Language; 
    setLang: (l: Language) => void; 
    onEnterEvent: () => void;
    onAdmin: () => void;
    featuredSong: { title: string; url: string };
}> = ({ t, lang, setLang, onEnterEvent, onAdmin, featuredSong }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#020202] text-white font-serif selection:bg-gold selection:text-black">
             {/* Navigation */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                    {/* LEFT SIDE: Brand + Language Switcher */}
                    <div className="flex items-center gap-10">
                        <div className="text-lg md:text-xl font-serif font-bold text-metallic tracking-widest">WILLWI</div>
                        <div className="w-[1px] h-4 bg-white/20 hidden md:block"></div>
                        <LangSwitcher lang={lang} setLang={setLang} className="hidden md:flex" />
                    </div>

                    {/* RIGHT SIDE: Removed redundant button */}
                    <div></div>
                </div>
            </nav>

            {/* Hero Section - Designed as an ALBUM COVER Showcase */}
            <header className="relative w-full min-h-screen flex flex-col md:flex-row pt-20 md:pt-0">
                 {/* Left/Top: Main Image (Album Cover Aesthetic) */}
                 <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                     {/* Placeholder animation while loading */}
                     <div className="absolute inset-0 bg-neutral-900 animate-pulse"></div>
                     <img 
                        src="https://drive.google.com/uc?export=view&id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9" 
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gradient-to-b', 'from-gray-800', 'to-black');
                        }}
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-90 hover:scale-105 transition-transform duration-[3s]" 
                        alt="Willwi Main Portrait" 
                     />
                     {/* Gradient Overlays for Text Readability */}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#020202]"></div>
                 </div>

                 {/* Right/Bottom: Text Content & Featured Song */}
                 <div className="w-full md:w-1/2 min-h-[50vh] md:h-screen flex flex-col justify-center items-center px-8 md:px-20 py-12 relative z-10 text-center">
                     
                     {/* Breathing Halo Effect - Enhanced */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none"></div>

                     <div className="animate-slide-up space-y-10 relative z-20 w-full max-w-lg">
                        {/* Artist Identity & Event Title */}
                        <div>
                            {ARTIST_DATA.englishName && (
                                <h2 className="text-gold text-xs tracking-[0.4em] uppercase font-sans border-b border-gold/30 pb-4 inline-block mb-4">
                                    {ARTIST_DATA.englishName}
                                </h2>
                            )}
                            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide leading-tight mb-4">
                                BELOVED<br/><span className="text-2xl md:text-4xl italic text-metallic">摯愛</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em]">The 2026 Collection</p>
                        </div>

                        {/* Event Copy - The Core Focus */}
                        <div className="relative">
                            <p className="text-gray-300 text-sm md:text-base font-serif leading-8 whitespace-pre-wrap tracking-wide text-justify md:text-center">
                                {t.homeBody}
                            </p>
                        </div>

                        {/* START VOTING BUTTON - MOVED ABOVE PLAYER */}
                        <div className="pt-4 flex justify-center">
                             <button onClick={onEnterEvent} className="group relative px-10 py-4 border border-white/20 hover:border-gold transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                <span className="relative z-10 text-xs font-bold text-white group-hover:text-gold uppercase tracking-[0.4em] transition-colors">
                                    {t.enter}
                                </span>
                            </button>
                        </div>

                        {/* Featured Song Player - ENHANCED JEWELRY BOX DESIGN */}
                        <div className="pt-6 pb-2">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-md relative overflow-hidden group animate-breathe-gold transition-all duration-1000">
                                {/* Inner Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                
                                <div className="text-[9px] text-gold uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2 relative z-10">
                                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]"></span>
                                    Now Playing
                                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]"></span>
                                </div>
                                <div className="relative z-10">
                                    <AudioPlayer 
                                        id="homepage-featured"
                                        src={featuredSong.url}
                                        title={featuredSong.title}
                                        variant="minimal"
                                        showControls={true}
                                    />
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>
            </header>

            {/* Secondary Profile Section (Bio) */}
            <section className="relative w-full py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                      <div className="order-2 md:order-1 space-y-12 animate-slide-up">
                          <div>
                              <h3 className="text-2xl font-serif text-metallic mb-8">{t.profile}</h3>
                              <p className="text-gray-400 font-sans tracking-[0.2em] uppercase leading-relaxed max-w-md mb-8">
                                  {ARTIST_DATA.title}
                              </p>
                              <div className="flex flex-col gap-6">
                                  <p className="text-gray-300 text-sm md:text-base font-serif leading-8 whitespace-pre-wrap tracking-wide text-justify">
                                      {lang === 'en' ? ARTIST_DATA.bio.en : ARTIST_DATA.bio.zh}
                                  </p>
                              </div>
                          </div>

                          <div className="pt-6">
                              <h4 className="text-gold text-xs tracking-[0.2em] uppercase mb-4">Production Credits</h4>
                              <ul className="space-y-2">
                                  {ARTIST_DATA.copyright.credits.map((credit, i) => (
                                      <li key={i} className="text-[10px] md:text-xs text-gray-500 font-mono tracking-wider uppercase">
                                          {credit}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>

                      <div className="order-1 md:order-2 relative h-[600px] w-full overflow-hidden rounded-sm group bg-gray-900">
                          {/* Secondary Image */}
                          <div className="absolute inset-0 bg-neutral-900"></div>
                          <img 
                            src="https://drive.google.com/uc?export=view&id=18rpLhJQKHKK5EeonFqutlOoKAI2Eq_Hd" 
                             onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-gray-900', 'to-[#1a1a1a]');
                            }}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:scale-110 transition-transform duration-[2s]" 
                            alt="Willwi Profile" 
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700"></div>
                      </div>
                 </div>
            </section>

            {/* Footer - Redesigned to Poetic 'Cartier' Style - No Labels, Only Stories */}
            <footer className="w-full py-20 border-t border-white/5 bg-[#050505] relative z-20">
                <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
                    
                    {/* Contact & Socials - Centered & Minimal */}
                    <div className="space-y-6">
                        <a href={`mailto:${ARTIST_DATA.links.email}`} className="text-lg font-serif text-white hover:text-gold transition-colors tracking-widest block">
                            {ARTIST_DATA.links.email}
                        </a>
                        <div className="flex flex-wrap justify-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
                            {ARTIST_DATA.links.socials.map((link, idx) => (
                                <SocialButton key={idx} platform={link.platform} url={link.url} />
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-8 h-[1px] bg-gold/50"></div>

                    {/* STORY / POETIC FOOTER (Replaces Copyright) */}
                    <div className="flex flex-col items-center gap-4 text-metallic">
                        <div className="text-sm md:text-base font-serif tracking-[0.4em] uppercase text-gold">
                            音樂為愛而唱
                        </div>
                        <div className="w-1 h-1 bg-gold rounded-full opacity-50"></div>
                        <div className="text-[10px] md:text-xs font-sans tracking-[0.5em] uppercase text-gray-500">
                            這裡 沒有標籤 只有故事
                        </div>
                        
                        {/* Hidden/Subtle Admin Access */}
                        <button onClick={onAdmin} className="mt-8 text-[9px] text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-widest px-2 py-1 rounded opacity-20 hover:opacity-100">
                            System
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- PREVIOUS VOTING APP VIEWS (Refactored to be accessible via Menu) ---

const IntroView: React.FC<{ 
    t: any; 
    introAudioId: string; 
    handleStart: () => void;
    lang: Language;
    setLang: (l: Language) => void;
    onBackToSite: () => void;
}> = ({ t, introAudioId, handleStart, lang, setLang, onBackToSite }) => {
    const { initializeAudio } = useAudio();
    
    const onEnterClick = () => {
        initializeAudio(); 
        handleStart();
    };

    return (
      <div className="relative h-screen w-full bg-[#020202] overflow-hidden flex flex-col justify-between font-serif">
        <div className="absolute inset-0 z-0 select-none bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1a1a1a_0%,_#000000_80%)]"></div>
            <div className="absolute top-[-10%] left-[20%] w-[80vw] h-[80vw] bg-gold/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vw] bg-[#8A7035]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        </div>

        <div className="w-full px-8 py-8 flex justify-between items-start z-50 animate-fade-in relative">
            <button onClick={onBackToSite} className="flex items-center gap-2 text-[9px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors group">
                <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Willwi Official
            </button>
            <LangSwitcher lang={lang} setLang={setLang} />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center px-6">
            <div className="animate-slide-up space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-[1px] bg-gold/50"></div>
                    <p className="text-[10px] md:text-xs tracking-[0.5em] text-gold uppercase font-sans">{t.subtitle}</p>
                </div>
                
                <h1 className="font-serif text-6xl md:text-9xl text-metallic tracking-widest leading-none drop-shadow-2xl py-4">
                    {t.title}
                </h1>
                
                <p className="font-serif text-sm md:text-base text-gray-300 tracking-widest leading-loose max-w-2xl mx-auto opacity-90 text-shadow whitespace-pre-wrap">
                    {t.homeBody}
                </p>
            </div>

            <div className="mt-16 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <button 
                    onClick={onEnterClick}
                    className="group relative px-20 py-6 border border-white/20 hover:border-gold/60 transition-all duration-700 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 text-xs font-bold text-white group-hover:text-gold uppercase tracking-[0.4em] transition-colors">
                        {t.enter}
                    </span>
                </button>
            </div>
        </div>

        <div className="absolute bottom-6 w-full flex justify-center z-50 opacity-40">
             <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans">© 2026 Willwi Music</div>
        </div>
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
    <div className="min-h-screen w-full relative bg-[#050505] flex items-center justify-center overflow-hidden font-serif">
       <div className="absolute inset-0 z-0 bg-black">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#222_0%,_#000000_100%)]"></div>
           <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none"></div>
       </div>
       
       <div className="absolute top-8 left-8 z-50">
           <button onClick={handleBack} className="text-white/40 hover:text-white transition-colors flex items-center gap-3 group">
               <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-medium">{t.back}</span>
           </button>
       </div>

       <div className="relative z-10 w-full max-w-xl px-6 animate-slide-up">
           <div className="glass-panel p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/10">
               <div className="text-center mb-12">
                   <h2 className="text-3xl md:text-4xl text-metallic tracking-widest mb-6">{t.aboutTitle}</h2>
                   <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"></div>
                   <p className="text-xs md:text-sm text-gray-400 leading-8 tracking-wider text-justify">{t.aboutIntro}</p>
                   
                   <div className="my-8 bg-gold/5 border-l-2 border-gold p-4 text-left">
                       <h4 className="text-gold text-xs tracking-[0.2em] uppercase font-bold mb-2 flex items-center gap-2">
                           <span className="text-base">✦</span> {t.warningTitle}
                       </h4>
                       <p className="text-[11px] text-gray-300 leading-6 tracking-wide">{t.warningBody}</p>
                   </div>
                   
                   <p className="text-xs md:text-sm text-gray-400 leading-8 tracking-wider text-justify">{t.aboutClosing}</p>
               </div>
               
               <form onSubmit={handleLogin} className="space-y-8 mt-8 border-t border-white/5 pt-8">
                   <div className="space-y-6">
                       <div className="group">
                            <label className="text-[9px] text-gold/70 uppercase tracking-[0.2em] mb-2 block group-hover:text-gold transition-colors">{t.name}</label>
                            <input required type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white font-serif text-lg focus:border-gold outline-none rounded-none transition-colors placeholder-gray-700" placeholder="Name" />
                       </div>
                       <div className="group">
                            <label className="text-[9px] text-gold/70 uppercase tracking-[0.2em] mb-2 block group-hover:text-gold transition-colors">{t.email}</label>
                            <input required type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} className="w-full bg-transparent border-b border-white/20 py-3 text-white font-serif text-lg focus:border-gold outline-none rounded-none transition-colors placeholder-gray-700" placeholder="Email" />
                       </div>
                   </div>
                   <button type="submit" disabled={!user.name || !user.email} className="w-full py-5 bg-gold text-black hover:bg-white transition-colors text-[11px] font-bold uppercase tracking-[0.4em] disabled:opacity-30 disabled:cursor-not-allowed mt-4 shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] duration-500">
                       {t.start}
                   </button>
               </form>
           </div>
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
    
    const { playingId, isPlaying, playSong, pause, isLoading, error } = useAudio();

    const handleListPlay = (e: React.MouseEvent, song: Song) => {
        e.stopPropagation(); 
        if (song.youtubeId) {
            setDetailSongId(song.id);
            return;
        }
        if (playingId === song.id && isPlaying) {
            pause();
        } else {
             let url = song.customAudioUrl;
             if (!url && song.driveId) {
                 url = `https://drive.google.com/uc?export=download&confirm=t&id=${song.driveId}`;
             }
             if (url) {
                 playSong(song.id, url, song.title);
             } else {
                 setDetailSongId(song.id);
             }
        }
    };

    return (
      <div className="min-h-screen w-full relative bg-[#050505] text-white pb-48 font-serif">
           <div className="fixed inset-0 z-0 bg-noise opacity-10"></div>
           
           {/* Sticky Header */}
           <div className="sticky top-0 z-40 glass-panel-heavy py-6 px-6 md:px-12 flex justify-between items-center transition-all duration-500 border-b border-white/5 shadow-2xl">
                <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors flex items-center gap-4 group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold hidden md:inline-block">{t.back}</span>
                </button>
                
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-1">{t.selection}</div>
                    <div className="flex gap-1">
                        {Array.from({length: MAX_VOTES}).map((_, i) => (
                            <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${i < selectedIds.length ? 'bg-gold shadow-[0_0_5px_#D4AF37]' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="text-[10px] uppercase tracking-[0.2em] font-sans text-gray-500">
                    <span className="text-white font-bold">{selectedIds.length}</span> <span className="mx-1">/</span> {MAX_VOTES}
                </div>
           </div>

           <div className="max-w-5xl mx-auto px-6 md:px-12 pt-20">
                <div className="text-center mb-24 space-y-6 animate-fade-in">
                    <h2 className="font-serif text-5xl md:text-7xl text-metallic tracking-wider uppercase drop-shadow-lg">{t.selection}</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-sans">{t.votingRule}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {songs.map((song, index) => {
                        const isSelected = selectedIds.includes(song.id);
                        const isThisPlaying = playingId === song.id;
                        const isThisBuffering = isThisPlaying && isLoading;
                        const isThisError = isThisPlaying && error;
                        const isVideo = !!song.youtubeId;

                        return (
                            <div 
                                key={song.id}
                                onClick={() => setDetailSongId(song.id)}
                                className={`
                                    group relative flex items-center justify-between py-5 px-6 md:px-10 cursor-pointer transition-all duration-500 rounded-sm border
                                    ${isSelected 
                                        ? 'bg-gold/5 border-gold shadow-[0_0_30px_rgba(197,160,89,0.1)] translate-x-2' 
                                        : 'bg-[#0a0a0a] border-white/5 hover:bg-[#111] hover:border-white/10 hover:shadow-2xl hover:translate-x-1'
                                    }
                                `}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${isSelected ? 'bg-gold' : 'bg-transparent group-hover:bg-white/20'}`}></div>

                                <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
                                    <div className="flex flex-col items-center gap-2 shrink-0 w-8 md:w-12">
                                        <span className={`text-[10px] font-sans font-bold tracking-widest ${isSelected ? 'text-gold' : 'text-gray-600'}`}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <button 
                                        onClick={(e) => handleListPlay(e, song)}
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0 relative z-20 overflow-hidden
                                            ${isThisError 
                                                ? 'border-red-500 text-red-500 bg-red-900/10' 
                                                : isThisPlaying 
                                                    ? 'border-gold bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-110' 
                                                    : 'border-white/20 text-gold hover:border-gold hover:bg-gold hover:text-black hover:scale-110'}
                                        `}
                                    >
                                        {isVideo ? (
                                            <PlayIcon className="w-3 h-3 ml-0.5" />
                                        ) : (
                                            isThisBuffering ? <SpinnerIcon className="w-3 h-3" /> : isThisError ? <RetryIcon className="w-3 h-3 animate-pulse" /> : isThisPlaying && isPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 ml-0.5" />
                                        )}
                                    </button>

                                    <div className="min-w-0 flex-1 py-1">
                                        <div className="flex items-center gap-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            {isVideo && <span className="text-[8px] bg-red-500/10 text-red-400 px-2 py-0.5 tracking-widest rounded-full border border-red-500/20">VIDEO</span>}
                                            <span className="text-[8px] text-gray-600 tracking-[0.2em] uppercase">Willwi Demo</span>
                                        </div>
                                        <h3 className={`font-serif text-lg md:text-xl tracking-wide truncate transition-all duration-300 ${isSelected ? 'text-gold' : 'text-gray-300 group-hover:text-white'}`}>
                                            {song.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="pl-4 shrink-0">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500
                                        ${isSelected ? 'bg-gold border-gold text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.5)]' : 'border-white/10 text-gray-600 group-hover:border-white/30 group-hover:text-gray-400'}
                                    `}>
                                        {isSelected ? <CheckIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
           </div>

           <div className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-700 ease-in-out transform ${selectedIds.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <div className="glass-panel-heavy p-6 flex justify-center shadow-[0_-10px_50px_rgba(0,0,0,0.8)] border-t border-gold/20">
                    <button 
                        onClick={onRequestSubmit}
                        className="bg-gold text-black hover:bg-white hover:text-black px-16 py-4 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] rounded-sm"
                    >
                        {t.confirm} <span className="ml-2 opacity-60">({selectedIds.length})</span>
                    </button>
                </div>
           </div>
      </div>
    );
};

const SuccessView: React.FC<{ t: any; setStep: (s: AppStep) => void; user: User }> = ({ t, setStep, user }) => (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden font-serif">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full"></div>
        <div className="max-w-2xl w-full relative z-10 glass-panel p-16 border-white/5 shadow-2xl">
            <div className="w-24 h-24 border border-gold rounded-full flex items-center justify-center text-gold mx-auto mb-12 animate-slide-up shadow-[0_0_40px_rgba(197,160,89,0.2)]">
                <CheckIcon className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-5xl text-metallic tracking-widest mb-10 animate-slide-up leading-tight">{t.thankYou}</h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto mb-10"></div>
            <p className="text-sm text-gray-400 leading-9 mb-16 whitespace-pre-wrap animate-slide-up tracking-wide px-4">{t.thankYouDesc}</p>
            <button onClick={() => setStep(AppStep.ARTIST_HOME)} className="text-[10px] uppercase tracking-[0.4em] text-gray-500 hover:text-gold transition-colors animate-slide-up border-b border-transparent hover:border-gold pb-2" style={{ animationDelay: '600ms' }}>{t.backToSite}</button>
        </div>
    </div>
);

// --- MAIN APP CONTROLLER ---

const AppContent = () => {
  // DEFAULT TO ARTIST HOME FOR NEW OFFICIAL SITE
  const [step, setStep] = useState<AppStep>(AppStep.ARTIST_HOME);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [], voteReasons: {} });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voteReasons, setVoteReasons] = useState<{ [id: number]: string }>({});
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [introAudioId, setIntroAudioId] = useState("");
  const [detailSongId, setDetailSongId] = useState<number | null>(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const { pause } = useAudio();

  // New Featured Song State
  const [homeFeaturedSong, setHomeFeaturedSong] = useState({ 
      title: ARTIST_DATA.featuredSong.title, 
      url: ARTIST_DATA.featuredSong.url 
  });

  useEffect(() => {
    const local = getSongs();
    setSongs(local);
    const syncCloud = async () => {
        try {
            const remote = await fetchRemoteSongs();
            if (remote && remote.length > 0) setSongs(remote);
        } catch (e) {
            console.warn("Cloud sync failed, using local/default data.");
        }
    };
    syncCloud();
    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) setIntroAudioId(globalConfig.introAudioUrl);
    
    // Load Homepage Featured Song Config
    if (globalConfig.homepageSongUrl) {
        setHomeFeaturedSong({
            title: globalConfig.homepageSongTitle || ARTIST_DATA.featuredSong.title,
            url: globalConfig.homepageSongUrl
        });
    }

    const savedSession = getUserSession();
    if (savedSession && savedSession.name && savedSession.email) {
        setUser(prev => ({ ...prev, name: savedSession.name, email: savedSession.email }));
    }
  }, []);

  useEffect(() => {
      if (user.name || user.email) saveUserSession(user);
  }, [user]);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  // Handler for Entering the Voting Event from Artist Page
  const handleEnterEvent = () => setStep(AppStep.INTRO);
  
  const handleStart = () => setStep(AppStep.AUTH);
  
  const handleBack = () => {
      if (step === AppStep.INTRO) setStep(AppStep.ARTIST_HOME);
      if (step === AppStep.AUTH) setStep(AppStep.INTRO);
      if (step === AppStep.VOTING) setStep(AppStep.AUTH);
      if (step === AppStep.SUCCESS) setStep(AppStep.ARTIST_HOME);
      if (step === AppStep.ADMIN) setStep(AppStep.ARTIST_HOME);
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

  const handleNextSong = () => {
      if (!detailSongId || songs.length === 0) return;
      const currentIndex = songs.findIndex(s => s.id === detailSongId);
      if (currentIndex === -1) return;
      const nextIndex = (currentIndex + 1) % songs.length;
      setDetailSongId(songs[nextIndex].id);
  };

  const handlePrevSong = () => {
      if (!detailSongId || songs.length === 0) return;
      const currentIndex = songs.findIndex(s => s.id === detailSongId);
      if (currentIndex === -1) return;
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      setDetailSongId(songs[prevIndex].id);
  };

  const handleFinalSubmit = (finalMessage: string) => {
      const finalReasons = { ...voteReasons };
      if (finalMessage.trim()) finalReasons[0] = finalMessage; 
      saveVote({ ...user, timestamp: new Date().toISOString(), votes: selectedIds, voteReasons: finalReasons });
      setShowFinalModal(false);
      setStep(AppStep.SUCCESS);
  };

  const t = TRANSLATIONS[lang];
  const currentSong = detailSongId ? songs.find(s => s.id === detailSongId) : null;

  if (step === AppStep.ADMIN) return <AdminView onBack={handleBack} />;

  return (
    <Layout>
        {step === AppStep.ARTIST_HOME && (
            <ArtistHomeView 
                t={t} 
                lang={lang} 
                setLang={setLang} 
                onEnterEvent={handleEnterEvent}
                onAdmin={() => setStep(AppStep.ADMIN)}
                featuredSong={homeFeaturedSong}
            />
        )}

        {step === AppStep.INTRO && <IntroView t={t} introAudioId={introAudioId} handleStart={handleStart} lang={lang} setLang={setLang} onBackToSite={() => setStep(AppStep.ARTIST_HOME)} />}
        {step === AppStep.AUTH && <AuthView t={t} user={user} setUser={setUser} handleLogin={handleLogin} handleBack={handleBack} lang={lang} setLang={setLang} />}
        {step === AppStep.VOTING && <VotingView t={t} songs={songs} selectedIds={selectedIds} MAX_VOTES={MAX_VOTES} voteReasons={voteReasons} onRequestSubmit={() => {if (selectedIds.length > 0) setShowFinalModal(true)}} handleBack={handleBack} setDetailSongId={setDetailSongId} />}
        {step === AppStep.SUCCESS && <SuccessView t={t} setStep={setStep} user={user} />}
        
        <SongDetailModal 
            isOpen={!!detailSongId}
            onClose={() => setDetailSongId(null)}
            song={currentSong || null}
            lang={lang}
            isVoted={currentSong ? selectedIds.includes(currentSong.id) : false}
            canVote={selectedIds.length < MAX_VOTES}
            onVote={toggleVote}
            defaultCover=""
            savedReason={currentSong && voteReasons[currentSong.id] ? voteReasons[currentSong.id] : ''}
            onNext={handleNextSong}
            onPrev={handlePrevSong}
        />
        
        {showFinalModal && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in font-serif">
                <div className="max-w-4xl w-full flex flex-col md:flex-row bg-[#0a0a0a] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden h-[80vh] md:h-auto">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80 z-20"></div>
                    
                    {/* Left: Receipt / Song List */}
                    <div className="w-full md:w-1/2 bg-[#050505] p-8 md:p-12 overflow-y-auto border-b md:border-b-0 md:border-r border-white/5">
                        <div className="mb-8">
                             <h3 className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-2">My Selection</h3>
                             <div className="text-2xl text-white font-serif italic">The Chosen {selectedIds.length}</div>
                        </div>
                        <ul className="space-y-4">
                            {selectedIds.map((id, index) => {
                                const s = songs.find(x => x.id === id);
                                if (!s) return null;
                                return (
                                    <li key={id} className="flex gap-4 items-baseline group">
                                        <span className="text-[10px] text-gray-600 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                                        <div className="flex-1 border-b border-white/5 pb-2 group-hover:border-gold/30 transition-colors">
                                            <span className="text-sm font-serif text-gray-300 group-hover:text-white transition-colors tracking-wide">{s.title}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Right: Message Input */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center">
                        <div>
                            <h2 className="font-serif text-3xl text-white tracking-wide mb-6 text-glow">{t.finalInquiryTitle}</h2>
                            <div className="h-[1px] w-12 bg-gold mx-auto box-glow mb-8"></div>
                        </div>
                        <p className="font-serif text-xs text-gray-400 leading-relaxed whitespace-pre-wrap mb-8 text-justify">{t.finalInquiryPrompt}</p>
                        
                        <textarea 
                            className="w-full bg-[#080808] border border-white/10 p-4 text-white font-serif outline-none focus:border-gold h-40 text-sm placeholder-gray-700 transition-colors mb-8 resize-none"
                            placeholder={t.finalInquiryPlaceholder}
                            onKeyDown={(e) => { if(e.key === 'Enter' && e.metaKey) handleFinalSubmit((e.target as HTMLTextAreaElement).value) }}
                        />
                        
                        <div className="flex gap-6 justify-center pt-4">
                            <button onClick={() => setShowFinalModal(false)} className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">{t.cancel}</button>
                            <button onClick={(e) => {
                                const txt = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                                handleFinalSubmit(txt);
                            }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-gold transition-colors text-glow border-b border-gold/50 pb-1 hover:border-gold">{t.submitFinal}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
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
