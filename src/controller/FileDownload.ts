import { Request, Response } from "express";
import path from "path";
import fs from "fs";

const DownloadFile = (req: Request, res: Response) => {
  // Define the safe root directory (project root)
  const baseDir = path.resolve(process.cwd());

  const nameQuery = req.query.name;

  if (typeof nameQuery !== 'string') {
    res.status(400).send("Missing or invalid 'name' query parameter");
    return;
  }

  const filename: string = nameQuery; // ✅ Now it's guaranteed to be a string

  const currentDir = req.query.currentdir as string | undefined || './'; // Default to current directory if not provided

  if (!filename) {
    res.status(400).send("Missing or invalid 'name' query parameter");
  }

  if (!currentDir) {
    res.status(400).send("Missing 'currentdir' query parameter");
    return;
  }

  // Normalize and resolve the requested path
  const safeCurrentDir = path.normalize(currentDir);
  const resolvedPath = path.resolve(baseDir, safeCurrentDir, filename);

  // Security: ensure resolved path is still inside baseDir
  if (!resolvedPath.startsWith(baseDir)) {
    console.warn(`Blocked download attempt outside baseDir: ${resolvedPath}`);
    res.status(403).send("Forbidden");
    return;
  }

  // Optional: check if file actually exists before sending
  fs.access(resolvedPath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error(`File not accessible: ${resolvedPath}`);
      res.status(404).send("File not found");
      return;
    }

    // Send file for download
    res.download(resolvedPath, filename, { dotfiles: "allow" }, (downloadErr) => {
      if (downloadErr) {
        if (res.headersSent) {
          console.error(`Client aborted the request:`, downloadErr);
        } else {
          console.error(`Download error:`, downloadErr);
          res.status(500).send("Error downloading file");
        }
      }
    });
  });
};

export default DownloadFile;
