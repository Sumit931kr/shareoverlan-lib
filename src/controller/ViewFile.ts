import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const ViewFile = (req: Request, res: Response) => {
  // Safe root
  const baseDir = path.resolve(process.cwd());

  let { name, isvideo, currentdir } = req.query;

  // Validate required params
  if (typeof name !== 'string' || name.trim() === '') {
    res.status(400).send("Missing or invalid 'name' query parameter");
    return;
  }

  if (typeof currentdir !== 'string' || currentdir.trim() === '') {
    currentdir = './';
  }

  if (typeof isvideo !== 'string') {
    isvideo = 'false'; // fallback
  }

  // Resolve and normalize
  const safeCurrentDir = path.normalize(currentdir);
  const resolvedPath = path.resolve(baseDir, safeCurrentDir, name);

  // Security check: must stay inside baseDir
  if (!resolvedPath.startsWith(baseDir)) {
    console.warn(`Blocked file view attempt outside baseDir: ${resolvedPath}`);
    res.status(403).send("Forbidden");
    return;
  }

  // Confirm file exists
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    res.status(404).send("File not found");
    return;
  }

  // Serve normal files
  if (isvideo === 'false') {
    res.sendFile(resolvedPath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error serving file");
      }
    });
    return;
  }

  // Serve video streaming
  if (isvideo === 'true') {
    try {
      const stat = fs.statSync(resolvedPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          res.status(416).send("Requested range not satisfiable");
          return;
        }

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(resolvedPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(resolvedPath).pipe(res);
      }
    } catch (err) {
      console.error("Video stream error:", err);
      res.status(500).send("Error streaming video");
    }
  } else {
    res.status(400).send("Invalid 'isVideo' parameter");
  }
};

export default ViewFile;
