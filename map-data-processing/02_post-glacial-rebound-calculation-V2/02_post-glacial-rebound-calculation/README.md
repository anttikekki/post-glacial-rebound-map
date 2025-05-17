# Calculate land uplith with Glare model

Calculates land elevastion level for all years in [/common/mapLayerYears.json](../../common/mapLayerYears.json) file with Glacial Land Adjustment Regenerator (Glare) model. Currently in contains following years (negative years are BC, positive AD):

```
-6000, -5500, -5000, -4500, -4000, -3500, -3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500
```

## Step 1: [01_align-GLARE-base-raster.sh](./01_align-GLARE-base-raster.sh)

Aligns Glare `Base-raster-tm35fin.tif` with NLS elevation model map sheet division. The script loops through all elevation model map sheet main levels that are downloaded in [01_download-nls-elevation-model-2m](../../01_download-nls-elevation-model-2m/README.md) phase (T4, L2 etc.).

The `Base-raster-tm35fin.tif` and NLS elevation model are in same [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) projection but they include vastly different geographical are: Glare base raster contain the whole northern Europe but single NLS map sheet covers only small part of Finland. The Glare base raster must be cropped to include only the data that covers geographically same are in map.

The `Base-raster-tm35fin.tif` and NLS elevation model resolution is also very different: single pixel in Glare base raster GeoTIFF file spans 0.5 km × 0.5 km area in map but single pixel NLS elevation model spans only 2 m × 2 m. A lot of pixels in NLS elevation model are included in one Glare base raster GeoTIFF pixel.

The script uses [gdalwarp](https://gdal.org/en/stable/programs/gdalwarp.html) to crop `Base-raster-tm35fin.tif`. Result files per NLS map sheet are in `/.aligned_GLARE_base_rasters` folder.

## Step 2: [02_run_glare_model.sh](./02_run_glare_model.sh)

Calculates land uplift with Glare model. Glare formula (from [land-uplift-recons](https://github.com/Hakonaki/land-uplift-recons) reposity):

```
"User_DTM@1" - ((2 / 3.14159 * ("Base Raster@1" * 0.077) * (
  ATAN("Base Raster@2" / (5 * ("Base Raster@1" * 0.077) + 590)) -
  ATAN(("Base Raster@2" -1950 + [yearCE]) / (5 * ("Base Raster@1" * 0.077) + 590))
)) +
((("Base Raster@3" * 0.075) * ((2020 - [yearCE]) / 100)) -
(0.5 * (-0.011 * (("Base Raster@3" * 0.075) * ((2020 - [yearCE]) / 100) ^ 2)))))
- [sea-level ref]
```

- `User_DTM@1`: Digital Terrain Models (DTM) that contains elevation model. [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m) is used in these scripts. GeoTIFF data band 1 must be land elevation in meters.
- `Base Raster`: "Base Raster.tiff" with three data bands (@1, @2, @3) from [GLARE materials](https://drive.google.com/drive/folders/184nPIZuX83gr3Yd6tVBGXCkpUysNY-CO) in Google Drive.
- `yearCE`: simulated year. Use negative years for BC, for example -4000 is 4000 BC.
- `2020`: recerence year of `User_DTM@1`. National land survey of Finland (NLS) elevation model is from 2023.
- `sea-level ref`: Baltic sea level at `yearCE` from `Toolbox/sea-level-baltic.tif` file from [GLARE materials](https://drive.google.com/drive/folders/184nPIZuX83gr3Yd6tVBGXCkpUysNY-CO) in Google Drive.

### Baltic sea historical sea levels

`sea-level ref` is a lookout table for Baltic sea level for target year. The file resolution is 17500 x 20 pixels. It stores sea level values in X axis. Coordinate symbols the target year. File X coordinates span from -15000 to 2500. These are the years that are supported in the Glare model. For example sea level data for year 4000 BC is in coordinate x = -4000, y = 0. Values in file span from -80.0 to 6.0.

### Results

Script uses [gdal_calc](https://gdal.org/en/stable/programs/gdal_calc.html) to do the calculation per pixel. Result GeoTIFF files go to `./calculation_results` folder to a subfolder by the target year. Land elevation in target year is stored in GeoTIFF data band 1 as meters from 2023 sea level. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
