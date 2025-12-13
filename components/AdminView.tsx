import React, { useState, useEffect, useRef } from 'react';
import { getVotes, getLeaderboard, getSongs, updateSong, updateSongsBulk, getGlobalConfig, saveGlobalConfig, restoreFromBackup, publishSongsToCloud, fetchRemoteSongs, saveVote, extractYouTubeId } from '../services/storage';
import { getAudioUrl } from '../constants';
import { Song, User } from '../types';
import { Layout, FadeIn } from './Layout';
import { PlayIcon, SpinnerIcon, CheckIcon, PauseIcon } from './Icons';
import { useAudio } from './AudioContext';
import { supabase } from '../services/supabaseClient';

type Tab = 'dashboard' | 'songs' | 'manual_vote';
type CloudStatus = 'connected' | 'offline' | 'checking' | 'missing_table_songs' | 'missing_table_votes' | 'missing_both';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [users, setUsers] = useState<User[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [storageCount, setStorageCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('checking');
  
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  
  // Config States
  const [introUrl, setIntroUrl] = useState('');
  const [homeSongTitle, setHomeSongTitle] = useState('');
  const [homeSongUrl, setHomeSongUrl] = useState('');

  const [editForm, setEditForm] = useState<Partial<Song>>({});
  
  // Use Audio Context for Testing
  const { playingId, playSong, pause, isPlaying } = useAudio();
  
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  // Manual Vote State
  const [manualVoteName, setManualVoteName] = useState('');
  const [manualVoteEmail, setManualVoteEmail] = useState('');
  const [manualVoteIds, setManualVoteIds] = useState<string>(''); // Comma separated IDs
  const [manualVoteStatus, setManualVoteStatus] = useState('');
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isAuthenticated) {
          loadAllData();
      }
  }, [isAuthenticated]);

  const loadAllData = async () => {
      setLoadingData(true);
      setCloudStatus('checking');
      
      const songs = getSongs();
      setLocalSongs(songs);
      
      const localData = localStorage.getItem('beloved_2026_song_metadata');
      if (localData) {
          try {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed)) setStorageCount(parsed.length);
          } catch(e) { setStorageCount(0); }
      } else {
          setStorageCount(0);
      }
      
      const config = getGlobalConfig();
      setIntroUrl(config.introAudioUrl || '');
      setHomeSongTitle(config.homepageSongTitle || '');
      setHomeSongUrl(config.homepageSongUrl || '');
      
      try {
          const remoteData = await fetchRemoteSongs();
          if (remoteData?.config) {
             if (remoteData.config.homepageSongTitle) setHomeSongTitle(remoteData.config.homepageSongTitle);
             if (remoteData.config.homepageSongUrl) setHomeSongUrl(remoteData.config.homepageSongUrl);
          }
      } catch (e) {}

      try {
        const fetchedVotes = await getVotes();
        setUsers(fetchedVotes);
        
        if (supabase) {
            // Check Tables Existence
            const { error: songsError } = await supabase.from('songs').select('count', { count: 'exact', head: true });
            const { error: votesError } = await supabase.from('votes').select('count', { count: 'exact', head: true });
            
            const missingSongs = songsError && songsError.code === '42P01';
            const missingVotes = votesError && votesError.code === '42P01';

            if (missingSongs && missingVotes) {
                setCloudStatus('missing_both');
            } else if (missingSongs) {
                setCloudStatus('missing_table_songs');
            } else if (missingVotes) {
                setCloudStatus('missing_table_votes');
            } else if (songsError || votesError) {
                console.error("Supabase Connection Error:", songsError || votesError);
                setCloudStatus('offline');
            } else {
                setCloudStatus('connected');
            }
        } else {
            setCloudStatus('offline');
        }
      } catch (e) {
          console.error("Load data error", e);
          setCloudStatus('offline');
      }

      setLoadingData(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8888') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleSaveGlobalConfig = () => {
      saveGlobalConfig({ 
          introAudioUrl: introUrl,
          homepageSongTitle: homeSongTitle,
          homepageSongUrl: homeSongUrl
      });
      alert("✅ Settings Saved locally. \n\nIMPORTANT: Click 'Publish to Cloud' to make these live on the website!");
  };

  const handlePublishToCloud = async () => {
      if (!confirm("This will overwrite the Live Website with your local data. Are you sure?")) return;
      setIsPublishing(true);
      try {
          await publishSongsToCloud(localSongs, {
              introAudioUrl: introUrl,
              homepageSongTitle: homeSongTitle,
              homepageSongUrl: homeSongUrl
          });
          alert("✅ Success! Your songs AND homepage settings are now live.");
          loadAllData();
      } catch (e: any) {
          console.error("Publish Error:", e);
          let msg = e.message || "Unknown error";
          
          if (e.code === '42P01' || msg.includes('does not exist')) {
             msg = "Database tables are missing. Please run the SQL commands shown below.";
             setCloudStatus('missing_both');
          } else if (e.code === '42501' || msg.includes('permission denied') || msg.includes('policy')) {
             msg = "Permission Denied. You need to enable RLS Policies (See SQL below).";
             // Force error status to show the SQL block
             setCloudStatus('missing_both'); 
          }
          
          alert(`❌ Publish Failed: ${msg}\n\nCheck the 'DB SETUP REQUIRED' section below.`);
      } finally {
          setIsPublishing(false);
      }
  };

  // --- ONE CLICK FIX BUTTON (UPDATED) ---
  const handleFixDropboxLinks = () => {
      const current = getSongs();
      let changedCount = 0;
      
      const updated = current.map(s => {
          if (s.customAudioUrl && (s.customAudioUrl.includes('dropbox.com') || s.customAudioUrl.includes('dropboxusercontent.com'))) {
              let newUrl = s.customAudioUrl;
              
              // Skip if it is a folder link
              if (newUrl.includes('/fo/')) return s;

              // 1. Force www.dropbox.com (Revert from dl.dropboxusercontent.com if needed for raw=1)
              // This is critical because dropboxusercontent often forces download behavior
              if (newUrl.includes('dl.dropboxusercontent.com')) {
                  newUrl = newUrl.replace('dl.dropboxusercontent.com', 'www.dropbox.com');
              }
              
              // 2. Force raw=1 (Inline Stream)
              if (newUrl.includes('dl=0')) {
                  newUrl = newUrl.replace('dl=0', 'raw=1');
              } else if (newUrl.includes('dl=1')) {
                  newUrl = newUrl.replace('dl=1', 'raw=1');
              } else if (!newUrl.includes('raw=1')) {
                   newUrl = newUrl + (newUrl.includes('?') ? '&raw=1' : '?raw=1');
              }
              
              if (newUrl !== s.customAudioUrl) {
                  changedCount++;
                  return { ...s, customAudioUrl: newUrl };
              }
          }
          return s;
      });

      if (changedCount > 0) {
          restoreFromBackup(updated);
          setLocalSongs(updated);
          alert(`✅ Fixed ${changedCount} Dropbox links to Stream Mode (raw=1)!\n\n👉 IMPORTANT: Click 'PUBLISH TO CLOUD' now to make these changes live!`);
      } else {
          alert("All Dropbox links are already optimized! (No changes needed)");
      }
  };

  const handleFixSingleLink = () => {
      let url = editForm.customAudioUrl || '';
      if (!url) return;
      
      if (url.includes('dropbox.com') || url.includes('dropboxusercontent.com')) {
           if (url.includes('/fo/')) {
               alert("This looks like a Folder Link. Skipping auto-fix.");
               return;
           }

           let newUrl = url;
           // robust replacement
           if (newUrl.includes('dl.dropboxusercontent.com')) {
               newUrl = newUrl.replace('dl.dropboxusercontent.com', 'www.dropbox.com');
           }
           
           if (newUrl.includes('dl=0')) {
               newUrl = newUrl.replace('dl=0', 'raw=1');
           } else if (newUrl.includes('dl=1')) {
               newUrl = newUrl.replace('dl=1', 'raw=1');
           } else if (!newUrl.includes('raw=1')) {
               newUrl = newUrl + (newUrl.includes('?') ? '&raw=1' : '?raw=1');
           }
           
           setEditForm({ ...editForm, customAudioUrl: newUrl });
      } else {
          alert("Not a Dropbox link. Nothing to fix.");
      }
  };

  // --- DIAGNOSTIC HELPER ---
  const getLinkStatus = (url?: string) => {
      if (!url) return { status: 'empty', label: 'No Link', color: 'text-gray-500' };
      
      const isYoutube = extractYouTubeId(url);
      if (isYoutube) return { status: 'ok', label: 'YouTube (OK)', color: 'text-green-500' };

      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
          if (url.includes('/folders/') || url.includes('/drive/folders/')) {
              return { status: 'error', label: '❌ 這是資料夾連結！(Folder Link)', color: 'text-red-500 font-bold bg-red-900/20 px-2 py-0.5 rounded' };
          }
          return { status: 'warning', label: 'Google Drive (請右鍵檔案複製連結)', color: 'text-yellow-500' };
      }

      if (url.includes('dropbox.com') || url.includes('dropboxusercontent.com')) {
          if (url.includes('/fo/') || url.includes('/sh/')) {
              return { status: 'error', label: '❌ 這是資料夾連結！(Folder Link)', color: 'text-red-500 font-bold bg-red-900/20 px-2 py-0.5 rounded' };
          }
          return { status: 'ok', label: 'Dropbox (Auto-Optimized)', color: 'text-green-500' };
      }
      
      return { status: 'unknown', label: 'Direct URL', color: 'text-blue-400' };
  };

  const startEdit = (song: Song) => {
      setEditingSongId(song.id);
      setEditForm({
          title: song.title,
          customAudioUrl: song.customAudioUrl || '',
          customImageUrl: song.customImageUrl || '',
          lyrics: song.lyrics || '',
          credits: song.credits || ''
      });
  };

  const saveEdit = () => {
      if (editingSongId === null) return;
      const updated = updateSong(editingSongId, editForm);
      setLocalSongs(updated);
      setEditingSongId(null);
  };
  
  // --- TEST PLAYER LOGIC ---
  const handleTestPlay = (song: Song) => {
      // Logic from AudioPlayer to determine source
      let rawUrl = song.customAudioUrl || '';
      const youtubeId = extractYouTubeId(rawUrl) || song.youtubeId;
      
      if (youtubeId) {
          window.open(`https://youtu.be/${youtubeId}`, '_blank');
          return;
      }
      
      const finalUrl = getAudioUrl(rawUrl);
      if (playingId === song.id && isPlaying) {
          pause();
      } else {
          playSong(song.id, finalUrl, song.title);
      }
  };

  const handleBulkImport = () => {
      if (!importText.trim()) return;
      const lines = importText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return;
      const updated = updateSongsBulk(lines);
      setLocalSongs(updated);
      setShowImport(false);
      setImportText('');
      alert(`✅ Success! Updated ${Math.min(lines.length, 40)} songs locally.\n\n👉 IMPORTANT: Click 'PUBLISH TO CLOUD' to save these changes.`);
  };

  const handleManualVoteSubmit = async () => {
      if (!manualVoteName || !manualVoteEmail || !manualVoteIds) {
          alert("Please fill in all fields.");
          return;
      }
      
      const voteIds = manualVoteIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n <= 40);
      
      if (voteIds.length === 0) {
          alert("No valid song IDs found (1-40).");
          return;
      }

      setManualVoteStatus('Saving...');
      
      const manualUser: User = {
          name: manualVoteName + " (Admin Manual)",
          email: manualVoteEmail,
          timestamp: new Date().toISOString(),
          votes: voteIds,
          voteReasons: { 0: "Manually added by Admin" }
      };
      
      await saveVote(manualUser);
      setManualVoteStatus('Saved!');
      setManualVoteName('');
      setManualVoteEmail('');
      setManualVoteIds('');
      setTimeout(() => setManualVoteStatus(''), 2000);
      loadAllData(); 
  };

  const handleDownloadBackup = () => {
      const data = {
          songs: localSongs,
          globalConfig: { 
              introAudioUrl: introUrl,
              homepageSongTitle: homeSongTitle,
              homepageSongUrl: homeSongUrl
          },
          votes: users, 
          timestamp: new Date().toISOString()
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beloved_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleRestoreClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = event.target?.result as string;
              const data = JSON.parse(json);
              if (data.songs) {
                  restoreFromBackup(data.songs);
                  setLocalSongs(data.songs);
              }
              if (data.globalConfig) {
                  saveGlobalConfig(data.globalConfig);
                  setIntroUrl(data.globalConfig.introAudioUrl || '');
                  setHomeSongTitle(data.globalConfig.homepageSongTitle || '');
                  setHomeSongUrl(data.globalConfig.homepageSongUrl || '');
              }
              alert("✅ Restore Successful! \n\nIMPORTANT: If you are on the Live Site, please click 'Publish to Cloud' now to sync these changes to the database.");
              loadAllData();
          } catch (err) {
              alert("❌ Failed to restore backup. Invalid JSON file.");
          }
      };
      reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
           <FadeIn>
             <h2 className="font-serif text-2xl text-white mb-2">Manager Login</h2>
             <p className="text-[10px] uppercase tracking-widest text-gray-500 text-center">Restricted Area</p>
           </FadeIn>
           <FadeIn delay={100}>
             <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-64">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-transparent border-b border-gray-700 py-2 text-center text-white focus:border-white outline-none placeholder-gray-700 transition-colors"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs text-center">Incorrect Password</p>}
                <button type="submit" className="bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest py-3 rounded-full transition-all">Enter</button>
                <button onClick={onBack} type="button" className="text-xs text-gray-600 hover:text-gray-400 mt-4">Back</button>
             </form>
           </FadeIn>
        </div>
      </Layout>
    );
  }

  const leaderboard = getLeaderboard(localSongs, users);
  const maxVotesForSingleSong = leaderboard.length > 0 ? leaderboard[0].count : 1;
  const isMissingSongs = cloudStatus === 'missing_table_songs' || cloudStatus === 'missing_both';
  const isMissingVotes = cloudStatus === 'missing_table_votes' || cloudStatus === 'missing_both';
  const isConnectionError = cloudStatus === 'offline';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Manager Dashboard</h1>
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 uppercase tracking-widest flex flex-wrap gap-2 items-center">
                    Beloved 2026 
                    {cloudStatus === 'connected' && <span className="text-green-400 font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-900/50 flex items-center gap-1">ONLINE</span>}
                    {cloudStatus === 'offline' && <span className="text-gray-400 px-2 py-0.5 bg-white/5 rounded border border-white/10">OFFLINE</span>}
                    {(isMissingSongs || isMissingVotes) && <span className="text-red-500 px-2 py-0.5 bg-red-900/20 rounded border border-red-900/50 font-bold">DB SETUP REQUIRED</span>}
                </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex bg-white/5 rounded-lg p-1">
                 <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Analytics</button>
                 <button onClick={() => setActiveTab('songs')} className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'songs' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Manage Songs</button>
                 <button onClick={() => setActiveTab('manual_vote')} className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'manual_vote' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Manual Vote</button>
             </div>
             <button onClick={onBack} className="text-xs text-gray-500 hover:text-white transition-colors">Exit</button>
          </div>
        </header>
        
        {/* PERMISSION CHECKER / REMINDER */}
        <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-lg mb-8 animate-fade-in flex flex-col gap-4">
             <div className="flex items-start gap-4">
                <div className="text-red-500 text-3xl">⚠️</div>
                <div>
                    <h3 className="text-red-500 font-bold mb-2 text-lg">Google Drive 404 錯誤修正指南</h3>
                    <p className="text-sm text-gray-300 mb-2">
                        如果您看到 404 錯誤，通常是因為您貼上了「資料夾」的連結，而不是「檔案」連結。
                    </p>
                    <ol className="list-decimal list-inside text-xs text-white space-y-2 bg-black/40 p-4 rounded border border-white/10">
                        <li>
                            <strong className="text-gold">請勿使用資料夾連結：</strong> 播放器無法讀取整個資料夾 (如 <code>drive/folders/...</code>)。
                        </li>
                        <li>
                            <strong>取得正確連結：</strong> 在 Google Drive 列表中的 <strong className="text-gold">單一 MP3 檔案上按右鍵</strong> {'>'} 選擇「共用」 {'>'} 「複製連結」。
                        </li>
                        <li>
                            <strong>檢查權限：</strong> 確保該檔案的權限也是「知道連結的任何人」。
                        </li>
                    </ol>
                </div>
             </div>
        </div>

        {/* SQL Setup Instructions */}
        {(isMissingSongs || isMissingVotes || isConnectionError) && (
            <div className="mb-8 p-6 bg-red-900/10 border border-red-900/50 rounded-lg animate-fade-in">
                <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">⚠️</span> DATABASE SETUP REQUIRED
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                    Your database is missing the required tables or permissions. 
                    Please run the SQL below in your <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" className="text-gold hover:underline font-bold">Supabase SQL Editor</a>.
                </p>
                <div className="bg-black p-4 rounded text-xs font-mono text-green-400 overflow-x-auto border border-white/10 relative group">
                    <pre>{`
-- 1. Create Songs Table
create table if not exists songs (
  id bigint primary key,
  title text,
  youtube_id text,
  custom_audio_url text,
  custom_image_url text,
  lyrics text,
  credits text,
  updated_at timestamptz
);

-- 2. Create Votes Table
create table if not exists votes (
  id bigint generated by default as identity primary key,
  user_name text,
  user_email text,
  vote_ids jsonb,
  vote_reasons jsonb,
  created_at timestamptz default now()
);

-- 3. Enable RLS (Security)
alter table songs enable row level security;
alter table votes enable row level security;

-- 4. Create Policies (Allow Public Read/Write for this Event)
create policy "Public Read Songs" on songs for select using (true);
create policy "Public Insert Songs" on songs for insert with check (true);
create policy "Public Update Songs" on songs for update using (true);

create policy "Public Read Votes" on votes for select using (true);
create policy "Public Insert Votes" on votes for insert with check (true);
                    `}</pre>
                    <button 
                        onClick={() => navigator.clipboard.writeText(`create table if not exists songs ( id bigint primary key, title text, youtube_id text, custom_audio_url text, custom_image_url text, lyrics text, credits text, updated_at timestamptz ); create table if not exists votes ( id bigint generated by default as identity primary key, user_name text, user_email text, vote_ids jsonb, vote_reasons jsonb, created_at timestamptz default now() ); alter table songs enable row level security; alter table votes enable row level security; create policy "Public Read Songs" on songs for select using (true); create policy "Public Insert Songs" on songs for insert with check (true); create policy "Public Update Songs" on songs for update using (true); create policy "Public Read Votes" on votes for select using (true); create policy "Public Insert Votes" on votes for insert with check (true);`)}
                        className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded text-[10px] uppercase font-bold opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                        Copy SQL
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-slide-up">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-6 rounded border border-white/10">
                        <div className="text-3xl font-serif text-white mb-2">{users.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Total Voters</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded border border-white/10">
                         <div className="text-3xl font-serif text-white mb-2">
                             {users.reduce((acc, u) => acc + u.votes.length, 0)}
                         </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Total Votes Cast</div>
                    </div>
                     <div className="bg-white/5 p-6 rounded border border-white/10">
                         <div className="text-3xl font-serif text-white mb-2">{localSongs.filter(s => s.customAudioUrl || s.youtubeId).length} / 40</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Songs with Audio</div>
                    </div>
                     <div className="bg-white/5 p-6 rounded border border-white/10">
                         <div className="text-3xl font-serif text-white mb-2">{storageCount}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">Local Edits</div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div>
                     <h3 className="text-xl font-serif text-gold mb-6 flex items-center gap-3">
                         <span className="text-xs uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded">Live Results</span>
                         Leaderboard
                     </h3>
                     <div className="space-y-3">
                         {leaderboard.map((item, index) => (
                             <div key={item.song?.id} className="flex items-center gap-4 group">
                                 <div className="w-8 text-right text-sm font-mono text-gray-600 group-hover:text-gold">#{index + 1}</div>
                                 <div className="flex-1 relative h-10 bg-white/5 rounded overflow-hidden">
                                     <div 
                                        className="absolute top-0 left-0 h-full bg-gold/20 transition-all duration-1000 group-hover:bg-gold/40"
                                        style={{ width: `${(item.count / maxVotesForSingleSong) * 100}%` }}
                                     ></div>
                                     <div className="absolute inset-0 flex items-center justify-between px-4">
                                         <span className="text-sm font-medium z-10">{item.song?.title}</span>
                                         <span className="text-xs font-mono text-gray-400 z-10">{item.count} votes</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>

                 {/* Recent Comments */}
                 <div>
                     <h3 className="text-xl font-serif text-gold mb-6">Recent Stories</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                         {users.slice(0, 6).map((u, i) => (
                             <div key={i} className="bg-white/5 p-4 rounded border border-white/5 hover:border-gold/30 transition-colors">
                                 <div className="flex justify-between items-start mb-2">
                                     <div className="font-bold text-sm text-gray-300">{u.name}</div>
                                     <div className="text-[10px] text-gray-600">{new Date(u.timestamp).toLocaleDateString()}</div>
                                 </div>
                                 <div className="text-xs text-gray-400 italic mb-3">
                                     {Object.values(u.voteReasons || {}).join(' / ')}
                                 </div>
                                 <div className="flex gap-2 flex-wrap">
                                     {u.votes.map(vid => (
                                         <span key={vid} className="text-[9px] bg-black px-2 py-1 rounded border border-white/10 text-gray-500">
                                             #{String(vid).padStart(2,'0')}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        )}

        {activeTab === 'songs' && (
            <div className="space-y-8 animate-slide-up">
                
                {/* Global Config Section */}
                <div className="bg-white/5 p-6 rounded border border-white/10">
                     <h3 className="text-lg font-serif text-white mb-4">Homepage Configuration</h3>
                     <div className="grid md:grid-cols-2 gap-4 mb-4">
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 block mb-1">Homepage Song Title</label>
                             <input 
                                className="w-full bg-black border border-white/20 p-2 text-sm text-white focus:border-gold outline-none rounded"
                                value={homeSongTitle}
                                onChange={e => setHomeSongTitle(e.target.value)}
                                placeholder="Default: Beloved 摯愛 (The 2026 Collection)"
                             />
                         </div>
                         <div>
                             <label className="text-[10px] uppercase text-gray-500 block mb-1">Homepage Song URL (Youtube/Dropbox/MP3)</label>
                             <input 
                                className="w-full bg-black border border-white/20 p-2 text-sm text-white focus:border-gold outline-none rounded"
                                value={homeSongUrl}
                                onChange={e => setHomeSongUrl(e.target.value)}
                                placeholder="Paste link here..."
                             />
                         </div>
                     </div>
                     <div className="flex justify-end gap-4">
                         <button onClick={handleSaveGlobalConfig} className="text-xs uppercase tracking-widest bg-white/10 px-4 py-2 rounded hover:bg-white/20">Save Settings Locally</button>
                     </div>
                </div>

                {/* Bulk Import */}
                <div className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/10">
                     <div>
                         <h3 className="text-sm font-bold text-gray-300">Quick Actions</h3>
                         <p className="text-[10px] text-gray-500">Sync, backup, or batch update songs.</p>
                     </div>
                     <div className="flex gap-3">
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                         />
                         
                         {/* EMERGENCY FIX BUTTON */}
                         <button 
                             onClick={handleFixDropboxLinks}
                             className="text-[10px] uppercase font-bold px-3 py-2 rounded bg-blue-900/50 border border-blue-500/50 text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-2"
                             title="Converts dl=0/1 to raw=1 for better streaming"
                         >
                            ⚡ AUTO-FIX DROPBOX LINKS
                         </button>

                         <button onClick={handleDownloadBackup} className="text-[10px] uppercase bg-black border border-white/20 px-3 py-2 rounded hover:text-gold">Backup Data</button>
                         <button onClick={handleRestoreClick} className="text-[10px] uppercase bg-black border border-white/20 px-3 py-2 rounded hover:text-gold">Restore Backup</button>
                         <button onClick={() => setShowImport(!showImport)} className="text-[10px] uppercase bg-black border border-white/20 px-3 py-2 rounded hover:text-gold">Bulk Import URLs</button>
                         
                         <button 
                            onClick={handlePublishToCloud}
                            disabled={isPublishing}
                            className={`text-[10px] uppercase font-bold px-4 py-2 rounded shadow-lg transition-all flex items-center gap-2 ${isPublishing ? 'bg-gray-700 cursor-wait' : 'bg-gold text-black hover:bg-white'}`}
                         >
                             {isPublishing ? <SpinnerIcon className="w-3 h-3" /> : '☁️ Publish to Cloud'}
                         </button>
                     </div>
                </div>

                {showImport && (
                    <div className="bg-black border border-gold/30 p-4 rounded animate-fade-in">
                        <p className="text-xs text-gray-400 mb-2">Paste URLs line by line. Line 1 = Song 1, Line 2 = Song 2, etc.</p>
                        <textarea 
                            className="w-full h-32 bg-gray-900 border border-white/10 p-2 text-xs text-white font-mono mb-2"
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="https://youtu.be/...\nhttps://dropbox.com/..."
                        />
                        <button onClick={handleBulkImport} className="bg-gold text-black text-xs font-bold px-4 py-2 rounded">Process Import</button>
                    </div>
                )}

                {/* Song List */}
                <div className="space-y-2">
                    {localSongs.map(song => {
                        const status = getLinkStatus(song.customAudioUrl || (song.youtubeId ? `https://youtu.be/${song.youtubeId}` : ''));
                        const isActive = playingId === song.id;

                        return (
                        <div key={song.id} className="bg-white/5 p-4 rounded border border-white/10 hover:border-gold/30 transition-all">
                             {editingSongId === song.id ? (
                                 <div className="space-y-4">
                                     <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                         <span className="text-gold font-mono">Editing Track #{song.id}</span>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                         <input 
                                            className="bg-black border border-white/20 p-2 text-sm text-white rounded"
                                            value={editForm.title}
                                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                                            placeholder="Title"
                                         />
                                         <div className="flex gap-2">
                                             <input 
                                                className="bg-black border border-white/20 p-2 text-sm text-white rounded flex-1"
                                                value={editForm.customAudioUrl}
                                                onChange={e => setEditForm({...editForm, customAudioUrl: e.target.value})}
                                                placeholder="Audio URL (YouTube/Dropbox/MP3)"
                                             />
                                             <button 
                                                onClick={handleFixSingleLink}
                                                className="bg-white/10 hover:bg-gold hover:text-black px-3 rounded text-lg transition-colors"
                                                title="Fix this link (Convert Dropbox to Streaming)"
                                             >
                                                 🪄
                                             </button>
                                         </div>
                                     </div>
                                     <textarea 
                                         className="w-full bg-black border border-white/20 p-2 text-sm text-white rounded h-20"
                                         value={editForm.lyrics}
                                         onChange={e => setEditForm({...editForm, lyrics: e.target.value})}
                                         placeholder="Lyrics..."
                                     />
                                     <input 
                                         className="w-full bg-black border border-white/20 p-2 text-sm text-white rounded"
                                         value={editForm.credits}
                                         onChange={e => setEditForm({...editForm, credits: e.target.value})}
                                         placeholder="Credits"
                                     />
                                     <div className="flex gap-2 justify-end">
                                         <button onClick={() => setEditingSongId(null)} className="text-xs uppercase px-3 py-2 text-gray-500">Cancel</button>
                                         <button onClick={saveEdit} className="text-xs uppercase px-4 py-2 bg-gold text-black rounded font-bold">Save Changes</button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                         <span className="text-xs font-mono text-gray-500 w-8">#{String(song.id).padStart(2,'0')}</span>
                                         <div>
                                             <div className="font-bold text-gray-200 flex items-center gap-2">
                                                 {song.title}
                                                 {/* Status Indicator */}
                                                 <span className={`text-[9px] uppercase border px-1 rounded ${status.color} border-current opacity-70`}>{status.label}</span>
                                             </div>
                                             <div className="text-[10px] text-gray-500 truncate max-w-xs">{song.youtubeId ? `YouTube: ${song.youtubeId}` : song.customAudioUrl || 'No Audio Source'}</div>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <button 
                                            onClick={() => handleTestPlay(song)} 
                                            className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${isActive && isPlaying ? 'bg-gold border-gold text-black' : 'border-white/20 text-gray-400 hover:text-white hover:border-white'}`}
                                            title="Test Play"
                                         >
                                            {isActive && isPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 translate-x-0.5" />}
                                         </button>
                                         <button onClick={() => startEdit(song)} className="text-[10px] uppercase bg-white/10 px-3 py-1 rounded hover:bg-white/20">Edit</button>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}})}
                </div>
            </div>
        )}

        {activeTab === 'manual_vote' && (
             <div className="max-w-xl mx-auto mt-12 bg-white/5 p-8 rounded border border-white/10 animate-fade-in">
                 <h3 className="text-xl font-serif text-gold mb-6">Manual Vote Entry</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-[10px] uppercase text-gray-500 block mb-1">Voter Name</label>
                         <input 
                            className="w-full bg-black border border-white/20 p-3 text-white rounded focus:border-gold outline-none"
                            value={manualVoteName}
                            onChange={e => setManualVoteName(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] uppercase text-gray-500 block mb-1">Voter Email</label>
                         <input 
                            className="w-full bg-black border border-white/20 p-3 text-white rounded focus:border-gold outline-none"
                            value={manualVoteEmail}
                            onChange={e => setManualVoteEmail(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] uppercase text-gray-500 block mb-1">Song IDs (Comma Separated)</label>
                         <input 
                            className="w-full bg-black border border-white/20 p-3 text-white rounded focus:border-gold outline-none font-mono"
                            placeholder="e.g. 1, 5, 12"
                            value={manualVoteIds}
                            onChange={e => setManualVoteIds(e.target.value)}
                         />
                         <p className="text-[10px] text-gray-500 mt-2">Enter numbers between 1 and 40.</p>
                     </div>
                     <button 
                        onClick={handleManualVoteSubmit}
                        disabled={manualVoteStatus === 'Saving...'}
                        className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 rounded mt-4 hover:bg-white transition-colors disabled:opacity-50"
                     >
                         {manualVoteStatus || 'Record Vote'}
                     </button>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};