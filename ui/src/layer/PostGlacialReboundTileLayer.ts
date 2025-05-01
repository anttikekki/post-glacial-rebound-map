import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

export const createPostGlacialReboundLayer = (): WebGLTileLayer => {
  const source = new GeoTIFF({
    sources: [
      {
        //url: "http://localhost:3000/V1/-3000/-3000_cog.tif",
        url: "https://maannousu.info/api/V1/-3000",
        bands: [1],
      },
    ],
    convertToRGB: false,
    normalize: false,
  });

  const colorLand = [0, 0, 0, 0];

  // National Land Survey of Finland background map sea color
  const colorSea = [201, 236, 250, 1];

  // National Land Survey of Finland background map color for coordinates land outside Finland
  const noData = [216, 231, 237, 1];

  return new WebGLTileLayer({
    source,
    style: {
      color: [
        "case",
        ["==", ["band", 1], 0],
        colorLand,
        ["==", ["band", 1], 1],
        colorSea,
        noData, // Fallback
      ],
    },
  });
};
