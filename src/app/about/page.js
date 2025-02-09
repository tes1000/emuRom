'use client'
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const sections = document.querySelectorAll(".animated-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeSlideIn");
            entry.target.classList.remove("animate-fadeSlideOut");
          } else {
            entry.target.classList.add("animate-fadeSlideOut");
            entry.target.classList.remove("animate-fadeSlideIn");
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        {/* Title Section */}
        <section className="animated-section border-neonBlue">
          <h1 className="text-4xl md:text-6xl font-bold text-neonBlue drop-shadow-neon">
            About <span className="text-neonPink">EmuRom</span>
          </h1>
        </section>

        {/* Description Section */}
        <section className="animated-section border-neonYellow">
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            <span className="text-neonYellow">EmuRom</span> is a lightweight, browser-based emulator wrapper 
            designed for easy ROM loading with <span className="text-neonGreen">EmulatorJS</span>. 
            Whether you're reliving classic titles or exploring hidden gems, 
            <span className="text-neonBlue"> EmuRom</span> makes it simple—just load your ROMs and play 
            directly in your browser.
          </p>
        </section>

        {/* File Structure Section */}
        <section className="animated-section border-neonGreen">
          <h2 className="text-2xl font-semibold text-neonGreen drop-shadow-neon">File Structure</h2>
          <pre className="whitespace-pre mt-4 p-4 bg-black text-green-400 font-mono text-sm md:text-base rounded-lg border border-green-500 shadow-md">
            <pre className="whitespace-pre text-left mt-4 p-4 bg-black text-green-400 font-mono text-sm md:text-base rounded-lg border border-green-500 shadow-md">
            {`data  
            └── platform  
                ├── platform-image.png  # Image for platform card  
                ├── games  
                │   ├── Game Title  
                │   │   ├── game-image.png  # Image for game card  
                │   │   ├── rom  
                │   │   │   ├── gamefile.rom  # The ROM file (Will not load if more than 1 file in this folder!)  
                │   │   ├── data  # for Save config files  (V2 not yet implemented) 
            `}
            </pre>

</pre>
        </section>

        {/* Collection Mode Section */}
        <section className="animated-section border-neonPink">
          <h2 className="text-2xl font-semibold text-neonPink drop-shadow-neon">Collection Mode</h2>
          <p className="mt-4 text-gray-300">
          If you prefer a <span className="text-neonYellow">single platform for everything</span>, 
you can drop all game folders into a custom <span className="text-neonBlue">"Collection"</span> platform.  
The UI is optimized for this setup, ensuring that games are displayed neatly within the collection.

          </p>
        </section>
      </div>
    </div>
  );
};

export default Page;
