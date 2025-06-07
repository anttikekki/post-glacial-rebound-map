const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2); // skip 'node' and script path
const sourceVersion = args[0];
console.log("Source version:", sourceVersion);

if (sourceVersion !== "V1" && sourceVersion !== "V2") {
  console.error(
    `Invalid source version: ${sourceVersion}. Only V1 and V2 are supported.`
  );
  process.exit(1);
}

const resultsDir = path.join(__dirname, "results", sourceVersion);

function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

fs.readdirSync(resultsDir)
  .filter((file) => file.endsWith(".json"))
  .forEach((file) => {
    const filePath = path.join(resultsDir, file);
    console.log(`Processing deltas for: ${filePath}`);

    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(raw);

      if (!Array.isArray(json.data)) {
        console.warn(`  Skipping: "data" is not an array.`);
        return;
      }

      // Strip existing deltas and sort by year
      const sortedData = json.data
        .map((entry) => {
          const { delta, ...cleaned } = entry;
          return cleaned;
        })
        .sort((a, b) => a.year - b.year);

      const updatedData = sortedData.map((entry, index, arr) => {
        if (index === 0) {
          return { ...entry, delta: null };
        }

        const prev = arr[index - 1];
        const currElev = entry.elevation;
        const prevElev = prev.elevation;

        if (isValidNumber(currElev) && isValidNumber(prevElev)) {
          const delta = parseFloat((currElev - prevElev).toFixed(4));
          return { ...entry, delta };
        } else {
          return { ...entry, delta: null };
        }
      });

      const updated = {
        ...json,
        data: updatedData,
      };

      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log(`  Updated with deltas: ${file}`);
    } catch (err) {
      console.error(`  ERROR processing ${file}:`, err.message);
    }
  });

console.log("Delta calculation complete.");
