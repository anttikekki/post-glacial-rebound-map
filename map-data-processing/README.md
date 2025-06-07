# Post-glacial rebound map data calculations

Scripts in this folder downloads open map data and calculates land uplift sea levels for multiple dates in history.

**These scripts and land uplift calculations are an hobby project and can contain major errors and mismisinterpretations in the land uplift calculation logic or in the source map data processing!**

## Process

1. [Download National land survey of Finland (NLS) elevation model 2m x 2m](./01_download-nls-elevation-model-2m/README.md).
2. Calculate historical land uplift with one of the uplift models for selected years:
   - [V1: simple linear uplift rate model based on NKG2016LU](./02_post-glacial-rebound-calculation-V1/README.md).
   - [V2: advanced Glacial Land Adjustment Regenerator (Glare) model v2.2](./02_post-glacial-rebound-calculation-V2/README.md).
3. [Generate sea level map data base on step 2 data](./04_sea-level-mask-calculation/README.md).
4. [Generate sea level Cloud Optimized GeoTIFF as final map distribution format](./06_generate-map-distribution/README.md).

### Optional steps

- [Raster generation](./05_generate-colorized-sea-raster/): by default the end result is GeoTIFF with mask data in data band 1 (Land = 0, Sea = 1, Glacial = 3) without visible raster. This optional step provides way to generate GeoTIFF raster file with predefined colors.
- [Statistics](./07_statistics/): calculate statistics of land uplift speed per 250 years.

### Result

Result map data is in [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) projection, that is commonly used in Finland.

Result files are in following folders:

- Elevation model altered by land upplift calculation:
  - [V1](./02_post-glacial-rebound-calculation-V1/02_post-glacial-rebound-calculation/result_cog)
  - [V2](./02_post-glacial-rebound-calculation-V2/02_post-glacial-rebound-calculation/result_cog)
- Cloud Optimized GeoTIFF:
  - [V1](./06_generate-map-distribution/result_cog/V1/)
  - [V2](./06_generate-map-distribution/result_cog/V2/)

## Requirements

1. Operating systen that can run [Bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) scripts. Linux and MacOS by default but Windows requires [Windows Subsystem for Linux (WSL)](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux).
2. Internet connection. Scripts use [cURL](https://en.wikipedia.org/wiki/CURL) and [rsync](https://en.wikipedia.org/wiki/Rsync) to download open map data.
3. Following CLI tools installed:
   - [Geospatial Data Abstraction Library (GDAL)](https://en.wikipedia.org/wiki/GDAL). All versions are probably ok but tested only on v3.10.x.
   - [jq](<https://en.wikipedia.org/wiki/Jq_(programming_language)>). All versions are probably ok.
   - [Node.js](https://en.wikipedia.org/wiki/Node.js). All versions are probably ok but tested only on v22.
   - [cURL](https://en.wikipedia.org/wiki/CURL) and [rsync](https://en.wikipedia.org/wiki/Rsync) are already included in all common Linux and MacOS versions.
4. Quite a lot of free disk space:
   - About 230 GB for NLS elevation model
   - About 200 GB per calculation model per year for the temporary and result files. For example model with 20 target years require 4000 GB disk space.
5. Time :). Single model takes more than 2 hour per selected year to process on MacBook Pro M1 Max. Full model with 20 different years takes about 40 hours.

### Required CLI tools installation

MacOS with [Homebrew](https://brew.sh/):

```bash
brew install gdal
brew install jq
brew install node
```

Linux:

```bash
sudo apt install -y gdal-bin
sudo apt install -y jq
sudo apt install -y nodejs npm
```

## Commands

Execute all the scripts by single command:

```bash
#########################################
# Model V1: simple linear uplift model
#########################################

# Calculate land upplift for all years defined in common/mapLayerYearsModelV1.json
./run-all-V1.sh

# Calculate land upplift for specific years (minus values are BC)
./run-all-V1.sh -5000 -7000 1500

#########################################
# Model V2: advanced GLARE uplift model
#########################################

# Calculate land upplift for all years defined in common/mapLayerYearsModelV2.json
./run-all-V2.sh

# Calculate land upplift for specific years (minus values are BC)
./run-all-V2.sh -5000 -7000 1500
```
