"use client";

import React, { useState, useEffect, useRef } from "react";
import notFound from "../app/404.png"; // Adjust path as needed
import { useLoading } from "@/contexts/LoadingContext";

const UploadComponent = () => {
  const { animating, setAnimating } = useLoading();
  const [platforms, setPlatforms] = useState({});
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const socketRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost";
  const API_PORT = process.env.NEXT_PUBLIC_PORT || "3000";
  const Socket_SSL_String =
    process.env.NEXT_PUBLIC_SSL === "1" ? "wss://" : "ws://";

  useEffect(() => {
    fetch(`/api/games`)
      .then((res) => res.json())
      .then((data) => {
        setPlatforms(data);
        setAnimating(true);
      })
      .catch((error) =>
        console.error("Error fetching platforms from server:", error)
      );
  }, [API_BASE_URL]);

  // Handle file selection; ensure only ZIP files are accepted.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".zip")) {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert("Please select a valid ZIP file.");
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedPlatform) return alert("Please select a platform.");
    if (!file) return alert("Please select a ZIP file.");

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Prevent multiple WebSocket instances
    if (
      !socketRef.current ||
      (socketRef.current.readyState !== WebSocket.OPEN &&
        socketRef.current.readyState !== WebSocket.CONNECTING)
    ) {
      socketRef.current = new WebSocket(
        `${Socket_SSL_String}${API_BASE_URL}:${API_PORT}`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsUploading(true);
        setUploadStatus("Uploading... 0%");
        sendChunk(0);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          console.error("Upload error:", data.error);
          setUploadStatus("Upload failed.");
          socketRef.current.close();
          return;
        }

        if (data.log) {
          console.log("[WS Log]", data.log);
        }

        if (data.status === "progress") {
          const percentComplete = Math.round(
            ((data.chunkIndex + 1) / totalChunks) * 100
          );
          setUploadStatus(`Uploading... ${percentComplete}%`);
          sendChunk(data.chunkIndex + 1);
        } else if (data.status === "completed") {
          setUploadStatus("Upload complete! Processing in background.");
          setIsUploading(false);
          socketRef.current.close();
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setUploadStatus("WebSocket connection failed.");
      };

      socketRef.current.onclose = (event) => {
        console.log(
          "WebSocket closed",
          "Code:",
          event.code,
          "Reason:",
          event.reason
        );
        socketRef.current = null; // Reset the WebSocket reference
      };
    }

    const   sendChunk = (chunkIndex) => {
      if (chunkIndex >= totalChunks) return;

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const reader = new FileReader();
      reader.readAsArrayBuffer(chunk);
      reader.onload = () => {
        const chunkData = new Uint8Array(reader.result);

        socketRef?.current?.send(
          JSON.stringify({
            chunk: Array.from(chunkData),
            filename: file.name,
            chunkIndex,
            totalChunks,
            password,
            platform: selectedPlatform,
          })
        );
      };
    };
  };

  return (
    <div
      className={`
        m-auto my-8 w-[50%] 
        bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
        text-white mt-1 p-4 rounded-2xl 
        border border-transparent 
        backdrop-blur-lg backdrop-saturate-150
        ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
      `}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Upload ZIP File</h2>

      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 h-full w-full border-2 p-10 shadow-md rounded-lg border-black">
        <p className="mb-4 text-center">
          Select a platform to upload your ROM ZIP file into:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {platforms.length === 0 && (
            <div className="col-span-full text-center">
              No platforms available.
            </div>
          )}

          {Object.keys(platforms).map((platform, idx) => {
            let imgUrl = platforms?.[platform]?.image;
            return(
            <div
              key={idx}
              className={`cursor-pointer border rounded-lg p-2 hover:shadow-lg border-2 
                ${selectedPlatform === platform ? "border-white" : "border-transparent"}`}
              onClick={() => setSelectedPlatform(platform)}
            >
              <img
                src={notFound}
                alt={imgUrl}
                className="w-full h-20 object-cover rounded-md mb-2"
              />
              <p className="text-center">{platform}</p>
            </div>
          )})}
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="zipFile" className="mb-1 font-semibold">
              Select ZIP File:
            </label>
            <input
              type="file"
              id="zipFile"
              accept=".zip"
              onChange={handleFileChange}
              className="bg-gray-700 p-2 rounded border-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 font-semibold">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 p-2 rounded border-2"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all shadow-md"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {uploadStatus && <p className="mt-4 text-center">{uploadStatus}</p>}
    </div>
  );
};

export default UploadComponent;
