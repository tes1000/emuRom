// UploadComponent.jsx
"use client";

import React, { useState, useEffect } from "react";
import notFound from "../app/404.png"; // Adjust path as needed
import { useLoading } from "@/contexts/LoadingContext";

const UploadComponent = () => {
  const { animating, setAnimating } = useLoading();
  // State for the list of platforms (folders) fetched from the server.
  const [platforms, setPlatforms] = useState([]);
  // State for the platform selected by the user.
  const [selectedPlatform, setSelectedPlatform] = useState("");
  // State for the ZIP file chosen by the user.
  const [file, setFile] = useState(null);
  // State for the password field.
  const [password, setPassword] = useState("");
  // States for upload progress/messages.
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Change this to match your API URL environment variable.
  const API_SSL_URL = Number(process.env.NEXT_PUBLIC_SSL)
    ? "https://"
    : "http://";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost";
  const API_PORT = process.env.NEXT_PUBLIC_PORT ?? 3000;

  // Fetch the available platforms (directories in your data folder)
  // from your server. The endpoint should return a JSON array.
  useEffect(() => {
    fetch(`${API_SSL_URL + API_BASE_URL}:${API_PORT}/api/games`)
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

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!selectedPlatform) {
      alert("Please select a platform.");
      return;
    }
    if (!file) {
      alert("Please select a ZIP file to upload.");
      return;
    }

    // Create FormData so we can send the file, password and target path.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    // The server endpoint expects the target path under the "path" field.
    formData.append("path", selectedPlatform);

    setIsUploading(true);
    setUploadStatus("Uploading...");

    try {
      const response = await fetch(`http://${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setUploadStatus("Upload error: " + error.message);
    }
    setIsUploading(false);
  };

  return (
    <div
      className={`
        m-auto
        my-8
        w-[50%] 
        bg-gradient-to-r from-cyan-500 via-purple-800 to-blue-900 
        text-white mt-1 p-4 rounded-2xl 
        border border-transparent 
        backdrop-blur-lg backdrop-saturate-150
        ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}
      `}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Upload ZIP File</h2>

      {/*innerPanel*/}
      <div
        className={`bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 h-full w-full border-2 p-10 shadow-md rounded-lg border-black ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}`}
      >
        <p className="mb-4 text-center">
          Select a platform to upload your ROM ZIP file into:
        </p>
        {/* Platforms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {platforms.length === 0 && (
            <div className="col-span-full text-center">
              No platforms available.
            </div>
          )}
          {Object.keys(platforms).map((platform, idx) => {
            // If your API returns simple strings instead of objects,
            // then platform will be the folder name.
            console.log("data", platform, idx);
            const platformName =
              typeof platform === "string"
                ? platform
                : platforms?.[platform]?.name;
            const platformImage = platforms?.[platform]?.image || notFound.src;

            return (
              <div
                key={idx}
                className={`
                cursor-pointer border rounded-lg p-2 hover:shadow-lg border-2 border-black
                ${selectedPlatform === platformName ? "border-white" : "border-transparent"}
                ${animating && selectedPlatform === platformName && "animate-[glowBorder_4s_infinite_alternate]"}
              `}
              onClick={() => {
  if (selectedPlatform === platformName) {
    setSelectedPlatform(null);
  } else {
    setAnimating(false);
    setSelectedPlatform(platformName);
    // Optionally, delay turning animation back on slightly:
    setTimeout(() => {
      setAnimating(true);
    }, 0);
  }
}}

              >
                <img
                  src={platformImage}
                  alt={`${platformName} image`}
                  className={`w-full h-20 object-cover rounded-md mb-2`}
                />
                <p className="text-center">{platformName}</p>
              </div>
            );
          })}
        </div>
        {/* Upload Form */}
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
              className={`bg-gray-700 p-2 rounded border-2 border-black ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}`}
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
              className={`bg-gray-700 p-2 rounded  border-2 border-black ${animating && "animate-[glowWithBorder_4s_infinite_alternate]"}`}
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="
            px-4 py-2 
            bg-gradient-to-r from-blue-600 to-blue-500 
            rounded-lg 
            text-white 
            hover:from-blue-700 hover:to-blue-600 
            transition-all duration-200 
            shadow-md
          "
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
