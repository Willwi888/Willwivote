
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { getSongs, getGlobalConfig, saveUserSession, getUserSession, fetchRemoteSongs, extractYouTubeId, saveVote, syncOfflineVotes } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, ARTIST_DATA } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon, XIcon } from './components/Icons';
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
                className={`text-[9px] uppercase tracking-[0.25em] transition-all duration-500 font-sans ${lang === l ? 'text-gold font-bold scale-125 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' : 'text-gray-500 hover:text-white'}`}
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
    const [playHeroVideo, setPlayHeroVideo] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const youtubeId = extractYouTubeId(featuredSong.url);
    const playlistId = featuredSong.url.match(/[?&]list=([^&]+)/)?.[1];

    return (
        <div className="min-h-screen bg-[#020202] text-white font-serif selection:bg-gold selection:text-black">
             {/* Navigation */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-gold/30' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                    <div className="flex items-center gap-10">
                        <div className="text-lg md:text-xl font-serif font-bold text-metallic tracking-widest drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] animate-pulse-slow">WILLWI</div>
                        <div className="w-[1px] h-4 bg-gold/50 hidden md:block"></div>
                        <LangSwitcher lang={lang} setLang={setLang} className="hidden md:flex" />
                    </div>
                </div>
            </nav>

            {/* Hero Section - Full Screen Background Design */}
            <header className="relative w-full h-screen flex items-center overflow-hidden">
                 {/* Background Layer */}
                 <div className="absolute inset-0 z-0">
                     {!playHeroVideo ? (
                         <>
                            {/* Main Background Image - OPAQUE for Clarity */}
                            <img 
                                src={ARTIST_DATA.images.hero}
                                className="w-full h-full object-cover object-top opacity-100 transition-transform duration-[20s] hover:scale-105" 
                                alt="Willwi Main Portrait" 
                                crossOrigin="anonymous"
                            />
                            {/* Gradients moved to BOTTOM/SIDES only, leaving face clear */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent opacity-90"></div>
                         </>
                     ) : (
                         <div className="absolute inset-0 w-full h-full bg-black z-20 animate-fade-in">
                             <iframe 
                                className="w-full h-full object-cover" 
                                src={playlistId 
                                    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=0&loop=1&controls=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`
                                    : `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&loop=1&playlist=${youtubeId}&controls=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`
                                }
                                title="Hero Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            
                             {/* UX IMPROVEMENT: High Visibility Close Button */}
                             <div className="absolute top-6 right-6 z-50">
                                <button 
                                    onClick={() => setPlayHeroVideo(false)}
                                    className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 text-white pl-3 pr-4 py-2 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                                >
                                    <XIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Close</span>
                                </button>
                             </div>

                             {/* UX IMPROVEMENT: Direct Entry from Video */}
                             <div className="absolute bottom-12 left-0 w-full flex justify-center z-50 pointer-events-none">
                                <button 
                                    onClick={onEnterEvent} 
                                    className="pointer-events-auto px-8 py-3 bg-gold text-black rounded-full shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:shadow-[0_0_50px_rgba(255,215,0,1)] hover:scale-105 transition-all duration-500 border border-white/20 flex items-center gap-3 group/enter"
                                >
                                    <span className="text-xs font-bold uppercase tracking-[0.25em]">{t.enter}</span>
                                    <ArrowLeftIcon className="rotate-180 w-4 h-4 group-hover/enter:translate-x-1 transition-transform" />
                                </button>
                             </div>
                         </div>
                     )}
                 </div>

                 {/* Content Layer (Left Aligned) - Added STRONG GLOW */}
                 {!playHeroVideo && (
                     <div className="relative z-10 w-full max-w-4xl px-8 md:px-16 pt-20 flex flex-col items-start animate-slide-up">
                        <h2 className="text-gold text-xs tracking-[0.4em] uppercase font-sans border-b border-gold pb-4 inline-block mb-8 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                            The 2026 Collection
                        </h2>
                        
                        {/* SACHIKO GLOW TITLE - INTENSE */}
                        <h1 className="text-6xl md:text-9xl font-serif text-white tracking-wide leading-none mb-4 animate-sachiko-glow drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                            BELOVED
                        </h1>
                        <div className="text-3xl md:text-6xl italic text-metallic font-serif mb-8 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]">摯愛</div>

                        <div className="border-l-4 border-gold pl-6 mb-12 max-w-xl bg-black/40 backdrop-blur-md p-6 rounded-r-lg shadow-[0_0_50px_rgba(255,215,0,0.1)] border border-white/5">
                            <p className="text-white text-sm md:text-lg font-serif leading-9 whitespace-pre-wrap tracking-wide text-justify drop-shadow-md">
                                {t.homeBody}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                             <button onClick={onEnterEvent} className="group relative px-12 py-5 bg-gold text-black overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.6)] hover:shadow-[0_0_100px_rgba(255,215,0,1)] hover:scale-105 transition-all duration-500 border-2 border-white/20">
                                <span className="relative z-10 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                                    {t.enter} <ArrowLeftIcon className="rotate-180 w-5 h-5" />
                                </span>
                            </button>

                            {(youtubeId || playlistId) && (
                                <button 
                                    onClick={() => setPlayHeroVideo(true)}
                                    className="flex items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full border border-gold/50 flex items-center justify-center bg-black/50 backdrop-blur-md group-hover:bg-gold group-hover:border-white group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                                        <PlayIcon className="w-6 h-6 text-gold group-hover:text-black ml-1 transition-colors" />
                                    </div>
                                    <span className="text-xs uppercase tracking-[0.2em] text-gold font-bold drop-shadow-md">
                                        {playlistId ? "Play Album" : "Watch Video"}
                                    </span>
                                </button>
                            )}

                             {/* Audio Player Fallback if no Video */}
                            {!youtubeId && !playlistId && featuredSong.url && (
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
                 )}
            </header>

            <section className="relative w-full py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-gold/20 bg-[#020202] z-10">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                      <div className="order-2 md:order-1 space-y-12 animate-slide-up">
                          <div>
                              <h3 className="text-4xl font-serif text-metallic mb-8 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">{t.profile}</h3>
                              <p className="text-gold font-sans tracking-[0.2em] uppercase leading-relaxed max-w-md mb-8 font-bold text-shadow-glow">
                                  {ARTIST_DATA.title}
                              </p>
                              <div className="flex flex-col gap-6">
                                  <p className="text-gray-200 text-sm md:text-lg font-serif leading-9 whitespace-pre-wrap tracking-wide text-justify">
                                      {lang === 'en' ? ARTIST_DATA.bio.en : ARTIST_DATA.bio.zh}
                                  </p>
                              </div>
                          </div>

                          <div className="pt-6">
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
                      <div className="order-1 md:order-2 relative h-[600px] w-full group">
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
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      // 1. Load Data
      const load = async () => {
          const loadedSongs = getSongs();
          setSongs(loadedSongs);
          const config = getGlobalConfig();
          setGlobalConfig({
            homepageSongTitle: config.homepageSongTitle || '',
            homepageSongUrl: config.homepageSongUrl || ''
          });
          
          const remote = await fetchRemoteSongs();
          if (remote) {
              setSongs(remote.songs);
              if (remote.config) {
                  const newConfig = {
                      homepageSongTitle: remote.config.homepageSongTitle || config.homepageSongTitle || '',
                      homepageSongUrl: remote.config.homepageSongUrl || config.homepageSongUrl || ''
                  };
                  setGlobalConfig(newConfig);
              }
          }
      };
      load();

      // 2. Load User Session
      const session = getUserSession();
      if (session) {
          setUser(session);
      }

      // 3. CRITICAL: Attempt to upload any votes that are stuck on this device
      // This runs every time the app opens, recovering "missing" votes for the admin.
      syncOfflineVotes();

  }, []);

  const t = TRANSLATIONS[lang];

  const handleEnterEvent = () => {
      if (user.email && user.votes.length > 0) {
          setStep(AppStep.SUCCESS);
      } else {
          setStep(AppStep.INTRO);
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
            {step === AppStep.ARTIST_HOME && (
                <ArtistHomeView 
                    t={t} 
                    lang={lang} 
                    setLang={setLang} 
                    onEnterEvent={handleEnterEvent} 
                    onAdmin={() => setStep(AppStep.ADMIN)}
                    featuredSong={{ title: globalConfig.homepageSongTitle || ARTIST_DATA.featuredSong.title, url: globalConfig.homepageSongUrl || ARTIST_DATA.featuredSong.url }}
                />
            )}
            
            {step === AppStep.ADMIN && (
                <AdminView onBack={() => setStep(AppStep.ARTIST_HOME)} />
            )}

            {(step === AppStep.INTRO || step === AppStep.AUTH || step === AppStep.VOTING || step === AppStep.SUCCESS) && (
                 <div className="min-h-screen bg-[#050505] text-white">
                    <nav className="p-6 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#050505]/90 backdrop-blur z-40">
                        <button onClick={() => setStep(AppStep.ARTIST_HOME)} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white">
                             <ArrowLeftIcon className="w-4 h-4 inline mr-2" /> {t.backToSite}
                        </button>
                        <LangSwitcher lang={lang} setLang={setLang} />
                    </nav>

                    {step === AppStep.INTRO && (
                        <div className="max-w-2xl mx-auto p-12 text-center space-y-8 pt-20 animate-fade-in">
                            <h2 className="text-3xl font-serif text-metallic">{t.aboutTitle}</h2>
                            <p className="text-gray-400 whitespace-pre-wrap leading-loose">{t.aboutIntro}</p>
                            <div className="border border-gold/20 bg-gold/5 p-6 rounded">
                                <h3 className="text-gold text-xs uppercase tracking-widest mb-2">{t.warningTitle}</h3>
                                <p className="text-gray-500 text-sm">{t.warningBody}</p>
                            </div>
                            <button onClick={() => setStep(AppStep.VOTING)} className="bg-white text-black px-8 py-3 rounded text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors">
                                {t.start}
                            </button>
                        </div>
                    )}

                    {step === AppStep.VOTING && (
                        <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
                            <header className="mb-12 flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-serif mb-2">{t.selection}</h2>
                                    <p className="text-gray-500 text-xs uppercase tracking-widest">{t.votingRule} ({user.votes.length}/{MAX_VOTES})</p>
                                </div>
                                <button 
                                    onClick={() => user.votes.length > 0 ? setStep(AppStep.AUTH) : alert(t.selectMore)}
                                    className={`px-8 py-3 rounded text-xs uppercase tracking-widest font-bold transition-colors ${user.votes.length > 0 ? 'bg-gold text-black hover:bg-white' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {t.confirm}
                                </button>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {songs.map(song => (
                                    <div key={song.id} 
                                        onClick={() => { setSelectedSong(song); setIsModalOpen(true); }}
                                        className={`group p-4 rounded border transition-all cursor-pointer flex items-center gap-4 hover:bg-white/5 ${user.votes.includes(song.id) ? 'border-gold bg-gold/5' : 'border-white/10'}`}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center bg-black rounded-full border border-white/10 group-hover:border-gold/50 transition-colors">
                                            {user.votes.includes(song.id) ? <CheckIcon className="w-5 h-5 text-gold" /> : <PlayIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-mono mb-1">#{String(song.id).padStart(2,'0')}</div>
                                            <div className="text-sm font-medium text-gray-200 group-hover:text-white">{song.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === AppStep.AUTH && (
                         <div className="max-w-md mx-auto p-12 pt-20 space-y-8 animate-slide-up">
                             <div className="text-center">
                                 <h2 className="text-2xl font-serif mb-4">{t.finalInquiryTitle}</h2>
                                 <p className="text-gray-400 text-sm whitespace-pre-wrap">{t.finalInquiryPrompt}</p>
                             </div>
                             
                             <div className="space-y-4">
                                 <div>
                                     <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.name}</label>
                                     <input 
                                         className="w-full bg-black border border-white/20 p-3 text-white focus:border-gold outline-none rounded"
                                         value={user.name}
                                         onChange={e => setUser({...user, name: e.target.value})}
                                     />
                                 </div>
                                 <div>
                                     <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.email}</label>
                                     <input 
                                         className="w-full bg-black border border-white/20 p-3 text-white focus:border-gold outline-none rounded"
                                         value={user.email}
                                         onChange={e => setUser({...user, email: e.target.value})}
                                     />
                                 </div>
                                 <div>
                                     <label className="text-[10px] uppercase text-gray-500 block mb-2">{t.tellUsWhy}</label>
                                     <textarea 
                                         className="w-full bg-black border border-white/20 p-3 text-white focus:border-gold outline-none rounded h-32"
                                         placeholder={t.finalInquiryPlaceholder}
                                         value={user.voteReasons?.[0] || ''}
                                         onChange={e => setUser({...user, voteReasons: { ...user.voteReasons, 0: e.target.value }})}
                                     />
                                 </div>
                             </div>

                             <button 
                                onClick={submitFinal}
                                disabled={!user.name || !user.email}
                                className="w-full bg-gold text-black py-4 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {t.submitFinal}
                             </button>
                         </div>
                    )}

                    {step === AppStep.SUCCESS && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
                            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-8 text-gold animate-bounce">
                                <CheckIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-serif text-white mb-4">{t.thankYou}</h2>
                            <p className="text-gray-400 max-w-md whitespace-pre-wrap leading-loose mb-8">{t.thankYouDesc}</p>
                            <button onClick={() => setStep(AppStep.ARTIST_HOME)} className="text-xs uppercase tracking-widest text-white border-b border-white pb-1 hover:text-gold hover:border-gold transition-colors">
                                {t.backToSite}
                            </button>
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
        </Layout>
    </AudioProvider>
  );
};

export default App;
