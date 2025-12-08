
import React, { useState, useEffect, useContext } from 'react';
import { Layout, FadeIn, BackgroundContext } from './components/Layout';
import { getSongs, getGlobalConfig } from './services/storage';
import { Song, User, AppStep, MAX_VOTES, Language } from './types';
import { TRANSLATIONS } from './constants';
import AudioPlayer from './components/AudioPlayer';
import { HeartIcon, SpinnerIcon, ArrowLeftIcon } from './components/Icons';
import { saveVote } from './services/storage';
import { AdminView } from './components/AdminView';
import { SongDetailModal } from './components/SongDetailModal';

// --- CONFIGURATION ---
// Fallback ID if no global config is set
const DEFAULT_FEATURED_AUDIO_ID = "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb"; 
const ARTIST_IMAGE_URL = "https://drive.google.com/thumbnail?id=1_ZLs1g_KrVzTYpYSD_oJYwlKjft26aP9&sz=w1000";

const SOCIAL_LINKS = [
    { name: 'Spotify', url: 'https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4' },
    { name: 'Instagram', url: 'https://www.instagram.com/willwi888' },
    { name: 'Website', url: 'https://willwi.com/' },
];

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [user, setUser] = useState<User>({ name: '', email: '', timestamp: '', votes: [], voteReasons: {} });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voteReasons, setVoteReasons] = useState<{ [id: number]: string }>({});
  
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [lang, setLang] = useState<Language>('zh');

  // Dynamic Intro Audio State
  const [introAudioId, setIntroAudioId] = useState(DEFAULT_FEATURED_AUDIO_ID);

  // Modal State
  const [detailSongId, setDetailSongId] = useState<number | null>(null);

  useEffect(() => {
    setSongs(getSongs());
    const globalConfig = getGlobalConfig();
    if (globalConfig.introAudioUrl) {
        setIntroAudioId(globalConfig.introAudioUrl);
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Handlers
  const handleStart = () => {
      setIntroPlaying(false); // Stop intro music when entering
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
    if (user.name && user.email) {
      setStep(AppStep.VOTING);
    }
  };

  const toggleVote = (id: number, reason?: string) => {
    if (selectedIds.includes(id)) {
      // Un-voting
      setSelectedIds(prev => prev.filter(sid => sid !== id));
      // Optional: clear reason when unvoting, but keeping it is also fine
      const newReasons = { ...voteReasons };
      delete newReasons[id];
      setVoteReasons(newReasons);
    } else {
      // Voting
      if (selectedIds.length < MAX_VOTES) {
        setSelectedIds(prev => [...prev, id]);
        if (reason) {
            setVoteReasons(prev => ({ ...prev, [id]: reason }));
        }
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
                         <div className={`w-12 h-12 rounded-