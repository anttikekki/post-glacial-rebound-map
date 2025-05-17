# Post-glacial rebound map data calculations

Scripts in this folder downloads open map data and calculates land upplift sea levels for multiple dates in history.

## Process

1. Download [elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m) from [National land survey of Finland (NLS)](https://www.maanmittauslaitos.fi/en). Licence is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en). Read more info from [01_download-nls-elevation-model-2m/README.md](./01_download-nls-elevation-model-2m/README.md).
2. Calculate historical land upplift with one of the upplift models for selected years:
   - V1: simple linear uplift speed model based on [NKG2016LU](https://www.lantmateriet.se/sv/geodata/gps-geodesi-och-swepos/Referenssystem/Landhojning/) land upplift model. Read more info from [02_post-glacial-rebound-calculation-V1//README.md](./02_post-glacial-rebound-calculation-V1/README.md).
   - V2: advanced [Glacial Land Adjustment Regenerator (Glare)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4992429) model by [Aki Hakonen](https://oulu.academia.edu/AkiHakonen). Read more info from [02_post-glacial-rebound-calculation-V2//README.md](./02_post-glacial-rebound-calculation-V2/README.md).
3. Generate sea level map data base on step 2 data. Read more info from [04_sea-level-mask-calculation/README.md](./04_sea-level-mask-calculation/README.md).
4. Generate sea level [Cloud Optimized GeoTIFF](https://cogeo.org/) as final map distribution format. Read more info from [06_generate-map-distribution/README.md](./06_generate-map-distribution/README.md). Result map data is in [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) projection, that is commonly used in Finland.

## Requirements

1. Operating systen that can run [Bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) scripts. Linux and MacOS by default but Windows requires [Windows Subsystem for Linux (WSL)](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux).
2. Internet connection. Scripts use [cURL](https://en.wikipedia.org/wiki/CURL) and [rsync](https://en.wikipedia.org/wiki/Rsync) to download open map data.
3. Following CLI tools installed:
   - [Geospatial Data Abstraction Library (GDAL)](https://en.wikipedia.org/wiki/GDAL). All versions are probably ok but tested only on v3.10.x.
   - [jq](<https://en.wikipedia.org/wiki/Jq_(programming_language)>). All versions are probably ok.
   - [Node.js](https://en.wikipedia.org/wiki/Node.js) (only for V1 model). All versions are probably ok but tested only on v22.
   - [cURL](https://en.wikipedia.org/wiki/CURL) and [rsync](https://en.wikipedia.org/wiki/Rsync) are already included in all common Linux and MacOS versions.
4. Quite a lot of free disk space:
   - About 80 GB for NLS elevation model
   - About 60 GB per calculation model per year for the temporary and result files
5. Time :). Single model takes close to 1 hour per selected year to process on MacBook Pro M1 Max. Full model with 16 different years takes about 12 hours. Both models take about 24 hours.

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
# Model V1: simple linear upplift model
./run-all-V1.sh

# Model V2: advanced GLARE upplift model
./run-all-V2.sh
```

Result files are in `./06_generate-map-distribution/result_cog` folder.
