# Generate sea level Cloud Optimized GeoTIFF

[Cloud Optimized GeoTIFF (COG)](https://cogeo.org/) is used as final distribution format of the calculation result. It contains internal tiling of different zoom levels of the map. This allows easier distribution because COG files can be hosted just on web server file system or in ASW S3 or similar. Files can be used by fetching certain byte ranges with standard HTTP Range-header without downloading the whole file. This allows web page map UI to fetch just few megabytes of data from big COG file to render the map at certain zoom level and coordinates.

## Source data

Source data is:

- Mask file from step [04_sea-level-mask-calculation](../04_sea-level-mask-calculation/README.md). This is the default. This generates COG's without visible data but mask data is contained in data band 1. Visualization must be done by the user based on data values:
  - Value `0`: land
  - Value `1`: sea
  - Value `255`: no source data (lanf area outside Finland)
- Mask file from step [05_generate-colorized-sea-raster](../05_generate-colorized-sea-raster/README.md). This generates COG's with visible raster data but without the data band. It is harder for the data user to change the visualization.

Source data and source model version is selected with comman line parameters.

## Generating Cloud Optimized GeoTIFF (COG)

Script uses [gdal_translate](https://gdal.org/en/stable/programs/gdal_translate.html) to generate the COG files. Files are compressed with deflate with maximum compression level.

## Result

Result Cloud Optimized GeoTIFF files go to `./result_cog` folder to a sub folder by model version and the target year. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

```bash
# Parameters:
# SOURCE: MASK or COLORIZED
# SOURCE_VERSION: V1 or V2

# Generate COG from data mask from model V1
./run_all.sh MASK V1

# Generate COG from colorized raster from model V2
./run_all.sh COLORIZED V2
```
