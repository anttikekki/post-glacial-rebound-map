# Calculate glacial ice area with Glare model

Calculates area of last ice age glacial ice sheet in Northern Europe in different years. Produces [Cloud Optimized GeoTIFF (COG)](https://cogeo.org/) files as result.

Uses Glacial Land Adjustment Regenerator (Glare) model "Base raster.tif" source data. Data band 2 contains year when coordinate was free of ice. Year 0 is 1950 so 4000 BC is 5950.

## Step 1: [01_set-base-raster-nodata-value.sh](./01_set-base-raster-nodata-value.sh)

Glare "Base raster.tiff" has no "NoData" parameter. Value `99999` means "NoData". Script set's it as official NoData value for the "Base raster.tif" data band 2. This makes calculations easier with gdal, because `gdal_calc` skips coordinates with NoData value.

Original "Base raster.tif" is not edited. Script creates VRT file and sets NoData value there.

## Step 2: [02_calculate-ice-presence-mask.sh](./02_calculate-ice-presence-mask.sh)

Uses `gdal_calc` to create Glacial ice area mask in result file data band 1:

- Value `0`: everything not ice
- Value `1`: ice
- Value `255`: NoData

Calculations loops all years in file [/common/iceMapLayerYears.json](../../../common/iceMapLayerYears.json) and creates separate result GeoTIFF file for every year.

# Step 3: [03_generate_Cloud-Optimized-GeoTIFFs.sh](./03_generate_Cloud-Optimized-GeoTIFFs.sh)

Creates Cloud Optimized GeoTIFF (COG) for every calcuation result file.
