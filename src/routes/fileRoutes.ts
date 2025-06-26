import express from "express";
import multer from "multer";

// Controllers
import Access from "../controller/Access.js";
import GetFiles from "../controller/GetFiles.js";
import ViewFile from "../controller/ViewFile.js";
import DeleteFile from "../controller/DeleteFile.js";
import FileDownload from "../controller/FileDownload.js";
import ZipDownload from "../controller/Zipdownload.js";
import UploadHandle from "../controller/UploadHandle.js";
import { SingleUpload, handleSingleUpload } from "../controller/SimpleUpload.js";



const router = express.Router();

const upload = multer({
  dest: "./temporary/resource",
});

router.get("/getfiles", GetFiles);
router.get("/filedownload", FileDownload);
router.get("/zipdownload", ZipDownload);
router.get("/access", Access);

router.delete("/deletefile", DeleteFile);
router.post("/upload", upload.single("file"), UploadHandle);
router.post("/simpleupload",SingleUpload, handleSingleUpload);

// working on this one
router.get("/viewfile", ViewFile);

export default router;
