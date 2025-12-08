
import React, { useState, useEffect, useRef } from 'react';
import { getVotes, getLeaderboard, getSongs, updateSong, updateSongsBulk, resetSongTitles, getGlobalConfig, saveGlobalConfig, restoreFromBackup } from '../services/storage';
import { Song } from '../types';
import { Layout, FadeIn } from './Layout';
import AudioPlayer from './AudioPlayer';
import { HeartIcon, SearchIcon, PlayIcon, PauseIcon } from './Icons';
import { useAudio } from './AudioContext';

type Tab = 'dashboard' | 'songs';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State for song editing
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [editingSongId, setEditingSongId] = useState<number | null>(null);
  
  // Global Config State
  const [introUrl, setIntroUrl] = useState('');
  
  // Edit Form State
  const [editForm, setEditForm] = useState<Partial<Song>>({});

  // Use Global Audio context instead of local state for preview
  const { playingId } = useAudio();

  // State for Bulk Import
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8888') {
      setIsAuthenticated(true);
      setError(false);
      setLocalSongs(getSongs());
      const config = getGlobalConfig();
      setIntroUrl(config.introAudioUrl || '');
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleSaveGlobalConfig = () => {
      saveGlobalConfig({ introAudioUrl: introUrl });
      alert("Homepage Intro Audio Updated!");
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
      
      // Validation: Check for Folder links which won't work
      if (importText.includes('/fo/') || importText.includes('/t/')) {
          const proceed = confirm("WARNING: It looks like you pasted a Dropbox Folder Link (contains '/fo/') or Transfer Link ('/t/').\n\nThe app needs DIRECT FILE LINKS (e.g., ending in .mp3 or .wav).\n\nFolder links will NOT play. Do you still want to proceed?");
          if (!proceed) return;
      }

      // Filter out empty lines
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
          globalConfig: { introAudioUrl: introUrl },
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
      
      alert("Backup file downloaded! Please save this file safely.");
  };

  const handleRestoreClick = () => {
      if (fileInputRef.current) {
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
              }
              
              alert("Data restored successfully!");
          } catch (err) {
              alert("Failed to restore backup. Invalid JSON file.");
              console.error(err);
          }
      };
      reader.readAsText(file);
      // Reset input
      e.target.value = '';
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
                <button 
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest py-3 rounded-full transition-all"
                >
                  Enter
                </button>
                <button onClick={onBack} type="button" className="text-xs text-gray-600 hover:text-gray-400 mt-4">
                  Back
                </button>
             </form>
           </FadeIn>
        </div>
      </Layout>
    );
  }

  const users = getVotes();
  const leaderboard = getLeaderboard(localSongs);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Manager Dashboard</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Beloved 2026</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex bg-white/5 rounded-lg p-1">
                 <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                 >
                     Analytics
                 </button>
                 <button 
                    onClick={() => setActiveTab('songs')}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-colors ${activeTab === 'songs' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                 >
                     CMS (Songs)
                 </button>
             </div>
             <button onClick={onBack} className="text-xs border border-white/20 hover:bg-white hover:text-black px-4 py-2 rounded transition-all uppercase tracking-widest">
               Exit
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="grid lg:grid-cols-2 gap-12">
            {/* Leaderboard Section */}
            <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                Top Candidates
                </h3>
                <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden max-h-[600px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                        <tr>
                            <th className="p-4 font-medium w-16">No.</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium text-right">Votes</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {leaderboard.map((item, index) => (
                            <tr key={item.song?.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-gray-500 font-mono">{(index + 1).toString().padStart(2, '0')}</td>
                            <td className="p-4 font-medium text-gray-300">{item.song?.title}</td>
                            <td className="p-4 text-right font-bold text-white">{item.count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* User Data Section */}
            <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                Recent Activity ({users.length})
                </h3>
                
                <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium text-right">Time</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {users.slice().reverse().map((user, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-serif text-gray-200">
                                <div>{user.name}</div>
                                <div className="text-[9px] text-gray-600 font-mono">{user.email}</div>
                                {user.voteReasons && Object.keys(user.voteReasons).length > 0 && (
                                    <div className="mt-2 text-[10px] text-gray-500 border-l border-white/10 pl-2">
                                        {Object.entries(user.voteReasons).map(([songId, reason]) => (
                                            <div key={songId} className="mb-1">
                                                <span className="text-gold">#{songId.toString().padStart(2,'0')}:</span> <span className="italic">"{reason}"</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-right opacity-50 whitespace-nowrap align-top">
                                {new Date(user.timestamp).toLocaleDateString()}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </section>
            </div>
        ) : (
            // --- CMS TAB ---
            <div className="space-y-6 animate-fade-in pb-20">
                 {/* GLOBAL SETTINGS - HOMEPAGE AUDIO */}
                 <div className="bg-[#111] p-6 rounded border border-white/20 mb-8">
                     <h3 className="text-white font-serif mb-4 flex items-center gap-2">
                         <PlayIcon className="w-4 h-4 text-gold" />
                         Homepage / Intro Music
                     </h3>
                     <div className="flex gap-4 items-end">
                         <div className="flex-1">
                             <label className="block text-[10px] uppercase text-gray-500 mb-2">Dropbox Link</label>
                             <input 
                                className="w-full bg-black border border-white/10 p-3 text-white rounded focus:border-gold outline-none font-mono text-xs" 
                                value={introUrl}
                                onChange={e => setIntroUrl(e.target.value)}
                                placeholder="https://www.dropbox.com/scl/fi/.../song.mp3?rlkey=..."
                             />
                         </div>
                         <button 
                            onClick={handleSaveGlobalConfig}
                            className="bg-white text-black px-6 py-3 rounded text-xs font-bold uppercase hover:bg-gold transition-colors h-[42px]"
                         >
                            Update
                         </button>
                     </div>
                 </div>

                 {/* BACKUP & RESTORE SECTION */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#1a1a1a] p-4 rounded border border-gold/30">
                     <div className="text-xs text-gray-300 max-w-lg">
                        <p className="mb-1 text-gold font-bold uppercase tracking-widest">⚠️ Data Safety</p>
                        <p>Browser storage is temporary. Please <strong>Download Backup</strong> regularly.</p>
                     </div>
                     <div className="flex gap-2">
                         <input 
                            type="file" 
                            accept=".json" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange}
                         />
                         <button 
                            onClick={handleRestoreClick}
                             className="bg-white/10 text-white hover:bg-white hover:text-black text-xs px-4 py-2 rounded uppercase tracking-widest border border-white/20 transition-all"
                         >
                             Restore Backup
                         </button>
                         <button 
                            onClick={handleDownloadBackup} 
                            className="bg-gold text-black hover:bg-yellow-400 text-xs px-4 py-2 rounded font-bold uppercase tracking-widest transition-all"
                         >
                             Download Backup
                         </button>
                     </div>
                 </div>

                 <div className="flex gap-2 mb-4 justify-end">
                     <button 
                        onClick={() => setShowImport(!showImport)} 
                        className="text-gold hover:underline text-xs uppercase tracking-widest"
                    >
                        {showImport ? 'Close Bulk Import' : 'Open Bulk Import Tool'}
                    </button>
                 </div>

                 {/* BULK IMPORT PANEL */}
                 {showImport && (
                     <div className="bg-[#1a1a1a] p-6 rounded border border-white/10 mb-8 animate-slide-up">
                         <h3 className="text-white font-serif mb-2">Bulk Import (Titles & Links)</h3>
                         <div className="text-[10px] text-gray-500 mb-4 leading-relaxed border-l-2 border-gold pl-3">
                            <strong className="text-gold">IMPORTANT:</strong> Please use <strong>Individual File Links</strong>.<br/>
                            <ul className="list-disc ml-4 mt-1 space-y-1">
                                <li>Folder links (containing <code>/fo/</code>) will NOT work.</li>
                                <li><strong>DO NOT remove</strong> the <code>?rlkey=...</code> part at the end of links. It is required for playback.</li>
                            </ul>
                            Format: <code>Song Title | https://dropbox.com/.../song.mp3?rlkey=...</code>
                         </div>
                         <textarea 
                            className="w-full h-64 bg-black border border-white/10 rounded p-4 text-xs font-mono text-gray-300 focus:border-gold outline-none"
                            placeholder={"Track 01 Title | https://www.dropbox.com/s/...\nTrack 02 Title | https://www.dropbox.com/scl/fi/.../song.mp3?rlkey=..."}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                         />
                         <div className="flex justify-end mt-4">
                             <button 
                                onClick={handleBulkImport}
                                className="bg-white text-black px-6 py-2 rounded text-xs font-bold uppercase hover:bg-gray-200"
                             >
                                Update Songs
                             </button>
                         </div>
                     </div>
                 )}

                 {editingSongId !== null ? (
                     // EDIT FORM
                     <div className="bg-[#111] p-6 rounded-lg border border-white/20 max-w-2xl mx-auto shadow-2xl">
                         <h3 className="text-white font-serif text-xl mb-6">Edit Track #{String(editingSongId).padStart(2,'0')}</h3>
                         
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">Song Title</label>
                                 <input 
                                    className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none" 
                                    value={editForm.title}
                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                 />
                             </div>
                             
                             <div>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">Audio Link (Dropbox Supported)</label>
                                 <input 
                                    className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none font-mono text-xs" 
                                    value={editForm.customAudioUrl}
                                    onChange={e => setEditForm({...editForm, customAudioUrl: e.target.value})}
                                    placeholder="https://www.dropbox.com/scl/fi/.../song.mp3?rlkey=..."
                                 />
                             </div>

                             <div>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">Custom Cover Image URL</label>
                                 <input 
                                    className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none font-mono text-xs" 
                                    value={editForm.customImageUrl}
                                    onChange={e => setEditForm({...editForm, customImageUrl: e.target.value})}
                                    placeholder="https://example.com/image.jpg"
                                 />
                             </div>

                             <div>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">Lyrics</label>
                                 <textarea 
                                    className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none h-32" 
                                    value={editForm.lyrics}
                                    onChange={e => setEditForm({...editForm, lyrics: e.target.value})}
                                 />
                             </div>

                             <div>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">Credits / Description</label>
                                 <textarea 
                                    className="w-full bg-black border border-white/20 p-2 text-white rounded focus:border-white outline-none h-20" 
                                    value={editForm.credits}
                                    onChange={e => setEditForm({...editForm, credits: e.target.value})}
                                 />
                             </div>
                         </div>

                         <div className="flex justify-end gap-3 mt-8">
                             <button onClick={() => setEditingSongId(null)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
                             <button onClick={saveEdit} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-gray-200">Save Changes</button>
                         </div>
                     </div>
                 ) : (
                    // GRID LIST
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {localSongs.map(song => {
                            const isPlaying = playingId === song.id;
                            return (
                                <div 
                                    key={song.id} 
                                    className={`p-3 bg-[#111] hover:bg-[#1a1a1a] rounded border border-white/5 hover:border-white/20 transition-all flex flex-col gap-3 group ${isPlaying ? 'border-white/20 bg-[#161616]' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[9px] text-gray-500 font-mono mb-1">#{String(song.id).padStart(2,'0')}</div>
                                            <div className="text-sm font-medium text-gray-300 truncate group-hover:text-white">{song.title}</div>
                                            <div className="flex gap-2 mt-1">
                                                {song.lyrics && <span className="text-[8px] bg-white/10 px-1 rounded text-gray-400">LYRICS</span>}
                                                {song.customAudioUrl && <span className="text-[8px] bg-green-900/50 px-1 rounded text-green-400">LINK</span>}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => startEdit(song)}
                                            className="text-xs text-gray-600 hover:text-white border border-transparent hover:border-white/20 px-2 py-1 rounded transition-colors