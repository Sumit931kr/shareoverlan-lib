
import path from "path";
import multer from "multer";


// Determine the appropriate directory for file uploads
const resourceDir = path.join(__dirname, "..");


// Custom storage to preserve original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourceDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});

const upload = multer({ storage });

// Middleware
const SingleUpload = upload.single("file");

// Route handler
const handleSingleUpload = (req:any, res:any) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const originalname = req.file.originalname;

  res.send(`File uploaded successfully: ${originalname}`);
};


export { SingleUpload, handleSingleUpload };
