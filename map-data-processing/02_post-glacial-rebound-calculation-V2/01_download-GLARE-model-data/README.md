# Download Glare material from Google Drive

## Licence

Glare materials licence is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en).

## Step 1: [01_download-GLARE-model.sh](./01_download-GLARE-model.sh)

Downloads following Glacial Land Adjustment Regenerator (Glare) material from [GLARE materials](https://drive.google.com/drive/folders/184nPIZuX83gr3Yd6tVBGXCkpUysNY-CO) Google Drive:

- [`Base Raster.tiff`](https://drive.google.com/uc?export=download&id=1mIOy3It63Q4rzEPrAdLltdXyhYORONq5)
- [`Toolbox/sea-level-baltic.tif`](https://drive.google.com/uc?export=download&id=1iecBOgDuota3UpJ5am97P4s4FD_jcVUD)

## Step 2: Reproject to EPSG:3067

Reprojects `Base_Raster.tiff` from [EPSG:4326](https://epsg.io/4326) (WGS84) to [`EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN) that is used in [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m).

`sea-level-baltic.tif` is not a map but lookout table for Baltic sea sea level for target year. It does not need to be reprojected.

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
