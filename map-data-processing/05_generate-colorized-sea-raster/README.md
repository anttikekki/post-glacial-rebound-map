# Sea level colorized mask calculation

**This is optional task, that is not executed in default settings!**

The script calculates colorized GeoTIFF mask file that renders visible land transparent and sea opaque blue based on source data band 1 `Byte` value.

## Source data

Result GeoTIFF files from mask file calculation of step [04_sea-level-mask-calculation](../04_sea-level-mask-calculation/README.md). Source model version is selected with command line parameter.

## Mask calculation

Color table:

- Value 0 (Land): no color and fully transparent
- Value 1 (Sea): blue (rgb 0 0 255) color and fully opaque

Script uses [gdaldem](https://gdal.org/en/stable/programs/gdaldem.html) to do the visualization per pixel.

## Result

Result GeoTIFF files go to `./sea_land_colored` folder to a sub folder by the target year. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
# Calculate colorized mask from V1 model mask result
./run_all.sh V1


# Calculate colorized mask from V2 model mask result
./run_all.sh V2
```
