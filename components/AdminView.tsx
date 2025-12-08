import React from 'react';
import { getVotes, getLeaderboard } from '../services/storage';
import { SONGS } from '../constants';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const users = getVotes();
  const leaderboard = getLeaderboard(SONGS);

  return (
    <div className="pb-12 text-gray-200">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h2 className="font-serif text-2xl font-bold text-white">Dashboard</h2>
        <button onClick={onBack} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white">
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-1 gap-12">
        {/* Leaderboard Section */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-gray-400">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Leaderboard
          </h3>
          <div className="bg-surfaceHighlight p-6 rounded-2xl border border-white/5 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
            {leaderboard.map((item, index) => (
              <div key={item.song?.id} className="relative group">
                <div className="flex justify-between text-xs mb-2 font-serif z-10 relative">
                  <span className="text-gray-300">#{index + 1} {item.song?.title}</span>
                  <span className="font-bold text-white">{item.count} Votes</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${(item.count / (users.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-sm text-gray-500">No data available.</p>}
          </div>
        </section>

        {/* User Data Section */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-gray-400">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Participants
          </h3>
          <div className="bg-surfaceHighlight border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-white/5 border-b border-white/5 uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-serif text-gray-200">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4 font-light opacity-50">
                        {new Date(user.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5 text-right">
              <button 
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + "Name,Email,Timestamp,Votes\n"
                    + users.map(u => `${u.name},${u.email},${u.timestamp},"${u.votes.join('|')}"`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "beloved_2026_data.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
                className="text-[10px] uppercase font-bold tracking-widest text-white hover:text-gray-400"
              >
                Export CSV
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};