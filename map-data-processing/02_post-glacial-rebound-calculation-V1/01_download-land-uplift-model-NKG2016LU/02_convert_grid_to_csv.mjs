import fs from "node:fs";

// === CONFIGURATION ===
const inputFile = "nkg2016lu/NKG2016LU_lev.gri"; // Your input .gri file
const outputFile = "NKG2016LU_lev.csv"; // Output CSV file
const nodataValue = 9999; // NoData indicator

// === READ THE .gri FILE ===
const lines = fs
  .readFileSync(inputFile, "utf-8")
  .split(/\r?\n/)
  .filter(Boolean); // Remove empty lines

// === PARSE HEADER ===
const [lat1, lat2, lon1, lon2] = lines[0].trim().split(/\s+/).map(Number);
const [dlat, dlon] = lines[1].trim().split(/\s+/).map(Number);

// Prepare direction: N->S or S->N?
const latStart = Math.max(lat1, lat2);
const latEnd = Math.min(lat1, lat2);

// === COMPUTE GRID ===
const nrows = Math.round((latStart - latEnd) / dlat) + 1;
const ncols = Math.round((lon2 - lon1) / dlon) + 1;

console.log(`Detected grid size: ${ncols} cols x ${nrows} rows`);

// === PROCESS GRID DATA ===
const values = lines
  .slice(2)
  .flatMap((line) => line.trim().split(/\s+/).map(Number));

// === WRITE CSV ===
const output = fs.createWriteStream(outputFile);
output.write("Longitude,Latitude,Value\n"); // CSV header

let index = 0;
for (let row = 0; row < nrows; row++) {
  const lat = latStart - row * dlat;
  for (let col = 0; col < ncols; col++) {
    const lon = lon1 + col * dlon;
    const val = values[index++];
    if (val !== nodataValue) {
      output.write(`${lon},${lat},${val}\n`);
    }
  }
}

output.end();
console.log(`Conversion completed: ${outputFile}`);
