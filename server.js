import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import extract from "extract-zip";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 30044;
const SSL = Number(process.env.NEXT_PUBLIC_SSL) ? "https://" : "http://";
const DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost"
const DATA_DIR = process.env.DATA_PATH
  ? path.join(__dirname, process.env.DATA_PATH)
  : path.join(__dirname, "data");
const FRONTEND_BUILD = path.join(import.meta.dir, "out");
const EMULATOR_JS = path.join(import.meta.dir, "EmulatorJs")

app.use(cors({ origin: '*' }));
app.use(express.static("public"));
app.use("/data", express.static(DATA_DIR));
app.use(express.static(FRONTEND_BUILD));
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const CHUNKS_DIR = path.join(DATA_DIR, "chunks");

// Ensure chunk directory exists
fs.mkdirSync(CHUNKS_DIR, { recursive: true });


// Function to find the first image in a directory
const findImage = (dir) => {
  if (!fs.existsSync(dir)) return null;
  
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (imageExtensions.includes(path.extname(file).toLowerCase())) {
      return `/data/${path.relative(DATA_DIR, path.join(dir, file)).replace(/\\/g, "/")}`;
    }
  }
  return null;
};

// Modified findRom function to return URL path instead of filesystem path
function findRom(gamePath) {
  const romFolderPath = path.join(gamePath, "rom");

  if (fs.existsSync(romFolderPath)) {
    const files = fs.readdirSync(romFolderPath);
    
    if (files.length === 1) {
      const romFile = files[0];
      // Get relative path from DATA_DIR to the ROM file
      const relativePath = path.relative(DATA_DIR, path.join(romFolderPath, romFile));
      // Convert to URL-friendly path
      return `/data/${relativePath.replace(/\\/g, "/")}`;
    }
  }
  return null;
}

function findConfig(gamePath) {
  const controllerDataPath = path.join(gamePath, "config/controls");
  const saveDataPath = path.join(gamePath, "config/save_data");

  fs.mkdirSync(controllerDataPath, { recursive: true });
  fs.mkdirSync(saveDataPath, { recursive: true });

  // Read and map the file names in the controls directory to their full paths.
  const controlsFiles = fs.readdirSync(controllerDataPath)
    .filter(file => fs.statSync(path.join(controllerDataPath, file)).isFile())
    .map(file => path.join(controllerDataPath, file).replace(/^\/app/, ''));
  
  // Read and map the file names in the save_data directory to their full paths.
  const saveFiles = fs.readdirSync(saveDataPath)
    .filter(file => fs.statSync(path.join(saveDataPath, file)).isFile())
    .map(file => path.join(saveDataPath, file).replace(/^\/app/, ''));
  
  return { controls: controlsFiles, save: saveFiles };
}

// Improved directory scanner
const getGamesData = (dir) => {
  try {
    const platforms = {};

    if (!fs.existsSync(dir)) {
      throw new Error(`Data directory not found: ${dir}`);
    }

    fs.readdirSync(dir).forEach((platform) => {
      if (platform.trim().toLowerCase() === "uploads" || platform.trim().toLowerCase() === "chunks") return;

      const platformPath = path.join(dir, platform); //i.e path to Collection
      if (!fs.statSync(platformPath).isDirectory()) return;
      const games = fs.readdirSync(platformPath)
        .filter(game => fs.statSync(path.join(platformPath, game)).isDirectory())
        .map(game => { //For each game within collection
          const gamePath = path.join(platformPath, game); //path to game
          return {//Final response data
            name: game,
            image: findImage(gamePath),
            data: fs.existsSync(path.join(gamePath, "data")) 
              ? `/data/${platform}/${game}/data` 
              : null,
            rom: findRom(gamePath),
            config: findConfig(gamePath)
          };
        });

      platforms[platform] = {
        name: platform,
        image: findImage(platformPath),
        games: games
      };
    });

    return platforms;
  } catch (err) {
    console.error(`Directory scan error: ${err.message}`);
    throw err;
  }
};

