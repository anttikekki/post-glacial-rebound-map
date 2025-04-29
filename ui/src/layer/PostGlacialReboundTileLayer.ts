import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

export const createPostGlacialReboundLayer = (): WebGLTileLayer => {
  const source = new GeoTIFF({
    sources: [
      {
        url: "http://localhost:3000/V1/-3000/-3000_merged_cog.tif",
        bands: [1, 2, 3, 4],
      },
    ],
    convertToRGB: "auto",
    normalize: false,
  });

  return new WebGLTileLayer({
    source,
  });
};
