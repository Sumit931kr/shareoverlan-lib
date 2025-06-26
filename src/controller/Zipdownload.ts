
import path from "path";
import fs from "fs";
import archiver from "archiver";

const zipName = ():string =>
  new Date(Date.now() + 19800000).toISOString().slice(0, -5) + ".zip";

const ZipDownload = async (req: any, res: any) => {
  try {
    let { names } = req.query;

    if (req.originalUrl.includes("&")) {
      const arr = req.originalUrl.split("=");
      arr.shift();
      names = decodeURIComponent(arr.join(""));
    }

    if (!names || typeof names !== "string") {
      return res.status(400).json({ error: "Invalid 'names' query parameter" });
    }

    const files: string[] = JSON.parse(names); // ✅ safe now

    const zipFileName = zipName();
    res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error(err);
      res.status(500).send({ error: "Error creating the zip file" });
    });

    for (const file of files) {
      const targetPath = path.join(__dirname, file);
      if (fs.existsSync(targetPath)) {
        archive.file(targetPath, { name: file });
      }
    }

    archive.pipe(res);
    archive.finalize();

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

export default ZipDownload;
