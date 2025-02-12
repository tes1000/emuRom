'use client';    
// StateMachineComponent.js
import { useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";

/**
 * A React component that encapsulates state logic.
 * It doesn't render any visible UI.
 */
const StateMachineComponent = () => {
    const { isLoading, romUrl, selectedRom, isPlaying, animating, showConfig, setIsPlaying, setAnimating, setShowConfig, setRomUrl, setSelectedRom,} = useLoading();
    
  useEffect(() => {
    let phase = "IDLE";
    if (isLoading) {
      phase = "LOADING";
    } else if (romUrl) {
      phase = "PLAYING";
    } else if (selectedRom) {
      phase = "CONFIG";
    }

    switch (phase) {
      case "LOADING":
        if (!isLoading) setIsLoading(true)
        if (animating !== false) setAnimating(false);
        if (isPlaying) setIsPlaying(false);
        if (showConfig) setShowConfig(false);
        if (romUrl) setRomUrl(null);
        if (selectedRom) setSelectedRom(null)
        break;
      case "PLAYING":
            if (animating) setAnimating(false);
            if (!isPlaying) setIsPlaying(true);
            if (showConfig) setShowConfig(false);
        break;
      case "CONFIG":
            if (!animating) setAnimating(true);
            if (isPlaying) setIsPlaying(false);
            if (!showConfig) setShowConfig(true);
        break;
      case "IDLE":
      default:
        if (animating !== true) setAnimating(true);
        if (selectedRom !== null) setSelectedRom(null);
        if (showConfig !== false) setShowConfig(false);
        if (romUrl !== null) setRomUrl(null);
        if (isPlaying !== false) setIsPlaying(false);
        break;
    }
  }, [
    isLoading,
    romUrl,
    selectedRom,
    isPlaying,
    animating,
    showConfig,
    setAnimating,
    setIsPlaying,
    setShowConfig,
    setRomUrl,
    setSelectedRom,
  ]);

  // This component doesn't need to render any UI.
  return null;
};

export default StateMachineComponent;
