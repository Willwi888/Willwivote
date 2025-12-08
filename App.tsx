import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs } from './services/storage';
import { Song, User, AppStep, MAX_VOTES } from './types';
import AudioPlayer from './components/AudioPlayer';
import { HeartIcon, SpinnerIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';

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

  useEffect(() => {
    setSongs(getSongs());
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Handlers
  const handleStart = () => setStep(AppStep.AUTH);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.email) {
      setStep(AppStep.VOTING);
    }
  };

  const toggleVote = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  // --- Views ---

  const IntroView = () => {
    const { setBgImage } = useContext(BackgroundContext);
    
    useEffect(() => {
      setBgImage(ARTIST_IMAGE_URL);
      return () => setBgImage(null);
    }, [setBgImage]);

    return (
      <div className="flex flex-col min-h-screen px-8 pt-12 pb-20 relative overflow-hidden">
        {/* Decorative Top Line */}
        <FadeIn delay={0} className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent mx-auto mb-8" />

        <FadeIn delay={200} className="relative z-10 flex flex-col items-center flex-1 justify-center">
            {/* Main Title Block */}
            <div className="text-center mb-12">
                <span className="block text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-4 font-sans">The 2026 Collection</span>
                <h1 className="font-serif text-6xl md:text-7xl text-white tracking-wide italic mb-2 drop-shadow-2xl">
                    Beloved
                </h1>
                <div className="h-px w-12 bg-white/20 mx-auto mt-6 mb-6"></div>
                <h2 className="font-serif text-2xl text-gray-300 tracking-widest font-light">摯愛</h2>
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
                <p className="font-serif text-lg leading-relaxed text-gray-300 italic">
                    "40 demos. 10 tracks.<br/>
                    One final album defined by you."
                </p>
                
                <button 
                    onClick={handleStart}
                    className="group relative px-10 py-4 overflow-hidden rounded-sm transition-all duration-500"
                >
                    <span className="absolute inset-0 w-full h-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/20"></span>
                    <span className="relative z-10 font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-white group-hover:tracking-[0.4em] transition-all duration-500">
                        Enter Experience
                    </span>
                </button>
            </div>
        </FadeIn>

        <FadeIn delay={600} className="mt-auto pt-12 flex justify-center gap-8">
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
        </FadeIn>
      </div>
    );
  };

  const AuthView = () => (
    <div className="flex flex-col min-h-screen items-center justify-center px-8 relative">
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
                    Your Name
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
                    Email Address
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
                Proceed
              </span>
              <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-white group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );

  const VotingView = () => {
    const remaining = MAX_VOTES - selectedIds.length;
    const isComplete = remaining === 0;

    return (
      <div className="relative min-h-screen pb-32">
        {/* Sticky Elegant Header */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
            <div className="px-6 py-6 flex justify-between items-end max-w-[500px] mx-auto">
                <div>
                    <h1 className="font-serif text-2xl text-white italic">The List</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Selection</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`font-serif text-xl ${isComplete ? "text-white" : "text-gray-400"}`}>{selectedIds.length}</span>
                        <span className="font-serif text-sm text-gray-700">/</span>
                        <span className="font-serif text-sm text-gray-700">{MAX_VOTES}</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Track List */}
        <div className="px-4 py-4 space-y-2">
          {songs.map((song, index) => {
            const isSelected = selectedIds.includes(song.id);
            const isPlaying = playingId === song.id;
            const disabled = !isSelected && isComplete;

            return (
              <div 
                key={song.id}
                onClick={() => !isPlaying && togglePlay(song.id)}
                className={`
                    group relative flex items-center p-4 rounded-sm border transition-all duration-500 cursor-pointer
                    ${isPlaying ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}
                `}
              >
                 {/* Visualizer Background for Playing Item */}
                 {isPlaying && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                 )}

                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Play Control */}
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                       <div className="relative z-10" onClick={(e) => { e.stopPropagation(); togglePlay(song.id); }}>
                            <AudioPlayer 
                                driveId={song.driveId} 
                                isPlaying={isPlaying} 
                                onToggle={() => {}} // Handled by parent div for smoother UX
                                title={song.title}
                                variant="minimal"
                            />
                       </div>
                  </div>
                  
                  {/* Text Info */}
                  <div className="flex flex-col min-w-0">
                    <span className={`font-serif text-lg leading-tight transition-colors duration-300 ${isPlaying ? 'text-white italic' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {song.title}
                    </span>
                    <span className="text-[9px] text-gray-700 font-mono mt-1 tracking-widest uppercase">
                        Track No. {String(song.id).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Vote Button */}
                <button
                    onClick={(e) => toggleVote(song.id, e)}
                    disabled={disabled}
                    className={`
                        w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ml-2 relative z-20
                        ${isSelected ? 'opacity-100 scale-100' : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0 scale-90 hover:scale-100'}
                        ${disabled ? 'opacity-0 pointer-events-none' : ''}
                    `}
                >
                    <HeartIcon className={`w-6 h-6 transition-all duration-500 ${isSelected ? 'fill-white text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'fill-transparent text-white'}`} filled={isSelected} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Action Bar */}
        <div className={`fixed bottom-8 left-0 right-0 px-6 z-50 transition-all duration-700 transform ${selectedIds.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="max-w-[400px] mx-auto">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl border border-white/10"></div>
                <div className="relative flex items-center justify-between px-6 py-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-gray-400">Your Selection</span>
                        <div className="h-0.5 w-24 bg-gray-700 mt-1.5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-out" 
                                style={{ width: `${(selectedIds.length / MAX_VOTES) * 100}%` }}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSubmitVotes}
                        disabled={!isComplete}
                        className={`
                            px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500
                            ${isComplete 
                                ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                : 'text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {isComplete ? 'Confirm' : 'Select 10'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const SuccessView = () => (
    <div className="flex flex-col min-h-screen justify-center items-center px-8 text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

        <FadeIn className="relative z-10">
            <h1 className="font-serif text-5xl md:text-6xl text-white italic mb-6">Thank You</h1>
            <div className="w-12 h-px bg-white/30 mx-auto mb-8"></div>
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 leading-relaxed">
                Your voice has been recorded.<br/>
                The album awaits.
            </p>
        </FadeIn>

        <FadeIn delay={400} className="mt-16 w-full max-w-sm border-t border-white/10 pt-8">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">
                {selectedIds.sort((a,b) => a-b).map(id => {
                     const song = songs.find(s => s.id === id);
                     return (
                        <div key={id} className="flex items-baseline gap-2 text-gray-500">
                            <span className="font-serif text-xs text-gray-700 w-4">{String(id).padStart(2, '0')}</span>
                            <span className="text-[10px] uppercase tracking-wider truncate">{song?.title}</span>
                        </div>
                     );
                })}
            </div>
            <div className="mt-8 text-center">
                 <button 
                    onClick={() => window.location.reload()}
                    className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
                >
                    Close
                </button>
            </div>
        </FadeIn>
    </div>
  );

  return (
    <Layout>
      {step === AppStep.INTRO && <IntroView />}
      {step === AppStep.AUTH && <AuthView />}
      {step === AppStep.VOTING && <VotingView />}
      {step === AppStep.SUCCESS && <SuccessView />}
      {step === AppStep.ADMIN && <AdminView onBack={() => setStep(AppStep.INTRO)} />}
      
      {step === AppStep.INTRO && (
        <div className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
           <button onClick={() => setStep(AppStep.ADMIN)} className="p-2">
             <div className="w-1 h-1 bg-white rounded-full"></div>
           </button>
        </div>
      )}
    </Layout>
  );
}