
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig, extractYouTubeId } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, DEFAULT_FEATURED_AUDIO_ID } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
// [ARTIST IMAGE]
// 請確認此連結是您剛才提供的 "西裝黑白獨照"。
// 這張照片將成為整個網站的核心視覺（首頁大片 + 內頁展示）。
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
    <div className="flex gap-8 z-50">
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-700 font-serif ${lang === l ? 'text-gold border-b border-gold pb-1' : 'text-gray-600 hover:text-gray-300'}`}
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
      <div className="relative h-screen w-full bg-[#000000] overflow-hidden flex flex-col justify-between group">
        
        {/* HERO VISUAL (Cartier Style - Responsive Portrait) */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden flex justify-center items-end md:items-center">
             {/* 
                UPDATE: Changed from background-image to <img> tag.
                Mobile: object-cover + object-top (Fills screen, prioritizes face).
                Desktop: object-contain (Shows FULL image, letterboxed with black).
             */}
            <img 
                src={ARTIST_IMAGE_URL}
                alt="Artist"
                className="
                    w-full h-full 
                    object-cover object-top md:object-contain md:object-center 
                    transition-transform duration-[60s] ease-linear scale-100 group-hover:scale-105
                "
                style={{ 
                    // Subtle filter to blend better with dark theme
                    filter: 'contrast(110%) brightness(0.9)',
                }}
            />
            
            {/* Gradient Overlay for Text Readability (Stronger at bottom) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/30 z-10"></div>
            
            {/* Side Vignettes (Desktop Only) to blend the contained image edges */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10 pointer-events-none"></div>
            
            {/* Film Grain Texture (Luxury Feel) */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] z-10 pointer-events-none mix-blend-screen"></div>
        </div>

        {/* HEADER */}
        <div className="w-full px-12 py-10 flex justify-between items-start z-50 animate-fade-in">
            <div className="flex flex-col gap-2">
                <div className="text-[10px] tracking-[0.4em] text-white font-serif uppercase">The 2026 Collection</div>
            </div>
            <LangSwitcher lang={lang} setLang={setLang} />
        </div>

        {/* CENTERPIECE: Editorial Typography */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 animate-slide-up" style={{ animationDuration: '2s' }}>
            
            <h1 className="font-serif text-6xl md:text-9xl text-white tracking-widest leading-none mb-6 drop-shadow-2xl mix-blend-screen">
                <span className="block text-[0.3em] tracking-[0.8em] mb-4 text-gray-300 uppercase font-sans font-light">Maison Willwi Presents</span>
                {t.title}
            </h1>
            
            {/* Elegant Separator */}
            <div className="h-[1px] w-12 bg-gold mb-12"></div>

            <p className="font-serif text-xs md:text-sm text-gray-300 tracking-[0.2em] leading-relaxed max-w-lg mb-16 text-shadow-sm">
                {t.subtitle}
            </p>

            {/* Cartier Style Button: Minimal, Bordered, Elegant */}
            <button 
                onClick={onEnterClick}
                className="group/btn relative px-12 py-4 overflow-hidden transition-all duration-700 border border-white/40 hover:border-gold hover:bg-black/20"
            >
                <span className="relative z-10 text-[10px] font-bold text-white group-hover/btn:text-gold uppercase tracking-[0.4em] transition-colors duration-500">
                    {t.enter}
                </span>
            </button>
        </div>

        {/* FOOTER */}
        <div className="w-full px-12 py-10 flex justify-between items-end z-50 animate-fade-in">
            <div className="flex gap-12 border-t border-white/10 pt-4">
                {SOCIAL_LINKS.map(l => (
                    <a key={l.name} href={l.url} target="_blank" className="text-[9px] text-gray-500 hover:text-white uppercase tracking-[0.25em] transition-colors font-serif">{l.name}</a>
                ))}
            </div>
            
            {/* Admin Trigger - Made subtle but visible for the user */}
            <button 
                onClick={onAdmin} 
                className="text-[9px] text-gray-800 hover:text-gold uppercase tracking-[0.2em] transition-colors font-serif pb-1"
                title="Manager Access"
            >
                Staff Only
            </button>
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
       
       {/* LEFT: Portrait Display (Clean, High End) */}
       <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden group border-r border-white/5">
           <img 
               src={ARTIST_IMAGE_URL} 
               className="w-full h-full object-cover object-top transition-transform duration-[20s] group-hover:scale-105" 
               alt="Artist" 
           />
           {/* Subtle gradient to ensure text readability if needed, but keeping image pure */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 z-10"></div>
           
           <button onClick={handleBack} className="absolute top-8 left-8 text-white/80 hover:text-white transition-colors z-50 flex items-center gap-4 group/back">
               <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
               <span className="text-[9px] uppercase tracking-[0.3em] font-serif">{t.back}</span>
           </button>
       </div>

       {/* RIGHT: Minimalist Registration (Like signing a guestbook) */}
       <div className="w-full md:w-1/2 min-h-screen bg-[#050505] flex flex-col justify-center px-12 md:px-32 relative z-20">
           <div className="max-w-md mx-auto w-full space-y-16 animate-slide-up">
               
               <div className="space-y-8 text-center md:text-left">
                   <div className="w-8 h-[1px] bg-gold mx-auto md:mx-0 mb-6"></div>
                   <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide leading-tight">{t.aboutTitle}</h2>
                   <p className="font-serif text-sm text-gray-400 leading-8 whitespace-pre-wrap">{t.aboutBody}</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-12 pt-8">
                   <div className="space-y-10">
                       <div className="group relative">
                            <label className="block text-[9px] text-gold uppercase tracking-[0.2em] mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 left-0">{t.name}</label>
                            <input 
                                required
                                type="text" 
                                value={user.name}
                                onChange={e => setUser({...user, name: e.target.value})}
                                placeholder={t.name}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white font-serif placeholder-gray-700 focus:border-gold outline-none transition-all tracking-wide"
                            />
                       </div>
                       <div className="group relative">
                            <label className="block text-[9px] text-gold uppercase tracking-[0.2em] mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 left-0">{t.email}</label>
                            <input 
                                required
                                type="email" 
                                value={user.email}
                                onChange={e => setUser({...user, email: e.target.value})}
                                placeholder={t.email}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white font-serif placeholder-gray-700 focus:border-gold outline-none transition-all tracking-wide"
                            />
                       </div>
                   </div>
                   
                   <button 
                       type="submit" 
                       disabled={!user.name || !user.email}
                       className="w-full py-5 border border-white/20 hover:border-gold text-white text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 hover:bg-white/5 disabled:opacity-30 disabled:hover:border-white/20"
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
      <div className="min-h-screen bg-[#000000] text-white pb-40 font-serif">
           {/* HEADER - Fixed & Minimal */}
           <div className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-md py-6 px-8 flex justify-between items-center border-b border-white/10 transition-all">
               <button onClick={handleBack} className="text-gray-500 hover:text-white transition-colors group flex items-center gap-3">
                   <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                   <span className="text-[9px] uppercase tracking-[0.2em] hidden md:inline-block">{t.back}</span>
               </button>
               
               <div className="text-[10px] uppercase tracking-[0.3em] text-gold">
                   <span className="font-sans font-bold text-lg align-middle">{selectedIds.length}</span> 
                   <span className="mx-2 text-gray-700">/</span> 
                   <span className="align-middle">{MAX_VOTES}</span>
               </div>
               
               <div className="w-5"></div> 
           </div>

           <div className="max-w-4xl mx-auto px-6 py-24">
               <div className="text-center mb-28 space-y-6 animate-fade-in">
                   <p className="text-[9px] text-gray-500 uppercase tracking-[0.6em]">The Selection</p>
                   <h2 className="font-serif text-5xl md:text-6xl text-white tracking-widest uppercase leading-snug">{t.selection}</h2>
                   <div className="h-[1px] w-8 bg-gold mx-auto mt-8"></div>
               </div>

               {/* LIST LAYOUT (High Jewelry Catalog Style) */}
               <div className="grid grid-cols-1 gap-0 border-t border-white/10">
                   {songs.map((song, index) => {
                       const isSelected = selectedIds.includes(song.id);
                       return (
                           <div 
                              key={song.id}
                              onClick={() => setDetailSongId(song.id)}
                              className={`
                                group relative flex items-center justify-between py-10 px-4 md:px-8 cursor-pointer transition-all duration-700 border-b border-white/10
                                hover:bg-white/[0.03]
                              `}
                           >
                               <div className="flex items-center gap-12 flex-1 min-w-0">
                                   <span className={`text-[10px] font-sans tracking-widest w-8 text-gray-600 group-hover:text-gold transition-colors`}>
                                       {String(index + 1).padStart(2, '0')}
                                   </span>
                                   
                                   <div className="min-w-0 flex-1">
                                       <h3 className={`font-serif text-2xl md:text-3xl tracking-wider truncate transition-all duration-500 ${isSelected ? 'text-gold' : 'text-gray-300 group-hover:text-white'}`}>
                                           {song.title}
                                       </h3>
                                       {isSelected && voteReasons[song.id] && (
                                           <p className="text-[10px] text-gray-500 font-serif italic mt-3 max-w-md truncate tracking-wide border-l border-gold/30 pl-3">
                                               {voteReasons[song.id]}
                                           </p>
                                       )}
                                   </div>
                               </div>

                               <div className="flex items-center gap-8 shrink-0 pl-8">
                                    <span className="text-[8px] text-gray-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 hidden md:inline-block -translate-x-2 group-hover:translate-x-0">
                                        Discover
                                    </span>
                                    
                                    <div className={`
                                        w-4 h-4 transition-all duration-500 transform
                                        ${isSelected ? 'text-gold scale-110' : 'text-gray-800 group-hover:text-gray-400'}
                                    `}>
                                        {isSelected ? <CheckIcon className="w-full h-full" /> : <HeartIcon className="w-full h-full" />}
                                    </div>
                               </div>
                           </div>
                       );
                   })}
               </div>
           </div>

           {/* FLOATING ACTION BAR (Minimal) */}
           <div className={`fixed bottom-8 left-0 w-full z-40 transition-all duration-1000 ${selectedIds.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
               <div className="flex justify-center">
                   <button 
                       onClick={onRequestSubmit}
                       disabled={selectedIds.length === 0}
                       className="bg-[#000000] text-white border border-gold hover:bg-gold hover:text-black px-16 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                   >
                       {t.confirm}
                   </button>
               </div>
           </div>
      </div>
    );
};

