
import fs from "fs";
import {Response, Request} from "express";

interface FileObj {
  fileName: string;
  fileSize: number;
  fileModifiedTime: number; 
  realname: string;
}


const GetFiles = (req:Request, res:Response) => {
  let resObjArr:FileObj[] = [];
  fs.readdir('./tmp/resource', (err, files) => {

    files.forEach(file => {
      let obj:FileObj = {
        fileName: '',
        fileSize: 0,
        fileModifiedTime: 0,
        realname: ''
      };
      let stats = fs.statSync("./tmp/resource/" + file)
      //  filenameMap.set(file, encodeFilename(file))
      let fileSizeInBytes = stats.size;
      let fileModifiedTime = new Date(stats.mtime).getTime();

      let realname = file;

      obj['fileName'] = file;
      obj['fileSize'] = fileSizeInBytes;
      obj['fileModifiedTime'] = fileModifiedTime;
      obj['realname'] = realname

      resObjArr.push(obj);
    });

    res.send(JSON.stringify(resObjArr))
  });

}

export default GetFiles;