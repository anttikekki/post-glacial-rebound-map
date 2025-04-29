import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rangeParser from "range-parser";

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static files folder
const COG_DIR = path.join(
  __dirname,
  "../../map-data-processing/06_generate-map-distribution/result_cog/"
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/V1/:year/:filename", (req, res) => {
  const filePath = path.join(COG_DIR, req.params.year, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    return res.status(400).send("No range");
  }

  const ranges = rangeParser(stat.size, range);

  if (ranges === -1) {
    // Invalid range
    return res.status(416).send("Requested range not satisfiable");
  }
  if (ranges === -2) {
    // Malformed header
    return res.status(400).send("Malformed Range header");
  }

  const { start, end } = ranges[0]; // assume a single range (most common)

  const chunkSize = end - start + 1;
  const file = fs.createReadStream(filePath, { start, end });

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "image/tiff",
  });

  file.pipe(res);
});

const port = 3000;
app.listen(port, () => {
  console.log(`COG Dev Server running at http://localhost:${port}`);
  console.log(`Serving COGs from: ${COG_DIR}`);
});
