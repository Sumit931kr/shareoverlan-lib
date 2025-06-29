import mv from 'mv';
import path from "path";
import fs from "fs";
import { Request, Response } from "express";

// Define safe project root
const baseDir = path.resolve(process.cwd());

const handleError = (err: any, res: Response) => {
  console.log("File upload error:", err);
  res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const UploadHandle = (req: Request, res: Response) => {

  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Get current dir from query
  const currentDirQuery = req.query.currentdir || "./";
  if (typeof currentDirQuery !== "string") {
    res.status(400).send("Missing or invalid 'currentdir' query");
    return;
  }

  const resolvedDir = path.resolve(baseDir, currentDirQuery);

  // Check that it stays inside baseDir
  if (!resolvedDir.startsWith(baseDir)) {
    console.warn(`Blocked attempt to upload outside baseDir: ${resolvedDir}`);
    res.status(403).send("Forbidden");
    return;
  }

  // Ensure target dir exists
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }

  const tempPath = req.file.path;
  const originalname = req.file.originalname;
  const targetPath = path.join(resolvedDir, originalname);


  mv(tempPath, targetPath, { mkdirp: true }, (err: any) => {
    if (err) return handleError(err, res);

    res.status(200).json({ message: "File uploaded!" });
  });
};

export default UploadHandle;
