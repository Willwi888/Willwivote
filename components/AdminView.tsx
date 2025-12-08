import React, { useState } from 'react';
import { getVotes, getLeaderboard, getSongs, updateSongTitle, updateAllSongTitles, resetSongTitles } from '../services/storage';
import { Song } from '../types';
import { Layout, FadeIn } from './Layout';
import AudioPlayer from './AudioPlayer';
import { HeartIcon, SearchIcon, PlayIcon, PauseIcon } from './Icons';

type Tab = 'dashboard' | 'songs';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State for song editing
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewPlayingId, setPreviewPlayingId] = useState<number | null>(null);

  // State for Bulk Import
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8888') {
      setIsAuthenticated(true);
      setError(false);
      setLocalSongs(getSongs());
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleSaveTitle = (id: number) => {
      const updated = updateSongTitle(id, editValue);
      setLocalSongs(updated);
      setEditingId(null);
  };

  const handleStartEdit = (song: Song) => {
      setEditingId(song.id);
      setEditValue(song.title);
  };

  const handleBulkImport = () => {
      if (!importText.trim()) return;
      const lines = importText.split(/\r?\n/);
      const updated = updateAllSongTitles(lines);
      setLocalSongs(updated);
      setShowImport(false);
      setImportText('');
      alert(`Successfully updated ${Math.min(lines.length, 40)} song titles.`);
  };

  const handleExportConfig = () => {
      const json = JSON.stringify(localSongs.map(s => ({ id: s.id, title: s.title, driveId: s.driveId })), null, 2);
      navigator.clipboard.writeText(json).then(() => {
          alert("Config copied to clipboard! Send this to your developer to update the app permanently.");
      });
  };

  const togglePreview = (id: number) => {
      if (previewPlayingId === id) {
          setPreviewPlayingId(null);
      } else {
          setPreviewPlayingId(id);
      }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
           <FadeIn>
             <h2 className="font-serif text-2xl text-white mb-2">Admin Access</h2>
             <p className="text-[10px] uppercase tracking-widest text-gray-500 text-center">Restricted Area</p>
           </FadeIn>
           
           <FadeIn delay={100}>
             <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-64">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="bg-transparent border-b border-gray-700 py-2 text-center text-white focus:border-white outline-none placeholder-gray-700 transition-colors"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs text-center">Incorrect Password</p>}
                <button 
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest py-3 rounded-full transition-all"
                >
                  Unlock
                </button>
                <button onClick={onBack} type="button" className="text-xs text-gray-600 hover:text-gray-400 mt-4">
                  Return to App
                </button>
             </form>
           </FadeIn>
        </div>
      </Layout>
    );
  }

  const users = getVotes();
  // We use localSongs for the leaderboard to ensure titles are consistent with edits
  const leaderboard = getLeaderboard(localSongs);

  return (
    <div className="min-h-screen bg-black text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Manager Dashboard</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Beloved 2026 Voting Analytics</p>
          </div>
          <div className="flex items-center gap-6">
             {activeTab === 'dashboard' && (
                <div className="text-right">
                    <p className="text-2xl font-bold text-white leading-none">{users.length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Voters</p>
                </div>
             )}
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
                     Manage Songs
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
                
                <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-y-auto max-h-[600px] no-scrollbar">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                        <tr>
                            <th className="p-4 font-medium w-16">Rank</th>
                            <th className="p-4 font-medium">Track Title</th>
                            <th className="p-4 font-medium text-right">Votes</th>
                            <th className="p-4 font-medium w-32">Trend</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {leaderboard.map((item, index) => (
                            <tr key={item.song?.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 text-gray-500 font-mono">{(index + 1).toString().padStart(2, '0')}</td>
                            <td className="p-4 font-medium text-gray-300 group-hover:text-white">{item.song?.title}</td>
                            <td className="p-4 text-right font-bold text-white">{item.count}</td>
                            <td className="p-4">
                                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-white h-full" 
                                    style={{ width: `${users.length > 0 ? (item.count / users.length) * 100 : 0}%` }}
                                ></div>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </section>

            {/* User Data Section */}
            <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                Recent Activity
                </h3>
                
                <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs text-gray-400">
                        <thead className="sticky top-0 bg-[#1e1e1e] text-gray-500 uppercase tracking-wider z-10">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium text-right">Time</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {users.slice().reverse().map((user, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-serif text-gray-200">{user.name}</td>
                            <td className="p-4 font-mono text-gray-500 text-[10px]">{user.email}</td>
                            <td className="p-4 text-right opacity-50 whitespace-nowrap">
                                {new Date(user.timestamp).toLocaleDateString()}
                            </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                            <td colSpan={3} className="p-12 text-center text-gray-600">No votes recorded yet.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-white/5 bg-[#1e1e1e]">
                    <button 
                        onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                            + "Name,Email,Timestamp,Votes\n"
                            + users.map(u => `${u.name},${u.email},${u.timestamp},"${u.votes.join('|')}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "beloved_2026_export.csv");
                        document.body.appendChild(link);
                        link.click();
                        }}
                        className="w-full py-3 border border-white/10 hover:border-white/30 text-xs uppercase tracking-widest text-gray-400 hover:text-white rounded transition-colors"
                    >
                        Download CSV Report
                    </button>
                </div>
                </div>
            </section>
            </div>
        ) : (
            // --- SONG EDITOR TAB ---
            <div className="space-y-6 animate-fade-in">
                 <div className="bg-[#121212] p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-2">Song Metadata Editor</h3>
                            <p className="text-xs text-gray-500 max-w-xl">
                                Rename songs individually below, or use <strong className="text-white">Batch Import</strong> to paste a list from Excel/Text. 
                                <br/><span className="text-orange-400">Note:</span> Changes are saved to this browser.
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setShowImport(!showImport)}
                                className="bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:bg-white/20 transition-colors"
                            >
                                {showImport ? 'Close Import' : 'Batch Import Titles'}
                            </button>
                             <button 
                                onClick={handleExportConfig}
                                className="bg-white text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                            >
                                Export JSON
                            </button>
                        </div>
                    </div>

                    {showImport && (
                        <div className="mb-6 bg-black/50 p-4 rounded border border-white/10 animate-fade-in">
                            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Paste song titles (One per line)</label>
                            <textarea 
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                className="w-full h-48 bg-[#0a0a0a] border border-white/20 rounded p-3 text-xs text-white font-mono focus:outline-none focus:border-white resize-none"
                                placeholder={`Example:\n01_Sunny Day\n02_Rainy Season\n03_Beloved\n...`}
                            />
                            <div className="flex justify-end mt-2 gap-3">
                                <button 
                                    onClick={() => setShowImport(false)}
                                    className="text-xs text-gray-500 hover:text-white px-3 py-2"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleBulkImport}
                                    className="bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2 rounded hover:bg-gray-200"
                                >
                                    Apply Titles
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Reset Button (Small) */}
                    <div className="flex justify-end border-b border-white/5 pb-4 mb-4">
                        <button 
                            onClick={() => {
                                if(confirm("Are you sure? This will revert all song titles to default.")) {
                                    setLocalSongs(resetSongTitles());
                                }
                            }}
                            className="text-[10px] text-red-900 hover:text-red-500 uppercase tracking-widest"
                        >
                            Reset All Data
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
                        {localSongs.map(song => (
                            <div key={song.id} className="p-3 hover:bg-white/5 rounded flex items-center gap-3 border border-transparent hover:border-white/5 transition-all">
                                <div className="shrink-0">
                                    <AudioPlayer 
                                        driveId={song.driveId}
                                        isPlaying={previewPlayingId === song.id}
                                        onToggle={() => togglePreview(song.id)}
                                        title={song.title}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-gray-500 font-mono mb-1">ID: {String(song.id).padStart(2,'0')}</div>
                                    {editingId === song.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') handleSaveTitle(song.id);
                                                    if(e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="w-full bg-black border border-white/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white"
                                            />
                                            <button onClick={() => handleSaveTitle(song.id)} className="text-green-500 hover:text-green-400">
                                                <HeartIcon className="w-4 h-4" filled />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => handleStartEdit(song)}
                                            className="text-xs font-medium text-gray-300 truncate cursor-pointer hover:text-white border-b border-transparent hover:border-gray-600 pb-0.5"
                                            title="Click to rename"
                                        >
                                            {song.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};