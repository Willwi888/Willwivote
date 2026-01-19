
import React, { useState, useEffect } from 'react';
import { getVotes, getSongs, updateSong, saveVote } from '../services/storage';
import { Song, User } from '../types';
import { CheckIcon, SpinnerIcon, XIcon } from './Icons';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'votes'>('votes');
  const [users, setUsers] = useState<User[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      getVotes().then(setUsers);
      setSongs(getSongs());
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-sans">
        <form onSubmit={(e) => { e.preventDefault(); if(password==='2026') setIsAuthenticated(true); }} className="p-12 glass-panel border-2 border-brand/30 text-center space-y-8">
          <h2 className="text-brand text-xs tracking-[0.5em] font-black uppercase">Admin Access</h2>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent border-b-2 border-brand py-4 text-center text-white outline-none text-2xl" placeholder="PASSCODE" />
          <button type="submit" className="w-full bg-brand text-black py-4 font-black">LOGIN</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-12 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-brand/20 pb-10">
          <h1 className="text-6xl font-black text-brand text-display uppercase">Console</h1>
          <div className="flex gap-8">
            <button onClick={() => setActiveTab('votes')} className={`text-xs tracking-widest font-black uppercase ${activeTab==='votes' ? 'text-brand underline' : 'text-gray-600'}`}>Votes & Messages</button>
            <button onClick={() => setActiveTab('songs')} className={`text-xs tracking-widest font-black uppercase ${activeTab==='songs' ? 'text-brand underline' : 'text-gray-600'}`}>Manage Library</button>
            <button onClick={onBack} className="text-xs tracking-widest font-black uppercase text-gray-400">Exit</button>
          </div>
        </div>

        {activeTab === 'votes' && (
          <div className="space-y-10">
            {users.map((u, i) => (
              <div key={i} className="glass-panel p-10 border border-brand/10 hover:border-brand/40 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white">{u.name}</h3>
                    <p className="text-brand text-xs font-mono">{u.email}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-600 uppercase tracking-widest">
                    {new Date(u.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] text-brand font-black tracking-widest uppercase">Selections</p>
                    <div className="flex flex-wrap gap-2">
                      {u.votes.map(vId => (
                        <span key={vId} className="bg-brand/10 border border-brand/30 text-brand px-3 py-1 text-xs font-mono">#{String(vId).padStart(2,'0')}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] text-brand font-black tracking-widest uppercase">Messages & Feedback</p>
                    {u.voteReasons && Object.entries(u.voteReasons).map(([id, reason]) => (
                      <div key={id} className="text-sm bg-white/5 p-4 border-l-2 border-brand">
                        <span className="text-[9px] text-brand font-bold uppercase mr-2">Track {id}:</span>
                        <span className="text-gray-300 italic">"{reason}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
