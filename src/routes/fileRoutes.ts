import express from "express";
import multer from "multer";

// Controllers
import GetFiles from "../controller/GetFiles";
import ViewFile from "../controller/ViewFile";
import DeleteFile from "../controller/DeleteFile";
import FileDownload from "../controller/FileDownload";
import ZipDownload from "../controller/Zipdownload";
import UploadHandle from "../controller/UploadHandle";
import ZipFolderDownload from "../controller/ZipFolderDownload";
import { SingleUpload, handleSingleUpload } from "../controller/SimpleUpload";



const router = express.Router();

const upload = multer({ 
  dest: "./",
});

router.get("/getfiles", GetFiles);
router.get("/filedownload", FileDownload);
router.get("/zipdownload", ZipDownload);

router.delete("/deletefile", DeleteFile);
router.post("/upload", upload.single("file"), UploadHandle);
router.post("/simpleupload",SingleUpload, handleSingleUpload);
router.get("/zipfolderdownload", ZipFolderDownload);

// working on this one
router.get("/viewfile", ViewFile);

export default router;
