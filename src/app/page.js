'use client'
import { useLoading } from '@/contexts/LoadingContext';
import EmulatorDashboard from "@/components/EmulatorDashboard";
import SplashLoader from "@/components/SplashLoader";
import PlayFrame from '@/components/PlayFrame';
import logo from './Emu-head.webp';

export default function Home() {
  const { isLoading, isPlaying, romUrl } = useLoading();

  return (
    <div className="min-h-screen">

      {/* Render PlayFrame only if isPlaying is true and the ref doesn't already exist */}
      {isPlaying && romUrl && (
        <PlayFrame />
      )}
      {!isPlaying && (
        <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center gap-3 sm:p-2 font-[family-name:var(--font-geist-sans)]">
          {/* TitlePanel */}
          <div className={`flex-col w-full overflow-hidden relative md:flex md:w-[80%] h-[200px] items-center justify-between 
            bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
            text-white md:mt-1 md:p-6 rounded-2xl
            border border-white/30 
            backdrop-blur-lg backdrop-saturate-150 
            ${!isLoading && 'animate-[glow_4s_infinite_alternate]'}`}>
            <div className='h-[80%] w-full md:h-full md:-mt-20 overflow-hidden md:overflow-visible'>
              <img src={logo.src} alt="EmuRom Logo" className="w-full h-auto md:h-[300px] md:w-auto md:-ml-6 -my-16 md:my-0 drop-shadow-lg rounded-l-xl" />
            </div>
            <h1 className="flex-1 text-center mr-[100px] w-full text-4xl font-extrabold tracking-wide drop-shadow-lg">EmuRom</h1>
          </div>

          {/* Emulator Dashboard */}
          <EmulatorDashboard />

          {/* Loading Screen */}
          {isLoading && <SplashLoader />}
        </div>
      )}
    </div>
  );
}
