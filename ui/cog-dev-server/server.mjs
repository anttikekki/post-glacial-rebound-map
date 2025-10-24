import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rangeParser from "range-parser";

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files folders
const SEA_COG_DIR = path.join(
  __dirname,
  "../../map-data-processing/06_generate-map-distribution/result_cog/"
);
const ICE_COG_DIR = path.join(
  __dirname,
  "../../map-data-processing/02_post-glacial-rebound-calculation/03_ice_mask_calculation/result_cog/"
);

const createGeoTIFFEndpoint = (dir) => (req, res) => {
  const filePath = path.join(dir, `${req.params.year}.tif`);

  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} not found`);
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    console.error(`No range`);
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

  const { start, end } = ranges[0]; // assume a single range

  const chunkSize = end - start + 1;
  const file = fs.createReadStream(filePath, { start, end });

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "image/tiff",
  });

  file.pipe(res);
};

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use((req, res, next) => {
  console.info(`Request`, req.method, req.url, "Range", req.headers.range);
  next();
});

app.get("/api/v2/ice/:year", createGeoTIFFEndpoint(ICE_COG_DIR));
app.get("/api/v2/:year", createGeoTIFFEndpoint(SEA_COG_DIR));

const port = 3000;
app.listen(port, () => {
  console.log(`COG Dev Server running at http://localhost:${port}`);
  console.log(`Serving COGs from: ${SEA_COG_DIR}`);
  console.log(`Serving COGs from: ${ICE_COG_DIR}`);
});
