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
  // The base directory — safe root
  const baseDir = path.resolve(process.cwd());

  // Requested relative path
  let requestedDir = req.query.currentDir as string | undefined;
  if (!requestedDir) requestedDir = "./";

  // Resolve it safely
  const resolvedPath = path.resolve(baseDir, requestedDir);

  // Security check: must be inside baseDir
  if (!resolvedPath.startsWith(baseDir)) {
    console.warn(`Blocked attempt to access outside: ${resolvedPath}`);
    res.set("parentdir", "true");
    res.send(JSON.stringify([]));
    return;
  }

  // Extra: if resolved path IS baseDir, set parentdir true
  if (resolvedPath === baseDir) {
    res.set("parentdir", "true");
  } else {
    res.set("parentdir", "false");
  }

  const resObjArr: FileObj[] = [];

  fs.readdir(resolvedPath, { withFileTypes: true }, (err, files) => {
    if (err || !files || files.length === 0) {
      res.send(JSON.stringify([]));
      return;
    }

    files.forEach(file => {
      const fullPath = path.join(resolvedPath, file.name);
      const stats = fs.statSync(fullPath);

      const obj: FileObj = {
        fileName: file.name,
        fileSize: file.isDirectory() ? 0 : stats.size,
        fileModifiedTime: new Date(stats.mtime).getTime(),
        realname: file.name,
        isDir: file.isDirectory()
      };

      resObjArr.push(obj);
    });

    res.send(JSON.stringify(resObjArr));
  });
};

export default GetFiles;
