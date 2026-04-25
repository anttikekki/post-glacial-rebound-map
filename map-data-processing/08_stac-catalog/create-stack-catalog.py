from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

import pystac
import rasterio
from rio_stac.stac import create_stac_item

DATA_DIR = Path("../06_generate-map-distribution/result_cog")
OUTPUT_DIR = Path("stac")

BASE_URL = "https://maannousu.info/api/v2"

# STAC-valid placeholder time. Keep the real year in custom properties.
PLACEHOLDER_DATETIME = datetime(2026, 4, 19, tzinfo=timezone.utc)

YEAR_RE = re.compile(r"^(-?\d+)\.tif$", re.IGNORECASE)


def parse_year(filename: str) -> int:
    m = YEAR_RE.match(filename)
    if not m:
        raise ValueError(f"Bad filename: {filename} (expected YEAR.tif)")
    return int(m.group(1))


def label(year: int) -> str:
    if year < 0:
        return f"{abs(year)} BC"
    if year == 0:
        return "0"
    return f"{year} AD"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    collection = pystac.Collection(
        id="glare",
        description="Map of post-glacial land uplift in Finland. The data is calculated with Glacial Land Adjustment Regenerator (Glare) scientific model, that is created by archaeologist Aki Hakonen. Covers years from 10 000 BC to 1900 AD. The dataset is not a ready-to-use visual raster. Instead, the GeoTIFF format is used to encode information in 2 m x 2 m pixels that indicate whether each pixel represents land, sea, or ice at the given time.",
        extent=pystac.Extent(
            spatial=pystac.SpatialExtent([[180.0, -90.0, -180.0, 90.0]]),
            temporal=pystac.TemporalExtent([[None, None]]),
        ),
        license="CC-BY-4.0",
    )
    collection.add_link(
        pystac.Link(
            rel="about",
            target="https://maannousu.info/index_en.html",
            media_type="text/html",
            title="Documentation"
        )
    )
    collection.add_link(
        pystac.Link(
            rel="about",
            target="https://www.sciencedirect.com/science/article/pii/S0305440325001475",
            media_type="text/html",
            title="Article: Introducing the Glacial Land Adjustment Regenerator (Glare) for Simulating the Final Pleistocene/Holocene Geographical Change in North Europe, Aki Hakonen, Journal of Archaeological Science, 2025."
        )
    )
    collection.title = "Glacial Land Adjustment Regenerator (Glare)"

    for path in sorted(DATA_DIR.glob("*.tif")):
        year = parse_year(path.name)
        year_label = label(year)

        with rasterio.open(path) as src:
            item = create_stac_item(
                source=src,
                input_datetime=PLACEHOLDER_DATETIME,
                collection="post-glacial-land-uplift-in-Finland",
                with_proj=True,
                properties={
                    "year": year,
                    "label": year_label,
                    "description": f"Post-glacial land uplift in Finland for {year_label}",
                    "source_file": path.name,
                },
            )
            item.stac_extensions.append(
                "https://stac-extensions.github.io/raster/v1.1.0/schema.json"
            )
            item.id = f"year_{year}"

            for asset in item.assets.values():
                asset.href = f"{BASE_URL}/{year}"
                asset.roles = ["data", "cog"]
                asset.extra_fields["raster:bands"] = [
                    {
                        "data_type": "uint8",
                        "nodata": 255,
                        "classification": [
                            {"value": 0, "description": "Land"},
                            {"value": 1, "description": "Sea"},
                            {"value": 2, "description": "Glacier ice"},
                            {"value": 255, "description": "No data (outside Finland)"}
                        ]
                    }
                ]

            collection.add_item(item)

    # Fix collection extent from the items
    collection.update_extent_from_items()

    catalog = pystac.Catalog(
        id="post-glacial-land-uplift-in-Finland",
        description="The purpose of this data is to provide an easy-to-use visualization of the historical changes in the Baltic Sea’s sea level and the extent of the Ice Age glacier. Such comprehensive data for the entire Finnish coast across multiple millennia has not previously been easily available."
    )
    catalog.title = "Post-glacial land uplift in Finland"
    catalog.add_child(collection)

    catalog.normalize_hrefs(str(OUTPUT_DIR))
    catalog.save(catalog_type=pystac.CatalogType.SELF_CONTAINED)

    print(f"STAC catalog created at: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()