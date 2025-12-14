
import React, { useState, useEffect, useRef } from 'react';
import { getVotes, getSongs, updateSong, getGlobalConfig, saveGlobalConfig, restoreFromBackup, publishSongsToCloud, fetchRemoteSongs, uploadAudioFile, updateSongsBulk } from '../services/storage';
import { Song, User } from '../types';
import { CheckIcon, SpinnerIcon, PlayIcon, ExternalLinkIcon } from './Icons';
import { supabase } from '../services/supabaseClient';

type Tab = 'dashboard' | 'songs';
type CloudStatus = 'connected' | 'offline' | 'checking' | 'missing_table_songs' | 'missing_table_votes' | 'missing_both';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [users, setUsers] = useState<User[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('checking');
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [quickUploadId, setQuickUploadId] = useState<number | null>(null);

  // Config States
  const [introUrl, setIntroUrl] = useState('');
  const [homeSongTitle, setHomeSongTitle] = useState('');
  const [homeSongUrl, setHomeSongUrl] = useState('');

  // Editing State
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Song>>({});
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null); // For Restore JSON
  const mp3InputRef = useRef<HTMLInputElement>(null); // For MP3 Upload

  useEffect(() => {
      if (isAuthenticated) {
          loadAllData();
      }
  }, [isAuthenticated]);

  const loadAllData = async () => {
      setLoadingData(true);
      setCloudStatus('checking');
      
      // 1. Load Local Data (Source of Truth for Lyrics before Publish)
      const songs = getSongs();
      setLocalSongs(songs);
      
      const config = getGlobalConfig();
      setIntroUrl(config.introAudioUrl || '');
      setHomeSongTitle(config.homepageSongTitle || '');
      setHomeSongUrl(config.homepageSongUrl || '');
      
      // 2. Check Cloud Status & Votes
      try {
        const fetchedVotes = await getVotes();
        setUsers(fetchedVotes);
        
        if (supabase) {
            const { error: songsError } = await supabase.from('songs').select('count', { count: 'exact', head: true });
            const { error: votesError } = await supabase.from('votes').select('count', { count: 'exact', head: true });
            
            if (songsError?.code === '42P01' && votesError?.code === '42P01') setCloudStatus('missing_both');
            else if (songsError?.code === '42P01') setCloudStatus('missing_table_songs');
            else if (votesError?.code === '42P01') setCloudStatus('missing_table_votes');
            else if (songsError || votesError) setCloudStatus('offline');
            else setCloudStatus('connected');
        } else {
            setCloudStatus('offline');
        }
      } catch (e) {
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

  // --- ACTIONS ---

  const handleBackup = () => {
      const data = {
          songs: localSongs,
          config: { introAudioUrl: introUrl, homepageSongTitle: homeSongTitle, homepageSongUrl: homeSongUrl },
          timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beloved_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
  };

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.songs) {
                  restoreFromBackup(data.songs);
                  setLocalSongs(data.songs);
              }
              if (data.config) {
                  saveGlobalConfig(data.config);
                  setIntroUrl(data.config.introAudioUrl);
                  setHomeSongTitle(data.config.homepageSongTitle);
                  setHomeSongUrl(data.config.homepageSongUrl);
              }
              alert("✅ Data Restored Successfully!");
          } catch (err) {
              alert("Invalid Backup File");
          }
      };
      reader.readAsText(file);
  };

  const handlePublish = async () => {
      if (!confirm("⚠️ This will overwrite the Cloud Database with your current screen data.\nAre you sure your local lyrics are correct?")) return;
      setIsPublishing(true);
      try {
          await publishSongsToCloud(localSongs, {
              introAudioUrl: introUrl,
              homepageSongTitle: homeSongTitle,
              homepageSongUrl: homeSongUrl
          });
          alert("✅ Publish Success! Your songs are live.");
      } catch (e: any) {
          alert(`❌ Publish Failed: ${e.message || "Check console"}`);
          console.error(e);
      } finally {
          setIsPublishing(false);
      }
  };

  // --- QUICK UPLOAD LOGIC ---

  const handleQuickUploadClick = (id: number) => {
      setQuickUploadId(id);
      mp3InputRef.current?.click();
  };

  const handleMp3FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0] || !quickUploadId) return;
      const file = e.target.files[0];
      
      setIsUploading(true);
      try {
          // 1. Upload
          const publicUrl = await uploadAudioFile(file, quickUploadId);
          
          if (publicUrl) {
              // 2. Update Local State & Storage immediately
              const updated = updateSong(quickUploadId, { customAudioUrl: publicUrl });
              setLocalSongs(updated);
              // alert("✅ Uploaded!"); // Optional: Remove alert for speed
          }
      } catch (e) {
          alert("Upload Failed. Check console.");
      } finally {
          setIsUploading(false);
          setQuickUploadId(null);
          if (mp3InputRef.current) mp3InputRef.current.value = '';
      }
  };

  // --- EDIT MODAL LOGIC ---

  const openEdit = (song: Song) => {
      setEditingSongId(song.id);
      setEditForm({ ...song });
  };

  const saveEdit = () => {
      if (editingSongId === null) return;
      const updated = updateSong(editingSongId, editForm);
      setLocalSongs(updated);
      setEditingSongId(null);
  };

  // --- CALCULATE PROGRESS ---
  const songsWithAudio = localSongs.filter(s => 
    (s.customAudioUrl && !s.customAudioUrl.includes('dropbox') && !s.customAudioUrl.includes('drive')) || 
    s.youtubeId
  ).length;
  const progressPercent = Math.round((songsWithAudio / localSongs.length) * 100);

  // --- RENDER ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-serif">
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-64">
          <h2 className="text-gold text-center tracking-widest uppercase text-sm mb-4">Manager Access</h2>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passcode"
            className="bg-gray-900 border border-gold/30 rounded p-2 text-center text-white focus:border-gold outline-none"
          />
          <button type="submit" className="bg-gold text-black py-2 rounded font-bold hover:bg-white transition-colors">LOGIN</button>
          {error && <p className="text-red-500 text-xs text-center">Invalid Passcode</p>}
          <button type="button" onClick={onBack} className="text-gray-500 text-xs mt-4 hover:text-white">← Return</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-gray-900 border-b border-white/10 p-6 sticky top-0 z-30 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
            <h1 className="text-gold font-bold text-lg tracking-widest">ADMIN CONSOLE</h1>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1 rounded text-xs uppercase tracking-wider ${activeTab === 'dashboard' ? 'bg-gold text-black' : 'bg-black text-gray-400 hover:text-white'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('songs')} className={`px-4 py-1 rounded text-xs uppercase tracking-wider ${activeTab === 'songs' ? 'bg-gold text-black' : 'bg-black text-gray-400 hover:text-white'}`}>Manage Songs</button>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <button onClick={handleBackup} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 border border-blue-400/30 px-3 py-1 rounded-full bg-blue-500/10">
                 <span>↓</span> Backup Data
             </button>
             <button onClick={onBack} className="text-xs text-gray-500 hover:text-white">Exit</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
                {/* STATUS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded border border-white/5">
                        <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Total Votes</h3>
                        <p className="text-3xl text-white font-serif">{users.length}</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded border border-white/5">
                        <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Audio Upload Progress</h3>
                        <div className="flex items-end gap-3 mb-2">
                            <p className="text-3xl text-white font-serif">{songsWithAudio}</p>
                            <p className="text-gray-500 text-sm mb-1">/ {localSongs.length}</p>
                        </div>
                        <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                            <div className="bg-gold h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded border border-white/5 relative overflow-hidden group">
                        <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Actions</h3>
                        <button 
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="w-full bg-gold text-black py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                        >
                            {isPublishing ? 'Publishing...' : '☁️ PUBLISH TO CLOUD'}
                        </button>
                        <p className="text-[10px] text-gray-500 mt-2 text-center">Syncs local lyrics & mp3s to website</p>
                    </div>
                </div>

                {/* HOME SETTINGS */}
                <div className="bg-gray-900 p-8 rounded border border-white/5">
                    <h3 className="text-gold text-sm uppercase tracking-widest mb-6 font-bold">Homepage Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase block mb-2">Featured Song Title</label>
                            <input className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={homeSongTitle} onChange={e => setHomeSongTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase block mb-2">Featured Song Link (MP3/YouTube)</label>
                            <input className="w-full bg-black border border-white/10 p-2 text-sm text-white" value={homeSongUrl} onChange={e => setHomeSongUrl(e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <button onClick={() => { saveGlobalConfig({ introAudioUrl: introUrl, homepageSongTitle: homeSongTitle, homepageSongUrl: homeSongUrl }); alert("Saved Locally"); }} className="text-xs text-gold hover:text-white border border-gold/30 px-4 py-2 rounded">Save Settings</button>
                    </div>
                </div>
                
                {/* RESTORE */}
                <div className="text-center pt-8 border-t border-white/5">
                    <input type="file" ref={fileInputRef} onChange={handleRestoreFile} className="hidden" accept=".json" />
                    <button onClick={handleRestoreClick} className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest">
                        Import Backup Data (JSON)
                    </button>
                </div>
            </div>
        )}

        {/* TAB: SONGS LIST */}
        {activeTab === 'songs' && (
            <div className="animate-fade-in">
                {/* HIDDEN UPLOAD INPUT */}
                <input 
                    type="file" 
                    ref={mp3InputRef} 
                    onChange={handleMp3FileChange} 
                    className="hidden" 
                    accept="audio/*"
                />
                
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Task List: {localSongs.length - songsWithAudio} remaining
                    </p>
                </div>

                <div className="bg-gray-900 rounded border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10">
                                <th className="p-4 w-16">#</th>
                                <th className="p-4">Title</th>
                                <th className="p-4 w-32">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm font-serif">
                            {localSongs.map(song => {
                                const hasMp3 = song.customAudioUrl && !song.customAudioUrl.includes('dropbox') && !song.customAudioUrl.includes('drive');
                                const isUploadingThis = isUploading && quickUploadId === song.id;
                                // Highlight rows that are NOT done
                                const isPending = !hasMp3 && !song.youtubeId;
                                
                                return (
                                    <tr key={song.id} className={`transition-colors group ${isPending ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                        <td className="p-4 text-gray-500">{String(song.id).padStart(2,'0')}</td>
                                        <td className="p-4 font-medium text-gray-200">
                                            {song.title}
                                            {/* Show lyrics length hint */}
                                            <span className="ml-2 text-[9px] text-gray-600 font-mono border border-gray-800 px-1 rounded">
                                                {(song.lyrics || "").length} chars
                                            </span>
                                            <div className="text-[10px] text-gray-600 font-mono truncate max-w-[200px] mt-1">{song.customAudioUrl || song.youtubeId || "No Audio"}</div>
                                        </td>
                                        <td className="p-4">
                                            {isUploadingThis ? (
                                                <span className="text-gold text-xs flex items-center gap-1"><SpinnerIcon className="w-3 h-3"/> Uploading...</span>
                                            ) : hasMp3 ? (
                                                <span className="text-green-500 text-xs border border-green-500/30 px-2 py-1 rounded bg-green-500/10">MP3 OK</span>
                                            ) : song.youtubeId ? (
                                                <span className="text-red-400 text-xs">YouTube</span>
                                            ) : (
                                                <span className="text-yellow-500 text-[10px] uppercase tracking-wider font-bold animate-pulse">Waiting for Upload</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleQuickUploadClick(song.id)}
                                                disabled={isUploading}
                                                className={`
                                                    px-3 py-1 rounded text-xs border transition-colors shadow-lg
                                                    ${isPending 
                                                        ? 'bg-gold text-black border-gold hover:bg-white hover:border-white font-bold' 
                                                        : 'bg-gray-800 text-gray-400 border-white/10 hover:text-white'}
                                                `}
                                            >
                                                ☁️ Upload
                                            </button>
                                            <button 
                                                onClick={() => openEdit(song)}
                                                className="bg-black hover:bg-white hover:text-black text-gray-400 px-3 py-1 rounded text-xs border border-white/10 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingSongId !== null && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gold/30 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                  <h3 className="text-gold text-lg font-serif mb-6">Edit Track {editingSongId}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Song Title</label>
                          <input className="w-full bg-black border border-white/20 p-2 text-white focus:border-gold outline-none" 
                                 value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] text-gray-500 uppercase mb-1">Audio URL (Auto-filled by Upload)</label>
                              <input className="w-full bg-black border border-white/20 p-2 text-gray-400 focus:border-gold outline-none text-xs" 
                                     value={editForm.customAudioUrl || ''} onChange={e => setEditForm({...editForm, customAudioUrl: e.target.value})} />
                          </div>
                          <div>
                               <label className="block text-[10px] text-gray-500 uppercase mb-1">YouTube ID (Optional)</label>
                               <input className="w-full bg-black border border-white/20 p-2 text-gray-400 focus:border-gold outline-none text-xs" 
                                      value={editForm.youtubeId || ''} onChange={e => setEditForm({...editForm, youtubeId: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Lyrics</label>
                          <textarea className="w-full bg-black border border-white/20 p-2 text-white focus:border-gold outline-none h-64 font-mono text-xs leading-relaxed" 
                                    value={editForm.lyrics || ''} onChange={e => setEditForm({...editForm, lyrics: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Credits</label>
                          <textarea className="w-full bg-black border border-white/20 p-2 text-white focus:border-gold outline-none h-32 font-mono text-xs" 
                                    value={editForm.credits || ''} onChange={e => setEditForm({...editForm, credits: e.target.value})} />
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-white/10">
                      <button onClick={() => setEditingSongId(null)} className="px-6 py-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest">Cancel</button>
                      <button onClick={saveEdit} className="px-8 py-2 bg-gold text-black font-bold uppercase tracking-widest hover:bg-white">Save Changes</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
