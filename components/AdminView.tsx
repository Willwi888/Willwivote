
import React, { useState, useEffect, useRef } from 'react';
import { getVotes, getSongs, updateSong, getGlobalConfig, saveGlobalConfig, restoreFromBackup, publishSongsToCloud, fetchRemoteSongs, uploadAudioFile, updateSongsBulk } from '../services/storage';
import { Song, User } from '../types';
import { CheckIcon, SpinnerIcon, PlayIcon, ExternalLinkIcon, XIcon } from './Icons';
import { supabase } from '../services/supabaseClient';

type Tab = 'dashboard' | 'songs' | 'votes';
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
  const [editingSong, setEditingSong] = useState<Song | null>(null);
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
          votes: users, // Include votes in backup
          timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beloved_full_backup_${new Date().toISOString().slice(0,10)}.json`;
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

  const handleExportCSV = () => {
     // Add BOM for Excel UTF-8 compatibility
     const BOM = "\uFEFF";
     const csvContent = BOM + "Date,Name,Email,Votes IDs,Feedback Messages\n"
        + users.map(u => {
            const date = new Date(u.timestamp).toLocaleString();
            const votes = u.votes.join('; ');
            const feedback = u.voteReasons 
                ? Object.entries(u.voteReasons).map(([id, reason]) => `[Track ${id}: ${reason}]`).join('; ')
                : '';
            // Escape quotes for CSV
            const safeFeedback = feedback.replace(/"/g, '""');
            return `"${date}","${u.name}","${u.email}","${votes}","${safeFeedback}"`;
        }).join("\n");
        
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.setAttribute("href", url);
     link.setAttribute("download", `votes_feedback_${new Date().toISOString().slice(0,10)}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
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
          const publicUrl = await uploadAudioFile(file, quickUploadId);
          if (publicUrl) {
              const updated = updateSong(quickUploadId, { customAudioUrl: publicUrl });
              setLocalSongs(updated);
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
      setEditingSong(song);
      setEditForm({ ...song });
  };

  const saveEdit = () => {
      if (!editingSong) return;
      const updated = updateSong(editingSong.id, editForm);
      setLocalSongs(updated);
      setEditingSong(null);
  };

  const getSongTitle = (id: number) => localSongs.find(s => s.id === id)?.title || `Track ${id}`;

  // --- CALCULATE PROGRESS ---
  const songsWithAudio = localSongs.filter(s => 
    (s.customAudioUrl && !s.customAudioUrl.includes('dropbox') && !s.customAudioUrl.includes('drive')) || 
    s.youtubeId
  ).length;
  const progressPercent = Math.round((songsWithAudio / localSongs.length) * 100);

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
      <div className="bg-gray-900 border-b border-white/10 p-6 sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <h1 className="text-gold font-bold text-lg tracking-widest">ADMIN CONSOLE</h1>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1 rounded text-xs uppercase tracking-wider ${activeTab === 'dashboard' ? 'bg-gold text-black' : 'bg-black text-gray-400 hover:text-white'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('songs')} className={`px-4 py-1 rounded text-xs uppercase tracking-wider ${activeTab === 'songs' ? 'bg-gold text-black' : 'bg-black text-gray-400 hover:text-white'}`}>Manage Songs</button>
                <button onClick={() => setActiveTab('votes')} className={`px-4 py-1 rounded text-xs uppercase tracking-wider ${activeTab === 'votes' ? 'bg-gold text-black' : 'bg-black text-gray-400 hover:text-white'}`}>Votes & Feedback</button>
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
                                const isPending = !hasMp3 && !song.youtubeId;
                                
                                return (
                                    <tr key={song.id} className={`transition-colors group ${isPending ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                        <td className="p-4 text-gray-500">{String(song.id).padStart(2,'0')}</td>
                                        <td className="p-4 font-bold text-white">
                                            {song.title}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                {hasMp3 && <span className="text-[10px] bg-green-900 text-green-200 px-2 py-0.5 rounded w-fit flex items-center gap-1">MP3 <CheckIcon className="w-3 h-3"/></span>}
                                                {song.youtubeId && <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded w-fit flex items-center gap-1">YouTube <PlayIcon className="w-3 h-3"/></span>}
                                                {isPending && <span className="text-[10px] text-gray-600 uppercase">Pending</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleQuickUploadClick(song.id)} className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-white px-3 py-1 rounded transition-colors flex items-center gap-2">
                                                    {isUploadingThis ? <SpinnerIcon className="w-3 h-3"/> : 'Upload MP3'}
                                                </button>
                                                <button onClick={() => openEdit(song)} className="text-xs text-gold hover:text-white border border-gold/30 hover:border-gold px-3 py-1 rounded transition-colors">
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB: VOTES (NEW) */}
        {activeTab === 'votes' && (
            <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-gold uppercase tracking-widest text-sm font-bold">Votes & Feedback ({users.length})</h2>
                    <button onClick={handleExportCSV} className="text-xs bg-gold text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-lg hover:scale-105">
                        <span>⬇</span> Export CSV (Excel)
                    </button>
                </div>

                <div className="bg-gray-900 rounded border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-black text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10">
                                    <th className="p-4 w-32">Date</th>
                                    <th className="p-4 w-48">User Info</th>
                                    <th className="p-4 w-1/4">Votes</th>
                                    <th className="p-4">Feedback & Messages</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm font-serif">
                                {users.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-500 italic">No votes received yet.</td></tr>
                                ) : (
                                    users.map((user, i) => {
                                        const hasFeedback = user.voteReasons && Object.keys(user.voteReasons).length > 0;
                                        return (
                                            <tr key={i} className={`hover:bg-white/5 transition-colors group ${hasFeedback ? 'bg-gold/5' : ''}`}>
                                                <td className="p-4 text-gray-500 align-top whitespace-nowrap">
                                                    {new Date(user.timestamp).toLocaleDateString()}<br/>
                                                    <span className="text-xs opacity-50">{new Date(user.timestamp).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="text-white font-bold">{user.name}</div>
                                                    <div className="text-gold text-xs mt-1 select-all font-mono opacity-80 group-hover:opacity-100">{user.email}</div>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.votes.sort((a,b)=>a-b).map(vid => (
                                                            <span key={vid} className="inline-block bg-white/10 text-gray-300 text-[10px] px-1.5 py-0.5 rounded border border-white/5 font-mono">
                                                                #{String(vid).padStart(2,'0')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-top">
                                                    {hasFeedback ? (
                                                        <div className="space-y-2">
                                                            {Object.entries(user.voteReasons || {}).map(([songId, msg]) => {
                                                                const sId = parseInt(songId);
                                                                const songTitle = getSongTitle(sId);
                                                                return (
                                                                    <div key={songId} className="bg-black/60 p-3 rounded border border-gold/20 relative">
                                                                        <div className="text-gold text-[9px] uppercase tracking-wider mb-1 font-bold flex items-center gap-2">
                                                                            <span className="bg-gold/20 px-1 rounded text-gold">TRACK {String(songId).padStart(2, '0')}</span>
                                                                            <span className="opacity-70 truncate max-w-[200px] text-gray-400">{songTitle}</span>
                                                                        </div>
                                                                        <p className="text-white italic text-sm leading-relaxed pl-2 border-l-2 border-gold/50">"{msg}"</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-700 text-xs italic opacity-30">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingSong && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 w-full max-w-2xl rounded-lg border border-gold/30 shadow-2xl overflow-hidden animate-slide-up">
                  <div className="bg-black p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="text-gold font-bold tracking-widest uppercase">Edit Track {editingSong.id}</h3>
                      <button onClick={() => setEditingSong(null)}><XIcon className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] text-gray-500 uppercase block mb-1">Title</label>
                              <input className="w-full bg-black border border-white/20 p-2 text-white" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-[10px] text-gray-500 uppercase block mb-1">YouTube Video ID (Optional)</label>
                              <input className="w-full bg-black border border-white/20 p-2 text-white font-mono" value={editForm.youtubeId || ''} onChange={e => setEditForm({...editForm, youtubeId: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 uppercase block mb-1">Direct Audio URL (MP3/Dropbox)</label>
                          <input className="w-full bg-black border border-white/20 p-2 text-white font-mono text-xs" value={editForm.customAudioUrl || ''} onChange={e => setEditForm({...editForm, customAudioUrl: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 uppercase block mb-1">Lyrics</label>
                          <textarea className="w-full bg-black border border-white/20 p-2 text-white h-40 font-serif whitespace-pre text-sm" value={editForm.lyrics || ''} onChange={e => setEditForm({...editForm, lyrics: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 uppercase block mb-1">Credits</label>
                          <textarea className="w-full bg-black border border-white/20 p-2 text-white h-20 text-sm" value={editForm.credits || ''} onChange={e => setEditForm({...editForm, credits: e.target.value})} />
                      </div>
                  </div>
                  <div className="p-4 border-t border-white/10 bg-black flex justify-end gap-3">
                      <button onClick={() => setEditingSong(null)} className="px-4 py-2 text-xs text-gray-400 hover:text-white uppercase tracking-wider">Cancel</button>
                      <button onClick={saveEdit} className="px-6 py-2 bg-gold text-black font-bold uppercase tracking-wider rounded hover:bg-white hover:scale-105 transition-all">Save Changes</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
