
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { getSongs, getGlobalConfig, saveUserSession, getUserSession, fetchRemoteSongs, extractYouTubeId, saveVote, syncOfflineVotes } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, ARTIST_DATA } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon, XIcon, LockIcon } from './components/Icons';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';
import AudioPlayer from './components/AudioPlayer';

// --- CONFIGURATION ---

const LangSwitcher: React.FC<{ lang: Language; setLang: (l: Language) => void; className?: string }> = ({ lang, setLang, className }) => (
    <div className={`flex z-50 items-center ${className}`}>
        {(['zh', 'jp', 'en'] as Language[]).map(l => (
            <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-sans px-2 ${lang === l ? 'text-gold font-bold scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]' : 'text-gray-500 hover:text-white'}`}
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
    playHeroVideo: boolean;
    setPlayHeroVideo: (b: boolean) => void;
}> = ({ t, lang, setLang, onEnterEvent, onAdmin, featuredSong, playHeroVideo, setPlayHeroVideo }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const youtubeId = extractYouTubeId(featuredSong.url);
    const playlistId = featuredSong.url.match(/[?&]list=([^&]+)/)?.[1];
    const isDropboxFolder = featuredSong.url.includes('/fo/');

    // Helper to get correct bio language with fallback
    const getBioContent = () => {
        // @ts-ignore - Accessing bio dynamic property based on language
        return ARTIST_DATA.bio[lang] || ARTIST_DATA.bio.zh;
    };

return (
  <AudioProvider>
    <div style={{ color: 'white', padding: 40 }}>
      <h1>DEBUG: App Mounted</h1>
      <p>Step: {step}</p>

      {step === AppStep.ARTIST_HOME && (
        <ArtistHomeView
          t={t}
          lang={lang}
          setLang={setLang}
          onEnterEvent={handleEnterEvent}
          onAdmin={() => setStep(AppStep.ADMIN)}
          featuredSong={{
            title:
              globalConfig.homepageSongTitle ||
              ARTIST_DATA.featuredSong.title,
            url:
              globalConfig.homepageSongUrl ||
              ARTIST_DATA.featuredSong.url,
          }}
          playHeroVideo={playHeroVideo}
          setPlayHeroVideo={setPlayHeroVideo}
        />
      )}
    </div>
  </AudioProvider>
);


                 {/* Content Layer */}
                 {!playHeroVideo && (
                     <div className="relative z-10 w-full md:w-[65%] h-full flex flex-col justify-center items-center md:items-end ml-auto px-6 md:px-16 lg:pr-32 animate-slide-up py-24 md:py-0">
                        
                        {/* 
                            NEW LAYOUT GROUP: 
                            This groups the Title, Subtitle, Text, and Buttons into a single vertically centered axis 
                            that is positioned on the right side of the screen.
                        */}
                        <div className="flex flex-col items-center md:items-center w-full md:max-w-xl">
                            
                            <h2 className="text-gold/80 text-[10px] md:text-xs tracking-[0.5em] uppercase font-sans border-b border-gold/40 pb-4 mb-8 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                                The 2026 Collection
                            </h2>
                            
                            {/* TITLE GROUP: Centered Relative to each other */}
                            <div className="flex flex-col items-center mb-10 relative">
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white tracking-wide leading-none animate-sachiko-glow drop-shadow-[0_0_40px_rgba(255,215,0,0.4)] text-center">
                                    BELOVED
                                </h1>
                                {/* Chinese Title - Centered Below */}
                                <div className="text-3xl md:text-5xl lg:text-6xl italic text-metallic font-serif mt-2 md:-mt-2 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]">
                                    摯愛
                                </div>
                            </div>

                            {/* WARMER GLASS CARD */}
                            <div className="mb-10 w-full bg-[#1a1200]/40 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(255,215,0,0.15)] relative overflow-hidden group">
                                {/* Subtle internal glow */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
                                
                                <p className="text-[#eceae0] text-sm md:text-base font-serif leading-[2.8] tracking-[0.1em] whitespace-pre-wrap text-center drop-shadow-sm font-light">
                                    {t.homeBody}
                                </p>
                            </div>

                            {/* BUTTONS CONTAINER - Centered */}
                            <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-6 md:gap-8 relative pb-8 md:pb-0">
                                {/* Primary Action Button */}
                                <button 
                                    onClick={onEnterEvent} 
                                    className="group relative px-12 py-5 bg-gold text-black overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.4)] hover:shadow-[0_0_80px_rgba(255,215,0,0.8)] hover:scale-105 transition-all duration-500 border border-white/20 rounded-sm"
                                >
                                    <span className="relative z-10 text-base md:text-lg font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                                        {t.enter} <PlayIcon className="w-5 h-5 fill-current" />
                                    </span>
                                </button>

                                {(youtubeId || playlistId) && (
                                    <button 
                                        onClick={() => setPlayHeroVideo(true)}
                                        className="flex items-center gap-4 group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-gold group-hover:border-white group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                                            <PlayIcon className="w-5 h-5 text-gold group-hover:text-black ml-1 transition-colors" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80 group-hover:text-gold font-bold drop-shadow-md transition-colors">
                                            {playlistId ? "Play Album" : "Watch Video"}
                                        </span>
                                    </button>
                                )}
                                
                                {!youtubeId && !playlistId && isDropboxFolder && (
                                    <a 
                                        href={featuredSong.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-gold group-hover:border-white group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                                            <PlayIcon className="w-5 h-5 text-gold group-hover:text-black ml-1 transition-colors" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80 group-hover:text-gold font-bold drop-shadow-md transition-colors">
                                            Open Album
                                        </span>
                                    </a>
                                )}

                                {/* Audio Player Fallback */}
                                {!youtubeId && !playlistId && !isDropboxFolder && featuredSong.url && (
                                    <div className="mt-4 w-full max-w-xs">
                                        <AudioPlayer 
                                            id="homepage-featured"
                                            src={featuredSong.url}
                                            title={featuredSong.title}
                                            variant="minimal"
                                            showControls={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                 )}
            </header>

            <section className="relative w-full py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-gold/20 bg-[#020202] z-10">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                      <div className="order-2 md:order-1 space-y-12 animate-slide-up">
                          <div className="text-center md:text-left">
                              <h3 className="text-4xl font-serif text-metallic mb-8 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">{t.profile}</h3>
                              <p className="text-gold font-sans tracking-[0.2em] uppercase leading-relaxed max-w-md mb-8 font-bold text-shadow-glow mx-auto md:mx-0">
                                  {ARTIST_DATA.title}
                              </p>
                              <div className="flex flex-col gap-6">
                                  {/* Changed text-justify to text-left for mobile to improve readability */}
                                  <p className="text-gray-200 text-sm md:text-lg font-serif leading-9 whitespace-pre-wrap tracking-wide text-left md:text-justify">
                                      {getBioContent()}
                                  </p>
                              </div>
                          </div>

                          <div className="pt-6 text-center md:text-left">
                              <h4 className="text-gold text-xs tracking-[0.2em] uppercase mb-4 font-bold border-b border-gold/20 pb-2 inline-block">Production Credits</h4>
                              <ul className="space-y-2">
                                  {ARTIST_DATA.copyright.credits.map((credit, i) => (
                                      <li key={i} className="text-[10px] md:text-xs text-gray-400 font-mono tracking-wider uppercase">
                                          {credit}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>

                      {/* PROFILE IMAGE - SACHIKO GLOW FRAME - MAX INTENSITY */}
                      <div className="order-1 md:order-2 relative h-[400px] md:h-[600px] w-full group">
                           {/* 1. Massive Background Glow */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gold blur-3xl animate-pulse-slow"></div>
                          
                          {/* 2. Rotating Gold Ring */}
                          <div className="absolute -inset-4 border border-gold/20 rounded-lg animate-spin-slow"></div>
                          
                          {/* 3. The Image Container */}
                          <div className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden sachiko-halo transition-transform duration-500 hover:scale-[1.02]">
                              <img 
                                src={ARTIST_DATA.images.profile}
                                onError={(e) => {
                                    // Fallback if Proxy fails (Rare)
                                    console.error("Image Failed", e);
                                }}
                                className="w-full h-full object-cover" 
                                alt="Artist Profile"
                                crossOrigin="anonymous"
                              />
                              {/* 4. Inner Breathing Border */}
                              <div className="absolute inset-0 border-4 border-gold/0 animate-breathe-gold pointer-events-none"></div>
                          </div>
                      </div>
                 </div>
            </section>
            
             <footer className="py-12 border-t border-gold/10 text-center bg-[#020202] z-10 relative">
                 <button onClick={onAdmin} className="text-[9px] text-gray-800 hover:text-gold uppercase tracking-widest mb-4 transition-colors">
                     {t.managerLogin}
                 </button>
                 <div className="text-[10px] text-gray-600 font-serif tracking-widest">
                     {t.copyright}
                 </div>
            </footer>
        </div>
    );
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [step, setStep] = useState<AppStep>(AppStep.ARTIST_HOME);
  const [songs, setSongs] = useState<Song[]>([]);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [] });
  const [globalConfig, setGlobalConfig] = useState({ homepageSongTitle: '', homepageSongUrl: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Member Access State
  const [memberPassword, setMemberPassword] = useState('');
  const [memberLoginError, setMemberLoginError] = useState(false);
  
  // Controls hero video on home page
  const [playHeroVideo, setPlayHeroVideo] = useState(false);

  // Define data loading as a memoized function so we can call it whenever steps change
  const loadData = useCallback(async (forceRemote = false) => {
      // 1. Load Local
      if (!forceRemote) {
        const loadedSongs = getSongs();
        setSongs(loadedSongs);
        const config = getGlobalConfig();
        setGlobalConfig({
            homepageSongTitle: config.homepageSongTitle || '',
            homepageSongUrl: config.homepageSongUrl || ''
        });
      }
      
      // 2. Load Remote (Background)
      try {
          if (forceRemote) setIsSyncing(true);
          const remote = await fetchRemoteSongs();
          if (remote) {
              setSongs(remote.songs);
              if (remote.config) {
                  const newConfig = {
                      homepageSongTitle: remote.config.homepageSongTitle || '',
                      homepageSongUrl: remote.config.homepageSongUrl || ''
                  };
                  setGlobalConfig(newConfig);
              }
          }
      } catch(e) {
          console.error("Remote Fetch failed", e);
      } finally {
          setIsSyncing(false);
      }
      
      // 3. Sync Offline Votes
      syncOfflineVotes();
  }, []);

  // Initial Load
  useEffect(() => {
      loadData();
      const session = getUserSession();
      if (session) setUser(session);

      // Auto-retry remote fetch after 3 seconds to fix mobile sync issues
      const timer = setTimeout(() => {
          loadData(true);
      }, 3000);
      return () => clearTimeout(timer);
  }, [loadData]);

  // RELOAD DATA WHEN RETURNING FROM ADMIN OR NAVIGATING
  useEffect(() => {
      loadData();
      window.scrollTo(0, 0);
  }, [step, loadData]);

  const t = TRANSLATIONS[lang];

  // Updated Enter Event: Redirects to Member Login first
  const handleEnterEvent = () => {
      setStep(AppStep.MEMBER_LOGIN);
  };
  
  // Handle Member Login
  const handleMemberLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // UPDATED PASSWORD
      if (memberPassword === '20260206') {
          setMemberLoginError(false);
          // Proceed to app logic
          if (user.email && user.votes.length > 0) {
              setStep(AppStep.SUCCESS);
          } else {
              setStep(AppStep.INTRO);
          }
      } else {
          setMemberLoginError(true);
          setMemberPassword('');
      }
  };

  const handleVote = (songId: number, reason?: string) => {
      const currentVotes = [...user.votes];
      const currentReasons = { ...user.voteReasons };

      if (currentVotes.includes(songId)) {
          const newVotes = currentVotes.filter(id => id !== songId);
          delete currentReasons[songId];
          setUser({ ...user, votes: newVotes, voteReasons: currentReasons });
      } else {
          if (currentVotes.length >= MAX_VOTES) return;
          const newVotes = [...currentVotes, songId];
          if (reason) currentReasons[songId] = reason;
          setUser({ ...user, votes: newVotes, voteReasons: currentReasons });
      }
  };

  const submitFinal = async () => {
      const finalUser = { ...user, timestamp: new Date().toISOString() };
      saveUserSession(finalUser);
      await saveVote(finalUser);
      setStep(AppStep.SUCCESS);
  };

  return (
    <AudioProvider>
        <Layout>
            {/* 
                --- GLOBAL CINEMATIC BACKGROUND LAYER ---
                This image now persists across the entire app. 
                - On Home: Full opacity, Left alignment (Balance for Right Text).
                - On Other Steps: Low opacity, blur, breathing effect.
            */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                 {!playHeroVideo && (
                    <img 
                        src={ARTIST_DATA.images.hero}
                        className={`
                            absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms]
                            ${step === AppStep.ARTIST_HOME 
                                ? 'opacity-100 object-[50%_15%] hover:scale-105' 
                                : 'opacity-20 blur-sm object-center scale-105 animate-pulse-slow'
                            }
                        `} 
                        alt="Background" 
                        crossOrigin="anonymous"
                    />
                 )}
                 {/* 
                    Gradient Overlays:
                    - Home: Darker on RIGHT to support Right-Aligned Text.
                    - Others: Evenly dark to support centered content.
                 */}
                 <div className={`
                    absolute inset-0 bg-gradient-to-l transition-all duration-[1500ms]
                    ${step === AppStep.ARTIST_HOME 
                        ? 'from-black via-black/50 to-transparent sm:via-40%' 
                        : 'from-[#050505] to-[#050505]/80'
                    }
                 `}></div>
            </div>

            {/* CONTENT LAYERS */}
            <div className="relative z-10">
                {step === AppStep.ARTIST_HOME && (
                    <ArtistHomeView 
                        t={t} 
                        lang={lang} 
                        setLang={setLang} 
                        onEnterEvent={handleEnterEvent} 
                        onAdmin={() => setStep(AppStep.ADMIN)}
                        featuredSong={{ title: globalConfig.homepageSongTitle || ARTIST_DATA.featuredSong.title, url: globalConfig.homepageSongUrl || ARTIST_DATA.featuredSong.url }}
                        playHeroVideo={playHeroVideo}
                        setPlayHeroVideo={setPlayHeroVideo}
                    />
                )}
                
                {step === AppStep.ADMIN && (
                    <AdminView onBack={() => setStep(AppStep.ARTIST_HOME)} />
                )}

                {(step === AppStep.INTRO || step === AppStep.AUTH || step === AppStep.VOTING || step === AppStep.SUCCESS || step === AppStep.MEMBER_LOGIN) && (
                     <div className="min-h-screen text-white relative">
                        <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40">
                            <button onClick={() => setStep(AppStep.ARTIST_HOME)} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white flex items-center">
                                 <ArrowLeftIcon className="w-4 h-4 mr-2" /> {t.backToSite}
                            </button>
                            <LangSwitcher lang={lang} setLang={setLang} className="gap-2" />
                        </nav>
                        
                        {step === AppStep.MEMBER_LOGIN && (
                            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in relative z-10">
                                <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-gold/30 p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.1)] text-center relative overflow-hidden">
                                     {/* Decorative Shine */}
                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
                                     
                                     {/* CREDIT CARD GRAPHIC */}
                                     <div className="relative w-full aspect-[1.58/1] bg-gradient-to-br from-[#1a1a1a] to-black rounded-xl border border-gold/40 shadow-[0_0_30px_rgba(255,215,0,0.2)] mb-8 flex flex-col justify-between p-6 overflow-hidden group hover:scale-[1.02] transition-transform duration-500 select-none mx-auto max-w-[320px]">
                                        {/* Glossy shine effect */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                        
                                        {/* Chip */}
                                        <div className="w-10 h-8 bg-gradient-to-r from-[#e6c15c] to-[#b38f2d] rounded-md relative opacity-80 shadow-inner">
                                            <div className="absolute inset-0 border border-black/20 rounded-md"></div>
                                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/30"></div>
                                            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-black/30"></div>
                                            <div className="absolute top-0 right-1/3 w-[1px] h-full bg-black/30"></div>
                                        </div>
                                        
                                        {/* Main Text */}
                                        <div className="text-center relative z-10">
                                            <h3 className="text-gold font-serif text-2xl tracking-[0.2em] text-metallic drop-shadow-md">BELOVED</h3>
                                            <div className="text-[8px] text-gray-500 uppercase tracking-[0.4em] mt-1">THE 2026 COLLECTION</div>
                                        </div>
                                        
                                        {/* Footer */}
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] text-gray-400 font-mono tracking-widest text-shadow-sm">2026 / 02</div>
                                            <div className="text-gold/60 text-[8px] font-bold tracking-widest uppercase border border-gold/30 px-2 py-0.5 rounded">MEMBER ACCESS</div>
                                        </div>
                                     </div>

                                     <h2 className="text-xl font-serif text-metallic mb-4 tracking-widest uppercase font-bold">
                                         {t.memberTitle}
                                     </h2>
                                     
                                     <p className="text-gray-300 text-sm font-serif leading-loose whitespace-pre-wrap mb-8">
                                         {t.memberDesc}
                                     </p>

                                     <form onSubmit={handleMemberLogin} className="space-y-6">
                                         <div className="relative">
                                             <input 
                                                type="password"
                                                autoFocus
                                                value={memberPassword}
                                                onChange={(e) => setMemberPassword(e.target.value)}
                                                placeholder={t.memberPlaceholder}
                                                className="w-full bg-black/50 border-b-2 border-white/20 px-4 py-3 text-center text-white text-lg tracking-[0.5em] focus:border-gold outline-none transition-colors placeholder:tracking-normal placeholder:text-gray-600 font-sans"
                                             />
                                         </div>
                                         
                                         {memberLoginError && (
                                             <div className="text-red-500 text-xs tracking-widest uppercase animate-pulse">
                                                 {t.memberError}
                                             </div>
                                         )}

                                         <button 
                                            type="submit"
                                            className="w-full bg-gold text-black py-4 rounded font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-gold/20"
                                         >
                                             {t.memberSubmit}
                                         </button>
                                     </form>
                                </div>
                            </div>
                        )}

                        {step === AppStep.INTRO && (
                            <div className="max-w-2xl mx-auto p-8 md:p-12 text-center space-y-8 pt-12 md:pt-20 animate-fade-in relative z-10">
                                <h2 className="text-2xl md:text-3xl font-serif text-metallic">{t.aboutTitle}</h2>
                                <p className="text-gray-300 whitespace-pre-wrap leading-loose text-sm md:text-base">{t.aboutIntro}</p>
                                <div className="border border-gold/20 bg-black/40 backdrop-blur p-6 md:p-8 rounded shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                    <h3 className="text-gold text-sm uppercase tracking-[0.2em] mb-4 font-bold">{t.warningTitle}</h3>
                                    <p className="text-gray-400 text-sm font-serif leading-loose tracking-wide">{t.warningBody}</p>
                                </div>
                                <button onClick={() => setStep(AppStep.VOTING)} className="bg-gold text-black px-12 py-4 rounded text-sm uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors shadow-lg shadow-gold/20">
                                    {t.start}
                                </button>
                            </div>
                        )}

                        {step === AppStep.VOTING && (
                            <div className="p-4 md:p-12 max-w-7xl mx-auto animate-fade-in relative z-10">
                                <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-serif mb-2">{t.selection}</h2>
                                        <p className="text-gray-400 text-xs uppercase tracking-widest">{t.votingRule} ({user.votes.length}/{MAX_VOTES})</p>
                                    </div>
                                    <button 
                                        onClick={() => user.votes.length > 0 ? setStep(AppStep.AUTH) : alert(t.selectMore)}
                                        className={`w-full md:w-auto px-8 py-3 rounded text-xs uppercase tracking-widest font-bold transition-colors shadow-lg ${user.votes.length > 0 ? 'bg-gold text-black hover:bg-white' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        {t.confirm}
                                    </button>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-12">
                                    {songs.map(song => (
                                        <div key={song.id} 
                                            onClick={() => { setSelectedSong(song); setIsModalOpen(true); }}
                                            className={`group p-4 rounded border backdrop-blur-sm transition-all cursor-pointer flex items-center gap-4 hover:bg-white/10 ${user.votes.includes(song.id) ? 'border-gold bg-gold/10' : 'border-white/10 bg-black/40'}`}
                                        >
                                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-black/60 rounded-full border border-white/10 group-hover:border-gold/50 transition-colors">
                                                {user.votes.includes(song.id) ? <CheckIcon className="w-5 h-5 text-gold" /> : <PlayIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-mono mb-1">#{String(song.id).padStart(2,'0')}</div>
                                                <div className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-1">{song.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* DATA SYNC FIX: Manual Refresh Button for users with stale data */}
                                <div className="flex justify-center pb-8">
                                    <button 
                                        onClick={() => loadData(true)} 
                                        disabled={isSyncing}
                                        className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-gold flex items-center gap-2 border border-gray-800 rounded-full px-4 py-2 hover:border-gold transition-colors"
                                    >
                                        {isSyncing ? <SpinnerIcon className="w-3 h-3" /> : '↻'} 
                                        {isSyncing ? 'Syncing...' : 'Refresh Music Library'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === AppStep.AUTH && (
                             <div className="max-w-md mx-auto p-8 md:p-12 pt-20 space-y-8 animate-slide-up relative z-10">
                                 <div className="text-center">
                                     <h2 className="text-2xl font-serif mb-4">{t.finalInquiryTitle}</h2>
                                     <p className="text-gray-400 text-sm whitespace-pre-wrap">{t.finalInquiryPrompt}</p>
                                 </div>
                                 
                                 <div className="space-y-4 bg-black/40 backdrop-blur p-8 rounded border border-white/10">
                                     <div>
                                         <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.name}</label>
                                         <input 
                                             className="w-full bg-black/60 border border-white/20 p-3 text-white focus:border-gold outline-none rounded"
                                             value={user.name}
                                             onChange={e => setUser({...user, name: e.target.value})}
                                         />
                                     </div>
                                     <div>
                                         <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.email}</label>
                                         <input 
                                             className="w-full bg-black/60 border border-white/20 p-3 text-white focus:border-gold outline-none rounded"
                                             value={user.email}
                                             onChange={e => setUser({...user, email: e.target.value})}
                                         />
                                     </div>
                                     <div>
                                         <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.tellUsWhy}</label>
                                         <textarea 
                                             className="w-full bg-black/60 border border-white/20 p-3 text-white focus:border-gold outline-none rounded h-32"
                                             placeholder={t.finalInquiryPlaceholder}
                                             value={user.voteReasons?.[0] || ''}
                                             onChange={e => setUser({...user, voteReasons: { ...user.voteReasons, 0: e.target.value }})}
                                         />
                                     </div>
                                 </div>

                                 <button 
                                    onClick={submitFinal}
                                    disabled={!user.name || !user.email}
                                    className="w-full bg-gold text-black py-4 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                                 >
                                     {t.submitFinal}
                                 </button>
                             </div>
                        )}

                        {step === AppStep.SUCCESS && (
                            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-fade-in relative z-10">
                                <div className="w-24 h-24 bg-gold/10 backdrop-blur rounded-full flex items-center justify-center mb-10 text-gold border border-gold/30 shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                                    <CheckIcon className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-serif text-white mb-8 tracking-wide drop-shadow-lg">{t.thankYou}</h2>
                                <div className="max-w-2xl bg-black/30 backdrop-blur-md p-8 md:p-12 rounded-lg border border-white/5 shadow-2xl">
                                    <p className="text-gray-300 text-base md:text-lg leading-[2.2] tracking-wide text-justify font-serif">
                                        {t.thankYouDesc}
                                    </p>
                                </div>
                                <div className="mt-12">
                                    <button onClick={() => setStep(AppStep.ARTIST_HOME)} className="text-xs uppercase tracking-[0.2em] text-gray-500 border-b border-transparent pb-1 hover:text-gold hover:border-gold transition-all duration-500">
                                        {t.backToSite}
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                )}

                <SongDetailModal 
                    song={selectedSong}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    lang={lang}
                    onVote={handleVote}
                    isVoted={selectedSong ? user.votes.includes(selectedSong.id) : false}
                    canVote={user.votes.length < MAX_VOTES}
                    defaultCover={ARTIST_DATA.images.profile}
                    savedReason={selectedSong && user.voteReasons ? user.voteReasons[selectedSong.id] : ''}
                    onNext={() => {
                        if (!selectedSong) return;
                        const idx = songs.findIndex(s => s.id === selectedSong.id);
                        if (idx < songs.length - 1) setSelectedSong(songs[idx + 1]);
                    }}
                    onPrev={() => {
                        if (!selectedSong) return;
                        const idx = songs.findIndex(s => s.id === selectedSong.id);
                        if (idx > 0) setSelectedSong(songs[idx - 1]);
                    }}
                />
            </div>
        </Layout>
    </AudioProvider>
  );
};

export default App;
