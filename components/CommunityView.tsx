
import React from 'react';
import { CommunityIcon } from './icons';

const CommunityView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 rounded-lg border border-pink-500/30">
            <CommunityIcon className="w-8 h-8 text-pink-300" />
          </div>
          <div>
            <h2 className="text-3xl font-orbitron text-pink-300">Community Grids</h2>
            <p className="text-gray-400">See how others are spending their weeks.</p>
          </div>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 font-orbitron">
          + Share My Grid
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button className="py-2 px-4 text-pink-300 border-b-2 border-pink-400 font-semibold">Recent</button>
        <button className="py-2 px-4 text-gray-500 hover:text-pink-300">Popular</button>
        <button className="py-2 px-4 text-gray-500 hover:text-pink-300">In-Progress</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Example Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 group">
          <h3 className="font-orbitron text-lg text-white mb-4">test</h3>
          <div className="relative aspect-video bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 opacity-80"></div>
             <div className="relative z-10 text-center">
                <div className="text-4xl font-bold text-white">56.0%</div>
                <div className="text-xs text-white/80">2239 / 4000 WEEKS</div>
             </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-gray-500">
            <div className="flex gap-4">
                <span className="flex items-center gap-1">♡ 0</span>
                <span className="flex items-center gap-1">💬 0</span>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </button>
          </div>
        </div>
        {/* More cards can be added here */}
      </div>

    </div>
  );
};

export default CommunityView;
