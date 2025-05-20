# Linear land uplift rate calculation

Calculates linear land elevastion level for all years in [/common/mapLayerYearsModelV1.json](../../../common/mapLayerYearsModelV1.json) file. Currently in contains following years (negative years are BC, positive AD):

```
-6000, -5500, -5000, -4500, -4000, -3500, -3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500
```

## Step 1: [01_align_NKG2016LU.sh](./01_align_NKG2016LU.sh)

Aligns `NKG2016LU_lev_tm35fin.tif` with NLS elevation model map sheet division. The script loops through all elevation model map sheet main levels that are downloaded in [01_download-nls-elevation-model-2m](../../01_download-nls-elevation-model-2m/README.md) phase (T4, L2 etc.).

The `NKG2016LU_lev_tm35fin.tif` and NLS elevation model are in same [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) projection but they include vastly different geographical are: NKG2016LU contain the whole northern Europe but single NLS map sheet covers only small part of Finland. The NKG2016LU must be cropped to include only the data that covers geographically same are in map.

The `NKG2016LU_lev_tm35fin.tif` and NLS elevation model resolution is also very different: single pixel in NKG2016LU GeoTIFF file spans 9 km × 5-12 km area in map but single pixel NLS elevation model spans only 2 m × 2 m. A lot of pixels in NLS elevation model are included in one NKG2016LU GeoTIFF pixel.

The script uses [gdalwarp](https://gdal.org/en/stable/programs/gdalwarp.html) to crop `NKG2016LU_lev_tm35fin.tif`. Result files per NLS map sheet are in `aligned_NKG2016LU_rasters` folder.

## Step 2: [02_apply_height_change.sh](./02_apply_height_change.sh)

Calculates land uplift with following parameters:

- Current land elevation from [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m). Data is in GeoTIFF files data band 1 as meters from year 2023 sea level.
- Land uplift per year from NKG2016LU model (`NKG2016LU_lev_tm35fin.tif`). Data is in GeoTIFF file data band 1 as millimeters of uplift per year.
- Target year that's elevation level we want calculate. For example -4000 is 4000 BC, 6025 years back from current year.

Formula:

```
Land elevation in 2023 (m) + ((Land uplift per year (mm) * Target year) / 1000.0)
```

### Example

Calculate one 2 m × 2 m pixel land elevation in year 4000 BC. It is 6023 years from year 2023 (NLS elevation model creation year). Land uplift in this spot is 6.5 millimeters in year. Land elevation in 2023 is 1.5 meters above sea level.

```
1.5 + (6.5 * -6023 / 1000.0) =
1.5 + (-39149,5 / 1000.0) =
1.5 + -39,1495 =
-37,6495
```

**Result**: 2 m × 2 m pixel land elevation in 4000 BC below current 2023 sea level.

### Results

Script uses [gdal_calc](https://gdal.org/en/stable/programs/gdal_calc.html) to do the calculation per pixel. Result GeoTIFF files go to `./calculation_results` folder to a subfolder by the target year. Land elevation in target year is stored in GeoTIFF data band 1 as meters from 2023 sea level. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
