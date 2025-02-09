  "use client";

  import { useEffect, useState } from "react";
  import logo from "../app/Emu.webp";
  import { useLoading } from "@/contexts/LoadingContext"; // Import the context

  export default function SplashLoader() {
    const { isLoading, setIsLoading } = useLoading(); // Get from context
    const [showLoader, setShowLoader] = useState(true);
    const [progress, setProgress] = useState(0); // Track progress percentage
    const splashDuration = 1000; // Total splash duration in ms

    useEffect(() => {
      // Animate progress bar
      const interval = 50; // Update every 50ms
      let elapsed = 0;

      const progressTimer = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / splashDuration) * 100); // Update progress percentage

        if (elapsed >= splashDuration) {
          clearInterval(progressTimer);
          setIsLoading(false);
        }
      }, interval);

      return () => clearInterval(progressTimer);
    }, []);

    useEffect(() => {
      if (!isLoading) {
        const timer = setTimeout(() => setShowLoader(false), 500);
        return () => clearTimeout(timer);
      }
    }, [isLoading]);

    return (
      <div className="min-h-screen bg-gray-900">
        {/* Splash Screen */}
        {showLoader && (
          <div
            className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-900 
              transition-opacity duration-500 z-50 
              ${!isLoading ? "opacity-0" : "opacity-100"}`}
                    >
            {/* Main Loader Container */}
            <div className="relative h-48 w-48 animate-[scaleUp_0.2s_ease-out_forwards]">
              {/* Gradient Background */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-r 
                from-purple-500 via-pink-500 to-red-500 bg-[length:400%_400%] 
                animate-[gradientRotate_0.5s_infinite_alternate] blur-xl opacity-75"
              />

              {/* Logo */}
              <img
                src={logo.src}
                alt="Loading..."
                className="absolute inset-2 rounded-full object-cover 
                  animate-float animate-[wobble_0.2s_infinite_alternate] shadow-xl"
              />
            </div>

            {/* Loading Text */}
            <h1 className="mt-6 text-white text-2xl font-bold animate-[fadeIn_0.6s_ease-out_forwards]">
              Loading EmuRom...
            </h1>
            <p className="text-white text-lg animate-[fadeIn_0.8s_ease-out_forwards]">
              Please wait while we set things up.
            </p>

            {/* Progress Bar */}
            <div className="mt-6 w-64 h-3.5 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all ease-linear"
                style={{ width: `${progress}%`, boxShadow: "0 0 10px #00ffff" }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
