import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSV_FOLDER = path.join(__dirname, "calculation_results", "csv");
const JSON_OUTPUT_FOLDER = path.join(__dirname, "calculation_results", "json");
const COORDS_FILE = path.join(__dirname, "coordinates.json");

async function main() {
  try {
    // --- Sanity checks ---
    await fs.mkdir(JSON_OUTPUT_FOLDER, { recursive: true });
    const coordsExists = await fileExists(COORDS_FILE);
    if (!coordsExists) {
      console.error(`Missing coordinates.json file at ${COORDS_FILE}`);
      process.exit(1);
    }

    // --- Load metadata ---
    const coordsRaw = await fs.readFile(COORDS_FILE, "utf8");
    const coordinates = JSON.parse(coordsRaw);

    // --- Process each CSV file ---
    const csvFiles = await getCsvFiles(CSV_FOLDER);

    for (const csvPath of csvFiles) {
      const city = path.basename(csvPath, ".csv");
      const jsonOut = path.join(JSON_OUTPUT_FOLDER, `${city}.json`);

      // Lookup metadata
      const meta = coordinates.find(
        (c) => c.name.toLowerCase() === city.toLowerCase()
      );

      if (!meta) {
        console.warn(
          `Warning: No metadata found for city '${city}' in coordinates.json. Skipping.`
        );
        continue;
      }

      // Parse CSV and build data array
      const csvText = await fs.readFile(csvPath, "utf8");
      const lines = csvText
        .trim()
        .split(/\r?\n/)
        .filter((l) => l.length > 0);

      const dataRows = lines
        .slice(1) // skip header
        .map((line) => {
          const [yearStr, landLevelStr, meltBp] = line
            .split(",")
            .map((s) => s.trim());
          return {
            year: Number(yearStr),
            elevation: Number(landLevelStr),
            meltBp: Number(meltBp),
          };
        })
        .filter((r) => !isNaN(r.year) && !isNaN(r.elevation));

      if (dataRows.length === 0) {
        console.warn(`Warning: No data rows found in ${csvPath}`);
        continue;
      }

      // Year when the glacier was melted on this city coordinate
      const meltCe = 1950 - dataRows[0].meltBp;
      const dataRowAfterMeltCe = dataRows.filter((row) => row.year >= meltCe);

      // Compute delta10BC values
      const firstElevation = dataRowAfterMeltCe[0].elevation;
      const data = dataRowAfterMeltCe.map((row, i) => {
        if (i === 0) return { ...row, delta10BC: null };
        const delta10BC = Number((row.elevation - firstElevation).toFixed(10));
        return { ...row, delta10BC };
      });

      // Assemble final JSON
      const json = {
        name: meta.name,
        x: meta.x,
        y: meta.y,
        mapSheet: meta.mapSheet,
        meltCe,
        data,
      };

      await fs.writeFile(jsonOut, JSON.stringify(json, null, 2));
    }

    console.log("All CSVs exported to JSON.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

// --- Helper functions ---
async function getCsvFiles(folder) {
  const entries = await fs.readdir(folder, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory()) return getCsvFiles(fullPath);
      else if (entry.isFile() && entry.name.endsWith(".csv")) return fullPath;
      else return [];
    })
  );
  return files.flat();
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run the script
main();
