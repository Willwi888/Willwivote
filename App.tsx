
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { getSongs, getGlobalConfig, saveUserSession, getUserSession, fetchRemoteSongs } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';
import AudioPlayer from './components/AudioPlayer';

// --- CONFIGURATION ---
// NO EXTERNAL IMAGES. PURE CSS AESTHETICS.

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
    <div className="flex gap-6 z-50 pt-1">
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

// --- VIEW COMPONENTS ---

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
      <div className="relative h-screen w-full bg-[#020202] overflow-hidden flex flex-col justify-between font-serif">
        <div className="absolute inset-0 z-0 select-none bg-black">
            {/* PROCEDURAL BACKGROUND: Dark Radial Gradient - Brand Safe */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1a1a1a_0%,_#000000_80%)]"></div>
            {/* Gold Ambient Atmosphere */}
            <div className="absolute top-[-10%] left-[20%] w-[80vw] h-[80vw] bg-gold/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[60vw] bg-[#8A7035]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        </div>

        {/* Top Bar */}
        <div className="w-full px-8 py-8 flex justify-between items-start z-50 animate-fade-in relative">
            <div className="flex flex-col gap-2">
                 {introAudioId && (
                    <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-full pl-1 pr-5 py-1.5 hover:bg-white/10 transition-all group cursor-pointer">
                        <div className="scale-90">
                            <AudioPlayer 
                                id="intro" 
                                src={introAudioId} 
                                title="Intro" 
                                variant="minimal" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-300 group-hover:text-gold uppercase tracking-widest font-medium transition-colors">Play Intro</span>
                        </div>
                    </div>
                )}
            </div>
            <LangSwitcher lang={lang} setLang={setLang} />
        </div>

        {/* Hero Content */}
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

        {/* Footer */}
        <div className="absolute bottom-6 w-full flex justify-between px-8 z-50 opacity-40 hover:opacity-100 transition-opacity">
             <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans">© 2026 Willwi Music</div>
             <button onClick={onAdmin} className="text-[9px] text-gray-500 hover:text-white uppercase tracking-widest font-sans">Staff Only</button>
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
           {/* SAFE BACKGROUND */}
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
                 // Even if no audio, open detail to vote
                 setDetailSongId(song.id);
             }
        }
    };

    return (
      <div className="min-h-screen w-full relative bg-[#050505] text-white pb-48 font-serif">
           <div className="fixed inset-0 z-0 bg-noise opacity-10"></div>
           
           {/* Sticky Header with Glassmorphism */}
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

                <div className="grid grid-cols-1 gap-4">
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
                                {/* Track Number */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${isSelected ? 'bg-gold' : 'bg-transparent group-hover:bg-white/20'}`}></div>

                                <div className="flex items-center gap-6 md:gap-12 flex-1 min-w-0">
                                    <div className="flex flex-col items-center gap-2 shrink-0 w-12">
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

                                <div className="pl-6 shrink-0">
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

           {/* Sticky Bottom Submit */}
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
            <button onClick={() => setStep(AppStep.INTRO)} className="text-[10px] uppercase tracking-[0.4em] text-gray-500 hover:text-gold transition-colors animate-slide-up border-b border-transparent hover:border-gold pb-2" style={{ animationDelay: '600ms' }}>{t.close}</button>
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
  const [introAudioId, setIntroAudioId] = useState("");
  const [detailSongId, setDetailSongId] = useState<number | null>(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const { pause } = useAudio();

  useEffect(() => {
    // 1. Initial Load from Local (Instant)
    const local = getSongs();
    setSongs(local);
    
    // 2. Async Cloud Sync (Silent Update)
    // Even if this fails, we have the local list
    const syncCloud = async () => {
        try {
            const remote = await fetchRemoteSongs();
            if (remote && remote.length > 0) {
                setSongs(remote);
            }
        } catch (e) {
            console.warn("Cloud sync failed, using local/default data.");
        }
    };
    syncCloud();

    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) setIntroAudioId(globalConfig.introAudioUrl);

    const savedSession = getUserSession();
    if (savedSession && savedSession.name && savedSession.email) {
        setUser(prev => ({ ...prev, name: savedSession.name, email: savedSession.email }));
    }
  }, []);

  useEffect(() => {
      if (user.name || user.email) saveUserSession(user);
  }, [user]);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const handleStart = () => setStep(AppStep.AUTH);
  
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
            defaultCover="" // No default image, Modal handles fallback
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
