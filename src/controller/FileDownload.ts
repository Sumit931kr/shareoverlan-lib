
import path from "path";
import fs from "fs";
import {Response, Request} from "express";

const FileDownload = (req:Request, res: Response) => {

  let { name } = req.query;
  if(req.originalUrl.includes('&')){
    let arr = req.originalUrl.split('=')
    arr.shift()
    name = decodeURIComponent(arr.join(''))
  }
  const targetPath = path.join(__dirname + name);

  try {
    const stats = fs.statSync(targetPath);
    const fileSize = stats.size;

    let realname = name;

    res.setHeader('Content-Disposition', `attachment; filename="${realname}"`);
    res.setHeader('Content-Length', fileSize);

    const fileStream = fs.createReadStream(targetPath);

    // Pipe the file stream to the response object
    fileStream.pipe(res);

    // Optional: Handle errors
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).send('Internal Server Error');
    });

    res.status(200);

  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
}

export default FileDownload