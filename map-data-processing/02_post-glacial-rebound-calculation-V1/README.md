# Model V1: simple linear uplift rate model based on NKG2016LU

This model (V1) provides simplified and naive uplift model where uplift is expected to have been same in every year in history thatn what it is today. This does NOT provide reliable result on long timespans but it is easy to implement and to understand. [NKG2016LU](https://www.lantmateriet.se/sv/geodata/gps-geodesi-och-swepos/Referenssystem/Landhojning/) land uplift model is used to alter elevatiob of the [National land survey of Finland (NLS) elevation model 2m x 2m](https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/product-descriptions/elevation-model-2-m), that is downloaded in previous step of the processing.

Read more abot the NKG2016LU model from presentation: [NKG2016LU, an improved postglacial land uplift model over the
Nordic-Baltic region, 2016](https://www.lantmateriet.se/contentassets/58490c18f7b042e5aa4c38075c9d3af5/presentation-av-nkg2016lu.pdf) (pdf).

**These scripts and land uplift calculations are an hobby project and can contain major errors and mismisinterpretations in the land uplift calculation logic or in the source map data processing!**

## Source data

[01_download-nls-elevation-model-2m/](./../01_download-nls-elevation-model-2m/).

## [Step 1: Download and preprocess NKG2016LU land uplift model](./01_download-land-uplift-model-NKG2016LU/README.md)

## [Step 2: Linear land uplift rate calculation](./02_post-glacial-rebound-calculation/README.md)

## Result data

GeoTIFF files in `./02_post-glacial-rebound-calculation/calculation_results` folder in subfolders by the target years. Land elevation in target year is stored in GeoTIFF data band 1 as meters from 2023 sea level. The result files projection is `EPSG:3067`](https://epsg.io/3067-1149) (ETRS-TM35FIN).

## Commands

Execute all the scripts by single command:

```bash
./run_all.sh
```
