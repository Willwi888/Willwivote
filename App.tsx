import React, { useState, useEffect } from 'react';
import { Layout, FadeIn } from './components/Layout';
import { SONGS } from './constants';
import { User, AppStep, MAX_VOTES } from './types';
import AudioPlayer from './components/AudioPlayer';
import { CheckIcon, HeartIcon, SearchIcon, MoreIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';

// --- CONFIGURATION ---
// Change this ID to update the featured track on the homepage
// Currently using the first track as a placeholder
const FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb";

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
  const [playingId, setPlayingId] = useState<number | null>(null); // Use number for song IDs, but special handling for intro
  const [introPlaying, setIntroPlaying] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Scroll to top on step change
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
    setIntroPlaying(false); // Stop intro if song plays
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const toggleIntroPlay = () => {
    setPlayingId(null); // Stop any song list playback
    setIntroPlaying(!introPlaying);
  };

  // --- Views ---

  const IntroView = () => (
    <div className="flex flex-col gap-10 pt-8 pb-20">
      {/* Image Section */}
      <FadeIn className="w-full relative mx-auto max-w-sm">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[40px] shadow-2xl shadow-white/5 border border-white/10">
          <img 
            src="https://drive.google.com/uc?export=view&id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9" 
            alt="Willwi" 
            className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          
          <div className="absolute bottom-8 left-8 right-8 text-center">
             <h2 className="font-serif text-3xl mb-2 text-white drop-shadow-lg tracking-wide">摯愛</h2>
             <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 drop-shadow-md">2026 Collection</p>
          </div>
        </div>
      </FadeIn>

      {/* Content Section */}
      <div className="flex flex-col items-center justify-center space-y-10 text-center">
        <FadeIn delay={200}>
           <div className="max-w-xs mx-auto">
             <p className="text-xs leading-8 font-light text-gray-400 font-sans tracking-wide">
               <span className="text-white font-medium">40 首作品</span>，選出你心中的前 10 首。<br/>
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
            <div className="space-y-6 w-full max-w-sm">
                 <h3 className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold">Verified Presence</h3>
                 <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-500 font-light">
                    {SOCIAL_LINKS.slice(0, 5).map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-0.5">{link.name}</a>
                    ))}
                </div>
            </div>
        </FadeIn>

        <FadeIn delay={500} className="pt-4">
          <button 
            onClick={handleStart}
            className="group relative px-10 py-4 overflow-hidden rounded-full bg-white text-black transition-all hover:bg-gray-200"
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
        <div className="mb-16 text-center">
             <h2 className="font-serif text-3xl font-light tracking-widest text-white mb-2">Identification</h2>
             <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Access Verification</p>
        </div>
      </FadeIn>
      
      <FadeIn delay={100}>
        <form onSubmit={handleLogin} className="w-full max-w-sm mx-auto space-y-12">
          
          {/* Minimalist Input 1 */}
          <div className="group relative">
            <input 
              type="text" 
              required
              id="name"
              value={user.name}
              onChange={e => setUser({...user, name: e.target.value})}
              className="peer w-full bg-transparent border-b border-gray-800 py-3 text-lg text-white font-serif focus:outline-none focus:border-white transition-colors placeholder-transparent"
              placeholder="Name"
              autoComplete="off"
            />
            <label 
                htmlFor="name"
                className="absolute left-0 -top-3 text-[10px] uppercase tracking-widest text-gray-500 transition-all 
                           peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-600 
                           peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-gray-400"
            >
                Your Name
            </label>
          </div>
          
          {/* Minimalist Input 2 */}
          <div className="group relative">
            <input 
              type="email" 
              required
              id="email"
              value={user.email}
              onChange={e => setUser({...user, email: e.target.value})}
              className="peer w-full bg-transparent border-b border-gray-800 py-3 text-lg text-white font-serif focus:outline-none focus:border-white transition-colors placeholder-transparent"
              placeholder="Email"
              autoComplete="off"
            />
             <label 
                htmlFor="email"
                className="absolute left-0 -top-3 text-[10px] uppercase tracking-widest text-gray-500 transition-all 
                           peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-600 
                           peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-gray-400"
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
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative text-xs font-bold uppercase tracking-[0.3em] text-white group-hover:text-gray-300 transition-colors">
                Proceed
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
      <div className="pb-32 relative">
        {/* Header - Reference Style */}
        <header className="flex flex-col gap-6 mb-8 pt-2">
            <div className="flex justify-between items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surfaceHighlight text-gray-400">
                    <SearchIcon className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-xl tracking-wide">Candidate Tracks</h2>
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surfaceHighlight text-gray-400">
                    <MoreIcon className="w-5 h-5" />
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-black' : 'bg-surfaceHighlight text-gray-400 hover:text-white'}`}
                >
                    All Tracks
                </button>
                <button 
                  onClick={() => setFilter('liked')}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'liked' ? 'bg-white text-black' : 'bg-surfaceHighlight text-gray-400 hover:text-white'}`}
                >
                    <span>Selected</span>
                    <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[9px]">{selectedIds.length}</span>
                </button>
                <div className="flex-1"></div>
                 <div className="text-xs text-gray-500 font-serif italic">
                    {selectedIds.length} / {MAX_VOTES}
                </div>
            </div>
        </header>

        {/* List */}
        <ul className="space-y-2" role="list">
          {filteredSongs.map((song) => {
            const isSelected = selectedIds.includes(song.id);
            const isPlaying = playingId === song.id;
            const disabled = !isSelected && isComplete;

            return (
              <li 
                key={song.id}
                onClick={() => togglePlay(song.id)}
                className={`
                    group relative flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer
                    ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Album Art Placeholder - Rounded Square */}
                  <div className={`
                    w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-surfaceHighlight text-gray-500 font-serif text-[10px] relative overflow-hidden group-hover:shadow-lg transition-all
                    ${isPlaying ? 'shadow-white/10 ring-1 ring-white/20' : ''}
                  `}>
                    {/* Fake gradient cover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    {isPlaying ? <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div> : null}
                    
                    <span className="relative z-10">{String(song.id).padStart(2, '0')}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`font-medium text-sm transition-colors ${isPlaying ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>
                        {song.title}
                    </span>
                    <span className="text-[10px] text-gray-500 tracking-wide mt-1 group-hover:text-gray-400 transition-colors">
                        Willwi • 2026 DEMO
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                     {/* Play Button (Small) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <AudioPlayer 
                            driveId={song.driveId} 
                            isPlaying={isPlaying} 
                            onToggle={() => togglePlay(song.id)}
                            title={song.title}
                        />
                    </div>

                    {/* Like/Vote Button */}
                    <button
                        onClick={(e) => toggleVote(song.id, e)}
                        disabled={disabled}
                        className={`
                            w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
                            ${isSelected ? 'text-white scale-110' : 'text-gray-600 hover:text-gray-400'}
                            ${disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <HeartIcon className="w-5 h-5" filled={isSelected} />
                    </button>
                </div>
              </li>
            );
          })}
           {filteredSongs.length === 0 && (
              <li className="text-center py-12 text-gray-500 text-xs">
                  No tracks found in this category.
              </li>
          )}
        </ul>

        {/* Floating Action Bar - Glassmorphism */}
        <div className="fixed bottom-6 left-0 w-full z-30 px-6">
            <div className="max-w-[500px] mx-auto glass-panel rounded-full p-2 pl-6 flex justify-between items-center shadow-2xl border border-white/10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Your Selection</span>
                    <span className="text-xs font-bold text-white">{selectedIds.length} <span className="text-gray-500 font-normal">of {MAX_VOTES}</span></span>
                </div>
                <button
                    onClick={handleSubmitVotes}
                    disabled={!isComplete}
                    className={`
                        px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300
                        ${isComplete 
                            ? 'bg-white text-black shadow-lg hover:scale-105 active:scale-95' 
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    {isComplete ? 'Submit' : 'Pending'}
                </button>
            </div>
        </div>
      </div>
    );
  };

  const SuccessView = () => (
    <div className="flex flex-col h-full justify-center items-center text-center space-y-12 my-auto min-h-[70vh]">
        <FadeIn>
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
                <HeartIcon className="w-8 h-8 text-white" filled />
            </div>
            <h1 className="font-serif text-3xl mb-4 text-white">Thank You</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Votes Submitted</p>
        </FadeIn>

        <FadeIn delay={200}>
            <div className="max-w-sm mx-auto font-sans font-light text-sm leading-loose text-gray-400 space-y-4">
                <p className="text-gray-200">Dear {user.name},</p>
                <p>Your selection has been recorded.<br/>Thank you for being part of this journey.</p>
                
                <div className="p-6 bg-surfaceHighlight/50 rounded-2xl border border-white/5 mt-8">
                    <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest">Your Top 10</p>
                    <ul className="grid grid-cols-1 gap-2 text-left">
                        {selectedIds.sort((a,b) => a - b).map(id => (
                            <li key={id} className="text-xs text-gray-300 flex items-center gap-3">
                                <span className="w-4 text-gray-600 font-serif text-[10px]">{String(id).padStart(2,'0')}</span>
                                {SONGS.find(s => s.id === id)?.title}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-[10px] text-gray-500 mt-8">
                    A limited edition music card will be sent to:<br/>{user.email}
                </p>
            </div>
        </FadeIn>
        
        <FadeIn delay={800}>
            <button 
                onClick={() => window.location.reload()}
                className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-2"
            >
                Back to Home
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
      
      {/* Footer Admin Link */}
      {step === AppStep.INTRO && (
        <div className="fixed bottom-4 right-4 z-50">
           <button 
             onClick={() => setStep(AppStep.ADMIN)}
             className="text-[9px] text-gray-700 hover:text-gray-500 uppercase tracking-widest opacity-50 hover:opacity-100"
           >
             Admin
           </button>
        </div>
      )}
    </Layout>
  );
}