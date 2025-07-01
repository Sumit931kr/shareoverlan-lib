import fs from "fs";
import { Response, Request } from "express";
import path from "path";

interface FileObj {
  fileName: string;
  fileSize: number;
  fileModifiedTime: number;
  realname: string;
  isDir: boolean;
}

const GetFiles = (req: Request, res: Response) => {
  const baseDir = path.resolve(process.cwd());
  let requestedDir = req.query.currentDir as string | undefined;
  if (!requestedDir) requestedDir = "./";
  const resolvedPath = path.resolve(baseDir, requestedDir);

  if (!resolvedPath.startsWith(baseDir)) {
    console.warn(`Blocked attempt to access outside: ${resolvedPath}`);
    res.set("parentdir", "true");
    res.send(JSON.stringify([]));
    return;
  }

  if (resolvedPath === baseDir) {
    res.set("parentdir", "true");
  } else {
    res.set("parentdir", "false");
  }

  const resObjArr: FileObj[] = [];

  fs.readdir(resolvedPath, { withFileTypes: true }, async (err, files) => {
    if (err || !files || files.length === 0) {
      if (err) {
        console.error(`Error reading directory ${resolvedPath}:`, err);
      }
      res.send(JSON.stringify([]));
      return;
    }

    // Use Promise.all to handle async stats safely
    const fileStatsPromises = files.map(file => {
      return new Promise<FileObj | null>((resolve) => {
        const fullPath = path.join(resolvedPath, file.name);

        fs.stat(fullPath, (err, stats) => {
          if (err) {
            // Locked, permission denied, etc. → skip it
            console.warn(`Could not stat ${fullPath}: ${err.code}`);
            resolve(null);
            return;
          }

          const obj: FileObj = {
            fileName: file.name,
            fileSize: file.isDirectory() ? 0 : stats.size,
            fileModifiedTime: new Date(stats.mtime).getTime(),
            realname: file.name,
            isDir: file.isDirectory()
          };

          resolve(obj);
        });
      });
    });

    const results = await Promise.all(fileStatsPromises);
    const safeFiles = results.filter((f): f is FileObj => f !== null);

    res.send(JSON.stringify(safeFiles));
  });
};

export default GetFiles;
