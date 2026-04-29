import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'Neon Grid Runner', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Synthwave Dreams', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Cybernetic Overdrive', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIdx];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.log('Audio autoplay prevented', e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setProgress((currentTime / duration) * 100 || 0);
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)] rounded-xl p-4 flex flex-col gap-3 font-mono text-fuchsia-100 relative overflow-hidden group">
      {/* Decorative scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 group-hover:opacity-10 transition-opacity"></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.4)]">
            <Music size={20} className={isPlaying ? 'animate-pulse' : ''} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-fuchsia-400 uppercase tracking-widest font-semibold">Now Playing</span>
            <span className="text-sm font-bold truncate max-w-[180px] sm:max-w-xs">{currentTrack.title}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors p-2"
          aria-label="Toggle mute"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2 z-10 relative">
        <div 
          className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 z-10 relative">
        <button 
          onClick={prevTrack}
          className="text-fuchsia-400 hover:text-cyan-400 hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]"
        >
          <SkipBack size={24} />
        </button>
        <button 
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
        </button>
        <button 
          onClick={nextTrack}
          className="text-fuchsia-400 hover:text-cyan-400 hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
