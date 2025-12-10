
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig, extractYouTubeId } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';
import AudioPlayer from './components/AudioPlayer';

// --- CONFIGURATION ---
const DEFAULT_FEATURED_AUDIO_ID = ""; 
// 請將此連結替換為您剛才上傳的那張橫式西裝照片的連結，以獲得最佳效果
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
    <div className="flex gap-6 z-50 pt-1">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-500 font-serif ${lang === l ? 'text-gold border-b border-gold pb-1 text-glow-gold' : 'text-gray-500 hover:text-white'}`}
            >
                {l}
            </button>
        ))}
    </div>
);

// --- PREMIUM VIEWS ---

const IntroView: React.FC<{ 
    t: any; 
    introAudioId: string; 
    handleStart: () => void;
    lang: Language;
    setLang: (l: Language) => void;
    onAdmin: () => void;
}> = ({ t, introAudioId, handleStart, lang, setLang, onAdmin }) => {
    const { initializeAudio } = useAudio();
    
    const onEnterClick = () => {
        initializeAudio(); 
        handleStart();
    };

    return (
      <div className="relative h-screen w-full bg-[#000000] overflow-hidden flex flex-col justify-between">
        
        {/* HERO VISUAL - FULL SCREEN (No cropping) */}
        <div className="absolute inset-0 z-0 select-none">
            {/* 
                UPDATED: h-full for both mobile and desktop.
                object-center to keep the subject centered.
            */}
            <img 
                src={ARTIST_IMAGE_URL}
                alt="Artist"
                className="w-full h-full object-cover object-center md:object-center opacity-100 transition-transform duration-[60s] hover:scale-105"
            />
            
            {/* Cinematic Gradients for Text Readability */}
            {/* Top Gradient for Header */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent z-10"></div>
            
            {/* Bottom Gradient for Title & Button - Stronger on mobile */}
            <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
            
            {/* Side Gradient (Desktop) for left-aligned text */}
            <div className="absolute inset-y-0 left-0 w-[50vw] bg-gradient-to-r from-black/60 via-transparent to-transparent z-10 hidden md:block"></div>
        </div>

        {/* HEADER */}
        <div className="w-full px-6 py-6 flex justify-between items-start z-50 animate-fade-in relative">
            <div className="flex flex-col gap-1">
                 <h1 className="text-white font-serif tracking-[0.2em] text-lg md:text-2xl font-bold drop-shadow-lg">WILLWI</h1>
                 <p className="text-[9px] tracking-[0.3em] text-gold uppercase font-serif drop-shadow-md">The 2026 Collection</p>
            </div>
            
            <div className="flex flex-col items-end gap-6">
                <LangSwitcher lang={lang} setLang={setLang} />
                
                {/* HOMEPAGE AUDIO PLAYER (NEW REQUEST) */}
                {introAudioId && (
                    <div className="animate-fade-in flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-full pl-4 pr-1 py-1 border border-white/10 hover:border-gold/50 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-gray-300 hidden md:block">Intro Music</span>
                        <AudioPlayer 
                            id="intro" 
                            src={introAudioId} 
                            title="Intro" 
                            variant="minimal" 
                        />
                    </div>
                )}
            </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-20 flex flex-col items-center md:items-start px-8 pb-16 md:pb-24 md:pl-24 w-full mt-auto">
            
            <h1 className="font-serif text-4xl md:text-8xl text-white tracking-widest leading-none mb-6 text-center md:text-left drop-shadow-2xl text-glow">
                {t.title}
            </h1>
            
            <div className="h-[1px] w-12 bg-gold mb-8 md:ml-1 box-glow shadow-[0_0_10px_gold]"></div>

            <p className="font-serif text-xs text-gray-300 tracking-[0.2em] leading-relaxed max-w-lg mb-12 text-center md:text-left text-shadow-md">
                {t.subtitle}
            </p>

            <button 
                onClick={onEnterClick}
                className="group relative px-12 py-4 border border-white/30 hover:border-gold transition-all duration-500 bg-black/20 backdrop-blur-sm overflow-hidden"
            >
                <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 text-[10px] font-bold text-white group-hover:text-gold uppercase tracking-[0.4em] transition-colors text-glow-white">
                    {t.enter}
                </span>
            </button>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-4 right-6 z-50 hidden md:block opacity-50 hover:opacity-100 transition-opacity">
             <button onClick={onAdmin} className="text-[9px] text-gray-400 hover:text-white uppercase tracking-[0.2em] drop-shadow-md">Staff Access</button>
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#000000]">
       
       {/* LEFT (Mobile: TOP): Image Area - PURE IMAGE, NO TEXT */}
       <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden bg-[#050505]">
           <img 
               src={ARTIST_IMAGE_URL} 
               className="w-full h-full object-cover object-top" 
               alt="Artist" 
           />
           <button onClick={handleBack} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <ArrowLeftIcon className="w-4 h-4" />
               <span className="text-[9px] uppercase tracking-[0.2em] font-serif">{t.back}</span>
           </button>
       </div>

       {/* RIGHT (Mobile: BOTTOM): Content Area - MAGAZINE LAYOUT */}
       <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen bg-[#000000] flex flex-col justify-center px-8 md:px-32 py-16 relative z-10">
           <div className="max-w-md mx-auto w-full flex flex-col h-full justify-center space-y-12">
               
               {/* 1. Typography Header */}
               <div className="text-center md:text-left animate-slide-up">
                   <div className="w-8 h-[1px] bg-gold mx-auto md:mx-0 mb-6"></div>
                   <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide leading-tight mb-8 text-glow">{t.aboutTitle}</h2>
                   <p className="font-serif text-sm text-gray-400 leading-8 tracking-wide text-justify">{t.aboutBody}</p>
               </div>

               {/* 2. Minimalist Form */}
               <form onSubmit={handleLogin} className="space-y-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
                   <div className="space-y-8">
                       <div className="group relative">
                            <input 
                                required
                                type="text" 
                                value={user.name}
                                onChange={e => setUser({...user, name: e.target.value})}
                                placeholder={t.name}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-lg text-white font-serif placeholder-gray-700 focus:border-gold outline-none transition-all"
                            />
                       </div>
                       <div className="group relative">
                            <input 
                                required
                                type="email" 
                                value={user.email}
                                onChange={e => setUser({...user, email: e.target.value})}
                                placeholder={t.email}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-lg text-white font-serif placeholder-gray-700 focus:border-gold outline-none transition-all"
                            />
                       </div>
                   </div>
                   
                   <button 
                       type="submit" 
                       disabled={!user.name || !user.email}
                       className="w-full py-4 border border-white/20 text-white hover:border-gold hover:text-gold text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 mt-4 disabled:opacity-30 disabled:border-white/10"
                   >
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
    
    // Use Error State from Context
    const { playingId, isPlaying, playSong, pause, isLoading, error } = useAudio();

    const handleListPlay = (e: React.MouseEvent, song: Song) => {
        e.stopPropagation(); 
        if (playingId === song.id && isPlaying) {
            pause();
        } else {
             // Replicate AudioPlayer logic for list button
             let url = song.customAudioUrl;
             if (!url && song.driveId) url = `https://drive.google.com/uc?export=download&confirm=t&id=${song.driveId}`;
             
             if (url) {
                 playSong(song.id, url, song.title);
             } else if (song.youtubeId) {
                 setDetailSongId(song.id);
             }
        }
    };

    return (
      <div className="min-h-screen w-full relative bg-[#000000] text-white pb-40 font-serif">
           
           {/* SUBTLE AMBIENCE */}
           <div className="fixed inset-0 z-0 bg-noise opacity-10"></div>
           <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-[#111] to-transparent z-0 opacity-50"></div>

           {/* CONTENT LAYER */}
           <div className="relative z-10">
                {/* HEADER */}
                <div className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-xl py-5 px-6 flex justify-between items-center border-b border-white/10">
                    <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors flex items-center gap-3 group">
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[9px] uppercase tracking-[0.25em] hidden md:inline-block">{t.back}</span>
                    </button>
                    
                    <div className="text-[11px] uppercase tracking-[0.25em] font-serif">
                        <span className="text-gray-500">{t.selection}</span>
                        <span className="mx-3 text-gold text-glow-gold">{selectedIds.length} / {MAX_VOTES}</span>
                    </div>
                    
                    <div className="w-5"></div> 
                </div>

                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="text-center mb-24 space-y-6 animate-fade-in">
                        <h2 className="font-serif text-4xl md:text-5xl text-white tracking-widest uppercase leading-snug text-glow">{t.selection}</h2>
                        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8 opacity-70"></div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em]">{t.votingRule}</p>
                    </div>

                    {/* LIST LAYOUT - JEWELRY STYLE */}
                    <div className="flex flex-col gap-0 border-t border-white/10">
                        {songs.map((song, index) => {
                            const isSelected = selectedIds.includes(song.id);
                            const isThisPlaying = playingId === song.id;
                            const isThisBuffering = isThisPlaying && isLoading;
                            const isThisError = isThisPlaying && error;

                            return (
                                <div 
                                    key={song.id}
                                    onClick={() => setDetailSongId(song.id)}
                                    className={`
                                        group relative flex items-center justify-between py-8 px-4 md:px-8 cursor-pointer transition-all duration-500 border-b border-white/10
                                        hover:bg-white/[0.02] hover:border-white/20
                                        ${isSelected ? 'bg-gold/[0.02]' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-6 md:gap-10 flex-1 min-w-0">
                                        {/* 1. PLAY BUTTON (JEWELRY STYLE) */}
                                        <button 
                                            onClick={(e) => handleListPlay(e, song)}
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0 z-20 relative overflow-hidden
                                                ${isThisError 
                                                    ? 'border-red-500 text-red-500 bg-red-900/20 shadow-[0_0_15px_red]' 
                                                    : isThisPlaying 
                                                        ? 'border-gold bg-gold text-black shadow-[0_0_20px_rgba(197,160,89,0.4)] scale-110' 
                                                        : 'border-white/20 text-gold hover:border-gold hover:bg-gold hover:text-black'}
                                            `}
                                            title={isThisError ? "Playback Error" : "Play Preview"}
                                        >
                                            {isThisBuffering ? (
                                                <SpinnerIcon className="w-4 h-4" />
                                            ) : isThisError ? (
                                                <RetryIcon className="w-4 h-4 animate-pulse" />
                                            ) : isThisPlaying && isPlaying ? (
                                                <PauseIcon className="w-4 h-4" />
                                            ) : (
                                                <PlayIcon className="w-4 h-4 ml-0.5" />
                                            )}
                                        </button>

                                        {/* 2. TEXT INFO */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[9px] font-serif tracking-widest ${isSelected ? 'text-gold' : 'text-gray-600'}`}>
                                                    NO.{String(index + 1).padStart(2, '0')}
                                                </span>
                                                {isThisPlaying && !isThisError && (
                                                    <span className="w-1 h-1 bg-gold rounded-full animate-pulse shadow-[0_0_5px_gold]"></span>
                                                )}
                                            </div>
                                            
                                            <h3 className={`font-serif text-xl md:text-2xl tracking-wide truncate transition-all duration-500 
                                                ${isSelected ? 'text-gold text-glow-gold' : 'text-gray-300 group-hover:text-white group-hover:text-glow-white'}
                                            `}>
                                                {song.title}
                                            </h3>
                                            
                                            {/* Error Message Text */}
                                            {isThisError && (
                                                <p className="text-[9px] text-red-500 uppercase tracking-widest mt-2 animate-pulse">
                                                    Unavailable / Retry
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. SELECTION INDICATOR */}
                                    <div className="pl-6 md:pl-12 shrink-0">
                                            <div className={`
                                                w-6 h-6 transition-all duration-500 transform
                                                ${isSelected ? 'text-gold scale-125 drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]' : 'text-gray-800 group-hover:text-gray-500'}
                                            `}>
                                                {isSelected ? <CheckIcon className="w-full h-full" /> : <HeartIcon className="w-full h-full" />}
                                            </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BOTTOM ACTION BAR - FLOATING GLASS */}
                <div className={`fixed bottom-0 left-0 w-full z-40 transition-transform duration-700 ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="bg-[#000000]/80 backdrop-blur-xl border-t border-white/10 p-6 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,1)]">
                        <button 
                            onClick={onRequestSubmit}
                            className="bg-gold text-black hover:bg-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        >
                            {t.confirm} ({selectedIds.length})
                        </button>
                    </div>
                </div>
           </div>
      </div>
    );
};

const SuccessView: React.FC<{ t: any; setStep: (s: AppStep) => void; user: User }> = ({ t, setStep, user }) => (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full"></div>
        
        <div className="max-w-lg w-full relative z-10">
            <div className="w-20 h-20 border border-gold rounded-full flex items-center justify-center text-gold mx-auto mb-12 animate-slide-up shadow-[0_0_30px_rgba(197,160,89,0.2)]">
                <CheckIcon className="w-8 h-8" />
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl text-white tracking-widest mb-10 animate-slide-up leading-tight text-glow">{t.thankYou}</h2>
            
            <p className="font-serif text-sm text-gray-400 leading-9 mb-16 whitespace-pre-wrap animate-slide-up tracking-wide px-4">{t.thankYouDesc}</p>
            
            <button 
                onClick={() => setStep(AppStep.INTRO)} 
                className="text-[10px] uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-colors animate-slide-up border-b border-transparent hover:border-gold pb-1" style={{ animationDelay: '600ms' }}
            >
                {t.close}
            </button>
        </div>
    </div>
);

// --- MAIN APP LOGIC ---
const AppContent = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [], voteReasons: {} });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voteReasons, setVoteReasons] = useState<{ [id: number]: string }>({});
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [introAudioId, setIntroAudioId] = useState(DEFAULT_FEATURED_AUDIO_ID);
  const [detailSongId, setDetailSongId] = useState<number | null>(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const { pause, playingId } = useAudio();

  useEffect(() => {
    setSongs(getSongs());
    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) setIntroAudioId(globalConfig.introAudioUrl);
  }, [step]);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const handleStart = () => {
      // Don't stop intro music immediately, let it flow until they play something else or enter deeply
      // if (playingId === 'intro') pause(); 
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
        {step === AppStep.INTRO && <IntroView t={t} introAudioId={introAudioId} handleStart={handleStart} lang={lang} setLang={setLang} onAdmin={() => setStep(AppStep.ADMIN)} />}
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
            defaultCover={ARTIST_IMAGE_URL}
            savedReason={currentSong && voteReasons[currentSong.id] ? voteReasons[currentSong.id] : ''}
            onNext={handleNextSong}
            onPrev={handlePrevSong}
        />
        
        {showFinalModal && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in font-serif">
                <div className="max-w-md w-full space-y-8 text-center bg-[#0a0a0a] p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80"></div>
                    
                    <div>
                        <h2 className="font-serif text-3xl text-white tracking-wide mb-6 text-glow">{t.finalInquiryTitle}</h2>
                        <div className="h-[1px] w-12 bg-gold mx-auto box-glow"></div>
                    </div>

                    <p className="font-serif text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{t.finalInquiryPrompt}</p>
                    
                    <textarea 
                        className="w-full bg-[#050505] border border-white/10 p-4 text-white font-serif outline-none focus:border-gold h-32 text-sm placeholder-gray-700 transition-colors"
                        placeholder={t.finalInquiryPlaceholder}
                        onKeyDown={(e) => { if(e.key === 'Enter' && e.metaKey) handleFinalSubmit((e.target as HTMLTextAreaElement).value) }}
                    />
                    
                    <div className="flex gap-6 justify-center pt-4">
                        <button onClick={() => setShowFinalModal(false)} className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">{t.cancel}</button>
                        <button onClick={(e) => {
                            const txt = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                            handleFinalSubmit(txt);
                        }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-gold transition-colors text-glow">{t.submitFinal}</button>
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
