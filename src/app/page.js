'use client'
import { useState, useRef, useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import EmulatorDashboard from "@/components/EmulatorDashboard";
import SplashLoader from "@/components/SplashLoader";
import PlayFrame from '@/components/PlayFrame';
import logo from './Emu-head.webp';

export default function Home() {
  const [selectedRom, setSelectedRom] = useState(null);
  const { isLoading, isPlaying, setIsPlaying } = useLoading();
  const playFrameRef = useRef(null);

  // Effect to reset the ref when PlayFrame unmounts
  useEffect(() => {
    if (!isPlaying) {
      playFrameRef.current = null;
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen">
      {/* Render PlayFrame only if isPlaying is true and the ref doesn't already exist */}
      {isPlaying && !playFrameRef.current && (
        <PlayFrame ref={playFrameRef} selectedRom={selectedRom} />
      )}

      {!isPlaying && (
        <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center gap-3 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          {/* TitlePanel */}
          <div className={`relative flex w-[80%] h-[200px] items-center justify-between 
            bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
            text-white mt-1 p-6 rounded-2xl 
            border border-white/30 
            backdrop-blur-lg backdrop-saturate-150 
            before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.2),transparent)] before:rounded-2xl
            ${!isLoading && 'animate-[glow_4s_infinite_alternate]'}`}>
            <img src={logo.src} alt="EmuRom Logo" className="h-[200px] w-[200px] -ml-6 -my-6 mr-4 drop-shadow-lg rounded-l-xl" />
            <h1 className="flex-1 text-center mr-[100px] text-4xl font-extrabold tracking-wide drop-shadow-lg">EmuRom</h1>
          </div>

          {/* Emulator Dashboard */}
          <EmulatorDashboard selectedRom={selectedRom} setSelectedRom={setSelectedRom} />

          {/* Loading Screen */}
          {isLoading && <SplashLoader />}
        </div>
      )}
    </div>
  );
}
