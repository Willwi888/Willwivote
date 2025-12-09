
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import AudioPlayer from './components/AudioPlayer';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon } from './components/Icons';
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
    
    // Check if Intro is currently playing in global context
    const isIntroPlaying = playingId === 'intro' && isPlaying;

    const handleToggleIntro = () => {
        if (isIntroPlaying) {
            pause();
        } else if (playingId === 'intro' && !isPlaying) {
            resume();
        } else {
            import('./constants').then(m => {
                 const url = m.getAudioUrl(introAudioId);
                 playSong('intro', url, "Intro");
            });
        }
    };

    const onEnterClick = () => {
        // UNLOCK AUDIO FOR MOBILE: 
        // Plays a silent buffer to ensure the audioContext is running within a user gesture
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
            <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isIntroPlaying ? 'opacity-20' : 'opacity-40'} z-10`}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10"></div>
            <img 
                src={ARTIST_IMAGE_URL} 
                alt="Beloved Cover" 
                className={`w-full h-full object-cover transition-transform duration-[20s] ease-in-out ${isIntroPlaying ? 'scale-110' : 'scale-100'}`}
            />
        </div>

        <LangSwitcher lang={lang} setLang={setLang} />
        
        <FadeIn delay={200} className="relative z-20 flex flex-col items-center justify-center max-w-md px-6 w-full">
            <div className="mb-10 space-y-6">
                <span className="block text-[10px] uppercase tracking-[0.6em] text-gray-300 font-sans opacity-90">{t.subtitle}</span>
                <h1 className="font-serif text-6xl md:text-8xl text-white tracking-wider italic drop-shadow-2xl">Beloved</h1>
                <div className="h-px w-16 bg-white/40 mx-auto"></div>
                <h2 className="font-serif text-2xl text-gray-100 tracking-[0.2em] font-light drop-shadow-md">{t.title}</h2>
            </div>

            {/* Central Play Button controlling Global Audio */}
            <button 
                onClick={handleToggleIntro}
                className={`
                    group w-20 h-20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm mb-12 transition-all duration-500 active:scale-90
                    ${isIntroPlaying ? 'bg-white text-black scale-110 border-white' : 'bg-black/20 text-white hover:bg-white/10 hover:scale-105'}
                `}
            >
                {isIntroPlaying ? (
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
    
    return (
      <div className="min-h-screen pb-32 relative max-w-[500px] mx-auto">
           <div className="fixed top-0 left-0 w-full z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
               <div className="max-w-[500px] mx-auto px-6 py-4 flex items-center justify-between">
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

           <div className="pt-24 px-4 space-y-3">
               <div className="text-center mb-8 px-4">
                   <p className="text-gray-400 text-xs leading-relaxed font-serif italic">{t.votingRule}</p>
               </div>

               {songs.map((song, index) => {
                   const isSelected = selectedIds.includes(song.id);
                   const isPlaying = playingId === song.id;
                   
                   return (
                       <FadeIn key={song.id} delay={index * 50} className="w-full">
                           <div 
                              onClick={() => setDetailSongId(song.id)}
                              className={`
                                  relative group p-4 rounded-sm border transition-all duration-300 cursor-pointer active:scale-[0.98]
                                  ${isSelected ? 'bg-white/5 border-gold/50' : 'bg-[#111] border-white/5 hover:border-white/20'}
                              `}
                           >
                               <div className="flex items-center gap-4">
                                   <span className={`font-mono text-lg ${isSelected ? 'text-gold' : 'text-gray-600'}`}>
                                       {String(index + 1).padStart(2, '0')}
                                   </span>

                                   <div className="flex-1 min-w-0">
                                       <h3 className={`font-serif text-lg truncate ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                           {song.title}
                                       </h3>
                                       {isSelected && voteReasons[song.id] && (
                                           <p className="text-[10px] text-gray-500 italic mt-1 truncate">"{voteReasons[song.id]}"</p>
                                       )}
                                       {/* Mini Equalizer if Playing */}
                                       {isPlaying && (
                                           <div className="absolute bottom-4 right-16 flex gap-0.5 h-3 items-end opacity-50">
                                               <div className="w-0.5 bg-gold animate-[pulse_0.6s_ease-in-out_infinite] h-full"></div>
                                               <div className="w-0.5 bg-gold animate-[pulse_0.8s_ease-in-out_infinite] h-2/3"></div>
                                               <div className="w-0.5 bg-gold animate-[pulse_1.0s_ease-in-out_infinite] h-full"></div>
                                           </div>
                                       )}
                                   </div>

                                   <div className="flex items-center gap-3">
                                       {/* Audio Player is now just a remote button */}
                                       <div onClick={(e) => { e.stopPropagation(); }} className="active:scale-90 transition-transform">
                                          <AudioPlayer 
                                              id={song.id}
                                              driveId={song.driveId}
                                              src={song.customAudioUrl}
                                              title={song.title}
                                          />
                                       </div>
                                       <button
                                           onClick={(e) => { e.stopPropagation(); toggleVote(song.id); }}
                                           disabled={!isSelected && selectedIds.length >= MAX_VOTES}
                                           className={`
                                               w-8 h-8 flex items-center justify-center rounded-full border transition-all active:scale-90
                                               ${isSelected 
                                                   ? 'bg-gold border-gold text-black' 
                                                   : 'border-gray-700 text-gray-700 hover:border-white hover:text-white'
                                               }
                                               ${(!isSelected && selectedIds.length >= MAX_VOTES) ? 'opacity-30 cursor-not-allowed' : ''}
                                           `}
                                       >
                                           {isSelected ? <CheckIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                                       </button>
                                   </div>
                               </div>
                           </div>
                       </FadeIn>
                   );
               })}
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

const SuccessView: React.FC<{ t: any; setStep: (s: AppStep) => void }> = ({ t, setStep }) => (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center max-w-[500px] mx-auto">
        <FadeIn>
            <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-8 text-gold">
                <CheckIcon className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-4xl text-white mb-4 italic">{t.thankYou}</h2>
            <p className="text-gray-400 text-xs tracking-widest uppercase max-w-xs mx-auto leading-relaxed mb-12">
                {t.thankYouDesc}
            </p>
            <div className="flex gap-6 justify-center">
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

  const { pause } = useAudio();

  useEffect(() => {
    setSongs(getSongs());
    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) setIntroAudioId(globalConfig.introAudioUrl);
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleStart = () => {
      pause(); // Stop intro music
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
            <SuccessView t={t} setStep={setStep} />
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