const SuccessView: React.FC<{ t: any; setStep: (s: AppStep) => void; user: User }> = ({ t, setStep, user }) => (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full opacity-30" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-lg w-full relative z-10">
            <div className="w-16 h-16 border border-gold rounded-full flex items-center justify-center text-gold mx-auto mb-16 animate-slide-up">
                <CheckIcon className="w-6 h-6" />
            </div>
            
            <h2 className="font-serif text-5xl md:text-6xl text-white tracking-widest mb-12 animate-slide-up leading-tight" style={{ animationDelay: '200ms' }}>{t.thankYou}</h2>
            
            <p className="font-serif text-sm text-gray-400 leading-9 mb-20 whitespace-pre-wrap animate-slide-up tracking-wide" style={{ animationDelay: '400ms' }}>{t.thankYouDesc}</p>
            
            <button 
                onClick={() => setStep(AppStep.INTRO)} 
                className="text-[10px] uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-colors animate-slide-up" style={{ animationDelay: '600ms' }}
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
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in font-serif">
                <div className="max-w-md w-full space-y-12 text-center bg-[#0a0a0a] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
                    
                    <div>
                        <h2 className="font-serif text-3xl text-white tracking-wide mb-4">{t.finalInquiryTitle}</h2>
                        <div className="h-[1px] w-8 bg-gold mx-auto"></div>
                    </div>

                    <p className="font-serif text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{t.finalInquiryPrompt}</p>
                    
                    <textarea 
                        className="w-full bg-[#050505] border-b border-white/10 p-4 text-white font-serif outline-none focus:border-gold h-32 text-sm text-center placeholder-gray-800 transition-colors"
                        placeholder={t.finalInquiryPlaceholder}
                        onKeyDown={(e) => { if(e.key === 'Enter' && e.metaKey) handleFinalSubmit((e.target as HTMLTextAreaElement).value) }}
                    />
                    
                    <div className="flex gap-10 justify-center pt-6">
                        <button onClick={() => setShowFinalModal(false)} className="text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">{t.cancel}</button>
                        <button onClick={(e) => {
                            const txt = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                            handleFinalSubmit(txt);
                        }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-gold transition-colors">{t.submitFinal}</button>
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
