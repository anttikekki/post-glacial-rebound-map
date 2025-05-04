import WebGLTileLayer, { Style } from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

const colorLand = [0, 0, 0, 0];
const colorSea = [201, 236, 250, 1]; // National Land Survey of Finland background map sea color
const noData = [0, 0, 0, 0];
const style: Style = {
  color: [
    "case",
    ["==", ["band", 1], 0], // Value 0 = land
    colorLand,
    ["==", ["band", 1], 1], // Value 1 = sea
    colorSea,
    noData, // Fallback
  ],
};

export default class PostGlacialReboundLayer {
  private source: GeoTIFF;
  private readonly layer: WebGLTileLayer;

  public constructor(initialYear: number) {
    this.source = PostGlacialReboundLayer.createGeoTIFFSource(initialYear);

    this.layer = new WebGLTileLayer({
      source: this.source,
      style,
    });
  }

  public getLayer(): WebGLTileLayer {
    return this.layer;
  }

  public changeYear(year: number): void {
    this.source = PostGlacialReboundLayer.createGeoTIFFSource(year);
    this.layer.setSource(this.source);
  }

  private static createGeoTIFFSource(year: number): GeoTIFF {
    return new GeoTIFF({
      sources: [
        {
          url: `${process.env.MAANNOUSU_API}/api/v1/${year}`,
          bands: [1],
        },
      ],
      convertToRGB: false,
      normalize: false,
    });
  }
}
