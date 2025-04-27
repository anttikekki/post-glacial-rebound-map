import fs from "node:fs";

// === CONFIGURATION ===
const INPUT_CSV = "NKG2016LU_lev.csv";
const METADATA_FILE = "grid_metadata.txt";

// === READ FULL CSV FILE ===
const content = fs.readFileSync(INPUT_CSV, "utf8");
const lines = content.trim().split(/\r?\n/);

// === PREPARE VARIABLES ===
const longitudes = new Set();
const latitudes = new Set();
let minLon = Infinity,
  maxLon = -Infinity;
let minLat = Infinity,
  maxLat = -Infinity;

// === PARSE LINES ===
for (let i = 1; i < lines.length; i++) {
  // skip header
  const [lonStr, latStr, valueStr] = lines[i].trim().split(",");
  if (!lonStr || !latStr) continue; // skip broken lines

  const lon = parseFloat(lonStr);
  const lat = parseFloat(latStr);

  if (!isNaN(lon) && !isNaN(lat)) {
    longitudes.add(lon);
    latitudes.add(lat);
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
}

// === WRITE METADATA FILE ===
const metadata =
  `
TXE_MIN=${minLon}
TXE_MAX=${maxLon}
TYE_MIN=${minLat}
TYE_MAX=${maxLat}
OUTSIZE_X=${longitudes.size}
OUTSIZE_Y=${latitudes.size}
`.trim() + "\n";

fs.writeFileSync(METADATA_FILE, metadata);
console.log(`Metadata written to ${METADATA_FILE}`);
