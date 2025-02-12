'use client'

import { createContext, useState, useContext, useRef } from 'react'

const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animating, setAnimating] = useState(false);
  const [selectedRom, setSelectedRom] = useState(null);
  const [showConfig, setShowConfig] = useState(false)
  const [romUrl, setRomUrl] = useState(null)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, isPlaying, setIsPlaying, animating, setAnimating, selectedRom, setSelectedRom, showConfig, setShowConfig, romUrl, setRomUrl }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
