import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import multer from "multer";
import extract from "extract-zip";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SSL = Number(process.env.NEXT_PUBLIC_SSL) ? "https://" : "http://";
const DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost"
const DATA_DIR = path.join(import.meta.dir, "data");
const FRONTEND_BUILD = path.join(import.meta.dir, "out");
const EMULATOR_JS = path.join(import.meta.dir, "EmulatorJs")

app.use(cors({ origin: '*' }));
app.use(express.static("public"));
app.use("/data", express.static(DATA_DIR));
app.use(express.static(FRONTEND_BUILD));

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

// Improved directory scanner
const getGamesData = (dir) => {
  try {
    const platforms = {};

    if (!fs.existsSync(dir)) {
      throw new Error(`Data directory not found: ${dir}`);
    }

    fs.readdirSync(dir).forEach((platform) => {
      if (platform.trim().toLowerCase() === "uploads") return;

      const platformPath = path.join(dir, platform);
      if (!fs.statSync(platformPath).isDirectory()) return;
      const games = fs.readdirSync(platformPath)
        .filter(game => fs.statSync(path.join(platformPath, game)).isDirectory())
        .map(game => {
          const gamePath = path.join(platformPath, game);
          return {
            name: game,
            image: findImage(gamePath),
            data: fs.existsSync(path.join(gamePath, "data")) 
              ? `/data/${platform}/${game}/data` 
              : null,
            rom: findRom(gamePath)
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

//handle upload
const upload = multer({ dest: "data/uploads" });
//upload api
app.post("/upload", upload.single("file"), async (req, res) => {
  const { password, path: targetPath } = req.body;
  // Verify that targetPath is a valid string and does not include null bytes.
  if (typeof targetPath !== "string" || targetPath.includes("\0")) {
    return res.status(400).json({ error: "Invalid target path" });
  }
  // Normalize the target path to remove redundant separators and resolve '..' segments.
  const normalizedTargetPath = path.normalize(targetPath);
  // Reject absolute paths or any path that starts with '..'
  if (path.isAbsolute(normalizedTargetPath) || normalizedTargetPath.startsWith("..")) {
    return res.status(400).json({ error: "Invalid target path" });
  }
  // Compute the destination directory (e.g. /data/{normalizedTargetPath})
  const destinationDir = path.join(DATA_DIR, normalizedTargetPath);
  // Double-check that destinationDir is indeed inside DATA_DIR
  const resolvedDestinationDir = path.resolve(destinationDir);
  if (!resolvedDestinationDir.startsWith(DATA_DIR + path.sep)) {
    return res.status(400).json({ error: "Invalid target path" });
  }
  // Verify the password before proceeding.
  const storedHash = process.env.UPLOAD_PASSWORD_HASH;
  const passwordValid = await bcrypt.compare(password, storedHash);
  if (!passwordValid) {
    // Delete the uploaded file to avoid leaving temporary files behind.
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    return res.status(403).json({ error: "Invalid password" });
  }
  // Ensure a file was uploaded.
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Optionally, check the original file name for null bytes.
  if (req.file.originalname && req.file.originalname.includes("\0")) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file with invalid name:", err);
    });
    return res.status(400).json({ error: "Invalid file name" });
  }
  // Check that the uploaded file has a .zip extension.
  if (path.extname(req.file.originalname).toLowerCase() !== ".zip") {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting non-zip file:", err);
    });
    return res.status(400).json({ error: "Uploaded file is not a .zip file" });
  }
  // Ensure the destination directory exists; create it if necessary.
  try {
    fs.mkdirSync(destinationDir, { recursive: true });
  } catch (err) {
    console.error("Error creating destination directory:", err);
    return res.status(500).json({ error: "Error creating destination directory" });
  }
  try {
    // Extract the ZIP file into the destination directory.
    await extract(req.file.path, { dir: destinationDir });
    // Delete the uploaded ZIP file after extraction.
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting ZIP file:", err);
    });
    return res.status(200).json({
      message: "File uploaded, extracted, and cleaned up successfully",
    });
  } catch (err) {
    console.error("Error extracting ZIP file:", err);
    return res.status(500).json({
      error: "Error extracting ZIP file",
      details: err.message,
    });
  }
});


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
app.listen(PORT, () => {
  console.log(`Server running at ${SSL + DOMAIN}:${PORT}`);
  console.log(`Serving data from: ${DATA_DIR}`);
  console.log(`Serving frontend from: ${FRONTEND_BUILD}`);
}).on('error', (err) => {
  console.error(`Server failed to start: ${err.message}`);
  process.exit(1);
});
