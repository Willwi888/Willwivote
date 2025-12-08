
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import AudioPlayer from './components/AudioPlayer';
import { HeartIcon, SpinnerIcon, ArrowLeftIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
const FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb";
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [] });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');

  // Modal State
  const [detailSongId, setDetailSongId] = useState<number | null>(null);

  useEffect(() => {
    setSongs(getSongs());
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Handlers
  const handleStart = () => setStep(AppStep.AUTH);
  
  const handleBack = () => {
      if (step === AppStep.AUTH) setStep(AppStep.INTRO);
      if (step === AppStep.VOTING) setStep(AppStep.AUTH);
      if (step === AppStep.SUCCESS) setStep(AppStep.INTRO);
      if (step === AppStep.ADMIN) setStep(AppStep.INTRO);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.email) {
      setStep(AppStep.VOTING);
    }
  };

  const toggleVote = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < MAX_VOTES) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const handleSubmitVotes = () => {
    if (selectedIds.length === MAX_VOTES) {
      const completeUser: User = {
        ...user,
        timestamp: new Date().toISOString(),
        votes: selectedIds
      };
      saveVote(completeUser);
      setStep(AppStep.SUCCESS);
    }
  };

  const togglePlay = (id: number) => {
    setIntroPlaying(false);
    setPlayingId(prev => prev === id ? null : id);
  };

  const toggleIntroPlay = () => {
    setPlayingId(null);
    setIntroPlaying(!introPlaying);
  };

  const t = TRANSLATIONS[lang];

  // --- Common Components ---
  const LangSwitcher = () => (
    <div className="absolute top-6 right-6 z-50 flex gap-4">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] uppercase tracking-widest transition-colors ${lang === l ? 'text-white border-b border-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                {l}
            </button>
        ))}
    </div>
  );

  const Footer = () => (
    <footer className="py-12 text-center space-y-4 border-t border-white/5 mt-auto">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{t.copyright}</p>
        <button 
            onClick={() => setStep(AppStep.ADMIN)}
            className="text-[9px] text-gray-800 hover:text-gray-500 transition-colors uppercase tracking-widest"
        >
            {t.managerLogin}
        </button>
    </footer>
  );

  // --- Views ---

  const IntroView = () => {
    const { setBgImage } = useContext(BackgroundContext);
    
    useEffect(() => {
      setBgImage(ARTIST_IMAGE_URL);
      return () => setBgImage(null);
    }, [setBgImage]);

    return (
      <div className="flex flex-col min-h-screen px-8 pt-12 relative overflow-hidden">
        <LangSwitcher />
        
        {/* Decorative Top Line */}
        <FadeIn delay={0} className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent mx-auto mb-8" />

        <FadeIn delay={200} className="relative z-10 flex flex-col items-center flex-1 justify-center">
            {/* Main Title Block */}
            <div className="text-center mb-12">
                <span className="block text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-4 font-sans">{t.subtitle}</span>
                <h1 className="font-serif text-6xl md:text-7xl text-white tracking-wide italic mb-2 drop-shadow-2xl">
                    Beloved
                </h1>
                <div className="h-px w-12 bg-white/20 mx-auto mt-6 mb-6"></div>
                <h2 className="font-serif text-2xl text-gray-300 tracking-widest font-light">{t.title}</h2>
            </div>

            {/* Album Art Card */}
            <div className="relative group w-64 h-64 mx-auto mb-12 cursor-pointer" onClick={toggleIntroPlay}>
                <div className={`absolute inset-0 bg-white/5 rounded-sm transform transition-transform duration-700 ease-out ${introPlaying ? 'scale-105 rotate-2' : 'scale-100 rotate-0'}`}></div>
                <div className="relative w-full h-full overflow-hidden shadow-2xl border border-white/10 rounded-sm">
                    <img 
                        src={ARTIST_IMAGE_URL} 
                        alt="Beloved Cover" 
                        className={`w-full h-full object-cover transition-all duration-[2s] ease-in-out ${introPlaying ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}`}
                    />
                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                         <div className={`w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${introPlaying ? 'bg-white text-black border-transparent' : 'text-white hover:bg-white/10 hover:scale-110'}`}>
                            {introPlaying ? (
                                <div className="w-2.5 h-2.5 bg-black rounded-[1px]" />
                            ) : (
                                <div className="w-0 h-0 border-l-[10px] border-l-current border-y-[6px] border-y-transparent ml-1" />
                            )}
                         </div>
                    </div>
                </div>
                {/* Audio Component (Hidden logic) */}
                <div className="hidden">
                     <AudioPlayer 
                        driveId={FEATURED_AUDIO_ID}
                        isPlaying={introPlaying}
                        onToggle={toggleIntroPlay}
                        title="Intro"
                     />
                </div>
            </div>

            <div className="max-w-xs mx-auto text-center space-y-8">
                <p className="font-serif text-lg leading-relaxed text-gray-300 italic opacity-80">
                    "Gratitude."
                </p>
                
                <button 
                    onClick={handleStart}
                    className="group relative px-10 py-4 overflow-hidden rounded-sm transition-all duration-500"
                >
                    <span className="absolute inset-0 w-full h-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/20"></span>
                    <span className="relative z-10 font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-white group-hover:tracking-[0.4em] transition-all duration-500">
                        {t.enter}
                    </span>
                </button>
            </div>
        </FadeIn>

        <div className="mt-auto py-12 flex justify-center gap-8 relative z-10">
            {SOCIAL_LINKS.map(link => (
                <a 
                    key={link.name} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors border-b border-transparent hover:border-white/50 pb-0.5"
                >
                    {link.name}
                </a>
            ))}
        </div>
        <Footer />
      </div>
    );
  };

  const AuthView = () => (
    <div className="flex flex-col min-h-screen items-center justify-center px-8 relative">
       <LangSwitcher />
       <button 
         onClick={handleBack} 
         className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors z-50 flex items-center gap-2 group"
       >
         <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span className="text-[10px] uppercase tracking-widest">{t.back}</span>
       </button>

       {/* Background Decoration */}
       <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

       <FadeIn className="w-full max-w-sm">
        <div className="text-center mb-16">
             <div className="w-px h-12 bg-white/20 mx-auto mb-6"></div>
             <h2 className="font-serif text-3xl text-white italic mb-3">Identification</h2>
             <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-sans">Exclusive Access</p>
        </div>
      
        <form onSubmit={handleLogin} className="space-y-12">
          <div className="space-y-8">
            <div className="relative group">
                <input 
                type="text" 
                required
                value={user.name}
                onChange={e => setUser({...user, name: e.target.value})}
                className="block py-3 px-0 w-full text-lg text-center text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-white peer font-serif placeholder-transparent transition-colors"
                placeholder="Name"
                autoComplete="off"
                />
                <label className="absolute text-xs text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[50%] peer-focus:left-0 peer-focus:right-0 peer-focus:text-center peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-white tracking-widest uppercase w-full text-center">
                    {t.name}
                </label>
            </div>

            <div className="relative group">
                <input 
                type="email" 
                required
                value={user.email}
                onChange={e => setUser({...user, email: e.target.value})}
                className="block py-3 px-0 w-full text-lg text-center text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-white peer font-serif placeholder-transparent transition-colors"
                placeholder="Email"
                autoComplete="off"
                />
                 <label className="absolute text-xs text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[50%] peer-focus:left-0 peer-focus:right-0 peer-focus:text-center peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-white tracking-widest uppercase w-full text-center">
                    {t.email}
                </label>
            </div>
          </div>

          <div className="text-center pt-4">
             <button 
              type="submit"
              disabled={!user.name || !user.email}
              className="group relative inline-block transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.4em] text-white group-hover:text-gray-300 transition-colors">
                {t.start}
              </span>
              <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-white group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
            </button>
          </div>
        </form>
      </FadeIn>
      <div className="mt-auto w-full">
         <Footer />
      </div>
    </div>
  );

  const VotingView = () => {
    const remaining = MAX_VOTES - selectedIds.length;
    const isComplete = remaining === 0;

    return (
      <div className="relative min-h-screen pb-32">
        <LangSwitcher />
        
        {/* Sticky Elegant Header */}
        <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300 pt-8">
            <div className="px-6 py-6 flex justify-between items-end max-w-[500px] mx-auto relative">
                 <button 
                    onClick={handleBack} 
                    className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors flex items-center gap-2 group"
                 >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 </button>

                <div className="mt-8">
                    <h1 className="font-serif text-2xl text-white italic">{t.title}</h1>
                    <p className="text-[9px] text-gray-500 mt-1 max-w-[150px] leading-tight">{t.votingRule}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.selection}</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`font-serif text-xl ${isComplete ? "text-white" : "text-gray-400"}`}>{selectedIds.length}</span>
                        <span className="font-serif text-sm text-gray-700">/</span>
                        <span className="font-serif text-sm text-gray-700">{MAX_VOTES}</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Song List Grid */}
        <div className="px-4 py-8 grid grid-cols-2 gap-3">
          {songs.map((song) => {
            const isSelected = selectedIds.includes(song.id);
            const isPlaying = playingId === song.id;
            const disabled = !isSelected && isComplete;

            return (
              <div 
                key={song.id}
                onClick={() => setDetailSongId(song.id)}
                className={`
                    group relative flex flex-col p-3 rounded-sm border transition-all duration-500 cursor-pointer
                    ${isSelected ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}
                `}
              >
                {/* Cover & Play */}
                <div className="relative aspect-square w-full mb-3 bg-[#111] overflow-hidden">
                    <img src={song.customImageUrl || ARTIST_IMAGE_URL} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-110 opacity-60' : 'opacity-40 group-hover:opacity-60'}`} alt="" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div onClick={(e) => { e.stopPropagation(); togglePlay(song.id); }}>
                            <AudioPlayer 
                                driveId={song.driveId} 
                                src={song.customAudioUrl}
                                isPlaying={isPlaying} 
                                onToggle={() => {}}
                                title={song.title}
                                variant="minimal"
                            />
                         </div>
                    </div>
                    {isSelected && (
                         <div className="absolute top-2 right-2 text-white">
                             <HeartIcon className="w-4 h-4 fill-white" filled />
                         </div>
                    )}
                </div>
                
                <div className="mt-auto">
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase block mb-1">
                        No. {String(song.id).padStart(2, '0')}
                    </span>
                    <h3 className={`font-serif text-sm leading-tight transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {song.title}
                    </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Action Bar */}
        <div className={`fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40 transition-transform duration-500 ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-[500px] mx-auto flex items-center justify-between bg-[#1e1e1e] border border-white/20 p-2 pr-2 pl-6 rounded-full shadow-2xl">
              <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400">{t.mySelection}</span>
                  <span className="font-serif text-white">{selectedIds.length} / {MAX_VOTES}</span>
              </div>
              <button 
                onClick={handleSubmitVotes}
                disabled={!isComplete}
                className={`
                    px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all
                    ${isComplete ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                `}
              >
                {t.confirm}
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {step === AppStep.INTRO && <IntroView />}
      {step === AppStep.AUTH && <AuthView />}
      {step === AppStep.VOTING && <VotingView />}
      {step === AppStep.SUCCESS && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 animate-fade-in">
           <HeartIcon className="w-16 h-16 text-white mb-6" filled />
           <h2 className="font-serif text-4xl text-white mb-4">{t.thankYou}</h2>
           <p className="text-gray-400 font-sans text-xs tracking-widest uppercase mb-12">{t.thankYouDesc}</p>
           <button onClick={handleBack} className="text-xs border-b border-white pb-1 hover:opacity-50 transition-opacity">Return Home</button>
        </div>
      )}
      {step === AppStep.ADMIN && <AdminView onBack={handleBack} />}

      <SongDetailModal 
        isOpen={detailSongId !== null}
        onClose={() => setDetailSongId(null)}
        song={songs.find(s => s.id === detailSongId) || null}
        lang={lang}
        onVote={toggleVote}
        isVoted={detailSongId ? selectedIds.includes(detailSongId) : false}
        isPlaying={playingId === detailSongId}
        onTogglePlay={() => detailSongId && togglePlay(detailSongId)}
        canVote={selectedIds.length < MAX_VOTES}
        defaultCover={ARTIST_IMAGE_URL}
      />
    </Layout>
  );
}
