import React, { useState } from 'react';
import { getVotes, getLeaderboard } from '../services/storage';
import { SONGS } from '../constants';
import { Layout, FadeIn } from './Layout';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

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
  const leaderboard = getLeaderboard(SONGS);

  return (
    <div className="min-h-screen bg-black text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Manager Dashboard</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Beloved 2026 Voting Analytics</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-2xl font-bold text-white leading-none">{users.length}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Voters</p>
             </div>
             <button onClick={onBack} className="text-xs border border-white/20 hover:bg-white hover:text-black px-4 py-2 rounded transition-all uppercase tracking-widest">
               Exit
             </button>
          </div>
        </header>

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
      </div>
    </div>
  );
};