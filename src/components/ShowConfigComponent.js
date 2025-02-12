"use client";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import generateRandomName from "./nameGenerator";

const ShowConfigComponent = ({ children }) => {
  const { showConfig, animating, selectedRom, setSelectedRom, setRomUrl } = useLoading();
  const [selectedSave, setSelectedSave] = useState("new");
  const [inputValue, setInputValue] = useState("");

// Update inputValue whenever selectedSave changes
  useEffect(() => {
      setInputValue(selectedSave.split("/").pop().split(".")[0]);
  }, [selectedSave]);

  const handleRename = async () => {
    if (selectedSave.split("/").pop().split(".")[0] === inputValue) return;
    console.log(inputValue, selectedSave)
    const tmpRenameObj = {
      selectedRom: encodeURIComponent(selectedSave),
      newName: encodeURIComponent(inputValue),
    };
  
    try {
      const response = await fetch("/api/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tmpRenameObj),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Rename successful:", data);
    } catch (error) {
      window.alert("failed to rename")
      console.error("Rename error:", error);
    }
  };
  

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete: ${inputValue}`);

    if (!isConfirmed) return; // Exit if the user cancels
  
    try {
      const response = await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rom: selectedSave }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Delete successful:", data);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSaveSelection = (save) => {
    setSelectedSave(save);
  };

  const handlePlay = () => {
    setRomUrl(
      `/play?rom=${encodeURIComponent(selectedRom?.rom)}&save_state=${encodeURIComponent(selectedSave)}`
    );
  };

  return (
    <div
      className={`
        fixed inset-0 flex justify-center items-center transition-opacity duration-300
        ${!showConfig ? "opacity-0 pointer-events-none" : "opacity-100 z-50"}
      `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg transition-opacity"
        onClick={() => setSelectedRom(null)}
      />

      {/* Pop-up Panel */}
      <div
        className={`
          relative w-[65%] max-w-2xl p-6
          bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
          text-white rounded-2xl shadow-lg 
          border border-transparent backdrop-blur-lg backdrop-saturate-150
          ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
        `}
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-white text-lg font-bold hover:text-gray-300"
          onClick={() => setSelectedRom(null)}
        >
          ✕
        </button>

        {/* Inner Panel */}
        <div
          className={`
            bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800
            h-full w-full border-2 p-6 shadow-md rounded-lg border-black
            ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
          `}
        >
          {/* Image across the top */}
          <div className="w-full flex justify-center mb-4">
            <img
              src={selectedRom?.image}
              alt={selectedRom?.name}
              className="max-w-full h-auto"
            />
          </div>

          {/* Title under the image */}
          <h2 className="text-center text-white text-2xl font-bold mb-4">
            {selectedRom?.name}
          </h2>

          {/* Save options section */}
          {selectedRom?.config?.save && selectedRom.config.save.length > 0 && (
            <div className={`mb-8 border-2 p-4 ${animating && "animate-[softGlow_4s_infinite_alternate]"}`}>
              <h3 className="text-white text-lg mb-2">Select Save:</h3>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Default option: New Game */}
                {selectedRom.config.save.length < 16 && (
                  <button
                    className={`flex-1 py-4 px-2 h-full rounded overflow-hidden ${
                      selectedSave === "new"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                    onClick={() => handleSaveSelection("new")}
                  >
                    New Game
                  </button>
                )}

                {/* Render a button for each save state */}
                {selectedRom?.config?.save?.map((state, index) => {
                  let saveName = state.split("/").pop().split(".")[0];
                  return (
                    <div
                      key={index}
                      className="relative flex items-center gap-2"
                    >
                      <button
                        className={`flex-1 py-4 px-2 h-full rounded max-w-[130px] m-auto overflow-hidden ${
                          selectedSave === state
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                        onClick={() => handleSaveSelection(state)}
                      >
                        {saveName}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      

<input value={inputValue === "new" ? generateRandomName() : inputValue} onChange={(e) => setInputValue(e.target.value)} className={`${animating && "animate-[softGlow_4s_infinite_alternate]"} h-10 w-full bg-gray-500 p-1 mb-6 rounded`}/>
          {/* Play button at the bottom */}
          <div className="w-full flex justify-center gap-4">
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
              onClick={handlePlay}
            >
              {selectedRom?.config?.save?.length === 0 ? "New Game" : "Play"}
            </button>
            <button
              className={`transition-opacity duration-500 ${selectedRom?.config?.save?.length === 0 || selectedSave === "new" ? "opacity-0 pointer-events-none" : "opacity-100"} px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold`}
              onClick={handleRename}
            >
              Rename
            </button>
            <button
              className={`transition-opacity duration-500 ${selectedRom?.config?.save?.length === 0 || selectedSave === "new" ? "opacity-0 pointer-events-none" : "opacity-100"} px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold`}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowConfigComponent;
