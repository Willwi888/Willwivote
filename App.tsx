
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig, extractYouTubeId } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
// FIXED: Set to empty string to prioritize the Album Cover Image over the broken YouTube video.
const DEFAULT_FEATURED_AUDIO_ID = ""; 
// NOTE: Ensure this URL points to your high-res artist image.
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
    <div className="flex gap-6 z-50 mix-blend-difference pt-2">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-sm md:text-base uppercase tracking-[0.25em] transition-all duration-500 font-medium ${lang === l ? 'text-white border-b border-gold pb-1' : 'text-gray-400 hover:text-white'}`}
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
    const { initializeAudio, isPlaying, playingId, playSong, pause } = useAudio();
    const introYoutubeId = extractYouTubeId(introAudioId);
    
    // Logic for toggling playback removed as requested (removing visual player)

    const onEnterClick = () => {
        initializeAudio(); 
        handleStart();
    };

    return (
      <div className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col">
        
        {/* BACKGROUND AMBIENCE */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Dynamic Light Leaks */}
             <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px] animate-pulse-slow"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* TOP NAVIGATION */}
        <div className="w-full px-8 py-8 flex justify-between items-start z-50">
            <div>
                {/* INCREASED FONT SIZE HERE */}
                <h1 className="text-white font-serif tracking-[0.3em] text-2xl md:text-4xl font-bold mb-2">WILLWI MUSIC</h1>
                <p className="text-xs md:text-sm text-gold uppercase tracking-[0.25em] opacity-80 pl-1">The 2026 Collection</p>
            </div>
            <LangSwitcher lang={lang} setLang={setLang} />
        </div>

        {/* MAIN CONTENT: EDITORIAL LAYOUT */}
        <div className="flex-1 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 px-8 pb-12">
            
            {/* LEFT: ALBUM ART (THE HERO) - WITH STRONG GLOW */}
            <div className="relative group cursor-pointer w-full max-w-[320px] md:max-w-[400px] aspect-[4/5] animate-slide-up" onClick={onEnterClick}>
                 {/* STRONG GLOW EFFECT */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/30 blur-[60px] rounded-full opacity-60 animate-pulse-slow pointer-events-none"></div>
                 
                 {/* Image Container */}
                 <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-[2px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 z-10 transition-transform duration-1000 group-hover:scale-[1.01]">
                    {introYoutubeId ? (
                         <iframe 
                            className="w-full h-full object-cover"
                            src={`https://www.youtube.com/embed/${introYoutubeId}?rel=0&controls=0&playsinline=1&iv_load_policy=3&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=${introYoutubeId}`}
                            title="Intro"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            style={{ pointerEvents: 'none' }} 
                        ></iframe>
                    ) : (
                        <div className="w-full h-full relative">
                            <img 
                                src={ARTIST_IMAGE_URL} 
                                className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105" 
                                alt="Cover" 
                            />
                            {/* Cinematic Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 mix-blend-multiply"></div>
                            
                            {/* REMOVED PLAY BUTTON AS REQUESTED */}
                        </div>
                    )}
                 </div>
            </div>

            {/* RIGHT: TYPOGRAPHY */}
            <div className="text-center md:text-left space-y-8 animate-slide-up max-w-lg relative z-20" style={{ animationDelay: '200ms' }}>
                <div>
                    <h2 className="font-serif text-6xl md:text-8xl text-white italic tracking-tight leading-none mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] whitespace-pre-line text-balance">
                        {t.title}
                    </h2>
                    <p className="font-sans text-xs md:text-sm text-gray-300 tracking-[0.3em] uppercase leading-relaxed border-t border-white/20 pt-4 inline-block text-shadow-sm">
                        {t.subtitle}
                    </p>
                </div>

                <div className="md:pl-1">
                     <p className="font-serif text-sm text-gray-400 leading-relaxed mb-10 max-w-sm whitespace-pre-wrap">
                        {t.homeBody}
                     </p>
                     
                     <button 
                        onClick={onEnterClick}
                        className="group relative px-10 py-4 overflow-hidden bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-colors duration-500 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {t.enter} <span className="text-lg leading-none mb-0.5 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="w-full px-8 py-6 flex justify-between items-end z-50 border-t border-white/5 bg-[#050505]/50 backdrop-blur-sm">
            <div className="flex gap-6">
                {SOCIAL_LINKS.map(l => (
                    <a key={l.name} href={l.url} target="_blank" className="text-[9px] text-gray-600 hover:text-gold uppercase tracking-widest transition-colors">{l.name}</a>
                ))}
            </div>
            <button onClick={onAdmin} className="text-[9px] text-gray-700 hover:text-white uppercase tracking-widest transition-colors">Manager</button>
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#050505]">
       
       {/* LEFT PANEL: FIXED VISUAL (Matches Intro Layout) */}
       <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative md:sticky md:top-0 bg-[#000] overflow-hidden border-b md:border-b-0 md:border-r border-white/5 z-0">
           <img 
               src={ARTIST_IMAGE_URL} 
               className="w-full h-full object-cover object-center opacity-80" 
               alt="Artist" 
           />
           {/* Cinematic Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40 md:bg-gradient-to-r md:from-transparent md:to-[#050505]/80"></div>
           
           <button onClick={handleBack} className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors z-50 mix-blend-difference flex items-center gap-2">
               <ArrowLeftIcon className="w-6 h-6" />
               <span className="text-[9px] uppercase tracking-widest hidden md:inline">Back</span>
           </button>
       </div>

       {/* RIGHT PANEL: SCROLLABLE CONTENT */}
       <div className="w-full md:w-1/2 min-h-screen bg-[#050505] relative z-10 flex flex-col justify-center py-20 px-8 md:px-24 overflow-y-auto">
           {/* Background Texture */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none z-0"></div>
           
           <div className="space-y-20 animate-fade-in relative z-10 max-w-xl mx-auto md:mx-0">
               
               {/* Section 1: About - THE CONCEPT */}
               <div className="space-y-8 text-center md:text-left">
                   <div className="flex flex-col items-center md:items-start">
                       <span className="text-[9px] text-gold uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(197,160,89,0.5)] mb-2">The Concept</span>
                       <div className="w-8 h-[1px] bg-gold/50 mb-6"></div>
                   </div>
                   
                   <h2 className="font-serif text-3xl md:text-5xl text-white italic leading-tight text-balance" style={{ wordBreak: 'keep-all' }}>{t.aboutTitle}</h2>
                   
                   <p className="font-serif text-base text-gray-400 leading-9 tracking-wide whitespace-pre-wrap">{t.aboutBody}</p>
               </div>

                {/* Section 2: Guide */}
               <div className="space-y-8 text-center md:text-left pt-8 border-t border-white/5">
                   <span className="text-[9px] text-gray-500 uppercase tracking-[0.4em]">Guide</span>
                   <p className="font-serif text-sm text-gray-500 leading-8 tracking-wide whitespace-pre-wrap">{t.howToBody}</p>
               </div>

               {/* LOGIN FORM */}
               <form onSubmit={handleLogin} className="w-full space-y-10 pt-8">
                   <div className="space-y-8">
                       <div className="group">
                            <label className="block text-[8px] uppercase text-gray-500 tracking-[0.3em] mb-2 group-focus-within:text-gold transition-colors">{t.name}</label>
                            <input 
                                required
                                type="text" 
                                value={user.name}
                                onChange={e => setUser({...user, name: e.target.value})}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white font-serif placeholder-white/10 focus:border-gold outline-none transition-all"
                            />
                       </div>
                       <div className="group">
                            <label className="block text-[8px] uppercase text-gray-500 tracking-[0.3em] mb-2 group-focus-within:text-gold transition-colors">{t.email}</label>
                            <input 
                                required
                                type="email" 
                                value={user.email}
                                onChange={e => setUser({...user, email: e.target.value})}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white font-serif placeholder-white/10 focus:border-gold outline-none transition-all"
                            />
                       </div>
                   </div>
                   <button 
                       type="submit" 
                       disabled={!user.name || !user.email}
                       className="w-full py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-300 disabled:opacity-30 disabled:hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(197,160,89,0.4)]"
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
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-32">
           {/* HEADER */}
           <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-6 px-8 flex justify-between items-center">
               <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors">
                   <ArrowLeftIcon className="w-5 h-5" />
               </button>
               <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium drop-shadow-[0_0_5px_rgba(197,160,89,0.3)]">
                   {t.mySelection} • {selectedIds.length} / {MAX_VOTES}
               </div>
               <div className="w-5"></div>
           </div>

           <div className="max-w-4xl mx-auto px-6 py-16">
               <div className="text-center mb-20 space-y-6">
                   <h2 className="font-serif text-4xl italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t.selection}</h2>
                   <div className="w-px h-12 bg-gradient-to-b from-transparent via-gold to-transparent mx-auto"></div>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.votingRule}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                   {songs.map((song, index) => {
                       const isSelected = selectedIds.includes(song.id);
                       return (
                           <div 
                              key={song.id}
                              onClick={() => setDetailSongId(song.id)}
                              className={`group flex items-center justify-between py-6 px-0 cursor-pointer transition-all duration-500 border-b border-white/5 hover:border-white/20 hover:pl-4`}
                           >
                               <div className="flex items-baseline gap-6 min-w-0">
                                   <span className={`text-[10px] font-mono w-6 ${isSelected ? 'text-gold' : 'text-gray-700'}`}>
                                       {String(index + 1).padStart(2, '0')}
                                   </span>
                                   <div className="min-w-0">
                                       <h3 className={`font-serif text-lg tracking-wide truncate pr-4 transition-colors duration-300 ${isSelected ? 'text-white italic drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                           {song.title}
                                       </h3>
                                       {isSelected && voteReasons[song.id] && (
                                           <p className="text-[10px] text-gold/60 font-serif italic mt-1 truncate max-w-[200px]">"{voteReasons[song.id]}"</p>
                                       )}
                                   </div>
                               </div>

                               <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-[8px] text-gray-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Details</span>
                                    {isSelected ? (
                                        <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_10px_rgba(197,160,89,0.2)]">
                                            <CheckIcon className="w-3 h-3" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-gray-800 group-hover:text-gray-400 group-hover:border-white/20 transition-all">
                                            <HeartIcon className="w-3 h-3" />
                                        </div>
                                    )}
                               </div>
                           </div>
                       );
                   })}
               </div>
           </div>

           <div className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-white/10 p-6 z-40">
               <div className="max-w-4xl mx-auto flex items-center justify-between">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                       {selectedIds.length === 0 ? t.selectMore : <span className="text-white">{selectedIds.length} Tracks Selected</span>}
                   </div>
                   <button 
                       onClick={onRequestSubmit}
                       disabled={selectedIds.length === 0}
                       className={`px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${selectedIds.length > 0 ? 'bg-white text-black hover:bg-gold shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-gray-600 border border-white/5'}`}
                   >
                       {t.confirm}
                   </button>
               </div>
           </div>
      </div>
    );
};

const SuccessView: React.FC<{ t: any; setStep: (s: AppStep) => void; user: User }> = ({ t, setStep, user }) => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[100px] rounded-full"></div>
        
        <div className="max-w-lg w-full border border-white/10 p-16 relative bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#050505] border border-white/10 rounded-full flex items-center justify-center text-gold shadow-[0_0_30px_rgba(197,160,89,0.4)]">
                <CheckIcon className="w-8 h-8" />
            </div>
            
            <h2 className="font-serif text-4xl text-white italic mb-8 mt-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{t.thankYou}</h2>
            <div className="w-12 h-px bg-white/10 mx-auto mb-8"></div>
            <p className="font-serif text-sm text-gray-400 leading-8 mb-12 whitespace-pre-wrap">{t.thankYouDesc}</p>
            
            <button onClick={() => setStep(AppStep.INTRO)} className="text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-transparent hover:border-gold hover:text-gold transition-all pb-1">
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
      if (playingId === 'intro') pause(); 
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
        />
        
        {/* Final Modal (Tell Me Why) */}
        {showFinalModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
                <div className="max-w-md w-full space-y-8 text-center bg-[#0a0a0a] p-8 border border-white/10 shadow-2xl">
                    <h2 className="font-serif text-3xl text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{t.finalInquiryTitle}</h2>
                    <p className="font-serif text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{t.finalInquiryPrompt}</p>
                    <textarea 
                        className="w-full bg-[#111] border border-white/10 p-4 text-white font-serif outline-none focus:border-gold h-32 text-sm shadow-inner"
                        placeholder={t.finalInquiryPlaceholder}
                        onKeyDown={(e) => { if(e.key === 'Enter' && e.metaKey) handleFinalSubmit((e.target as HTMLTextAreaElement).value) }}
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setShowFinalModal(false)} className="flex-1 py-4 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{t.cancel}</button>
                        <button onClick={(e) => {
                            const txt = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                            handleFinalSubmit(txt);
                        }} className="flex-1 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t.submitFinal}</button>
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
