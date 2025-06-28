import mv from 'mv';
import path from "path";
import { Request, Response } from "express";
import { currentPath } from "../index";


// Determine the appropriate directory for file uploads
const resourceDir = currentPath;
  

const handleError = (err:any, res:Response) => {
  console.log("file upload error");
  console.log(err);
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const UploadHandle = (req:Request, res:Response) => {
  if(!req.file) {
    res.sendStatus(400).send("No file uploaded.");
    return;
  }
  const tempPath = req.file.path;
  let originalname = req.file.originalname;
  const targetPath = path.join(resourceDir, originalname);

  mv(tempPath, targetPath, { mkdirp: true }, ((err:any) => {
    if (err) return handleError(err, res);
    res
      .status(200)
      .contentType("text/plain")
      .json("File uploaded!");
  }));


};

export default UploadHandle;
