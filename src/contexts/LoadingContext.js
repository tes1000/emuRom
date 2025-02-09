'use client'

import { createContext, useState, useContext } from 'react'

const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animating, setAnimating] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, isPlaying, setIsPlaying, animating, setAnimating }}>
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
