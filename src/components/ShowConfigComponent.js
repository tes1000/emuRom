"use client";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import generateRandomName from "./nameGenerator";

const ShowConfigComponent = () => {
  const { showConfig, animating, selectedRom, setSelectedRom, setRomUrl } =
    useLoading();
  const [selectedSave, setSelectedSave] = useState("new");
  const [inputValue, setInputValue] = useState("");
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [randomName, setRandomName] = useState(generateRandomName());
  // Update inputValue whenever selectedSave changes
  useEffect(() => {
    setInputValue(selectedSave.split("/").pop().split(".")[0]);
  }, [selectedSave]);

  useEffect(() => {
    if (showConfig) {
      setPrevScrollY(window.scrollY); // Save current scroll position
      window.scrollTo({ top: 350, behavior: "smooth" });
    } else {
      window.scrollTo({ top: prevScrollY, behavior: "smooth" });
    }
  }, [showConfig]);

  const handleRename = async () => {
    if (selectedSave.split("/").pop().split(".")[0] === inputValue) return;
    console.log(inputValue, selectedSave);
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
      window.alert("failed to rename");
      console.error("Rename error:", error);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete: ${inputValue}`
    );

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
      `/play?rom=${encodeURIComponent(selectedRom?.rom)}&save_state=${selectedSave !== "new" ? encodeURIComponent(selectedSave) : encodeURIComponent()}`
    );
  };

  return (
    <div
      className={`
        absolute t-0 l-0 inset-0 flex justify-center items-center transition-opacity duration-300
        ${!showConfig ? "opacity-0 pointer-events-none" : "opacity-100 z-50"}
      `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg rounded-lg transition-opacity"
        onClick={() => setSelectedRom(null)}
      />

      {/* Pop-up Panel */}
      <div
        className={`
          fixed top-12 w-[100%] md:w-[65%] max-w-2xl p-6
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
            h-full w-full border-2 shadow-md rounded-lg border-black
            flex flex-col justify-center
            ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
          `}
        >
          {/* Image across the top */}
          <div
            className={`w-full flex justify-center max-h-[450px] overflow-hidden`}
          >
            <img
              src={selectedRom?.image}
              alt={selectedRom?.name}
              className={`w-screen h-auto ${animating && "animate-[glowBorderTop_4s_infinite_alternate]"}`}
            />
          </div>

          {/* Title under the image */}
          <h2
            className={`text-center text-white text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 rounded-md border-2`}
          >
            {selectedRom?.name}
          </h2>

          {/* Save options section */}
          {selectedRom?.config?.save && selectedRom.config.save.length > 0 && (
            <div
              className={`md:mb-6 p-4 ${animating && "md:animate-[softGlow_4s_infinite_alternate]"}`}
            >
              <h3 className="text-white text-lg mb-2">Select Save:</h3>
              <div className="grid gap-2 mb-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Default option: New Game */}
                {selectedRom.config.save.length < 16 && (
                  <div className="relative flex h-16 items-center gap-2">
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
                  </div>
                )}

                {/* Render a button for each save state */}
                {selectedRom?.config?.save?.map((state, index) => {
                  let saveName = state.split("/").pop().split(".")[0];
                  return (
                    <div
                      key={index}
                      className="relative flex h-16 items-center gap-2"
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
          <div className="flex m-auto mb-6 border-2 border-transparent focus-within:border-blue-500 rounded-lg">
            <input
              value={inputValue === "new" ? randomName : inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`h-10 flex-1 bg-gray-500 p-2 rounded-l-lg focus:outline-none`}
            />
            <button
              onClick={() => setRandomName(generateRandomName())}
              className="h-10 px-4 bg-gray-500 rounded-r-lg flex items-center justify-center"
            >
              <svg
                fill="#ffffff"
                height="24"
                width="24"
                viewBox="-97.28 -97.28 706.56 706.56"
                stroke="#ffffff"
                strokeWidth="2"
              >
                <g id="SVGRepo_iconCarrier">
                  <path d="M512,104.931l-92.326-12.599l-12.633,92.334l34.629-26.307c15.775,29.965,24.092,63.481,24.092,97.64 c0,115.662-94.098,209.76-209.76,209.76v43.399c139.592,0,253.159-113.567,253.159-253.159c0-43.636-11.247-86.421-32.539-124.193 L512,104.931z"></path>
                  <path d="M2.841,256.001c0,43.634,11.247,86.421,32.539,124.191L0,407.069l92.326,12.599l12.633-92.332L70.332,353.64 c-15.775-29.967-24.093-63.479-24.093-97.638C46.24,140.339,140.338,46.241,256,46.241V2.842 C116.408,2.842,2.841,116.409,2.841,256.001z"></path>
                </g>
              </svg>{" "}
            </button>
          </div>

          {/* Play button at the bottom */}
          <div className="px-6 mb-4 mx-2 w-[90%] flex justify-center overflow-hidden gap-2">
            <button
              className="px-4 py-2 sm:px-3 sm:py-1 lg:px-8 lg:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm sm:text-xs lg:text-lg"
              onClick={handlePlay}
            >
              {selectedRom?.config?.save?.length === 0 ? "New Game" : "Play"}
            </button>
            <button
              className={`transition-opacity duration-500 ${
                selectedRom?.config?.save?.length === 0 ||
                selectedSave === "new"
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              } px-4 py-2 sm:px-3 sm:py-1 lg:px-8 lg:py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm sm:text-xs lg:text-lg`}
              onClick={handleRename}
            >
              Rename
            </button>
            <button
              className={`transition-opacity duration-500 ${
                selectedRom?.config?.save?.length === 0 ||
                selectedSave === "new"
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              } px-4 py-2 sm:px-3 sm:py-1 lg:px-8 lg:py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm sm:text-xs lg:text-lg`}
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
