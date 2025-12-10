import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { getSongs, getGlobalConfig, saveUserSession, getUserSession, fetchRemoteSongs, extractYouTubeId, saveVote } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS, ARTIST_DATA } from './constants';
import { AudioProvider, useAudio } from './components/AudioContext';
import { HeartIcon, ArrowLeftIcon, CheckIcon, PlayIcon, PauseIcon, SpinnerIcon, RetryIcon } from './components/Icons';
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
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                    <div className="flex items-center gap-10">
                        <div className="text-lg md:text-xl font-serif font-bold text-metallic tracking-widest">WILLWI</div>
                        <div className="w-[1px] h-4 bg-white/20 hidden md:block"></div>
                        <LangSwitcher lang={lang} setLang={setLang} className="hidden md:flex" />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative w-full min-h-screen flex flex-col md:flex-row pt-20 md:pt-0">
                 <div className="w-full md:w-[60%] h-[50vh] md:h-screen relative overflow-hidden bg-black group">
                     {!playHeroVideo ? (
                         <>
                            <img 
                                src={ARTIST_DATA.images.hero}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-[10s] hover:scale-105" 
                                alt="Willwi Main Portrait" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent"></div>
                            
                            {(youtubeId || playlistId) && (
                                <button 
                                    onClick={() => setPlayHeroVideo(true)}
                                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 hover:bg-black/30 transition-all duration-500 group/play cursor-pointer z-20"
                                >
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-gold group-hover/play:border-gold transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                        <PlayIcon className="w-8 h-8 md:w-10 md:h-10 text-white group-hover/play:text-black ml-1 transition-colors" />
                                    </div>
                                    <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 text-white/80 text-[10px] uppercase tracking-[0.3em] font-sans group-hover/play:text-gold transition-colors">
                                        {playlistId ? "Play Album" : "Watch Music Video"}
                                    </div>
                                </button>
                            )}
                         </>
                     ) : (
                         <div className="absolute inset-0 w-full h-full bg-black">
                             <iframe 
                                className="w-full h-full object-cover" 
                                src={playlistId 
                                    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=0&loop=1&controls=1&rel=0&modestbranding=1&playsinline=1`
                                    : `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&loop=1&playlist=${youtubeId}&controls=1&rel=0&modestbranding=1&playsinline=1`
                                }
                                title="Hero Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                             <button 
                                onClick={() => setPlayHeroVideo(false)}
                                className="absolute top-4 right-4 z-50 text-white/50 hover:text-white uppercase text-[9px] tracking-widest border border-white/20 px-4 py-2 rounded bg-black/50"
                             >
                                Close Video
                             </button>
                         </div>
                     )}
                 </div>

                 <div className="w-full md:w-[40%] min-h-[50vh] md:h-screen flex flex-col justify-center items-start px-8 md:px-16 py-12 relative z-10 bg-[#020202] border-l border-white/5">
                     <div className="animate-slide-up space-y-8 relative z-20 w-full">
                        <div>
                            <h2 className="text-gold text-xs tracking-[0.4em] uppercase font-sans border-b border-gold/30 pb-4 inline-block mb-6">
                                The 2026 Collection
                            </h2>
                            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide leading-none mb-2 text-glow">
                                BELOVED
                            </h1>
                            <div className="text-3xl md:text-4xl italic text-metallic font-serif">摯愛</div>
                        </div>

                        <div className="relative border-l-2 border-white/10 pl-6">
                            <p className="text-gray-400 text-sm font-serif leading-8 whitespace-pre-wrap tracking-wide text-justify">
                                {t.homeBody}
                            </p>
                        </div>

                        <div className="pt-8">
                             <button onClick={onEnterEvent} className="group relative w-full md:w-auto px-12 py-5 border border-white/20 hover:border-gold transition-all duration-500 overflow-hidden bg-white/[0.03]">
                                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                <span className="relative z-10 text-xs font-bold text-white group-hover:text-black uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-4">
                                    {t.enter} <ArrowLeftIcon className="rotate-180 w-4 h-4" />
                                </span>
                            </button>
                        </div>

                        {!youtubeId && !playlistId && featuredSong.url && (
                             <div className="pt-6 w-full">
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
            </header>

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
                          <div className="absolute inset-0 bg-neutral-900"></div>
                          <img 
                            src={ARTIST_DATA.images.profile}
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[5s] ease-in-out" 
                            alt="Artist Profile"
                          />
                      </div>
                 </div>
            </section>
            
             <footer className="py-12 border-t border-white/5 text-center">
                 <button onClick={onAdmin} className="text-[9px] text-gray-800 hover:text-gray-600 uppercase tracking-widest mb-4">
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
      const load = async () => {
          const loadedSongs = getSongs();
          setSongs(loadedSongs);
          const config = getGlobalConfig();
          setGlobalConfig(config);
          
          const remote = await fetchRemoteSongs();
          if (remote) setSongs(remote);
      };
      load();

      const session = getUserSession();
      if (session) {
          setUser(session);
      }
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

            {(step === AppStep.INTRO || step === AppStep.AUTH || step === AppStep.VOTING || step === AppStep.SUCCESS) && step !== AppStep.ADMIN && (
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