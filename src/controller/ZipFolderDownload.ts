import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import archiver from "archiver";

const DownloadFolder = (req: Request, res: Response) => {
  const baseDir = path.resolve(process.cwd());

  const folderQuery = req.query.name;
  const currentDirQuery = req.query.currentdir || "./";

  if (typeof folderQuery !== "string") {
    res.status(400).send("Missing or invalid 'name' query parameter");
    return;
  }

  if (typeof currentDirQuery !== "string") {
    res.status(400).send("Missing or invalid 'currentdir' query parameter");
    return;
  }

  // Normalize and resolve safely
  const safeCurrentDir = path.normalize(currentDirQuery);
  const resolvedFolderPath = path.resolve(baseDir, safeCurrentDir, folderQuery);

  // Security check: must stay inside baseDir
  if (!resolvedFolderPath.startsWith(baseDir)) {
    console.warn(`Blocked folder download attempt outside baseDir: ${resolvedFolderPath}`);
    res.status(403).send("Forbidden");
    return;
  }

  // Confirm the folder exists
  if (!fs.existsSync(resolvedFolderPath) || !fs.statSync(resolvedFolderPath).isDirectory()) {
    res.status(404).send("Folder not found");
    return;
  }

  // Name the zip file
  const zipName = `${folderQuery}.zip`;

  res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.on("error", (err) => {
    console.error(err);
    res.status(500).send("Error creating archive");
  });

  // Pipe archive data to response
  archive.pipe(res);

  // Add the folder contents to the archive
  archive.directory(resolvedFolderPath, false);

  // Finalize the archive
  archive.finalize();
};

export default DownloadFolder;
