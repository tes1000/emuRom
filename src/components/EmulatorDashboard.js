"use client";

import React, { useState, useEffect } from "react";
// Make sure this path is valid in your project.
import notFound from "../app/404.png";
import { useLoading } from "@/contexts/LoadingContext";
import ShowConfigComponent from "./ShowConfigComponent";

const EmulatorDashboard = () => {
  const { isLoading, isPlaying, setIsPlaying, animating, setAnimating, selectedRom, setSelectedRom, setShowConfig, romUrl, setRomUrl } = useLoading(); // Get from context
  const [games, setGames] = useState({});
  const [viewMode, setViewMode] = useState("card");
  const [romLimit, setRomLimit] = useState(10000);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const API_SSL_URL = Number(process.env.NEXT_PUBLIC_SSL) ? "https://" : "http://";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost";
  const API_PORT = process.env.NEXT_PUBLIC_PORT ?? 30044
  
  // Fetch the games data on mount
  useEffect(() => {
    fetch(`/api/games`)
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  function getGridClasses() {
    const count = Object.keys(games).length;
    if (count <= 1) {
      return "grid-cols-1";
    }
    if (count === 2) {
      return "grid-cols-1 sm:grid-cols-2";
    }
    if (count === 3) {
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    }
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
  }

  // Render either all platforms or a single selected one
  const renderPlatforms = () => {
    if (!games || Object.keys(games).length === 0) {
      return (
        <div className="text-center text-white mt-12">No platforms found.</div>
      );
    }

    // If we have a selected platform, only show that one;
    // otherwise, show all platforms.
    const platforms = selectedPlatform
      ? [[selectedPlatform, games[selectedPlatform]]]
      : Object.entries(games);

    return platforms?.map(([platformKey, platform]) => (
      <>
        {/* PLATFORM HEADER */}
        <div
          className={`flex flex-col gap-[30px] -m-1 rounded-t-2xl bg-gradient-to-r from-gray-900 to-gray-800 border-b border-transparent ${
            animating && "animate-[glowBorderBot_4s_infinite_alternate]"
          }`}
          onClick={() => setSelectedPlatform(platformKey)}
        >
            <img
              //src={notFound.src}
              src={platform?.image ? platform?.image : notFound?.src}
              alt={`${platform.name} Image`}
              className="w-full max-h-[250px] object-cover rounded-t-2xl shadow-md"
            />
            <h2 className="text-xl font-bold p-3 mb-1 align-center center text-white text-center">
              {platform.name}
            </h2>
        </div>
            
        {/* GAMES LIST */}
        <div
          className={`grid
           grid-cols-1
           p-6 
           -m-1
           bg-gradient-to-r
           bg-gray-400
           from-gray-900
           to-gray-800 
           rounded-b-2xl           
           py-4
           sm:grid-cols-2
           md:grid-cols-3
           lg:grid-cols-4 
           xl:grid-cols-5
           gap-4
           border-y
           border-transparent
           ${animating && "animate-[glowBorderTop_4s_infinite_alternate]"}
           `}
        >
          {platform?.games.slice(0, romLimit).map((game) => (
            <div
              key={game.name}
              className={`
               rounded-lg
                bg-gray-800
                hover:bg-gray-700
                transition-colors
                duration-200
                flex flex-col
                items-center
                cursor-pointer
                shadow-lg
                overflow-hidden
                w-full
                h-[250px]
                ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
                shadow-none
            `}
              onClick={() => {
                  setSelectedRom(game);
                }
              }
            >
              <img
                //src={notFound.src}
                src={game?.image ? game?.image : notFound?.src}
                alt={`${game.name} cover`}
                className="w-full h-[85%] object-cover rounded-t-lg shadow-md"
              />
              <p className="mt-2 text-sm text-white text-center">{game.name}</p>
            </div>
          ))}
        </div>
      </>
    ));
  };

  return (
    <div
      className={`
       w-[80%]
  bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
  text-white mt-1 p-1 rounded-2xl
  ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
  border border-transparent
  backdrop-blur-lg backdrop-saturate-150`}
    >
      {/* Top controls 
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            className="
              px-4 py-2
              bg-gradient-to-r from-blue-600 to-blue-500
              rounded-lg
              text-white
              hover:from-blue-700 
              hover:to-blue-600
              transition-all duration-200
              shadow-md
            onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
          >
            Toggle View: {viewMode === "card" ? "List" : "Cards"}
          </button>

          <select
            className="
              px-4 py-2
              bg-gray-700
              rounded-lg
              text-white
              hover:bg-gray-600
              transition-colors duration-200
              shadow-md
            "
            onChange={(e) => setRomLimit(parseInt(e.target.value))}
            value={romLimit}
          >
            {[5, 10, 20, 50, 100].map((num) => (
              <option key={num} value={num} className="bg-gray-800">
                {num} ROMs
              </option>
            ))}
          </select>
       
          {selectedPlatform && (
            <button
              className="
                ml-auto
                px-4 py-2
                bg-gradient-to-r from-gray-600 to-gray-500
                rounded-lg
                text-white
                hover:from-gray-700 hover:to-gray-600
                transition-all duration-200
                shadow-md
              "
              onClick={() => setSelectedPlatform(null)}
            >
              Back
            </button>
          )}
        </div>
 */}
      {/* Platforms container */}
      <ShowConfigComponent setShowConfig={setShowConfig}/>
        <div
          key="pc1"
          className={`flex flex-col ${getGridClasses(games)} 
          gap-7 
          items-stretch`}
        >
          {renderPlatforms()}
        </div>
      )
    </div>
  );
};

export default EmulatorDashboard;
