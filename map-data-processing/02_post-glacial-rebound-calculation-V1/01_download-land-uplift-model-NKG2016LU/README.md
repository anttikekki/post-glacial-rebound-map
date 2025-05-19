# Download and preprocess NKG2016LU land uplift model

The scripts downloads [NKG2016LU](https://www.lantmateriet.se/sv/geodata/gps-geodesi-och-swepos/Referenssystem/Landhojning/) from Swedish goverment [Lantmäteriet](https://www.lantmateriet.se/sv/) organization and processes it to GeoTIFF file that is in finnish [`EPSG:3067`](https://epsg.io/3067-1149) projection.

# Licence

NKG2016LU licence is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en).

## Step 1: [01_download_nkg2016lu_model.sh](./01_download_nkg2016lu_model.sh)

Download [nkg2016lu-with-readme.zip](https://www.lantmateriet.se/contentassets/58490c18f7b042e5aa4c38075c9d3af5/nkg2016lu-with-readme.zip) and unzip it.

The zip file contains multiple variations of NKG2016LU model:

- NKG2016LU_abs: Absolute land uplift in ITRF2008 (i.e. relative to the Earth’s centre of mass).
- NKG2016LU_lev: Levelled land uplift, i.e. uplift relative to the geoid.

This V1 model uses `NKG2016LU_lev` model. I don't realy understand the difference of these two or that is there really a difference in this use case.

## Step 2: [02_convert_grid_to_csv.mjs](./02_convert_grid_to_csv.mjs)

Convert `nkg2016lu/NKG2016LU_lev.gri` to CSV. Distribution format of the NKG2016LU model is Gravsoft grid (`.gri`):

- First Line: Bounding box (Latitudes and Longitudes)
  - Data: `49.00000000   75.00000000    0.00000000   50.00000000`
  - Result:
    - Latitude from 49° to 75°
    - Longitude from 0° to 50°
- Second Line: Grid Spacing
  - Data: `0.083333333300 0.166666666700`
  - Result:
    - Latitude steps of ~5 arcminutes (0.083333 degrees)
    - Longitude steps of ~10 arcminutes (0.166667 degrees)
- Following Lines: Grid Values
  - Example data: `-3.3583    -3.3609    -3.3673    -3.3761    -3.3856    -3.3946    -3.4015    -3.4064`
  - Content is a long list of values of land uplift rate in millimeters in a year.
  - Stored row-by-row, from north to south.
  - Each row lists values west to east (left to right).
  - No X, Y coordinates given per value — these must be calculated using Lat/Lon origin + spacing.

The grid is quite coarse: single grid value covers about 9 km × 5-12 km are in map.

The result CSV file `NKG2016LU_lev.csv` contains data in easier to use `Latitude, Longitude, Value` format.

## Step 3: [03_extract_grid_metadata_from_csv.mjs](./03_extract_grid_metadata_from_csv.mjs)

Extracts following info from `NKG2016LU_lev.csv`:

- Minimum latitude
- Maximum latitude
- Minimun longitude
- Maximum longitude
- X resolution: how many different longitude values are there
- Y resolution: how many different latitude values are there

This info is exported to `grid_metadata.txt` file and it is used in following step to create raster from this CSV.

## Step 4: [04_process_grid_to_raster.sh](./04_process_grid_to_raster.sh)

Create raster file from NKG2016LU data CSV file `NKG2016LU_lev.csv` from previous steps. Input data projection is [EPSG:4326](https://epsg.io/4326) (WGS84): it used degrees as unit.

The script uses [gdal_grid](https://gdal.org/en/stable/programs/gdal_grid.html) to convert CSV to GeoTIFF. CSV metadata from previous step (`grid_metadata.txt`) is used in gdal_grid.

Result file is `NKG2016LU_lev.tif` GeoTIFF file with land uplift speed in millimeters in a year as data band 1. Result file projection is [EPSG:4326](https://epsg.io/4326) (WGS84).

## Step 5: [05_reproject_to_tm35fin.sh](./05_reproject_to_tm35fin.sh)

Reprojects `NKG2016LU_lev.tif` from [EPSG:4326](https://epsg.io/4326) (WGS84) to [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) that is used in [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m).

Result file is `NKG2016LU_lev_tm35fin.tif`.

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