// API endpoint
app.get("/api/games", (req, res) => {
  try {
    const gamesData = getGamesData(DATA_DIR);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(gamesData);
  } catch (err) {
    console.error(`API Error: ${err.message}`);
    res.status(500).json({ 
      error: "Failed to retrieve games",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// app.post("/api/save", upload.single("state"), async (req, res) => {
//   try {
//     let { rom_url, save_state } = req.body;
//     if (!rom_url || !save_state || !req.file) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Decode URL components
//     rom_url = decodeURIComponent(rom_url);
//     rom_url = path.join("/app", rom_url)
//     save_state = decodeURIComponent(save_state);

//     // Paths for security checks
//     const tromPath = path.resolve(DATA_DIR, rom_url);
//     if (!tromPath.startsWith(DATA_DIR)) {
//       return res.status(403).json({ error: "Forbidden: Invalid ROM path" });
//     }

//     const tempFilePath = req.file.path; // The uploaded file's temporary path

//     // Immediately respond with 200 OK
//     res.status(200).json({ success: true, message: "File uploaded. Processing in background." });

//     // === Async Processing ===
//     (async () => {
//       try {
//         const tsavePath = path.resolve(DATA_DIR, save_state);
//         const savePath = path.join("/app", tsavePath);

//         let finalSavePath = savePath;

//         // Check if the file exists, otherwise determine an alternative path
//         try {
//           await fs.access(savePath);
//         } catch (accessErr) {
//           const romDir = path.dirname(tromPath);
//           const baseDir = path.join(romDir, "../config/save_data");
//           const saveFileName = path.basename(save_state).replace(/\./g, "") + ".state";
//           finalSavePath = path.resolve(baseDir, saveFileName);
//         }

//         // Ensure final path is secure
//         if (!finalSavePath.startsWith(DATA_DIR)) {
//           console.error("Forbidden: Invalid save path:", finalSavePath);
//           return;
//         }

//         // Move the file to the final destination
//         await fs.rename(tempFilePath, finalSavePath);

//         console.log("File moved to:", finalSavePath);
//       } catch (moveError) {
//         console.error("Error processing file:", moveError);
//       }
//     })();

//   } catch (error) {
//     console.error("Save error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

app.post("/api/rename", (req, res) => {
  const { selectedRom, newName } = req.body;

  if (!selectedRom || !newName) {
    return res.status(400).json({ error: "Missing selectedRom or newName" });
  }

  // Resolve absolute paths
  const toldPath = path.resolve(DATA_DIR, decodeURIComponent(selectedRom));
  const oldPath = path.join("/app"+toldPath)
  const tnewName = decodeURIComponent(newName); // assuming newName might be URL-encoded

  // Extract the directory from oldPath and the last segment from newName:
  const directory = path.dirname(oldPath);
  const newFileName = path.basename(tnewName+".state");
  
  // Combine them to form newPath:
  const newPath = path.join(directory, newFileName);

  // Prevent path traversal
  if (!newPath.startsWith(DATA_DIR) || !oldPath.startsWith(DATA_DIR)) {
    return res.status(403).json({ error: "Forbidden: Invalid path:: "+newPath+oldPath});
  }

  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error("Rename error:", err);
      return res.status(500).json({ error: "Rename failed", details: err.message });
    }
    res.json({ success: true, message: `Renamed to ${newName}` });
  });
});


app.post("/api/delete", (req, res) => {
  const { rom } = req.body;

  if (!rom) {
    return res.status(400).json({ error: "Missing file path" });
  }

  // Resolve absolute path
  const tfilePath = path.resolve(DATA_DIR, decodeURIComponent(rom));
  const filePath = path.join("/app", tfilePath)
  
  // Prevent path traversal
  if (!filePath.startsWith(DATA_DIR)) {
    return res.status(403).json({ error: "Forbidden: Invalid path "+ filePath});
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Delete failed", details: err.message });
    }
    res.json({ success: true, message: "File deleted successfully" });
  });
});



