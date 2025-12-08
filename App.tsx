import React, { useState, useEffect } from 'react';
import { Layout, FadeIn } from './components/Layout';
import { SONGS } from './constants';
import { User, AppStep, MAX_VOTES } from './types';
import AudioPlayer from './components/AudioPlayer';
import { CheckIcon, HeartIcon, SearchIcon, MoreIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';

// --- CONFIGURATION ---
const FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb";

// 使用 Google Drive 的 Thumbnail 接口以獲得更穩定的圖片載入 (sz=w1000 代表寬度 1000px)
// ID: 1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Website', url: 'https://willwi.com/' },
    { name: 'YouTube', url: 'https://www.youtube.com/@Willwi888' },
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Apple Music', url: 'https://music.apple.com/us/artist/willwi/1798471457' },
    { name: 'Amazon Music', url: 'https://music.amazon.com/artists/B0DYFC8CTG/willwi' },
    { name: 'TIDAL', url: 'https://tidal.com/artist/70636776' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Facebook', url: 'https://www.facebook.com/Willwi888' },
    { name: 'X (Twitter)', url: 'https://x.com/@willwi888' },
    { name: 'Email', url: 'mailto:will@willwi.com' },
];

type FilterType = 'all' | 'liked';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [] });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [imgError, setImgError] = useState(false);

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
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const toggleIntroPlay = () => {
    setPlayingId(null);
    setIntroPlaying(!introPlaying);
  };

  // --- Views ---

  const IntroView = () => (
    <div className="flex flex-col gap-8 pt-6 pb-20">
      {/* Image Section - Adjusted for Album Cover Style */}
      <FadeIn className="w-full relative mx-auto max-w-sm px-6">
        {/* Changed to aspect-square (1:1) to match the provided photo better */}
        <div className="relative aspect-square overflow-hidden rounded-sm shadow-2xl bg-surfaceHighlight border border-white/10 group">
          {!imgError ? (
            <img 
              src={ARTIST_IMAGE_URL}
              alt="Willwi Beloved" 
              className="w-full h-full object-cover object-top opacity-95 transition-all duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-center p-8">
               <span className="font-serif text-5xl text-white/10 mb-2">W</span>
               <span className="text-[9px] text-gray-600 uppercase tracking-widest">Image Unavailable</span>
            </div>
          )}
          
          {/* Enhanced Gradient for readability on suit/shirt */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100"></div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center p-4">
             <h2 className="font-serif text-3xl mb-2 text-white tracking-widest drop-shadow-lg">摯愛</h2>
             <p className="text-[9px] uppercase tracking-[0.6em] text-gray-300 drop-shadow-md font-light">2026 Collection</p>
          </div>
        </div>
      </FadeIn>

      {/* Content Section */}
      <div className="flex flex-col items-center justify-center space-y-8 text-center px-6">
        <FadeIn delay={200}>
           <div className="max-w-xs mx-auto">
             <p className="text-xs leading-7 font-light text-gray-400 font-sans tracking-wide">
               <span className="text-white">40 首作品</span>，選出你心中的前 10 首。<br/>
               每一票，都是一次真實的陪伴。<br/>
               為了完成 2026 全新大碟《摯愛》，<br/>
               我想讓這張專輯保留你們的痕跡。
             </p>
           </div>
        </FadeIn>
        
        {/* Featured Audio Player */}
        <FadeIn delay={300} className="w-full flex justify-center">
             <AudioPlayer 
                driveId={FEATURED_AUDIO_ID}
                isPlaying={introPlaying}
                onToggle={toggleIntroPlay}
                title="Special Message from Willwi"
                variant="featured"
             />
        </FadeIn>

        <FadeIn delay={400}>
            <div className="space-y-4 w-full max-w-sm border-t border-white/5 pt-6">
                 <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] text-gray-500 font-light uppercase tracking-wider">
                    {SOCIAL_LINKS.slice(0, 5).map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{link.name}</a>
                    ))}
                </div>
            </div>
        </FadeIn>

        <FadeIn delay={500} className="pt-2">
          <button 
            onClick={handleStart}
            className="group relative px-12 py-4 overflow-hidden rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10 text-xs font-bold tracking-[0.25em] uppercase">Start Voting</span>
          </button>
        </FadeIn>
      </div>
    </div>
  );

  const AuthView = () => (
    <div className="flex flex-col h-full justify-center px-6 min-h-[70vh]">
       <FadeIn>
        <div className="mb-12 text-center">
             <h2 className="font-serif text-3xl text-white mb-2">Identification</h2>
             <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Access Verification</p>
        </div>
      </FadeIn>
      
      <FadeIn delay={100}>
        <form onSubmit={handleLogin} className="w-full max-w-sm mx-auto space-y-8">
          
          <div className="group relative">
            <input 
              type="text" 
              required
              id="name"
              value={user.name}
              onChange={e => setUser({...user, name: e.target.value})}
              className="peer w-full bg-transparent border-b border-gray-700 py-4 text-center text-lg text-white font-serif focus:outline-none focus:border-white transition-colors placeholder-transparent"
              placeholder="Name"
              autoComplete="off"
            />
            <label 
                htmlFor="name"
                className="absolute left-0 right-0 top-4 text-center text-xs uppercase tracking-widest text-gray-600 transition-all pointer-events-none
                           peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-gray-400
                           peer-valid:-top-4 peer-valid:text-[10px] peer-valid:text-gray-400"
            >
                Your Name
            </label>
          </div>
          
          <div className="group relative">
            <input 
              type="email" 
              required
              id="email"
              value={user.email}
              onChange={e => setUser({...user, email: e.target.value})}
              className="peer w-full bg-transparent border-b border-gray-700 py-4 text-center text-lg text-white font-serif focus:outline-none focus:border-white transition-colors placeholder-transparent"
              placeholder="Email"
              autoComplete="off"
            />
             <label 
                htmlFor="email"
                className="absolute left-0 right-0 top-4 text-center text-xs uppercase tracking-widest text-gray-600 transition-all pointer-events-none
                           peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-gray-400
                           peer-valid:-top-4 peer-valid:text-[10px] peer-valid:text-gray-400"
            >
                Email Address
            </label>
          </div>

          <div className="pt-12 text-center">
             <button 
              type="submit"
              disabled={!user.name || !user.email}
              className="
                group relative inline-flex items-center justify-center px-12 py-3 overflow-hidden transition-all
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              <span className="relative text-xs font-bold uppercase tracking-[0.3em] text-white group-hover:text-gray-300 transition-colors border-b border-transparent group-hover:border-gray-500 pb-1">
                Enter Collection
              </span>
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );

  const VotingView = () => {
    const remaining = MAX_VOTES - selectedIds.length;
    const isComplete = remaining === 0;

    const filteredSongs = filter === 'liked' 
      ? SONGS.filter(s => selectedIds.includes(s.id))
      : SONGS;

    return (
      <div className="pb-32 relative pt-2">
        {/* Header UI */}
        <header className="flex flex-col gap-6 mb-8 px-2">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h2 className="font-serif text-2xl text-white mb-1">Candidates</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Select your top 10</p>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-serif ${isComplete ? "text-white" : "text-gray-500"}`}>{selectedIds.length}</span>
                    <span className="text-sm text-gray-700 mx-1">/</span>
                    <span className="text-sm text-gray-700">{MAX_VOTES}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFilter('all')}
                  className={`text-[10px] uppercase tracking-widest transition-colors ${filter === 'all' ? 'text-white border-b border-white pb-0.5' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    All Tracks
                </button>
                <button 
                  onClick={() => setFilter('liked')}
                  className={`text-[10px] uppercase tracking-widest transition-colors ${filter === 'liked' ? 'text-white border-b border-white pb-0.5' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    Selection
                </button>
            </div>
        </header>

        {/* Unified List Style */}
        <ul className="space-y-1" role="list">
          {filteredSongs.map((song) => {
            const isSelected = selectedIds.includes(song.id);
            const isPlaying = playingId === song.id;
            const disabled = !isSelected && isComplete;

            return (
              <li 
                key={song.id}
                className={`
                    group flex items-center justify-between p-4 rounded transition-colors duration-200
                    ${isPlaying ? 'bg-white/5' : 'hover:bg-white/[0.02]'}
                `}
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Play/Index Column */}
                  <div className="w-8 flex-shrink-0 flex items-center justify-center relative">
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                         <AudioPlayer 
                            driveId={song.driveId} 
                            isPlaying={isPlaying} 
                            onToggle={() => togglePlay(song.id)}
                            title={song.title}
                        />
                      </div>
                      <span className={`text-xs font-mono text-gray-700 transition-opacity duration-200 ${isPlaying || isSelected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}>
                          {String(song.id).padStart(2, '0')}
                      </span>
                  </div>
                  
                  {/* Title Column */}
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className={`truncate text-sm font-medium tracking-wide transition-colors ${isPlaying ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {song.title}
                    </span>
                  </div>
                </div>

                {/* Action Column */}
                <div className="flex items-center pl-4 border-l border-white/5">
                    <button
                        onClick={(e) => toggleVote(song.id, e)}
                        disabled={disabled}
                        className={`
                            flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                            ${isSelected 
                                ? 'text-white scale-110' 
                                : 'text-gray-800 hover:text-gray-500'}
                            ${disabled ? 'opacity-0 cursor-default' : 'cursor-pointer'}
                        `}
                        aria-label={isSelected ? "Remove vote" : "Vote for track"}
                    >
                        <HeartIcon className="w-4 h-4" filled={isSelected} />
                    </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Elegant Submission Bar */}
        <div className={`fixed bottom-0 left-0 w-full z-30 transition-transform duration-500 bg-black/90 backdrop-blur-md border-t border-white/10 ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="max-w-[480px] mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Progress</span>
                    <div className="h-1 w-24 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${(selectedIds.length / MAX_VOTES) * 100}%` }}></div>
                    </div>
                </div>
                <button
                    onClick={handleSubmitVotes}
                    disabled={!isComplete}
                    className={`
                        px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300
                        ${isComplete 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    {isComplete ? 'Submit Votes' : 'Select 10'}
                </button>
            </div>
        </div>
      </div>
    );
  };

  const SuccessView = () => (
    <div className="flex flex-col h-full justify-center items-center text-center space-y-12 my-auto min-h-[70vh]">
        <FadeIn>
            <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <HeartIcon className="w-6 h-6 text-white" filled />
            </div>
            <h1 className="font-serif text-3xl mb-4 text-white">Thank You</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Submission Received</p>
        </FadeIn>

        <FadeIn delay={200}>
            <div className="max-w-sm mx-auto font-sans font-light text-sm leading-loose text-gray-400 space-y-4">
                <p className="text-gray-200">Dear {user.name},</p>
                <p>Your choices have been permanently recorded.<br/>Thank you for shaping this album.</p>
                
                <div className="py-8 border-y border-white/5 mt-8 w-full max-w-[280px] mx-auto">
                    <p className="text-[9px] text-gray-600 mb-6 uppercase tracking-widest">Your Top 10 Selection</p>
                    <ul className="space-y-3">
                        {selectedIds.sort((a,b) => a - b).map(id => (
                            <li key={id} className="text-xs text-gray-300 flex justify-between items-center">
                                <span className="font-serif text-[10px] text-gray-600">{String(id).padStart(2,'0')}</span>
                                <span className="text-gray-400">{SONGS.find(s => s.id === id)?.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-[10px] text-gray-600 mt-8">
                    Confirmation sent to <span className="text-gray-400 border-b border-gray-800 pb-0.5">{user.email}</span>
                </p>
            </div>
        </FadeIn>
        
        <FadeIn delay={800}>
            <button 
                onClick={() => window.location.reload()}
                className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors mt-8"
            >
                Return Home
            </button>
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
      
      {/* Footer Admin Link - Subtle */}
      {step === AppStep.INTRO && (
        <div className="fixed bottom-4 right-4 z-50">
           <button 
             onClick={() => setStep(AppStep.ADMIN)}
             className="text-[9px] text-gray-800 hover:text-gray-600 uppercase tracking-widest transition-colors"
           >
             Admin
           </button>
        </div>
      )}
    </Layout>
  );
}