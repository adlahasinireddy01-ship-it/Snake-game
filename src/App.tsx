import React from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-fuchsia-500/30 selection:text-fuchsia-100 flex flex-col overflow-x-hidden relative">
      {/* Heavy CRT/Scanline background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,rgba(0,0,0,0.8)_80%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50 mix-blend-overlay" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.03)_1px,transparent_1px)] bg-[size:40px_40px] perspective-grid [transform:rotateX(60deg)_translateY(-100px)_scale(2)] transform-origin-top opacity-30" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-8 pb-24 px-4 gap-8">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center mt-2 mb-4">
          <div className="flex items-center gap-3 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] mb-2">
            <Terminal size={32} className="animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Neon <span className="text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]">Snake</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-sm tracking-[0.2em] font-semibold uppercase">
             Cybernetic Grid Protocol
          </p>
        </header>

        {/* Game Area */}
        <section className="flex-1 w-full flex items-center justify-center">
          <SnakeGame />
        </section>

      </main>

      {/* Floating Music Player anchored at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent z-40 flex items-end justify-center pointer-events-none">
        <div className="pointer-events-auto shadow-[0_-15px_40px_rgba(0,0,0,0.5)] rounded-xl max-w-[calc(100vw-2rem)] shrink-0 pb-safe">
          <MusicPlayer />
        </div>
      </div>

      <style>{`
        /* Adds a subtle safe-area pb for mobile */
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        
        /* Grid perspective setup */
        .perspective-grid {
          transform-style: preserve-3d;
          perspective: 500px;
        }
      `}</style>
    </div>
  );
}
