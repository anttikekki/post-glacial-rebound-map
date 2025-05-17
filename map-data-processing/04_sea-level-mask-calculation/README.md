# Sea level mask calculation

The script calculates GeoTIFF mask file that contains only info if pixel is land (value `0`) or sea (value `1`) in data band 1. Mask is used to reduce GeoTIFF file size. Originally source files contains lanf height in `Float32` value but mask reduces this to `Byte` (0-255). This also allows the deflate compression to be must more efficient.

The result GeoTIFF does not contain visible map data. It is used just to transfer data in coordinates.

## Source data

Result GeoTIFF files from land uplift calculation of model [V1](../02_post-glacial-rebound-calculation-V1/) or [V2](../02_post-glacial-rebound-calculation-V2/) steps. Source is selected with command line parameter.

## Mask calculation

Formula:

```
(Land elevation <= 0) * 1 + (Land elevation > 0) * 0
```

- Land elevation <= 0: sea, data band value 1
- Land elevation > 0: land, fata band value 0
- No source data: 255

Script uses [gdal_calc](https://gdal.org/en/stable/programs/gdal_calc.html) to do the calculation per pixel.

## Result

Result GeoTIFF files go to `./sea_land_masks` folder to a sub folder by the target year. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
# Calculate mask from V1 model result
./run_all.sh V1


# Calculate mask from V2 model result
./run_all.sh V2
```
