# Glacial Land Adjustment Regenerator (Glare) model

Glacial Land Adjustment Regenerator (Glare) is published by [Aki Hakonen](https://oulu.academia.edu/AkiHakonen) at University of Oulu:

- Paper: [Introducing the Glacial Land Adjustment Regenerator (Glare) for Simulating the Final Pleistocene/Holocene Geographical Change in North Europe](https://www.sciencedirect.com/science/article/pii/S0305440325001475), Journal of Archaeological Science, 2025.
- [GLARE materials](https://drive.google.com/drive/folders/184nPIZuX83gr3Yd6tVBGXCkpUysNY-CO) in Google Drive.
- [land-uplift-recons](https://github.com/Hakonaki/land-uplift-recons) repository on GitHub.

This script uses Glare version 2.2 that was published at 20.5.2025.

**These scripts or [maannousu.info](https://maannousu.info/) site is NOT endorsed or validated by Aki Hakonen in any way and can contain major errors on calculations and mismisinterpretations of the Glare model!**

## Source data

[01_download-nls-elevation-model-2m/](./../01_download-nls-elevation-model-2m/).

## Step 1: [Download Glare material from Google Drive](./01_download-GLARE-model-data/README.md)

## Step 2: [Calculate land uplift with Glare model](./02_post-glacial-rebound-calculation/README.md)

## Step 3: [Calculate glacial ice area with Glare model](./03_ice_mask_calculation/README.md)

## Commands

Execute all the scripts by single command:

```bash
# Calculate land upplift for all years defined in common/seaMapLayerYears.json
./run_all.sh

# Calculate land upplift for specific years (minus values are BC)
./run_all.sh -5000 -7000 1500
```
