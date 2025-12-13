
import React, { useState, useEffect, useRef } from 'react';
import { getVotes, getLeaderboard, getSongs, updateSong, updateSongsBulk, getGlobalConfig, saveGlobalConfig, restoreFromBackup, publishSongsToCloud, fetchRemoteSongs } from '../services/storage';
import { Song, User } from '../types';
import { Layout, FadeIn } from './Layout';
import { PlayIcon, SpinnerIcon, CheckIcon } from './Icons';
import { useAudio } from './AudioContext';
import { supabase } from '../services/supabaseClient';

type Tab = 'dashboard' | 'songs';

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

  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline' | 'checking' | 'missing_table'>('checking');
  
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  
  // Config States
  const [introUrl, setIntroUrl] = useState('');
  const [homeSongTitle, setHomeSongTitle] = useState('');
  const [homeSongUrl, setHomeSongUrl] = useState('');

  const [editForm, setEditForm] = useState<Partial<Song>>({});
  const { playingId } = useAudio();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  
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
      
      // Attempt to load remote config to populate fields if available
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
            // Check if table exists by selecting 1 row
            const { error: tableError } = await supabase.from('songs').select('count', { count: 'exact', head: true });
            if (tableError) {
                if (tableError.code === '42P01') { 
                     setCloudStatus('missing_table');
                } else {
                     setCloudStatus('offline');
                }
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
      if (cloudStatus === 'missing_table') {
          alert("Database setup required. Please see instructions.");
          return;
      }
      if (!confirm("This will overwrite the Live Website with your local data (including Homepage Song). Are you sure?")) return;
      setIsPublishing(true);
      try {
          // Pass the current config inputs to be saved as ID 0
          await publishSongsToCloud(localSongs, {
              introAudioUrl: introUrl,
              homepageSongTitle: homeSongTitle,
              homepageSongUrl: homeSongUrl
          });
          alert("✅ Success! Your songs AND homepage settings are now live.");
          loadAllData(); // Refresh status
      } catch (e) {
          console.error(e);
          alert("❌ Publish Failed. Please check if the 'songs' table exists (See instruction below).");
      } finally {
          setIsPublishing(false);
      }
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

  const handleBulkImport = () => {
      if (!importText.trim()) return;
      const lines = importText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return;
      const updated = updateSongsBulk(lines);
      setLocalSongs(updated);
      setShowImport(false);
      setImportText('');
      alert(`Success! Updated ${Math.min(lines.length, 40)} songs.`);
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
          fileInputRef.current.value = ''; // Reset value to allow re-importing same file
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
              loadAllData(); // Refresh UI
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
                    {cloudStatus === 'missing_table' && <span className="text-red-500 px-2 py-0.5 bg-red-900/20 rounded border border-red-900/50 font-bold">DB SETUP REQUIRED</span>}
                </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex bg-white/5 rounded-lg p-1">
                 <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Analytics</button>
                 <button onClick={() => setActiveTab('songs')} className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'songs' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>CMS (Songs)</button>
             </div>
             <button onClick={onBack} className="text-xs border border-white/20 hover:bg-white hover:text-black px-4 py-2 rounded transition-all uppercase tracking-widest">Exit</button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="grid lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN: Data & Backup */}
            <section className="space-y-8">
                
                {/* 1. Global Config / Homepage Audio */}
                <div className="bg-[#121212] rounded-xl border border-white/10 p-6 space-y-4">
                     <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2">Homepage Audio Settings (Live)</h3>
                     
                     <div className="space-y-3">
                        <div>
                            <label className="block text-[9px] uppercase text-gray-500 mb-1">Featured Song Title</label>
                            <input 
                                className="w-full bg-[#050505] border border-white/10 p-2 text-white text-xs outline-none focus:border-gold rounded"
                                value={homeSongTitle}
                                onChange={e => setHomeSongTitle(e.target.value)}
                                placeholder="e.g. Beloved (Official Theme)"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] uppercase text-gray-500 mb-1">Featured Song URL (Mp3/Drive/YouTube)</label>
                            <input 
                                className="w-full bg-[#050505] border border-white/10 p-2 text-white text-xs outline-none focus:border-gold rounded font-mono"
                                value={homeSongUrl}
                                onChange={e => setHomeSongUrl(e.target.value)}
                                placeholder="Paste link here..."
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                             <button onClick={handleSaveGlobalConfig} className="bg-white/10 text-white px-4 py-2 rounded text-[10px] font-bold uppercase hover:bg-white hover:text-black">Save Draft</button>
                        </div>
                     </div>
                </div>

                {/* 2. Backup & Restore Card */}
                <div className="bg-[#121212] rounded-xl border border-white/10 p-6 space-y-4">
                     <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2">Data Backup & Restore</h3>
                     <p className="text-[10px] text-gray-500 leading-relaxed">
                        Use this to transfer data from Localhost to Production, or to save a snapshot of your current settings.
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <button 
                            onClick={handleDownloadBackup}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded text-[10px] uppercase tracking-widest transition-colors flex flex-col items-center gap-2"
                        >
                            <span>📤 Export JSON</span>
                            <span className="text-[8px] text-gray-500">Save current data to file</span>
                        </button>

                        <button 
                            onClick={handleRestoreClick}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded text-[10px] uppercase tracking-widest transition-colors flex flex-col items-center gap-2"
                        >
                            <span>📥 Import JSON</span>
                            <span className="text-[8px] text-gray-500">Restore from file</span>
                        </button>
                        {/* Hidden Input for Import */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".json" 
                            onChange={handleFileChange} 
                        />
                     </div>
                </div>

                {/* 3. Leaderboard */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Popularity Ranking</h3>
                        <div className="text-[10px] text-gray-500">Total Votes: <span className="text-white font-bold">{users.length}</span></div>
                    </div>
                    {loadingData ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 gap-2"><SpinnerIcon className="w-4 h-4" /> Syncing...</div>
                    ) : (
                        <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden max-h-[500px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                                <tr>
                                    <th className="p-4 font-medium w-12 text-center">#</th>
                                    <th className="p-4 font-medium">Song Title</th>
                                    <th className="p-4 font-medium w-32">Preference</th>
                                    <th className="p-4 font-medium text-right">Votes</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                {leaderboard.map((item, index) => {
                                    const percentage = maxVotesForSingleSong > 0 ? (item.count / maxVotesForSingleSong) * 100 : 0;
                                    return (
                                        <tr key={item.song?.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-gray-600 font-mono text-center">{(index + 1)}</td>
                                            <td className="p-4 font-medium text-gray-300">{item.song?.title}</td>
                                            <td className="p-4"><div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold" style={{ width: `${percentage}%` }}/></div></td>
                                            <td className="p-4 text-right font-bold text-white">{item.count}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* RIGHT COLUMN: User Feedback */}
            <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">User Feedback</h3>
                <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[750px]">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                        <tr><th className="p-4 font-medium">User & Comments</th><th className="p-4 font-medium text-right">Date</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {users.slice().reverse().map((user, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-serif text-gray-200">
                                <div className="mb-1 text-white">{user.name}</div>
                                <div className="text-[9px] text-gray-600 font-mono mb-2">{user.email}</div>
                                {user.voteReasons && user.voteReasons[0] && <div className="bg-white/5 p-2 rounded text-[10px] text-gray-300 mb-2 italic border-l-2 border-gold">"{user.voteReasons[0]}"</div>}
                                {user.voteReasons && Object.keys(user.voteReasons).length > 0 && <div className="space-y-1">{Object.entries(user.voteReasons).map(([songId, reason]) => { if (songId === '0') return null; return (<div key={songId} className="text-[10px] text-gray-500"><span className="text-gold opacity-70">#{songId.toString().padStart(2,'0')}:</span> <span className="italic">"{reason}"</span></div>); })}</div>}
                            </td>
                            <td className="p-4 text-right opacity-50 whitespace-nowrap align-top">{new Date(user.timestamp).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </section>
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in pb-20">
                 {/* DATABASE MISSING WARNING */}
                 {cloudStatus === 'missing_table' && (
                     <div className="bg-red-900/20 border border-red-500/50 p-6 rounded mb-8">
                         <h3 className="text-red-500 font-bold mb-2 uppercase tracking-widest">⚠️ Critical: Database Table Missing</h3>
                         <p className="text-sm text-gray-300 mb-4">The App is currently in <strong>Local Mode</strong>. To enable Cloud Sync and real-time publishing, you must create the 'songs' table in Supabase.</p>
                         <p className="text-xs text-gray-400 mb-2">Copy this SQL code and run it in your Supabase SQL Editor:</p>
                         <div className="bg-black p-4 rounded text-xs font-mono text-green-400 overflow-x-auto select-all">
                             create table if not exists songs (<br/>
                             &nbsp;&nbsp;id bigint primary key,<br/>
                             &nbsp;&nbsp;title text,<br/>
                             &nbsp;&nbsp;youtube_id text,<br/>
                             &nbsp;&nbsp;custom_audio_url text,<br/>
                             &nbsp;&nbsp;custom_image_url text,<br/>
                             &nbsp;&nbsp;lyrics text,<br/>
                             &nbsp;&nbsp;credits text,<br/>
                             &nbsp;&nbsp;updated_at timestamp with time zone default timezone('utc'::text, now())<br/>
                             );<br/><br/>
                             alter table songs enable row level security;<br/>
                             create policy "Public songs are viewable by everyone" on songs for select using (true);<br/>
                             create policy "Everyone can insert/update songs" on songs for insert with check (true);<br/>
                             create policy "Everyone can update songs" on songs for update using (true);
                         </div>
                     </div>
                 )}

                 <div className="bg-gradient-to-r from-gold/20 to-gold/5 p-6 rounded border border-gold/40 mb-8 flex items-center justify-between">
                     <div>
                         <h3 className="text-gold font-serif text-lg mb-1 flex items-center gap-2">🚀 Publish Changes</h3>
                         <p className="text-[10px] text-gray-400">Push your local song edits AND Homepage Settings to the Cloud.</p>
                     </div>
                     <button onClick={handlePublishToCloud} disabled={isPublishing || cloudStatus === 'missing_table'} className="bg-gold text-black px-6 py-3 rounded text-xs font-bold uppercase hover:bg-white transition-colors shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">{isPublishing ? 'Publishing...' : (cloudStatus === 'missing_table' ? 'Setup Required' : 'Publish to Cloud')}</button>
                 </div>

                 <div className="flex gap-2 mb-4 justify-end">
                     <button onClick={() => setShowImport(!showImport)} className="text-gold hover:underline text-xs uppercase tracking-widest">{showImport ? 'Close Bulk Import' : 'Open Bulk Import Tool'}</button>
                 </div>

                 {showImport && (
                     <div className="bg-[#1a1a1a] p-6 rounded border border-white/10 mb-8 animate-slide-up">
                         <h3 className="text-white font-serif mb-2">Bulk Import / Playlist Parser</h3>
                         <textarea className="w-full h-64 bg-black border border-white/10 rounded p-4 text-xs font-mono text-gray-300 focus:border-gold outline-none" placeholder={"Paste YouTube links here..."} value={importText} onChange={(e) => setImportText(e.target.value)} />
                         <div className="flex justify-end mt-4">
                             <button onClick={handleBulkImport} className="bg-white text-black px-6 py-2 rounded text-xs font-bold uppercase hover:bg-gray-200">Update Local List</button>
                         </div>
                     </div>
                 )}

                 {editingSongId !== null ? (
                     <div className="bg-[#111] p-6 rounded-lg border border-white/20 max-w-2xl mx-auto shadow-2xl">
                         <h3 className="text-white font-serif text-xl mb-6">Edit Track #{String(editingSongId).padStart(2,'0')}</h3>
                         <div className="space-y-4">
                             <div><label className="block text-[10px] uppercase text-gray-500 mb-1">Song Title</label><input className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                             <div><label className="block text-[10px] uppercase text-gray-500 mb-1">Audio Link / YouTube Link</label><input className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none font-mono text-xs" value={editForm.customAudioUrl} onChange={e => setEditForm({...editForm, customAudioUrl: e.target.value})} placeholder="https://..." /></div>
                             <div><label className="block text-[10px] uppercase text-gray-500 mb-1">Lyrics</label><textarea className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none h-32" value={editForm.lyrics} onChange={e => setEditForm({...editForm, lyrics: e.target.value})} /></div>
                             <div><label className="block text-[10px] uppercase text-gray-500 mb-1">Credits</label><textarea className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none h-24" value={editForm.credits} onChange={e => setEditForm({...editForm, credits: e.target.value})} placeholder="Arranger: Willwi..." /></div>
                         </div>
                         <div className="flex justify-end gap-3 mt-8">
                             <button onClick={() => setEditingSongId(null)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
                             <button onClick={saveEdit} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-gray-200">Save Local Changes</button>
                         </div>
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {localSongs.map(song => {
                            const isPlaying = playingId === song.id;
                            const hasYouTube = !!song.youtubeId;
                            return (
                                <div key={song.id} className={`p-3 bg-[#111] hover:bg-[#1a1a1a] rounded border border-white/5 hover:border-white/20 transition-all flex flex-col gap-3 group ${isPlaying ? 'border-white/20 bg-[#161616]' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[9px] text-gray-500 font-mono mb-1">#{String(song.id).padStart(2,'0')}</div>
                                            <div className="text-sm font-medium text-gray-300 truncate group-hover:text-white">{song.title}</div>
                                            <div className="flex gap-2 mt-1">
                                                {hasYouTube && <span className="text-[8px] bg-red-900/50 px-1 rounded text-red-400">YOUTUBE</span>}
                                                {!hasYouTube && song.customAudioUrl && <span className="text-[8px] bg-green-900/50 px-1 rounded text-green-400">AUDIO FILE</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => startEdit(song)} className="text-xs text-gray-600 hover:text-white border border-transparent hover:border-white/20 px-2 py-1 rounded transition-colors">Edit</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};
