# Model V1: simple linear uplift speed

This model (V1) provides simplified and naive uplift model where uplift is expected to have been same in every year in history thatn what it is today. This does NOT provide reliable result on long timespans but it is easy to implement and to understand. [NKG2016LU](https://www.lantmateriet.se/sv/geodata/gps-geodesi-och-swepos/Referenssystem/Landhojning/) land upplift model is used to alter height of the [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m), that is downloaded in previous step of the processing.

Read more abot the NKG2016LU model from presentation: [NKG2016LU, an improved postglacial land uplift model over the
Nordic-Baltic region, 2016](https://www.lantmateriet.se/contentassets/58490c18f7b042e5aa4c38075c9d3af5/presentation-av-nkg2016lu.pdf) (pdf).

## Source data

[01_download-nls-elevation-model-2m/](./../01_download-nls-elevation-model-2m/).

## Script1: [01_download-land-uplift-model-NKG2016LU/run_all.sh](./01_download-land-uplift-model-NKG2016LU/run_all.sh)

Script downloads [NKG2016LU](https://www.lantmateriet.se/sv/geodata/gps-geodesi-och-swepos/Referenssystem/Landhojning/) from Swedish goverment [Lantmäteriet](https://www.lantmateriet.se/sv/) organization and processes it to GeoTIFF file that is in finnish [`EPSG:3067`](https://epsg.io/3067-1149) projection.

### Step 1: [01_download_nkg2016lu_model.sh](./01_download-land-uplift-model-NKG2016LU/01_download_nkg2016lu_model.sh)

Download [nkg2016lu-with-readme.zip](https://www.lantmateriet.se/contentassets/58490c18f7b042e5aa4c38075c9d3af5/nkg2016lu-with-readme.zip) amd unzip it.

The zip file contains multiple variations of NKG2016LU model:

- NKG2016LU_abs: Absolute land uplift in ITRF2008 (i.e. relative to the Earth’s centre of mass).
- NKG2016LU_lev: Levelled land uplift, i.e. uplift relative to the geoid.

This V1 model uses `NKG2016LU_lev` model. I don't realy understand the difference of these two or that is there really a difference in this use case.

### Step 2: [02_convert_grid_to_csv.mjs](./01_download-land-uplift-model-NKG2016LU/02_convert_grid_to_csv.mjs)

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
  - Content is a long list of values of land uplift speed in millimeters in a year.
  - Stored row-by-row, from north to south.
  - Each row lists values west to east (left to right).
  - No X, Y coordinates given per value — these must be calculated using Lat/Lon origin + spacing.

The grid is quite coarse: single grid value covers about 9 km × 5-12 km are in map.

The result CSV file `NKG2016LU_lev.csv` contains data in easier to use `Latitude, Longitude, Value` format.

### Step 3: [03_extract_grid_metadata_from_csv.mjs](./01_download-land-uplift-model-NKG2016LU/03_extract_grid_metadata_from_csv.mjs)

Extracts following info from `NKG2016LU_lev.csv`:

- Minimum latitude
- Maximum latitude
- Minimun longitude
- Maximum longitude
- X resolution: how many different longitude values are there
- Y resolution: how many different latitude values are there

This info is exported to `grid_metadata.txt` file and it is used in following step to create raster from this CSV.

### Step 4: [04_process_grid_to_raster.sh](./01_download-land-uplift-model-NKG2016LU//04_process_grid_to_raster.sh)

Create raster file from NKG2016LU data CSV file `NKG2016LU_lev.csv` from previous steps. Input data projection is [EPSG:4326](https://epsg.io/4326) (WGS84): it used degrees as unit.

The script uses [gdal_grid](https://gdal.org/en/stable/programs/gdal_grid.html) to convert CSV to GeoTIFF. CSV metadata from previous step (`grid_metadata.txt`) is used in gdal_grid.

Result file is `NKG2016LU_lev.tif` GeoTIFF file with land uplift speed in millimeters in a year as data band 1. Result file projection is [EPSG:4326](https://epsg.io/4326) (WGS84).

### Step 5: [05_reproject_to_tm35fin.sh](./01_download-land-uplift-model-NKG2016LU/05_reproject_to_tm35fin.sh)

Reprojects `NKG2016LU_lev.tif` from [EPSG:4326](https://epsg.io/4326) (WGS84) to [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) that is used in [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m).

Result file is `NKG2016LU_lev_tm35fin.tif`.

## Script 2: [02_post-glacial-rebound-calculation/run_all.sh](./02_post-glacial-rebound-calculation/run_all.sh)

Calculates land elevastion level for all years in [/common/mapLayerYears.json](../../common/mapLayerYears.json) file. Currently in contains following years (negative ears are BC, positive AD):

```
-6000, -5500, -5000, -4500, -4000, -3500, -3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500
```

### Step 1: [01_align_NKG2016LU.sh](./02_post-glacial-rebound-calculation/01_align_NKG2016LU.sh)

Aligns `NKG2016LU_lev_tm35fin.tif` with NLS elevation model map sheet division. The script loops through all elevation model map map sheet main levels that are downloaded in [01_download-nls-elevation-model-2m](../01_download-nls-elevation-model-2m/README.md) step (T4, L2 etc.).

The `NKG2016LU_lev_tm35fin.tif` and NLS elevation model are in same [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) projection but they include vastly different geographical are: NKG2016LU contain the whole northern Europe but single NLS map sheet covers only small part of Finland. The NKG2016LU must be must be cropped to include only the data that covers geographically same are in map.

The `NKG2016LU_lev_tm35fin.tif` and NLS elevation model resolution is also very different: single pixel in NKG2016LU GeoTIFF file spans 9 km × 5-12 km are in map but single pixel NLS elevation model spans only 2 m × 2 m. A lot of pixels in NLS elevation model are included in one NKG2016LU GeoTIFF pixel.

The script uses [gdalwarp](https://gdal.org/en/stable/programs/gdalwarp.html) to crop `NKG2016LU_lev_tm35fin.tif`. Result files per NLS map sheet are in `aligned_NKG2016LU_rasters` folder.

### Step 2: [02_apply_height_change.sh](./02_post-glacial-rebound-calculation/02_apply_height_change.sh)

Calculates land uplift with following parameters:

- Current land heigth from [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m).
- Land upplift per year from NKG2016LU model (`NKG2016LU_lev_tm35fin.tif`).
- Target year that's elevation level we want calculate. For example -4000 is 4000 BC, 6025 years back from current year.

Formula:

```
Land elevation in 2023 (m) + ((Land upplift per year (mm) * Target year) / 1000.0)
```

#### Example

Calculate one 2 m × 2 m pixel land elevation in year 4000 BC. It is 6023 years from year 2023 (NLS elevation model creation year). Land uplift in this spot is 6.5 millimeters in year. Land elevation in 2023 is 1.5 meters above sea level.

```
1.5 + (6.5 * -6023 / 1000.0) =
1.5 + (-39149,5 / 1000.0) =
1.5 + -39,1495 =
-37,6495
```

**Result**: 2 m × 2 m pixel land elevation in 4000 BC below current 2023 sea level.

Uses [gdal_calc](https://gdal.org/en/stable/programs/gdal_calc.html) to do the calculation. Result GeoTIFF files go to `./02_post-glacial-rebound-calculation/calculation_results` folder to a subfolder by the target year. GeoTIFF files land height in target year is stored in data band 1 as meters from 2023 sea level. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
