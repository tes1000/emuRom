'use client'
import { useLoading } from '@/contexts/LoadingContext';
import logo from '@/app/favicon.ico';
import Link from "next/link";


const NavBar = () => {
    const { animating } = useLoading();

    return(
          <header className={`flex z-100 w-screen bg-gradient-to-r h-10 from-blue-500 to-purple-700 p-4 shadow-lg border-b-4 ${animating && "animate-[glowBorderBot_4s_infinite_alternate]"} border-purple-500`}>
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo.src} alt="EmuRom Logo" className={`w-12 h-12 rounded-full border-2 border-white shadow-lg`} />
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">EmuRom</h1>
              </div>
              <nav className="hidden md:flex gap-6 text-lg font-medium">
                <Link href="/" className="hover:text-blue-300 transition">Home</Link>
                <Link href="/upload" className="hover:text-blue-300 transition">Upload</Link>
                <Link href="/about" className="hover:text-blue-300 transition">About</Link>
              </nav>
            </div>
          </header>
    )
}

export default NavBar;