// Serve EmulatorJS assets under /emulatorjs path
app.use("/emulatorjs", express.static(EMULATOR_JS, {
  setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
      }
      if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
      }
  }
}));

// Corrected play route
app.get("/play", (req, res) => {
  const romUrl = req.query.rom;
  
  if (!romUrl) {
    return res.status(400).send("Missing ROM parameter");
  }

  // Verify the ROM path exists
  const romPath = path.join(DATA_DIR, romUrl.replace('/data/', ''));
  if (!fs.existsSync(romPath)) {
    return res.status(404).send("ROM not found");
  }

  // Serve the EmulatorJS interface with the ROM parameter
  res.sendFile(path.join(EMULATOR_JS, "index.html"));
});

// SPA history fallback
app.get("*", (req, res) => {
  console.log(FRONTEND_BUILD)
  res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
});

// Server startup
const server = app.listen(PORT, () => {
  console.log(`Server running at ${SSL + DOMAIN}:${PORT}`);
  console.log(`Serving data from: ${DATA_DIR}`);
  console.log(`Serving frontend from: ${FRONTEND_BUILD}`);
}).on('error', (err) => {
  console.error(`Server failed to start: ${err.message}`);
  process.exit(1);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

//uploadwebsocket
wss.on("connection", (ws) => {
  function sendLog(message) {
    ws.send(JSON.stringify({ log: message }));
  }

  sendLog("Client connected");

  let isAuthenticated = false;
  let verifiedPasswordHash = process.env.UPLOAD_PASSWORD_HASH; // Store hashed password from .env

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    const { chunk, filename, chunkIndex, totalChunks, password } = data;

    // ✅ Step 1: Validate password **only for the first chunk**
    if (chunkIndex === 0 && !isAuthenticated) {
      try {
        const passwordValid = await bcrypt.compare(password, verifiedPasswordHash);
        if (!passwordValid) {
          sendLog("Invalid password attempt");
          ws.send(JSON.stringify({ error: "Invalid password" }));
          ws.close();
          return;
        }
        isAuthenticated = true; // Mark as authenticated
        sendLog("Password verified. Uploading...");
      } catch (error) {
        sendLog(`Password validation error: ${error.message}`);
        ws.send(JSON.stringify({ error: "Authentication error" }));
        return;
      }
    }

    if (!chunk || !filename || chunkIndex === undefined || !totalChunks) {
      sendLog("Invalid upload data received");
      return ws.send(JSON.stringify({ error: "Invalid upload data" }));
    }

    const chunkPath = path.join(CHUNKS_DIR, `${filename}.part${chunkIndex}`);

    try {
      // Convert base64 chunk to buffer and write it to file
      const buffer = Buffer.from(chunk, "base64");
      fs.writeFileSync(chunkPath, buffer);

      sendLog(`Chunk ${chunkIndex + 1}/${totalChunks} received for ${filename}`);

      // ✅ If last chunk, merge all parts
      if (chunkIndex === totalChunks - 1) {
        const finalFilePath = path.join(DATA_DIR, filename);
        const writeStream = fs.createWriteStream(finalFilePath);

        for (let i = 0; i < totalChunks; i++) {
          const chunkFilePath = path.join(CHUNKS_DIR, `${filename}.part${i}`);
          if (fs.existsSync(chunkFilePath)) {
            const chunkData = fs.readFileSync(chunkFilePath);
            writeStream.write(chunkData);
            fs.unlinkSync(chunkFilePath); // Delete chunk after merging
          }
        }

        writeStream.end();
        sendLog(`File merged successfully: ${finalFilePath}`);
        ws.send(JSON.stringify({ status: "completed", filename }));
      } else {
        ws.send(JSON.stringify({ status: "progress", chunkIndex }));
      }
    } catch (error) {
      sendLog(`Upload error: ${error.message}`);
      ws.send(JSON.stringify({ error: "Upload failed" }));
    }
  });

    // Send a ping every 30 seconds to keep the connection alive
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 10000);

  ws.on("close", () => {
    sendLog("Client disconnected");
    clearInterval(interval);
  });
});
